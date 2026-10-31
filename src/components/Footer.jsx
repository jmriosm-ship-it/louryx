import { Link } from 'react-router-dom'
import { STORE } from '../config'
import { CATEGORIES, FAMILIES } from '../data/products'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-in">
        <div>
          <div className="logo"><img src={STORE.logo} alt="" className="logo-img" /><span>LOURYX</span></div>
          <p className="muted">Las mejores referencias en perfumes. Decants de 5 y 10 ml, envíos contra entrega a todo Colombia.</p>
        </div>
        <div>
          <h4>Colecciones</h4>
          <Link to="/catalogo">Todo el catálogo</Link>
          {CATEGORIES.map((c) => <Link key={c} to={`/catalogo?cat=${c}`}>{c}</Link>)}
        </div>
        <div>
          <h4>Por aroma</h4>
          {FAMILIES.map((f) => <Link key={f} to={`/catalogo?fam=${f}`}>{f}</Link>)}
        </div>
        <div>
          <h4>Ayuda</h4>
          <Link to="/#como-comprar">Cómo comprar</Link>
          <Link to="/#recomendacion">Pedir recomendación</Link>
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/contacto">Contacto</Link>
          <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>
          <a href={STORE.tiktok} target="_blank" rel="noreferrer">TikTok</a>
        </div>
      </div>
      <p className="copy">© {new Date().getFullYear()} Louryx. Todos los derechos reservados.</p>
    </footer>
  )
}
