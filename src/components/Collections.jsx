import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { asset } from '../config'

// Las colecciones no llevan foto por defecto. Si se le pone una foto a una categoría
// en el panel de administración, se usa esa.
export default function Collections() {
  const { products, categories, categoryPhotos } = useCatalog()
  return (
    <div className="col-row">
      {categories.map((c, i) => {
        const cover = categoryPhotos[c]
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
