import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'
import { getCategories } from '../data/categories.js'

function CategoryIcon({ category }) {
  if (category.image) {
    return <img src={category.image} alt="" className="category-image" />
  }
  return <span className="category-emoji" aria-hidden="true">{category.icon || '🍽️'}</span>
}

function Categorias() {
  const [categories, setCategories] = useState(() => getCategories())

  useEffect(() => {
    const sync = () => setCategories(getCategories())
    window.addEventListener('storage', sync)
    window.addEventListener('categories-updated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('categories-updated', sync)
    }
  }, [])

  return (
    <div className="principal">
      <Header />
      <main className="principal-content with-footer">
        <div className="all-categories-header">
          <h1>Todas las categorías</h1>
          <Link to="/inicio" className="back-link">Volver</Link>
        </div>
        <div className="all-categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card large">
              <div className="category-icon-wrap">
                <CategoryIcon category={category} />
              </div>
              <span className="category-name">{category.name}</span>
            </div>
          ))}
          {categories.length === 0 && <p className="categories-empty">No hay categorías cargadas.</p>}
        </div>
      </main>
      <FooterNav />
    </div>
  )
}

export default Categorias
