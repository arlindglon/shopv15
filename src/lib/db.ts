import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

// ===========================================
// 🔐 SUPABASE CLIENTS
// ===========================================
// সব credentials .env থেকে আসে — কোনো hardcode নেই
// .env পরিবর্তন করলে dev server restart দিতে হবে

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || ''

// Default client (uses service_role key from env — same as current setup)
// service_role bypasses RLS — use for all server-side operations
export const supabase = createClient(
  SUPABASE_URL, 
  SUPABASE_ANON_KEY
)

// Admin client with explicit service_role options
// (same key, but with auth options for server-only operations)
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Helper function to generate proper UUID format
export function generateId(): string {
  return uuidv4()
}

// Export as db for compatibility
export const db = supabase
