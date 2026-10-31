// Datos de la tienda: cambia aquí el WhatsApp, redes y contacto.
export const STORE = {
  name: 'Louryx',
  tagline: 'Perfumería de autor',
  // Número con código de país, sin + ni espacios (ej. 573001234567)
  whatsapp: '573247362985',
  tiktok: 'https://www.tiktok.com/@louryx68',
  tiktokHandle: '@louryx68',
  phoneDisplay: '324 736 2985',
  city: 'Colombia',
  // Mayoristas: unidades mínimas (en total, mezclando perfumes) y descuento sobre el precio normal.
  wholesaleFrom: 3,
  wholesaleDiscount: 0.15,
  // Marcas de la cinta de la portada: deja solo las que vendes.
  brands: ['ARMAF', 'LATTAFA', 'AFNAN', 'RASASI', 'MAISON ALHAMBRA', 'PARIS CORNER'],
  logo: '/brand/logo.jpg',
  freeShippingFrom: 250000,
}

export const money = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

// Precio mayorista de un perfume (redondeado a miles).
export const wholesalePrice = (price) => Math.round((price * (1 - STORE.wholesaleDiscount)) / 1000) * 1000
