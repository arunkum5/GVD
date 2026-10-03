import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MOCK_JOB_CARDS, INSPECTION_COMPONENTS } from '@/data/mockData'
import { Camera, Check, X, CheckCircle2, ChevronLeft, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function InspectionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const job = MOCK_JOB_CARDS.find(j => j.id.toString() === id)
  const [activeCategory, setActiveCategory] = useState('ENGINE')
  
  // Group components by category
  const categories = [...new Set(INSPECTION_COMPONENTS.map(c => c.category))]
  const currentComponents = INSPECTION_COMPONENTS.filter(c => c.category === activeCategory)

  const handleSave = () => {
    toast.success('Inspection Report Saved', {
      description: 'Report attached to Job Card. Customer can now view it.'
    })
    navigate('/technician')
  }

  if (!job) return <div className="p-8">Job card not found</div>

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
        <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
          <Save className="h-4 w-4" /> <span className="hidden sm:inline">Save Report</span>
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
          <InspectionItem key={comp.componentKey} component={comp} />
        ))}
      </div>
    </div>
  )
}

function InspectionItem({ component }: { component: any }) {
  const [status, setStatus] = useState<string | null>(null)

  return (
    <div className="bg-card border border-border p-4 rounded-xl space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-lg">{component.componentName}</h3>
          <p className="text-xs text-muted-foreground">Angle: {component.angle.replace('_', ' ')}</p>
        </div>
        
        <button className="h-10 w-10 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors bg-secondary/50">
          <Camera className="h-5 w-5" />
        </button>
      </div>

      {/* Status Toggles */}
      <div className="grid grid-cols-3 gap-2">
        <button 
          onClick={() => setStatus('GOOD')}
          className={`py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-colors
            ${status === 'GOOD' ? 'bg-green-500/20 border-green-500/50 text-green-500' : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'}`}
        >
          <CheckCircle2 className="h-4 w-4" /> GOOD
        </button>
        
        <button 
          onClick={() => setStatus('SERVICED')}
          className={`py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-colors
            ${status === 'SERVICED' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'}`}
        >
          <Check className="h-4 w-4" /> SERVICED
        </button>
        
        <button 
          onClick={() => setStatus('REPLACE')}
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
        />
      )}
    </div>
  )
}
