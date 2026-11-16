import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'
import { getCurrentUser } from '../data/auth.js'
import { getCoupons, normalizeCoupon } from '../data/coupons.js'

function Cupones() {
  const [user, setUser] = useState(() => getCurrentUser())
  const [coupons, setCoupons] = useState(() => getCoupons().map(normalizeCoupon))
  const [copied, setCopied] = useState('')

  useEffect(() => {
    const syncAuth = () => setUser(getCurrentUser())
    const syncCoupons = () => setCoupons(getCoupons().map(normalizeCoupon))
    window.addEventListener('storage', syncAuth)
    window.addEventListener('auth-updated', syncAuth)
    window.addEventListener('storage', syncCoupons)
    window.addEventListener('coupons-updated', syncCoupons)
    return () => {
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener('auth-updated', syncAuth)
      window.removeEventListener('storage', syncCoupons)
      window.removeEventListener('coupons-updated', syncCoupons)
    }
  }, [])

  const activeCoupons = coupons.filter((c) => c.active && c.code)

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // ignore
    }
    setCopied(code)
    setTimeout(() => setCopied(''), 1500)
  }

  return (
    <div className="principal">
      <Header />
      <main className="principal-content with-footer">
        <div className="menu-page-header">
          <h1>Cupones</h1>
          <p>Beneficios otorgados por el local para clientes con cuenta.</p>
        </div>

        {!user ? (
          <section className="account-card">
            <p>Iniciá sesión en <strong>Mi cuenta</strong> para ver y usar tus cupones.</p>
            <Link to="/cuenta" className="add-cart-button">Ir a Mi cuenta</Link>
          </section>
        ) : activeCoupons.length === 0 ? (
          <section className="orders-placeholder">
            <p>No hay cupones disponibles por el momento.</p>
          </section>
        ) : (
          <div className="coupons-list">
            {activeCoupons.map((coupon) => (
              <article key={coupon.id} className="coupon-card">
                <div className="coupon-main">
                  <h2>{coupon.title}</h2>
                  {coupon.description && <p className="coupon-desc">{coupon.description}</p>}
                  <p className="coupon-benefit">
                    {coupon.type === 'percent' ? `${coupon.value}% de descuento` : `$${Number(coupon.value).toLocaleString('es-AR')} de descuento`}
                  </p>
                </div>
                <div className="coupon-code-row">
                  <span className="coupon-code">{coupon.code}</span>
                  <button type="button" className="admin-secondary" onClick={() => copyCode(coupon.code)}>
                    {copied === coupon.code ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <p className="muted-text">Podés aplicarlo en el carrito al confirmar tu pedido.</p>
              </article>
            ))}
          </div>
        )}
      </main>
      <FooterNav />
    </div>
  )
}

export default Cupones
