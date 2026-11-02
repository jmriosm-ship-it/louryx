// Opciones de "Colección": cada una lleva a un filtro del catálogo y muestra una foto de vista previa.
// Para cambiar la foto de una opción, pon la ruta (dentro de /public) en `img`.
const COVER = {
  Mujer: '/perfumes/portada-mujer.webp',
  Hombre: '/perfumes/portada-hombre.webp',
  Unisex: '/perfumes/portada-unisex.webp',
}
const FALLBACK = '/brand/fondo-louryx.jpg'

export function buildMenuItems({ products, categories, families, categoryPhotos = {} }) {
  // Foto de un aroma: la del primer perfume de esa familia que tenga imagen.
  const familyImg = (f) => products.find((p) => p.family === f && p.image)?.image
  return [
    { title: 'Todo', to: '/catalogo', img: FALLBACK, fit: 'cover', count: products.length },
    ...categories.map((c) => ({
      title: c,
      to: `/catalogo?cat=${encodeURIComponent(c)}`,
      img: categoryPhotos[c] || COVER[c] || FALLBACK,
      fit: 'cover',
      count: products.filter((p) => p.category === c).length,
    })),
    ...families.map((f) => ({
      title: f,
      to: `/catalogo?fam=${encodeURIComponent(f)}`,
      img: familyImg(f) || FALLBACK,
      fit: familyImg(f) ? 'contain' : 'cover',
      count: products.filter((p) => p.family === f).length,
    })),
  ]
}
