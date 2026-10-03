import { useState, useEffect, useRef } from 'react'
import { useDataStore } from '@/store/dataStore'
import { Search, Plus, AlertTriangle, Upload, X, Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { inventory, fetchInventory, bulkAddInventory } = useDataStore()

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const filteredItems = inventory.filter((item: any) => 
    item.partName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.partNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleExport = () => {
    try {
      const exportData = inventory.map((item: any) => ({
        'Part Name': item.partName,
        'Part Number': item.partNumber,
        'Category': item.category,
        'Unit Price': item.unitPrice,
        'Stock Quantity': item.stockQuantity,
        'Low Stock Alert At': item.minThresholdAlert
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory')
      
      XLSX.writeFile(workbook, 'GVD_Inventory_Export.xlsx')
      toast.success('Inventory exported successfully!')
    } catch (err) {
      toast.error('Failed to export inventory')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const reader = new FileReader()
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result
          const wb = XLSX.read(bstr, { type: 'binary' })
          const wsname = wb.SheetNames[0]
          const ws = wb.Sheets[wsname]
          const data: any[] = XLSX.utils.sheet_to_json(ws)

          const itemsToAdd = data.map(row => ({
            partName: row['Part Name'] || row['PartName'] || row['part_name'],
            partNumber: row['Part Number'] || row['PartNumber'] || row['part_number'],
            category: row['Category'] || row['category'],
            unitPrice: row['Unit Price'] || row['Price'] || row['unit_price'],
            stockQuantity: row['Stock Quantity'] || row['Stock'] || row['stock_quantity'],
            minThresholdAlert: row['Low Stock Alert At'] || row['Alert Threshold'] || 5
          })).filter(i => i.partName) // Only keep rows with at least a part name

          if (itemsToAdd.length === 0) {
             throw new Error('No valid parts found in the file. Ensure you have a "Part Name" column.')
          }

          await bulkAddInventory(itemsToAdd)
          toast.success(`Successfully imported ${itemsToAdd.length} parts!`)
        } catch (err: any) {
          toast.error(err.message || 'Failed to parse Excel file')
        } finally {
          setIsImporting(false)
          if (fileInputRef.current) fileInputRef.current.value = ''
        }
      }
      reader.readAsBinaryString(file)
    } catch (err) {
      toast.error('Error reading file')
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Manage parts & supplies</p>
        </div>
        
        <div className="flex gap-2">
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImport}
          />
          <button 
            disabled={isImporting}
            onClick={() => fileInputRef.current?.click()} 
            className="flex items-center gap-2 border border-border bg-card px-4 py-2 rounded-lg font-medium hover:bg-secondary transition disabled:opacity-50"
          >
            {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Import
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 border border-border bg-card px-4 py-2 rounded-lg font-medium hover:bg-secondary transition"
          >
            <Download className="h-4 w-4" /> Export
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition">
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

      {isModalOpen && <AddInventoryModal onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}

function AddInventoryModal({ onClose }: { onClose: () => void }) {
  const { addInventoryItem } = useDataStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    partName: '',
    partNumber: '',
    category: 'SPARE',
    unitPrice: '',
    stockQuantity: '',
    minThresholdAlert: '5'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.partName || !formData.unitPrice || !formData.stockQuantity) {
      return toast.error('Please fill required fields')
    }

    setIsSubmitting(true)
    try {
      await addInventoryItem({
        partName: formData.partName,
        partNumber: formData.partNumber || `SKU-${Date.now()}`,
        category: formData.category,
        unitPrice: parseFloat(formData.unitPrice),
        stockQuantity: parseInt(formData.stockQuantity),
        minThresholdAlert: parseInt(formData.minThresholdAlert)
      })
      toast.success('Part added to inventory')
      onClose()
    } catch (err: any) {
      toast.error('Failed to add part')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border overflow-hidden animate-slide-up">
        <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/30">
          <h2 className="font-bold text-lg">Add New Part</h2>
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Part Name *</label>
            <input 
              required
              autoFocus
              className="w-full p-2.5 bg-input border border-border rounded-lg"
              value={formData.partName}
              onChange={e => setFormData(f => ({ ...f, partName: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Part/SKU Number</label>
            <input 
              className="w-full p-2.5 bg-input border border-border rounded-lg"
              value={formData.partNumber}
              onChange={e => setFormData(f => ({ ...f, partNumber: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <select 
                className="w-full p-2.5 bg-input border border-border rounded-lg"
                value={formData.category}
                onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
              >
                <option value="SPARE">Spare Part</option>
                <option value="LABOUR">Labour / Service</option>
                <option value="LUBE">Lubes & Fluids</option>
                <option value="DETAILING">Detailing</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Unit Price (₹) *</label>
              <input 
                required
                type="number"
                min="0"
                step="0.01"
                className="w-full p-2.5 bg-input border border-border rounded-lg"
                value={formData.unitPrice}
                onChange={e => setFormData(f => ({ ...f, unitPrice: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Initial Stock *</label>
              <input 
                required
                type="number"
                min="0"
                className="w-full p-2.5 bg-input border border-border rounded-lg"
                value={formData.stockQuantity}
                onChange={e => setFormData(f => ({ ...f, stockQuantity: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Low Alert At</label>
              <input 
                required
                type="number"
                min="0"
                className="w-full p-2.5 bg-input border border-border rounded-lg"
                value={formData.minThresholdAlert}
                onChange={e => setFormData(f => ({ ...f, minThresholdAlert: e.target.value }))}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl mt-6 hover:bg-primary/90 flex justify-center items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Plus className="h-5 w-5" /> Save Part</>}
          </button>
        </form>
      </div>
    </div>
  )
}
