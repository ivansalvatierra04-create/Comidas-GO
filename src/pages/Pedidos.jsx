import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'

function Pedidos() {
  return (
    <div className="principal">
      <Header />
      <main className="principal-content with-footer">
        <section className="orders-placeholder">
          <h1>Mis pedidos</h1>
          <p>Aquí se mostrarán tus pedidos.</p>
        </section>
      </main>
      <FooterNav />
    </div>
  )
}

export default Pedidos
