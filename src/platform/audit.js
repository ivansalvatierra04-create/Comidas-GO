import { nowIso, uid } from './ids.js'
import { platformKey, readJSON, writeJSON } from './storage.js'

const KEY = platformKey('audit')

export function getAuditLogs() {
  const list = readJSON(KEY, [])
  return Array.isArray(list) ? list : []
}

export function saveAuditLogs(list) {
  // Keep audit append-only in usage; protect by not exposing delete in UI/helpers for common users.
  writeJSON(KEY, list)
  window.dispatchEvent(new Event('platform-audit-updated'))
}

export function logAudit({ storeId = '', user = 'system', action, entity, entityId = '', details = null }) {
  const entry = {
    id: uid('AUD'),
    at: nowIso(),
    storeId: String(storeId || ''),
    user: String(user || 'system'),
    action: String(action || ''),
    entity: String(entity || ''),
    entityId: String(entityId || ''),
    details: details ?? null,
  }
  const all = [entry, ...getAuditLogs()]
  saveAuditLogs(all)
  return entry
}

export function getAuditByStore(storeId) {
  return getAuditLogs().filter((e) => String(e.storeId) === String(storeId))
}
