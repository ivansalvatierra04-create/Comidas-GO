import { storeKey } from './storeScope.js'

function key(storeId) { return storeKey('promotions', storeId) }

export const defaultPromotions = [
  { id: '1', title: 'Promo Hamburguesa', description: 'Hamburguesa con papas', discount: '20% OFF', image: '' },
  { id: '2', title: 'Promo Pizza', description: 'Pizza grande muzzarella', discount: '2x1', image: '' },
]

export function getPromotions(storeId) {
  try {
    const raw = localStorage.getItem(key(storeId))
    if (!raw) return defaultPromotions
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return defaultPromotions
    return parsed.map((promo, index) => ({
      id: promo.id || String(index + 1),
      title: promo.title || 'Promoción',
      description: promo.description || '',
      discount: promo.discount || '',
      image: promo.image || '',
    }))
  } catch {
    return defaultPromotions
  }
}

export function savePromotions(promotions, storeId) {
  localStorage.setItem(key(storeId), JSON.stringify(promotions))
  window.dispatchEvent(new Event('promotions-updated'))
}
