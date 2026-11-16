import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FooterNav from '../components/FooterNav.jsx'
import defaultLogo from '../assets/logo.svg'
import { getSettings } from '../data/settings.js'

function Home() {
  const navigate = useNavigate()
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

  const logo = settings.logo || defaultLogo
  const background = settings.backgroundImage
    ? `linear-gradient(180deg, rgba(6,22,42,0.35), rgba(6,22,42,0.35)), url(${settings.backgroundImage}) center/cover no-repeat`
    : `radial-gradient(120% 60% at 50% 0%, ${settings.backgroundColor1} 0%, ${settings.backgroundColor2} 45%, ${settings.backgroundColor2} 100%)`

  return (
    <div className="home-wrap">
      <main className="home with-footer-nav" style={{ background }}>
        <div className="home-hero">
          <button type="button" className="home-back" onClick={() => navigate(-1)}>← Volver</button>
          <img src={logo} alt={`Logo de ${settings.storeName1}${settings.storeName2}`} className="home-logo" />
          <h1 className="home-title">
            <span className="home-title-comidas">{settings.storeName1}</span>
            <span className="home-title-go">{settings.storeName2}</span>
          </h1>
          <p className="home-tagline">{settings.tagline}</p>
          <button type="button" className="home-button" onClick={() => navigate('/inicio')}>
            Entrar
          </button>
        </div>
      </main>
      <FooterNav />
    </div>
  )
}

export default Home
