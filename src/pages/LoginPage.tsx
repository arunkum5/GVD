import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types'
import { Wrench, User, Shield, Users, Lock, LogIn } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) {
      toast.error('Please select a role')
      return
    }

    const usernameMap: Record<UserRole, string> = {
      CUSTOMER: 'customer',
      STAFF: 'advisor',
      TECHNICIAN: 'tech',
      ADMIN: 'admin'
    }

    const result = login(usernameMap[selectedRole], password)
    
    if (result.success) {
      toast.success('Login successful')
      navigate('/')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 flex items-center justify-center mb-4 animate-fade-in">
            <img src="/logo.webp" alt="GVD Auto World" className="w-full h-full object-contain drop-shadow-xl" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mt-4">GVD Auto World</h2>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6 bg-card p-8 rounded-xl border shadow-2xl glass">
          <div className="grid grid-cols-2 gap-4">
            <RoleCard
              role="CUSTOMER"
              icon={<User />}
              label="Customer"
              selected={selectedRole === 'CUSTOMER'}
              onClick={() => setSelectedRole('CUSTOMER')}
            />
            <RoleCard
              role="STAFF"
              icon={<Users />}
              label="Advisor"
              selected={selectedRole === 'STAFF'}
              onClick={() => setSelectedRole('STAFF')}
            />
            <RoleCard
              role="TECHNICIAN"
              icon={<Wrench />}
              label="Technician"
              selected={selectedRole === 'TECHNICIAN'}
              onClick={() => setSelectedRole('TECHNICIAN')}
            />
            <RoleCard
              role="ADMIN"
              icon={<Shield />}
              label="Admin"
              selected={selectedRole === 'ADMIN'}
              onClick={() => setSelectedRole('ADMIN')}
            />
          </div>

          <div className="relative mt-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-input text-foreground focus:ring-primary focus:border-primary placeholder-muted-foreground"
              placeholder="Enter PIN (1234)"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Sign In
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
