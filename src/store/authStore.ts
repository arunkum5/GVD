import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { AuthUser, UserRole } from '@/types'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  selectedRole: UserRole | null
  login: (profileId: string, pin: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>
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

      login: async (profileId, pin, role) => {
        if (profileId === 'default_admin') {
          if (pin === '1234') {
            set({ 
              user: { role: 'ADMIN', name: 'Master Admin', username: 'admin' }, 
              isAuthenticated: true 
            })
            return { success: true }
          }
          return { success: false, error: 'Invalid master PIN' }
        }

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', profileId)
            .single()

          if (error || !data) return { success: false, error: 'Profile not found' }
          
          if (data.pin !== pin) return { success: false, error: 'Invalid PIN' }

          set({ 
            user: { role: data.role as UserRole, name: data.name, username: data.id }, 
            isAuthenticated: true 
          })
          return { success: true }
        } catch (e: any) {
          return { success: false, error: e.message }
        }
      },

      logout: () => set({ user: null, isAuthenticated: false, selectedRole: null })
    }),
    {
      name: 'gvd-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
)
