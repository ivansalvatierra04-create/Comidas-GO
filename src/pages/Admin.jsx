import { useState } from 'react'
import { Link } from 'react-router-dom'
import FooterNav from '../components/FooterNav.jsx'
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

  const addItem = (categoryId) => {
    setCategories((current) =>
      current.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: [...(cat.items || []), { id: createId(), name: 'Nueva comida', description: '', price: '', image: '', discount: '', stock: '', extras: [], removables: [] }],
            }
          : cat,
      ),
    )
  }

  const removeItem = (categoryId, itemId) => {
    setCategories((current) =>
      current.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: (cat.items || []).filter((item) => item.id !== itemId) }
          : cat,
      ),
    )
  }

  const updateItem = (categoryId, itemId, field, value) => {
    setCategories((current) =>
      current.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: (cat.items || []).map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
            }
          : cat,
      ),
    )
  }

  const addExtra = (categoryId, itemId) => {
    setCategories((current) => current.map((cat) => cat.id === categoryId ? {
      ...cat,
      items: (cat.items || []).map((item) => item.id === itemId ? { ...item, extras: [...(item.extras || []), { id: createId(), name: '', price: 0 }] } : item),
    } : cat))
  }
  const updateExtra = (categoryId, itemId, extraId, field, value) => {
    setCategories((current) => current.map((cat) => cat.id === categoryId ? {
      ...cat,
      items: (cat.items || []).map((item) => item.id === itemId ? { ...item, extras: (item.extras || []).map((ex) => ex.id === extraId ? { ...ex, [field]: value } : ex) } : item),
    } : cat))
  }
  const removeExtra = (categoryId, itemId, extraId) => {
    setCategories((current) => current.map((cat) => cat.id === categoryId ? {
      ...cat,
      items: (cat.items || []).map((item) => item.id === itemId ? { ...item, extras: (item.extras || []).filter((ex) => ex.id !== extraId) } : item),
    } : cat))
  }
  const addRemovable = (categoryId, itemId) => {
    setCategories((current) => current.map((cat) => cat.id === categoryId ? {
      ...cat,
      items: (cat.items || []).map((item) => item.id === itemId ? { ...item, removables: [...(item.removables || []), { id: createId(), name: '' }] } : item),
    } : cat))
  }
  const updateRemovable = (categoryId, itemId, remId, value) => {
    setCategories((current) => current.map((cat) => cat.id === categoryId ? {
      ...cat,
      items: (cat.items || []).map((item) => item.id === itemId ? { ...item, removables: (item.removables || []).map((rm) => rm.id === remId ? { ...rm, name: value } : rm) } : item),
    } : cat))
  }
  const removeRemovable = (categoryId, itemId, remId) => {
    setCategories((current) => current.map((cat) => cat.id === categoryId ? {
      ...cat,
      items: (cat.items || []).map((item) => item.id === itemId ? { ...item, removables: (item.removables || []).filter((rm) => rm.id !== remId) } : item),
    } : cat))
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
    setCategories((current) => [...current, { id: createId(), name: 'Nueva categoría', icon: '🍽️', image: '', items: [] }])
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
      items: (cat.items || []).map((item, itemIndex) => {
        const rawStock = item.stock
        const stock = rawStock === '' || rawStock === null || rawStock === undefined || Number.isNaN(Number(rawStock))
          ? null
          : Math.max(0, Math.floor(Number(rawStock)))
        const extras = (item.extras || []).map((ex, i) => ({
          id: ex.id || `${item.id || itemIndex}-ex-${i + 1}`,
          name: String(ex.name || '').trim(),
          price: Math.max(0, Math.round(Number(String(ex.price ?? '').replace(/[^0-9.-]/g, '')) || 0)),
        })).filter((ex) => ex.name)
        const removables = (item.removables || []).map((rm, i) => ({
          id: rm.id || `${item.id || itemIndex}-rm-${i + 1}`,
          name: String(rm.name || '').trim(),
        })).filter((rm) => rm.name)
        return {
          id: item.id || `${cat.id || index + 1}-${itemIndex + 1}`,
          name: item.name?.trim() || 'Sin nombre',
          description: item.description?.trim() || '',
          price: item.price?.trim() || '',
          image: item.image?.trim() || '',
          discount: item.discount?.trim() || '',
          stock,
          extras,
          removables,
        }
      }),
    }))
    setCategories(cleaned)
    saveCategories(cleaned)
    showMessage('Categorías y comidas guardadas')
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
      whatsapp: settings.whatsapp?.trim() || '',
      paymentCashInfo: settings.paymentCashInfo?.trim() || defaultSettings.paymentCashInfo,
      paymentTransferInfo: settings.paymentTransferInfo?.trim() || '',
      paymentMpLink: settings.paymentMpLink?.trim() || '',
      etaPickupMinutes: Number.isFinite(Number(settings.etaPickupMinutes)) ? Math.max(1, Math.floor(Number(settings.etaPickupMinutes))) : defaultSettings.etaPickupMinutes,
      etaDeliveryMinutes: Number.isFinite(Number(settings.etaDeliveryMinutes)) ? Math.max(1, Math.floor(Number(settings.etaDeliveryMinutes))) : defaultSettings.etaDeliveryMinutes,
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
        <p>Cambia el local, las categorías, las comidas, promociones y el carrusel.</p>
      </header>

      <main className="admin-content with-footer-nav">
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

          <h3 className="admin-subsection-title">Cobro y pedidos (WhatsApp)</h3>

          <label className="admin-field">
            <span>WhatsApp del local (para recibir pedidos, con código de país, ej: 5491112345678)</span>
            <input
              type="text"
              value={settings.whatsapp || ''}
              onChange={(e) => updateSetting('whatsapp', e.target.value)}
              placeholder="Ej: 5491112345678"
            />
          </label>
          <label className="admin-field">
            <span>Instrucciones para pago en efectivo</span>
            <input
              type="text"
              value={settings.paymentCashInfo || ''}
              onChange={(e) => updateSetting('paymentCashInfo', e.target.value)}
              placeholder="Ej: Pago en efectivo al recibir/retirar."
            />
          </label>
          <label className="admin-field">
            <span>Datos para transferencia (alias/CBU/instrucciones)</span>
            <textarea
              className="admin-textarea"
              rows={2}
              value={settings.paymentTransferInfo || ''}
              onChange={(e) => updateSetting('paymentTransferInfo', e.target.value)}
              placeholder="Ej: Alias: mi.local  |  CBU: ..."
            />
          </label>
          <label className="admin-field">
            <span>Link de Mercado Pago (o link de cobro)</span>
            <input
              type="text"
              value={settings.paymentMpLink || ''}
              onChange={(e) => updateSetting('paymentMpLink', e.target.value)}
              placeholder="https://..."
            />
          </label>

          <h3 className="admin-subsection-title">Tiempos estimados de pedido</h3>
          <label className="admin-field">
            <span>Tiempo estimado para retiro en local (minutos)</span>
            <input
              type="number"
              min="1"
              step="1"
              value={settings.etaPickupMinutes ?? 20}
              onChange={(e) => updateSetting('etaPickupMinutes', e.target.value)}
            />
          </label>
          <label className="admin-field">
            <span>Tiempo estimado para envío a domicilio (minutos)</span>
            <input
              type="number"
              min="1"
              step="1"
              value={settings.etaDeliveryMinutes ?? 40}
              onChange={(e) => updateSetting('etaDeliveryMinutes', e.target.value)}
            />
          </label>
          <div className="admin-actions">
            <button type="button" className="admin-secondary" onClick={handleResetSettings}>Restaurar local</button>
            <button type="button" className="admin-primary" onClick={handleSaveSettings}>Guardar local</button>
          </div>
        </section>

        <h2 className="admin-section-title standalone">Categorías y comidas</h2>
        {categories.map((cat) => (
          <section key={cat.id} className="admin-card">
            <div className="admin-card-head">
              <h2>{cat.name || 'Categoría'}</h2>
              <button type="button" className="admin-danger" onClick={() => removeCategory(cat.id)}>Eliminar categoría</button>
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
              <span>URL de imagen de categoría (opcional)</span>
              <input type="text" value={(cat.image || '').startsWith('data:') ? '' : (cat.image || '')} onChange={(e) => updateCategory(cat.id, 'image', e.target.value)} placeholder="https://..." />
            </label>
            <label className="admin-field">
              <span>O subir imagen de categoría</span>
              <input type="file" accept="image/*" onChange={(e) => readFileAsDataUrl(e.target.files?.[0], (v) => updateCategory(cat.id, 'image', v))} />
            </label>

            <div className="admin-items">
              <h3 className="admin-subsection-title">Comidas de esta categoría</h3>
              {(cat.items || []).length === 0 && <p className="categories-empty">No hay comidas cargadas.</p>}
              {(cat.items || []).map((item, itemIndex) => (
                <div key={item.id} className="admin-item-card">
                  <div className="admin-card-head">
                    <h2>Comida {itemIndex + 1}</h2>
                    <button type="button" className="admin-danger" onClick={() => removeItem(cat.id, item.id)}>Eliminar comida</button>
                  </div>
                  <label className="admin-field">
                    <span>Nombre</span>
                    <input type="text" value={item.name} onChange={(e) => updateItem(cat.id, item.id, 'name', e.target.value)} />
                  </label>
                  <label className="admin-field">
                    <span>Descripción</span>
                    <textarea className="admin-textarea" rows={2} value={item.description || ''} onChange={(e) => updateItem(cat.id, item.id, 'description', e.target.value)} />
                  </label>
                  <label className="admin-field">
                    <span>Precio</span>
                    <input type="text" value={item.price || ''} onChange={(e) => updateItem(cat.id, item.id, 'price', e.target.value)} placeholder="Ej: $8.500" />
                  </label>
                  <label className="admin-field">
                    <span>Stock disponible (vacío = sin límite)</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.stock ?? ''}
                      onChange={(e) => updateItem(cat.id, item.id, 'stock', e.target.value)}
                      placeholder="Ej: 10"
                    />
                  </label>
                  <label className="admin-field">
                    <span>Descuento (opcional)</span>
                    <input type="text" value={item.discount || ''} onChange={(e) => updateItem(cat.id, item.id, 'discount', e.target.value)} placeholder="Ej: 10% OFF" />
                  </label>
                  <label className="admin-field">
                    <span>URL de imagen</span>
                    <input type="text" value={(item.image || '').startsWith('data:') ? '' : (item.image || '')} onChange={(e) => updateItem(cat.id, item.id, 'image', e.target.value)} placeholder="https://..." />
                  </label>
                  <label className="admin-field">
                    <span>O subir imagen</span>
                    <input type="file" accept="image/*" onChange={(e) => readFileAsDataUrl(e.target.files?.[0], (v) => updateItem(cat.id, item.id, 'image', v))} />
                  </label>
                  {item.image ? <img src={item.image} alt={item.name} className="admin-preview" /> : <div className="admin-preview empty">Sin imagen</div>}

                  <div className="admin-mods">
                    <h4 className="admin-subsection-title">Agregados (extras con costo opcional)</h4>
                    {(item.extras || []).map((ex) => (
                      <div key={ex.id} className="admin-mod-row">
                        <input type="text" value={ex.name || ''} onChange={(e) => updateExtra(cat.id, item.id, ex.id, 'name', e.target.value)} placeholder="Ej: Queso extra" />
                        <input type="number" min="0" step="1" value={ex.price ?? 0} onChange={(e) => updateExtra(cat.id, item.id, ex.id, 'price', e.target.value)} placeholder="Precio" />
                        <button type="button" className="admin-danger" onClick={() => removeExtra(cat.id, item.id, ex.id)}>Quitar</button>
                      </div>
                    ))}
                    <button type="button" className="admin-secondary" onClick={() => addExtra(cat.id, item.id)}>Agregar extra</button>
                  </div>

                  <div className="admin-mods">
                    <h4 className="admin-subsection-title">Opciones para quitar (ingredientes incluidos)</h4>
                    {(item.removables || []).map((rm) => (
                      <div key={rm.id} className="admin-mod-row">
                        <input type="text" value={rm.name || ''} onChange={(e) => updateRemovable(cat.id, item.id, rm.id, e.target.value)} placeholder="Ej: Cebolla" />
                        <button type="button" className="admin-danger" onClick={() => removeRemovable(cat.id, item.id, rm.id)}>Quitar</button>
                      </div>
                    ))}
                    <button type="button" className="admin-secondary" onClick={() => addRemovable(cat.id, item.id)}>Agregar opción para quitar</button>
                  </div>
                </div>
              ))}
              <button type="button" className="admin-secondary" onClick={() => addItem(cat.id)}>Agregar comida a esta categoría</button>
            </div>
          </section>
        ))}
        <div className="admin-actions">
          <button type="button" className="admin-secondary" onClick={addCategory}>Agregar categoría</button>
          <button type="button" className="admin-secondary" onClick={handleResetCategories}>Restaurar categorías y comidas</button>
          <button type="button" className="admin-primary" onClick={handleSaveCategories}>Guardar categorías y comidas</button>
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
      <FooterNav />
    </div>
  )
}

export default Admin
