import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Bottle from './Bottle'
import { useCart } from '../context/CartContext'
import { money, STORE } from '../config'

export default function CartDrawer() {
  const { lines, subtotal, setQty, remove, open, setOpen } = useCart()

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [setOpen])

  const missing = Math.max(0, STORE.freeShippingFrom - subtotal)

  return (
    <>
      <div className={`overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`drawer ${open ? 'show' : ''}`} aria-hidden={!open} aria-label="Carrito">
        <div className="drawer-head">
          <h2>Tu carrito</h2>
          <button className="icon-btn" aria-label="Cerrar" onClick={() => setOpen(false)}>✕</button>
        </div>

        {lines.length === 0 ? (
          <div className="drawer-empty">
            <p>Tu carrito está vacío.</p>
            <Link className="btn" to="/catalogo" onClick={() => setOpen(false)}>Ver catálogo</Link>
          </div>
        ) : (
          <>
            <p className="ship-note">
              {missing === 0 ? '🎉 Tienes envío gratis' : `Te faltan ${money(missing)} para envío gratis`}
            </p>
            <ul className="drawer-list">
              {lines.map(({ product: p, qty }) => (
                <li key={p.id}>
                  <Bottle product={p} className="thumb" />
                  <div className="li-info">
                    <strong>{p.name}</strong>
                    <span className="muted">{p.size} ml · {money(p.price)}</span>
                    <div className="qty">
                      <button onClick={() => setQty(p.id, qty - 1)} aria-label="Menos">−</button>
                      <span>{qty}</span>
                      <button onClick={() => setQty(p.id, Math.min(qty + 1, p.stock))} aria-label="Más">+</button>
                      <button className="link" onClick={() => remove(p.id)}>Quitar</button>
                    </div>
                  </div>
                  <strong>{money(p.price * qty)}</strong>
                </li>
              ))}
            </ul>
            <div className="drawer-foot">
              <div className="row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              <Link className="btn btn-block" to="/checkout" onClick={() => setOpen(false)}>Finalizar pedido</Link>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
