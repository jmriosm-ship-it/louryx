import { Link } from 'react-router-dom'
import { STORE } from '../config'

const STEPS = [
  { n: '01', t: 'Elige tu perfume', d: 'Explora el catálogo y escoge el frasco o un decant de 5 o 10 ml.' },
  { n: '02', t: 'Haz tu pedido', d: 'Agrégalo al carrito y envíanos el pedido por WhatsApp, o escríbenos directo.' },
  { n: '03', t: 'Te confirmamos', d: 'Revisamos disponibilidad y te decimos el valor del envío y el tiempo de entrega.' },
  { n: '04', t: 'Pagas al recibir', d: 'Envíos contra entrega a todo Colombia. Pagas cuando te llega y grabas un video al abrir el paquete: es tu garantía.' },
]

export default function HowToBuy() {
  return (
    <section className="section container" id="como-comprar">
      <div className="section-head">
        <div><p className="eyebrow">Compra fácil</p><h2 className="display">¡Comprar es muy fácil!</h2></div>
        <Link to="/catalogo" className="link">Ver catálogo →</Link>
      </div>
      <ol className="how">
        {STEPS.map((s) => (
          <li key={s.n}>
            <span className="how-n" aria-hidden="true">{s.n}</span>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </li>
        ))}
      </ol>
      <p className="how-note">Compra al por mayor desde {STORE.wholesaleFrom} unidades con precio especial. <Link to="/mayoristas" className="link">Ver mayoristas →</Link></p>
    </section>
  )
}
