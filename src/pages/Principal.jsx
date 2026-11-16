import AboutSection from '../components/AboutSection.jsx'
import Carousel from '../components/Carousel.jsx'
import CategoriesSection from '../components/CategoriesSection.jsx'
import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'
import PromotionsSection from '../components/PromotionsSection.jsx'

function Principal() {
  return (
    <div className="principal">
      <Header />
      <main className="principal-content with-footer">
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
