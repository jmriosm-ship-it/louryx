import { useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import Collections from '../components/Collections'
import HowToBuy from '../components/HowToBuy'
import Recommender from '../components/Recommender'
import Faq from '../components/Faq'
import { products, CATEGORIES } from '../data/products'
import { STORE } from '../config'

function HeroBottle({ side, product }) {
  return (
    <div className={`hero-bottle ${side}`} aria-hidden="true">
      <div className="hb-move">
        <div className="hb-bob">
          <i className="hb-halo" />
          <i className="hb-spark" style={{ top: '8%', left: '-18%' }} />
          <i className="hb-spark" style={{ top: '40%', right: '-22%', animationDelay: '1s' }} />
          <i className="hb-spark" style={{ top: '75%', left: '-10%', animationDelay: '2s' }} />
          <img className="hb-img" src={product.image} alt="" />
        </div>
      </div>
      <i className="hb-shadow" />
    </div>
  )
}

export default function Home() {
  const heroRef = useRef(null)
  const onMove = (e) => {
    const r = heroRef.current.getBoundingClientRect()
    heroRef.current.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
    heroRef.current.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
  }
  const featured = products.filter((p) => p.badge).concat(products.filter((p) => !p.badge)).slice(0, 4)
  const heroLeft = { id: 'hero-hawas', name: 'Hawas Ice de Rasasi', image: '/perfumes/hawas-ice-cut.png' }
  const heroRight = { id: 'hero-atlas', name: 'Atlas de Lattafa', image: '/perfumes/atlas-cut.png' }
  const brands = [...STORE.brands, ...STORE.brands]

  return (
    <>
      <section className="hero" ref={heroRef} onMouseMove={onMove}>
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {brands.map((b, i) => <span key={i}>{b}</span>)}
          </div>
        </div>
        <div className="container hero-stage">
          <svg className="hero-tri" viewBox="0 0 300 260" aria-hidden="true">
            <g className="t1"><polygon points="150,10 290,250 10,250" strokeWidth="1.2" /></g>
            <g className="t2"><polygon points="150,250 40,60 260,60" strokeWidth="1" /></g>
          </svg>
          <HeroBottle side="l" product={heroLeft} />
          <HeroBottle side="r" product={heroRight} />
          <div className="hero-center">
            <h1>Louryx</h1>
            <p className="eyebrow">Perfumes · Decants · Contra entrega</p>
            <div className="hero-cta">
              <Link to="/catalogo" className="btn">Ver catálogo</Link>
              <a className="btn btn-ghost" href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="sweep" aria-hidden="true" />
      </section>

      <section className="strip">
        <div className="container strip-in">
          <span>✦ Envíos contra entrega a todo Colombia</span>
          <span>✦ Decants de 5 y 10 ml</span>
          <span>✦ Precios mayoristas desde {STORE.wholesaleFrom} unidades</span>
          <span>✦ Atención por WhatsApp</span>
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
          <div><p className="eyebrow">Selección</p><h2>Destacados</h2></div>
          <Link to="/catalogo" className="link">Ver todo →</Link>
        </div>
        <div className="grid">{featured.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>

      <HowToBuy />
      <Recommender />
      <Faq />
    </>
  )
}
