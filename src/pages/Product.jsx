import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Bottle from '../components/Bottle'
import ProductCard from '../components/ProductCard'
import { getProduct, products } from '../data/products'
import { useCart } from '../context/CartContext'
import { money } from '../config'

export default function Product() {
  const { id } = useParams()
  const p = getProduct(id)
  const { add } = useCart()
  const [qty, setQty] = useState(1)

  if (!p) {
    return (
      <section className="section container center">
        <h1 className="h2">Perfume no encontrado</h1>
        <Link className="btn" to="/catalogo">Volver al catálogo</Link>
      </section>
    )
  }

  const related = products.filter((x) => x.id !== p.id && (x.category === p.category || x.family === p.family)).slice(0, 4)

  return (
    <>
      <section className="section container detail">
        <div className="detail-art"><Bottle product={p} className="detail-bottle" /></div>
        <div className="detail-info">
          <Link to="/catalogo" className="link">← Catálogo</Link>
          <p className="eyebrow">{p.category} · {p.family}</p>
          <h1>{p.name}</h1>
          <p className="price">{money(p.price)} <small>· {p.size} ml · Eau de Parfum</small></p>
          <p className="lead">{p.description}</p>

          <div className="notes">
            {[['Salida', p.notes.salida], ['Corazón', p.notes.corazon], ['Fondo', p.notes.fondo]].map(([t, n]) => (
              <div key={t}><h4>{t}</h4><p>{n.join(' · ')}</p></div>
            ))}
          </div>

          <div className="buy">
            <div className="qty qty-lg">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Menos">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(p.stock, qty + 1))} aria-label="Más">+</button>
            </div>
            <button className="btn" onClick={() => add(p.id, qty)}>Agregar al carrito</button>
          </div>
          <p className="muted">{p.stock <= 6 ? `¡Quedan solo ${p.stock} unidades!` : 'Disponible · Envío en 2–4 días hábiles'}</p>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section container">
          <div className="section-head"><h2>También te puede gustar</h2></div>
          <div className="grid">{related.map((r) => <ProductCard key={r.id} product={r} />)}</div>
        </section>
      )}
    </>
  )
}
