import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useFlash } from '../lib/flash'

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
export default function Flash() {
  const { on, end, deals } = useFlash()

  return (
    <section className="section container flash">
      <div className="section-head flash-head">
        <div>
          <p className="eyebrow">Oferta relámpago</p>
          <h1 className="h2 display">{on ? 'Se acaba pronto' : 'Esta oferta terminó'}</h1>
        </div>
        {on && <Timer end={end} />}
      </div>
      {on ? (
        <div className="grid">{deals.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      ) : (
        <p className="muted">Por ahora no hay una oferta relámpago activa. Mira el <Link to="/catalogo" className="link">catálogo</Link> o escríbenos por WhatsApp.</p>
      )}
    </section>
  )
}
