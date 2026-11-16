import { useNavigate } from 'react-router-dom'
import AboutSection from '../components/AboutSection.jsx'
import Carousel from '../components/Carousel.jsx'
import CategoriesSection from '../components/CategoriesSection.jsx'
import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'
import PromotionsSection from '../components/PromotionsSection.jsx'

function Principal() {
  const navigate = useNavigate()
  return (
    <div className="principal">
      <Header />
      <main className="principal-content with-footer">
        <div className="page-back-row">
          <button type="button" className="back-link" onClick={() => navigate(-1)}>← Volver</button>
        </div>
        <Carousel />
        <CategoriesSection />
        <PromotionsSection />
        <AboutSection />
      </main>
      <FooterNav />
    </div>
  )
}

export default Principal
