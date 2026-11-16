import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import defaultLogo from '../assets/logo.svg'
import { getCartCount } from '../data/cart.js'
import { getSettings } from '../data/settings.js'

function Header() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState(() => getSettings())
  const [cartCount, setCartCount] = useState(() => getCartCount())
  const navigate = useNavigate()

  useEffect(() => {
    const sync = () => setSettings(getSettings())
    const syncCart = () => setCartCount(getCartCount())
    window.addEventListener('storage', sync)
    window.addEventListener('settings-updated', sync)
    window.addEventListener('storage', syncCart)
    window.addEventListener('cart-updated', syncCart)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('settings-updated', sync)
      window.removeEventListener('storage', syncCart)
      window.removeEventListener('cart-updated', syncCart)
    }
  }, [])

  const logo = settings.logo || defaultLogo

  return (
    <header className="main-header">
      <button
        type="button"
        className="icon-button"
        aria-label="Abrir menú"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <div className="brand">
        <img src={logo} alt="" className="brand-logo" />
        <span className="brand-name">
          <span className="brand-comidas">{settings.storeName1}</span>
          <span className="brand-go">{settings.storeName2}</span>
        </span>
      </div>

      <button
        type="button"
        className="icon-button cart-button cart-button-wrap"
        aria-label="Carrito de compras"
        onClick={() => navigate('/carrito')}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 2-1.5L20 7H7.2" />
          <circle cx="10" cy="19" r="1.5" />
          <circle cx="17" cy="19" r="1.5" />
        </svg>
        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
      </button>

      {open && (
        <nav className="menu-panel" aria-label="Menú principal">
          <Link to="/inicio" onClick={() => setOpen(false)}>Inicio</Link>
          <Link to="/caja" onClick={() => setOpen(false)}>Caja</Link>
          <Link to="/admin" onClick={() => setOpen(false)}>Administrar app</Link>
        </nav>
      )}
    </header>
  )
}

export default Header
