import { useState, useEffect } from 'react'
import { MOCK_JOB_CARDS, MOCK_REVIEWS, WORKSHOP } from '@/data/mockData'
import { JobCard } from '@/types'
import { CheckCircle2, Clock, Wrench, FileText, Star, MessageCircle, Phone } from 'lucide-react'

export default function CustomerPortal() {
  const [jobCard, setJobCard] = useState<JobCard | null>(null)
  
  useEffect(() => {
    // Simulate fetching customer's active job card
    setJobCard(MOCK_JOB_CARDS[0])
  }, [])

  if (!jobCard) return <div className="p-8 text-center">Loading...</div>

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

      {/* Reviews */}
      <div>
        <h2 className="text-xl font-bold mb-4">What others say</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {MOCK_REVIEWS.slice(0,2).map(review => (
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
        </div>
      </div>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-32 right-6 flex flex-col gap-3 z-50">
        <a 
          href={`https://wa.me/${WORKSHOP.phone.replace(/[^0-9]/g, '')}`} 
          target="_blank" 
          rel="noreferrer"
          className="h-12 w-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:-translate-y-1 transition-transform"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
        <a 
          href={`tel:${WORKSHOP.phone.replace(/[^0-9]/g, '')}`} 
          className="h-12 w-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:-translate-y-1 transition-transform"
        >
          <Phone className="h-6 w-6" />
        </a>
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
