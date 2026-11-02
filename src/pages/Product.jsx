import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Bottle from '../components/Bottle'
import ProductCard from '../components/ProductCard'
import { useCatalog } from '../context/CatalogContext'
import { useCart } from '../context/CartContext'
import { money, STORE, soldOut, wholesalePercent, wholesalePrice } from '../config'

export default function Product() {
  const { id } = useParams()
  const { getProduct, products } = useCatalog()
  const p = getProduct(id)
  const { add } = useCart()
  const [qty, setQty] = useState(1)
  const [shot, setShot] = useState(0)

  if (!p) {
    return (
      <section className="section container center">
        <h1 className="h2">Perfume no encontrado</h1>
        <Link className="btn" to="/catalogo">Volver al catálogo</Link>
      </section>
    )
  }

  const out = soldOut(p)
  const related = products.filter((x) => x.id !== p.id && (x.category === p.category || x.family === p.family)).slice(0, 4)

  return (
    <>
      <section className="section container detail">
        <div className="detail-art">
          <Bottle product={p.photos?.length > 1 ? { ...p, image: p.photos[shot] || p.photos[0] } : p} className="detail-bottle" />
          {p.photos?.length > 1 && (
            <div className="detail-thumbs">
              {p.photos.map((src, i) => (
                <button key={src + i} type="button" className={i === shot ? "on" : ""} onClick={() => setShot(i)} aria-label={`Ver foto ${i + 1}`}>
                  <Bottle product={{ ...p, image: src }} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="detail-info">
          <Link to="/catalogo" className="link">← Catálogo</Link>
          <p className="eyebrow">{p.category} · {p.family}</p>
          <h1>{p.name}</h1>
          <p className="price">
            {p.discount > 0 && <s className="price-old">{money(p.originalPrice)}</s>}
            {money(p.price)}{p.discount > 0 && <b className="price-off">-{p.discount}%</b>} <small>· {p.size} ml · Eau de Parfum</small></p>
          <p className="lead">{p.description}</p>

          {(p.notes.salida.length > 0 || p.notes.corazon.length > 0 || p.notes.fondo.length > 0) && (
            <div className="notes">
              {[['Salida', p.notes.salida], ['Corazón', p.notes.corazon], ['Fondo', p.notes.fondo]].map(([t, n]) => (
                <div key={t}><h4>{t}</h4><p>{n.join(' · ')}</p></div>
              ))}
            </div>
          )}
          {p.wholesale !== false && (
            <p className="muted">
              Disponible al por mayor: desde {STORE.wholesaleFrom} unidades a {money(wholesalePrice(p.originalPrice ?? p.price, wholesalePercent(p)))} c/u.{' '}
              <Link to="/mayoristas" className="link">Ver mayoristas →</Link>
            </p>
          )}

          {out ? (
            <>
              <div className="buy"><button className="btn" disabled>Agotado</button></div>
              <p className="muted">
                Este perfume está agotado por ahora.{' '}
                <a className="link" href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(`Hola Louryx, quiero que me avisen cuando vuelva el ${p.name}`)}`} target="_blank" rel="noreferrer">Avísame cuando llegue →</a>
              </p>
            </>
          ) : (
            <>
              <div className="buy">
                <div className="qty qty-lg">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Menos">−</button>
                  <span>{Math.min(qty, p.stock)}</span>
                  <button onClick={() => setQty(Math.min(p.stock, qty + 1))} aria-label="Más">+</button>
                </div>
                <button className="btn" onClick={() => add(p.id, Math.min(qty, p.stock))}>Agregar al carrito</button>
              </div>
              <p className="muted">{p.stock <= 6 ? `¡Quedan solo ${p.stock} unidades!` : 'Disponible · Envío en 2–4 días hábiles'}</p>
            </>
          )}
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
