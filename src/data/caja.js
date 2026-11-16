const STORAGE_KEY = 'comidasgo-caja'

export const cajaCategories = {
  income: ['Ventas', 'Otros ingresos'],
  expense: ['Proveedores', 'Insumos', 'Servicios', 'Otros gastos'],
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function getCajaMovements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCajaMovements(movements) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movements))
  window.dispatchEvent(new Event('caja-updated'))
}

export function addCajaMovement({ type, amount, concept, category, date, method = '', note = '', source = 'manual', orderId = '' }) {
  const value = Math.max(0, Number(amount) || 0)
  if (!value) return null
  const movement = {
    id: createId(),
    type: type === 'expense' ? 'expense' : 'income',
    amount: value,
    concept: String(concept || '').trim() || (type === 'expense' ? 'Egreso' : 'Ingreso'),
    category: String(category || '').trim() || (type === 'expense' ? 'Otros gastos' : 'Otros ingresos'),
    date: date || new Date().toISOString(),
    method: String(method || '').trim(),
    note: String(note || '').trim(),
    source,
    orderId: String(orderId || ''),
  }
  const movements = [movement, ...getCajaMovements()]
  saveCajaMovements(movements)
  return movement
}

export function deleteCajaMovement(id) {
  const movements = getCajaMovements().filter((m) => String(m.id) !== String(id))
  saveCajaMovements(movements)
}

export function getCajaSummary(movements = getCajaMovements()) {
  const income = movements.filter((m) => m.type === 'income').reduce((sum, m) => sum + (Number(m.amount) || 0), 0)
  const expense = movements.filter((m) => m.type === 'expense').reduce((sum, m) => sum + (Number(m.amount) || 0), 0)
  return { income, expense, balance: income - expense }
}

export function isSameDay(iso, ref = new Date()) {
  try {
    const d = new Date(iso)
    return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate()
  } catch {
    return false
  }
}

export function getTodayMovements(movements = getCajaMovements()) {
  const now = new Date()
  return movements.filter((m) => isSameDay(m.date, now))
}
