import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { products, CATEGORIES } from '../data/products'

// idle: oculto hasta llegar a la sección · go: se abren en abanico · done: listo para el hover
export default function Collections() {
  const ref = useRef(null)
  const [phase, setPhase] = useState('idle')

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setPhase('go')
        io.disconnect()
      }
    }, { threshold: 0.35 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (phase !== 'go') return
    const t = setTimeout(() => setPhase('done'), 1900)
    return () => clearTimeout(t)
  }, [phase])

  return (
    <div className={`col-row ${phase}`} ref={ref}>
      {CATEGORIES.map((c, i) => (
        <Link key={c} to={`/catalogo?cat=${c}`} className="col-panel">
          <span className="col-n">0{i + 1}</span>
          <span className="col-plus" aria-hidden="true">+</span>
          <svg className="col-tri" viewBox="0 0 100 90" aria-hidden="true">
            <g className="col-spin"><polygon points="50,4 96,86 4,86" /></g>
            <g className="col-spin2"><polygon points="50,86 14,24 86,24" /></g>
          </svg>
          <i className="col-bottle" aria-hidden="true" />
          <span className="col-t">{c}</span>
          <span className="col-c">{products.filter((p) => p.category === c).length} fragancias</span>
          <span className="col-go">Ver →</span>
        </Link>
      ))}
    </div>
  )
}
