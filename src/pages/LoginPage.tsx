import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types'
import { Wrench, User, Shield, Users, Lock, LogIn, Delete } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login } = useAuthStore()

// Singleton AudioContext to prevent hitting the 6-context browser limit when rapidly clicking
let globalAudioCtx: AudioContext | null = null
const getAudioContext = () => {
  if (!globalAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) globalAudioCtx = new AudioContextClass()
  }
  return globalAudioCtx
}

  const playEngineSound = (role: UserRole) => {
    try {
      const ctx = getAudioContext()
      if (!ctx) return
      
      if (ctx.state === 'suspended') ctx.resume()

      const osc = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()
      
      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      
      const now = ctx.currentTime
      
      if (role === 'CUSTOMER') {
        // Smooth Sports Car
        osc.type = 'sawtooth'
        filter.type = 'lowpass'
        filter.frequency.value = 800
        osc.frequency.setValueAtTime(50, now)
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.4)
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.8)
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(0.4, now + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0)
        osc.start(now); osc.stop(now + 1.0)
      } else if (role === 'STAFF') {
        // Deep V8 Rumble
        osc.type = 'square'
        filter.type = 'lowpass'
        filter.frequency.value = 400
        osc.frequency.setValueAtTime(40, now)
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.3)
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.7)
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(0.5, now + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9)
        osc.start(now); osc.stop(now + 0.9)
      } else if (role === 'TECHNICIAN') {
        // Aggressive Motorcycle (grittier square wave, audible pitch)
        osc.type = 'square'
        filter.type = 'lowpass'
        filter.frequency.value = 1500
        osc.frequency.setValueAtTime(50, now)
        osc.frequency.linearRampToValueAtTime(250, now + 0.2)
        osc.frequency.linearRampToValueAtTime(150, now + 0.4)
        osc.frequency.linearRampToValueAtTime(300, now + 0.7)
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(0.3, now + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0)
        osc.start(now); osc.stop(now + 1.0)
      } else {
        // ADMIN: Heavy Diesel Truck (Sawtooth at 30-80Hz is very audible on phones)
        osc.type = 'sawtooth'
        filter.type = 'lowpass'
        filter.frequency.value = 500
        osc.frequency.setValueAtTime(30, now)
        osc.frequency.linearRampToValueAtTime(80, now + 0.6)
        osc.frequency.linearRampToValueAtTime(40, now + 1.2)
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(0.6, now + 0.2)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.4)
        osc.start(now); osc.stop(now + 1.4)
      }
    } catch (e) {
      // Silent catch
    }
  }

  const playSuccessSound = () => {
    try {
      const ctx = getAudioContext()
      if (!ctx) return
      if (ctx.state === 'suspended') ctx.resume()
      
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      const now = ctx.currentTime
      osc.type = 'sine'
      // Bright unlock chime (C5 -> E5 -> G5)
      osc.frequency.setValueAtTime(523.25, now)
      osc.frequency.setValueAtTime(659.25, now + 0.15)
      osc.frequency.setValueAtTime(783.99, now + 0.3)
      
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.5, now + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6)
      
      osc.start(now)
      osc.stop(now + 0.6)
    } catch (e) {}
  }

  const playErrorSound = () => {
    try {
      const ctx = getAudioContext()
      if (!ctx) return
      if (ctx.state === 'suspended') ctx.resume()
      
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      const now = ctx.currentTime
      osc.type = 'sawtooth'
      // Harsh error buzz
      osc.frequency.setValueAtTime(150, now)
      osc.frequency.linearRampToValueAtTime(100, now + 0.3)
      
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.4, now + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
      
      osc.start(now)
      osc.stop(now + 0.3)
    } catch (e) {}
  }

  const submitLogin = async (pinToSubmit: string) => {
    if (!selectedRole) {
      toast.error('Please select a role')
      return
    }

    const result = await login(selectedRole, pinToSubmit)
    
    if (result.success) {
      playSuccessSound()
      toast.success('Login successful')
      setTimeout(() => navigate('/'), 600) // Slight delay to hear the sound!
    } else {
      playErrorSound()
      toast.error(result.error)
      setPassword('') // Clear on fail so they can try again instantly
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitLogin(password)
  }

  const handlePinClick = (num: string) => {
    if (password.length < 4) {
      const newPassword = password + num
      setPassword(newPassword)
      
      // Auto-submit when 4 digits are entered
      if (newPassword.length === 4) {
        submitLogin(newPassword)
      }
    }
  }

  const handleBackspace = () => {
    setPassword(prev => prev.slice(0, -1))
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-start pt-6 md:pt-12 items-center p-4 overflow-hidden">
      <div className="w-full max-w-md space-y-6 z-10">
        <div className="text-center">
          <div className="mx-auto h-28 w-auto flex items-center justify-center mb-2 animate-drive">
            <img src="/logo.webp" alt="GVD Auto World" className="h-full object-contain drop-shadow-xl" />
          </div>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6 bg-card p-8 rounded-xl border shadow-2xl glass">
          <div className="grid grid-cols-2 gap-4">
            <RoleCard
              role="CUSTOMER"
              icon={<User />}
              label="Customer"
              selected={selectedRole === 'CUSTOMER'}
              onClick={() => { setSelectedRole('CUSTOMER'); playEngineSound('CUSTOMER'); }}
            />
            <RoleCard
              role="STAFF"
              icon={<Users />}
              label="Advisor"
              selected={selectedRole === 'STAFF'}
              onClick={() => { setSelectedRole('STAFF'); playEngineSound('STAFF'); }}
            />
            <RoleCard
              role="TECHNICIAN"
              icon={<Wrench />}
              label="Technician"
              selected={selectedRole === 'TECHNICIAN'}
              onClick={() => { setSelectedRole('TECHNICIAN'); playEngineSound('TECHNICIAN'); }}
            />
            <RoleCard
              role="ADMIN"
              icon={<Shield />}
              label="Admin"
              selected={selectedRole === 'ADMIN'}
              onClick={() => { setSelectedRole('ADMIN'); playEngineSound('ADMIN'); }}
            />
          </div>

          <div className="mt-6 flex flex-col items-center space-y-6">
            {/* Visual PIN Dots */}
            <div className="flex gap-4">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-4 w-4 rounded-full border-2 transition-all duration-200 ${
                    i < password.length ? 'bg-primary border-primary shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'border-border/50 bg-background'
                  }`} 
                />
              ))}
            </div>

            {/* PIN Pad Grid */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePinClick(num.toString())}
                  className="h-14 rounded-xl bg-secondary/80 hover:bg-primary/20 hover:text-primary text-xl font-bold flex items-center justify-center transition-all shadow-sm active:scale-95"
                >
                  {num}
                </button>
              ))}
              <div /> {/* Empty bottom left */}
              <button
                type="button"
                onClick={() => handlePinClick('0')}
                className="h-14 rounded-xl bg-secondary/80 hover:bg-primary/20 hover:text-primary text-xl font-bold flex items-center justify-center transition-all shadow-sm active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-14 rounded-xl bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-all shadow-sm active:scale-95"
              >
                <Delete className="h-6 w-6" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={password.length < 4}
            className="w-full flex justify-center items-center py-4 px-4 mt-2 border border-transparent rounded-xl shadow-lg text-sm font-bold text-primary-foreground bg-primary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}

function RoleCard({ role, icon, label, selected, onClick }: { role: UserRole, icon: React.ReactNode, label: string, selected: boolean, onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
        selected
          ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(249,115,22,0.2)]'
          : 'border-border bg-background text-muted-foreground hover:bg-secondary'
      }`}
    >
      <div className={selected ? 'text-primary' : 'text-muted-foreground'}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </div>
  )
}
