const STORAGE_KEY = 'comidasgo-categories'

function createItem(id, name, description, price, image, discount = '') {
  return { id, name, description, price, image, discount }
}

export const defaultCategories = [
  {
    id: '1',
    name: 'Pizzas',
    icon: '🍕',
    image: '',
    items: [
      createItem('1-1', 'Pizza Muzzarella', 'Salsa de tomate, muzzarella y orégano.', '$8.500', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80'),
      createItem('1-2', 'Pizza Napolitana', 'Muzzarella, tomate en rodajas y ajo.', '$9.200', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=80', '10% OFF'),
      createItem('1-3', 'Pizza Pepperoni', 'Muzzarella y pepperoni crocante.', '$9.800', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=1200&q=80'),
    ],
  },
  {
    id: '2',
    name: 'Hamburguesas',
    icon: '🍔',
    image: '',
    items: [
      createItem('2-1', 'Burger Clásica', 'Carne, lechuga, tomate y queso cheddar.', '$7.900', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80'),
      createItem('2-2', 'Burger Doble', 'Doble carne, doble queso y salsa especial.', '$10.500', 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=1200&q=80', '15% OFF'),
      createItem('2-3', 'Burger Bacon', 'Carne, queso, bacon y cebolla crocante.', '$9.900', 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=1200&q=80'),
    ],
  },
  {
    id: '3',
    name: 'Empanadas',
    icon: '🥟',
    image: '',
    items: [
      createItem('3-1', 'Empanada de Carne', 'Carne suave, huevo y especias.', '$1.200', 'https://images.unsplash.com/photo-1609525313344-a56b96f20721?auto=format&fit=crop&w=1200&q=80'),
      createItem('3-2', 'Empanada JyQ', 'Jamón y queso bien cremoso.', '$1.200', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'),
    ],
  },
  {
    id: '4',
    name: 'Bebidas',
    icon: '🥤',
    image: '',
    items: [
      createItem('4-1', 'Gaseosa 500ml', 'Línea cola, naranja o lima.', '$1.800', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=1200&q=80'),
      createItem('4-2', 'Agua saborizada', 'Pomelo, naranja o manzana.', '$1.600', 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&q=80'),
    ],
  },
  {
    id: '5',
    name: 'Postres',
    icon: '🍰',
    image: '',
    items: [
      createItem('5-1', 'Cheesecake', 'Base crocante con crema y frutos rojos.', '$4.500', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1200&q=80'),
      createItem('5-2', 'Brownie con helado', 'Brownie tibio con bocha de vainilla.', '$4.900', 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=1200&q=80', 'Promo'),
    ],
  },
]

function normalizeItem(item, catId, index) {
  return {
    id: item?.id || `${catId}-${index + 1}`,
    name: item?.name || 'Sin nombre',
    description: item?.description || '',
    price: item?.price || '',
    image: item?.image || '',
    discount: item?.discount || '',
  }
}

function normalizeCategory(cat, index) {
  const id = cat?.id || String(index + 1)
  const rawItems = Array.isArray(cat?.items) ? cat.items : []
  return {
    id,
    name: cat?.name || 'Sin nombre',
    icon: cat?.icon || '🍽️',
    image: cat?.image || '',
    items: rawItems.map((item, i) => normalizeItem(item, id, i)),
  }
}

export function getCategories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultCategories
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return defaultCategories
    if (parsed.length === 0) return defaultCategories
    return parsed.map((cat, index) => normalizeCategory(cat, index))
  } catch {
    return defaultCategories
  }
}

export function saveCategories(categories) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
}

export function getCategoryById(id) {
  return getCategories().find((cat) => String(cat.id) === String(id)) || null
}

export function getItemById(categoryId, itemId) {
  const category = getCategoryById(categoryId)
  if (!category) return { category: null, item: null }
  const item = (category.items || []).find((it) => String(it.id) === String(itemId)) || null
  return { category, item }
}
