import { useEffect, useMemo, useState } from 'react'
import Bottle from '../components/Bottle'
import { products } from '../data/products'
import { money, STORE, wholesalePrice } from '../config'

const KEY = 'louryx-mayorista'
const empty = { nombre: '', telefono: '', ciudad: '', direccion: '', notas: '' }

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

// Pedido mayorista: es independiente del carrito normal. El precio mayorista se aplica
// cuando el total de unidades (mezclando perfumes) llega al mínimo de STORE.wholesaleFrom.
export default function Wholesale() {
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

  const lines = useMemo(
    () => products.filter((p) => qty[p.id] > 0).map((p) => ({ p, n: qty[p.id] })),
    [qty],
  )
  const units = lines.reduce((s, l) => s + l.n, 0)
  const isWholesale = units >= min
  const unit = (p) => (isWholesale ? wholesalePrice(p.price) : p.price)
  const subtotal = lines.reduce((s, l) => s + l.n * unit(l.p), 0)
  const normal = lines.reduce((s, l) => s + l.n * l.p.price, 0)
  const shipping = subtotal >= STORE.freeShippingFrom || subtotal === 0 ? 0 : 12000
  const total = subtotal + shipping
  const missing = Math.max(0, min - units)
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const cats = ['Todos', 'Mujer', 'Hombre', 'Unisex']
  const list = products.filter((p) => cat === 'Todos' || p.category === cat)

  const submit = (e) => {
    e.preventDefault()
    if (!isWholesale) return
    const body = [
      `Hola ${STORE.name}, quiero hacer un *pedido MAYORISTA*:`,
      '',
      ...lines.map((l) => `• ${l.n} x ${l.p.name} (${l.p.size} ml) — ${money(l.n * unit(l.p))}`),
      '',
      `Unidades: ${units}`,
      `Subtotal mayorista: ${money(subtotal)}`,
      `Envío: ${shipping ? money(shipping) : 'Gratis'}`,
      `*Total: ${money(total)}*`,
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
        Desde {min} unidades en adelante, mezclando los perfumes que quieras, tu pedido tiene precio mayorista:
        {' '}<strong>{Math.round(STORE.wholesaleDiscount * 100)}% menos</strong> en cada perfume.
      </p>

      <div className="checkout ws">
        <div>
          <div className="chips ws-cats">
            {cats.map((c) => (
              <button key={c} type="button" className={`chip ${cat === c ? 'on' : ''}`} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <ul className="ws-list">
            {list.map((p) => (
              <li key={p.id} className={qty[p.id] ? 'has' : ''}>
                <span className="ws-media"><Bottle product={p} className="ws-img" /></span>
                <span className="ws-info">
                  <strong>{p.name}</strong>
                  <small>{p.category} · {p.size} ml</small>
                  <span className="ws-price">
                    <b>{money(wholesalePrice(p.price))}</b> <s>{money(p.price)}</s>
                  </span>
                </span>
                <span className="ws-step" role="group" aria-label={`Unidades de ${p.name}`}>
                  <button type="button" aria-label="Quitar una" onClick={() => set(p.id, (qty[p.id] || 0) - 1)} disabled={!qty[p.id]}>−</button>
                  <output>{qty[p.id] || 0}</output>
                  <button type="button" aria-label="Agregar una" onClick={() => set(p.id, (qty[p.id] || 0) + 1)}>+</button>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="summary">
          <h3>Tu pedido mayorista</h3>
          <div className={`ws-meter ${isWholesale ? 'ok' : ''}`}>
            <i style={{ width: `${Math.min(100, (units / min) * 100)}%` }} />
          </div>
          <p className="muted">
            {isWholesale
              ? `¡Listo! Tienes precio mayorista (${units} unidades).`
              : `Llevas ${units} de ${min}. Agrega ${missing} más para el precio mayorista.`}
          </p>
          {lines.length > 0 && (
            <ul>
              {lines.map((l) => (
                <li key={l.p.id}><span>{l.n} × {l.p.name}</span><span>{money(l.n * unit(l.p))}</span></li>
              ))}
            </ul>
          )}
          {isWholesale && normal > subtotal && <div className="row ws-save"><span>Ahorras</span><span>{money(normal - subtotal)}</span></div>}
          <div className="row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="row"><span>Envío</span><span>{shipping ? money(shipping) : 'Gratis'}</span></div>
          <div className="row total"><span>Total</span><strong>{money(total)}</strong></div>

          <form onSubmit={submit} className="form ws-form">
            <label>Nombre completo<input required value={f.nombre} onChange={on('nombre')} autoComplete="name" /></label>
            <label>Teléfono<input required type="tel" value={f.telefono} onChange={on('telefono')} autoComplete="tel" /></label>
            <label>Ciudad<input required value={f.ciudad} onChange={on('ciudad')} autoComplete="address-level2" /></label>
            <label>Dirección<input required value={f.direccion} onChange={on('direccion')} autoComplete="street-address" /></label>
            <label>Notas (opcional)<textarea rows="2" value={f.notas} onChange={on('notas')} /></label>
            <button className="btn btn-block" disabled={!isWholesale}>
              {isWholesale ? 'Enviar pedido por WhatsApp' : `Falta${missing === 1 ? '' : 'n'} ${missing} unidad${missing === 1 ? '' : 'es'}`}
            </button>
          </form>
          <p className="muted">No se cobra nada en línea: coordinamos el pago contigo por WhatsApp.</p>
        </aside>
      </div>
    </section>
  )
}
