import { useState, useEffect } from 'react'
import { WORKSHOP } from '@/data/mockData'
import { useDataStore } from '@/store/dataStore'
import { CheckCircle2, Clock, Wrench, FileText, Star, MessageCircle, Phone, Loader2 } from 'lucide-react'

export default function CustomerPortal() {
  const { jobCards, fetchJobCards, reviews, fetchReviews, isLoading } = useDataStore()
  const jobCard = jobCards[0] // Pick the latest job card for the customer (for now)
  
  useEffect(() => {
    fetchJobCards()
    fetchReviews()
  }, [fetchJobCards, fetchReviews])

  if (isLoading || !jobCard) return <div className="p-12 text-center text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />Loading your vehicle status...</div>

  const getStatusStep = (status: string) => {
    const steps = ['OPEN', 'IN_PROGRESS', 'QUALITY_CHECK', 'READY', 'COMPLETED']
    return steps.indexOf(status)
  }

  const currentStep = getStatusStep(jobCard.status)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vehicle Status</h1>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
          {jobCard.vehicleNumber}
        </div>
      </div>

      {/* Status Tracker */}
      <div className="bg-card p-6 rounded-xl border">
        <h2 className="font-semibold mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Service Timeline
        </h2>
        
        <div className="relative">
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-border z-0"></div>
          
          <div className="space-y-6 relative z-10">
            <StatusStep 
              title="Checked In" 
              desc="Vehicle received at workshop" 
              active={currentStep >= 0} 
              completed={currentStep > 0} 
            />
            <StatusStep 
              title="Work in Progress" 
              desc="Mechanic is working on your vehicle" 
              active={currentStep >= 1} 
              completed={currentStep > 1} 
            />
            <StatusStep 
              title="Quality Check" 
              desc="Final inspection and road test" 
              active={currentStep >= 2} 
              completed={currentStep > 2} 
            />
            <StatusStep 
              title="Ready for Delivery" 
              desc="Vehicle is washed and ready" 
              active={currentStep >= 3} 
              completed={currentStep > 3} 
            />
          </div>
        </div>
      </div>

      {/* Estimate / Invoice */}
      <div className="bg-card p-6 rounded-xl border">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          Current Estimate
        </h2>
        
        <div className="space-y-3 mb-6">
          {jobCard.items.map(item => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </div>
              <span className="font-medium">₹{item.totalAmount}</span>
            </div>
          ))}
        </div>
        
        <div className="border-t border-border pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{jobCard.totalAmount}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total Amount</span>
            <span className="text-primary">₹{jobCard.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      {currentStep >= 3 && (
        <FeedbackSection jobCard={jobCard} reviews={reviews} />
      )}

      {/* Reviews */}
      <div>
        <h2 className="text-xl font-bold mb-4">What others say</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.slice(0, 4).map((review: any) => (
            <div key={review.id} className="bg-card p-4 rounded-xl border">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-orange-500">
                  {[...Array(review.rating)].map((_,i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <span className="font-medium text-sm">{review.customerName}</span>
              </div>
              <p className="text-sm text-muted-foreground">"{review.comment}"</p>
            </div>
          ))}
          {reviews.length === 0 && (
             <div className="col-span-2 text-center p-8 border border-dashed rounded-xl text-muted-foreground">
                No reviews yet. Be the first to leave one!
             </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusStep({ title, desc, active, completed }: { title: string, desc: string, active: boolean, completed: boolean }) {
  return (
    <div className="flex gap-4">
      <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center border-2 shrink-0 bg-card
        ${completed ? 'border-primary text-primary' : active ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}
      >
        {completed ? <CheckCircle2 className="h-5 w-5" /> : <Wrench className="h-4 w-4" />}
      </div>
      <div>
        <h3 className={`font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{title}</h3>
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
      <div className="bg-primary/10 p-6 rounded-xl border border-primary/20 text-center">
        <div className="flex justify-center text-primary mb-2">
          {[...Array(5)].map((_,i) => <Star key={i} className={`h-6 w-6 ${i < existingReview.rating ? 'fill-current' : 'opacity-30'}`} />)}
        </div>
        <h3 className="font-bold text-lg text-primary">Thank you for your feedback!</h3>
        <p className="text-sm text-foreground/80 mt-2">"{existingReview.comment}"</p>
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
    <div className="bg-card p-6 rounded-xl border space-y-4">
      <h2 className="font-semibold flex items-center gap-2">
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
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star className={`h-8 w-8 ${(hoverRating || rating) >= star ? 'fill-orange-500 text-orange-500' : 'text-muted-foreground'}`} />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Any comments or suggestions? (Optional)"
        className="w-full bg-secondary border border-border rounded-lg p-3 text-sm h-24 resize-none"
      />
      
      <button 
        onClick={handleSubmit}
        disabled={rating === 0 || isSubmitting}
        className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit Feedback
      </button>
    </div>
  )
}
