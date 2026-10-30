import { STORE } from '../config'

const ITEMS = [
  { q: '¿Qué es un decant?', a: 'Es una porción del perfume en un frasco atomizador pequeño, de 5 o 10 ml. Sirve para probar una fragancia antes de comprar el frasco completo, o para llevarla de viaje.' },
  { q: '¿Cómo es el pago?', a: 'Los envíos son contra entrega: pagas cuando recibes tu pedido.' },
  { q: '¿Envían a todo el país?', a: 'Sí, enviamos a todo Colombia. Al hacer tu pedido te confirmamos el valor del envío y el tiempo de entrega.' },
  { q: '¿Tienen precios para revendedores?', a: `Sí, manejamos precios mayoristas desde ${STORE.wholesaleFrom} unidades. Escríbenos por WhatsApp y te cotizamos.` },
  { q: '¿Cómo sé qué perfume elegir?', a: 'Usa el recomendador de esta página o escríbenos por WhatsApp contándonos qué aromas te gustan, y te sugerimos opciones.' },
]

export default function Faq() {
  return (
    <section className="section container" id="preguntas">
      <div className="section-head">
        <div><p className="eyebrow">Resolvemos tus dudas</p><h2>Preguntas frecuentes</h2></div>
      </div>
      <div className="faq">
        {ITEMS.map((it) => (
          <details key={it.q}>
            <summary>{it.q}<span aria-hidden="true">+</span></summary>
            <p>{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
