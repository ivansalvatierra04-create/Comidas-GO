import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories, saveCategories, defaultCategories } from '../data/categories.js'
import { getPromotions, savePromotions, defaultPromotions } from '../data/promotions.js'
import { getSlides, saveSlides, defaultSlides } from '../data/slides.js'
import { getSettings, saveSettings, defaultSettings } from '../data/settings.js'

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function readFileAsDataUrl(file, onLoad) {
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => onLoad(String(reader.result || ''))
  reader.readAsDataURL(file)
}

function Admin() {
  const [slides, setSlides] = useState(() => getSlides())
  const [categories, setCategories] = useState(() => getCategories())
  const [promotions, setPromotions] = useState(() => getPromotions())
  const [settings, setSettings] = useState(() => getSettings())
  const [message, setMessage] = useState('')

  const showMessage = (text) => {
    setMessage(text)
    setTimeout(() => setMessage(''), 2200)
  }

  const updateSlide = (id, field, value) => {
    setSlides((current) => current.map((slide) => (slide.id === id ? { ...slide, [field]: value } : slide)))
  }

  const updateCategory = (id, field, value) => {
    setCategories((current) => current.map((cat) => (cat.id === id ? { ...cat, [field]: value } : cat)))
  }

  const updatePromotion = (id, field, value) => {
    setPromotions((current) => current.map((promo) => (promo.id === id ? { ...promo, [field]: value } : promo)))
  }

  const updateSetting = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }))
  }

  const addSlide = () => {
    setSlides((current) => [...current, { id: createId(), title: 'Nueva comida', image: '' }])
  }

  const removeSlide = (id) => {
    setSlides((current) => (current.length === 1 ? current : current.filter((slide) => slide.id !== id)))
  }

  const addCategory = () => {
    setCategories((current) => [...current, { id: createId(), name: 'Nueva categoría', icon: '🍽️', image: '' }])
  }

  const removeCategory = (id) => {
    setCategories((current) => current.filter((cat) => cat.id !== id))
  }

  const addPromotion = () => {
    setPromotions((current) => [...current, { id: createId(), title: 'Nueva promoción', description: '', discount: '', image: '' }])
  }

  const removePromotion = (id) => {
    setPromotions((current) => current.filter((promo) => promo.id !== id))
  }

  const handleSaveSlides = () => {
    const cleaned = slides.map((slide, index) => ({
      id: slide.id || String(index + 1),
      title: slide.title?.trim() || 'Sin nombre',
      image: slide.image?.trim() || '',
    }))
    setSlides(cleaned)
    saveSlides(cleaned)
    window.dispatchEvent(new Event('slides-updated'))
    showMessage('Carrusel guardado')
  }

  const handleResetSlides = () => {
    setSlides(defaultSlides)
    saveSlides(defaultSlides)
    window.dispatchEvent(new Event('slides-updated'))
    showMessage('Carrusel restaurado')
  }

  const handleSaveCategories = () => {
    const cleaned = categories.map((cat, index) => ({
      id: cat.id || String(index + 1),
      name: cat.name?.trim() || 'Sin nombre',
      icon: cat.icon?.trim() || '🍽️',
      image: cat.image?.trim() || '',
    }))
    setCategories(cleaned)
    saveCategories(cleaned)
    window.dispatchEvent(new Event('categories-updated'))
    showMessage('Categorías guardadas')
  }

  const handleResetCategories = () => {
    setCategories(defaultCategories)
    saveCategories(defaultCategories)
    window.dispatchEvent(new Event('categories-updated'))
    showMessage('Categorías restauradas')
  }

  const handleSavePromotions = () => {
    const cleaned = promotions.map((promo, index) => ({
      id: promo.id || String(index + 1),
      title: promo.title?.trim() || 'Promoción',
      description: promo.description?.trim() || '',
      discount: promo.discount?.trim() || '',
      image: promo.image?.trim() || '',
    }))
    setPromotions(cleaned)
    savePromotions(cleaned)
    window.dispatchEvent(new Event('promotions-updated'))
    showMessage('Promociones guardadas')
  }

  const handleResetPromotions = () => {
    setPromotions(defaultPromotions)
    savePromotions(defaultPromotions)
    window.dispatchEvent(new Event('promotions-updated'))
    showMessage('Promociones restauradas')
  }

  const handleSaveSettings = () => {
    const cleaned = {
      storeName1: settings.storeName1?.trim() || defaultSettings.storeName1,
      storeName2: settings.storeName2?.trim() || '',
      tagline: settings.tagline?.trim() || defaultSettings.tagline,
      logo: settings.logo?.trim() || '',
      backgroundImage: settings.backgroundImage?.trim() || '',
      backgroundColor1: settings.backgroundColor1 || defaultSettings.backgroundColor1,
      backgroundColor2: settings.backgroundColor2 || defaultSettings.backgroundColor2,
      aboutPhoto: settings.aboutPhoto?.trim() || '',
      phone: settings.phone?.trim() || '',
      address: settings.address?.trim() || '',
    }
    setSettings(cleaned)
    saveSettings(cleaned)
    window.dispatchEvent(new Event('settings-updated'))
    showMessage('Configuración del local guardada')
  }

  const handleResetSettings = () => {
    setSettings(defaultSettings)
    saveSettings(defaultSettings)
    window.dispatchEvent(new Event('settings-updated'))
    showMessage('Configuración restaurada')
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <Link to="/inicio" className="admin-back">← Volver</Link>
        <h1>Administrar app</h1>
        <p>Cambia el local, las categorías y el carrusel.</p>
      </header>

      <main className="admin-content">
        <section className="admin-card">
          <h2 className="admin-section-title">Configuración del local</h2>

          <label className="admin-field">
            <span>Nombre del local (parte 1)</span>
            <input type="text" value={settings.storeName1} onChange={(e) => updateSetting('storeName1', e.target.value)} />
          </label>
          <label className="admin-field">
            <span>Nombre del local (parte 2)</span>
            <input type="text" value={settings.storeName2} onChange={(e) => updateSetting('storeName2', e.target.value)} />
          </label>
          <label className="admin-field">
            <span>Frase</span>
            <input type="text" value={settings.tagline} onChange={(e) => updateSetting('tagline', e.target.value)} />
          </label>
          <label className="admin-field">
            <span>URL del logo</span>
            <input type="text" value={settings.logo.startsWith('data:') ? '' : settings.logo} onChange={(e) => updateSetting('logo', e.target.value)} placeholder="https://..." />
          </label>
          <label className="admin-field">
            <span>O subir logo</span>
            <input type="file" accept="image/*" onChange={(e) => readFileAsDataUrl(e.target.files?.[0], (v) => updateSetting('logo', v))} />
          </label>
          <div className="admin-color-row">
            <label className="admin-field">
              <span>Color fondo 1</span>
              <input type="color" value={settings.backgroundColor1} onChange={(e) => updateSetting('backgroundColor1', e.target.value)} />
            </label>
            <label className="admin-field">
              <span>Color fondo 2</span>
              <input type="color" value={settings.backgroundColor2} onChange={(e) => updateSetting('backgroundColor2', e.target.value)} />
            </label>
          </div>
          <label className="admin-field">
            <span>URL imagen de fondo (opcional)</span>
            <input type="text" value={settings.backgroundImage.startsWith('data:') ? '' : settings.backgroundImage} onChange={(e) => updateSetting('backgroundImage', e.target.value)} placeholder="https://..." />
          </label>
          <label className="admin-field">
            <span>O subir imagen de fondo</span>
            <input type="file" accept="image/*" onChange={(e) => readFileAsDataUrl(e.target.files?.[0], (v) => updateSetting('backgroundImage', v))} />
          </label>
          {settings.backgroundImage && (
            <button type="button" className="admin-secondary" onClick={() => updateSetting('backgroundImage', '')}>Quitar imagen de fondo</button>
          )}

          <h3 className="admin-subsection-title">Sección Nosotros</h3>

          <label className="admin-field">
            <span>URL de foto del local</span>
            <input
              type="text"
              value={settings.aboutPhoto.startsWith('data:') ? '' : settings.aboutPhoto}
              onChange={(e) => updateSetting('aboutPhoto', e.target.value)}
              placeholder="https://..."
            />
          </label>
          <label className="admin-field">
            <span>O subir foto del local</span>
            <input type="file" accept="image/*" onChange={(e) => readFileAsDataUrl(e.target.files?.[0], (v) => updateSetting('aboutPhoto', v))} />
          </label>
          {settings.aboutPhoto && <img src={settings.aboutPhoto} alt="Foto del local" className="admin-preview" />}

          <label className="admin-field">
            <span>Teléfono</span>
            <input type="text" value={settings.phone} onChange={(e) => updateSetting('phone', e.target.value)} placeholder="Ej: +54 11 1234-5678" />
          </label>
          <label className="admin-field">
            <span>Ubicación / datos del local</span>
            <textarea
              className="admin-textarea"
              value={settings.address}
              onChange={(e) => updateSetting('address', e.target.value)}
              placeholder="Ej: Av. Siempre Viva 123, Ciudad"
              rows={3}
            />
          </label>
          <div className="admin-actions">
            <button type="button" className="admin-secondary" onClick={handleResetSettings}>Restaurar local</button>
            <button type="button" className="admin-primary" onClick={handleSaveSettings}>Guardar local</button>
          </div>
        </section>

        <h2 className="admin-section-title standalone">Categorías</h2>
        {categories.map((cat) => (
          <section key={cat.id} className="admin-card">
            <div className="admin-card-head">
              <h2>{cat.name || 'Categoría'}</h2>
              <button type="button" className="admin-danger" onClick={() => removeCategory(cat.id)}>Eliminar</button>
            </div>
            <label className="admin-field">
              <span>Nombre de la categoría</span>
              <input type="text" value={cat.name} onChange={(e) => updateCategory(cat.id, 'name', e.target.value)} placeholder="Ej: Pizzas" />
            </label>
            <label className="admin-field">
              <span>Ícono (emoji, ej: 🍕)</span>
              <input type="text" value={cat.icon} onChange={(e) => updateCategory(cat.id, 'icon', e.target.value)} placeholder="🍕" />
            </label>
            <label className="admin-field">
              <span>URL de imagen (opcional, reemplaza emoji)</span>
              <input type="text" value={cat.image.startsWith('data:') ? '' : cat.image} onChange={(e) => updateCategory(cat.id, 'image', e.target.value)} placeholder="https://..." />
            </label>
            <label className="admin-field">
              <span>O subir imagen</span>
              <input type="file" accept="image/*" onChange={(e) => readFileAsDataUrl(e.target.files?.[0], (v) => updateCategory(cat.id, 'image', v))} />
            </label>
            {(cat.image || cat.icon) && (
              <div className="admin-category-preview">
                {cat.image ? <img src={cat.image} alt={cat.name} /> : <span>{cat.icon}</span>}
              </div>
            )}
          </section>
        ))}
        <div className="admin-actions">
          <button type="button" className="admin-secondary" onClick={addCategory}>Agregar categoría</button>
          <button type="button" className="admin-secondary" onClick={handleResetCategories}>Restaurar categorías</button>
          <button type="button" className="admin-primary" onClick={handleSaveCategories}>Guardar categorías</button>
        </div>

        <h2 className="admin-section-title standalone">Promociones</h2>
        {promotions.map((promo) => (
          <section key={promo.id} className="admin-card">
            <div className="admin-card-head">
              <h2>{promo.title || 'Promoción'}</h2>
              <button type="button" className="admin-danger" onClick={() => removePromotion(promo.id)}>Eliminar</button>
            </div>
            <label className="admin-field">
              <span>Título / producto</span>
              <input type="text" value={promo.title} onChange={(e) => updatePromotion(promo.id, 'title', e.target.value)} placeholder="Ej: Promo Hamburguesa" />
            </label>
            <label className="admin-field">
              <span>Descripción</span>
              <input type="text" value={promo.description} onChange={(e) => updatePromotion(promo.id, 'description', e.target.value)} placeholder="Ej: Hamburguesa con papas" />
            </label>
            <label className="admin-field">
              <span>Descuento</span>
              <input type="text" value={promo.discount} onChange={(e) => updatePromotion(promo.id, 'discount', e.target.value)} placeholder="Ej: 20% OFF, 2x1" />
            </label>
            <label className="admin-field">
              <span>URL de imagen (opcional)</span>
              <input type="text" value={promo.image.startsWith('data:') ? '' : promo.image} onChange={(e) => updatePromotion(promo.id, 'image', e.target.value)} placeholder="https://..." />
            </label>
            <label className="admin-field">
              <span>O subir imagen</span>
              <input type="file" accept="image/*" onChange={(e) => readFileAsDataUrl(e.target.files?.[0], (v) => updatePromotion(promo.id, 'image', v))} />
            </label>
            {promo.image ? <img src={promo.image} alt={promo.title} className="admin-preview" /> : <div className="admin-preview empty">Sin imagen</div>}
          </section>
        ))}
        <div className="admin-actions">
          <button type="button" className="admin-secondary" onClick={addPromotion}>Agregar promoción</button>
          <button type="button" className="admin-secondary" onClick={handleResetPromotions}>Restaurar promociones</button>
          <button type="button" className="admin-primary" onClick={handleSavePromotions}>Guardar promociones</button>
        </div>

        <h2 className="admin-section-title standalone">Carrusel</h2>
        {slides.map((slide, index) => (
          <section key={slide.id} className="admin-card">
            <div className="admin-card-head">
              <h2>Slide {index + 1}</h2>
              <button type="button" className="admin-danger" onClick={() => removeSlide(slide.id)}>Eliminar</button>
            </div>
            <label className="admin-field">
              <span>Nombre de la comida</span>
              <input type="text" value={slide.title} onChange={(e) => updateSlide(slide.id, 'title', e.target.value)} />
            </label>
            <label className="admin-field">
              <span>URL de imagen</span>
              <input type="text" value={slide.image.startsWith('data:') ? '' : slide.image} onChange={(e) => updateSlide(slide.id, 'image', e.target.value)} placeholder="https://..." />
            </label>
            <label className="admin-field">
              <span>O subir imagen</span>
              <input type="file" accept="image/*" onChange={(e) => readFileAsDataUrl(e.target.files?.[0], (v) => updateSlide(slide.id, 'image', v))} />
            </label>
            {slide.image ? <img src={slide.image} alt={slide.title} className="admin-preview" /> : <div className="admin-preview empty">Sin imagen</div>}
          </section>
        ))}
        <div className="admin-actions">
          <button type="button" className="admin-secondary" onClick={addSlide}>Agregar slide</button>
          <button type="button" className="admin-secondary" onClick={handleResetSlides}>Restaurar carrusel</button>
          <button type="button" className="admin-primary" onClick={handleSaveSlides}>Guardar carrusel</button>
        </div>

        {message && <p className="admin-message">{message}</p>}
      </main>
    </div>
  )
}

export default Admin
