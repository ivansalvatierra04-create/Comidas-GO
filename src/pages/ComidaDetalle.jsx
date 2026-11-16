import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'
import { addToCart } from '../data/cart.js'
import { getItemById } from '../data/categories.js'

function ComidaDetalle() {
  const { categoryId, itemId } = useParams()
  const [data, setData] = useState(() => getItemById(categoryId, itemId))
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const sync = () => setData(getItemById(categoryId, itemId))
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener('categories-updated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('categories-updated', sync)
    }
  }, [categoryId, itemId])

  const { category, item } = data

  if (!category || !item) {
    return (
      <div className="principal">
        <Header />
        <main className="principal-content with-footer">
          <div className="menu-page-header">
            <Link to={category ? `/categoria/${category.id}` : '/categorias'} className="back-link">← Volver</Link>
          </div>
          <p className="categories-empty">Comida no encontrada.</p>
        </main>
        <FooterNav />
      </div>
    )
  }

  return (
    <div className="principal">
      <Header />
      <main className="principal-content with-footer">
        <div className="menu-page-header">
          <Link to={`/categoria/${category.id}`} className="back-link">← Volver a {category.name}</Link>
        </div>

        <article className="food-detail-card">
          {item.image ? (
            <img src={item.image} alt={item.name} className="food-detail-image" />
          ) : (
            <div className="food-detail-image placeholder">Sin foto</div>
          )}
          <div className="food-detail-body">
            <div className="menu-item-top">
              <h1>{item.name}</h1>
              {item.discount && <span className="promo-badge">{item.discount}</span>}
            </div>
            {item.price && <p className="food-detail-price">{item.price}</p>}
            {item.description && <p className="food-detail-desc">{item.description}</p>}
            {!item.description && <p className="food-detail-desc muted">Sin descripción adicional.</p>}

            <div className="add-cart-row">
              <div className="qty-control">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
              <button
                type="button"
                className="add-cart-button"
                onClick={() => {
                  addToCart({ itemId: item.id, categoryId: category.id, name: item.name, price: item.price, image: item.image, discount: item.discount }, quantity)
                  setAdded(true)
                  setTimeout(() => setAdded(false), 1800)
                }}
              >
                Agregar al carrito
              </button>
            </div>
            {added && <p className="added-msg">Agregado al carrito</p>}
          </div>
        </article>
      </main>
      <FooterNav />
    </div>
  )
}

export default ComidaDetalle
