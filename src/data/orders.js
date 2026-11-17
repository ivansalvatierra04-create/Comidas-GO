import { logAudit } from '../platform/audit.js'
import { assertStoreOperational } from '../platform/tenant.js'
import { nextSaleCode } from '../platform/sales.js'
import { getCart, getCartTotal, formatCurrency, clearCart } from './cart.js'
import { storeKey, currentStoreId } from './storeScope.js'

function key() {
  return storeKey('orders')
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function getOrders(storeId) {
  try {
    const raw = localStorage.getItem(storeKey('orders', storeId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveOrders(orders, storeId) {
  localStorage.setItem(storeKey('orders', storeId), JSON.stringify(orders))
  window.dispatchEvent(new Event('orders-updated'))
}

export function createOrderFromCart(details = {}, cartSnapshot = null) {
  const storeId = currentStoreId()
  const license = assertStoreOperational(storeId)
  if (!license.ok) {
    const err = new Error(license.reason || 'Licencia no operativa')
    err.code = 'LICENSE_BLOCKED'
    throw err
  }

  const sourceItems = Array.isArray(cartSnapshot?.items) ? cartSnapshot.items : getCart().items
  if (!sourceItems.length) return null
  const total = Array.isArray(cartSnapshot?.items)
    ? sourceItems.reduce((sum, item) => sum + (Number(item.priceValue) || 0) * (Number(item.quantity) || 0), 0)
    : getCartTotal()
  const { code: saleCode } = nextSaleCode(storeId)
  const order = {
    id: createId(),
    saleCode,
    storeId,
    createdAt: new Date().toISOString(),
    status: 'Pendiente',
    // ventas anuladas se conservan en historial (no se eliminan ni se reutiliza saleCode)
    annulled: false,
    user: details.user || 'cliente',
    items: sourceItems.map((item) => ({ ...item })),
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
    estimate: {
      minutes: details.etaMinutes ?? null,
      at: details.etaAt || '',
      label: details.etaLabel || '',
    },
  }
  const orders = [order, ...getOrders(storeId)]
  saveOrders(orders, storeId)
  clearCart()
  logAudit({ storeId, user: order.user, action: 'sale_created', entity: 'sale', entityId: order.id, details: { saleCode, total: order.total, payment: order.payment?.method, items: order.items.length } })
  return order
}

export function annulOrder(orderId, { user = 'owner', reason = '' } = {}) {
  const storeId = currentStoreId()
  const orders = getOrders(storeId)
  const idx = orders.findIndex((o) => String(o.id) === String(orderId))
  if (idx < 0) return null
  if (orders[idx].annulled) return orders[idx]
  orders[idx] = { ...orders[idx], annulled: true, status: 'Anulada', annulledAt: new Date().toISOString(), annulReason: reason }
  saveOrders(orders, storeId)
  logAudit({ storeId, user, action: 'sale_annulled', entity: 'sale', entityId: orders[idx].id, details: { saleCode: orders[idx].saleCode, reason } })
  return orders[idx]
}

export function findOrderBySaleCode(code, storeId = currentStoreId()) {
  const q = String(code || '').trim().toUpperCase()
  if (!q) return null
  return getOrders(storeId).find((o) => String(o.saleCode || '').toUpperCase() === q || String(o.id) === q) || null
}

export function buildOrderMessage(order, storeName = '') {
  const lines = []
  lines.push(`*Nuevo pedido${storeName ? ` - ${storeName}` : ''}*`)
  lines.push(`Venta: ${order.saleCode || `#${String(order.id).slice(-5)}`}`)
  lines.push(`Fecha: ${new Date(order.createdAt).toLocaleString('es-AR')}`)
  lines.push('')
  lines.push('*Detalle:*')
  order.items.forEach((item) => {
    lines.push(`- ${item.quantity} x ${item.name} (${item.price || formatCurrency(item.priceValue)})`)
    const extras = item.modifiers?.extras || []
    const removed = item.modifiers?.removed || []
    if (extras.length) lines.push(`  + Agregados: ${extras.map((e) => e.name).join(', ')}`)
    if (removed.length) lines.push(`  - Sin: ${removed.map((r) => r.name).join(', ')}`)
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
  if (order.estimate?.label || order.estimate?.at) {
    lines.push('')
    lines.push(`*Tiempo estimado:* ${order.estimate.label || new Date(order.estimate.at).toLocaleString('es-AR')}`)
  }
  return lines.join('\n')
}
