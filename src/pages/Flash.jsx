import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useFlash } from '../lib/flash'
import { useCart } from '../context/CartContext'
import { money } from '../config'

const secondsLeft = (end) => Math.max(0, Math.floor((end - Date.now()) / 1000))

// Reloj hasta la hora en que termina la oferta
export function Timer({ end }) {
  const [s, setS] = useState(() => secondsLeft(end))
  useEffect(() => {
    setS(secondsLeft(end))
    const t = setInterval(() => setS(secondsLeft(end)), 1000)
    return () => clearInterval(t)
  }, [end])
  const days = Math.floor(s / 86400)
  const parts = [Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0'))
  return (
    <div className="timer" role="timer" aria-label="Tiempo que queda de la oferta">
      {days > 0 && <><div><b>{days}</b>{days === 1 ? 'día' : 'días'}</div><i aria-hidden="true">:</i></>}
      <div><b>{parts[0]}</b>hrs</div><i aria-hidden="true">:</i><div><b>{parts[1]}</b>min</div><i aria-hidden="true">:</i><div><b>{parts[2]}</b>seg</div>
    </div>
  )
}

// Oferta relámpago: los perfumes que tienen descuento puesto en el panel (campo "Descuento %"), del mayor al menor.
// Se enciende, se apaga y se le pone hora de fin en el panel (pestaña Ofertas).
const isTester = (p) => /^testers?$/i.test(String(p.category || '').trim())
const isDecant = (p) => Number(p.size) > 0 && Number(p.size) <= 30 && !isTester(p)

function DecantRow({ p }) {
  const { add } = useCart()
  return (
    <div className="fl-row">
      <Link to={`/perfume/${p.id}`} className="fl-row__img"><img src={p.image} alt={p.name} loading="lazy" /></Link>
      <div className="fl-row__info">
        <Link to={`/perfume/${p.id}`}><strong>{p.name}</strong></Link>
        <small>{p.size} ml · <b>-{p.discount}%</b></small>
        <span className="price-box"><s>{money(p.originalPrice)}</s> <strong>{money(p.price)}</strong></span>
      </div>
      <button className="btn btn-sm" onClick={() => add(p.id)}>Agregar</button>
    </div>
  )
}

export default function Flash() {
  const { on, end, deals } = useFlash()
  const testers = deals.filter(isTester)
  const full = deals.filter((p) => !isDecant(p) && !isTester(p))
  const decants = deals.filter(isDecant)

  return (
    <section className="section container flash">
      <div className="section-head flash-head">
        <div>
          <p className="eyebrow">Oferta relámpago</p>
          <h1 className="h2 display">{on ? 'Se acaba pronto' : 'Esta oferta terminó'}</h1>
        </div>
        {on && <Timer end={end} />}
      </div>
      {on && deals.length > 0 ? (
        <div className="fl-cols">
          {(full.length > 0 || testers.length > 0) && <div className="fl-left">
          {full.length > 0 && (
            <div className="fl-col">
              <h2 className="fl-h">Perfumes</h2>
              <div className="grid fl-grid">{full.map((p) => <ProductCard key={p.id} product={p} hideMeta />)}</div>
            </div>
          )}
          {testers.length > 0 && (
            <div className="fl-col">
              <h2 className="fl-h">Testers</h2>
              <div className="grid fl-grid">{testers.map((p) => <ProductCard key={p.id} product={p} hideMeta />)}</div>
            </div>
          )}
          </div>}
          {decants.length > 0 && (
            <div className="fl-col fl-col--decants">
              <h2 className="fl-h">Decants</h2>
              {decants.map((p) => <DecantRow key={p.id} p={p} />)}
            </div>
          )}
        </div>
      ) : on ? (
        <p className="muted">Estamos preparando los perfumes de esta oferta. Vuelve en un rato o mira el <Link to="/catalogo" className="link">catálogo</Link>.</p>
      ) : (
        <p className="muted">Por ahora no hay una oferta relámpago activa. Mira el <Link to="/catalogo" className="link">catálogo</Link> o escríbenos por WhatsApp.</p>
      )}
    </section>
  )
}
