import { useEffect, useState } from 'react'
import { useCatalog } from '../context/CatalogContext'
import { soldOut } from '../config'

// Hora en que termina la oferta relámpago (ms): la que puso el administrador o, si no puso ninguna,
// las 11:59 pm de hoy (y se reinicia sola cada día).
export const flashEnd = (endsAt) => {
  if (endsAt) return new Date(endsAt).getTime()
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

// Estado de la oferta relámpago: `on` es true mientras está encendida en el panel y no ha llegado su hora de fin
// (aunque todavía no haya perfumes con descuento: entonces avisa que pronto hay ofertas). Al llegar la hora de fin vuelve a calcularse sola y la oferta desaparece
// del menú, del inicio y de su página.
export function useFlash() {
  const { products, settings } = useCatalog()
  const [, bump] = useState(0)
  const end = flashEnd(settings.flashEndsAt)

  useEffect(() => {
    const ms = end - Date.now()
    if (ms <= 0) return undefined
    const t = setTimeout(() => bump((n) => n + 1), Math.min(ms + 50, 2 ** 31 - 1))
    return () => clearTimeout(t)
  }, [end])

  const deals = products.filter((p) => p.discount > 0 && !soldOut(p)).sort((a, b) => b.discount - a.discount)
  return { on: settings.flashActive && end > Date.now(), end, deals }
}
