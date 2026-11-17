import { logAudit } from '../platform/audit.js'
import { assertStoreOperational } from '../platform/tenant.js'
import { storeKey, currentStoreId } from './storeScope.js'

function key(storeId) {
  return storeKey('caja', storeId)
}

export const cajaCategories = {
  income: ['Ventas', 'Otros ingresos'],
  expense: ['Proveedores', 'Insumos', 'Servicios', 'Otros gastos'],
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function getCajaMovements(storeId) {
  try {
    const raw = localStorage.getItem(key(storeId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCajaMovements(movements, storeId) {
  localStorage.setItem(key(storeId), JSON.stringify(movements))
  window.dispatchEvent(new Event('caja-updated'))
}

export function addCajaMovement({ type, amount, concept, category, date, method = '', note = '', source = 'manual', orderId = '', user = 'owner' }, storeId = currentStoreId()) {
  const license = assertStoreOperational(storeId)
  if (!license.ok) {
    const err = new Error(license.reason || 'Licencia no operativa')
    err.code = 'LICENSE_BLOCKED'
    throw err
  }
  const value = Math.max(0, Number(amount) || 0)
  if (!value) return null
  const movement = {
    id: createId(),
    storeId,
    type: type === 'expense' ? 'expense' : 'income',
    amount: value,
    concept: String(concept || '').trim() || (type === 'expense' ? 'Egreso' : 'Ingreso'),
    category: String(category || '').trim() || (type === 'expense' ? 'Otros gastos' : 'Otros ingresos'),
    date: date || new Date().toISOString(),
    method: String(method || '').trim(),
    note: String(note || '').trim(),
    source,
    orderId: String(orderId || ''),
    user,
  }
  const movements = [movement, ...getCajaMovements(storeId)]
  saveCajaMovements(movements, storeId)
  logAudit({ storeId, user, action: movement.type === 'expense' ? 'cash_expense' : 'cash_income', entity: 'caja', entityId: movement.id, details: { amount: movement.amount, concept: movement.concept, source: movement.source } })
  return movement
}

export function deleteCajaMovement(id, { user = 'owner', storeId = currentStoreId() } = {}) {
  const license = assertStoreOperational(storeId)
  if (!license.ok) {
    const err = new Error(license.reason || 'Licencia no operativa')
    err.code = 'LICENSE_BLOCKED'
    throw err
  }
  const movements = getCajaMovements(storeId).filter((m) => String(m.id) !== String(id))
  saveCajaMovements(movements, storeId)
  logAudit({ storeId, user, action: 'cash_movement_deleted', entity: 'caja', entityId: id })
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
