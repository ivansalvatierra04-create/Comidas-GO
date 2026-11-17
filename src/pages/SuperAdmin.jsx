import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { logoutSuperAdmin } from '../platform/auth.js'
import { logAudit } from '../platform/audit.js'
import { LICENSE_STATUS } from '../platform/licenses.js'
import { getPlatformStats, listStoresWithStatus, superadminCreateStore, superadminSetLicense, superadminUpdateStore } from '../platform/superadmin.js'
import { setCurrentStoreId } from '../platform/stores.js'

function formatDate(iso) {
  if (!iso) return '-'
  try { return new Date(iso).toLocaleString('es-AR') } catch { return iso }
}

function SuperAdmin() {
  const [rows, setRows] = useState(() => listStoresWithStatus())
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [form, setForm] = useState({ name: '', slug: '', contact: '', address: '', licenseAmount: 0, activateLicense: true })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const refresh = () => setRows(listStoresWithStatus())

  useEffect(() => {
    const h = () => refresh()
    window.addEventListener('platform-stores-updated', h)
    window.addEventListener('platform-licenses-updated', h)
    window.addEventListener('orders-updated', h)
    window.addEventListener('caja-updated', h)
    return () => {
      window.removeEventListener('platform-stores-updated', h)
      window.removeEventListener('platform-licenses-updated', h)
      window.removeEventListener('orders-updated', h)
      window.removeEventListener('caja-updated', h)
    }
  }, [])

  const stats = useMemo(() => getPlatformStats(), [rows])
  const filtered = useMemo(() => rows.filter((r) => {
    const text = `${r.store.name} ${r.store.slug} ${r.store.contact || ''}`.toLowerCase()
    if (q && !text.includes(q.toLowerCase())) return false
    const st = r.license?.status || 'sin_licencia'
    if (statusFilter !== 'all' && st !== statusFilter) return false
    return true
  }), [rows, q, statusFilter])

  const handleCreate = (e) => {
    e.preventDefault()
    setErr(''); setMsg('')
    try {
      superadminCreateStore({ ...form, licenseAmount: Number(form.licenseAmount) || 0 })
      setForm({ name: '', slug: '', contact: '', address: '', licenseAmount: 0, activateLicense: true })
      setMsg('Comercio creado y licencia registrada.')
      refresh()
    } catch (e2) {
      setErr(e2?.message || 'No se pudo crear el comercio.')
    }
  }

  const changeLicense = (storeId, status, label) => {
    setErr(''); setMsg('')
    superadminSetLicense(storeId, status, label)
    setMsg(`Licencia actualizada: ${label}.`)
    refresh()
  }

  return (
    <div className="admin" style={{ minHeight: '100dvh' }}>
      <header className="admin-header">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/inicio" className="admin-back">← App</Link>
          <button type="button" className="admin-secondary" onClick={() => { logoutSuperAdmin(); window.location.reload() }}>Cerrar sesión SUPERADMIN</button>
        </div>
        <h1>Panel SUPERADMIN</h1>
        <p>Gestión privada de comercios y licencias (pago único/permanente). Validación de licencias debe reforzarse en backend en producción.</p>
      </header>
      <main className="admin-content">
        <section className="admin-card">
          <h2>Estadísticas generales</h2>
          <div className="caja-summary-grid">
            <div className="caja-card"><p className="caja-line"><span>Comercios</span><strong>{stats.stores}</strong></p><p className="caja-line"><span>Pedidos</span><strong>{stats.totalOrders}</strong></p></div>
            <div className="caja-card"><p className="caja-line"><span>Ventas totales</span><strong>${Number(stats.totalSales || 0).toLocaleString('es-AR')}</strong></p><p className="caja-line"><span>Eventos auditoría</span><strong>{stats.auditEvents}</strong></p></div>
          </div>
          <p className="muted-text">Estados de licencia: {Object.entries(stats.byStatus || {}).map(([k,v]) => `${k}: ${v}`).join(' · ') || '-'}</p>
        </section>

        <section className="admin-card">
          <h2>Registrar nuevo comercio</h2>
          <form onSubmit={handleCreate} className="admin-form">
            <label className="admin-field"><span>Nombre comercial</span><input value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} required /></label>
            <label className="admin-field"><span>Slug / URL (ej. pizzeria-central)</span><input value={form.slug} onChange={(e)=>setForm(f=>({...f,slug:e.target.value}))} placeholder="se genera desde el nombre si se deja vacío" /></label>
            <label className="admin-field"><span>Contacto</span><input value={form.contact} onChange={(e)=>setForm(f=>({...f,contact:e.target.value}))} /></label>
            <label className="admin-field"><span>Dirección</span><input value={form.address} onChange={(e)=>setForm(f=>({...f,address:e.target.value}))} /></label>
            <label className="admin-field"><span>Importe pagado (licencia pago único)</span><input type="number" min="0" value={form.licenseAmount} onChange={(e)=>setForm(f=>({...f,licenseAmount:e.target.value}))} /></label>
            <label className="mod-option"><input type="checkbox" checked={form.activateLicense} onChange={(e)=>setForm(f=>({...f,activateLicense:e.target.checked}))} /><span>Activar licencia al crear</span></label>
            <button type="submit" className="admin-primary">Crear comercio y registrar licencia</button>
          </form>
        </section>

        <section className="admin-card">
          <h2>Comercios registrados</h2>
          <div className="admin-actions" style={{flexWrap:'wrap'}}>
            <input className="checkout-select" placeholder="Buscar por nombre, slug o contacto" value={q} onChange={(e)=>setQ(e.target.value)} style={{minWidth:240}} />
            <select className="checkout-select" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
              <option value="all">Todos los estados</option>
              <option value={LICENSE_STATUS.ACTIVE}>Activa</option>
              <option value={LICENSE_STATUS.PENDING}>Pendiente</option>
              <option value={LICENSE_STATUS.SUSPENDED}>Suspendida</option>
              <option value={LICENSE_STATUS.CANCELLED}>Cancelada</option>
            </select>
          </div>
          {err && <p className="checkout-error">{err}</p>}
          {msg && <p className="admin-message">{msg}</p>}
          <div className="caja-movements">
            {filtered.map((r) => (
              <article key={r.store.id} className="caja-move income" style={{alignItems:'stretch'}}>
                <div className="caja-move-main" style={{gap:12}}>
                  <div style={{flex:1}}>
                    <p className="caja-move-concept">{r.store.name} <span className="muted-text">({r.store.slug})</span></p>
                    <p className="caja-move-meta">ID: {r.store.id} · Alta: {formatDate(r.store.createdAt)} · Última actividad: {formatDate(r.stats.lastActivityAt)}</p>
                    <p className="caja-move-meta">Licencia: <strong>{r.license?.status || 'sin licencia'}</strong> (pago único/permanente) · Compra: {formatDate(r.license?.purchaseDate)} · Activación: {formatDate(r.license?.activationDate)} · Importe: ${Number(r.license?.amountPaid||0).toLocaleString('es-AR')}</p>
                    <p className="caja-move-meta">Pedidos: {r.stats.orders} · Ventas: ${Number(r.stats.salesTotal||0).toLocaleString('es-AR')} · Usuarios: {r.stats.users} (gestión real de usuarios requiere backend)</p>
                    <p className="caja-move-note">URL pública sugerida: /c/{r.store.slug} (preparado para backend/ruteo por comercio)</p>
                  </div>
                </div>
                <div className="caja-move-actions" style={{flexWrap:'wrap'}}>
                  <button type="button" className="admin-secondary" onClick={() => { setCurrentStoreId(r.store.id); setMsg(`Comercio activo en esta sesión: ${r.store.name}`); }}>Usar en esta sesión</button>
                  <button type="button" className="admin-secondary" onClick={() => changeLicense(r.store.id, LICENSE_STATUS.ACTIVE, 'Activada por SUPERADMIN')}>Activar</button>
                  <button type="button" className="admin-secondary" onClick={() => changeLicense(r.store.id, LICENSE_STATUS.SUSPENDED, 'Suspendida por SUPERADMIN')}>Suspender</button>
                  <button type="button" className="admin-secondary" onClick={() => changeLicense(r.store.id, LICENSE_STATUS.PENDING, 'Marcada pendiente')}>Pendiente</button>
                  <button type="button" className="cart-remove" onClick={() => changeLicense(r.store.id, LICENSE_STATUS.CANCELLED, 'Cancelada por SUPERADMIN')}>Cancelar</button>
                </div>
              </article>
            ))}
            {filtered.length === 0 && <p className="muted-text">No hay comercios que coincidan con el filtro.</p>}
          </div>
        </section>

        <section className="admin-card">
          <h2>Notas de plataforma</h2>
          <ul className="muted-text" style={{margin:0, paddingLeft:18, display:'grid', gap:6}}>
            <li>Las licencias son de <strong>pago único y permanentes</strong>: no se suspenden automáticamente por vencimiento de fechas.</li>
            <li>Al suspender: se bloquean funciones operativas (ej. confirmar ventas/caja) pero <strong>no se eliminan datos</strong>; se puede reactivar.</li>
            <li>La validación real de licencias, autenticación, RLS y aislamiento deben ejecutarse en <strong>backend/Supabase</strong>. Esta implementación local es operativa como base y deja preparada la integración (ver carpeta <code>supabase/</code> y <code>.env.example</code>).</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export default SuperAdmin
