import { Link } from 'react-router-dom'
import { STORE } from '../config'
import { useCatalog } from '../context/CatalogContext'

export default function Footer() {
  const { categories: CATEGORIES, families: FAMILIES } = useCatalog()
  return (
    <footer className="footer">
      <div className="container footer-in">
        <div>
          <h4>Colecciones</h4>
          <Link to="/catalogo">Todo el catálogo</Link>
          {CATEGORIES.map((c) => <Link key={c} to={`/catalogo?cat=${encodeURIComponent(c)}`}>{c}</Link>)}
        </div>
        <div>
          <h4>Por aroma</h4>
          {FAMILIES.map((f) => <Link key={f} to={`/catalogo?fam=${encodeURIComponent(f)}`}>{f}</Link>)}
        </div>
        <div>
          <h4>Ayuda</h4>
          <Link to="/#como-comprar">Cómo comprar</Link>
          <Link to="/#recomendacion">Pedir recomendación</Link>
          <Link to="/mayoristas">Compra al por mayor</Link>
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/contacto">Contacto</Link>
          <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>
          <a href={STORE.tiktok} target="_blank" rel="noreferrer">TikTok</a>
        </div>
      </div>

      <div className="footer-brand">
        <div className="footer-mark" aria-hidden="true">
          <img src={STORE.logo} alt="" />
          <span>LOURYX</span>
        </div>
        <p>Las mejores referencias en perfumes. Decants de 5 y 10 ml, envíos contra entrega a todo Colombia.</p>
      </div>

      <p className="copy">© {new Date().getFullYear()} Louryx. Todos los derechos reservados.</p>
    </footer>
  )
}
