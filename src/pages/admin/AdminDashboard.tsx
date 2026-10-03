import { useEffect } from 'react'
import { TrendingUp, Users, Wrench, IndianRupee, BellRing } from 'lucide-react'
import { useDataStore } from '@/store/dataStore'

export default function AdminDashboard() {
  const { jobCards, fetchJobCards } = useDataStore()

  useEffect(() => {
    fetchJobCards()
  }, [fetchJobCards])

  const todayRevenue = jobCards.reduce((sum: number, job: any) => sum + (job.advancePaid || 0), 0)
  const pendingAmount = jobCards.reduce((sum: number, job: any) => sum + (job.balanceAmount || 0), 0)
  
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Business Overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Today's Collection" 
          value={`₹${todayRevenue}`} 
          icon={<IndianRupee className="h-5 w-5 text-green-500" />} 
          trend="+12% from yesterday" 
        />
        <KpiCard 
          title="Pending Payments" 
          value={`₹${pendingAmount}`} 
          icon={<TrendingUp className="h-5 w-5 text-orange-500" />} 
          trend="Needs follow-up" 
        />
        <KpiCard 
          title="Active Jobs" 
          value={jobCards.length.toString()} 
          icon={<Wrench className="h-5 w-5 text-blue-500" />} 
          trend="4 ready for delivery" 
        />
        <KpiCard 
          title="Customer Satisfaction" 
          value="4.8/5" 
          icon={<Users className="h-5 w-5 text-purple-500" />} 
          trend="Based on 120 reviews" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Quick Actions / Triggers */}
        <div className="bg-card p-6 rounded-xl border space-y-4">
          <h2 className="text-lg font-bold">Quick Actions</h2>
          
          <button className="w-full flex items-center justify-between p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition border border-border group">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg text-green-500">
                <BellRing className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">Service Reminders</p>
                <p className="text-sm text-muted-foreground">Send WhatsApp reminders for upcoming services</p>
              </div>
            </div>
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
              12 Due
            </span>
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition border border-border group">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/20 p-2 rounded-lg text-orange-500">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">Payment Follow-ups</p>
                <p className="text-sm text-muted-foreground">Send payment links for completed jobs</p>
              </div>
            </div>
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
              5 Pending
            </span>
          </button>
        </div>
        
        {/* Recent Reviews (Placeholder) */}
        <div className="bg-card p-6 rounded-xl border">
          <h2 className="text-lg font-bold mb-4">Recent Feedback</h2>
          <div className="space-y-4">
            <div className="border-l-2 border-green-500 pl-4 py-1">
              <p className="text-sm">"Excellent service by technician Raju."</p>
              <p className="text-xs text-muted-foreground mt-1">- Vikram Nair • KA03GH4422</p>
            </div>
            <div className="border-l-2 border-green-500 pl-4 py-1">
              <p className="text-sm">"360 report is very transparent, loved it."</p>
              <p className="text-xs text-muted-foreground mt-1">- Priya Sharma • KA01MJ5821</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-card p-5 rounded-xl border border-border hover:border-primary/50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon}
      </div>
      <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-xs text-muted-foreground">{trend}</p>
    </div>
  )
}
