import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { IS_CLIENT_BUILD } from '../platform/mode.js'
import FooterNav from './FooterNav.jsx'
import Header from './Header.jsx'
import { isOwnerAuthed, isOwnerProtected, loginOwner } from '../data/ownerAuth.js'

function OwnerGate({ children }) {
  const [authed, setAuthed] = useState(() => isOwnerAuthed())
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const sync = () => setAuthed(isOwnerAuthed())
    window.addEventListener('owner-auth-updated', sync)
    window.addEventListener('storage', sync)
    window.addEventListener('settings-updated', sync)
    return () => {
      window.removeEventListener('owner-auth-updated', sync)
      window.removeEventListener('storage', sync)
      window.removeEventListener('settings-updated', sync)
    }
  }, [])

  if (IS_CLIENT_BUILD) return <Navigate to="/" replace />
  if (authed) return children

  const protectedMode = isOwnerProtected()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!loginOwner(pin)) {
      setError('PIN incorrecto.')
      return
    }
    setPin('')
  }

  return (
    <div className="principal">
      <Header />
      <main className="principal-content with-footer">
        <div className="menu-page-header">
          <Link to="/inicio" className="back-link">← Volver</Link>
          <h1>Acceso de dueño</h1>
          <p>{protectedMode ? 'Ingresá tu PIN para administrar el local.' : 'Configurá un PIN desde Administrar app para proteger esta sección.'}</p>
        </div>
        {protectedMode ? (
          <form className="caja-card owner-gate-form" onSubmit={handleSubmit}>
            <label className="admin-field">
              <span>PIN de dueño</span>
              <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Ingresá tu PIN" autoFocus />
            </label>
            {error && <p className="checkout-error">{error}</p>}
            <button type="submit" className="admin-primary">Ingresar</button>
          </form>
        ) : (
          <div className="caja-card">
            <p>Esta sección aún no está protegida. Entrá a Administrar app y configurá un PIN de dueño para limitar el acceso.</p>
            <Link to="/inicio" className="home-button" style={{display:'inline-block', textDecoration:'none', textAlign:'center'}}>Ir al inicio</Link>
          </div>
        )}
      </main>
      <FooterNav />
    </div>
  )
}

export default OwnerGate
