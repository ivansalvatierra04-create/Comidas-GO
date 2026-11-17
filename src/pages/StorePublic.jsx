import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'
import { getStoreBySlug } from '../platform/stores.js'
import { fetchPublicStoreBySlug, canUseRemoteBackend } from '../platform/supabase/tenant.js'

function StorePublic() {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true); setError('')
      try {
        if (canUseRemoteBackend()) {
          const remote = await fetchPublicStoreBySlug(slug)
          if (!alive) return
          if (!remote) setError('Comercio no disponible o licencia no operativa.')
          setData(remote)
        } else {
          const store = getStoreBySlug(slug)
          if (!store) setError('Comercio no encontrado (modo local).')
          else setData({ store: { id: store.id, name: store.name, slug: store.slug, logo: store.logo, address: store.address, contact: store.contact }, categories: [], products: [] })
        }
      } catch (e) {
        if (!alive) return
        setError(e?.message || 'No se pudo cargar el comercio.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [slug])

  const store = data?.store

  return (
    <div className="principal">
      <Header />
      <main className="principal-content with-footer">
        <div className="menu-page-header">
          <button type="button" className="back-link as-button" onClick={() => window.history.back()}>← Volver</button>
          <h1>{store?.name || 'Comercio'}</h1>
          <p>{store?.slug ? `Enlace público: /c/${store.slug}` : 'Cargando información pública del comercio.'}</p>
        </div>
        {loading && <p className="muted-text">Cargando…</p>}
        {error && <section className="caja-card"><p className="checkout-error">{error}</p><p className="muted-text">Si el comercio existe pero la licencia no está activa, el catálogo público no se muestra (validación prevista en backend).</p></section>}
        {!loading && !error && store && (
          <section className="caja-card">
            <h2>Catálogo público</h2>
            <p className="muted-text">Modo {canUseRemoteBackend() ? 'backend (Supabase)' : 'local'}: en modo backend se cargan categorías/productos públicos del comercio por slug; en modo local se muestra la ficha del comercio preparado para ruteo multiempresa.</p>
            <p><strong>Dirección:</strong> {store.address || '-'}</p>
            <p><strong>Contacto:</strong> {typeof store.contact === 'string' ? store.contact : (store.contact?.phone || store.contact?.whatsapp || '-')}</p>
            <div className="admin-actions" style={{marginTop:10}}>
              <Link to="/categorias" className="admin-secondary" style={{textDecoration:'none'}}>Ver categorías (sesión actual)</Link>
              <Link to="/inicio" className="admin-primary" style={{textDecoration:'none'}}>Ir al inicio</Link>
            </div>
          </section>
        )}
      </main>
      <FooterNav />
    </div>
  )
}

export default StorePublic
