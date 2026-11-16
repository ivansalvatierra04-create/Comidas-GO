import { useEffect, useState } from 'react'
import { getSlides } from '../data/slides.js'

function Carousel() {
  const [slides, setSlides] = useState(() => getSlides())
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const sync = () => {
      setSlides(getSlides())
      setIndex(0)
    }
    window.addEventListener('storage', sync)
    window.addEventListener('slides-updated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('slides-updated', sync)
    }
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return undefined
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length)
    }, 3000)
    return () => clearInterval(id)
  }, [slides.length])

  if (!slides.length) return null

  return (
    <section className="carousel" aria-label="Promociones destacadas">
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide) => (
          <article
            key={slide.id}
            className="carousel-slide"
            style={{
              backgroundImage: slide.image
                ? `linear-gradient(180deg, rgba(6,22,42,0.15), rgba(6,22,42,0.75)), url(${slide.image})`
                : 'linear-gradient(135deg, #0b2340, #163a63)',
            }}
          >
            <div className="carousel-slide-content">
              <h2>{slide.title}</h2>
            </div>
          </article>
        ))}
      </div>
      <div className="carousel-dots" aria-hidden="true">
        {slides.map((slide, i) => (
          <span
            key={slide.id}
            className={`carousel-dot ${i === index ? 'active' : ''}`}
          />
        ))}
      </div>
    </section>
  )
}

export default Carousel
