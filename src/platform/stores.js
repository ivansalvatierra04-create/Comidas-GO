import { nowIso, uid } from './ids.js'
import { logAudit } from './audit.js'
import { createOneTimeLicense, getLicenseByStoreId } from './licenses.js'
import { platformKey, readJSON, writeJSON } from './storage.js'

const KEY = platformKey('stores')
const CURRENT_KEY = platformKey('current-store-id')

export function getStores() {
  const list = readJSON(KEY, [])
  return Array.isArray(list) ? list : []
}

export function saveStores(list) {
  writeJSON(KEY, list)
  window.dispatchEvent(new Event('platform-stores-updated'))
}

export function getStoreById(id) {
  return getStores().find((s) => String(s.id) === String(id)) || null
}

export function getStoreBySlug(slug) {
  const s = String(slug || '').trim().toLowerCase()
  return getStores().find((x) => String(x.slug || '').toLowerCase() === s) || null
}

export function createStore({ name, slug, logo = '', address = '', contact = '', activateLicense = false, licenseAmount = 0 }) {
  const now = nowIso()
  const cleanSlug = String(slug || name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || uid('store')
  if (getStoreBySlug(cleanSlug)) {
    throw new Error('El slug ya existe. Elegí otro identificador para el comercio.')
  }
  const store = {
    id: uid('STR'),
    name: String(name || 'Nuevo comercio').trim(),
    slug: cleanSlug,
    logo: String(logo || ''),
    address: String(address || ''),
    contact: String(contact || ''),
    createdAt: now,
    updatedAt: now,
    status: 'active',
  }
  saveStores([store, ...getStores()])
  createOneTimeLicense({ storeId: store.id, amount: licenseAmount, activated: activateLicense, notes: 'Creación de comercio' })
  logAudit({ storeId: store.id, user: 'superadmin', action: 'store_created', entity: 'store', entityId: store.id, details: { name: store.name, slug: store.slug } })
  return store
}

export function updateStore(id, patch) {
  const all = getStores()
  const idx = all.findIndex((s) => String(s.id) === String(id))
  if (idx < 0) return null
  const next = { ...all[idx], ...patch, updatedAt: nowIso() }
  if (patch.slug) {
    const cleanSlug = String(patch.slug).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const dup = getStoreBySlug(cleanSlug)
    if (dup && String(dup.id) !== String(id)) throw new Error('El slug ya existe.')
    next.slug = cleanSlug
  }
  all[idx] = next
  saveStores(all)
  logAudit({ storeId: id, user: 'superadmin', action: 'store_updated', entity: 'store', entityId: id, details: patch })
  return next
}

export function ensureDefaultStore() {
  const stores = getStores()
  if (stores.length > 0) return stores[0]
  const store = {
    id: 'store-default',
    name: 'Comercio principal',
    slug: 'principal',
    logo: '',
    address: '',
    contact: '',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    status: 'active',
  }
  saveStores([store])
  if (!getLicenseByStoreId(store.id)) {
    createOneTimeLicense({ storeId: store.id, amount: 0, activated: true, notes: 'Licencia inicial (migración local)' })
  }
  return store
}

export function getCurrentStoreId() {
  const id = readJSON(CURRENT_KEY, null)
  if (id && getStoreById(id)) return String(id)
  const def = ensureDefaultStore()
  writeJSON(CURRENT_KEY, def.id)
  return def.id
}

export function setCurrentStoreId(storeId) {
  if (!getStoreById(storeId)) return null
  writeJSON(CURRENT_KEY, String(storeId))
  window.dispatchEvent(new Event('platform-store-changed'))
  return String(storeId)
}
