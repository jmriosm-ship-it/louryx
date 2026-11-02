import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { asset } from '../config'

// Foto de portada por categoría (opcional): pon la ruta de la imagen en /public.
// Las categorías creadas en el panel de administración usan la foto que se les puso allí.
const COVERS = {
  Mujer: '/perfumes/portada-mujer.webp',
  Hombre: '/perfumes/portada-hombre.webp',
  Unisex: '/perfumes/portada-unisex.webp',
}

export default function Collections() {
  const { products, categories, categoryPhotos } = useCatalog()
  return (
    <div className="col-row">
      {categories.map((c, i) => {
        const cover = categoryPhotos[c] || COVERS[c]
        return (
          <Link key={c} to={`/catalogo?cat=${encodeURIComponent(c)}`} className={`col-panel ${cover ? 'has-img' : ''}`} style={cover ? { '--img': `url(${asset(cover)})` } : undefined}>
            <span className="col-n">{String(i + 1).padStart(2, '0')}</span>
            <span className="col-plus" aria-hidden="true">+</span>
            <i className="col-line" aria-hidden="true" />
            <span className="col-t">{c}</span>
            <span className="col-c">{products.filter((p) => p.category === c).length} fragancias</span>
            <span className="col-go">Ver →</span>
          </Link>
        )
      })}
    </div>
  )
}
