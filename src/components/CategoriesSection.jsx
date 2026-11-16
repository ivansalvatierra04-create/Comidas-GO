import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories } from '../data/categories.js'

function CategoryIcon({ category }) {
  if (category.image) {
    return <img src={category.image} alt="" className="category-image" />
  }
  return <span className="category-emoji" aria-hidden="true">{category.icon || '🍽️'}</span>
}

function CategoriesSection() {
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

  const preview = categories.slice(0, 6)

  return (
    <section className="categories-section" aria-label="Categorías">
      <div className="categories-header">
        <h2>Categorías</h2>
        <Link to="/categorias" className="categories-link">Ver todas</Link>
      </div>
      <div className="categories-list">
        {preview.map((category) => (
          <Link key={category.id} to={`/categoria/${category.id}`} className="category-card">
            <div className="category-icon-wrap">
              <CategoryIcon category={category} />
            </div>
            <span className="category-name">{category.name}</span>
          </Link>
        ))}
        {preview.length === 0 && <p className="categories-empty">No hay categorías</p>}
      </div>
    </section>
  )
}

export default CategoriesSection
