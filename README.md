# COMIDAS-GO

App web (PWA) para negocios de comidas: catálogo, carrito, pedidos, caja y panel de administración. Funciona sin backend: los datos se guardan en el dispositivo. Se instala en el celular como una app.

## Funcionalidades

- Catálogo de comidas por categorías, con detalle de producto.
- Carrito, checkout y seguimiento de pedidos.
- Caja: ventas, códigos `VTA-*`, método de pago y ticket.
- Panel de administración (dueño): productos, categorías, promociones, tiempos de entrega, stock y ajustes.
- Tienda pública por slug (`/c/:slug`) y panel SUPERADMIN para multi-local.
- Acceso con PIN de dueño (se configura desde "Administrar app").
- Diseño responsive + PWA (instalable, funciona offline).

## Ver la demo

```bash
npm install
npm run dev
```

Rutas principales: `/` (inicio), `/inicio`, `/categorias`, `/carrito`, `/pedidos`, `/caja`, `/admin`, `/superadmin`.

Flujo sugerido para mostrar: elegir comida → carrito → confirmar pedido → caja → panel admin.

## Desplegar

La app es un sitio estático (Vite). Los archivos de configuración para SPA ya están incluidos (`public/_redirects` para Netlify, `vercel.json` para Vercel), así que las rutas internas funcionan al recargar.

```bash
npm run build
# el resultado queda en dist/
```

Opciones rápidas: importar el repo en **Netlify** o **Vercel** (detección automática de Vite). No hace falta configurar variables de entorno para usarla en modo local.

## Dos versiones: dueño y clientes

El mismo proyecto genera **dos builds** distintos:

| Build | Carpetas | Rutas incluidas | Para quién |
| --- | --- | --- | --- |
| Dueño (por defecto) | `dist` | Todo: administración, caja, superadmin | Vos y cada dueño que compre |
| Clientes | `dist-clientes` | Solo catálogo, carrito y pedidos | Los clientes de cada local |

En la versión clientes **no existen** las rutas `/admin`, `/caja` ni `/superadmin`: si se escriben a mano, redirigen al inicio. Tampoco aparecen los enlaces de administración en el menú, y se muestra un crédito "Desarrollado con COMIDAS-GO".

Para generarlas:

```powershell
# Versión dueño
npm run build

# Versión clientes
$env:VITE_APP_MODE = 'client'
npm run build
Remove-Item Env:\VITE_APP_MODE
```

> Subí cada carpeta a un sitio distinto de Netlify (Drop) y obtené dos links. Entregá el link **dueño** al comprador y el link **clientes** para que él lo comparta con sus clientes.

## Backend (opcional)

`src/platform/supabase/` contiene el cliente y los módulos para conectar Supabase, junto con migraciones SQL en `supabase/migrations/`. Para activarlo:

1. Crear un proyecto en Supabase.
2. Copiar `.env.example` a `.env.local` y completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. Aplicar las migraciones SQL en el proyecto.

Sin esas variables la app sigue funcionando en modo local. **Nunca poner la SERVICE_ROLE_KEY en variables `VITE_`** (se exponen al navegador).

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desarrollo |
| `npm run build` | Build de producción |
| `npm test` | Tests |
| `npm run lint` | Linter |
