import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'
import { formatCurrency, getCart, getCartTotal, removeFromCart, updateCartItemQuantity } from '../data/cart.js'
import { buildOrderMessage, createOrderFromCart } from '../data/orders.js'
import { getSettings } from '../data/settings.js'

function sanitizeWhatsApp(phone) {
  return String(phone || '').replace(/[^0-9]/g, '')
}

function Carrito() {
  const [cart, setCart] = useState(() => getCart())
  const [settings, setSettings] = useState(() => getSettings())
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryType, setDeliveryType] = useState('Retiro en local')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [error, setError] = useState('')
  const [confirmedOrder, setConfirmedOrder] = useState(null)

  useEffect(() => {
    const sync = () => setCart(getCart())
    const syncSettings = () => setSettings(getSettings())
    window.addEventListener('storage', sync)
    window.addEventListener('cart-updated', sync)
    window.addEventListener('storage', syncSettings)
    window.addEventListener('settings-updated', syncSettings)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('cart-updated', sync)
      window.removeEventListener('storage', syncSettings)
      window.removeEventListener('settings-updated', syncSettings)
    }
  }, [])

  const total = getCartTotal()

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

    const order = createOrderFromCart({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryType,
      address: address.trim(),
      notes: notes.trim(),
      paymentMethod,
      paymentMethodLabel: selectedPayment.label,
      paymentInfo: selectedPayment.info,
    })

    if (order) setConfirmedOrder(order)
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
              <div className="ticket-line total"><span>Total</span><strong>{confirmedOrder.totalText}</strong></div>
              <hr />
              <p><strong>Cliente:</strong> {confirmedOrder.customer.name} ({confirmedOrder.customer.phone})</p>
              <p><strong>Entrega:</strong> {confirmedOrder.customer.deliveryType}</p>
              {confirmedOrder.customer.address && <p><strong>Dirección:</strong> {confirmedOrder.customer.address}</p>}
              {confirmedOrder.customer.notes && <p><strong>Notas:</strong> {confirmedOrder.customer.notes}</p>}
              <p><strong>Pago:</strong> {confirmedOrder.payment.methodLabel}</p>
              {confirmedOrder.payment.info && <p className="ticket-info">{confirmedOrder.payment.info}</p>}
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
              {cart.items.map((item) => (
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
                    <div className="cart-item-actions">
                      <div className="qty-control">
                        <button type="button" onClick={() => updateCartItemQuantity(item.itemId, item.categoryId, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateCartItemQuantity(item.itemId, item.categoryId, item.quantity + 1)}>+</button>
                      </div>
                      <button type="button" className="cart-remove" onClick={() => removeFromCart(item.itemId, item.categoryId)}>Quitar</button>
                    </div>
                  </div>
                </article>
              ))}
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
              <div className="cart-total-row">
                <span>Total</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
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
