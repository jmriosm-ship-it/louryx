import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Bottle from '../components/Bottle'
import Collections from '../components/Collections'
import HowToBuy from '../components/HowToBuy'
import Recommender from '../components/Recommender'
import Benefits from '../components/Benefits'
import { useCatalog } from '../context/CatalogContext'
import { STORE, money, asset } from '../config'

// Perfumes nuevos: los marcados con `nuevo: true` en products.js (el más reciente primero).
// Si no hay ninguno marcado, se usan los últimos agregados al catálogo.
const newest = (products) => {
  const flagged = products.filter((p) => p.nuevo).reverse()
  return (flagged.length ? flagged : products.slice(-4).reverse()).slice(0, 6)
}

function HeroSlide({ p, className }) {
  const out = className.includes('out')
  return (
    <div className={`hero-center ${className}`} aria-hidden={out || undefined}>
      <Bottle product={p} className="hc-img" />
      <h1>{p.name}</h1>
      <p className="hc-price">{p.category} · {p.family} · {money(p.price)}</p>
      <div className="hero-cta">
        <Link to={`/perfume/${p.id}`} className="btn" tabIndex={out ? -1 : undefined}>Comprar ahora</Link>
        <Link to="/catalogo" className="btn btn-ghost" tabIndex={out ? -1 : undefined}>Ver catálogo</Link>
      </div>
    </div>
  )
}

export default function Home() {
  const { products } = useCatalog()
  const slides = newest(products)
  // dir: 1 = entra desde la derecha, -1 = desde la izquierda, 0 = primera carga. from: el que se está yendo.
  const [view, setView] = useState({ i: 0, dir: 0, from: null })
  const [paused, setPaused] = useState(false)
  const n = slides.length
  const i = view.i
  const goTo = (to, dir) => setView((v) => (to === v.i ? v : { i: to, dir, from: v.i }))
  const go = (d) => setView((v) => ({ i: (v.i + d + n) % n, dir: d, from: v.i }))
  useEffect(() => {
    if (n < 2 || paused) return
    const t = setInterval(() => go(1), 5500)
    return () => clearInterval(t)
  }, [n, paused])
  useEffect(() => {
    if (view.from === null) return
    const t = setTimeout(() => setView((v) => ({ ...v, from: null })), 900)
    return () => clearTimeout(t)
  }, [view.i, view.from])
  const cur = slides[i]
  const leaving = view.from !== null && view.from !== i ? slides[view.from] : null
  const inClass = view.dir > 0 ? 'in-r' : view.dir < 0 ? 'in-l' : 'in-first'
  const outClass = view.dir > 0 ? 'out-l' : 'out-r'
  const prev = slides[(i - 1 + n) % n]
  const next = slides[(i + 1) % n]
  // Más vendidos: los marcados con `vendido: true` en products.js (el primero es el grande).
  const sold = products.filter((p) => p.vendido)
  const featured = (sold.length >= 5 ? sold : sold.concat(products.filter((p) => !p.vendido))).slice(0, 5)
  const [star, ...rest] = featured

  return (
    <>
      <div className="tagline">
        <i aria-hidden="true" />
        <p>Tu personalidad merece destacar en cada ocasión</p>
        <img src={asset('/brand/perfume-lx.jpg')} alt="Perfume Louryx" />
        <i aria-hidden="true" />
      </div>
      <section className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="container hero-stage">
          <svg className="hero-tri" viewBox="0 0 300 260" aria-hidden="true">
            <g className="t1"><polygon points="150,10 290,250 10,250" strokeWidth="1.2" /></g>
            <g className="t2"><polygon points="150,250 40,60 260,60" strokeWidth="1" /></g>
          </svg>
          {n > 1 && (
            <button key={prev.id} className="hero-side l" onClick={() => go(-1)} aria-label={`Anterior: ${prev.name}`}>
              <Bottle product={prev} className="hs-img" />
              <span>{prev.name}</span>
            </button>
          )}
          <div className="hero-slides">
            {leaving && <HeroSlide key={`out-${leaving.id}`} p={leaving} className={outClass} />}
            <HeroSlide key={cur.id} p={cur} className={inClass} />
          </div>
          {n > 1 && (
            <button key={next.id} className="hero-side r" onClick={() => go(1)} aria-label={`Siguiente: ${next.name}`}>
              <Bottle product={next} className="hs-img" />
              <span>{next.name}</span>
            </button>
          )}
        </div>
        {n > 1 && (
          <div className="hero-dots">
            {slides.map((s, k) => (
              <button key={s.id} className={k === i ? 'on' : ''} onClick={() => goTo(k, k > i ? 1 : -1)} aria-label={`Ver ${s.name}`} />
            ))}
          </div>
        )}
      </section>

      <section className="strip">
        <div className="container strip-in">
          <span>✦ Envíos contra entrega a todo Colombia</span>
          <span>✦ Decants de 5 y 10 ml</span>
          <Link to="/mayoristas">✦ Precios mayoristas desde {STORE.wholesaleFrom} unidades</Link>
          <span>✦ Atención por WhatsApp</span>
        </div>
      </section>

      <section className="brand-band">
        <img className="brand-band-img" src={asset('/brand/fondo-louryx.jpg')} alt="Frasco de perfume Louryx entre humo" />
        <div className="container brand-band-in">
          <h2>
            <span className="l1">Porque un perfume</span>
            <span className="l2">es tu firma</span>
            <span className="l3">invisible.</span>
          </h2>
          <p>Fragancias elegidas por su desempeño real, con envío contra entrega a todo Colombia.</p>
          <div><Link to="/catalogo" className="btn">Ver catálogo</Link></div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div><p className="eyebrow">Colecciones</p><h2>Elige tu estilo</h2></div>
        </div>
        <Collections />
      </section>

      <section className="section container">
        <div className="section-head">
          <div><p className="eyebrow">Selección</p><h2>Más vendidos</h2></div>
          <Link to="/catalogo" className="link">Ver todo →</Link>
        </div>
        <div className="feat">
          <Link to={`/perfume/${star.id}`} className="feat-main">
            <Bottle product={star} className="feat-bottle" />
            <div className="feat-info">
              <p className="eyebrow">El favorito de la semana</p>
              <h3>{star.name}</h3>
              <p className="feat-price">{money(star.price)}</p>
              <span className="btn btn-sm">Pedir ahora</span>
            </div>
          </Link>
          <div className="feat-grid">
            {rest.map((p) => (
              <Link key={p.id} to={`/perfume/${p.id}`} className="feat-item">
                <span className="feat-media"><Bottle product={p} className="feat-mini" /></span>
                <span className="feat-name">{p.name}</span>
                <span className="feat-sub">{money(p.price)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HowToBuy />
      <Recommender />
      <Benefits />
    </>
  )
}
