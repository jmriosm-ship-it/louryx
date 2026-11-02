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
  // Escalones por cantidad de UN MISMO perfume (el primero es wholesaleFrom). El descuento de cada escalón
  // se pone por perfume en el panel (pestaña Mayoristas). Si un escalón queda vacío, ese perfume mantiene el descuento del anterior.
  wholesaleTiers: [3, 12, 30],
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

// Descuento de un perfume según las unidades pedidas: 0 si no llega al mínimo, y sube en cada escalón.
// Un escalón sin descuento propio (vacío en el panel) repite el del escalón anterior.
export const wholesalePercentFor = (p, n) => {
  const [t1, t2, t3] = STORE.wholesaleTiers
  if (n < t1) return 0
  const d1 = wholesalePercent(p)
  const d2 = Number(p?.wholesaleDiscount12) > 0 ? Number(p.wholesaleDiscount12) : d1
  const d3 = Number(p?.wholesaleDiscount30) > 0 ? Number(p.wholesaleDiscount30) : d2
  return n >= t3 ? d3 : n >= t2 ? d2 : d1
}

// Siguiente escalón que todavía no alcanza esa cantidad (para el aviso "agrega X más"), o null.
export const nextWholesaleTier = (n) => {
  const from = STORE.wholesaleTiers.find((t) => n < t)
  return from ? { from } : null
}
