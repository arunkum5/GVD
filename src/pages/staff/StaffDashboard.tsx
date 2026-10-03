import { useEffect, useState } from 'react'
import { useDataStore } from '@/store/dataStore'
import { JobCard } from '@/types'
import { Plus, Search, Filter, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function StaffDashboard() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const { jobCards, fetchJobCards, isLoading } = useDataStore()

  useEffect(() => {
    fetchJobCards()
  }, [fetchJobCards])

  const filteredJobs = jobCards.filter((job: any) => 
    job.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.jobCardNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return 'status-open'
      case 'IN_PROGRESS': return 'status-inprogress'
      case 'READY': return 'status-ready'
      default: return 'status-closed'
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
        <StatCard title="Today's Revenue" value="₹10,900" />
        <StatCard title="Pending Payment" value="₹8,900" />
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
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
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
