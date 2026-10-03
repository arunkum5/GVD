import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { INSPECTION_COMPONENTS } from '@/data/mockData'
import { Camera, Check, X, CheckCircle2, ChevronLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useDataStore } from '@/store/dataStore'
import { uploadMedia } from '@/lib/storage'

export default function InspectionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { jobCards, saveInspection } = useDataStore()
  
  const job = jobCards.find((j: any) => j.id.toString() === id)
  const [activeCategory, setActiveCategory] = useState('ENGINE')
  const [inspections, setInspections] = useState<Record<string, { status: string, notes: string, photoUrl?: string | null }>>(() => {
    const initial: Record<string, { status: string, notes: string, photoUrl?: string | null }> = {}
    if (job?.inspections) {
      job.inspections.forEach((i: any) => {
        initial[i.component] = { status: i.status, notes: i.notes, photoUrl: i.photo_url }
      })
    }
    return initial
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Group components by category
  const categories = [...new Set(INSPECTION_COMPONENTS.map(c => c.category))]
  const currentComponents = INSPECTION_COMPONENTS.filter(c => c.category === activeCategory)

  const handleUpdate = (componentKey: string, status: string, notes: string, photoUrl?: string | null) => {
    setInspections(prev => {
      const current = prev[componentKey] || {}
      return {
        ...prev,
        [componentKey]: { 
          status, 
          notes, 
          photoUrl: photoUrl !== undefined ? photoUrl : current.photoUrl 
        }
      }
    })
  }

  const handleSave = async () => {
    if (Object.keys(inspections).length === 0) {
      return toast.error('Please inspect at least one component.')
    }

    setIsSubmitting(true)
    try {
      if (!job) return;
      const payload = Object.entries(inspections).map(([key, val]) => ({
        component: key,
        status: val.status,
        notes: val.notes,
        photoUrl: val.photoUrl || null
      }))

      await saveInspection(job.id.toString(), payload)

      toast.success('Inspection Report Saved', {
        description: 'Report attached to Job Card. Customer can now view it.'
      })
      navigate('/technician')
    } catch (e: any) {
      toast.error('Failed to save report')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!job) return <div className="p-8 text-center">Job card not found</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 border-b">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 border rounded-lg bg-card hover:bg-secondary">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">360° Inspection</h1>
            <p className="text-sm text-primary font-medium">{job.vehicleNumber}</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={isSubmitting} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} 
          <span className="hidden sm:inline">Save Report</span>
        </button>
      </div>

      {/* Categories Tabs */}
      <div className="flex overflow-x-auto gap-2 scrollbar-hide py-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${activeCategory === cat ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-card border border-border text-muted-foreground hover:bg-secondary'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Components List */}
      <div className="space-y-4">
        {currentComponents.map(comp => (
          <InspectionItem 
            key={comp.componentKey} 
            component={comp} 
            value={inspections[comp.componentKey]}
            onChange={(status, notes, photoUrl) => handleUpdate(comp.componentKey, status, notes, photoUrl)}
            vehicleNumber={job.vehicleNumber}
          />
        ))}
      </div>
    </div>
  )
}

function InspectionItem({ component, value, onChange, vehicleNumber }: { component: any, value: { status: string, notes: string, photoUrl?: string | null } | undefined, onChange: (status: string, notes: string, photoUrl?: string | null) => void, vehicleNumber: string }) {
  const status = value?.status || null
  const notes = value?.notes || ''
  const photoUrl = value?.photoUrl || null
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const { url, error } = await uploadMedia(file, 'inspections', vehicleNumber)
    setIsUploading(false)
    if (url) {
      onChange(status || 'GOOD', notes, url)
      toast.success('Photo attached')
    } else {
      toast.error('Failed to upload photo: ' + error)
    }
  }

  return (
    <div className="bg-card border border-border p-4 rounded-xl space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-lg">{component.componentName}</h3>
          <p className="text-xs text-muted-foreground">Angle: {component.angle.replace('_', ' ')}</p>
        </div>
        
        <div>
          <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
          {photoUrl ? (
            <div className="relative h-12 w-12 rounded-lg overflow-hidden group border border-primary">
              <img src={photoUrl} alt="Inspection" className="w-full h-full object-cover" />
              <button 
                onClick={() => onChange(status || 'GOOD', notes, null)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-10 w-10 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors bg-secondary/50 disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Status Toggles */}
      <div className="grid grid-cols-3 gap-2">
        <button 
          onClick={() => onChange('GOOD', notes)}
          className={`py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-colors
            ${status === 'GOOD' ? 'bg-green-500/20 border-green-500/50 text-green-500' : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'}`}
        >
          <CheckCircle2 className="h-4 w-4" /> GOOD
        </button>
        
        <button 
          onClick={() => onChange('SERVICED', notes)}
          className={`py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-colors
            ${status === 'SERVICED' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'}`}
        >
          <Check className="h-4 w-4" /> SERVICED
        </button>
        
        <button 
          onClick={() => onChange('REPLACE', notes)}
          className={`py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-colors
            ${status === 'REPLACE' ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'}`}
        >
          <X className="h-4 w-4" /> REPLACE
        </button>
      </div>
      
      {status === 'REPLACE' && (
        <textarea 
          className="w-full bg-input border border-destructive/50 rounded-lg p-2 text-sm focus:ring-destructive focus:border-destructive animate-fade-in"
          placeholder="Reason for replacement & cost estimate..."
          rows={2}
          value={notes}
          onChange={(e) => onChange('REPLACE', e.target.value)}
        />
      )}
    </div>
  )
}
