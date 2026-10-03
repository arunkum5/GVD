import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { JobCard, InventoryItem, InspectionItem } from '@/types'

interface DataState {
  jobCards: JobCard[]
  inventory: InventoryItem[]
  inspections: Record<string, InspectionItem[]> // Keyed by job_card_id
  isLoading: boolean
  error: string | null
  fetchJobCards: () => Promise<void>
  fetchInventory: () => Promise<void>
  addJobCard: (jobCard: Partial<JobCard>) => Promise<void>
  updateJobCardStatus: (id: string, status: JobCard['status']) => Promise<void>
}

export const useDataStore = create<DataState>((set, get) => ({
  jobCards: [],
  inventory: [],
  inspections: {},
  isLoading: false,
  error: null,

  fetchJobCards: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('job_cards')
        .select(`
          *,
          profiles(name, phone),
          job_items(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform data if necessary to match types
      const formattedData = data.map(job => ({
        ...job,
        customerName: job.profiles?.name || 'Unknown',
        customerMobile: job.profiles?.phone || 'Unknown',
      })) as any

      set({ jobCards: formattedData, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  fetchInventory: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('part_name')

      if (error) throw error
      
      set({ inventory: data as any, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  addJobCard: async (jobCard) => {
    set({ isLoading: true })
    try {
      const { error } = await supabase.from('job_cards').insert([jobCard])
      if (error) throw error
      await get().fetchJobCards()
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  updateJobCardStatus: async (id, status) => {
    set({ isLoading: true })
    try {
      const { error } = await supabase
        .from('job_cards')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      
      // Optimistic update
      set(state => ({
        jobCards: state.jobCards.map(jc => jc.id === (id as any) ? { ...jc, status } : jc),
        isLoading: false
      }))
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  }
}))
