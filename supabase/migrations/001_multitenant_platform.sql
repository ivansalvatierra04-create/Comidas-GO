-- COMIDAS-GO: esquema base multiempresa (borrador para Supabase/PostgreSQL)
-- Revisar, ajustar y ejecutar en entorno controlado. NO ejecutar destructivamente sobre producción sin backup.
-- Objetivos: multi-tenancy, licencias de pago único (permanente), ventas con código único, auditoría, roles.

create extension if not exists pgcrypto;

-- Comercios (tenants)
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo text,
  address text,
  contact jsonb default '{}'::jsonb,
  public_url text,
  status text not null default 'active',
  settings jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Licencias (pago único, permanente). Sin suspensión automática por vencimiento.
create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  purchase_date timestamptz not null default now(),
  activation_date timestamptz,
  amount_paid numeric(12,2) not null default 0,
  status text not null check (status in ('pendiente','activa','suspendida','cancelada')),
  type text not null default 'permanente',
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id)
);

-- Roles/membresías por comercio
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null, -- references auth.users(id) en Supabase Auth
  role text not null check (role in ('owner','admin','employee')),
  permissions jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (store_id, user_id)
);

-- SUPERADMIN de plataforma (separado de comercios). Gestionar vía claims/tabla controlada por servicio.
create table if not exists public.platform_admins (
  user_id uuid primary key, -- references auth.users(id)
  created_at timestamptz not null default now()
);

-- Catálogo
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  icon text,
  image text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  image text,
  discount text,
  stock int, -- null = sin límite
  extras jsonb default '[]'::jsonb,
  removables jsonb default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Secuencia de ventas por comercio para códigos VTA-000001 únicos y sin colisiones
create table if not exists public.sale_counters (
  store_id uuid primary key references public.stores(id) on delete cascade,
  last_seq bigint not null default 0
);

create or replace function public.next_sale_code(p_store_id uuid)
returns table(sale_seq bigint, sale_code text)
language plpgsql
as $$
declare
  v_seq bigint;
begin
  insert into public.sale_counters(store_id, last_seq) values (p_store_id, 1)
  on conflict (store_id) do update set last_seq = public.sale_counters.last_seq + 1
  returning last_seq into v_seq;
  return query select v_seq, ('VTA-' || lpad(v_seq::text, 6, '0'));
end;
$$;

-- Ventas/pedidos (no eliminar; anular conserva registro y no reutiliza código)
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  sale_seq bigint not null,
  sale_code text not null,
  created_at timestamptz not null default now(),
  user_id uuid, -- auth.users.id cuando aplique
  user_label text,
  status text not null default 'Pendiente',
  annulled boolean not null default false,
  annulled_at timestamptz,
  annul_reason text,
  customer jsonb default '{}'::jsonb,
  payment jsonb default '{}'::jsonb,
  estimate jsonb default '{}'::jsonb,
  total numeric(12,2) not null default 0,
  total_text text,
  unique (store_id, sale_code),
  unique (store_id, sale_seq)
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  product_id uuid,
  name text not null,
  quantity int not null,
  unit_price numeric(12,2) not null default 0,
  discount text,
  modifiers jsonb default '{}'::jsonb,
  line_total numeric(12,2) not null default 0
);

-- Caja
create table if not exists public.cash_movements (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  type text not null check (type in ('income','expense')),
  amount numeric(12,2) not null,
  concept text not null,
  category text,
  method text,
  note text,
  source text,
  order_id uuid references public.sales(id) on delete set null,
  user_id uuid,
  user_label text,
  created_at timestamptz not null default now()
);

-- Auditoría (inmutable para usuarios comunes; controlar por RLS/policies)
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  store_id uuid,
  user_id uuid,
  user_label text,
  action text not null,
  entity text,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

-- Índices recomendados
create index if not exists idx_memberships_store_user on public.memberships(store_id, user_id);
create index if not exists idx_products_store on public.products(store_id);
create index if not exists idx_sales_store_created on public.sales(store_id, created_at desc);
create index if not exists idx_sales_code on public.sales(store_id, sale_code);
create index if not exists idx_cash_store_created on public.cash_movements(store_id, created_at desc);
create index if not exists idx_audit_store_created on public.audit_logs(store_id, created_at desc);

-- NOTA: habilitar RLS y definir políticas en 002_rls_policies.sql.
-- La validación de licencia operativa y permisos debe aplicarse también en funciones/edge/backend,
-- no solo en frontend.
