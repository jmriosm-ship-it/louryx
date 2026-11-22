// Opciones de "Colección": cada una lleva a un filtro del catálogo y muestra una foto de vista previa.
// La foto de una categoría es la que se le puso en el panel de administración; si no tiene, se usa
// la portada fija de abajo (las tres colecciones de siempre), luego la de su primer perfume con imagen,
// y si tampoco, la foto de fondo de Louryx.
const COVER = {
  Mujer: '/perfumes/portada-mujer.webp',
  Hombre: '/perfumes/portada-hombre.webp',
  Unisex: '/perfumes/portada-unisex.webp',
}
const FALLBACK = '/brand/fondo-louryx.jpg'

export function buildMenuItems({ products, categories, families, categoryPhotos = {}, bundles = [], settings = {}, flashOn = false }) {
  const covers = settings.covers || {}
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
      ...photoItem(categoryPhotos[c] || COVER[c], firstImage((p) => p.category === c)),
      count: products.filter((p) => p.category === c).length,
    })),
    ...families.map((f) => ({
      title: f,
      to: `/catalogo?fam=${encodeURIComponent(f)}`,
      ...photoItem(null, firstImage((p) => p.family === f)),
      count: products.filter((p) => p.family === f).length,
    })),
    // Opciones fijas de ofertas: llevan a su propia página. La foto se cambia en el panel (pestaña Ofertas).
    // La oferta relámpago solo aparece mientras está activa (encendida, con hora vigente y con perfumes en descuento).
    { title: 'Combos emprendedores', to: '/combos', img: covers.combo || '/brand/local-louryx.jpg', fit: 'cover', label: `${bundles.filter((b) => b.type === 'combo').length} combos` },
    flashOn && { title: '⚡ Oferta relámpago', to: '/oferta-relampago', img: covers.flash || FALLBACK, fit: 'cover', label: products.some((p) => p.discount > 0) ? `${products.filter((p) => p.discount > 0).length} en oferta` : 'Muy pronto' },
    { title: 'Kits', to: '/kits', img: covers.kit || '/brand/perfume-lx.jpg', fit: covers.kit ? 'cover' : 'contain', label: `${bundles.filter((b) => b.type === 'kit').length} kits` },
  ].filter(Boolean)
}
