import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { Timer } from './Flash'
import { useBlackFriday } from '../lib/blackfriday'

// Perfumes en Black Friday en tarjetas grandes (se usa en su página y en el inicio)
export function BlackFridayDeals({ deals }) {
  return (
    <div className="grid fl-grid">
      {deals.map((p) => <ProductCard key={p.id} product={p} hideMeta={!(Number(p.size) > 0 && Number(p.size) <= 30)} />)}
    </div>
  )
}

export default function BlackFriday() {
  const { on, end, deals } = useBlackFriday()
  return (
    <section className="section container flash">
      <div className="section-head flash-head">
        <div>
          <p className="eyebrow">Solo por tiempo limitado</p>
          <h1 className="h2 display">Black Friday</h1>
        </div>
        {on && end && <Timer end={end} />}
      </div>
      {on && deals.length > 0 ? (
        <BlackFridayDeals deals={deals} />
      ) : on ? (
        <p className="muted">Estamos preparando los perfumes del Black Friday. Vuelve en un rato o mira el <Link to="/catalogo" className="link">catálogo</Link>.</p>
      ) : (
        <p className="muted">Por ahora no hay un Black Friday activo. Mira el <Link to="/catalogo" className="link">catálogo</Link> o escríbenos por WhatsApp.</p>
      )}
    </section>
  )
}
