import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Camera, Upload, Car, Check } from 'lucide-react'
import { toast } from 'sonner'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import PhotoUploader from '@/components/ui/PhotoUploader'

export default function CreateJobCard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  const handleNext = () => setStep(s => Math.min(s + 1, 3))
  const handlePrev = () => setStep(s => Math.max(s - 1, 1))

  const handleSave = () => {
    toast.success('Job Card Created Successfully', {
      description: 'Vehicle checked in. SMS sent to customer.'
    })
    navigate('/staff/job-cards/1') // Navigate to mock job card
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/staff')} className="text-muted-foreground hover:text-foreground">
          Back
        </button>
        <h1 className="text-2xl font-bold">New Job Card</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-medium
              ${step >= i ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              {step > i ? <Check className="h-4 w-4" /> : i}
            </div>
            <span className={`ml-2 text-sm font-medium hidden sm:block
              ${step >= i ? 'text-foreground' : 'text-muted-foreground'}`}>
              {i === 1 ? 'Customer' : i === 2 ? 'Vehicle Info' : 'Dent Photos'}
            </span>
            {i < 3 && <div className="h-0.5 w-12 sm:w-24 bg-border mx-4"></div>}
          </div>
        ))}
      </div>

      <div className="bg-card p-6 rounded-xl border">
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Car className="h-5 w-5" /> Customer & Vehicle Basics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Vehicle Number" placeholder="KA 01 MJ 5821" uppercase />
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Vehicle Type</label>
                <select className="w-full p-2 bg-input border border-border rounded-lg text-foreground focus:ring-primary focus:border-primary">
                  <option value="TWO_WHEELER">2W (Bike/Scooter)</option>
                  <option value="FOUR_WHEELER">4W (Car/SUV)</option>
                </select>
              </div>
              <Input label="Make" placeholder="Hyundai" />
              <Input label="Model" placeholder="Creta" />
              <Input label="Customer Name" placeholder="Rahul Sharma" />
              <Input label="Mobile Number" placeholder="9876543210" type="tel" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold">Intake Checklist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Odometer (km)" placeholder="42500" type="number" />
              <Input label="Fuel Level (%)" placeholder="50" type="number" />
            </div>
            
            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium text-muted-foreground">Customer Voice (Complaints)</label>
              
              <VoiceRecorder 
                onUploadComplete={(url) => console.log('Voice uploaded:', url)} 
                onClear={() => console.log('Voice cleared')} 
              />
              
              <textarea 
                rows={2} 
                className="w-full p-2 bg-input border border-border rounded-lg text-foreground focus:ring-primary focus:border-primary mt-2"
                placeholder="Or type text notes (e.g., Brake noise, oil leak...)"
              />
            </div>
            
            <div className="space-y-1 mt-4">
              <label className="text-sm font-medium text-muted-foreground">Accessories Inside</label>
              <textarea 
                rows={2} 
                className="w-full p-2 bg-input border border-border rounded-lg text-foreground focus:ring-primary focus:border-primary"
                placeholder="e.g., Floor mats, perfume, idol..."
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold">6-Point Dent & Scratch Photos</h2>
            <p className="text-sm text-muted-foreground">Mandatory before intake to prevent customer disputes.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {['Front', 'Rear', 'Left Side', 'Right Side', 'Roof', 'Underbody'].map(angle => (
                <PhotoUploader 
                  key={angle}
                  label={angle}
                  onUploadComplete={(url) => console.log(`Uploaded ${angle}:`, url)}
                  onClear={() => console.log(`Cleared ${angle}`)}
                />
              ))}
            </div>
            
            <div className="space-y-1 mt-4">
              <label className="text-sm font-medium text-muted-foreground">Overall Dent/Scratch Notes</label>
              <textarea 
                rows={2} 
                className="w-full p-2 bg-input border border-border rounded-lg text-foreground focus:ring-primary focus:border-primary"
                placeholder="Summarize any major pre-existing damages..."
              />
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-4 border-t border-border">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className="px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-secondary disabled:opacity-50"
          >
            Back
          </button>
          
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 glow-green"
            >
              Save & Create
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Input({ label, placeholder, type = 'text', uppercase = false }: { label: string, placeholder?: string, type?: string, uppercase?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full p-2 bg-input border border-border rounded-lg text-foreground focus:ring-primary focus:border-primary ${uppercase ? 'uppercase' : ''}`}
      />
    </div>
  )
}
