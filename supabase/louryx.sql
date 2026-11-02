-- ============================================================
-- Louryx: base de datos del panel de administración
-- Cómo usarlo: en Supabase abre "SQL Editor", pega TODO este archivo y pulsa "Run".
-- Se puede correr más de una vez sin dañar nada.
-- Las tablas llevan el prefijo "louryx_" para no chocar con otros proyectos (por ejemplo Quality Shop)
-- si usas el mismo proyecto de Supabase.
-- ============================================================

-- ---------- Tablas ----------

-- Categorías (Mujer, Hombre, Unisex... o las que crees)
create table if not exists public.louryx_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  photo_url text,                       -- foto opcional para el menú "Colección" y las colecciones del inicio
  sort integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Perfumes
create table if not exists public.louryx_products (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  price numeric not null default 0,
  category_id uuid references public.louryx_categories(id) on delete set null,
  image_url text,                       -- foto del perfume (dirección pública)
  wholesale boolean not null default true, -- true = se puede vender al por mayor
  family text,                          -- aroma: Floral, Amaderado, Oriental... (opcional)
  size_ml integer not null default 100,
  badge text,                           -- etiqueta opcional: "Nuevo", "Edición limitada"...
  featured boolean not null default false, -- sale en "Más vendidos"
  is_new boolean not null default false,   -- sale en el carrusel de "Nuevo ingreso"
  notes jsonb,                          -- { "salida": [], "corazon": [], "fondo": [] }
  stock integer not null default 20,
  active boolean not null default true, -- false = oculto en la tienda
  created_at timestamptz not null default now()
);

-- Fotos secundarias del perfume (la portada es image_url). Se puede correr aunque la tabla ya exista.
alter table public.louryx_products add column if not exists photos text[] not null default '{}';

-- Descuento propio del perfume (opcional, 1 a 90). Sin valor = sin descuento.
alter table public.louryx_products add column if not exists discount_percent integer check (discount_percent between 1 and 90);

-- Descuento mayorista de este perfume (1 a 90). Se aplica solo en la página de Mayoristas. Sin valor = usa el general.
alter table public.louryx_products add column if not exists wholesale_discount integer check (wholesale_discount between 1 and 90);

-- Quiénes son administradores (los dueños)
create table if not exists public.louryx_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- ---------- Quién es administrador ----------
create or replace function public.louryx_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.louryx_admins where user_id = auth.uid());
$$;

-- ---------- Seguridad: todos pueden VER, solo los administradores pueden CAMBIAR ----------
alter table public.louryx_categories enable row level security;
alter table public.louryx_products enable row level security;
alter table public.louryx_admins enable row level security;

drop policy if exists "ver categorias louryx" on public.louryx_categories;
create policy "ver categorias louryx" on public.louryx_categories for select
  using (active or public.louryx_is_admin());
drop policy if exists "admin categorias louryx" on public.louryx_categories;
create policy "admin categorias louryx" on public.louryx_categories for all to authenticated
  using (public.louryx_is_admin()) with check (public.louryx_is_admin());

drop policy if exists "ver productos louryx" on public.louryx_products;
create policy "ver productos louryx" on public.louryx_products for select
  using (active or public.louryx_is_admin());
drop policy if exists "admin productos louryx" on public.louryx_products;
create policy "admin productos louryx" on public.louryx_products for all to authenticated
  using (public.louryx_is_admin()) with check (public.louryx_is_admin());

-- La tabla louryx_admins no se lee ni se cambia desde la página (solo la usa louryx_is_admin())

-- ---------- Fotos: carpeta pública "louryx" ----------
insert into storage.buckets (id, name, public) values ('louryx', 'louryx', true)
on conflict (id) do nothing;

drop policy if exists "ver fotos louryx" on storage.objects;
create policy "ver fotos louryx" on storage.objects for select using (bucket_id = 'louryx');
drop policy if exists "admin sube fotos louryx" on storage.objects;
create policy "admin sube fotos louryx" on storage.objects for all to authenticated
  using (bucket_id = 'louryx' and public.louryx_is_admin())
  with check (bucket_id = 'louryx' and public.louryx_is_admin());

-- ============================================================
-- PASO FINAL (después de crear tu usuario en Authentication > Users):
-- convierte ese usuario en administrador. Cambia el correo por el tuyo y corre solo esta línea:
--
--   insert into public.louryx_admins (user_id) select id from auth.users where email = 'tu-correo@gmail.com'
--   on conflict do nothing;
-- ============================================================
