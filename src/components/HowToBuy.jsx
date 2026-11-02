import { Link } from 'react-router-dom'
import { STORE } from '../config'

const STEPS = [
  { n: '01', t: 'Elige tu perfume', d: 'Explora nuestro catálogo y encuentra tu próximo perfume favorito.' },
  { n: '02', t: 'Realiza tu pedido', d: 'Agrega tus productos al carrito y envíanos tu pedido por WhatsApp para continuar con la compra.' },
  { n: '03', t: 'Confirmamos tu pedido', d: 'Verificamos la disponibilidad, te informamos el costo del envío y el tiempo estimado de entrega.' },
  { n: '04', t: 'Recibe tu pedido', d: 'Elige tu forma de pago: anticipado o contra entrega. Recibe en casa o reclama tu pedido en la transportadora.' },
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
