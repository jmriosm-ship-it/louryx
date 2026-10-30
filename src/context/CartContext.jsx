import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getProduct } from '../data/products'

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
  const [items, setItems] = useState(load) // [{ id, qty }]
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      /* sin almacenamiento: el carrito vive solo en memoria */
    }
  }, [items])

  const add = (id, qty = 1) => {
    setItems((cur) => {
      const found = cur.find((i) => i.id === id)
      return found ? cur.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i)) : [...cur, { id, qty }]
    })
    setOpen(true)
  }
  const setQty = (id, qty) =>
    setItems((cur) => (qty <= 0 ? cur.filter((i) => i.id !== id) : cur.map((i) => (i.id === id ? { ...i, qty } : i))))
  const remove = (id) => setItems((cur) => cur.filter((i) => i.id !== id))
  const clear = () => setItems([])

  const lines = useMemo(
    () => items.map((i) => ({ ...i, product: getProduct(i.id) })).filter((l) => l.product),
    [items],
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
