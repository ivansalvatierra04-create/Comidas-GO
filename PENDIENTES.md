# Pendientes

Lista de mejoras/tareas a realizar más adelante.

## Pedidos y tiempos
- [ ] **Permitir al administrador modificar el tiempo estimado de un pedido específico** (ya confirmado).
  - Contexto actual: el dueño puede configurar tiempos estimados por defecto (retiro/envío) en Admin, y el ETA se calcula al confirmar el pedido; pero no hay forma de ajustar el ETA de un pedido puntual desde un panel de administrador.
  - Limitación actual (sin backend): los pedidos se guardan en el dispositivo/navegador del cliente, por lo que el dueño no puede ver/editar pedidos de otros dispositivos desde su app.
  - Enfoque futuro: implementar con backend/panel de dueño y gestión centralizada de pedidos para que el administrador pueda actualizar estado y tiempo estimado por pedido (y que el cliente lo vea reflejado).

## Backend / ventas (futuro)
- [ ] Agregar backend/base de datos para centralizar pedidos y que el dueño pueda ver el total de ventas y pedidos del día desde su dispositivo.
- [ ] Sincronizar stock y estados de pedido entre dispositivos cuando exista backend.

## Multi-comercio / arquitectura
- [ ] **Aislamiento de datos entre comercios**: separar la información (configuración, catálogo, pedidos, clientes/cuentas, cupones, stock, etc.) por comercio/tenant para evitar mezcla de datos y permitir operar múltiples locales de forma independiente (especialmente al pasar a backend/multiusuario).
