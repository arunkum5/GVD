import { useEffect, useState } from 'react'
import { useDataStore } from '@/store/dataStore'
import { Plus, Trash2, Edit, Shield, Wrench, Users, KeyRound, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { UserRole } from '@/types'

export default function EmployeeManagement() {
  const { profiles, fetchProfiles, addProfile, updateProfile, deleteProfile, isLoading } = useDataStore()
  const [isAdding, setIsAdding] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    role: 'TECHNICIAN' as UserRole,
    phone: '',
    pin: ''
  })
  
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.pin || formData.pin.length !== 4) {
      toast.error('Name and 4-digit PIN are required')
      return
    }

    try {
      if (editingId) {
        await updateProfile(editingId, formData)
        toast.success('Employee updated successfully')
      } else {
        await addProfile(formData)
        toast.success('Employee added successfully')
      }
      setIsAdding(false)
      setEditingId(null)
      setFormData({ name: '', role: 'TECHNICIAN', phone: '', pin: '' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to save employee')
    }
  }

  const handleEdit = (profile: any) => {
    setFormData({
      name: profile.name,
      role: profile.role,
      phone: profile.phone || '',
      pin: profile.pin || ''
    })
    setEditingId(profile.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      try {
        await deleteProfile(id)
        toast.success('Employee removed')
      } catch (err) {
        toast.error('Failed to remove employee')
      }
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield className="h-4 w-4 text-rose-500" />
      case 'STAFF': return <Users className="h-4 w-4 text-purple-500" />
      case 'TECHNICIAN': return <Wrench className="h-4 w-4 text-orange-500" />
      default: return <Users className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground">Manage roles and PIN access for floor staff</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null)
            setFormData({ name: '', role: 'TECHNICIAN', phone: '', pin: '' })
            setIsAdding(!isAdding)
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition"
        >
          {isAdding ? 'Cancel' : <><Plus className="h-5 w-5" /> Add Employee</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-card p-6 rounded-xl border space-y-4">
          <h2 className="text-lg font-bold">{editingId ? 'Edit Employee' : 'New Employee'}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-secondary border border-border p-2 rounded-lg"
                placeholder="Raju"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select 
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full bg-secondary border border-border p-2 rounded-lg"
              >
                <option value="TECHNICIAN">Technician</option>
                <option value="STAFF">Advisor</option>
                <option value="ADMIN">Admin</option>
                <option value="CUSTOMER">Customer (Not Recommended here)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone (Optional)</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-secondary border border-border p-2 rounded-lg"
                placeholder="+91..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">4-Digit PIN</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="password" 
                  maxLength={4}
                  value={formData.pin}
                  onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                  className="w-full pl-9 bg-secondary border border-border p-2 rounded-lg tracking-widest font-mono"
                  placeholder="1234"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      )}

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="p-4 font-medium text-muted-foreground text-sm">Employee Name</th>
                <th className="p-4 font-medium text-muted-foreground text-sm">Role</th>
                <th className="p-4 font-medium text-muted-foreground text-sm">Phone</th>
                <th className="p-4 font-medium text-muted-foreground text-sm">PIN Status</th>
                <th className="p-4 font-medium text-muted-foreground text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && profiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                    Loading employees...
                  </td>
                </tr>
              ) : profiles.filter((p: any) => p.role !== 'CUSTOMER').length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    No staff found. Add one above.
                  </td>
                </tr>
              ) : (
                profiles.filter((p: any) => p.role !== 'CUSTOMER').map((profile: any) => (
                  <tr key={profile.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4 font-medium">{profile.name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        {getRoleIcon(profile.role)}
                        {profile.role.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">{profile.phone || '-'}</td>
                    <td className="p-4 text-sm">
                      {profile.pin ? (
                        <span className="text-green-500 font-medium">Set</span>
                      ) : (
                        <span className="text-orange-500 font-medium">Not Set</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(profile)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(profile.id, profile.name)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
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
