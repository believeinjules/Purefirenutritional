import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Query to get all tables
const { data, error } = await supabase
  .from('information_schema.tables')
  .select('table_name, table_schema')
  .eq('table_schema', 'public')

if (error) {
  console.log("Using alternative method...")
  // Try to get table info through public tables
  const tables = [
    'product_reviews', 'abandoned_carts', 'product_inventory', 
    'inventory_history', 'customers', 'orders', 'mailing_list',
    'customer_wishlist', 'wishlist_notifications', 'user_profiles',
    'chat_history', 'profiles', 'newsletter_subscribers', 'products'
  ]
  
  console.log("\nChecking for these tables:")
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (!error) {
        console.log(`✓ ${table}`)
      } else if (error.message.includes('not found')) {
        console.log(`✗ ${table} - NOT FOUND`)
      } else {
        console.log(`? ${table} - ${error.message}`)
      }
    } catch (e) {
      console.log(`✗ ${table} - ERROR`)
    }
  }
} else {
  console.log("\nTables in public schema:")
  data.forEach(row => console.log(`✓ ${row.table_name}`))
}
