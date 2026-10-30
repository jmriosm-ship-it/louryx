import { Link } from 'react-router-dom'
import Bottle from './Bottle'
import { useCart } from '../context/CartContext'
import { money } from '../config'

export default function ProductCard({ product }) {
  const { add } = useCart()
  return (
    <article className="card">
      <Link to={`/perfume/${product.id}`} className="card-media">
        {product.badge && <span className="badge">{product.badge}</span>}
        <span className="card-ghost" aria-hidden="true">{product.name.split(" ")[0].toUpperCase()}</span>
        <Bottle product={product} className="card-bottle" />
      </Link>
      <div className="card-body">
        <p className="eyebrow">{product.category} · {product.family}</p>
        <h3><Link to={`/perfume/${product.id}`}>{product.name}</Link></h3>
        <p className="muted">{product.size} ml · Eau de Parfum</p>
        <div className="card-foot">
          <strong>{money(product.price)}</strong>
          <button className="btn btn-sm" onClick={() => add(product.id)}>Agregar</button>
        </div>
      </div>
    </article>
  )
}
