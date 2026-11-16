import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'
import { formatCurrency, getCart, getCartTotal, removeFromCart, updateCartItemQuantity } from '../data/cart.js'
import { createOrderFromCart } from '../data/orders.js'

function Carrito() {
  const [cart, setCart] = useState(() => getCart())
  const navigate = useNavigate()

  useEffect(() => {
    const sync = () => setCart(getCart())
    window.addEventListener('storage', sync)
    window.addEventListener('cart-updated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('cart-updated', sync)
    }
  }, [])

  const total = getCartTotal()

  const handleConfirm = () => {
    const order = createOrderFromCart()
    if (order) navigate('/pedidos')
  }

  return (
    <div className="principal">
      <Header />
      <main className="principal-content with-footer">
        <div className="menu-page-header">
          <h1>Carrito</h1>
          <p>Revisá tu pedido antes de confirmar.</p>
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

            <section className="cart-summary">
              <div className="cart-total-row">
                <span>Total</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
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
