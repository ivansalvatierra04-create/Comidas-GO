import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'
import { addCajaMovement, cajaCategories, deleteCajaMovement, getCajaMovements, getCajaSummary, getTodayMovements } from '../data/caja.js'
import { formatCurrency } from '../data/cart.js'
import { getOrders } from '../data/orders.js'

function formatDateTime(iso) {
  try { return new Date(iso).toLocaleString('es-AR') } catch { return iso }
}

function Caja() {
  const [movements, setMovements] = useState(() => getCajaMovements())
  const [type, setType] = useState('income')
  const [amount, setAmount] = useState('')
  const [concept, setConcept] = useState('')
  const [category, setCategory] = useState('Ventas')
  const [method, setMethod] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [showMovements, setShowMovements] = useState(false)
  const [ticketOrderId, setTicketOrderId] = useState('')

  useEffect(() => {
    const sync = () => setMovements(getCajaMovements())
    window.addEventListener('storage', sync)
    window.addEventListener('caja-updated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('caja-updated', sync)
    }
  }, [])

  useEffect(() => {
    setCategory(type === 'expense' ? cajaCategories.expense[0] : cajaCategories.income[0])
  }, [type])

  const todayMovements = useMemo(() => getTodayMovements(movements), [movements])
  const todaySummary = useMemo(() => getCajaSummary(todayMovements), [todayMovements])
  const generalSummary = useMemo(() => getCajaSummary(movements), [movements])
  const selectedOrder = useMemo(() => {
    if (!ticketOrderId) return null
    return getOrders().find((o) => String(o.id) === String(ticketOrderId)) || null
  }, [ticketOrderId, movements])

  const handleAdd = (e) => {
    e.preventDefault()
    setError('')
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) { setError('Ingresá un monto válido.'); return }
    if (!concept.trim()) { setError('Ingresá un concepto.'); return }
    try {
      addCajaMovement({ type, amount: value, concept, category, method, note, source: 'manual' })
      setAmount('')
      setConcept('')
      setMethod('')
      setNote('')
    } catch (err) {
      setError(err?.message || 'No se pudo registrar el movimiento.')
    }
  }

  return (
    <div className="principal">
      <Header />
      <main className="principal-content with-footer">
        <div className="menu-page-header">
          <Link to="/inicio" className="back-link">← Volver</Link>
          <h1>Caja</h1>
          <p>Ingresos, egresos y saldo del local.</p>
        </div>

        <section className="caja-summary-grid">
          <div className="caja-card">
            <h2>Hoy</h2>
            <p className="caja-line income"><span>Ingresos</span><strong>{formatCurrency(todaySummary.income)}</strong></p>
            <p className="caja-line expense"><span>Egresos</span><strong>{formatCurrency(todaySummary.expense)}</strong></p>
            <p className="caja-line balance"><span>Saldo</span><strong>{formatCurrency(todaySummary.balance)}</strong></p>
          </div>
          <div className="caja-card">
            <h2>General</h2>
            <p className="caja-line income"><span>Ingresos</span><strong>{formatCurrency(generalSummary.income)}</strong></p>
            <p className="caja-line expense"><span>Egresos</span><strong>{formatCurrency(generalSummary.expense)}</strong></p>
            <p className="caja-line balance"><span>Saldo</span><strong>{formatCurrency(generalSummary.balance)}</strong></p>
          </div>
        </section>

        <section className="caja-card">
          <h2>Registrar movimiento</h2>
          <form className="caja-form" onSubmit={handleAdd}>
            <div className="caja-type-row">
              <button type="button" className={`admin-secondary ${type === 'income' ? 'active-toggle' : ''}`} onClick={() => setType('income')}>Ingreso</button>
              <button type="button" className={`admin-secondary ${type === 'expense' ? 'active-toggle' : ''}`} onClick={() => setType('expense')}>Egreso</button>
            </div>
            <label className="admin-field"><span>Monto</span><input type="number" min="0" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ej: 5000" /></label>
            <label className="admin-field"><span>Concepto</span><input type="text" value={concept} onChange={(e) => setConcept(e.target.value)} placeholder="Ej: Compra de insumos" /></label>
            <label className="admin-field"><span>Categoría</span>
              <select className="checkout-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {(type === 'expense' ? cajaCategories.expense : cajaCategories.income).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="admin-field"><span>Método / referencia (opcional)</span><input type="text" value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Efectivo, transferencia, etc." /></label>
            <label className="admin-field"><span>Nota (opcional)</span><input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Detalle adicional" /></label>
            {error && <p className="checkout-error">{error}</p>}
            <button type="submit" className="admin-primary">Guardar movimiento</button>
          </form>
        </section>

        <section className="caja-card">
          <div className="caja-movements-head">
            <h2>Movimientos</h2>
            <button type="button" className="admin-secondary" onClick={() => setShowMovements((v) => !v)}>
              {showMovements ? 'Ocultar movimientos' : 'Movimientos'}
            </button>
          </div>

          {showMovements && (
            movements.length === 0 ? (
              <p className="muted-text">No hay movimientos registrados.</p>
            ) : (
              <div className="caja-movements">
                {movements.map((m) => (
                  <article key={m.id} className={`caja-move ${m.type}`}>
                    <div className="caja-move-main">
                      <div>
                        <p className="caja-move-concept">{m.concept}</p>
                        <p className="caja-move-meta">{formatDateTime(m.date)} · {m.category}{m.method ? ` · ${m.method}` : ''}{m.source === 'order' ? ' · Auto (venta)' : ''}</p>
                        {m.note && <p className="caja-move-note">{m.note}</p>}
                      </div>
                      <strong className="caja-move-amount">{m.type === 'expense' ? '-' : '+'}{formatCurrency(m.amount)}</strong>
                    </div>
                    <div className="caja-move-actions">
                      {m.source === 'order' && m.orderId && (
                        <button type="button" className="edit-mods-btn" onClick={() => setTicketOrderId((curr) => curr === m.orderId ? '' : m.orderId)}>
                          {ticketOrderId === m.orderId ? 'Cerrar ticket' : 'Ver ticket'}
                        </button>
                      )}
                      <button type="button" className="cart-remove" onClick={() => { try { deleteCajaMovement(m.id) } catch (err) { setError(err?.message || 'No se pudo eliminar el movimiento.') } }}>Eliminar</button>
                    </div>
                    {ticketOrderId === m.orderId && (
                      <div className="caja-ticket-dup">
                        {selectedOrder ? (
                          <>
                            <h3>Duplicado de venta / ticket</h3>
                            <p><strong>Venta:</strong> {selectedOrder.saleCode || `#${String(selectedOrder.id).slice(-5)}`}</p>
                            <p><strong>Fecha:</strong> {formatDateTime(selectedOrder.createdAt)}</p>
                            <p><strong>Estado:</strong> {selectedOrder.status}</p>
                            <hr />
                            {selectedOrder.items.map((item, i) => (
                              <div key={`${selectedOrder.id}-${item.lineId || i}`} className="ticket-item-block">
                                <div className="ticket-line"><span>{item.quantity} x {item.name}</span><span>{item.price || formatCurrency(item.priceValue)}</span></div>
                                {(item.modifiers?.extras?.length > 0) && <p className="ticket-mod">+ {item.modifiers.extras.map((e) => e.name).join(', ')}</p>}
                                {(item.modifiers?.removed?.length > 0) && <p className="ticket-mod">Sin: {item.modifiers.removed.map((r) => r.name).join(', ')}</p>}
                              </div>
                            ))}
                            <hr />
                            <div className="ticket-line total"><span>Total</span><strong>{selectedOrder.totalText || formatCurrency(selectedOrder.total)}</strong></div>
                            {selectedOrder.customer?.name && <p><strong>Cliente:</strong> {selectedOrder.customer.name} {selectedOrder.customer.phone ? `(${selectedOrder.customer.phone})` : ''}</p>}
                            {selectedOrder.customer?.deliveryType && <p><strong>Entrega:</strong> {selectedOrder.customer.deliveryType}</p>}
                            {selectedOrder.customer?.address && <p><strong>Dirección:</strong> {selectedOrder.customer.address}</p>}
                            {selectedOrder.payment?.methodLabel && <p><strong>Pago:</strong> {selectedOrder.payment.methodLabel}</p>}
                            {selectedOrder.estimate?.label && <p><strong>Tiempo estimado:</strong> {selectedOrder.estimate.label}</p>}
                          </>
                        ) : (
                          <p className="muted-text">No se encontró el ticket de esta venta (puede haber sido eliminado del historial).</p>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )
          )}
        </section>
      </main>
      <FooterNav />
    </div>
  )
}

export default Caja
