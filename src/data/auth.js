const USERS_KEY = 'comidasgo-users'
const SESSION_KEY = 'comidasgo-session'

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
  window.dispatchEvent(new Event('auth-updated'))
}

export function registerOrLogin({ name, phone, pin }) {
  const cleanPhone = String(phone || '').trim()
  const cleanPin = String(pin || '').trim()
  const cleanName = String(name || '').trim()
  if (!cleanPhone || !cleanPin) return { ok: false, error: 'Completá teléfono y PIN.' }
  if (cleanPin.length < 4) return { ok: false, error: 'El PIN debe tener al menos 4 dígitos.' }

  const users = readUsers()
  const existing = users.find((u) => String(u.phone) === cleanPhone)
  if (existing) {
    if (String(existing.pin) !== cleanPin) return { ok: false, error: 'PIN incorrecto para este teléfono.' }
    const session = { phone: existing.phone, name: existing.name || cleanName || 'Cliente' }
    if (cleanName && cleanName !== existing.name) {
      existing.name = cleanName
      writeUsers(users)
    }
    setSession(session)
    return { ok: true, session }
  }

  const user = { phone: cleanPhone, pin: cleanPin, name: cleanName || 'Cliente', createdAt: new Date().toISOString() }
  users.push(user)
  writeUsers(users)
  const session = { phone: user.phone, name: user.name }
  setSession(session)
  return { ok: true, session, created: true }
}

export function logout() {
  setSession(null)
}

export function getCurrentUser() {
  const session = getSession()
  if (!session?.phone) return null
  const users = readUsers()
  const user = users.find((u) => String(u.phone) === String(session.phone))
  return user ? { phone: user.phone, name: user.name || session.name || 'Cliente' } : session
}
