import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, UserRole } from '@/types'

// Dummy credentials for each role
const CREDENTIALS: Record<string, { password: string; user: AuthUser }> = {
  customer: {
    password: '1234',
    user: { role: 'CUSTOMER', name: 'Customer', username: 'customer' }
  },
  advisor: {
    password: '1234',
    user: { role: 'STAFF', name: 'Service Advisor', username: 'advisor' }
  },
  tech: {
    password: '1234',
    user: { role: 'TECHNICIAN', name: 'Technician Raju', username: 'tech' }
  },
  admin: {
    password: '1234',
    user: { role: 'ADMIN', name: 'Admin', username: 'admin' }
  }
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  selectedRole: UserRole | null
  login: (username: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  setSelectedRole: (role: UserRole) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      selectedRole: null,

      setSelectedRole: (role) => set({ selectedRole: role }),

      login: (username, password) => {
        const cred = CREDENTIALS[username.toLowerCase().trim()]
        if (!cred) {
          return { success: false, error: 'Invalid username' }
        }
        if (cred.password !== password) {
          return { success: false, error: 'Invalid password / PIN' }
        }
        set({ user: cred.user, isAuthenticated: true })
        return { success: true }
      },

      logout: () => set({ user: null, isAuthenticated: false, selectedRole: null })
    }),
    {
      name: 'gvd-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
)
