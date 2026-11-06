# Louryx — tienda de perfumes

Página, catálogo y tienda de Louryx hecha con React + Vite. Los pedidos se envían por WhatsApp.

Se publica en Cloudflare Pages, en el dominio propio de la tienda.

## Cómo correrlo

Necesitas [Node.js](https://nodejs.org) 18 o superior.

```bash
npm install
npm run dev
```

Abre la dirección que muestra la terminal (normalmente `http://localhost:5173/`).

## Dónde cambiar cada cosa

| Qué | Dónde |
| --- | --- |
| WhatsApp, TikTok, mayoristas, marcas de la cinta | `src/config.js` |
| Perfumes, precios, notas y fotos | `src/data/products.js` |
| Fotos y logo | `public/perfumes` y `public/brand` |
| Colores y estilos | `src/styles.css` |
| Portada, colecciones y secciones del inicio | `src/pages/Home.jsx` y `src/components` |
| Textos de preguntas frecuentes y "cómo comprar" | `src/components/Faq.jsx` y `src/components/HowToBuy.jsx` |

Las fotos se ponen en `public/` y se citan en `products.js` como `image: '/perfumes/nombre.png'`.

## Publicar los cambios

```bash
git add -A
git commit -m "Describe el cambio"
git push origin main
```

Cloudflare Pages está conectado al repo: cada `git push` a `main` compila y publica solo.
Configuración en Cloudflare (Workers & Pages > Create > Pages > Connect to Git): Build command `npm run build`, Build output directory `dist`.
En Settings > Environment variables (Production) pon `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`: las claves se incluyen al compilar. Luego Custom domains > agrega tu dominio.

## Notas

- El sitio vive en la raíz del dominio (`base: '/'` en `vite.config.js`). Para fotos nuevas en el código usa la función `asset('/ruta')` de `src/config.js`.
- No hay `404.html`: sin él Cloudflare Pages manda cualquier enlace directo (ej. `/admin`) a la tienda, que es lo que necesita una app de una sola página.

## Panel de administración (`/admin`)

Entra a `/admin` de tu dominio (en local: `http://localhost:5173/admin`).
Tiene tres pestañas, como el panel de Quality Shop:

- **Perfumes:** nombre, descripción, precio, categoría, portada y fotos secundarias, la **cantidad disponible** (con 0 sale como Agotado y no se puede comprar), un **descuento opcional** en % y si se puede vender **al por mayor**. Con el descuento, la tienda muestra el precio anterior tachado; el precio mayorista parte del precio normal.
- **Mayoristas:** lista todos los perfumes. Para cada uno se marca si se vende al por mayor y se escribe su descuento en %. Ese descuento se aplica solo en la página de Mayoristas, cuando piden 3 o más unidades **de ese mismo perfume** (sin máximo); en la tienda normal el precio no cambia. Si se deja vacío usa el descuento general de `src/config.js` (`wholesaleDiscount`). Hay un botón para poner el mismo descuento a todos.
- **Categorías:** con su orden y su portada. Cada una tiene su botón **Crear producto**.

Sin configurar nada el panel funciona en **modo de prueba**: guarda en el navegador y los clientes no ven los cambios.
Para que los cambios los vea todo el mundo hay que conectar una base de datos gratuita en [Supabase](https://supabase.com):

1. Crea un proyecto en Supabase.
2. En **SQL Editor** pega todo `supabase/louryx.sql` y pulsa **Run** (se puede correr otra vez sin problema; si ya lo habías corrido antes, vuélvelo a correr para que se creen las fotos secundarias y el descuento por perfume).
3. En **Authentication > Users** crea tu usuario (correo y contraseña).
4. En el SQL Editor corre esta línea cambiando el correo, para volverlo administrador:
   `insert into public.louryx_admins (user_id) select id from auth.users where email = 'tu-correo@gmail.com' on conflict do nothing;`
5. Copia `.env.example` como `.env` y pon la URL y la clave **anon** (Supabase > Project Settings > API). Nunca la `service_role`.
6. Para probar en tu computador usa el `.env`; para la web pon las mismas dos variables en Cloudflare Pages y vuelve a desplegar.
7. Entra a `/admin`, inicia sesión y, si la base está vacía, pulsa **Cargar los perfumes actuales** para poder editar los que ya existen.

Mientras la base esté vacía la tienda muestra los perfumes de `src/data/products.js`.

## Páginas legales

Privacidad (`/privacidad`), términos (`/terminos`) y envíos, cambios y devoluciones (`/envios`) están en `src/pages/Legal.jsx`.
Los datos del responsable (nombre, NIT, correo y fecha de actualización) se cambian en `legal` dentro de `src/config.js`.
Son textos base para una tienda en línea en Colombia; conviene que un abogado los revise antes de hacer publicidad pagada.
