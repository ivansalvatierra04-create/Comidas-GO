import { getAuditLogs } from './audit.js'
import { getLicenses, updateLicenseStatus, LICENSE_STATUS } from './licenses.js'
import { getStores, createStore, updateStore } from './stores.js'
import { getOrders } from '../data/orders.js'
import { getCajaMovements } from '../data/caja.js'

export function listStoresWithStatus() {
  const stores = getStores()
  const licenses = getLicenses()
  return stores.map((s) => {
    const license = licenses.find((l) => String(l.storeId) === String(s.id)) || null
    const orders = getOrders(s.id)
    const caja = getCajaMovements(s.id)
    const lastOrder = orders[0] || null
    const lastCaja = caja[0] || null
    const lastActivityAt = [lastOrder?.createdAt, lastCaja?.date, s.updatedAt, s.createdAt].filter(Boolean).sort().slice(-1)[0] || null
    return {
      store: s,
      license,
      stats: {
        users: 0, // real user management requires backend/auth; placeholder
        orders: orders.length,
        salesTotal: orders.filter((o) => !o.annulled).reduce((sum, o) => sum + (Number(o.total) || 0), 0),
        lastActivityAt,
      },
    }
  })
}

export function superadminCreateStore(input) {
  return createStore(input)
}

export function superadminUpdateStore(id, patch) {
  return updateStore(id, patch)
}

export function superadminSetLicense(storeId, status, reason = '') {
  return updateLicenseStatus(storeId, status, { reason, actor: 'superadmin' })
}

export function getPlatformStats() {
  const rows = listStoresWithStatus()
  const byStatus = rows.reduce((acc, r) => {
    const st = r.license?.status || 'sin_licencia'
    acc[st] = (acc[st] || 0) + 1
    return acc
  }, {})
  const totalSales = rows.reduce((sum, r) => sum + r.stats.salesTotal, 0)
  const totalOrders = rows.reduce((sum, r) => sum + r.stats.orders, 0)
  return {
    stores: rows.length,
    byStatus,
    totalSales,
    totalOrders,
    auditEvents: getAuditLogs().length,
  }
}

export { LICENSE_STATUS }
