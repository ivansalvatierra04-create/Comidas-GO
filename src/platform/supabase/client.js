import { createClient } from '@supabase/supabase-js'

// Cliente Supabase (frontend, solo ANON KEY). Nunca exponer SERVICE_ROLE_KEY en VITE_.
export function getSupabaseConfig() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  }
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseConfig()
  return Boolean(url && anonKey)
}

let _client = null

export function getSupabase() {
  if (!isSupabaseConfigured()) return null
  if (_client) return _client
  const { url, anonKey } = getSupabaseConfig()
  _client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  return _client
}

// Compatibilidad con scaffold previo
export const supabase = getSupabase()
