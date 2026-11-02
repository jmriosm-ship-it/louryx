import { asset } from '../config'

const PAGOS = [
  { n: 'Nequi', img: '/brand/pagos/nequi.png' },
  { n: 'Bancolombia', img: '/brand/pagos/bancolombia.png' },
  { n: 'Llaves (Bre-B)', img: '/brand/pagos/llaves.png' },
  { n: 'Addi', img: '/brand/pagos/addi.png' },
]

// Medios de pago con sus logos: se usa en el carrito, en finalizar pedido y en mayoristas.
export default function PaymentMethods({ note = 'Pago anticipado o contra entrega. Te confirmamos por WhatsApp.' }) {
  return (
    <div className="pay">
      <p className="pay-t">Medios de pago</p>
      <ul className="pay-logos">
        {PAGOS.map((m) => <li key={m.n}><img src={asset(m.img)} alt={m.n} /></li>)}
      </ul>
      {note && <p className="pay-note">{note}</p>}
    </div>
  )
}
