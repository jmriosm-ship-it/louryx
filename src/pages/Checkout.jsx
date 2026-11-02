import { useState } from 'react'
import { Link } from 'react-router-dom'
import PaymentMethods from '../components/PaymentMethods'
import CarrierPicker from '../components/CarrierPicker'
import { useCart } from '../context/CartContext'
import { money, STORE } from '../config'

const empty = { nombre: '', telefono: '', ciudad: '', direccion: '', transportadora: '', notas: '' }

export default function Checkout() {
  const { lines, subtotal, clear } = useCart()
  const [f, setF] = useState(empty)
  const [sent, setSent] = useState(false)

  const on = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    const body = [
      `Hola ${STORE.name}, quiero hacer este pedido:`,
      '',
      ...lines.map((l) => `• ${l.qty} x ${l.product.name} (${l.product.size} ml) — ${money(l.qty * l.product.price)}`),
      '',
      'Envío: se confirma por WhatsApp',
      `*Total de productos: ${money(subtotal)}*`,
      '',
      `Nombre: ${f.nombre}`,
      `Teléfono: ${f.telefono}`,
      `Ciudad: ${f.ciudad}`,
      `Dirección: ${f.direccion}`,
      `Transportadora: ${f.transportadora}`,
      f.notas ? `Notas: ${f.notas}` : null,
    ].filter((x) => x !== null).join('\n')
    window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(body)}`, '_blank', 'noopener')
    clear()
    setSent(true)
  }

  if (sent) {
    return (
      <section className="section container center">
        <h1 className="h2">¡Gracias por tu pedido!</h1>
        <p className="lead">Se abrió WhatsApp con el resumen. Te confirmaremos disponibilidad y envío por ahí.</p>
        <Link className="btn" to="/catalogo">Seguir comprando</Link>
      </section>
    )
  }

  if (!lines.length) {
    return (
      <section className="section container center">
        <h1 className="h2">Tu carrito está vacío</h1>
        <Link className="btn" to="/catalogo">Ver catálogo</Link>
      </section>
    )
  }

  return (
    <section className="section container">
      <div className="section-head"><h1 className="h2">Finalizar pedido</h1></div>
      <div className="checkout">
        <form onSubmit={submit} className="form">
          <label>Nombre completo<input required value={f.nombre} onChange={on('nombre')} autoComplete="name" /></label>
          <label>Teléfono<input required type="tel" value={f.telefono} onChange={on('telefono')} autoComplete="tel" /></label>
          <label>Ciudad<input required value={f.ciudad} onChange={on('ciudad')} autoComplete="address-level2" /></label>
          <label>Dirección<input required value={f.direccion} onChange={on('direccion')} autoComplete="street-address" /></label>
          <CarrierPicker value={f.transportadora} onChange={(v) => setF({ ...f, transportadora: v })} />
          <label>Notas (opcional)<textarea rows="3" value={f.notas} onChange={on('notas')} /></label>
          <button className="btn btn-block">Enviar pedido por WhatsApp</button>
          <p className="muted legal-note">Al enviar tu pedido aceptas la <Link to="/privacidad">política de privacidad</Link> y los <Link to="/terminos">términos y condiciones</Link>.</p>
          <p className="muted">No se cobra nada en línea: coordinamos el pago contigo por WhatsApp.</p>
          <PaymentMethods note={null} />
        </form>

        <aside className="summary">
          <h3>Resumen</h3>
          <ul>
            {lines.map((l) => (
              <li key={l.id}><span>{l.qty} × {l.product.name}</span><span>{money(l.qty * l.product.price)}</span></li>
            ))}
          </ul>
          <div className="row"><span>Envío</span><span>Se confirma por WhatsApp</span></div>
          <div className="row total"><span>Total de productos</span><strong>{money(subtotal)}</strong></div>
        </aside>
      </div>
    </section>
  )
}
