import { asset } from '../config'

export const CARRIERS = [
  { n: 'Servientrega', img: '/brand/transportadoras/servientrega.png' },
  { n: 'Coordinadora', img: '/brand/transportadoras/coordinadora.png' },
  { n: 'Interrapidísimo', img: '/brand/transportadoras/interrapidisimo.png' },
]

// El cliente elige con qué transportadora quiere recibir su pedido; la elegida viaja en el mensaje de WhatsApp.
export default function CarrierPicker({ value, onChange }) {
  return (
    <fieldset className="carriers">
      <legend>Transportadora</legend>
      <div className="carrier-opts">
        {CARRIERS.map((c) => (
          <label key={c.n} className={`carrier ${value === c.n ? 'on' : ''}`}>
            <input type="radio" name="transportadora" value={c.n} checked={value === c.n} onChange={() => onChange(c.n)} required />
            <span className="carrier-logo"><img src={asset(c.img)} alt={c.n} /></span>
            <span className="carrier-name">{c.n}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
