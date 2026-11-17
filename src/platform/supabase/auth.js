import { getSupabase, isSupabaseConfigured } from './client.js'

export function backendAvailable() {
  return isSupabaseConfigured() && Boolean(getSupabase())
}

export async function signInWithPassword(email, password) {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase no está configurado')
  const { data, error } = await sb.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUpOwner(email, password, meta = {}) {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase no está configurado')
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { role: 'owner', ...meta } },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const sb = getSupabase()
  if (!sb) return
  const { error } = await sb.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email, redirectTo) {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase no está configurado')
  const { data, error } = await sb.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined)
  if (error) throw error
  return data
}

export async function getSession() {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb.auth.getSession()
  if (error) throw error
  return data?.session || null
}

export async function getUser() {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb.auth.getUser()
  if (error) throw error
  return data?.user || null
}

export function onAuthStateChange(callback) {
  const sb = getSupabase()
  if (!sb) return { data: { subscription: { unsubscribe() {} } } }
  return sb.auth.onAuthStateChange((_event, session) => callback(session))
}
