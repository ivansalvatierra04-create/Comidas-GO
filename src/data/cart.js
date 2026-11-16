const STORAGE_KEY = 'comidasgo-cart'

export function parsePriceValue(price) {
  if (typeof price === 'number') return price
  if (!price) return 0
  const digits = String(price).replace(/[^0-9]/g, '')
  return digits ? Number(digits) : 0
}

export function formatCurrency(value) {
  const n = Number(value) || 0
  return `$${n.toLocaleString('es-AR')}`
}

export function getCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [] }
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.items)) return { items: [] }
    return {
      items: parsed.items.map((item) => ({
        ...item,
        quantity: Math.max(1, Number(item.quantity) || 1),
        priceValue: Number(item.priceValue) || parsePriceValue(item.price),
      })),
    }
  } catch {
    return { items: [] }
  }
}

export function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  window.dispatchEvent(new Event('cart-updated'))
}

export function getCartCount() {
  return getCart().items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
}

export function getCartTotal() {
  return getCart().items.reduce((sum, item) => sum + (Number(item.priceValue) || 0) * (Number(item.quantity) || 0), 0)
}

export function addToCart(product, quantity = 1, maxQuantity = null) {
  const cart = getCart()
  let qty = Math.max(1, Number(quantity) || 1)
  const idx = cart.items.findIndex(
    (item) => String(item.itemId) === String(product.itemId) && String(item.categoryId) === String(product.categoryId),
  )
  const currentQty = idx >= 0 ? (Number(cart.items[idx].quantity) || 0) : 0
  if (maxQuantity !== null && maxQuantity !== undefined && maxQuantity !== '') {
    const max = Math.max(0, Number(maxQuantity) || 0)
    qty = Math.min(qty, Math.max(0, max - currentQty))
  }
  if (qty <= 0) return cart
  if (idx >= 0) {
    cart.items[idx].quantity = currentQty + qty
  } else {
    cart.items.push({
      itemId: product.itemId,
      categoryId: product.categoryId,
      name: product.name || 'Producto',
      price: product.price || '',
      priceValue: Number(product.priceValue) || parsePriceValue(product.price),
      image: product.image || '',
      discount: product.discount || '',
      quantity: qty,
    })
  }
  saveCart(cart)
  return cart
}

export function updateCartItemQuantity(itemId, categoryId, quantity, maxQuantity = null) {
  const cart = getCart()
  let qty = Number(quantity)
  if (maxQuantity !== null && maxQuantity !== undefined && maxQuantity !== '') {
    const max = Math.max(0, Number(maxQuantity) || 0)
    qty = Math.min(qty, max)
  }
  cart.items = cart.items
    .map((item) =>
      String(item.itemId) === String(itemId) && String(item.categoryId) === String(categoryId)
        ? { ...item, quantity: qty }
        : item,
    )
    .filter((item) => (Number(item.quantity) || 0) > 0)
  saveCart(cart)
  return cart
}

export function removeFromCart(itemId, categoryId) {
  const cart = getCart()
  cart.items = cart.items.filter(
    (item) => !(String(item.itemId) === String(itemId) && String(item.categoryId) === String(categoryId)),
  )
  saveCart(cart)
  return cart
}

export function clearCart() {
  saveCart({ items: [] })
}
