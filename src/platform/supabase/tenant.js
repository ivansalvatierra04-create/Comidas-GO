import { getSupabase, isSupabaseConfigured } from './client.js'

export async function fetchPublicStoreBySlug(slug) {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb.rpc('get_public_store', { p_slug: slug })
  if (error) throw error
  return data || null
}

export async function fetchMyMemberships() {
  const sb = getSupabase()
  if (!sb) return []
  const { data, error } = await sb.from('memberships').select('*, stores(*)')
  if (error) throw error
  return data || []
}

export function canUseRemoteBackend() {
  return isSupabaseConfigured()
}
