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

export function createOrderFromCart(details = {}, cartSnapshot = null) {
  const sourceItems = Array.isArray(cartSnapshot?.items) ? cartSnapshot.items : getCart().items
  if (!sourceItems.length) return null
  const total = Array.isArray(cartSnapshot?.items)
    ? sourceItems.reduce((sum, item) => sum + (Number(item.priceValue) || 0) * (Number(item.quantity) || 0), 0)
    : getCartTotal()
  const discount = Math.max(0, Number(details.discountAmount) || 0)
  const finalTotal = Math.max(0, Number(details.finalTotal ?? (total - discount)) || 0)
  const order = {
    id: createId(),
    createdAt: new Date().toISOString(),
    status: 'Pendiente',
    items: sourceItems.map((item) => ({ ...item })),
    subtotal: total,
    subtotalText: formatCurrency(total),
    discount: discount,
    discountText: formatCurrency(discount),
    total: finalTotal,
    totalText: formatCurrency(finalTotal),
    coupon: details.coupon ? {
      code: details.coupon.code || '',
      title: details.coupon.title || '',
      type: details.coupon.type || '',
      value: details.coupon.value || 0,
    } : null,
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
    estimate: {
      minutes: details.etaMinutes ?? null,
      at: details.etaAt || '',
      label: details.etaLabel || '',
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
  if (order.discount > 0) {
    lines.push(`*Subtotal:* ${order.subtotalText || formatCurrency(order.subtotal || order.total)}`)
    lines.push(`*Cupón${order.coupon?.code ? ` (${order.coupon.code})` : ''}:* -${order.discountText || formatCurrency(order.discount)}`)
  }
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
  if (order.estimate?.label || order.estimate?.at) {
    lines.push('')
    lines.push(`*Tiempo estimado:* ${order.estimate.label || new Date(order.estimate.at).toLocaleString('es-AR')}`)
  }
  return lines.join('\n')
}
