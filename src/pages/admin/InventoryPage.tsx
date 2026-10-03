import { useState, useEffect } from 'react'
import { useDataStore } from '@/store/dataStore'
import { Search, Plus, AlertTriangle, Upload } from 'lucide-react'

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { inventory, fetchInventory } = useDataStore()

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const filteredItems = inventory.filter((item: any) => 
    item.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Manage parts & supplies</p>
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-2 border border-border bg-card px-4 py-2 rounded-lg font-medium hover:bg-secondary transition">
            <Upload className="h-4 w-4" /> Import Excel
          </button>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition">
            <Plus className="h-5 w-5" /> Add Part
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by part name or number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="p-4 font-medium text-muted-foreground text-sm">Part Info</th>
                <th className="p-4 font-medium text-muted-foreground text-sm">Category</th>
                <th className="p-4 font-medium text-muted-foreground text-sm">Price</th>
                <th className="p-4 font-medium text-muted-foreground text-sm text-right">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map(item => {
                const isLow = item.stockQuantity <= item.minThresholdAlert
                
                return (
                  <tr key={item.id} className="hover:bg-secondary/50 transition">
                    <td className="p-4">
                      <div className="font-medium text-foreground">{item.partName}</div>
                      <div className="text-xs text-muted-foreground">{item.partNumber}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-secondary rounded-md text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 font-medium">₹{item.unitPrice}</td>
                    <td className="p-4 text-right">
                      <div className={`inline-flex items-center gap-1 font-bold ${isLow ? 'text-destructive bg-destructive/10 px-2 py-1 rounded-md' : 'text-foreground'}`}>
                        {isLow && <AlertTriangle className="h-4 w-4" />}
                        {item.stockQuantity} {item.unit}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
