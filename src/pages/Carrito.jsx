import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'
import { formatCurrency, getCart, getCartTotal, parsePriceValue, removeFromCart, updateCartItemModifiers, updateCartItemQuantity } from '../data/cart.js'
import { addCajaMovement } from '../data/caja.js'
import { decreaseStockForOrder, getItemById, getItemStock } from '../data/categories.js'
import { buildOrderMessage, createOrderFromCart } from '../data/orders.js'
import { getSettings } from '../data/settings.js'

function sanitizeWhatsApp(phone) {
  return String(phone || '').replace(/[^0-9]/g, '')
}

function ModifiersInfo({ modifiers }) {
  const extras = modifiers?.extras || []
  const removed = modifiers?.removed || []
  if (!extras.length && !removed.length) return null
  return (
    <div className="cart-mods">
      {extras.length > 0 && <p className="cart-mod">+ {extras.map((e) => e.name).join(', ')}</p>}
      {removed.length > 0 && <p className="cart-mod remove">Sin: {removed.map((r) => r.name).join(', ')}</p>}
    </div>
  )
}

function EditModifiers({ cartItem, liveItem }) {
  const extras = Array.isArray(liveItem?.extras) ? liveItem.extras : []
  const removables = Array.isArray(liveItem?.removables) ? liveItem.removables : []
  const selectedExtraIds = (cartItem.modifiers?.extras || []).map((e) => e.id)
  const removedIds = (cartItem.modifiers?.removed || []).map((r) => r.id)
  const basePrice = parsePriceValue(liveItem?.price)

  const apply = (nextExtraIds, nextRemovedIds) => {
    const selectedExtras = extras.filter((e) => nextExtraIds.includes(e.id)).map((e) => ({ id: e.id, name: e.name, price: Number(e.price) || 0 }))
    const removed = removables.filter((r) => nextRemovedIds.includes(r.id)).map((r) => ({ id: r.id, name: r.name }))
    const extrasTotal = selectedExtras.reduce((sum, e) => sum + (Number(e.price) || 0), 0)
    const unit = basePrice + extrasTotal
    updateCartItemModifiers(cartItem.lineId, {
      modifiers: { extras: selectedExtras, removed },
      price: formatCurrency(unit),
      priceValue: unit,
    })
  }

  if (!extras.length && !removables.length) return <p className="muted-text">Este producto no tiene opciones configurables.</p>

  return (
    <div className="cart-edit-mods">
      {extras.length > 0 && (
        <div className="mods-section compact">
          <h4>Agregados</h4>
          <div className="mods-list">
            {extras.map((ex) => {
              const checked = selectedExtraIds.includes(ex.id)
              return (
                <label key={ex.id} className="mod-option">
                  <input type="checkbox" checked={checked} onChange={() => {
                    const next = checked ? selectedExtraIds.filter((id) => id !== ex.id) : [...selectedExtraIds, ex.id]
                    apply(next, removedIds)
                  }} />
                  <span>{ex.name}</span>
                  <span className="mod-price">{(Number(ex.price) || 0) > 0 ? `+${formatCurrency(ex.price)}` : 'Gratis'}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}
      {removables.length > 0 && (
        <div className="mods-section compact">
          <h4>Quitar</h4>
          <div className="mods-list">
            {removables.map((rm) => {
              const checked = removedIds.includes(rm.id)
              return (
                <label key={rm.id} className="mod-option">
                  <input type="checkbox" checked={checked} onChange={() => {
                    const next = checked ? removedIds.filter((id) => id !== rm.id) : [...removedIds, rm.id]
                    apply(selectedExtraIds, next)
                  }} />
                  <span>Sin {rm.name}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
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
  const [editingLineId, setEditingLineId] = useState('')

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
    if (!customerName.trim()) { setError('Ingresá tu nombre.'); return }
    if (!customerPhone.trim()) { setError('Ingresá tu teléfono.'); return }
    if (deliveryType === 'Envío a domicilio' && !address.trim()) { setError('Ingresá la dirección para el envío.'); return }

    for (const item of cart.items) {
      const { item: liveItem } = getItemById(item.categoryId, item.itemId)
      if (!liveItem) { setError(`El producto "${item.name}" ya no está disponible.`); return }
      const stock = getItemStock(liveItem)
      const qtyForProduct = cart.items.filter((i) => String(i.itemId) === String(item.itemId) && String(i.categoryId) === String(item.categoryId)).reduce((s, i) => s + (Number(i.quantity) || 0), 0)
      if (stock !== null && qtyForProduct > stock) {
        setError(`No hay stock suficiente de "${item.name}". Disponible: ${stock}.`)
        return
      }
    }

    const etaMinutes = deliveryType === 'Envío a domicilio' ? (Number(settings.etaDeliveryMinutes) || 40) : (Number(settings.etaPickupMinutes) || 20)
    const etaAtDate = new Date(Date.now() + etaMinutes * 60 * 1000)
    const etaLabel = deliveryType === 'Envío a domicilio'
      ? `Llega aprox. en ${etaMinutes} min (${etaAtDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })})`
      : `Listo para retirar aprox. en ${etaMinutes} min (${etaAtDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })})`

    const snapshotItems = getCart().items.map((i) => ({ ...i }))
    try {
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
      }, { items: snapshotItems })

      if (order) {
        decreaseStockForOrder(snapshotItems)
        addCajaMovement({
          type: 'income',
          amount: order.total,
          concept: `Venta ${order.saleCode || `#${String(order.id).slice(-5)}`}`,
          category: 'Ventas',
          date: order.createdAt,
          method: order.payment?.methodLabel || '',
          note: order.customer?.name ? `Cliente: ${order.customer.name}` : '',
          source: 'order',
          orderId: order.id,
        })
        setConfirmedOrder(order)
      }
    } catch (e) {
      setError(e?.message || 'No se pudo confirmar el pedido.')
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
              <p><strong>Venta:</strong> {confirmedOrder.saleCode || `#${String(confirmedOrder.id).slice(-5)}`}</p>
              <p><strong>Fecha:</strong> {new Date(confirmedOrder.createdAt).toLocaleString('es-AR')}</p>
              <p><strong>Estado:</strong> {confirmedOrder.status}</p>
              <hr />
              {confirmedOrder.items.map((item, i) => (
                <div key={`${confirmedOrder.id}-${item.lineId || i}`} className="ticket-item-block">
                  <div className="ticket-line">
                    <span>{item.quantity} x {item.name}</span>
                    <span>{item.price || formatCurrency(item.priceValue)}</span>
                  </div>
                  {(item.modifiers?.extras?.length > 0) && <p className="ticket-mod">+ {item.modifiers.extras.map((e) => e.name).join(', ')}</p>}
                  {(item.modifiers?.removed?.length > 0) && <p className="ticket-mod">Sin: {item.modifiers.removed.map((r) => r.name).join(', ')}</p>}
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
              {confirmedOrder.estimate?.label && (<><hr /><p className="ticket-eta"><strong>Tiempo estimado:</strong> {confirmedOrder.estimate.label}</p></>)}
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
          <button type="button" className="back-link as-button" onClick={() => window.history.back()}>← Volver</button>
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
                const qtyForProduct = cart.items.filter((i) => String(i.itemId) === String(item.itemId) && String(i.categoryId) === String(item.categoryId)).reduce((s, i) => s + (Number(i.quantity) || 0), 0)
                const out = stock !== null && stock <= 0
                const over = stock !== null && qtyForProduct > stock
                return (
                  <article key={item.lineId} className="cart-item">
                    {item.image ? <img src={item.image} alt={item.name} className="cart-item-image" /> : <div className="cart-item-image placeholder">Sin foto</div>}
                    <div className="cart-item-body">
                      <div className="menu-item-top">
                        <h2>{item.name}</h2>
                        {item.discount && <span className="promo-badge">{item.discount}</span>}
                      </div>
                      <p className="cart-item-price">{item.price || formatCurrency(item.priceValue)}</p>
                      <ModifiersInfo modifiers={item.modifiers} />
                      {stock !== null && <p className={`menu-item-stock ${out || over ? 'out' : ''}`}>{out ? 'Sin stock' : `Disponible: ${stock}`}</p>}
                      {over && <p className="checkout-error">Ajustá cantidades de este producto: solo hay {stock} disponible(s) en total.</p>}
                      <div className="cart-item-actions">
                        <div className="qty-control">
                          <button type="button" onClick={() => updateCartItemQuantity(item.lineId, item.quantity - 1, stock)}>-</button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => updateCartItemQuantity(item.lineId, item.quantity + 1, stock)} disabled={stock !== null && qtyForProduct >= stock}>+</button>
                        </div>
                        <button type="button" className="cart-remove" onClick={() => removeFromCart(item.lineId)}>Quitar</button>
                      </div>
                      {liveItem && ((liveItem.extras || []).length > 0 || (liveItem.removables || []).length > 0) && (
                        <div className="cart-edit-wrap">
                          <button type="button" className="edit-mods-btn" onClick={() => setEditingLineId((curr) => curr === item.lineId ? '' : item.lineId)}>
                            {editingLineId === item.lineId ? 'Cerrar edición' : 'Editar agregados / quitar'}
                          </button>
                          {editingLineId === item.lineId && <EditModifiers cartItem={item} liveItem={liveItem} />}
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </section>

            <section className="checkout-form">
              <h2>Datos del cliente</h2>
              <label className="admin-field"><span>Nombre</span><input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Tu nombre" /></label>
              <label className="admin-field"><span>Teléfono</span><input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Tu teléfono" /></label>
              <label className="admin-field"><span>Entrega</span>
                <select className="checkout-select" value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)}>
                  <option>Retiro en local</option>
                  <option>Envío a domicilio</option>
                </select>
              </label>
              {deliveryType === 'Envío a domicilio' && (
                <label className="admin-field"><span>Dirección</span><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, número, piso, etc." /></label>
              )}
              <label className="admin-field"><span>Notas (opcional)</span><textarea className="admin-textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Aclaraciones del pedido" /></label>

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
                {paymentMethod === 'mercadopago' && settings.paymentMpLink && <a href={settings.paymentMpLink} target="_blank" rel="noreferrer" className="payment-link">Abrir link de pago</a>}
              </div>
            </section>

            <section className="cart-summary">
              <div className="cart-total-row"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
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
