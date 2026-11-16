import { useEffect, useState } from 'react'
import { getSettings } from '../data/settings.js'

function AboutSection() {
  const [settings, setSettings] = useState(() => getSettings())

  useEffect(() => {
    const sync = () => setSettings(getSettings())
    window.addEventListener('storage', sync)
    window.addEventListener('settings-updated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('settings-updated', sync)
    }
  }, [])

  const hasInfo = settings.aboutPhoto || settings.phone || settings.address

  return (
    <section className="about-section" aria-label="Nosotros">
      <h2>Nosotros</h2>
      <div className="about-card">
        {settings.aboutPhoto ? (
          <img src={settings.aboutPhoto} alt="Foto del local" className="about-photo" />
        ) : (
          <div className="about-photo placeholder">Foto del local</div>
        )}
        <div className="about-details">
          <p>
            <strong>Teléfono:</strong>{' '}
            {settings.phone || 'Agrega un teléfono desde administración'}
          </p>
          <p>
            <strong>Ubicación:</strong>{' '}
            {settings.address || 'Agrega la ubicación/datos del local desde administración'}
          </p>
          {!hasInfo && (
            <p className="about-hint">El dueño puede completar esta sección desde Administrar app.</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default AboutSection
