import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { AuthUser, UserRole } from '@/types'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  selectedRole: UserRole | null
  login: (role: UserRole, pin: string) => Promise<{ success: boolean; error?: string }>
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

      login: async (role, pin) => {
        // Universal PIN for bypass
        if (pin !== '1234') {
          return { success: false, error: 'Invalid PIN' }
        }

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', role)
            .limit(1)
            .single()

          if (error || !data) {
            // If no profile exists yet in the database for this role, fallback to a dummy one
            set({ 
              user: { role, name: `${role} User`, username: role.toLowerCase() }, 
              isAuthenticated: true 
            })
            return { success: true }
          }

          set({ 
            user: { role: data.role as UserRole, name: data.name, username: data.id, id: data.id }, 
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
