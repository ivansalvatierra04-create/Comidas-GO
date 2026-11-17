import { nowIso, uid } from './ids.js'
import { platformKey, readJSON, writeJSON } from './storage.js'

const KEY = platformKey('licenses')

export const LICENSE_STATUS = {
  PENDING: 'pendiente',
  ACTIVE: 'activa',
  SUSPENDED: 'suspendida',
  CANCELLED: 'cancelada',
}

export function getLicenses() {
  const list = readJSON(KEY, [])
  return Array.isArray(list) ? list : []
}

export function saveLicenses(list) {
  writeJSON(KEY, list)
  window.dispatchEvent(new Event('platform-licenses-updated'))
}

export function getLicenseByStoreId(storeId) {
  return getLicenses().find((l) => String(l.storeId) === String(storeId)) || null
}

export function getLicenseById(id) {
  return getLicenses().find((l) => String(l.id) === String(id)) || null
}

export function createOneTimeLicense({ storeId, amount = 0, activated = false, notes = '' }) {
  const now = nowIso()
  const license = {
    id: uid('LIC'),
    storeId: String(storeId),
    purchaseDate: now,
    activationDate: activated ? now : null,
    amountPaid: Number(amount) || 0,
    status: activated ? LICENSE_STATUS.ACTIVE : LICENSE_STATUS.PENDING,
    type: 'permanente',
    history: [
      {
        at: now,
        action: 'created',
        to: activated ? LICENSE_STATUS.ACTIVE : LICENSE_STATUS.PENDING,
        notes: notes || 'Licencia de pago único creada',
      },
    ],
  }
  const all = [license, ...getLicenses().filter((l) => String(l.storeId) !== String(storeId))]
  saveLicenses(all)
  return license
}

export function updateLicenseStatus(storeId, status, { reason = '', actor = 'superadmin' } = {}) {
  const allowed = [LICENSE_STATUS.PENDING, LICENSE_STATUS.ACTIVE, LICENSE_STATUS.SUSPENDED, LICENSE_STATUS.CANCELLED]
  if (!allowed.includes(status)) return null
  const all = getLicenses()
  const idx = all.findIndex((l) => String(l.storeId) === String(storeId))
  if (idx < 0) return null
  const prev = all[idx]
  const now = nowIso()
  const next = {
    ...prev,
    status,
    activationDate: status === LICENSE_STATUS.ACTIVE && !prev.activationDate ? now : prev.activationDate,
    history: [
      ...(Array.isArray(prev.history) ? prev.history : []),
      { at: now, action: 'status_change', from: prev.status, to: status, reason, actor },
    ],
  }
  all[idx] = next
  saveLicenses(all)
  return next
}

export function isLicenseOperational(storeId) {
  // Permanent licenses: only 'activa' allows operations. No auto-expiration by date.
  const lic = getLicenseByStoreId(storeId)
  if (!lic) return false
  return lic.status === LICENSE_STATUS.ACTIVE
}

export function getLicenseBlockReason(storeId) {
  const lic = getLicenseByStoreId(storeId)
  if (!lic) return 'Este comercio no tiene una licencia registrada. Comuníquese con el administrador de la plataforma.'
  if (lic.status === LICENSE_STATUS.SUSPENDED) return 'La licencia de este comercio está suspendida. Comuníquese con el administrador de la plataforma.'
  if (lic.status === LICENSE_STATUS.CANCELLED) return 'La licencia de este comercio está cancelada. Comuníquese con el administrador de la plataforma.'
  if (lic.status === LICENSE_STATUS.PENDING) return 'La licencia de este comercio está pendiente de activación. Comuníquese con el administrador de la plataforma.'
  return ''
}
