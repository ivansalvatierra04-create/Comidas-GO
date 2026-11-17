import { Link } from 'react-router-dom'
import FooterNav from '../components/FooterNav.jsx'
import Header from '../components/Header.jsx'

function ManualAdmin() {
  return (
    <div className="principal">
      <Header />
      <main className="principal-content with-footer manual-page">
        <div className="menu-page-header">
          <button type="button" className="back-link as-button" onClick={() => window.history.back()}>← Volver</button>
          <h1>Manual del administrador</h1>
          <p>Guía para configurar y operar la app del local (Fase 1, sin backend).</p>
        </div>

        <section className="caja-card manual-section">
          <h2>1. Acceso de dueño</h2>
          <ul>
            <li>En <strong>Administrar app → Acceso de dueño</strong> configurá un <strong>PIN</strong> y guardá los cambios.</li>
            <li>Con PIN activo, <strong>Caja</strong> y <strong>Administrar app</strong> piden el PIN para ingresar. Usá <strong>Cerrar sesión dueño</strong> en el menú cuando corresponda.</li>
            <li>El PIN es una protección práctica en este dispositivo (no reemplaza un sistema con usuarios/servidor).</li>
          </ul>
        </section>

        <section className="caja-card manual-section">
          <h2>2. Configuración del local</h2>
          <ul>
            <li><strong>Identidad:</strong> nombre, frase, logo y colores/fondo de la pantalla de inicio.</li>
            <li><strong>Nosotros:</strong> foto, teléfono y ubicación/datos del local.</li>
            <li><strong>Cobro y pedidos (WhatsApp):</strong> número de WhatsApp para recibir pedidos, instrucciones de efectivo/transferencia y link de cobro (ej. Mercado Pago).</li>
            <li><strong>Tiempos estimados:</strong> minutos para retiro y envío (se muestran al confirmar y en el mensaje).</li>
            <li>Tras editar, tocá <strong>Guardar local</strong>.</li>
          </ul>
        </section>

        <section className="caja-card manual-section">
          <h2>3. Catálogo, promociones y carrusel</h2>
          <ul>
            <li><strong>Categorías y comidas:</strong> creá/edita categorías y productos (nombre, descripción, precio, imagen, descuento, <strong>stock</strong>).</li>
            <li><strong>Extras y opciones para quitar:</strong> configuralos por producto para que el cliente pueda personalizar (los extras pueden tener costo).</li>
            <li><strong>Promociones y carrusel:</strong> cargá contenido destacado desde sus secciones y guardá.</li>
            <li>Recordá: si el cliente ya tenía datos guardados en su dispositivo, los cambios que hagas vos no se sincronizan automáticamente sin backend.</li>
          </ul>
        </section>

        <section className="caja-card manual-section">
          <h2>4. Compartir la app con clientes</h2>
          <ul>
            <li>En <strong>Administrar app → Compartir app con clientes</strong> copiá el enlace, compartilo por WhatsApp o mostrá el <strong>QR</strong>.</li>
            <li>Los clientes pueden instalarla como app (PWA) desde el navegador; en iPhone: Safari → Compartir → “Agregar a pantalla de inicio”.</li>
          </ul>
        </section>

        <section className="caja-card manual-section">
          <h2>5. Pedidos y caja</h2>
          <ul>
            <li>Al confirmar un pedido se descuenta stock (si aplica), se calcula el tiempo estimado y se puede enviar el resumen por WhatsApp; además se registra un <strong>ingreso automático en Caja</strong> (según la implementación actual).</li>
            <li><strong>Caja:</strong> permite ver resúmenes, registrar ingresos/egresos manuales, consultar movimientos y ver duplicado de ticket de ventas vinculadas.</li>
            <li><strong>Mis pedidos:</strong> el historial lo ve el cliente en su dispositivo. Sin backend, el dueño no ve pedidos de otros dispositivos en un panel centralizado.</li>
          </ul>
        </section>

        <section className="caja-card manual-section">
          <h2>6. Limitaciones actuales (importante)</h2>
          <ul>
            <li>Los datos se almacenan en el <strong>navegador/dispositivo</strong>: no hay sincronización entre equipos.</li>
            <li>No hay login real de dueño/cliente en servidor ni panel central de pedidos/ventas multi-dispositivo.</li>
            <li>Para operar con múltiples dispositivos, cuentas y datos centralizados se requiere la <strong>Fase 2 (backend)</strong>.</li>
          </ul>
        </section>

        <div className="admin-actions">
          <Link to="/admin" className="admin-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>Volver a Administrar app</Link>
        </div>
      </main>
      <FooterNav />
    </div>
  )
}

export default ManualAdmin
