import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'
import { addToCart, getCart } from '../data/cart.js'
import { getItemById, getItemStock } from '../data/categories.js'

function ComidaDetalle() {
  const { categoryId, itemId } = useParams()
  const [data, setData] = useState(() => getItemById(categoryId, itemId))
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [cart, setCart] = useState(() => getCart())

  useEffect(() => {
    const sync = () => {
      setData(getItemById(categoryId, itemId))
      setCart(getCart())
    }
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener('categories-updated', sync)
    window.addEventListener('cart-updated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('categories-updated', sync)
      window.removeEventListener('cart-updated', sync)
    }
  }, [categoryId, itemId])

  const { category, item } = data
  const stock = item ? getItemStock(item) : null
  const inCartQty = item ? (cart.items.find((c) => String(c.itemId) === String(item.id) && String(c.categoryId) === String(category?.id))?.quantity || 0) : 0
  const remaining = stock === null ? null : Math.max(0, stock - inCartQty)
  const maxToAdd = remaining === null ? 99 : remaining
  const outOfStock = stock !== null && stock <= 0
  const noMoreAvailable = remaining !== null && remaining <= 0

  useEffect(() => {
    if (maxToAdd <= 0) {
      setQuantity(1)
    } else if (quantity > maxToAdd) {
      setQuantity(maxToAdd)
    }
  }, [maxToAdd, quantity])

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
            <p className={`stock-label ${outOfStock || noMoreAvailable ? 'out' : ''}`}>
              {stock === null
                ? 'Stock: disponible'
                : outOfStock
                  ? 'Sin stock'
                  : `Disponible: ${stock}${inCartQty > 0 ? ` (en tu carrito: ${inCartQty})` : ''}`}
            </p>
            {item.description && <p className="food-detail-desc">{item.description}</p>}
            {!item.description && <p className="food-detail-desc muted">Sin descripción adicional.</p>}

            <div className="add-cart-row">
              <div className="qty-control">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={noMoreAvailable || outOfStock}>-</button>
                <span>{noMoreAvailable || outOfStock ? 0 : quantity}</span>
                <button type="button" onClick={() => setQuantity((q) => Math.min(maxToAdd || 1, q + 1))} disabled={noMoreAvailable || outOfStock || quantity >= maxToAdd}>+</button>
              </div>
              <button
                type="button"
                className="add-cart-button"
                disabled={noMoreAvailable || outOfStock}
                onClick={() => {
                  if (noMoreAvailable || outOfStock) return
                  addToCart({ itemId: item.id, categoryId: category.id, name: item.name, price: item.price, image: item.image, discount: item.discount }, quantity, stock)
                  setAdded(true)
                  setTimeout(() => setAdded(false), 1800)
                }}
              >
                {noMoreAvailable ? 'Sin stock disponible' : outOfStock ? 'Sin stock' : 'Agregar al carrito'}
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
