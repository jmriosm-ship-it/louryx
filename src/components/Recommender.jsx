import { useState } from 'react'
import { STORE } from '../config'

const QUESTIONS = [
  { key: 'para', label: '¿Para quién es?', options: ['Para mí', 'Para una mujer', 'Para un hombre', 'De regalo'], multi: false },
  { key: 'aromas', label: '¿Qué aromas te gustan?', options: ['Fresco', 'Dulce', 'Amaderado', 'Árabe', 'Floral', 'Cítrico'], multi: true },
  { key: 'momento', label: '¿Cuándo lo usarías?', options: ['Día a día', 'Noche', 'Oficina', 'Salir'], multi: true },
  { key: 'tamano', label: '¿Qué presentación?', options: ['Decant 5 ml', 'Decant 10 ml', 'Frasco completo'], multi: false },
]

export default function Recommender() {
  const [sel, setSel] = useState({ para: [], aromas: [], momento: [], tamano: [] })

  const toggle = (q, opt) =>
    setSel((cur) => {
      const has = cur[q.key].includes(opt)
      if (!q.multi) return { ...cur, [q.key]: has ? [] : [opt] }
      return { ...cur, [q.key]: has ? cur[q.key].filter((o) => o !== opt) : [...cur[q.key], opt] }
    })

  const lines = [
    'Hola Louryx, quiero una recomendación de perfume.',
    sel.para.length ? `Es para: ${sel.para.join(', ')}` : null,
    sel.aromas.length ? `Me gustan los aromas: ${sel.aromas.join(', ')}` : null,
    sel.momento.length ? `Lo usaría para: ${sel.momento.join(', ')}` : null,
    sel.tamano.length ? `Presentación: ${sel.tamano.join(', ')}` : null,
  ].filter(Boolean)
  const href = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`

  return (
    <section className="rec-wrap" id="recomendacion">
      <div className="container rec">
        <div className="rec-intro">
          <p className="eyebrow">Asesoría personalizada</p>
          <h2>¿No sabes cuál elegir?</h2>
          <p className="lead">Cuéntanos qué te gusta. Marca las opciones y te armamos el mensaje listo para enviarnos por WhatsApp; nosotros te recomendamos el ideal.</p>
        </div>
        <div className="rec-form">
          {QUESTIONS.map((q) => (
            <fieldset key={q.key}>
              <legend>{q.label}{q.multi && <small> · puedes marcar varias</small>}</legend>
              <div className="chips">
                {q.options.map((o) => (
                  <button
                    key={o}
                    type="button"
                    className={`chip ${sel[q.key].includes(o) ? 'on' : ''}`}
                    aria-pressed={sel[q.key].includes(o)}
                    onClick={() => toggle(q, o)}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          <a className="btn" href={href} target="_blank" rel="noreferrer">Pedir recomendación por WhatsApp</a>
        </div>
      </div>
    </section>
  )
}
