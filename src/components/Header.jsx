import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { STORE, asset } from '../config'
import { buildMenuItems } from './menuItems'
import { useCatalog } from '../context/CatalogContext'
import { useFlash } from '../lib/flash'

export default function Header() {
  const { count, setOpen } = useCart()
  const [menu, setMenu] = useState(false)
  const [sub, setSub] = useState(false)
  const [mega, setMega] = useState(false)
  const [preview, setPreview] = useState(0)
  const [find, setFind] = useState(false)
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const catalog = useCatalog()
  const { on: flashOn } = useFlash()
  const items = useMemo(() => buildMenuItems({ ...catalog, flashOn }), [catalog, flashOn])
  const current = items[preview]

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setMega(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const search = (e) => {
    e.preventDefault()
    navigate(`/catalogo?q=${encodeURIComponent(q.trim())}`)
    setMenu(false)
    setFind(false)
  }

  return (
    <>
      <header className="header" onMouseLeave={() => setMega(false)}>
        <div className="container header-in">
          <button className="icon-btn burger" aria-label="Menú" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <span /><span />
          </button>

          <nav className="nav-main" aria-label="Principal">
            <button
              type="button"
              className={`nav-trigger ${mega ? 'on' : ''}`}
              aria-haspopup="true"
              aria-expanded={mega}
              onMouseEnter={() => setMega(true)}
              onClick={() => setMega(!mega)}
            >
              Colección <i aria-hidden="true">▾</i>
            </button>
            <Link to="/#como-comprar">Cómo comprar</Link>
            <NavLink to="/mayoristas">Mayoristas</NavLink>
            <NavLink to="/nosotros">Nosotros</NavLink>
          </nav>

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

        <div className={`mega ${mega ? 'open' : ''}`} aria-hidden={!mega}>
          <div className="container mega__inner">
            <ul className="mega__list">
              {items.map((it, i) => (
                <li key={it.title}>
                  <Link
                    to={it.to}
                    className={preview === i ? 'on' : ''}
                    tabIndex={mega ? 0 : -1}
                    onMouseEnter={() => setPreview(i)}
                    onFocus={() => setPreview(i)}
                    onClick={() => setMega(false)}
                  >
                    <span>{it.title}</span>
                    <small>{String(i).padStart(2, '0')}</small>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mega__preview" aria-hidden="true">
              <img key={current.title} className={`mega__img ${current.fit}`} src={asset(current.img)} alt="" />
              <div className="mega__cap">
                <b>{current.title}</b>
                <small>{current.label ?? `${current.count} fragancias`}</small>
              </div>
            </div>
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
        <NavLink to="/catalogo" end>Catálogo</NavLink>
        <button
          type="button"
          className={`side-sub-btn ${sub ? 'open' : ''}`}
          aria-expanded={sub}
          onClick={(e) => { e.stopPropagation(); setSub(!sub) }}
        >
          Colección <i aria-hidden="true">+</i>
        </button>
        <div className={`side-sub ${sub ? 'open' : ''}`}>
          <div>
            {items.slice(1).map((it) => <Link key={it.title} to={it.to} tabIndex={sub ? 0 : -1}>{it.title}</Link>)}
          </div>
        </div>
        <NavLink to="/mayoristas">Mayoristas</NavLink>
        <NavLink to="/nosotros">Nosotros</NavLink>
        <NavLink to="/contacto">Contacto</NavLink>
      </nav>
    </>
  )
}
