import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { STORE, asset, money, wholesalePercentFor, wholesalePrice } from '../config'
import { byRelevance, matches, words } from '../lib/searchText'
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

  // En la página de Mayoristas el buscador trabaja con precios y pedido mayorista
  const { pathname } = useLocation()
  const ws = pathname.replace(/\/$/, '').endsWith('/mayoristas')
  const dest = ws ? '/mayoristas' : '/catalogo'

  const search = (e) => {
    e.preventDefault()
    navigate(`${dest}?q=${encodeURIComponent(q.trim())}`)
    setMenu(false)
    setFind(false)
  }

  // Sugerencias en vivo: se filtran al escribir, tolerando tildes y letras parecidas (k/c, z/s)
  const suggestions = useMemo(() => {
    if (!words(q).length) return []
    return catalog.products
      .filter((p) => matches(p, q))
      .sort(byRelevance(q))
      .slice(0, 12)
  }, [q, catalog.products])

  // En Mayoristas: precio mayorista (desde el mínimo de unidades). Las que no se venden al por mayor
  // también aparecen, con su precio normal y enlace a su ficha.
  const wsOk = (p) => ws && p.wholesale !== false
  const priceOf = (p) => (wsOk(p) ? wholesalePrice(p.originalPrice ?? p.price, wholesalePercentFor(p, STORE.wholesaleFrom)) : p.price)

  const closeSearch = () => {
    setFind(false)
    setQ('')
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
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
                placeholder="Buscar perfume…"
                aria-label="Buscar perfume"
                autoComplete="off"
              />
              {q.trim() && (
                <ul className="suggest" role="listbox" aria-label="Sugerencias">
                  {suggestions.map((p) => (
                    <li key={p.id} role="option">
                      <Link to={wsOk(p) ? `/mayoristas?q=${encodeURIComponent(p.name)}` : `/perfume/${p.id}`} onClick={closeSearch}>
                        {p.image ? <img src={asset(p.image)} alt="" loading="lazy" /> : <span className="suggest__ph" aria-hidden="true" />}
                        <span className="suggest__txt">
                          <b>{p.name}</b>
                          <small>{p.category} · {p.family}</small>
                        </span>
                        <span className="suggest__price">{money(priceOf(p))}{ws && <small>{wsOk(p) ? 'mayorista' : 'solo al detal'}</small>}</span>
                      </Link>
                    </li>
                  ))}
                  {suggestions.length === 0 && <li className="suggest__empty">No encontramos “{q.trim()}”</li>}
                  {suggestions.length > 0 && (
                    <li>
                      <button type="submit" className="suggest__all">Ver todos los resultados de “{q.trim()}” →</button>
                    </li>
                  )}
                </ul>
              )}
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
