import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

// ===========================================
// 🔐 SUPABASE CLIENTS
// ===========================================
// সব credentials .env থেকে আসে — কোনো hardcode নেই
// .env পরিবর্তন করলে dev server restart দিতে হবে

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || ''

// Validate Supabase credentials at startup
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '\n⚠️  SUPABASE_URL or SUPABASE_ANON_KEY is missing in .env\n' +
    '   Please add them to /home/z/my-project/.env\n' +
    '   Get them from: Supabase Dashboard → Settings → API\n'
  );
}

// Create client — even if empty, don't crash at import time
// Individual API calls will fail gracefully with proper error messages
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co', 
  SUPABASE_ANON_KEY || 'placeholder'
)

// Admin client with explicit service_role options
// (same key, but with auth options for server-only operations)
export const supabaseAdmin = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder',
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
