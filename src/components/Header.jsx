import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { STORE } from '../config'

export default function Header() {
  const { count, setOpen } = useCart()
  const [menu, setMenu] = useState(false)
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const search = (e) => {
    e.preventDefault()
    navigate(`/catalogo?q=${encodeURIComponent(q.trim())}`)
    setMenu(false)
  }

  return (
    <header className="header">
      <div className="container header-in">
        <button className="icon-btn burger" aria-label="Menú" onClick={() => setMenu(!menu)}>
          <span /><span /><span />
        </button>
        <Link to="/" className="logo" onClick={() => setMenu(false)}>
          <img src={STORE.logo} alt="" className="logo-img" />
          <span>LOURYX</span>
        </Link>
        <nav className={`nav ${menu ? 'open' : ''}`} onClick={() => setMenu(false)}>
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/catalogo">Catálogo</NavLink>
          <NavLink to="/catalogo?cat=Mujer">Mujer</NavLink>
          <NavLink to="/catalogo?cat=Hombre">Hombre</NavLink>
          <NavLink to="/nosotros">Nosotros</NavLink>
          <NavLink to="/contacto">Contacto</NavLink>
        </nav>
        <form className="search" onSubmit={search} role="search">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar perfume…" aria-label="Buscar perfume" />
        </form>
        <button className="icon-btn cart-btn" aria-label={`Carrito, ${count} productos`} onClick={() => setOpen(true)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" />
          </svg>
          {count > 0 && <span className="cart-count">{count}</span>}
        </button>
      </div>
    </header>
  )
}
