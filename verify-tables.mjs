import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const tablesToCheck = [
  'chat_history',
  'user_profiles',
  'product_reviews',
  'abandoned_carts',
  'product_inventory',
  'inventory_history',
  'customers',
  'orders',
  'mailing_list',
  'customer_wishlist',
  'wishlist_notifications',
  'profiles',
  'products'
]

console.log('Checking which tables exist in your Supabase database...\n')

for (const table of tablesToCheck) {
  try {
    const { data, error, status } = await supabase
      .from(table)
      .select('*')
      .limit(1)
    
    if (status === 200 || (error && !error.message.includes('not found'))) {
      console.log(`✓ ${table} - EXISTS`)
    } else if (error && error.message.includes('not found')) {
      console.log(`✗ ${table} - DOES NOT EXIST`)
    } else {
      console.log(`? ${table} - ERROR: ${error?.message}`)
    }
  } catch (e) {
    console.log(`✗ ${table} - ERROR`)
  }
}

console.log('\n---\nTables marked with ✓ exist and are accessible.')
console.log('Tables marked with ✗ do not exist or cannot be accessed.')
