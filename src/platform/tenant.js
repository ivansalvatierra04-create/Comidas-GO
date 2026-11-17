import { getCurrentStoreId, ensureDefaultStore } from './stores.js'
import { getLicenseBlockReason, isLicenseOperational } from './licenses.js'

export function resolveStoreId(explicitStoreId) {
  if (explicitStoreId) return String(explicitStoreId)
  ensureDefaultStore()
  return getCurrentStoreId()
}

export function assertStoreOperational(storeId) {
  if (isLicenseOperational(storeId)) return { ok: true }
  return { ok: false, reason: getLicenseBlockReason(storeId) }
}

// Client-side enforcement helper. Real enforcement MUST be done server-side (backend/RLS)
// so a client cannot bypass license suspension by modifying local state.
export function requireOperationalOrThrow(storeId) {
  const res = assertStoreOperational(storeId)
  if (!res.ok) {
    const err = new Error(res.reason || 'Licencia no operativa')
    err.code = 'LICENSE_BLOCKED'
    throw err
  }
}
