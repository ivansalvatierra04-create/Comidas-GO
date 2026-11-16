const STORAGE_KEY = 'comidasgo-coupons'

export const defaultCoupons = []

export function getCoupons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultCoupons
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : defaultCoupons
  } catch {
    return defaultCoupons
  }
}

export function saveCoupons(coupons) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons))
  window.dispatchEvent(new Event('coupons-updated'))
}

export function normalizeCoupon(c, index = 0) {
  const type = c?.type === 'fixed' ? 'fixed' : 'percent'
  const value = Math.max(0, Number(c?.value) || 0)
  return {
    id: c?.id || String(index + 1),
    code: String(c?.code || '').trim().toUpperCase(),
    title: String(c?.title || '').trim() || 'Cupón',
    description: String(c?.description || '').trim(),
    type,
    value,
    active: c?.active !== false,
  }
}

export function findCouponByCode(code) {
  const clean = String(code || '').trim().toUpperCase()
  if (!clean) return null
  return getCoupons().map(normalizeCoupon).find((c) => c.active && c.code === clean) || null
}

export function calculateDiscount(subtotal, coupon) {
  const sub = Math.max(0, Number(subtotal) || 0)
  if (!coupon) return 0
  if (coupon.type === 'fixed') return Math.min(sub, Math.max(0, Number(coupon.value) || 0))
  const pct = Math.max(0, Number(coupon.value) || 0)
  return Math.min(sub, Math.round(sub * (pct / 100)))
}
