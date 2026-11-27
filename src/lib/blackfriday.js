import { useEffect, useState } from 'react'
import { useCatalog } from '../context/CatalogContext'
import { soldOut } from '../config'

// Black Friday: perfumes con su propio descuento, que se escogen en el panel (pestaña Black Friday).
// Está activo mientras esté encendido y, si tiene hora de fin, no haya llegado. El precio con descuento ya viene aplicado en el catálogo (product.bf).
export function useBlackFriday() {
  const { products, settings } = useCatalog()
  const [, bump] = useState(0)
  const end = settings.bfEndsAt ? new Date(settings.bfEndsAt).getTime() : null
  useEffect(() => {
    if (!end) return undefined
    const ms = end - Date.now()
    if (ms <= 0) return undefined
    const t = setTimeout(() => bump((n) => n + 1), Math.min(ms + 50, 2 ** 31 - 1))
    return () => clearTimeout(t)
  }, [end])
  const on = Boolean(settings.bfActive) && (!end || end > Date.now())
  const deals = on ? products.filter((p) => p.bf && !soldOut(p)).sort((a, b) => b.discount - a.discount) : []
  return { on, end, deals }
}
