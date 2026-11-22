import { Link } from 'react-router-dom'
import Bottle from '../components/Bottle'
import { useCatalog } from '../context/CatalogContext'
import { money, soldOut, STORE } from '../config'

const TEXT = {
  combo: { eyebrow: 'Para revender', title: 'Combos emprendedores', lead: 'Varios perfumes juntos con descuento extra, pensados para empezar a vender o surtir tu negocio.' },
  kit: { eyebrow: 'Para probar y regalar', title: 'Kits', lead: 'Sets de perfumes ya armados, con descuento, listos para regalar o para descubrir tu próximo aroma.' },
}

// Precio del combo: suma de los perfumes (a su precio normal) menos el descuento, redondeado a miles
const priceOf = (items, off) => {
  const full = items.reduce((s, it) => s + (it.p.originalPrice ?? it.p.price) * it.qty, 0)
  return { full, price: Math.round((full * (1 - off / 100)) / 1000) * 1000 }
}

function BundleCard({ b, items }) {
  const { full, price } = priceOf(items, b.off)
  const units = items.reduce((s, it) => s + it.qty, 0)
  const msg = [
    `Hola ${STORE.name}, quiero el *${b.name}*:`,
    '',
    ...items.map((it) => `• ${it.qty} x ${it.p.name} (${it.p.size} ml)`),
    '',
    `Precio del ${b.type === 'kit' ? 'kit' : 'combo'}: ${money(price)}${b.off > 0 ? ` (${b.off}% menos)` : ''}`,
    'Envío: se confirma por WhatsApp',
  ].join('\n')
  return (
    <article className="bundle">
      {b.off > 0 && <span className="bundle-off">-{b.off}%</span>}
      <div className="bundle-art">
        {items.slice(0, 3).map((it) => <Bottle key={it.p.id} product={it.p} className="bundle-bottle" />)}
      </div>
      <h3>{b.name}</h3>
      <p>{b.blurb}</p>
      <ul className="bundle-list">
        {items.map((it) => <li key={it.p.id}>{it.qty} × {it.p.name}</li>)}
      </ul>
      <div className="bundle-foot">
        <div>
          <strong>{money(price)}</strong><s>{money(full)}</s>
          <small>{units} {units === 1 ? 'perfume' : 'perfumes'} · ahorras {money(full - price)}</small>
        </div>
        <a className="btn btn-sm" href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer">Pedir</a>
      </div>
    </article>
  )
}

// Combos o kits que se pueden mostrar (todos sus perfumes existen y hay unidades)
export function useBundles(type) {
  const { getProduct, bundles } = useCatalog()
  return bundles.filter((b) => b.type === type).map((b) => ({
    b,
    items: b.items.map((it) => ({ p: getProduct(it.id), qty: it.qty })),
  })).filter(({ items }) => items.every((it) => it.p && !soldOut(it.p)))
}

export function BundleGrid({ type, limit }) {
  const list = useBundles(type).slice(0, limit)
  return list.length ? (
    <div className="bundles">{list.map(({ b, items }) => <BundleCard key={b.id} b={b} items={items} />)}</div>
  ) : (
    <p className="muted">Pronto tendremos {type === 'kit' ? 'kits' : 'combos'} disponibles. Mientras tanto mira el <Link to="/catalogo" className="link">catálogo</Link>.</p>
  )
}

export default function Bundles({ type }) {
  const t = TEXT[type]

  return (
    <section className="section container">
      <div className="section-head">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="h2 display">{t.title}</h1>
        </div>
      </div>
      <p className="lead ws-intro">{t.lead}</p>
      <BundleGrid type={type} />
    </section>
  )
}
