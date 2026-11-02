import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { STORE } from '../config'

export default function Header() {
  const { count, setOpen } = useCart()
  const [menu, setMenu] = useState(false)
  const [find, setFind] = useState(false)
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const search = (e) => {
    e.preventDefault()
    navigate(`/catalogo?q=${encodeURIComponent(q.trim())}`)
    setMenu(false)
    setFind(false)
  }

  return (
    <>
      <header className="header">
        <div className="container header-in">
          <button className="icon-btn burger" aria-label="Menú" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <span /><span />
          </button>
          <Link to="/" className="logo" onClick={() => setMenu(false)} aria-label="Louryx, inicio">
            <img src={STORE.logo} alt="" className="logo-img" />
            <span>LOURYX</span>
          </Link>
          <div className="header-actions">
            <button className="icon-btn" aria-label="Buscar" aria-expanded={find} onClick={() => setFind(!find)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" />
              </svg>
            </button>
            <button className="icon-btn cart-btn" aria-label={`Carrito, ${count} productos`} onClick={() => setOpen(true)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" />
              </svg>
              {count > 0 && <span className="cart-count">{count}</span>}
            </button>
          </div>
        </div>
        {find && (
          <form className="search-bar" onSubmit={search} role="search">
            <div className="container">
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar perfume…" aria-label="Buscar perfume" />
            </div>
          </form>
        )}
      </header>
      <div className={`side-overlay ${menu ? 'open' : ''}`} onClick={() => setMenu(false)} />
      <nav className={`side-menu ${menu ? 'open' : ''}`} onClick={() => setMenu(false)} aria-label="Menú principal">
        <button className="side-close icon-btn" aria-label="Cerrar menú">✕</button>
        <NavLink to="/" end>Inicio</NavLink>
        <NavLink to="/catalogo">Catálogo</NavLink>
        <NavLink to="/catalogo?cat=Mujer">Mujer</NavLink>
        <NavLink to="/catalogo?cat=Hombre">Hombre</NavLink>
        <NavLink to="/mayoristas">Mayoristas</NavLink>
        <NavLink to="/nosotros">Nosotros</NavLink>
        <NavLink to="/contacto">Contacto</NavLink>
      </nav>
    </>
  )
}
