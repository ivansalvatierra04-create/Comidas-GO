import { logAudit } from '../platform/audit.js'
import { storeKey, currentStoreId } from './storeScope.js'

function key(storeId) {
  return storeKey('settings', storeId)
}

export const defaultSettings = {
  storeName1: 'Comidas',
  storeName2: 'GO',
  tagline: 'pedí y disfrutá',
  logo: '',
  backgroundImage: '',
  backgroundColor1: '#163a63',
  backgroundColor2: '#06162a',
  aboutPhoto: '',
  phone: '',
  address: '',
  whatsapp: '',
  paymentCashInfo: 'Pago en efectivo al recibir/retirar.',
  paymentTransferInfo: '',
  paymentMpLink: '',
  etaPickupMinutes: 20,
  etaDeliveryMinutes: 40,
  ownerPin: '',
}

export function getSettings(storeId) {
  try {
    const raw = localStorage.getItem(key(storeId))
    if (!raw) return { ...defaultSettings }
    const parsed = JSON.parse(raw)
    return {
      ...defaultSettings,
      ...parsed,
      storeName1: parsed.storeName1 ?? defaultSettings.storeName1,
      storeName2: parsed.storeName2 ?? defaultSettings.storeName2,
      tagline: parsed.tagline ?? defaultSettings.tagline,
      logo: parsed.logo ?? '',
      backgroundImage: parsed.backgroundImage ?? '',
      backgroundColor1: parsed.backgroundColor1 || defaultSettings.backgroundColor1,
      backgroundColor2: parsed.backgroundColor2 || defaultSettings.backgroundColor2,
      aboutPhoto: parsed.aboutPhoto ?? '',
      phone: parsed.phone ?? '',
      address: parsed.address ?? '',
      whatsapp: parsed.whatsapp ?? '',
      paymentCashInfo: parsed.paymentCashInfo ?? defaultSettings.paymentCashInfo,
      paymentTransferInfo: parsed.paymentTransferInfo ?? '',
      paymentMpLink: parsed.paymentMpLink ?? '',
      etaPickupMinutes: Number.isFinite(Number(parsed.etaPickupMinutes)) ? Math.max(1, Math.floor(Number(parsed.etaPickupMinutes))) : defaultSettings.etaPickupMinutes,
      etaDeliveryMinutes: Number.isFinite(Number(parsed.etaDeliveryMinutes)) ? Math.max(1, Math.floor(Number(parsed.etaDeliveryMinutes))) : defaultSettings.etaDeliveryMinutes,
      ownerPin: String(parsed.ownerPin ?? '').trim(),
    }
  } catch {
    return { ...defaultSettings }
  }
}

export function saveSettings(settings, { user = 'owner', storeId = currentStoreId(), audit = true } = {}) {
  localStorage.setItem(key(storeId), JSON.stringify(settings))
  window.dispatchEvent(new Event('settings-updated'))
  if (audit) logAudit({ storeId, user, action: 'settings_updated', entity: 'settings', entityId: storeId })
}
