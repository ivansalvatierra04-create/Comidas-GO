import { logAudit } from '../platform/audit.js'
import { storeKey, currentStoreId } from './storeScope.js'

function key(storeId) {
  return storeKey('categories', storeId)
}

function createItem(id, name, description, price, image, discount = '', stock = null, extras = [], removables = []) {
  return { id, name, description, price, image, discount, stock, extras, removables }
}

export const defaultCategories = [
  {
    id: '1',
    name: 'Pizzas',
    icon: '🍕',
    image: '',
    items: [
      createItem('1-1', 'Pizza Muzzarella', 'Salsa de tomate, muzzarella y orégano.', '$8.500', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80', '', null,
        [{ id: '1-1-ex-1', name: 'Queso extra', price: 800 }, { id: '1-1-ex-2', name: 'Aceitunas', price: 500 }],
        [{ id: '1-1-rm-1', name: 'Orégano' }, { id: '1-1-rm-2', name: 'Salsa de tomate' }]
      ),
    ],
  },
]

function normalizeStock(value) {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return Math.max(0, Math.floor(n))
}

function normalizeModifierPrice(value) {
  const n = Number(String(value ?? '').replace(/[^0-9.-]/g, ''))
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.round(n))
}

function normalizeExtras(extras, itemId) {
  if (!Array.isArray(extras)) return []
  return extras.map((ex, i) => ({
    id: ex?.id || `${itemId}-ex-${i + 1}`,
    name: String(ex?.name || '').trim(),
    price: normalizeModifierPrice(ex?.price),
  })).filter((ex) => ex.name)
}

function normalizeRemovables(removables, itemId) {
  if (!Array.isArray(removables)) return []
  return removables.map((rm, i) => ({
    id: rm?.id || `${itemId}-rm-${i + 1}`,
    name: String(rm?.name || '').trim(),
  })).filter((rm) => rm.name)
}

function normalizeItem(item, catId, index) {
  const id = item?.id || `${catId}-${index + 1}`
  return {
    id,
    name: item?.name || 'Sin nombre',
    description: item?.description || '',
    price: item?.price || '',
    image: item?.image || '',
    discount: item?.discount || '',
    stock: normalizeStock(item?.stock),
    extras: normalizeExtras(item?.extras, id),
    removables: normalizeRemovables(item?.removables, id),
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

export function getCategories(storeId) {
  try {
    const raw = localStorage.getItem(key(storeId))
    if (!raw) return defaultCategories
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return defaultCategories
    if (parsed.length === 0) return defaultCategories
    return parsed.map((cat, index) => normalizeCategory(cat, index))
  } catch {
    return defaultCategories
  }
}

export function saveCategories(categories, { user = 'owner', storeId = currentStoreId(), audit = true } = {}) {
  localStorage.setItem(key(storeId), JSON.stringify(categories))
  window.dispatchEvent(new Event('categories-updated'))
  if (audit) {
    logAudit({ storeId, user, action: 'catalog_updated', entity: 'categories', entityId: storeId, details: { categories: categories.length } })
  }
}

export function getCategoryById(id, storeId) {
  return getCategories(storeId).find((cat) => String(cat.id) === String(id)) || null
}

export function getItemById(categoryId, itemId, storeId) {
  const category = getCategoryById(categoryId, storeId)
  if (!category) return { category: null, item: null }
  const item = (category.items || []).find((it) => String(it.id) === String(itemId)) || null
  return { category, item }
}

export function getItemStock(item) {
  if (!item) return null
  const stock = item.stock
  if (stock === '' || stock === null || stock === undefined) return null
  const n = Number(stock)
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : null
}

export function getAvailableStock(categoryId, itemId, storeId) {
  const { item } = getItemById(categoryId, itemId, storeId)
  if (!item) return 0
  return getItemStock(item)
}

export function decreaseStockForOrder(orderItems, { user = 'system', storeId = currentStoreId() } = {}) {
  if (!Array.isArray(orderItems) || orderItems.length === 0) return
  const categories = getCategories(storeId).map((cat) => ({
    ...cat,
    items: (cat.items || []).map((item) => ({ ...item })),
  }))
  let changed = false
  orderItems.forEach((orderItem) => {
    const cat = categories.find((c) => String(c.id) === String(orderItem.categoryId))
    if (!cat) return
    const item = (cat.items || []).find((i) => String(i.id) === String(orderItem.itemId))
    if (!item) return
    const stock = getItemStock(item)
    if (stock === null) return
    item.stock = Math.max(0, stock - (Number(orderItem.quantity) || 0))
    changed = true
  })
  if (changed) {
    localStorage.setItem(key(storeId), JSON.stringify(categories))
    window.dispatchEvent(new Event('categories-updated'))
    logAudit({ storeId, user, action: 'stock_updated', entity: 'categories', entityId: storeId, details: { reason: 'order' } })
  }
}
