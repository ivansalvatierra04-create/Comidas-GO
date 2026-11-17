import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { IS_CLIENT_BUILD } from '../platform/mode.js'
import { isSuperAdminAuthed, isSuperAdminConfigured, loginSuperAdmin, setSuperAdminPassword } from '../platform/auth.js'

function SuperAdminGate({ children }) {
  const [authed, setAuthed] = useState(() => isSuperAdminAuthed())
  const [configured, setConfigured] = useState(() => isSuperAdminConfigured())
  const [password, setPassword] = useState('')
  const [newPass, setNewPass] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    if (!loginSuperAdmin(password)) {
      setError('Contraseña incorrecta.')
      return
    }
    setPassword('')
    setAuthed(true)
  }

  const handleSetup = (e) => {
    e.preventDefault()
    if (!String(newPass).trim()) { setError('Ingresá una contraseña.'); return }
    setSuperAdminPassword(String(newPass).trim())
    setConfigured(true)
    setError('')
    setNewPass('')
  }

  if (IS_CLIENT_BUILD) return <Navigate to="/" replace />
  if (authed) return children

  return (
    <div className="admin" style={{ minHeight: '100dvh' }}>
      <main className="admin-content" style={{ maxWidth: 520, margin: '0 auto', padding: 20 }}>
        <section className="admin-card">
          <h1>Panel SUPERADMIN</h1>
          <p className="muted-text">Acceso privado del propietario de la plataforma. En producción debe validarse en servidor (backend/Supabase Auth + autorización). Este acceso local es una base funcional.</p>
          {!configured ? (
            <form onSubmit={handleSetup}>
              <h2>Configurar acceso inicial</h2>
              <label className="admin-field"><span>Contraseña SUPERADMIN</span>
                <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
              </label>
              {error && <p className="checkout-error">{error}</p>}
              <button type="submit" className="admin-primary">Guardar contraseña</button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <h2>Ingresar</h2>
              <label className="admin-field"><span>Contraseña</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
              </label>
              {error && <p className="checkout-error">{error}</p>}
              <button type="submit" className="admin-primary">Entrar</button>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}

export default SuperAdminGate
