import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'
import { getCategoryById } from '../data/categories.js'

function CategoriaMenu() {
  const { categoryId } = useParams()
  const [category, setCategory] = useState(() => getCategoryById(categoryId))

  useEffect(() => {
    const sync = () => setCategory(getCategoryById(categoryId))
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener('categories-updated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('categories-updated', sync)
    }
  }, [categoryId])

  if (!category) {
    return (
      <div className="principal">
        <Header />
        <main className="principal-content with-footer">
          <div className="menu-page-header">
            <Link to="/categorias" className="back-link">← Volver</Link>
          </div>
          <p className="categories-empty">Categoría no encontrada.</p>
        </main>
        <FooterNav />
      </div>
    )
  }

  const items = category.items || []

  return (
    <div className="principal">
      <Header />
      <main className="principal-content with-footer">
        <div className="menu-page-header">
          <Link to="/categorias" className="back-link">← Volver</Link>
          <h1>{category.icon} {category.name}</h1>
          <p>Elegí una comida para ver sus detalles.</p>
        </div>

        {items.length === 0 ? (
          <p className="categories-empty">No hay comidas cargadas en esta categoría.</p>
        ) : (
          <div className="menu-items-grid">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/categoria/${category.id}/comida/${item.id}`}
                className="menu-item-card"
              >
                {item.image ? (
                  <img src={item.image} alt={item.name} className="menu-item-image" />
                ) : (
                  <div className="menu-item-image placeholder">Sin foto</div>
                )}
                <div className="menu-item-body">
                  <div className="menu-item-top">
                    <h2>{item.name}</h2>
                    {item.discount && <span className="promo-badge">{item.discount}</span>}
                  </div>
                  {item.description && <p className="menu-item-desc">{item.description}</p>}
                  {item.price && <p className="menu-item-price">{item.price}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <FooterNav />
    </div>
  )
}

export default CategoriaMenu
