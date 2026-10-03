import { useEffect } from 'react'
import { useDataStore } from '@/store/dataStore'
import { useNavigate } from 'react-router-dom'
import { Wrench, CheckCircle2, ChevronRight, AlertCircle, Loader2 } from 'lucide-react'

export default function TechnicianDashboard() {
  const navigate = useNavigate()
  const { jobCards, fetchJobCards, isLoading } = useDataStore()

  useEffect(() => {
    fetchJobCards()
  }, [fetchJobCards])
  
  // Only show active jobs for technician
  const activeJobs = jobCards.filter((j: any) => 
    j.status === 'OPEN' || j.status === 'IN_PROGRESS' || j.status === 'QUALITY_CHECK'
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">My Workspace</h1>
        <p className="text-muted-foreground">Assigned jobs for today</p>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="p-4 font-medium text-muted-foreground text-sm">Vehicle</th>
                <th className="p-4 font-medium text-muted-foreground text-sm">Status</th>
                <th className="p-4 font-medium text-muted-foreground text-sm">Customer Voice</th>
                <th className="p-4 font-medium text-muted-foreground text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                    Loading your workspace...
                  </td>
                </tr>
              ) : activeJobs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500/50" />
                    <h3 className="text-lg font-medium text-foreground">All caught up!</h3>
                    <p>No active jobs assigned to you right now.</p>
                  </td>
                </tr>
              ) : (
                activeJobs.map((job: any) => (
                  <tr key={job.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-primary text-lg">{job.vehicleNumber}</div>
                      <div className="text-sm text-muted-foreground">{job.make} {job.model}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                        ${job.status === 'IN_PROGRESS' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2 text-sm max-w-xs text-muted-foreground">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
                        <p className="truncate" title={job.customerVoice}>{job.customerVoice || 'No complaints'}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/technician/inspect/${job.id}`)}
                          className="flex items-center gap-1.5 bg-secondary text-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 border border-border"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Inspection
                        </button>
                        
                        <button 
                          onClick={() => navigate(`/staff/job-cards/${job.id}`)}
                          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
                        >
                          <Wrench className="h-4 w-4" />
                          Work Order
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
