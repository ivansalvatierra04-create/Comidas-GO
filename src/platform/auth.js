import { getStores } from './stores.js'
import { platformKey, readJSON, writeJSON } from './storage.js'

const SUPERADMIN_KEY = platformKey('superadmin-session')
const USER_SESSION_KEY = platformKey('user-session')

// SUPERADMIN is platform-level (private owner of the platform). In production this
// MUST be authenticated/authorized server-side (e.g. Supabase Auth + role claim).
// Here we provide a local bootstrap: password stored in platform config (not per-store)
// and session in sessionStorage. Never trust frontend-only checks in production.
const SUPERADMIN_CONFIG_KEY = platformKey('superadmin-config')

export function getSuperAdminConfig() {
  return readJSON(SUPERADMIN_CONFIG_KEY, { password: '' })
}

export function setSuperAdminPassword(password) {
  const cfg = { password: String(password || '') }
  writeJSON(SUPERADMIN_CONFIG_KEY, cfg)
  return cfg
}

export function isSuperAdminConfigured() {
  return String(getSuperAdminConfig().password || '').length > 0
}

export function loginSuperAdmin(password) {
  const cfg = getSuperAdminConfig()
  if (!String(cfg.password || '')) return false
  if (String(password || '') !== String(cfg.password)) return false
  try { sessionStorage.setItem(SUPERADMIN_KEY, '1') } catch {}
  window.dispatchEvent(new Event('platform-auth-updated'))
  return true
}

export function logoutSuperAdmin() {
  try { sessionStorage.removeItem(SUPERADMIN_KEY) } catch {}
  window.dispatchEvent(new Event('platform-auth-updated'))
}

export function isSuperAdminAuthed() {
  try { return sessionStorage.getItem(SUPERADMIN_KEY) === '1' } catch { return false }
}

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  SUPERADMIN: 'superadmin',
}

export function getUserSession() {
  return readJSON(USER_SESSION_KEY, null)
}

export function setUserSession(session) {
  if (!session) {
    localStorage.removeItem(USER_SESSION_KEY)
  } else {
    writeJSON(USER_SESSION_KEY, session)
  }
  window.dispatchEvent(new Event('platform-auth-updated'))
  return session
}

export function logoutUser() {
  setUserSession(null)
}

export function canAccessStore(storeId, session = getUserSession()) {
  if (!session || !storeId) return false
  return String(session.storeId) === String(storeId)
}

export function hasRole(session, roles) {
  if (!session) return false
  const list = Array.isArray(roles) ? roles : [roles]
  return list.includes(session.role)
}
