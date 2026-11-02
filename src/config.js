// Datos de la tienda: cambia aquí el WhatsApp, redes y contacto.
// Rutas de /public que respetan la base del sitio (GitHub Pages sirve en /louryx/).
export const asset = (p) => (p && p.startsWith('/') ? import.meta.env.BASE_URL + p.slice(1) : p)

// Un perfume sin cantidad disponible se muestra como Agotado y no se puede comprar.
export const soldOut = (p) => Number(p?.stock ?? 1) <= 0

export const STORE = {
  name: 'Louryx',
  tagline: 'Perfumería de autor',
  // Número con código de país, sin + ni espacios (ej. 573001234567)
  whatsapp: '573247362985',
  tiktok: 'https://www.tiktok.com/@louryx68',
  tiktokHandle: '@louryx68',
  phoneDisplay: '324 736 2985',
  city: 'Colombia',
  // Datos legales: responsable del negocio y de los datos personales. Los usan las páginas
  // de privacidad, términos y envíos. Si algo cambia, se cambia aquí y se actualiza en todas.
  legal: {
    brand: 'LOURYX',
    owner: 'Julián Darío Picón Durán',
    nit: '1092732537',
    email: 'julianpicon07.8@gmail.com',
    updated: '2 de noviembre de 2026',
    reportDays: 5, // días hábiles para avisar de un producto con defecto o equivocado
  },
  // Mayoristas: unidades mínimas (en total, mezclando perfumes; no hay máximo) y descuento sobre el precio normal.
  // Para cambiar el descuento, pon el porcentaje aquí en decimal (0.15 = 15%, 0.2 = 20%): se aplica solo en toda la tienda.
  wholesaleFrom: 3,
  wholesaleDiscount: 0.15,
  // Marcas de la cinta de la portada: deja solo las que vendes.
  brands: ['ARMAF', 'LATTAFA', 'AFNAN', 'RASASI', 'MAISON ALHAMBRA', 'PARIS CORNER'],
  logo: asset('/brand/logo.jpg'),
}

export const money = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

// Precio mayorista de un perfume (redondeado a miles).
export const wholesalePrice = (price, pct = Math.round(STORE.wholesaleDiscount * 100)) => Math.round((price * (1 - pct / 100)) / 1000) * 1000

// Descuento mayorista de un perfume, en %: el que se le puso en el panel (pestaña Mayoristas) o, si no tiene, el general.
export const wholesalePercent = (p) => (Number(p?.wholesaleDiscount) > 0 ? Number(p.wholesaleDiscount) : Math.round(STORE.wholesaleDiscount * 100))
