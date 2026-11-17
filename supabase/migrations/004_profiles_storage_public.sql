-- Perfiles, configuración de plataforma, soporte público y storage (borrador).
-- Ejecutar tras 001-003 con revisión.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  sale_id uuid references public.sales(id) on delete set null,
  delta int not null,
  reason text,
  user_id uuid,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.platform_settings enable row level security;
alter table public.stock_movements enable row level security;

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for all
  using (public.is_platform_admin() or id = auth.uid())
  with check (public.is_platform_admin() or id = auth.uid());

drop policy if exists platform_settings_admin on public.platform_settings for all
  using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists stock_movements_rw on public.stock_movements for all
  using (public.is_platform_admin() or public.is_store_member(store_id))
  with check (public.is_platform_admin() or public.is_store_member(store_id));

-- Vista/política para catálogo público por slug (solo datos públicos del comercio activo y licencia operativa)
-- Se recomienda exponer vía RPC/Edge o vista controlada. Ejemplo de función:
create or replace function public.get_public_store(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'store', jsonb_build_object('id', s.id, 'name', s.name, 'slug', s.slug, 'logo', s.logo, 'address', s.address, 'contact', s.contact),
    'categories', (
      select coalesce(jsonb_agg(c order by c.sort_order, c.created_at), '[]'::jsonb)
      from public.categories c where c.store_id = s.id
    ),
    'products', (
      select coalesce(jsonb_agg(p order by p.created_at), '[]'::jsonb)
      from public.products p where p.store_id = s.id and p.active = true
    )
  )
  from public.stores s
  where s.slug = p_slug and s.status = 'active' and public.is_license_operational(s.id)
  limit 1;
$$;

-- Storage: crear buckets manualmente en Supabase Dashboard o via API:
-- - product-images (public read opcional según política, write autenticado por membresía)
-- - store-assets (logos, etc.)
-- Definir políticas de storage para restringir escritura por store/membresía y evitar acceso cruzado.
-- Ejemplo orientativo (ajustar nombres de bucket y rutas 'store_id/...'):
-- create policy "store members upload" on storage.objects for insert
-- with check (bucket_id = 'product-images' and public.is_store_member((storage.foldername(name))[1]::uuid));
