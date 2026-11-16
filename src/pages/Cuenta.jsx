import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'
import { getCurrentUser, logout, registerOrLogin } from '../data/auth.js'

function Cuenta() {
  const [user, setUser] = useState(() => getCurrentUser())
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    const sync = () => setUser(getCurrentUser())
    window.addEventListener('storage', sync)
    window.addEventListener('auth-updated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('auth-updated', sync)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    const res = registerOrLogin({ name, phone, pin })
    if (!res.ok) {
      setError(res.error || 'No se pudo iniciar sesión.')
      return
    }
    setPin('')
    setInfo(res.created ? 'Cuenta creada e iniciada.' : 'Sesión iniciada.')
  }

  return (
    <div className="principal">
      <Header />
      <main className="principal-content with-footer">
        <div className="menu-page-header">
          <h1>Mi cuenta</h1>
          <p>Iniciá sesión para acceder a tus beneficios y cupones.</p>
        </div>

        {user ? (
          <section className="account-card">
            <h2>Hola, {user.name || 'Cliente'}</h2>
            <p><strong>Teléfono:</strong> {user.phone}</p>
            <p className="muted-text">Sesión activa en este dispositivo.</p>
            <div className="account-actions">
              <Link to="/cupones" className="add-cart-button">Ver cupones</Link>
              <button type="button" className="admin-secondary" onClick={logout}>Cerrar sesión</button>
            </div>
          </section>
        ) : (
          <section className="account-card">
            <h2>Ingresar o registrarme</h2>
            <p className="muted-text">Usá tu teléfono y un PIN. Si no tenés cuenta, se crea automáticamente.</p>
            <form className="account-form" onSubmit={handleSubmit}>
              <label className="admin-field">
                <span>Nombre</span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
              </label>
              <label className="admin-field">
                <span>Teléfono</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej: 11 1234 5678" />
              </label>
              <label className="admin-field">
                <span>PIN</span>
                <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Mínimo 4 dígitos" />
              </label>
              {error && <p className="checkout-error">{error}</p>}
              {info && <p className="added-msg">{info}</p>}
              <button type="submit" className="admin-primary">Continuar</button>
            </form>
          </section>
        )}
      </main>
      <FooterNav />
    </div>
  )
}

export default Cuenta
