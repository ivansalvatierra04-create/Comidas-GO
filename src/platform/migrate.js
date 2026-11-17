import { ensureDefaultStore, getCurrentStoreId } from './stores.js'
import { platformKey, readJSON, scopedKey, writeJSON } from './storage.js'

const MIGRATION_FLAG = platformKey('migrated-v1-to-tenant')

// Migrate legacy single-tenant localStorage keys into the default store scope.
// Non-destructive: copies data; keeps legacy keys as backup.
export function ensureTenantMigration() {
  if (readJSON(MIGRATION_FLAG, false)) {
    ensureDefaultStore()
    getCurrentStoreId()
    return
  }
  const store = ensureDefaultStore()
  const storeId = store.id

  const mappings = [
    ['comidasgo-settings', scopedKey(storeId, 'settings')],
    ['comidasgo-categories', scopedKey(storeId, 'categories')],
    ['comidasgo-orders', scopedKey(storeId, 'orders')],
    ['comidasgo-caja', scopedKey(storeId, 'caja')],
    ['comidasgo-promotions', scopedKey(storeId, 'promotions')],
    ['comidasgo-slides', scopedKey(storeId, 'slides')],
    ['comidasgo-carousel-slides', scopedKey(storeId, 'slides')],
    ['comidasgo-cart', scopedKey(storeId, 'cart')],
  ]

  mappings.forEach(([legacy, scoped]) => {
    try {
      const raw = localStorage.getItem(legacy)
      if (raw != null && localStorage.getItem(scoped) == null) {
        localStorage.setItem(scoped, raw)
      }
    } catch {}
  })

  writeJSON(MIGRATION_FLAG, { at: new Date().toISOString(), storeId })
  getCurrentStoreId()
}
