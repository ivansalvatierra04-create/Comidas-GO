const SESSION_KEY = 'comidasgo-owner-session'
import { getSettings } from './settings.js'

export function getOwnerPin() {
  return String(getSettings().ownerPin || '').trim()
}

export function isOwnerProtected() {
  return getOwnerPin().length > 0
}

export function isOwnerAuthed() {
  try {
    if (!isOwnerProtected()) return true
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function loginOwner(pin) {
  const expected = getOwnerPin()
  if (!expected) return true
  if (String(pin || '').trim() !== expected) return false
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {}
  window.dispatchEvent(new Event('owner-auth-updated'))
  return true
}

export function logoutOwner() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {}
  window.dispatchEvent(new Event('owner-auth-updated'))
}
