import { getCart, getCartTotal, formatCurrency, clearCart } from './cart.js'

const STORAGE_KEY = 'comidasgo-orders'

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function getOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  window.dispatchEvent(new Event('orders-updated'))
}

export function createOrderFromCart() {
  const cart = getCart()
  if (!cart.items.length) return null
  const total = getCartTotal()
  const order = {
    id: createId(),
    createdAt: new Date().toISOString(),
    status: 'Recibido',
    items: cart.items.map((item) => ({ ...item })),
    total,
    totalText: formatCurrency(total),
  }
  const orders = [order, ...getOrders()]
  saveOrders(orders)
  clearCart()
  return order
}
