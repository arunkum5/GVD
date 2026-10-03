import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { KeyRound, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ChangePinModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { changePin } = useAuthStore()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (oldPin.length !== 4 || newPin.length !== 4) {
      toast.error('PINs must be exactly 4 digits')
      return
    }

    setIsSubmitting(true)
    const result = await changePin(oldPin, newPin)
    setIsSubmitting(false)

    if (result.success) {
      toast.success('PIN successfully updated!')
      setOldPin('')
      setNewPin('')
      onClose()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-sm rounded-2xl border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2 font-bold">
            <KeyRound className="h-5 w-5 text-primary" />
            Change My PIN
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current PIN</label>
            <input 
              type="password"
              maxLength={4}
              value={oldPin}
              onChange={e => setOldPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full bg-secondary border border-border p-3 rounded-lg tracking-widest font-mono text-center text-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New PIN (4 Digits)</label>
            <input 
              type="password"
              maxLength={4}
              value={newPin}
              onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full bg-secondary border border-border p-3 rounded-lg tracking-widest font-mono text-center text-lg"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-2 bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update PIN'}
          </button>
        </form>
      </div>
    </div>
  )
}
