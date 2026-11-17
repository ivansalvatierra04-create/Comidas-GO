export function uid(prefix = '') {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
  return prefix ? `${prefix}_${id}` : id
}

export function nowIso() {
  return new Date().toISOString()
}
