# Estado de implementación (Fase 2 - integración Supabase)

## Resumen
- **Base local multiempresa** operativa (migración, scoping por `storeId`, licencias pago único permanentes, códigos `VTA-*`, auditoría local, panel SUPERADMIN local).
- **Integración Supabase preparada en código**: cliente real (`@supabase/supabase-js`) que se activa con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, módulos de auth/tenant, ruta pública `/c/:slug` con intento de carga remota cuando hay backend.
- **SQL/Migraciones** creadas para esquema, RLS, funciones transaccionales (`next_sale_code`, `create_sale`, validación de licencia operativa) y soporte público/perfiles/storage.
- **Sin credenciales configuradas**: la app sigue funcionando en modo local; no hay conexión/sincronización remota real hasta configurar Supabase y aplicar migraciones en un proyecto autorizado.

## Migraciones SQL
- `supabase/migrations/001_multitenant_platform.sql` — esquema base multiempresa, licencias, secuencia/códigos de venta, ventas, caja, auditoría.
- `supabase/migrations/002_rls_policies.sql` — habilitación RLS y lineamientos base.
- `supabase/migrations/003_functions_rls_and_ops.sql` — helpers de autorización, `is_license_operational`, auditoría server-side, RPC `create_sale` transaccional, políticas RLS operativas.
- `supabase/migrations/004_profiles_storage_public.sql` — perfiles, settings de plataforma, movimientos de stock, función pública por slug, notas de storage.

## Limitaciones actuales
- No se ejecutaron migraciones contra base remota (requiere autorización/credenciales).
- Auth real, membresías, RLS efectivo, Realtime, Storage y operaciones 100% backend requieren conectar Supabase y completar cableado UI/servicios por dominio.
- Pruebas automáticas cubren lógica crítica local/mocks parciales; no reemplazan pruebas de integración/E2E contra Supabase con RLS.
- SERVICE_ROLE y operaciones privilegiadas deben residir solo en servidor/Edge Functions (nunca en frontend).

## Para producción
1. Crear proyecto Supabase, configurar `.env.local` (sin commitear secretos).
2. Revisar/aplicar migraciones en entorno seguro con backup.
3. Configurar Auth, políticas, buckets/policies de Storage y Edge Functions/RPC según necesidad.
4. Completar sincronización realtime y flujos UI contra backend.
5. Ejecutar pruebas de seguridad, aislamiento, concurrencia y E2E antes de desplegar.
