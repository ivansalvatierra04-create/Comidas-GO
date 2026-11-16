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

export function createOrderFromCart(details = {}) {
  const cart = getCart()
  if (!cart.items.length) return null
  const total = getCartTotal()
  const order = {
    id: createId(),
    createdAt: new Date().toISOString(),
    status: 'Pendiente',
    items: cart.items.map((item) => ({ ...item })),
    total,
    totalText: formatCurrency(total),
    customer: {
      name: details.customerName || '',
      phone: details.customerPhone || '',
      deliveryType: details.deliveryType || '',
      address: details.address || '',
      notes: details.notes || '',
    },
    payment: {
      method: details.paymentMethod || '',
      methodLabel: details.paymentMethodLabel || '',
      info: details.paymentInfo || '',
    },
  }
  const orders = [order, ...getOrders()]
  saveOrders(orders)
  clearCart()
  return order
}

export function buildOrderMessage(order, storeName = '') {
  const lines = []
  lines.push(`*Nuevo pedido${storeName ? ` - ${storeName}` : ''}*`)
  lines.push(`Pedido: #${String(order.id).slice(-5)}`)
  lines.push(`Fecha: ${new Date(order.createdAt).toLocaleString('es-AR')}`)
  lines.push('')
  lines.push('*Detalle:*')
  order.items.forEach((item) => {
    lines.push(`- ${item.quantity} x ${item.name} (${item.price || formatCurrency(item.priceValue)})`)
  })
  lines.push('')
  lines.push(`*Total:* ${order.totalText || formatCurrency(order.total)}`)
  if (order.customer?.name || order.customer?.phone || order.customer?.address || order.customer?.deliveryType) {
    lines.push('')
    lines.push('*Cliente:*')
    if (order.customer.name) lines.push(`Nombre: ${order.customer.name}`)
    if (order.customer.phone) lines.push(`Teléfono: ${order.customer.phone}`)
    if (order.customer.deliveryType) lines.push(`Entrega: ${order.customer.deliveryType}`)
    if (order.customer.address) lines.push(`Dirección: ${order.customer.address}`)
    if (order.customer.notes) lines.push(`Notas: ${order.customer.notes}`)
  }
  if (order.payment?.methodLabel) {
    lines.push('')
    lines.push(`*Forma de pago:* ${order.payment.methodLabel}`)
    if (order.payment.info) lines.push(order.payment.info)
  }
  return lines.join('\n')
}
