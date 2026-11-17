import { storeKey } from './storeScope.js'

function key() {
  return storeKey('cart')
}

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

function normalizeModifiers(modifiers) {
  const extras = Array.isArray(modifiers?.extras)
    ? modifiers.extras.map((e) => ({ id: String(e?.id || ''), name: String(e?.name || '').trim(), price: Math.max(0, Number(e?.price) || 0) })).filter((e) => e.name).sort((a, b) => a.id.localeCompare(b.id) || a.name.localeCompare(b.name))
    : []
  const removed = Array.isArray(modifiers?.removed)
    ? modifiers.removed.map((r) => ({ id: String(r?.id || ''), name: String(r?.name || '').trim() })).filter((r) => r.name).sort((a, b) => a.id.localeCompare(b.id) || a.name.localeCompare(b.name))
    : []
  return { extras, removed }
}

export function getModifiersKey(modifiers) {
  const m = normalizeModifiers(modifiers)
  const ex = m.extras.map((e) => `${e.id}:${e.price}`).join(',')
  const rm = m.removed.map((r) => r.id).join(',')
  return `ex=${ex}|rm=${rm}`
}

export function getLineId(categoryId, itemId, modifiers) {
  return `${String(categoryId)}::${String(itemId)}::${getModifiersKey(modifiers)}`
}

function normalizeCartItem(item) {
  const modifiers = normalizeModifiers(item?.modifiers)
  const lineId = item?.lineId || getLineId(item?.categoryId, item?.itemId, modifiers)
  return {
    ...item,
    lineId,
    quantity: Math.max(1, Number(item?.quantity) || 1),
    priceValue: Number(item?.priceValue) || parsePriceValue(item?.price),
    modifiers,
  }
}

export function getCart(storeId) {
  try {
    const raw = localStorage.getItem(storeKey('cart', storeId))
    if (!raw) return { items: [], couponCode: '' }
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.items)) return { items: [], couponCode: '' }
    return {
      items: parsed.items.map(normalizeCartItem),
      couponCode: String(parsed.couponCode || '').trim().toUpperCase(),
    }
  } catch {
    return { items: [], couponCode: '' }
  }
}

export function saveCart(cart, storeId) {
  localStorage.setItem(storeKey('cart', storeId), JSON.stringify(cart))
  window.dispatchEvent(new Event('cart-updated'))
}

export function getCartCount() {
  return getCart().items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
}

export function getCartTotal() {
  return getCart().items.reduce((sum, item) => sum + (Number(item.priceValue) || 0) * (Number(item.quantity) || 0), 0)
}

export function getCartItemQtyForProduct(categoryId, itemId) {
  return getCart().items
    .filter((item) => String(item.itemId) === String(itemId) && String(item.categoryId) === String(categoryId))
    .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
}

export function addToCart(product, quantity = 1, maxQuantity = null) {
  const cart = getCart()
  let qty = Math.max(1, Number(quantity) || 1)
  const modifiers = normalizeModifiers(product.modifiers)
  const lineId = product.lineId || getLineId(product.categoryId, product.itemId, modifiers)
  const idx = cart.items.findIndex((item) => item.lineId === lineId)
  const currentLineQty = idx >= 0 ? (Number(cart.items[idx].quantity) || 0) : 0
  const totalForProduct = getCartItemQtyForProduct(product.categoryId, product.itemId)

  if (maxQuantity !== null && maxQuantity !== undefined && maxQuantity !== '') {
    const max = Math.max(0, Number(maxQuantity) || 0)
    qty = Math.min(qty, Math.max(0, max - totalForProduct))
  }
  if (qty <= 0) return { cart, added: 0 }

  if (idx >= 0) {
    cart.items[idx].quantity = currentLineQty + qty
  } else {
    cart.items.push({
      lineId,
      itemId: product.itemId,
      categoryId: product.categoryId,
      name: product.name || 'Producto',
      price: product.price || '',
      priceValue: Number(product.priceValue) || parsePriceValue(product.price),
      image: product.image || '',
      discount: product.discount || '',
      quantity: qty,
      modifiers,
    })
  }
  saveCart(cart)
  return { cart, added: qty }
}

export function updateCartItemQuantity(lineId, quantity, maxQuantityForProduct = null) {
  const cart = getCart()
  const idx = cart.items.findIndex((item) => item.lineId === lineId)
  if (idx < 0) return cart
  let qty = Number(quantity)
  if (maxQuantityForProduct !== null && maxQuantityForProduct !== undefined && maxQuantityForProduct !== '') {
    const target = cart.items[idx]
    const others = cart.items
      .filter((item) => item.lineId !== lineId && String(item.itemId) === String(target.itemId) && String(item.categoryId) === String(target.categoryId))
      .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
    const max = Math.max(0, Number(maxQuantityForProduct) || 0)
    qty = Math.min(qty, Math.max(0, max - others))
  }
  if (qty > 0) cart.items[idx].quantity = qty
  else cart.items.splice(idx, 1)
  cart.items = cart.items.filter((item) => (Number(item.quantity) || 0) > 0)
  saveCart(cart)
  return cart
}

export function updateCartItemModifiers(lineId, { modifiers, price, priceValue }) {
  const cart = getCart()
  const idx = cart.items.findIndex((item) => item.lineId === lineId)
  if (idx < 0) return cart
  const current = cart.items[idx]
  const newModifiers = normalizeModifiers(modifiers)
  const newLineId = getLineId(current.categoryId, current.itemId, newModifiers)
  if (newLineId === lineId) {
    current.modifiers = newModifiers
    if (price !== undefined) current.price = price
    if (priceValue !== undefined) current.priceValue = Number(priceValue) || parsePriceValue(price)
    saveCart(cart)
    return cart
  }
  const existingIdx = cart.items.findIndex((item) => item.lineId === newLineId)
  if (existingIdx >= 0) {
    cart.items[existingIdx].quantity += Number(current.quantity) || 0
    cart.items.splice(idx, 1)
  } else {
    cart.items[idx] = {
      ...current,
      lineId: newLineId,
      modifiers: newModifiers,
      price: price !== undefined ? price : current.price,
      priceValue: priceValue !== undefined ? (Number(priceValue) || parsePriceValue(price)) : current.priceValue,
    }
  }
  saveCart(cart)
  return cart
}

export function removeFromCart(lineId) {
  const cart = getCart()
  cart.items = cart.items.filter((item) => item.lineId !== lineId)
  saveCart(cart)
  return cart
}

export function setCartCoupon(code) {
  const cart = getCart()
  cart.couponCode = String(code || '').trim().toUpperCase()
  saveCart(cart)
  return cart
}

export function clearCart() {
  saveCart({ items: [], couponCode: '' })
}
