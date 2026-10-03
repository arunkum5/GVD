import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import { UserRole } from '@/types'
import { Wrench, User, Shield, Users, LogIn, Delete, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [customerMobile, setCustomerMobile] = useState('')
  const [vehicleNo, setVehicleNo] = useState('')
  const navigate = useNavigate()
  const { login, customerLogin } = useAuthStore()
  const { profiles, fetchProfiles } = useDataStore()

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  // Audio logic preserved
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
        osc.type = 'sawtooth'; filter.type = 'lowpass'; filter.frequency.value = 800
        osc.frequency.setValueAtTime(50, now); osc.frequency.exponentialRampToValueAtTime(150, now + 0.4); osc.frequency.exponentialRampToValueAtTime(90, now + 0.8)
        gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.4, now + 0.1); gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0)
        osc.start(now); osc.stop(now + 1.0)
      } else if (role === 'STAFF') {
        osc.type = 'square'; filter.type = 'lowpass'; filter.frequency.value = 400
        osc.frequency.setValueAtTime(40, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.3); osc.frequency.exponentialRampToValueAtTime(60, now + 0.7)
        gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.5, now + 0.1); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9)
        osc.start(now); osc.stop(now + 0.9)
      } else if (role === 'TECHNICIAN') {
        osc.type = 'square'; filter.type = 'lowpass'; filter.frequency.value = 1500
        osc.frequency.setValueAtTime(50, now); osc.frequency.linearRampToValueAtTime(250, now + 0.2); osc.frequency.linearRampToValueAtTime(150, now + 0.4); osc.frequency.linearRampToValueAtTime(300, now + 0.7)
        gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.3, now + 0.1); gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0)
        osc.start(now); osc.stop(now + 1.0)
      } else {
        osc.type = 'sawtooth'; filter.type = 'lowpass'; filter.frequency.value = 500
        osc.frequency.setValueAtTime(30, now); osc.frequency.linearRampToValueAtTime(80, now + 0.6); osc.frequency.linearRampToValueAtTime(40, now + 1.2)
        gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.6, now + 0.2); gain.gain.exponentialRampToValueAtTime(0.01, now + 1.4)
        osc.start(now); osc.stop(now + 1.4)
      }
    } catch (e) {}
  }

  const playSuccessSound = () => {
    try {
      const ctx = getAudioContext()
      if (!ctx) return
      if (ctx.state === 'suspended') ctx.resume()
      
      const osc = ctx.createOscillator(); const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      
      const now = ctx.currentTime
      osc.type = 'sine'
      osc.frequency.setValueAtTime(523.25, now); osc.frequency.setValueAtTime(659.25, now + 0.15); osc.frequency.setValueAtTime(783.99, now + 0.3)
      gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.5, now + 0.05); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6)
      osc.start(now); osc.stop(now + 0.6)
    } catch (e) {}
  }

  const playErrorSound = () => {
    try {
      const ctx = getAudioContext()
      if (!ctx) return
      if (ctx.state === 'suspended') ctx.resume()
      
      const osc = ctx.createOscillator(); const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      
      const now = ctx.currentTime
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(100, now + 0.3)
      gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.4, now + 0.05); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
      osc.start(now); osc.stop(now + 0.3)
    } catch (e) {}
  }

  const submitLogin = async (pinToSubmit: string) => {
    if (!selectedRole || !selectedProfileId) {
      toast.error('Please select an account')
      return
    }

    const result = await login(selectedProfileId, pinToSubmit, selectedRole)
    
    if (result.success) {
      playSuccessSound()
      toast.success('Login successful')
      setTimeout(() => navigate('/'), 600)
    } else {
      playErrorSound()
      toast.error(result.error)
      setPassword('')
    }
  }

  const handlePinClick = (num: string) => {
    if (password.length < 4) {
      const newPassword = password + num
      setPassword(newPassword)
      
      if (newPassword.length === 4) {
        submitLogin(newPassword)
      }
    }
  }

  const handleBackspace = () => {
    setPassword(prev => prev.slice(0, -1))
  }

  const handleBack = () => {
    if (selectedProfileId) {
      setSelectedProfileId(null)
      setPassword('')
    } else if (selectedRole) {
      setSelectedRole(null)
      setCustomerMobile('')
      setVehicleNo('')
    }
  }

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerMobile || !vehicleNo) {
      toast.error('Please enter both mobile and vehicle number')
      return
    }

    const result = await customerLogin(customerMobile, vehicleNo)
    if (result.success) {
      playSuccessSound()
      toast.success('Login successful')
      setTimeout(() => navigate('/'), 600)
    } else {
      playErrorSound()
      toast.error(result.error)
    }
  }

  const filteredProfiles = profiles.filter((p: any) => p.role === selectedRole)

  return (
    <div className="min-h-screen bg-background flex flex-col justify-start pt-6 md:pt-12 items-center p-4 overflow-hidden">
      <div className="w-full max-w-md space-y-6 z-10">
        <div className="text-center">
          <div className="mx-auto h-28 w-auto flex items-center justify-center mb-2 animate-drive">
            <img src="/logo.webp" alt="GVD Auto World" className="h-full object-contain drop-shadow-xl" />
          </div>
        </div>

        <div className="mt-8 bg-card p-8 rounded-xl border shadow-2xl glass">
          
          {selectedRole && (
            <button onClick={handleBack} className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          )}

          {!selectedRole && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center mb-6">Select Your Role</h2>
              <div className="grid grid-cols-2 gap-4">
                <RoleCard
                  role="CUSTOMER"
                  icon={<User />}
                  label="Customer"
                  onClick={() => { setSelectedRole('CUSTOMER'); playEngineSound('CUSTOMER'); }}
                />
                <RoleCard
                  role="STAFF"
                  icon={<Users />}
                  label="Advisor"
                  onClick={() => { setSelectedRole('STAFF'); playEngineSound('STAFF'); }}
                />
                <RoleCard
                  role="TECHNICIAN"
                  icon={<Wrench />}
                  label="Technician"
                  onClick={() => { setSelectedRole('TECHNICIAN'); playEngineSound('TECHNICIAN'); }}
                />
                <RoleCard
                  role="ADMIN"
                  icon={<Shield />}
                  label="Admin"
                  onClick={() => { setSelectedRole('ADMIN'); playEngineSound('ADMIN'); }}
                />
              </div>
            </div>
          )}

          {selectedRole === 'CUSTOMER' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">Customer Portal</h2>
                <p className="text-muted-foreground mt-1 text-sm">Enter your details to track your vehicle</p>
              </div>
              <form onSubmit={handleCustomerSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-3 bg-secondary/50 border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Vehicle Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KA01MJ5821"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    className="w-full p-3 bg-secondary/50 border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl mt-4 hover:bg-primary/90 transition shadow-lg active:scale-95"
                >
                  Track Vehicle
                </button>
              </form>
            </div>
          )}

          {selectedRole && selectedRole !== 'CUSTOMER' && !selectedProfileId && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center mb-6">Who is logging in?</h2>
              <div className="flex flex-col gap-3">
                {filteredProfiles.length > 0 ? (
                  filteredProfiles.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProfileId(p.id)}
                      className="w-full text-left p-4 rounded-xl border border-border bg-secondary/50 hover:bg-primary/20 hover:border-primary transition-all font-medium text-lg"
                    >
                      {p.name}
                    </button>
                  ))
                ) : (
                  <div className="text-center p-6 text-muted-foreground bg-secondary/30 rounded-xl border border-border border-dashed">
                    No accounts found for this role.
                  </div>
                )}
                
                {selectedRole === 'ADMIN' && (
                  <button
                    onClick={() => setSelectedProfileId('default_admin')}
                    className="w-full text-left p-4 rounded-xl border border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all font-medium text-lg mt-4"
                  >
                    Default Master Admin
                  </button>
                )}
              </div>
            </div>
          )}

          {selectedProfileId && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold">Enter PIN</h2>
                <p className="text-muted-foreground mt-1">
                  {selectedProfileId === 'default_admin' 
                    ? 'Master Admin' 
                    : profiles.find((p: any) => p.id === selectedProfileId)?.name}
                </p>
              </div>

              <div className="flex flex-col items-center space-y-6">
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
                  <div />
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
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function RoleCard({ role, icon, label, onClick }: { role: UserRole, icon: React.ReactNode, label: string, onClick: () => void }) {
  const getColors = (r: UserRole) => {
    switch (r) {
      case 'CUSTOMER': return 'border-blue-500/20 bg-blue-500/5 text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/50'
      case 'STAFF': return 'border-purple-500/20 bg-purple-500/5 text-purple-500 hover:bg-purple-500/10 hover:border-purple-500/50'
      case 'TECHNICIAN': return 'border-orange-500/20 bg-orange-500/5 text-orange-500 hover:bg-orange-500/10 hover:border-orange-500/50'
      case 'ADMIN': return 'border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/50'
    }
  }

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-5 rounded-2xl border flex flex-col items-center justify-center space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 ${getColors(role)}`}
    >
      <div className="transform transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <span className="font-bold tracking-wide opacity-90">{label}</span>
    </div>
  )
}
