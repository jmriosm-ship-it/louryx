import { STORE } from '../config'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }

const PLACE = encodeURIComponent('Convención, Norte de Santander, Colombia')
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${PLACE}`
const MAPS_EMBED = `https://www.google.com/maps?q=${PLACE}&output=embed`

const ITEMS = [
  {
    title: 'Pago contra entrega',
    text: 'Enviamos a toda Colombia. Pagas cuando recibes tu pedido.',
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
        <path d="M5 17H3V6a1 1 0 0 1 1-1h9v12m-4 0h6m4 0h2v-6h-8m0-5h5l3 5" />
      </svg>
    ),
  },
  {
    title: 'Contáctanos',
    text: 'Escríbenos por WhatsApp y te ayudamos a elegir tu perfume.',
    href: `https://wa.me/${STORE.whatsapp}`,
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
      </svg>
    ),
  },
  {
    title: 'Empaque',
    text: 'Tu paquete llegará seguro, bien protegido durante el transporte.',
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3" />
        <path d="M12 12l8-4.5M12 12v9m0-9L4 7.5M16 5.25l-8 4.5" />
      </svg>
    ),
  },
]

export default function Benefits() {
  return (
    <section className="benefits-wrap">
      <div className="container section benefits">
        {ITEMS.map((it) => {
          const body = (
            <>
              <span className="bn-icon">{it.icon}</span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </>
          )
          return it.href
            ? <a key={it.title} className="bn" href={it.href} target="_blank" rel="noreferrer">{body}</a>
            : <div key={it.title} className="bn">{body}</div>
        })}
      </div>
      <div className="container find">
        <div className="find-info">
          <span className="eyebrow">Visítanos</span>
          <h2>Encuéntranos</h2>
          <p>Convención, Norte de Santander, Colombia.</p>
          <a className="btn" href={MAPS_LINK} target="_blank" rel="noreferrer">Abrir en Maps</a>
        </div>
        <iframe className="find-map" title="Ubicación de Louryx en Convención, Norte de Santander" src={MAPS_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      </div>
    </section>
  )
}
