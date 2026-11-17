-- RLS (borrador). Ajustar a la estrategia de auth (Supabase Auth) antes de aplicar.
-- Principio: ningún comercio accede a datos de otro; SUPERADMIN separado; auditoría protegida.

alter table public.stores enable row level security;
alter table public.licenses enable row level security;
alter table public.memberships enable row level security;
alter table public.platform_admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.cash_movements enable row level security;
alter table public.audit_logs enable row level security;

-- Helpers esperados (definir según implementación):
-- auth.uid() -> usuario autenticado (Supabase)
-- public.is_platform_admin() -> true si el usuario es SUPERADMIN de plataforma
-- public.is_store_member(p_store_id) -> true si pertenece al comercio
-- public.has_store_role(p_store_id, roles[]) -> control por rol

-- Ejemplos orientativos (NO copiar sin adaptar):
-- Stores: miembros pueden leer su tienda; platform admin puede leer/escribir todas.
-- create policy stores_select on public.stores for select
--   using (public.is_platform_admin() or public.is_store_member(id));

-- Licenses: lectura por miembros de su tienda y platform admin; escritura solo platform admin.
-- create policy licenses_admin_write on public.licenses for all
--   using (public.is_platform_admin()) with check (public.is_platform_admin());

-- Sales/Caja/Catálogo: aislados por store_id mediante membership.
-- create policy sales_isolation on public.sales for all
--   using (public.is_platform_admin() or public.is_store_member(store_id))
--   with check (public.is_platform_admin() or public.is_store_member(store_id));

-- Auditoría: inserción controlada (idealmente vía función/RPC server-side), sin update/delete para usuarios comunes.
-- create policy audit_no_modify on public.audit_logs for update using (false);
-- create policy audit_no_delete on public.audit_logs for delete using (false);

-- IMPORTANTE:
-- - Validar estado de licencia (operativa = 'activa', pago único permanente, sin expiración automática)
--   en RPC/edge functions para operaciones comerciales (crear venta, caja, stock).
-- - Nunca confiar en el frontend para suspensión/roles.
-- - Conservar datos históricos ante suspensión; bloquear solo operaciones.
