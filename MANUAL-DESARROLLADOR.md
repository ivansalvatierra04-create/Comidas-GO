# Manual del desarrollador — COMIDAS-GO

Guía para configurar, personalizar, publicar y vender la app **COMIDAS-GO** (React + Vite + PWA).

> **Estado actual:** app sin backend. Los datos se guardan en el **navegador/dispositivo** (`localStorage`). Ideal para demo, operación en un solo equipo o como base para evolucionar a backend (Fase 2).

---

## 1. Requisitos y puesta en marcha

- **Node.js** 18+ (recomendado LTS) y npm.
- Instalar dependencias:
  ```bash
  npm install
  ```
- Desarrollo:
  ```bash
  npm run dev
  ```
  Abrir la URL que indique Vite (ej. `http://localhost:5173`).
- Build de producción:
  ```bash
  npm run build
  npm run preview   # opcional, para probar el build
  ```
- Lint:
  ```bash
  npm run lint
  ```

---

## 2. Estructura rápida del proyecto

- `src/pages/` — pantallas (Home, Principal, Categorías, Detalle, Carrito, Pedidos, Caja, Admin, etc.).
- `src/components/` — componentes compartidos (Header, FooterNav, etc.).
- `src/data/` — lógica y persistencia en `localStorage` (settings, categories, cart, orders, caja, ownerAuth).
- `src/App.jsx` — rutas.
- `vite.config.js` — configuración Vite + PWA (`vite-plugin-pwa`).
- `PENDIENTES.md` — mejoras futuras.

---

## 3. Personalización para un cliente (antes de entregar/publicar)

Todo se puede ajustar desde **Administrar app** (`/admin`) en la propia app (recomendado para el dueño), pero como desarrollador podés dejar valores iniciales:

1. **Identidad del local** (Admin → Configuración del local): nombre, frase, logo, colores/fondo.
2. **Contacto y “Nosotros”**: foto, teléfono, dirección.
3. **Cobro y pedidos**: WhatsApp del local, instrucciones de efectivo/transferencia, link de Mercado Pago.
4. **Tiempos estimados**: retiro y envío (minutos).
5. **Catálogo**: categorías, productos (precio, descripción, imagen, stock, extras y opciones para quitar), promociones y carrusel.
6. **Acceso de dueño (Fase 1)**: configurar un **PIN** para proteger Admin y Caja.
7. **Compartir**: usar el enlace/QR que muestra Admin para entregar al cliente.

> **Importante:** al no haber backend, la configuración y los datos cargados viven en el `localStorage` del navegador/dispositivo donde se configuran. Para “entregar” una instancia configurada, lo habitual es que el **dueño configure su app** en su dispositivo tras publicar, o definir defaults en código/datos iniciales si vendés una plantilla preconfigurada.

---

## 4. Publicación (PWA sin tiendas) — recomendado

La app es una **PWA**: se instala desde el navegador (“Agregar a pantalla de inicio”), sin Play Store/App Store.

### 4.1 Hosting
Publicar el contenido de `dist/` (generado con `npm run build`) en un hosting con **HTTPS** (requerido para PWA/instalación confiable). Opciones comunes:
- **Vercel / Netlify / Cloudflare Pages**: conectar el repo, build `npm run build`, directorio de salida `dist`.
- Cualquier hosting estático con HTTPS.

### 4.2 Verificaciones PWA
- `vite-plugin-pwa` genera manifest y service worker (ya configurado en el proyecto).
- Probar en móvil: abrir la URL → opción **Instalar app** / **Agregar a pantalla de inicio**.
- **iPhone (Safari):** Compartir → “Agregar a pantalla de inicio” (conviene indicárselo al cliente).

### 4.3 Compartir con clientes
- Entregar la **URL pública** y/o **QR** (Admin → “Compartir app con clientes”).
- Sugerencia comercial: cartel/WhatsApp con “Escaneá y agregá la app a tu inicio”.

---

## 5. Seguridad y limitaciones (Fase 1, sin backend)

- **PIN de dueño:** protección práctica en el dispositivo (sesión en navegador). **No es seguridad fuerte** ni multi-dispositivo.
- **Sin sincronización:** pedidos, caja, stock y configuración no se comparten entre dispositivos.
- **Sin cuentas reales de cliente/dueño en servidor:** todo es local al navegador.
- Para operación real multi-dispositivo y multiusuario hace falta **Fase 2 (backend)**.

---

## 6. Flujo recomendado para vender/entregar

1. **Reunir datos del comercio:** nombre, logo, colores, menú, precios, stock, medios de pago, WhatsApp, tiempos.
2. **Preparar instancia:** desplegar la app (URL propia o del cliente) y personalizar (o guiar al dueño en Admin).
3. **Configurar dueño:** establecer **PIN** y validar acceso a Admin/Caja.
4. **Cargar catálogo:** categorías, productos (extras/quitar), promociones y carrusel.
5. **Probar flujo completo:** navegar → agregar al carrito (extras/quitar) → confirmar pedido (stock, ETA, WhatsApp, ticket) → verificar **Mis pedidos** y **Caja** (movimiento automático de venta).
6. **Entregar al cliente:** URL + QR, breve capacitación (ver Manual del administrador) y explicar limitaciones sin backend.
7. **Soporte/acuerdo:** definir qué incluye (cambios de menú, soporte, hosting, dominio) y el camino a Fase 2 si lo requiere.

---

## 7. Evolución a Fase 2 (backend) — referencia

Cuando el cliente necesite sincronización y gestión real:
- **Login de dueño** (cuenta real) y panel protegido en servidor.
- **Comercio/tenant** con enlace de cliente por slug (ej. `/c/{slug}`) y aislamiento de datos.
- **Datos centralizados:** pedidos, stock, caja/ventas, cupones; dueño ve todo desde su dispositivo.
- **Roles/autorización** en backend y, opcionalmente, cuentas de cliente.
- Ver `PENDIENTES.md` y el plan acordado (PWA sin tiendas se mantiene como forma de instalación).

---

## 8. Recursos en la app

- **Manual del administrador:** disponible dentro de la app (sección de ayuda para dueño) para operar el día a día.
- **Manual del cliente (Ayuda):** disponible para quienes compran (cómo pedir, carrito, pagos, instalación).

Mantener estos manuales actualizados cuando se agreguen funciones.
