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
  saveInspection: (jobCardId: string, inspections: any[]) => Promise<void>
  addInventoryItem: (item: any) => Promise<void>
  bulkAddInventory: (items: any[]) => Promise<void>
  deleteJobCard: (id: string | number) => Promise<void>
  deleteInventoryItem: (id: string | number) => Promise<void>
  reviews: any[]
  fetchReviews: () => Promise<void>
  addReview: (review: { jobCardId: string, customerName: string, rating: number, comment: string }) => Promise<void>
  profiles: any[]
  fetchProfiles: () => Promise<void>
  addProfile: (profile: any) => Promise<void>
  updateProfile: (id: string, data: any) => Promise<void>
  deleteProfile: (id: string) => Promise<void>
}

export const useDataStore = create<DataState>((set, get) => ({
  jobCards: [],
  inventory: [],
  reviews: [],
  profiles: [],
  isLoading: false,
  error: null,

  fetchReviews: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const formattedData = data.map(item => ({
        id: item.id,
        customerName: item.customer_name,
        rating: item.rating,
        comment: item.comment,
        createdAt: item.created_at
      }))

      set({ reviews: formattedData, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  addReview: async (review) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.from('reviews').insert([{
        job_card_id: review.jobCardId,
        customer_name: review.customerName,
        rating: review.rating,
        comment: review.comment
      }])
      if (error) throw error
      
      await get().fetchReviews()
    } catch (err: any) {
      console.error('Failed to add review:', err)
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  fetchProfiles: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ profiles: data, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  addProfile: async (profile) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.from('profiles').insert([profile])
      if (error) throw error
      await get().fetchProfiles()
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  updateProfile: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.from('profiles').update(data).eq('id', id)
      if (error) throw error
      await get().fetchProfiles()
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  deleteProfile: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id)
      if (error) throw error
      await get().fetchProfiles()
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  fetchJobCards: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('job_cards')
        .select(`
          *,
          profiles(name, phone),
          job_items(*),
          inspections(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const formattedData = data.map(job => {
        const items = job.job_items?.map((item: any) => ({
          id: item.id,
          jobCardId: item.job_card_id,
          category: item.category,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalAmount: item.total
        })) || []

        const calculatedTotal = items.reduce((sum: number, item: any) => sum + item.totalAmount, 0)

        return {
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
        totalAmount: calculatedTotal,
        advancePaid: job.advance_paid,
        balanceAmount: calculatedTotal - (job.advance_paid || 0),
        deliveryDateTime: job.delivery_date_time,
        isSmsAlertEnabled: job.is_sms_alert_enabled,
        isPaidOnline: job.is_paid_online,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
        items: items,
        inspections: job.inspections || [],
        customerName: job.customer_name || job.profiles?.name || 'Unknown',
        customerMobile: job.customer_mobile || job.profiles?.phone || 'Unknown',
        }
      }) as unknown as JobCard[]

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
      
      const formattedData = data.map(item => ({
        id: item.id,
        partName: item.part_name,
        partNumber: item.part_number,
        category: item.category,
        compatibleType: 'FOUR_WHEELER',
        unitPrice: item.unit_price,
        stockQuantity: item.stock_quantity,
        minThresholdAlert: item.min_threshold_alert,
        unit: 'pcs'
      })) as any[]

      set({ inventory: formattedData, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  addInventoryItem: async (item) => {
    set({ isLoading: true })
    try {
      const { error } = await supabase.from('inventory').insert([{
        part_name: item.partName,
        part_number: item.partNumber,
        category: item.category,
        unit_price: item.unitPrice,
        stock_quantity: item.stockQuantity,
        min_threshold_alert: item.minThresholdAlert
      }])
      if (error) throw error
      
      await get().fetchInventory()
    } catch (err: any) {
      console.error('Failed to add inventory:', err)
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  bulkAddInventory: async (items) => {
    set({ isLoading: true })
    try {
      const payload = items.map(item => ({
        part_name: item.partName,
        part_number: item.partNumber || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        category: item.category || 'SPARE',
        unit_price: parseFloat(item.unitPrice) || 0,
        stock_quantity: parseInt(item.stockQuantity) || 0,
        min_threshold_alert: parseInt(item.minThresholdAlert) || 5
      }))

      if (payload.length > 0) {
        const { error } = await supabase.from('inventory').insert(payload)
        if (error) throw error
      }
      
      await get().fetchInventory()
    } catch (err: any) {
      console.error('Failed to bulk add inventory:', err)
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  deleteInventoryItem: async (id) => {
    set({ isLoading: true })
    try {
      const { error } = await supabase.from('inventory').delete().eq('id', id)
      if (error) throw error
      await get().fetchInventory()
    } catch (err: any) {
      console.error('Failed to delete inventory:', err)
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  deleteJobCard: async (id) => {
    set({ isLoading: true })
    try {
      const { error } = await supabase.from('job_cards').delete().eq('id', id)
      if (error) throw error
      await get().fetchJobCards()
    } catch (err: any) {
      console.error('Failed to delete job card:', err)
      set({ error: err.message, isLoading: false })
      throw err
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
  },

  saveInspection: async (jobCardId, inspections) => {
    set({ isLoading: true })
    try {
      // Clear existing inspections for this job card just in case of re-save
      await supabase.from('inspections').delete().eq('job_card_id', jobCardId)

      const payload = inspections.map(i => ({
        job_card_id: jobCardId,
        component: i.component,
        status: i.status,
        photo_url: i.photoUrl || null,
        notes: i.notes || null
      }))

      if (payload.length > 0) {
        const { error } = await supabase.from('inspections').insert(payload)
        if (error) throw error
      }
      
      set({ isLoading: false })
    } catch (err: any) {
      console.error('Failed to save inspection:', err)
      set({ error: err.message, isLoading: false })
      throw err
    }
  }
}))
