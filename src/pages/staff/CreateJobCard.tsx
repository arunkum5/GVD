import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Camera, Upload, Car, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import PhotoUploader from '@/components/ui/PhotoUploader'
import { useDataStore } from '@/store/dataStore'

export default function CreateJobCard() {
  const navigate = useNavigate()
  const { addJobCard } = useDataStore()
  
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'FOUR_WHEELER',
    make: '',
    model: '',
    customerName: '',
    customerMobile: '',
    odometerKm: '',
    fuelLevelPercent: '',
    customerVoice: '',
    accessoriesNotes: '',
    dentNotes: ''
  })

  const [dentPhotos, setDentPhotos] = useState<Record<string, string>>({})
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(null)

  const handleNext = () => setStep(s => Math.min(s + 1, 3))
  const handlePrev = () => setStep(s => Math.max(s - 1, 1))

  const handleSave = async () => {
    if (!formData.vehicleNumber || !formData.customerName || !formData.customerMobile) {
      toast.error('Please fill in required fields (Vehicle No, Name, Mobile)')
      return
    }

    // Validation
    const mobileRegex = /^[0-9]{10}$/
    if (!mobileRegex.test(formData.customerMobile)) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    const vehicleNumberStr = formData.vehicleNumber.toUpperCase().replace(/\s+/g, '')
    const standardRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{1,4}$/
    const bhRegex = /^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/

    if (!standardRegex.test(vehicleNumberStr) && !bhRegex.test(vehicleNumberStr)) {
      toast.error('Invalid Vehicle Number format (e.g. KA03MN2345 or 21BH2345AA)')
      return
    }

    if (formData.customerName.length > 25) {
      toast.error('Customer name must be 25 characters or less')
      return
    }

    setIsSubmitting(true)
    try {
      const mockJcNum = `JC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`
      
      const customerVoiceFinal = voiceNoteUrl 
        ? `${formData.customerVoice}\n\n[Voice Note Audio]: ${voiceNoteUrl}`
        : formData.customerVoice

      await addJobCard({
        jobCardNumber: mockJcNum,
        customerName: formData.customerName,
        customerMobile: formData.customerMobile,
        vehicleNumber: vehicleNumberStr,
        vehicleType: formData.vehicleType as any,
        make: formData.make,
        model: formData.model,
        odometerKm: parseInt(formData.odometerKm) || 0,
        fuelLevelPercent: parseInt(formData.fuelLevelPercent) || 0,
        accessoriesNotes: formData.accessoriesNotes,
        customerVoice: customerVoiceFinal,
        dentNotes: formData.dentNotes,
        dentPhotos: Object.keys(dentPhotos).length > 0 ? dentPhotos as any : null,
        status: 'OPEN'
      })

      toast.success(`Job Card Created: ${mockJcNum}`, {
        description: 'Vehicle checked in.'
      })
      navigate('/staff') 
    } catch (error: any) {
      toast.error('Failed to save job card. Did you run the SQL script?')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateForm = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/staff')} className="text-muted-foreground hover:text-foreground">
          Back
        </button>
        <h1 className="text-2xl font-bold">New Job Card</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-medium shadow-sm transition-colors
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

      <div className="bg-card p-6 rounded-xl border shadow-sm relative overflow-hidden">
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" /> Customer & Vehicle Basics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Vehicle Number *" 
                placeholder="KA 01 MJ 5821" 
                uppercase 
                value={formData.vehicleNumber}
                onChange={(e) => updateForm('vehicleNumber', e.target.value)}
              />
              <Input 
                label="Customer Name *" 
                placeholder="Rahul Sharma" 
                value={formData.customerName}
                onChange={(e) => updateForm('customerName', e.target.value)}
              />
              <Input 
                label="Mobile Number *" 
                placeholder="9876543210" 
                type="tel" 
                value={formData.customerMobile}
                onChange={(e) => updateForm('customerMobile', e.target.value)}
              />
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Vehicle Type</label>
                <select 
                  className="w-full p-2 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                  value={formData.vehicleType}
                  onChange={(e) => updateForm('vehicleType', e.target.value)}
                >
                  <option value="TWO_WHEELER">2W (Bike/Scooter)</option>
                  <option value="FOUR_WHEELER">4W (Car/SUV)</option>
                </select>
              </div>
              <Input 
                label="Make" 
                placeholder="Hyundai" 
                value={formData.make}
                onChange={(e) => updateForm('make', e.target.value)}
              />
              <Input 
                label="Model" 
                placeholder="Creta" 
                value={formData.model}
                onChange={(e) => updateForm('model', e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold">Intake Checklist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Odometer (km)" 
                placeholder="42500" 
                type="number" 
                value={formData.odometerKm}
                onChange={(e) => updateForm('odometerKm', e.target.value)}
              />
              <Input 
                label="Fuel Level (%)" 
                placeholder="50" 
                type="number" 
                value={formData.fuelLevelPercent}
                onChange={(e) => updateForm('fuelLevelPercent', e.target.value)}
              />
            </div>
            
            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium text-muted-foreground">Customer Voice (Complaints)</label>
              
              <VoiceRecorder 
                onUploadComplete={(url) => setVoiceNoteUrl(url)} 
                onClear={() => setVoiceNoteUrl(null)} 
              />
              
              <textarea 
                rows={2} 
                className="w-full p-2 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition mt-2"
                placeholder="Or type text notes (e.g., Brake noise, oil leak...)"
                value={formData.customerVoice}
                onChange={(e) => updateForm('customerVoice', e.target.value)}
              />
            </div>
            
            <div className="space-y-1 mt-4">
              <label className="text-sm font-medium text-muted-foreground">Accessories Inside</label>
              <textarea 
                rows={2} 
                className="w-full p-2 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                placeholder="e.g., Floor mats, perfume, idol..."
                value={formData.accessoriesNotes}
                onChange={(e) => updateForm('accessoriesNotes', e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold">8-Point Vehicle Photos</h2>
            <p className="text-sm text-muted-foreground">Mandatory before intake to prevent customer disputes.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {['Front', 'Rear', 'Left Side', 'Right Side', 'Roof', 'Underbody', 'Dashcam', 'Other'].map(angle => (
                <PhotoUploader 
                  key={angle}
                  label={angle}
                  prefix={formData.vehicleNumber}
                  onUploadComplete={(url) => setDentPhotos(prev => ({ ...prev, [angle]: url }))}
                  onClear={() => {
                    const newPhotos = { ...dentPhotos }
                    delete newPhotos[angle]
                    setDentPhotos(newPhotos)
                  }}
                />
              ))}
            </div>
            
            <div className="space-y-1 mt-4">
              <label className="text-sm font-medium text-muted-foreground">Overall Dent/Scratch Notes</label>
              <textarea 
                rows={2} 
                className="w-full p-2 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                placeholder="Summarize any major pre-existing damages..."
                value={formData.dentNotes}
                onChange={(e) => updateForm('dentNotes', e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-4 border-t border-border">
          <button
            onClick={handlePrev}
            disabled={step === 1 || isSubmitting}
            className="px-6 py-2 border border-border rounded-xl text-muted-foreground hover:bg-secondary disabled:opacity-50 transition"
          >
            Back
          </button>
          
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold shadow-md hover:bg-primary/90 transition hover:scale-105 active:scale-95"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-green-700 transition shadow-[0_0_15px_rgba(22,163,74,0.4)] hover:shadow-[0_0_25px_rgba(22,163,74,0.6)] disabled:opacity-70 disabled:hover:scale-100 hover:scale-105 active:scale-95 min-w-[160px]"
            >
              {isSubmitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</>
              ) : (
                'Save & Create'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Input({ label, placeholder, type = 'text', uppercase = false, value, onChange }: { 
  label: string, 
  placeholder?: string, 
  type?: string, 
  uppercase?: boolean,
  value?: string,
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={type === 'tel' ? 10 : (label.includes('Name') ? 25 : undefined)}
        className={`w-full p-2 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition ${uppercase ? 'uppercase' : ''}`}
      />
    </div>
  )
}
