const STORAGE_KEY = 'comidasgo-promotions'

export const defaultPromotions = [
  {
    id: '1',
    title: 'Promo Hamburguesa',
    description: 'Hamburguesa con papas',
    discount: '20% OFF',
    image: '',
  },
  {
    id: '2',
    title: 'Promo Pizza',
    description: 'Pizza grande muzzarella',
    discount: '2x1',
    image: '',
  },
]

export function getPromotions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
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

export function savePromotions(promotions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(promotions))
}
