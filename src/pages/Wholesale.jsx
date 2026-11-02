import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Bottle from '../components/Bottle'
import { useCatalog } from '../context/CatalogContext'
import { money, nextWholesaleTier, soldOut, STORE, wholesalePercentFor, wholesalePrice } from '../config'

// El precio mayorista parte del precio normal, sin el descuento de tienda
const base = (p) => p.originalPrice ?? p.price
const KEY = 'louryx-mayorista'
const empty = { nombre: '', telefono: '', ciudad: '', direccion: '', notas: '' }

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

// Pedido mayorista: es independiente del carrito normal. Cada perfume tiene su propio descuento
// (se pone en el panel, pestaña Mayoristas) y se aplica solo cuando piden STORE.wholesaleFrom
// o más unidades de ESE perfume. No hay máximo de unidades.
export default function Wholesale() {
  const { products: all, categories } = useCatalog()
  // Solo los perfumes marcados como "se puede al por mayor" (los de products.js cuentan como sí)
  const products = useMemo(() => all.filter((p) => p.wholesale !== false), [all])
  const [qty, setQty] = useState(load) // { [id]: unidades }
  const [f, setF] = useState(empty)
  const [sent, setSent] = useState(false)
  const [cat, setCat] = useState('Todos')

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(qty))
    } catch {
      /* sin almacenamiento: el pedido vive solo en memoria */
    }
  }, [qty])

  const min = STORE.wholesaleFrom
  const set = (id, n) => setQty((cur) => {
    const next = { ...cur }
    if (n <= 0) delete next[id]
    else next[id] = n
    return next
  })

  // Cada línea lleva su propio precio: mayorista si llegó al mínimo de ese perfume, normal si no
  const lines = useMemo(
    () => products.filter((p) => qty[p.id] > 0 && !soldOut(p)).map((p) => {
      const n = qty[p.id]
      const pct = wholesalePercentFor(p, n)
      const ws = pct > 0
      return { p, n, pct, ws, unit: ws ? wholesalePrice(base(p), pct) : base(p) }
    }),
    [qty, products, min],
  )
  const units = lines.reduce((s, l) => s + l.n, 0)
  const ready = lines.some((l) => l.ws)
  const subtotal = lines.reduce((s, l) => s + l.n * l.unit, 0)
  const normal = lines.reduce((s, l) => s + l.n * base(l.p), 0)
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const cats = ['Todos', ...categories]
  const list = products.filter((p) => cat === 'Todos' || p.category === cat)

  const submit = (e) => {
    e.preventDefault()
    if (!ready) return
    const body = [
      `Hola ${STORE.name}, quiero hacer un *pedido MAYORISTA*:`,
      '',
      ...lines.map((l) => `• ${l.n} x ${l.p.name} (${l.p.size} ml) — ${money(l.n * l.unit)}${l.ws ? ` (mayorista, ${l.pct}% menos)` : ' (precio normal)'}`),
      '',
      `Unidades: ${units}`,
      'Envío: se confirma por WhatsApp',
      `*Total de productos: ${money(subtotal)}*`,
      '',
      `Nombre: ${f.nombre}`,
      `Teléfono: ${f.telefono}`,
      `Ciudad: ${f.ciudad}`,
      `Dirección: ${f.direccion}`,
      f.notas ? `Notas: ${f.notas}` : null,
    ].filter((x) => x !== null).join('\n')
    window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(body)}`, '_blank', 'noopener')
    setQty({})
    setSent(true)
  }

  if (sent) {
    return (
      <section className="section container center">
        <h1 className="h2">¡Gracias por tu pedido mayorista!</h1>
        <p className="lead">Se abrió WhatsApp con el resumen. Te confirmaremos disponibilidad y envío por ahí.</p>
        <button className="btn" onClick={() => setSent(false)}>Hacer otro pedido</button>
      </section>
    )
  }

  return (
    <section className="section container">
      <div className="section-head">
        <div>
          <p className="eyebrow">Mayoristas</p>
          <h1 className="h2">Compra al por mayor</h1>
        </div>
      </div>
      <p className="lead ws-intro">
        Pide <strong>{min} o más unidades de un mismo perfume</strong>, sin límite de cantidad, y ese perfume pasa solo a su precio mayorista.
        Cada perfume tiene su propio descuento, y si pides más, el precio baja otra vez:
        {' '}desde <strong>{STORE.wholesaleTiers.slice(1).join(' y desde ')}</strong> unidades del mismo perfume.
      </p>

      <div className="checkout ws">
        <div>
          <div className="chips ws-cats">
            {cats.map((c) => (
              <button key={c} type="button" className={`chip ${cat === c ? 'on' : ''}`} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <ul className="ws-list">
            {list.map((p) => {
              const n = qty[p.id] || 0
              const pct = wholesalePercentFor(p, min)
              const nowPct = wholesalePercentFor(p, n)
              const next = nextWholesaleTier(n)
              return (
                <li key={p.id} className={`${n ? 'has' : ''} ${soldOut(p) ? 'out' : ''}`}>
                  <span className="ws-media"><Bottle product={p} className="ws-img" /></span>
                  <span className="ws-info">
                    <strong>{p.name}</strong>
                    <small>{p.category} · {p.size} ml</small>
                    <span className="ws-price">
                      <b>{money(wholesalePrice(base(p), pct))}</b> <s>{money(base(p))}</s>
                      <em className="ws-tag">-{pct}% desde {min}</em>
                    </span>
                    {n > 0 && !soldOut(p) && (
                      <small className={`ws-hint ${n >= min ? 'ok' : ''}`}>
                        {n >= min ? `✓ Precio mayorista aplicado (-${nowPct}%)` : `Agrega ${min - n} más para el precio mayorista`}
                        {n >= min && next ? ` · agrega ${next.from - n} más y baja a ${money(wholesalePrice(base(p), wholesalePercentFor(p, next.from)))} c/u` : ''}
                      </small>
                    )}
                  </span>
                  {soldOut(p) ? (
                    <span className="ws-soldout">Agotado</span>
                  ) : (
                    <span className="ws-step" role="group" aria-label={`Unidades de ${p.name}`}>
                      <button type="button" aria-label="Quitar una" onClick={() => set(p.id, n - 1)} disabled={!n}>−</button>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        placeholder="0"
                        aria-label={`Cantidad de ${p.name}`}
                        value={n || ''}
                        onChange={(e) => set(p.id, Math.max(0, Math.floor(Number(e.target.value)) || 0))}
                      />
                      <button type="button" aria-label="Agregar una" onClick={() => set(p.id, n + 1)}>+</button>
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        <aside className="summary">
          <h3>Tu pedido mayorista</h3>
          <p className="muted">
            {lines.length === 0
              ? `Elige los perfumes y la cantidad. Desde ${min} unidades de un mismo perfume tiene precio mayorista.`
              : ready
                ? '¡Listo! Los perfumes con ✓ ya tienen precio mayorista.'
                : `Pide ${min} o más unidades de un mismo perfume para el precio mayorista.`}
          </p>
          {lines.length > 0 && (
            <ul>
              {lines.map((l) => (
                <li key={l.p.id}>
                  <span>{l.n} × {l.p.name}{l.ws ? ` ✓ -${l.pct}%` : ''}</span>
                  <span>{money(l.n * l.unit)}</span>
                </li>
              ))}
            </ul>
          )}
          {normal > subtotal && <div className="row ws-save"><span>Ahorras</span><span>{money(normal - subtotal)}</span></div>}
          <div className="row"><span>Envío</span><span>Se confirma por WhatsApp</span></div>
          <div className="row total"><span>Total de productos</span><strong>{money(subtotal)}</strong></div>

          <form onSubmit={submit} className="form ws-form">
            <label>Nombre completo<input required value={f.nombre} onChange={on('nombre')} autoComplete="name" /></label>
            <label>Teléfono<input required type="tel" value={f.telefono} onChange={on('telefono')} autoComplete="tel" /></label>
            <label>Ciudad<input required value={f.ciudad} onChange={on('ciudad')} autoComplete="address-level2" /></label>
            <label>Dirección<input required value={f.direccion} onChange={on('direccion')} autoComplete="street-address" /></label>
            <label>Notas (opcional)<textarea rows="2" value={f.notas} onChange={on('notas')} /></label>
            <button className="btn btn-block" disabled={!ready}>
              {ready ? 'Enviar pedido por WhatsApp' : `Pide ${min} o más de un mismo perfume`}
            </button>
          </form>
          <p className="muted legal-note">Al enviar tu pedido aceptas la <Link to="/privacidad">política de privacidad</Link> y los <Link to="/terminos">términos y condiciones</Link>.</p>
          <p className="muted">No se cobra nada en línea: coordinamos el pago contigo por WhatsApp.</p>
        </aside>
      </div>
    </section>
  )
}
