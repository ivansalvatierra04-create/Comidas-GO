import { Link } from 'react-router-dom'
import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'

function ManualCliente() {
  return (
    <div className="principal">
      <Header />
      <main className="principal-content with-footer manual-page">
        <div className="menu-page-header">
          <button type="button" className="back-link as-button" onClick={() => window.history.back()}>← Volver</button>
          <h1>Ayuda para clientes</h1>
          <p>Cómo usar la app para ver el menú y hacer tu pedido.</p>
        </div>

        <section className="caja-card manual-section">
          <h2>1. Ver el menú</h2>
          <ul>
            <li>Desde <strong>Inicio</strong> explorá categorías, promociones y el carrusel.</li>
            <li>Entrá a una <strong>categoría</strong> para ver sus productos.</li>
            <li>Tocá un producto para ver detalles, precio, disponibilidad y opciones.</li>
          </ul>
        </section>

        <section className="caja-card manual-section">
          <h2>2. Elegir opciones y agregar al carrito</h2>
          <ul>
            <li>En el detalle del producto podés <strong>sumar extras</strong> (si el local los ofrece) y <strong>quitar ingredientes</strong> incluidos.</li>
            <li>Elegí la <strong>cantidad</strong> y tocá <strong>Agregar al carrito</strong>. Si hay stock limitado, la app te avisará.</li>
          </ul>
        </section>

        <section className="caja-card manual-section">
          <h2>3. Carrito y confirmación</h2>
          <ul>
            <li>Entrá al <strong>carrito</strong> (ícono arriba) para revisar tu pedido, cambiar cantidades, editar opciones o quitar productos.</li>
            <li>Completá tus datos (nombre, teléfono, entrega o retiro, dirección si corresponde y notas).</li>
            <li>Elegí el <strong>método de pago</strong> (efectivo, transferencia o link de pago, según lo que ofrezca el local) y seguí las instrucciones.</li>
            <li>Al confirmar se genera tu pedido: verás el <strong>comprobante/ticket</strong>, el <strong>tiempo estimado</strong> y se podrá abrir <strong>WhatsApp</strong> para enviar el pedido al local.</li>
          </ul>
        </section>

        <section className="caja-card manual-section">
          <h2>4. Mis pedidos</h2>
          <ul>
            <li>En <strong>Mis pedidos</strong> (menú inferior) podés ver el historial de pedidos confirmados en este dispositivo.</li>
          </ul>
        </section>

        <section className="caja-card manual-section">
          <h2>5. Instalar la app en tu celular</h2>
          <ul>
            <li><strong>Android (Chrome):</strong> abrí el enlace de la app y tocá “Instalar app” o el menú ⋮ → “Agregar a pantalla de inicio”.</li>
            <li><strong>iPhone (Safari):</strong> abrí el enlace, tocá <strong>Compartir</strong> → <strong>“Agregar a pantalla de inicio”</strong>.</li>
            <li>Así tendrás un acceso rápido como si fuera una app.</li>
          </ul>
        </section>

        <section className="caja-card manual-section">
          <h2>6. Notas importantes</h2>
          <ul>
            <li>Los precios, disponibilidad, medios de pago y tiempos son los que define el local.</li>
            <li>Si el local aún no usa un sistema centralizado, parte de la información puede guardarse solo en tu dispositivo.</li>
            <li>Ante dudas con tu pedido o pago, contactá directamente al local (teléfono/WhatsApp que figure en la app).</li>
          </ul>
        </section>

        <div className="admin-actions">
          <Link to="/inicio" className="admin-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>Ir al inicio</Link>
        </div>
      </main>
      <FooterNav />
    </div>
  )
}

export default ManualCliente
