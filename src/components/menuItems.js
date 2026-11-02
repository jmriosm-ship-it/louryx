// Opciones de "Colección": cada una lleva a un filtro del catálogo y muestra una foto de vista previa.
// La foto de una categoría es la que se le puso en el panel de administración; si no tiene,
// se usa la de su primer perfume con imagen, y si tampoco, la foto de fondo de Louryx.
const FALLBACK = '/brand/fondo-louryx.jpg'

export function buildMenuItems({ products, categories, families, categoryPhotos = {} }) {
  const firstImage = (match) => products.find((p) => match(p) && p.image)?.image
  const photoItem = (own, byProduct) => {
    if (own) return { img: own, fit: 'cover' }
    if (byProduct) return { img: byProduct, fit: 'contain' }
    return { img: FALLBACK, fit: 'cover' }
  }
  return [
    { title: 'Todo', to: '/catalogo', img: FALLBACK, fit: 'cover', count: products.length },
    ...categories.map((c) => ({
      title: c,
      to: `/catalogo?cat=${encodeURIComponent(c)}`,
      ...photoItem(categoryPhotos[c], firstImage((p) => p.category === c)),
      count: products.filter((p) => p.category === c).length,
    })),
    ...families.map((f) => ({
      title: f,
      to: `/catalogo?fam=${encodeURIComponent(f)}`,
      ...photoItem(null, firstImage((p) => p.family === f)),
      count: products.filter((p) => p.family === f).length,
    })),
  ]
}
