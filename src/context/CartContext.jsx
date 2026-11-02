import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useCatalog } from './CatalogContext'
import { soldOut } from '../config'

const CartContext = createContext(null)
const KEY = 'louryx-cart'

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const { getProduct } = useCatalog()
  const [items, setItems] = useState(load) // [{ id, qty }]
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      /* sin almacenamiento: el carrito vive solo en memoria */
    }
  }, [items])

  // No se deja agregar un perfume agotado ni más unidades de las que hay
  const add = (id, qty = 1) => {
    const p = getProduct(id)
    if (!p || soldOut(p)) return
    setItems((cur) => {
      const found = cur.find((i) => i.id === id)
      const n = Math.min((found?.qty || 0) + qty, p.stock)
      return found ? cur.map((i) => (i.id === id ? { ...i, qty: n } : i)) : [...cur, { id, qty: n }]
    })
    setOpen(true)
  }
  const setQty = (id, qty) => {
    const p = getProduct(id)
    const n = p ? Math.min(qty, p.stock) : qty
    setItems((cur) => (n <= 0 ? cur.filter((i) => i.id !== id) : cur.map((i) => (i.id === id ? { ...i, qty: n } : i))))
  }
  const remove = (id) => setItems((cur) => cur.filter((i) => i.id !== id))
  const clear = () => setItems([])

  const lines = useMemo(
    // Lo que ya se agotó desde que se agregó al carrito sale solo, y la cantidad nunca pasa de lo disponible
    () => items
      .map((i) => ({ ...i, product: getProduct(i.id) }))
      .filter((l) => l.product && !soldOut(l.product))
      .map((l) => ({ ...l, qty: Math.min(l.qty, l.product.stock) })),
    [items, getProduct],
  )
  const count = lines.reduce((s, l) => s + l.qty, 0)
  const subtotal = lines.reduce((s, l) => s + l.qty * l.product.price, 0)

  return (
    <CartContext.Provider value={{ lines, count, subtotal, add, setQty, remove, clear, open, setOpen }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
