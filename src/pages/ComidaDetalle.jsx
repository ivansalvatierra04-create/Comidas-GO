import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'
import { addToCart, formatCurrency, getCart, getCartItemQtyForProduct, parsePriceValue } from '../data/cart.js'
import { getItemById, getItemStock } from '../data/categories.js'

function ComidaDetalle() {
  const { categoryId, itemId } = useParams()
  const [data, setData] = useState(() => getItemById(categoryId, itemId))
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [cart, setCart] = useState(() => getCart())
  const [selectedExtras, setSelectedExtras] = useState([])
  const [removedItems, setRemovedItems] = useState([])

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

  useEffect(() => {
    setSelectedExtras([])
    setRemovedItems([])
    setQuantity(1)
  }, [itemId, categoryId])

  const stock = item ? getItemStock(item) : null
  const inCartQty = item && category ? getCartItemQtyForProduct(category.id, item.id) : 0
  const remaining = stock === null ? null : Math.max(0, stock - inCartQty)
  const maxToAdd = remaining === null ? 99 : remaining
  const outOfStock = stock !== null && stock <= 0
  const noMoreAvailable = remaining !== null && remaining <= 0

  const extras = Array.isArray(item?.extras) ? item.extras : []
  const removables = Array.isArray(item?.removables) ? item.removables : []

  const extrasTotal = useMemo(
    () => extras.filter((e) => selectedExtras.includes(e.id)).reduce((sum, e) => sum + (Number(e.price) || 0), 0),
    [extras, selectedExtras],
  )
  const basePrice = parsePriceValue(item?.price)
  const unitPriceValue = basePrice + extrasTotal

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

  const toggleExtra = (id) => {
    setSelectedExtras((curr) => curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id])
  }
  const toggleRemoved = (id) => {
    setRemovedItems((curr) => curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id])
  }

  const selectedExtraObjs = extras.filter((e) => selectedExtras.includes(e.id)).map((e) => ({ id: e.id, name: e.name, price: Number(e.price) || 0 }))
  const removedObjs = removables.filter((r) => removedItems.includes(r.id)).map((r) => ({ id: r.id, name: r.name }))

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
            <p className="food-detail-price">{formatCurrency(unitPriceValue)} {extrasTotal > 0 && <span className="price-base-note">(base {item.price || formatCurrency(basePrice)})</span>}</p>
            <p className={`stock-label ${outOfStock || noMoreAvailable ? 'out' : ''}`}>
              {stock === null
                ? 'Stock: disponible'
                : outOfStock
                  ? 'Sin stock'
                  : `Disponible: ${stock}${inCartQty > 0 ? ` (en tu carrito: ${inCartQty})` : ''}`}
            </p>
            {item.description && <p className="food-detail-desc">{item.description}</p>}
            {!item.description && <p className="food-detail-desc muted">Sin descripción adicional.</p>}

            {extras.length > 0 && (
              <div className="mods-section">
                <h3>Agregados</h3>
                <div className="mods-list">
                  {extras.map((ex) => (
                    <label key={ex.id} className="mod-option">
                      <input type="checkbox" checked={selectedExtras.includes(ex.id)} onChange={() => toggleExtra(ex.id)} />
                      <span>{ex.name}</span>
                      <span className="mod-price">{(Number(ex.price) || 0) > 0 ? `+${formatCurrency(ex.price)}` : 'Gratis'}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {removables.length > 0 && (
              <div className="mods-section">
                <h3>Quitar (opcional)</h3>
                <div className="mods-list">
                  {removables.map((rm) => (
                    <label key={rm.id} className="mod-option">
                      <input type="checkbox" checked={removedItems.includes(rm.id)} onChange={() => toggleRemoved(rm.id)} />
                      <span>Sin {rm.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

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
                  const res = addToCart({
                    itemId: item.id,
                    categoryId: category.id,
                    name: item.name,
                    price: formatCurrency(unitPriceValue),
                    priceValue: unitPriceValue,
                    image: item.image,
                    discount: item.discount,
                    modifiers: { extras: selectedExtraObjs, removed: removedObjs },
                  }, quantity, stock)
                  if (res?.added > 0) {
                    setAdded(true)
                    setTimeout(() => setAdded(false), 1800)
                  }
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
