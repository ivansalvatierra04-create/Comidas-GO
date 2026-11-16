import { useEffect, useState } from 'react'
import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'
import { formatCurrency } from '../data/cart.js'
import { getOrders } from '../data/orders.js'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('es-AR')
  } catch {
    return iso
  }
}

function Pedidos() {
  const [orders, setOrders] = useState(() => getOrders())

  useEffect(() => {
    const sync = () => setOrders(getOrders())
    window.addEventListener('storage', sync)
    window.addEventListener('orders-updated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('orders-updated', sync)
    }
  }, [])

  return (
    <div className="principal">
      <Header />
      <main className="principal-content with-footer">
        <div className="menu-page-header">
          <h1>Mis pedidos</h1>
          <p>Historial de pedidos confirmados.</p>
        </div>

        {orders.length === 0 ? (
          <section className="orders-placeholder">
            <p>Todavía no confirmaste ningún pedido.</p>
          </section>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <h2>Pedido #{String(order.id).slice(-5)}</h2>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className="order-status">{order.status}</span>
                </div>
                <ul className="order-items">
                  {order.items.map((item, i) => (
                    <li key={`${order.id}-${item.itemId}-${i}`}>
                      <span>{item.quantity} x {item.name}</span>
                      <span>{item.price || formatCurrency((item.priceValue || 0) * (item.quantity || 1))}</span>
                    </li>
                  ))}
                </ul>
                <div className="order-total">
                  <span>Total</span>
                  <strong>{order.totalText || formatCurrency(order.total)}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <FooterNav />
    </div>
  )
}

export default Pedidos
