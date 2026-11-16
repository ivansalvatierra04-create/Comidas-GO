import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'
import { getCurrentUser } from '../data/auth.js'
import { formatCurrency, getCart, getCartTotal, removeFromCart, setCartCoupon, updateCartItemQuantity } from '../data/cart.js'
import { decreaseStockForOrder, getItemById, getItemStock } from '../data/categories.js'
import { calculateDiscount, findCouponByCode } from '../data/coupons.js'
import { buildOrderMessage, createOrderFromCart } from '../data/orders.js'
import { getSettings } from '../data/settings.js'

function sanitizeWhatsApp(phone) {
  return String(phone || '').replace(/[^0-9]/g, '')
}

function Carrito() {
  const [cart, setCart] = useState(() => getCart())
  const [settings, setSettings] = useState(() => getSettings())
  const [user, setUser] = useState(() => getCurrentUser())
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryType, setDeliveryType] = useState('Retiro en local')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [couponInput, setCouponInput] = useState('')
  const [couponMsg, setCouponMsg] = useState('')
  const [error, setError] = useState('')
  const [confirmedOrder, setConfirmedOrder] = useState(null)

  useEffect(() => {
    const sync = () => setCart(getCart())
    const syncSettings = () => setSettings(getSettings())
    const syncAuth = () => setUser(getCurrentUser())
    window.addEventListener('storage', sync)
    window.addEventListener('cart-updated', sync)
    window.addEventListener('storage', syncSettings)
    window.addEventListener('settings-updated', syncSettings)
    window.addEventListener('storage', syncAuth)
    window.addEventListener('auth-updated', syncAuth)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('cart-updated', sync)
      window.removeEventListener('storage', syncSettings)
      window.removeEventListener('settings-updated', syncSettings)
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener('auth-updated', syncAuth)
    }
  }, [])

  useEffect(() => {
    if (user && !customerName && user.name) setCustomerName(user.name)
    if (user && !customerPhone && user.phone) setCustomerPhone(user.phone)
  }, [user])

  const subtotal = getCartTotal()
  const appliedCoupon = user && cart.couponCode ? findCouponByCode(cart.couponCode) : null
  const discount = appliedCoupon ? calculateDiscount(subtotal, appliedCoupon) : 0
  const total = Math.max(0, subtotal - discount)

  const paymentOptions = useMemo(() => ({
    efectivo: { label: 'Efectivo', info: settings.paymentCashInfo || 'Pago en efectivo.' },
    transferencia: { label: 'Transferencia', info: settings.paymentTransferInfo || 'Solicitar alias/CBU al local.' },
    mercadopago: { label: 'Mercado Pago (link)', info: settings.paymentMpLink || 'Solicitar link de pago al local.' },
  }), [settings])

  const selectedPayment = paymentOptions[paymentMethod]

  const handleConfirm = () => {
    setError('')
    if (!cart.items.length) return
    if (!customerName.trim()) {
      setError('Ingresá tu nombre.')
      return
    }
    if (!customerPhone.trim()) {
      setError('Ingresá tu teléfono.')
      return
    }
    if (deliveryType === 'Envío a domicilio' && !address.trim()) {
      setError('Ingresá la dirección para el envío.')
      return
    }

    for (const item of cart.items) {
      const { item: liveItem } = getItemById(item.categoryId, item.itemId)
      if (!liveItem) {
        setError(`El producto "${item.name}" ya no está disponible.`)
        return
      }
      const stock = getItemStock(liveItem)
      if (stock !== null && item.quantity > stock) {
        setError(`No hay stock suficiente de "${item.name}". Disponible: ${stock}.`)
        return
      }
    }

    const etaMinutes = deliveryType === 'Envío a domicilio'
      ? (Number(settings.etaDeliveryMinutes) || 40)
      : (Number(settings.etaPickupMinutes) || 20)
    const etaAtDate = new Date(Date.now() + etaMinutes * 60 * 1000)
    const etaLabel = deliveryType === 'Envío a domicilio'
      ? `Llega aprox. en ${etaMinutes} min (${etaAtDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })})`
      : `Listo para retirar aprox. en ${etaMinutes} min (${etaAtDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })})`

    const snapshotItems = getCart().items.map((i) => ({ ...i }))
    const order = createOrderFromCart({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryType,
      address: address.trim(),
      notes: notes.trim(),
      paymentMethod,
      paymentMethodLabel: selectedPayment.label,
      paymentInfo: selectedPayment.info,
      etaMinutes,
      etaAt: etaAtDate.toISOString(),
      etaLabel,
      discountAmount: discount,
      finalTotal: total,
      coupon: appliedCoupon ? { code: appliedCoupon.code, title: appliedCoupon.title, type: appliedCoupon.type, value: appliedCoupon.value } : null,
    }, { items: snapshotItems })

    if (order) {
      decreaseStockForOrder(snapshotItems)
      setConfirmedOrder(order)
    }
  }

  if (confirmedOrder) {
    const storeName = `${settings.storeName1 || ''} ${settings.storeName2 || ''}`.trim()
    const message = buildOrderMessage(confirmedOrder, storeName)
    const waNumber = sanitizeWhatsApp(settings.whatsapp || settings.phone)
    const waLink = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}` : ''

    return (
      <div className="principal">
        <Header />
        <main className="principal-content with-footer">
          <section className="checkout-ticket">
            <h1>Pedido confirmado</h1>
            <p className="ticket-sub">Comprobante para el cliente</p>
            <div className="ticket-box">
              <p><strong>Pedido:</strong> #{String(confirmedOrder.id).slice(-5)}</p>
              <p><strong>Fecha:</strong> {new Date(confirmedOrder.createdAt).toLocaleString('es-AR')}</p>
              <p><strong>Estado:</strong> {confirmedOrder.status}</p>
              <hr />
              {confirmedOrder.items.map((item, i) => (
                <div key={`${confirmedOrder.id}-${item.itemId}-${i}`} className="ticket-line">
                  <span>{item.quantity} x {item.name}</span>
                  <span>{item.price || formatCurrency(item.priceValue)}</span>
                </div>
              ))}
              <hr />
              {confirmedOrder.discount > 0 && (
                <>
                  <div className="ticket-line"><span>Subtotal</span><span>{confirmedOrder.subtotalText}</span></div>
                  <div className="ticket-line"><span>Cupón{confirmedOrder.coupon?.code ? ` (${confirmedOrder.coupon.code})` : ''}</span><span>-{confirmedOrder.discountText}</span></div>
                </>
              )}
              <div className="ticket-line total"><span>Total</span><strong>{confirmedOrder.totalText}</strong></div>
              <hr />
              <p><strong>Cliente:</strong> {confirmedOrder.customer.name} ({confirmedOrder.customer.phone})</p>
              <p><strong>Entrega:</strong> {confirmedOrder.customer.deliveryType}</p>
              {confirmedOrder.customer.address && <p><strong>Dirección:</strong> {confirmedOrder.customer.address}</p>}
              {confirmedOrder.customer.notes && <p><strong>Notas:</strong> {confirmedOrder.customer.notes}</p>}
              <p><strong>Pago:</strong> {confirmedOrder.payment.methodLabel}</p>
              {confirmedOrder.payment.info && <p className="ticket-info">{confirmedOrder.payment.info}</p>}
              {confirmedOrder.estimate?.label && (
                <>
                  <hr />
                  <p className="ticket-eta"><strong>Tiempo estimado:</strong> {confirmedOrder.estimate.label}</p>
                </>
              )}
            </div>

            <div className="ticket-actions">
              {waLink ? (
                <a href={waLink} target="_blank" rel="noreferrer" className="add-cart-button ticket-wa">Enviar pedido por WhatsApp al local</a>
              ) : (
                <p className="ticket-warn">El local no tiene WhatsApp configurado. Pedile al dueño que lo agregue en Administrar app para enviar el pedido automáticamente.</p>
              )}
              <Link to="/pedidos" className="admin-secondary cart-link-btn">Ver mis pedidos</Link>
              <Link to="/inicio" className="admin-secondary cart-link-btn">Volver al inicio</Link>
            </div>
          </section>
        </main>
        <FooterNav />
      </div>
    )
  }

  return (
    <div className="principal">
      <Header />
      <main className="principal-content with-footer">
        <div className="menu-page-header">
          <h1>Carrito</h1>
          <p>Completá tus datos y elegí cómo pagar.</p>
        </div>

        {cart.items.length === 0 ? (
          <section className="cart-empty">
            <p>Tu carrito está vacío.</p>
            <Link to="/categorias" className="home-button cart-cta">Ver comidas</Link>
          </section>
        ) : (
          <>
            <section className="cart-list">
              {cart.items.map((item) => {
                const { item: liveItem } = getItemById(item.categoryId, item.itemId)
                const stock = liveItem ? getItemStock(liveItem) : 0
                const out = stock !== null && stock <= 0
                const over = stock !== null && item.quantity > stock
                return (
                <article key={`${item.categoryId}-${item.itemId}`} className="cart-item">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="cart-item-image" />
                  ) : (
                    <div className="cart-item-image placeholder">Sin foto</div>
                  )}
                  <div className="cart-item-body">
                    <div className="menu-item-top">
                      <h2>{item.name}</h2>
                      {item.discount && <span className="promo-badge">{item.discount}</span>}
                    </div>
                    <p className="cart-item-price">{item.price || formatCurrency(item.priceValue)}</p>
                    {stock !== null && <p className={`menu-item-stock ${out || over ? 'out' : ''}`}>{out ? 'Sin stock' : `Disponible: ${stock}`}</p>}
                    {over && <p className="checkout-error">Ajustá la cantidad: solo hay {stock} disponible(s).</p>}
                    <div className="cart-item-actions">
                      <div className="qty-control">
                        <button type="button" onClick={() => updateCartItemQuantity(item.itemId, item.categoryId, item.quantity - 1, stock)}>-</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateCartItemQuantity(item.itemId, item.categoryId, item.quantity + 1, stock)} disabled={stock !== null && item.quantity >= stock}>+</button>
                      </div>
                      <button type="button" className="cart-remove" onClick={() => removeFromCart(item.itemId, item.categoryId)}>Quitar</button>
                    </div>
                  </div>
                </article>
              )})}
            </section>

            <section className="checkout-form">
              <h2>Datos del cliente</h2>
              <label className="admin-field">
                <span>Nombre</span>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Tu nombre" />
              </label>
              <label className="admin-field">
                <span>Teléfono</span>
                <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Tu teléfono" />
              </label>
              <label className="admin-field">
                <span>Entrega</span>
                <select className="checkout-select" value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)}>
                  <option>Retiro en local</option>
                  <option>Envío a domicilio</option>
                </select>
              </label>
              {deliveryType === 'Envío a domicilio' && (
                <label className="admin-field">
                  <span>Dirección</span>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, número, piso, etc." />
                </label>
              )}
              <label className="admin-field">
                <span>Notas (opcional)</span>
                <textarea className="admin-textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Aclaraciones del pedido" />
              </label>

              <h2>Forma de pago</h2>
              <div className="payment-options">
                {Object.entries(paymentOptions).map(([key, opt]) => (
                  <label key={key} className={`payment-option ${paymentMethod === key ? 'active' : ''}`}>
                    <input type="radio" name="payment" value={key} checked={paymentMethod === key} onChange={() => setPaymentMethod(key)} />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
              <div className="payment-info-box">
                <p>{selectedPayment.info || 'Sin información configurada.'}</p>
                {paymentMethod === 'mercadopago' && settings.paymentMpLink && (
                  <a href={settings.paymentMpLink} target="_blank" rel="noreferrer" className="payment-link">Abrir link de pago</a>
                )}
              </div>
            </section>

            <section className="cart-summary">
              <div className="coupon-box">
                <h2>Cupón</h2>
                {!user ? (
                  <p className="muted-text">Iniciá sesión en <Link to="/cuenta">Mi cuenta</Link> para aplicar cupones.</p>
                ) : (
                  <>
                    <div className="coupon-apply-row">
                      <input
                        type="text"
                        value={couponInput || cart.couponCode || ''}
                        onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponMsg('') }}
                        placeholder="Código de cupón"
                      />
                      <button
                        type="button"
                        className="admin-secondary"
                        onClick={() => {
                          const code = String(couponInput || cart.couponCode || '').trim().toUpperCase()
                          const found = findCouponByCode(code)
                          if (!found) {
                            setCartCoupon('')
                            setCouponMsg('Cupón no válido o no disponible.')
                            return
                          }
                          setCartCoupon(found.code)
                          setCouponInput(found.code)
                          setCouponMsg(`Cupón "${found.code}" aplicado.`)
                        }}
                      >Aplicar</button>
                    </div>
                    {appliedCoupon && (
                      <div className="coupon-applied">
                        <p><strong>{appliedCoupon.code}</strong> - {appliedCoupon.title}</p>
                        <button type="button" className="cart-remove" onClick={() => { setCartCoupon(''); setCouponInput(''); setCouponMsg('Cupón quitado.') }}>Quitar cupón</button>
                      </div>
                    )}
                    {!appliedCoupon && cart.couponCode && <p className="checkout-error">El cupón guardado ya no está disponible.</p>}
                    {couponMsg && <p className={couponMsg.includes('aplicado') ? 'added-msg' : 'checkout-error'}>{couponMsg}</p>}
                  </>
                )}
              </div>

              <div className="cart-total-row"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
              {discount > 0 && <div className="cart-total-row discount"><span>Descuento cupón</span><strong>-{formatCurrency(discount)}</strong></div>}
              <div className="cart-total-row total-final"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
              {error && <p className="checkout-error">{error}</p>}
              <div className="cart-summary-actions">
                <Link to="/categorias" className="admin-secondary cart-link-btn">Seguir comprando</Link>
                <button type="button" className="admin-primary" onClick={handleConfirm}>Confirmar pedido</button>
              </div>
            </section>
          </>
        )}
      </main>
      <FooterNav />
    </div>
  )
}

export default Carrito
