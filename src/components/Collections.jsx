import { Link } from 'react-router-dom'
import { products, CATEGORIES } from '../data/products'

export default function Collections() {
  return (
    <div className="col-row">
      {CATEGORIES.map((c, i) => (
        <Link key={c} to={`/catalogo?cat=${c}`} className="col-panel">
          <span className="col-n">0{i + 1}</span>
          <span className="col-plus" aria-hidden="true">+</span>
          <i className="col-line" aria-hidden="true" />
          <span className="col-t">{c}</span>
          <span className="col-c">{products.filter((p) => p.category === c).length} fragancias</span>
          <span className="col-go">Ver →</span>
        </Link>
      ))}
    </div>
  )
}
