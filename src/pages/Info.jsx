import { Link } from 'react-router-dom'
import { STORE } from '../config'
import TikTokIcon from '../components/TikTokIcon'

export function About() {
  return (
    <section className="section container prose">
      <p className="eyebrow">Nosotros</p>
      <h1 className="about-title">Tu personalidad merece una esencia única.</h1>
      <p className="lead">En LOURYX creemos que un perfume va más allá de un aroma: es parte de tu identidad, refleja tu personalidad y deja una impresión que permanece.</p>
      <p>Por eso, seleccionamos cuidadosamente referencias que destacan por su proyección, fijación y distinción. Perfumes para quienes buscan marcar presencia, expresar su estilo y encontrar una esencia que los represente.</p>
      <div className="values">
        <div><h4>Calidad</h4><p>Fragancias elegidas por su desempeño real.</p></div>
        <div><h4>Cercanía</h4><p>Te asesoramos personalmente por WhatsApp.</p></div>
        <div><h4>Confianza</h4><p>Pagas cuando coordinamos contigo, sin sorpresas.</p></div>
      </div>
      <div className="about-cta">
        <Link className="btn" to="/catalogo">Explorar catálogo</Link>
        <a className="btn btn-ghost tiktok-link" href={STORE.tiktok} target="_blank" rel="noreferrer">
          <TikTokIcon size={18} /> Síguenos en TikTok {STORE.tiktokHandle}
        </a>
      </div>
    </section>
  )
}

export function Contact() {
  return (
    <section className="section container prose">
      <p className="eyebrow">Contacto</p>
      <h1 className="h2">Hablemos</h1>
      <p className="lead">Resolvemos tus dudas y te ayudamos a elegir.</p>
      <ul className="contact-list">
        <li><strong>WhatsApp</strong><a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer">{STORE.phoneDisplay}</a></li>
        <li><strong>TikTok</strong><a href={STORE.tiktok} target="_blank" rel="noreferrer">{STORE.tiktokHandle}</a></li>
        <li><strong>Ubicación</strong><span>{STORE.city} · envíos a todo el país</span></li>
      </ul>
    </section>
  )
}

export function NotFound() {
  return (
    <section className="section container center">
      <h1 className="h2">Página no encontrada</h1>
      <Link className="btn" to="/">Ir al inicio</Link>
    </section>
  )
}
