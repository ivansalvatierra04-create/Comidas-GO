import { useEffect, useState } from 'react'
import { getPromotions } from '../data/promotions.js'

function PromotionsSection() {
  const [promotions, setPromotions] = useState(() => getPromotions())

  useEffect(() => {
    const sync = () => setPromotions(getPromotions())
    window.addEventListener('storage', sync)
    window.addEventListener('promotions-updated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('promotions-updated', sync)
    }
  }, [])

  if (!promotions.length) return null

  return (
    <section className="promotions-section" aria-label="Promociones">
      <div className="promotions-header">
        <h2>Promociones</h2>
      </div>
      <div className="promotions-list">
        {promotions.map((promo) => (
          <article key={promo.id} className="promo-card">
            {promo.image ? (
              <img src={promo.image} alt={promo.title} className="promo-image" />
            ) : (
              <div className="promo-image placeholder">Promo</div>
            )}
            <div className="promo-info">
              <div className="promo-top">
                <h3>{promo.title}</h3>
                {promo.discount && <span className="promo-badge">{promo.discount}</span>}
              </div>
              {promo.description && <p>{promo.description}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default PromotionsSection
