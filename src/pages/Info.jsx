import { Link } from 'react-router-dom'
import { STORE } from '../config'

export function About() {
  return (
    <section className="section container prose">
      <p className="eyebrow">Nosotros</p>
      <h1 className="h2">Perfumería con alma</h1>
      <p className="lead">En Louryx creemos que un perfume es la firma invisible de cada persona. Seleccionamos fragancias con ingredientes nobles, buena proyección y larga duración.</p>
      <p>Nacimos para que comprar un perfume sea fácil, cercano y sin complicaciones: eliges en el catálogo, nos escribes y te lo llevamos hasta la puerta de tu casa.</p>
      <div className="values">
        <div><h4>Calidad</h4><p>Fragancias elegidas por su desempeño real.</p></div>
        <div><h4>Cercanía</h4><p>Te asesoramos personalmente por WhatsApp.</p></div>
        <div><h4>Confianza</h4><p>Pagas cuando coordinamos contigo, sin sorpresas.</p></div>
      </div>
      <Link className="btn" to="/catalogo">Explorar catálogo</Link>
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
