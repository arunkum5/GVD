import { useState } from 'react'
import { MOCK_JOB_CARDS } from '@/data/mockData'
import { useNavigate } from 'react-router-dom'
import { Wrench, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react'

export default function TechnicianDashboard() {
  const navigate = useNavigate()
  
  // Only show active jobs for technician
  const activeJobs = MOCK_JOB_CARDS.filter(j => 
    j.status === 'OPEN' || j.status === 'IN_PROGRESS' || j.status === 'QUALITY_CHECK'
  )

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">My Workspace</h1>
        <p className="text-muted-foreground">Assigned jobs for today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeJobs.map(job => (
          <div key={job.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-primary">{job.vehicleNumber}</h3>
                <p className="text-sm text-muted-foreground">{job.make} {job.model}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium 
                ${job.status === 'IN_PROGRESS' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {job.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-start gap-2 bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p><strong>Customer Voice:</strong> {job.customerVoice}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => navigate(`/technician/inspect/${job.id}`)}
                className="flex-1 flex justify-center items-center gap-2 bg-secondary text-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-secondary/80 border border-border"
              >
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                360° Inspection
              </button>
              
              <button 
                onClick={() => navigate(`/staff/job-cards/${job.id}`)}
                className="flex-1 flex justify-center items-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90"
              >
                <Wrench className="h-4 w-4" />
                Work Order
              </button>
            </div>
          </div>
        ))}

        {activeJobs.length === 0 && (
          <div className="col-span-full bg-card border border-dashed rounded-xl p-12 text-center text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500/50" />
            <h3 className="text-lg font-medium text-foreground">All caught up!</h3>
            <p>No active jobs assigned to you right now.</p>
          </div>
        )}
      </div>
    </div>
  )
}
