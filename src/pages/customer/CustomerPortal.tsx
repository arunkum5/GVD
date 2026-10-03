import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import { CheckCircle2, Clock, Wrench, FileText, Star, MessageCircle, ChevronDown, ChevronUp, Loader2, History } from 'lucide-react'

export default function CustomerPortal() {
  const { user } = useAuthStore()
  const { jobCards, fetchJobCards, reviews, fetchReviews, isLoading } = useDataStore()
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  
  useEffect(() => {
    if (user?.role === 'CUSTOMER') {
      const [mobile, vehicleNo] = user.username.split('-')
      fetchJobCards(vehicleNo, mobile)
    } else {
      fetchJobCards()
    }
    fetchReviews()
  }, [fetchJobCards, fetchReviews, user])

  if (isLoading && jobCards.length === 0) return <div className="p-12 text-center text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />Loading your vehicle data...</div>

  const ongoingJobs = jobCards.filter((j: any) => j.status !== 'COMPLETED')
  const historyJobs = jobCards.filter((j: any) => j.status === 'COMPLETED')

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name || 'Customer'}</h1>
          <p className="text-muted-foreground">Manage your vehicles and track service status</p>
        </div>
      </div>

      {ongoingJobs.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" /> 
            Ongoing Service
          </h2>
          {ongoingJobs.map((job: any) => (
            <JobCardDetailView key={job.id} jobCard={job} reviews={reviews} isExpanded={true} />
          ))}
        </div>
      )}

      {ongoingJobs.length === 0 && historyJobs.length === 0 && (
        <div className="bg-card p-12 text-center rounded-2xl border shadow-sm">
          <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No Service Records Found</h3>
          <p className="text-muted-foreground">We couldn't find any active or past service records for this vehicle.</p>
        </div>
      )}

      {historyJobs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 pt-6 border-t border-border">
            <History className="h-5 w-5 text-muted-foreground" /> 
            Service History
          </h2>
          <div className="space-y-4">
            {historyJobs.map((job: any) => (
              <div key={job.id} className="bg-card rounded-2xl border shadow-sm overflow-hidden transition-all">
                <button 
                  onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-secondary rounded-xl flex items-center justify-center text-primary font-bold">
                      {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg">{job.vehicleNumber}</div>
                      <div className="text-sm text-muted-foreground">{job.make} {job.model} • ₹{job.totalAmount}</div>
                    </div>
                  </div>
                  {expandedJobId === job.id ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </button>
                
                {expandedJobId === job.id && (
                  <div className="p-6 pt-0 border-t border-border bg-secondary/10 animate-fade-in">
                    <JobCardDetailView jobCard={job} reviews={reviews} isExpanded={true} hideStatus={true} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function JobCardDetailView({ jobCard, reviews, isExpanded, hideStatus = false }: { jobCard: any, reviews: any[], isExpanded: boolean, hideStatus?: boolean }) {
  const getStatusStep = (status: string) => {
    const steps = ['OPEN', 'IN_PROGRESS', 'QUALITY_CHECK', 'READY', 'COMPLETED']
    return steps.indexOf(status)
  }

  const currentStep = getStatusStep(jobCard.status)

  return (
    <div className="space-y-6">
      {!hideStatus && (
        <div className="bg-card p-6 rounded-2xl border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Live Status • <span className="text-primary tracking-wider font-mono">{jobCard.vehicleNumber}</span>
            </h2>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {jobCard.status.replace('_', ' ')}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-border z-0"></div>
            
            <div className="space-y-6 relative z-10">
              <StatusStep title="Checked In" desc="Vehicle received at workshop" active={currentStep >= 0} completed={currentStep > 0} />
              <StatusStep title="Work in Progress" desc="Mechanic is working on your vehicle" active={currentStep >= 1} completed={currentStep > 1} />
              <StatusStep title="Quality Check" desc="Final inspection and road test" active={currentStep >= 2} completed={currentStep > 2} />
              <StatusStep title="Ready for Delivery" desc="Vehicle is washed and ready" active={currentStep >= 3} completed={currentStep > 3} />
            </div>
          </div>
        </div>
      )}

      {/* Estimate / Invoice */}
      <div className={`bg-card p-6 rounded-2xl border shadow-sm ${hideStatus ? 'mt-4' : ''}`}>
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          {jobCard.status === 'COMPLETED' ? 'Final Invoice' : 'Current Estimate'}
        </h2>
        
        <div className="space-y-3 mb-6">
          {jobCard.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center text-sm p-3 bg-secondary/30 rounded-lg">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
              </div>
              <span className="font-bold">₹{item.totalAmount}</span>
            </div>
          ))}
          {(!jobCard.items || jobCard.items.length === 0) && (
            <p className="text-sm text-muted-foreground p-4 text-center border border-dashed rounded-lg">Items are currently being estimated.</p>
          )}
        </div>
        
        <div className="border-t border-border pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">₹{jobCard.totalAmount}</span>
          </div>
          {jobCard.advancePaid > 0 && (
            <div className="flex justify-between text-green-500">
              <span>Advance Paid</span>
              <span>- ₹{jobCard.advancePaid}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2">
            <span>{jobCard.status === 'COMPLETED' ? 'Total Paid' : 'Balance Due'}</span>
            <span className="text-primary">₹{jobCard.totalAmount - (jobCard.advancePaid || 0)}</span>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      {currentStep >= 3 && !hideStatus && (
        <FeedbackSection jobCard={jobCard} reviews={reviews} />
      )}
    </div>
  )
}

function StatusStep({ title, desc, active, completed }: { title: string, desc: string, active: boolean, completed: boolean }) {
  return (
    <div className="flex gap-4 group">
      <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center border-2 shrink-0 bg-card transition-all duration-500
        ${completed ? 'border-primary text-primary shadow-[0_0_10px_rgba(249,115,22,0.3)]' : active ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(249,115,22,0.5)] scale-110' : 'border-border text-muted-foreground'}`}
      >
        {completed ? <CheckCircle2 className="h-5 w-5" /> : <Wrench className="h-4 w-4" />}
      </div>
      <div>
        <h3 className={`font-bold transition-colors ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}

function FeedbackSection({ jobCard, reviews }: { jobCard: any, reviews: any[] }) {
  const { addReview } = useDataStore()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const existingReview = reviews.find(r => r.job_card_id === jobCard.id || (r as any).jobCardId === jobCard.id)

  if (existingReview) {
    return (
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-2xl border border-primary/20 text-center">
        <div className="flex justify-center text-primary mb-3">
          {[...Array(5)].map((_,i) => <Star key={i} className={`h-6 w-6 ${i < existingReview.rating ? 'fill-current' : 'opacity-30'}`} />)}
        </div>
        <h3 className="font-bold text-lg text-primary">Thank you for your feedback!</h3>
        <p className="text-sm text-foreground/80 mt-2 italic">"{existingReview.comment}"</p>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (rating === 0) return
    setIsSubmitting(true)
    try {
      await addReview({
        jobCardId: jobCard.id,
        customerName: jobCard.customerName || 'Customer',
        rating,
        comment
      })
    } catch (e) {
      console.error(e)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-4">
      <h2 className="font-bold text-lg flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        Rate your experience
      </h2>
      <p className="text-sm text-muted-foreground mb-4">Your vehicle is almost ready! How was our service?</p>
      
      <div className="flex gap-2 justify-center py-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 hover:scale-125 transition-all duration-200"
          >
            <Star className={`h-8 w-8 ${(hoverRating || rating) >= star ? 'fill-orange-500 text-orange-500 drop-shadow-md' : 'text-muted-foreground'}`} />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Any comments or suggestions? (Optional)"
        className="w-full bg-secondary/50 border border-border rounded-xl p-4 text-sm h-24 resize-none focus:ring-2 focus:ring-primary/50 transition-all"
      />
      
      <button 
        onClick={handleSubmit}
        disabled={rating === 0 || isSubmitting}
        className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl disabled:opacity-50 flex justify-center items-center gap-2 hover:bg-primary/90 transition-all shadow-lg active:scale-95"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit Feedback
      </button>
    </div>
  )
}
