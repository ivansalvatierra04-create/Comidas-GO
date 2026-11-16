import { NavLink } from 'react-router-dom'

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  )
}

function OrdersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3.5h7l3 3V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
      <path d="M14 3.5V7h3" />
      <path d="M9 11h6M9 15h6" />
    </svg>
  )
}

function FooterNav() {
  return (
    <nav className="footer-nav" aria-label="Navegación inferior">
      <NavLink to="/inicio" className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}>
        <HomeIcon />
        <span>Inicio</span>
      </NavLink>
      <NavLink to="/pedidos" className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}>
        <OrdersIcon />
        <span>Mis pedidos</span>
      </NavLink>
    </nav>
  )
}

export default FooterNav
