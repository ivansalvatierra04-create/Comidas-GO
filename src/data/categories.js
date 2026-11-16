const STORAGE_KEY = 'comidasgo-categories'

export const defaultCategories = [
  { id: '1', name: 'Pizzas', icon: '🍕', image: '' },
  { id: '2', name: 'Hamburguesas', icon: '🍔', image: '' },
  { id: '3', name: 'Empanadas', icon: '🥟', image: '' },
  { id: '4', name: 'Bebidas', icon: '🥤', image: '' },
  { id: '5', name: 'Postres', icon: '🍰', image: '' },
]

export function getCategories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultCategories
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return defaultCategories
    return parsed.map((cat, index) => ({
      id: cat.id || String(index + 1),
      name: cat.name || 'Sin nombre',
      icon: cat.icon || '🍽️',
      image: cat.image || '',
    }))
  } catch {
    return defaultCategories
  }
}

export function saveCategories(categories) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
}
