import { Link } from 'react-router-dom'
import Bottle from './Bottle'
import { useCart } from '../context/CartContext'
import { money, soldOut } from '../config'

export default function ProductCard({ product }) {
  const { add } = useCart()
  const out = soldOut(product)
  return (
    <article className={`card ${out ? 'card--out' : ''}`}>
      <Link to={`/perfume/${product.id}`} className="card-media">
        {out && <span className="badge badge-out">Agotado</span>}
        {!out && product.badge && <span className="badge">{product.badge}</span>}
        {!out && product.discount > 0 && <span className="badge badge-off">-{product.discount}%</span>}
        <span className="card-ghost" aria-hidden="true">{product.name.split(" ")[0].toUpperCase()}</span>
        <Bottle product={product} className="card-bottle" />
      </Link>
      <div className="card-body">
        <p className="eyebrow">{product.category} · {product.family}</p>
        <h3><Link to={`/perfume/${product.id}`}>{product.name}</Link></h3>
        <p className="muted">{product.size} ml · Eau de Parfum</p>
        <div className="card-foot">
          <span className="price-box">
            {product.discount > 0 && <s>{money(product.originalPrice)}</s>}
            <strong>{money(product.price)}</strong>
          </span>
          <button className="btn btn-sm" onClick={() => add(product.id)} disabled={out}>{out ? 'Agotado' : 'Agregar'}</button>
        </div>
      </div>
    </article>
  )
}
