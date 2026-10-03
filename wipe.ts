import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ufdmdldsmurhpcdbttqz.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmZG1kbGRzbXVyaHBjZGJ0dHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMTY4NzMsImV4cCI6MjEwNjU5Mjg3M30.-G5viC0mq7m_yJw83iVXXmG_0nKN-otsuSr2-xNfEqM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function wipe() {
  console.log('Wiping reviews...')
  await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  console.log('Wiping inspections...')
  await supabase.from('inspections').delete().neq('id', 0)
  
  console.log('Wiping job_items...')
  await supabase.from('job_items').delete().neq('id', 0)
  
  console.log('Wiping job_cards...')
  await supabase.from('job_cards').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  console.log('Wiping inventory...')
  await supabase.from('inventory').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  console.log('Done.')
}

wipe()
