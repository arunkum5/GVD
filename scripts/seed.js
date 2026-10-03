import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seed() {
  console.log('Seeding Database...')

  // Insert Inventory
  console.log('Inserting Inventory...')
  const { error: invErr } = await supabase.from('inventory').insert([
    { part_name: 'AIR FILTER BIG (Bajaj/Universal)', part_number: 'SP-BAJ-AF01', category: 'SPARE', unit_price: 205.0, stock_quantity: 32 },
    { part_name: 'Front Disc Brake Pads (Ceramic)', part_number: 'SP-BRK-092', category: 'SPARE', unit_price: 420.0, stock_quantity: 14 },
    { part_name: 'Motul 7100 10W50 100% Synthetic 1L', part_number: 'LB-MOT-10W50', category: 'LUBE', unit_price: 450.0, stock_quantity: 45 },
    { part_name: 'Tata Nexon OEM Brake Pad Set', part_number: 'SP-TAT-BP44', category: 'SPARE', unit_price: 2400.0, stock_quantity: 8 },
  ])
  if (invErr) console.error('Inventory Error:', invErr)

  console.log('Seed Complete!')
}

seed()
