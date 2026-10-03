import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDataStore } from '@/store/dataStore'
import { Printer, MessageCircle, CreditCard, Save, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function JobCardDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { jobCards, fetchJobCards, isLoading } = useDataStore()
  
  useEffect(() => {
    if (jobCards.length === 0) fetchJobCards()
  }, [jobCards.length, fetchJobCards])

  const job = jobCards.find((j: any) => j.id === id)
  
  if (isLoading && !job) return <div className="p-12 text-center text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />Loading job card...</div>
  if (!job) return <div className="p-8 text-center text-muted-foreground">Job card not found</div>

  const [status, setStatus] = useState(job.status)
  
  const handleSave = () => {
    toast.success('Job Card Updated', { description: 'Changes saved successfully.' })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-xl border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{job.job_card_number}</h1>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold tracking-wider">
              {job.vehicle_number}
            </span>
          </div>
          <p className="text-muted-foreground mt-1">{job.make} {job.model} • {job.customerName}</p>
        </div>
        
        <div className="flex gap-2">
          <button className="p-2 border border-border rounded-lg hover:bg-secondary text-green-500" title="WhatsApp Customer">
            <MessageCircle className="h-5 w-5" />
          </button>
          <button className="p-2 border border-border rounded-lg hover:bg-secondary" title="Print Invoice">
            <Printer className="h-5 w-5" />
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90">
            <Save className="h-4 w-4" /> Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Control */}
          <div className="bg-card p-5 rounded-xl border space-y-4">
            <h3 className="font-semibold">Current Status</h3>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full p-2 bg-input border border-border rounded-lg text-foreground font-medium focus:ring-primary focus:border-primary"
            >
              <option value="OPEN">Open (Intake)</option>
              <option value="IN_PROGRESS">In Progress (Workshop)</option>
              <option value="QUALITY_CHECK">Quality Check</option>
              <option value="READY">Ready for Delivery</option>
              <option value="COMPLETED">Completed (Paid)</option>
            </select>
            
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">Odometer: <span className="text-foreground font-medium">{job.odometer_km || 0} km</span></p>
              <p className="text-sm text-muted-foreground mt-1">Fuel: <span className="text-foreground font-medium">{job.fuel_level_percent || 0}%</span></p>
            </div>
          </div>

          {/* Voice & Notes */}
          <div className="bg-card p-5 rounded-xl border space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Customer Complaints</h3>
              <p className="mt-1 text-sm">{job.customer_voice || 'None recorded'}</p>
            </div>
            <div className="pt-3 border-t border-border">
              <h3 className="font-semibold text-sm text-muted-foreground">Dent Notes</h3>
              <p className="mt-1 text-sm">{job.dent_notes || 'None recorded'}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Billing / Line Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-0 rounded-xl border overflow-hidden">
            <div className="p-5 border-b border-border flex justify-between items-center bg-secondary/30">
              <h3 className="font-semibold text-lg">Estimate & Billing</h3>
              <button className="flex items-center gap-1 text-sm text-primary hover:text-orange-400 font-medium">
                <Plus className="h-4 w-4" /> Add Item
              </button>
            </div>
            
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-sm text-muted-foreground">
                  <th className="p-4 font-medium">Item Name</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {job.job_items?.map((item: any) => (
                  <tr key={item.id} className="hover:bg-secondary/50 transition">
                    <td className="p-4">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-1 bg-secondary rounded-md">{item.category}</span>
                    </td>
                    <td className="p-4 text-right font-medium">₹{item.total}</td>
                  </tr>
                ))}
                
                {(!job.job_items || job.job_items.length === 0) && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-muted-foreground">
                      No items added yet. Click 'Add Item' to build the estimate.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            <div className="p-5 bg-secondary/10 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Spares Total</span>
                <span>₹{job.total_spares || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Labour Total</span>
                <span>₹{job.total_labour || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lubes & Fluids</span>
                <span>₹{job.total_lubes || 0}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-border">
                <span className="text-muted-foreground">Advance Paid</span>
                <span className="text-green-500">- ₹{job.advance_paid || 0}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border mt-2">
                <span>Balance Due</span>
                <span className="text-primary">₹{(job.total_amount || 0) - (job.advance_paid || 0)}</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border flex justify-end">
                <button className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 glow-green">
                  <CreditCard className="h-5 w-5" /> Collect Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
