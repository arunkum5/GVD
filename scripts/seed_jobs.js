import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'


dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seedProfilesAndJobs() {
  console.log('Seeding Profiles and Job Cards...')

  // 1. Insert Profile (Postgres will auto-generate the ID now!)
  const { data: profileData, error: profileError } = await supabase.from('profiles').insert([
    { name: 'Ashay Kohad', phone: '8698761486', role: 'CUSTOMER' },
    { name: 'Rajan Mehta', phone: '9988776655', role: 'CUSTOMER' }
  ]).select()

  if (profileError || !profileData) {
    console.error('Failed to create profiles:', profileError)
    return
  }
  
  const userId1 = profileData[0].id
  const userId2 = profileData[1].id
  console.log('Created profiles with IDs:', userId1, userId2)

  // 2. Insert Job Cards
  const { data: jobCardData, error: jobError } = await supabase.from('job_cards').insert([
    {
      job_card_number: 'JC-2026-0427',
      customer_id: userId1,
      vehicle_number: 'MH12RY1234',
      make: 'Bajaj',
      model: 'Avenger 150',
      status: 'IN_PROGRESS',
      total_amount: 2500,
      advance_paid: 500,
      customer_voice: 'Chain noise on deceleration'
    },
    {
      job_card_number: 'JC-2026-0429',
      customer_id: userId2,
      vehicle_number: 'KA05TH8899',
      make: 'Royal Enfield',
      model: 'Classic 350',
      status: 'OPEN',
      total_amount: 2150,
      advance_paid: 500,
      customer_voice: 'Periodic service due'
    }
  ]).select()

  if (jobError) {
    console.error('Failed to create Job Cards:', jobError)
    return
  }
  
  console.log('Created Job Cards:', jobCardData.map(j => j.id))
  
  // 3. Insert Job Items
  const { error: itemError } = await supabase.from('job_items').insert([
    { job_card_id: jobCardData[0].id, name: 'Chain Cleaning', category: 'LABOUR', unit_price: 400, quantity: 1, total: 400 },
    { job_card_id: jobCardData[0].id, name: 'Front Disc Brake Pads', category: 'SPARE', unit_price: 420, quantity: 1, total: 420 },
    { job_card_id: jobCardData[1].id, name: 'Basic Periodic Service', category: 'LABOUR', unit_price: 799, quantity: 1, total: 799 }
  ])

  if (itemError) {
    console.error('Failed to create Job Items:', itemError)
  }

  console.log('Seed Complete!')
}

seedProfilesAndJobs()
