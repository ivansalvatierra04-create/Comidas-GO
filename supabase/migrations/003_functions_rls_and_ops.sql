-- Funciones auxiliares, RLS operativas y RPCs seguras (borrador ejecutable con revisión).
-- Requiere 001 y 002. Ajustar a políticas finales antes de aplicar en entorno real.

-- Helpers de autorización
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.platform_admins pa where pa.user_id = auth.uid()
  );
$$;

create or replace function public.is_store_member(p_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships m
    where m.store_id = p_store_id and m.user_id = auth.uid()
  );
$$;

create or replace function public.has_store_role(p_store_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships m
    where m.store_id = p_store_id
      and m.user_id = auth.uid()
      and m.role = any(p_roles)
  );
$$;

-- Licencia operativa: pago único permanente, sin expiración automática.
create or replace function public.is_license_operational(p_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.licenses l
    where l.store_id = p_store_id and l.status = 'activa'
  );
$$;

-- Auditoría server-side (inserción controlada)
create or replace function public.log_audit(
  p_store_id uuid,
  p_action text,
  p_entity text,
  p_entity_id text,
  p_details jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.audit_logs(store_id, user_id, user_label, action, entity, entity_id, details)
  values (p_store_id, auth.uid(), coalesce(auth.jwt() ->> 'email', 'user'), p_action, p_entity, p_entity_id, p_details)
  returning id into v_id;
  return v_id;
end;
$$;

-- Creación transaccional de venta con código único por comercio (seguro ante concurrencia)
create or replace function public.create_sale(
  p_store_id uuid,
  p_items jsonb,
  p_customer jsonb default '{}'::jsonb,
  p_payment jsonb default '{}'::jsonb,
  p_estimate jsonb default '{}'::jsonb,
  p_status text default 'Pendiente',
  p_user_label text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seq bigint;
  v_code text;
  v_sale_id uuid;
  v_total numeric(12,2) := 0;
  v_item jsonb;
begin
  if not (public.is_platform_admin() or public.is_store_member(p_store_id)) then
    raise exception 'forbidden';
  end if;
  if not public.is_license_operational(p_store_id) then
    raise exception 'license_not_operational';
  end if;

  select sale_seq, sale_code into v_seq, v_code from public.next_sale_code(p_store_id);

  -- Calcular total en servidor (no confiar en cliente)
  for v_item in select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  loop
    v_total := v_total + (coalesce((v_item->>'quantity')::numeric,0) * coalesce((v_item->>'unit_price')::numeric,0));
  end loop;

  insert into public.sales(store_id, sale_seq, sale_code, user_id, user_label, status, customer, payment, estimate, total, total_text)
  values (p_store_id, v_seq, v_code, auth.uid(), coalesce(p_user_label, auth.jwt() ->> 'email'), p_status, p_customer, p_payment, p_estimate, v_total, ('$' || trim(to_char(v_total,'FM999G999G990'))))
  returning id into v_sale_id;

  insert into public.sale_items(sale_id, store_id, product_id, name, quantity, unit_price, discount, modifiers, line_total)
  select
    v_sale_id,
    p_store_id,
    nullif(v_item->>'product_id','')::uuid,
    coalesce(v_item->>'name','Producto'),
    coalesce((v_item->>'quantity')::int,1),
    coalesce((v_item->>'unit_price')::numeric,0),
    v_item->>'discount',
    coalesce(v_item->'modifiers','{}'::jsonb),
    (coalesce((v_item->>'quantity')::numeric,0) * coalesce((v_item->>'unit_price')::numeric,0))
  from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) as v_item;

  perform public.log_audit(p_store_id, 'sale_created', 'sale', v_sale_id::text, jsonb_build_object('sale_code', v_code, 'total', v_total));
  return jsonb_build_object('id', v_sale_id, 'sale_code', v_code, 'sale_seq', v_seq, 'total', v_total);
end;
$$;

-- Políticas RLS (reemplazan/definen comportamiento; ajustar según necesidad real)
drop policy if exists stores_select on public.stores;
create policy stores_select on public.stores for select
  using (public.is_platform_admin() or public.is_store_member(id) or status = 'active');

drop policy if exists stores_write on public.stores for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists memberships_select on public.memberships for select
  using (public.is_platform_admin() or user_id = auth.uid() or public.is_store_member(store_id));
drop policy if exists memberships_write on public.memberships for all
  using (public.is_platform_admin() or public.has_store_role(store_id, array['owner','admin']))
  with check (public.is_platform_admin() or public.has_store_role(store_id, array['owner','admin']));

drop policy if exists licenses_select on public.licenses for select
  using (public.is_platform_admin() or public.is_store_member(store_id));
drop policy if exists licenses_write on public.licenses for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists categories_rw on public.categories for all
  using (public.is_platform_admin() or public.is_store_member(store_id))
  with check (public.is_platform_admin() or public.is_store_member(store_id));
drop policy if exists products_rw on public.products for all
  using (public.is_platform_admin() or public.is_store_member(store_id))
  with check (public.is_platform_admin() or public.is_store_member(store_id));

drop policy if exists sales_select on public.sales for select
  using (public.is_platform_admin() or public.is_store_member(store_id));
drop policy if exists sales_insert on public.sales for insert
  with check ((public.is_platform_admin() or public.is_store_member(store_id)) and public.is_license_operational(store_id));
drop policy if exists sales_update on public.sales for update
  using (public.is_platform_admin() or public.is_store_member(store_id))
  with check (public.is_platform_admin() or public.is_store_member(store_id));

drop policy if exists sale_items_rw on public.sale_items for all
  using (public.is_platform_admin() or public.is_store_member(store_id))
  with check (public.is_platform_admin() or public.is_store_member(store_id));

drop policy if exists cash_select on public.cash_movements for select
  using (public.is_platform_admin() or public.is_store_member(store_id));
drop policy if exists cash_insert on public.cash_movements for insert
  with check ((public.is_platform_admin() or public.is_store_member(store_id)) and public.is_license_operational(store_id));

drop policy if exists audit_select on public.audit_logs for select
  using (public.is_platform_admin() or public.is_store_member(store_id));
drop policy if exists audit_insert on public.audit_logs for insert
  with check (public.is_platform_admin() or public.is_store_member(store_id) or auth.uid() is not null);
drop policy if exists audit_no_update on public.audit_logs for update using (false);
drop policy if exists audit_no_delete on public.audit_logs for delete using (false);

drop policy if exists platform_admins_select on public.platform_admins for select
  using (public.is_platform_admin() or user_id = auth.uid());
drop policy if exists platform_admins_write on public.platform_admins for all
  using (public.is_platform_admin()) with check (public.is_platform_admin());
