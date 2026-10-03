import { useEffect, useState } from 'react'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { JobCard } from '@/types'
import { Plus, Search, Filter, Loader2, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function StaffDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const { jobCards, fetchJobCards, deleteJobCard, isLoading } = useDataStore()

  useEffect(() => {
    fetchJobCards()
  }, [fetchJobCards])

  const filteredJobs = jobCards.filter((job: any) => 
    job.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.jobCardNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const todayRevenue = jobCards.reduce((sum: number, job: any) => sum + (job.advancePaid || 0), 0)
  const pendingPayment = jobCards.reduce((sum: number, job: any) => sum + (job.balanceAmount || 0), 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return 'status-open'
      case 'IN_PROGRESS': return 'status-inprogress'
      case 'READY': return 'status-ready'
      default: return 'status-closed'
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string | number, jcNumber: string) => {
    e.stopPropagation() // Prevent row click from navigating
    if (window.confirm(`Are you sure you want to permanently delete Job Card ${jcNumber}? This action cannot be undone.`)) {
      try {
        await deleteJobCard(id)
        toast.success(`Job Card ${jcNumber} deleted successfully`)
      } catch (err) {
        toast.error('Failed to delete job card')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          <p className="text-muted-foreground">Manage active job cards</p>
        </div>
        
        <button 
          onClick={() => navigate('/staff/job-cards/new')}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition"
        >
          <Plus className="h-5 w-5" />
          New Job Card
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Active Jobs" value={jobCards.length.toString()} />
        <StatCard title="Ready Delivery" value={jobCards.filter((j:any) => j.status === 'READY').length.toString()} />
        <StatCard title="Today's Revenue" value={`₹${todayRevenue}`} />
        <StatCard title="Pending Payment" value={`₹${pendingPayment}`} />
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by vehicle, customer, or JC number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:ring-primary focus:border-primary"
          />
        </div>
        <button className="p-2 border border-border rounded-lg bg-card hover:bg-secondary">
          <Filter className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Job Cards List */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="p-4 font-medium text-muted-foreground text-sm">Job Card #</th>
                <th className="p-4 font-medium text-muted-foreground text-sm">Vehicle</th>
                <th className="p-4 font-medium text-muted-foreground text-sm">Customer</th>
                <th className="p-4 font-medium text-muted-foreground text-sm">Status</th>
                <th className="p-4 font-medium text-muted-foreground text-sm">Amount</th>
                {user?.role === 'ADMIN' && <th className="p-4 font-medium text-muted-foreground text-sm text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                    Loading job cards...
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'ADMIN' ? 6 : 5} className="p-8 text-center text-muted-foreground">
                    No active job cards found.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job: any) => (
                  <tr 
                    key={job.id} 
                    onClick={() => navigate(`/staff/job-cards/${job.id}`)}
                    className="hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-medium">{job.jobCardNumber}</td>
                    <td className="p-4">
                      <div className="font-medium text-primary">{job.vehicleNumber}</div>
                      <div className="text-xs text-muted-foreground">{job.make} {job.model}</div>
                    </td>
                    <td className="p-4">
                      <div>{job.customerName}</div>
                      <div className="text-xs text-muted-foreground">{job.customerMobile}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(job.status)}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 font-medium">
                      ₹{job.totalAmount}
                    </td>
                    {user?.role === 'ADMIN' && (
                      <td className="p-4 text-right">
                        <button 
                          onClick={(e) => handleDelete(e, job.id, job.jobCardNumber)}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                          title="Delete Job Card"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
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

function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="bg-card p-4 rounded-xl border border-border">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
    </div>
  )
}
