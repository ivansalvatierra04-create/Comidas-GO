import { platformKey, readJSON, writeJSON } from './storage.js'
import { logAudit } from './audit.js'

// Local best-effort sequential code per store. In production this MUST be enforced
// by the database (sequence/serial + transaction) to avoid duplicates under concurrency.
export function nextSaleCode(storeId) {
  const key = platformKey(`sale-seq:${storeId}`)
  const current = Number(readJSON(key, 0)) || 0
  const next = current + 1
  writeJSON(key, next)
  const code = `VTA-${String(next).padStart(6, '0')}`
  return { code, seq: next }
}

export function peekSaleSeq(storeId) {
  const key = platformKey(`sale-seq:${storeId}`)
  return Number(readJSON(key, 0)) || 0
}

export function annulSale({ storeId, saleId, saleCode, user = 'system', reason = '' }) {
  // Sales must be preserved (never deleted/reused). This records an audit event;
  // actual status update is performed by the orders/data layer.
  return logAudit({
    storeId,
    user,
    action: 'sale_annulled',
    entity: 'sale',
    entityId: saleId || saleCode || '',
    details: { saleCode, reason },
  })
}
