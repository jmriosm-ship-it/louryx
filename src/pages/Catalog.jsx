import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products, CATEGORIES, FAMILIES } from '../data/products'

const SORTS = {
  destacados: ['Destacados', () => 0],
  menor: ['Precio: menor a mayor', (a, b) => a.price - b.price],
  mayor: ['Precio: mayor a menor', (a, b) => b.price - a.price],
  nombre: ['Nombre A–Z', (a, b) => a.name.localeCompare(b.name)],
}

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const cat = params.get('cat') || ''
  const fam = params.get('fam') || ''
  const q = params.get('q') || ''
  const sort = params.get('orden') || 'destacados'

  const set = (key, value) => {
    const next = new URLSearchParams(params)
    value ? next.set(key, value) : next.delete(key)
    setParams(next, { replace: true })
  }

  const list = useMemo(() => {
    const term = q.toLowerCase()
    return products
      .filter((p) => (!cat || p.category === cat) && (!fam || p.family === fam))
      .filter((p) => !term || [p.name, p.family, p.category, ...Object.values(p.notes).flat()].join(' ').toLowerCase().includes(term))
      .sort((SORTS[sort] || SORTS.destacados)[1])
  }, [cat, fam, q, sort])

  return (
    <section className="section container">
      <div className="section-head">
        <div><p className="eyebrow">Tienda</p><h1 className="h2">Catálogo</h1></div>
        <span className="muted">{list.length} resultado{list.length !== 1 && 's'}</span>
      </div>

      <div className="filters">
        <div className="chips">
          <button className={`chip ${!cat ? 'on' : ''}`} onClick={() => set('cat', '')}>Todos</button>
          {CATEGORIES.map((c) => (
            <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => set('cat', c)}>{c}</button>
          ))}
        </div>
        <div className="selects">
          <select value={fam} onChange={(e) => set('fam', e.target.value)} aria-label="Familia olfativa">
            <option value="">Todas las familias</option>
            {FAMILIES.map((f) => <option key={f}>{f}</option>)}
          </select>
          <select value={sort} onChange={(e) => set('orden', e.target.value)} aria-label="Ordenar">
            {Object.entries(SORTS).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </div>
      </div>

      {q && <p className="muted">Resultados para “{q}” · <button className="link" onClick={() => set('q', '')}>limpiar</button></p>}

      {list.length ? (
        <div className="grid">{list.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      ) : (
        <p className="empty">No encontramos perfumes con esos filtros.</p>
      )}
    </section>
  )
}
