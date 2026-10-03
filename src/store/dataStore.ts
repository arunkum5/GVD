import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { JobCard, InventoryItem } from '@/types'

interface DataState {
  jobCards: JobCard[]
  inventory: InventoryItem[]
  isLoading: boolean
  error: string | null
  fetchJobCards: () => Promise<void>
  fetchInventory: () => Promise<void>
  addJobCard: (jobCard: Partial<JobCard>) => Promise<void>
  updateJobCardStatus: (id: string, status: JobCard['status']) => Promise<void>
  addJobItem: (jobCardId: string, item: { name: string, category: string, unitPrice: number, quantity: number, total: number }) => Promise<void>
}

export const useDataStore = create<DataState>((set, get) => ({
  jobCards: [],
  inventory: [],
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
      
      const formattedData = data.map(job => ({
        id: job.id,
        jobCardNumber: job.job_card_number,
        customerId: job.customer_id,
        vehicleNumber: job.vehicle_number,
        vehicleType: job.vehicle_type,
        make: job.make,
        model: job.model,
        variant: job.variant,
        odometerKm: job.odometer_km,
        fuelLevelPercent: job.fuel_level_percent,
        accessoriesNotes: job.accessories_notes,
        customerVoice: job.customer_voice,
        dentNotes: job.dent_notes,
        status: job.status,
        totalSpares: job.total_spares,
        totalLabour: job.total_labour,
        totalLubes: job.total_lubes,
        totalAmount: job.total_amount,
        advancePaid: job.advance_paid,
        balanceAmount: (job.total_amount || 0) - (job.advance_paid || 0),
        deliveryDateTime: job.delivery_date_time,
        isSmsAlertEnabled: job.is_sms_alert_enabled,
        isPaidOnline: job.is_paid_online,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
        items: job.job_items?.map((item: any) => ({
          id: item.id,
          jobCardId: item.job_card_id,
          category: item.category,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalAmount: item.total
        })) || [],
        customerName: job.customer_name || job.profiles?.name || 'Unknown',
        customerMobile: job.customer_mobile || job.profiles?.phone || 'Unknown',
      })) as unknown as JobCard[]

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
      const dbPayload = {
        job_card_number: jobCard.jobCardNumber,
        customer_name: jobCard.customerName,
        customer_mobile: jobCard.customerMobile,
        vehicle_number: jobCard.vehicleNumber,
        vehicle_type: jobCard.vehicleType,
        make: jobCard.make,
        model: jobCard.model,
        variant: jobCard.variant,
        odometer_km: jobCard.odometerKm,
        fuel_level_percent: jobCard.fuelLevelPercent,
        accessories_notes: jobCard.accessoriesNotes,
        customer_voice: jobCard.customerVoice,
        dent_notes: jobCard.dentNotes,
        dent_photos: jobCard.dentPhotos,
        status: 'OPEN'
      }

      const { data, error } = await supabase.from('job_cards').insert([dbPayload]).select().single()
      if (error) throw error

      await get().fetchJobCards()
    } catch (err: any) {
      console.error('Failed to create job card:', err)
      set({ error: err.message, isLoading: false })
      throw err
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
  },

  addJobItem: async (jobCardId, item) => {
    set({ isLoading: true })
    try {
      const { error } = await supabase.from('job_items').insert([{
        job_card_id: jobCardId,
        name: item.name,
        category: item.category,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        total: item.total
      }])
      if (error) throw error
      
      // Update local state by re-fetching
      await get().fetchJobCards()
    } catch (err: any) {
      console.error('Failed to add job item:', err)
      set({ error: err.message, isLoading: false })
      throw err
    }
  }
}))
