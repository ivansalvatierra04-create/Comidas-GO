import { storeKey } from './storeScope.js'

function key(storeId) { return storeKey('slides', storeId) }

export const defaultSlides = [
  { id: '1', title: 'Promos del día', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80' },
  { id: '2', title: 'Hamburguesas', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80' },
  { id: '3', title: 'Pizzas y más', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80' },
]

export function getSlides(storeId) {
  try {
    const raw = localStorage.getItem(key(storeId))
    if (!raw) return defaultSlides
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultSlides
    return parsed.map((slide, index) => ({
      id: slide.id || String(index + 1),
      title: slide.title || 'Sin nombre',
      image: slide.image || '',
    }))
  } catch {
    return defaultSlides
  }
}

export function saveSlides(slides, storeId) {
  localStorage.setItem(key(storeId), JSON.stringify(slides))
  window.dispatchEvent(new Event('slides-updated'))
}
