import { ensureTenantMigration } from '../platform/migrate.js'
import { getCurrentStoreId } from '../platform/stores.js'
import { scopedKey } from '../platform/storage.js'

export function currentStoreId() {
  ensureTenantMigration()
  return getCurrentStoreId()
}

export function storeKey(name, storeId = currentStoreId()) {
  return scopedKey(storeId, name)
}
