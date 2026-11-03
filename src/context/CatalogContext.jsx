import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { products as STATIC, CATEGORIES as STATIC_CATS, FAMILIES } from '../data/products'
import { BUNDLES as STATIC_BUNDLES } from '../data/bundles'
import { listAll } from '../lib/catalogStore'
import { hasBackend } from '../lib/supabase'
import { STORE } from '../config'

// Catálogo que usa toda la tienda. Si hay perfumes creados en el panel de administración
// (base de datos o modo de prueba) se usan esos; si no, los de src/data/products.js.
const CatalogContext = createContext(null)
const NO_NOTES = { salida: [], corazon: [], fondo: [] }

// Combos y kits creados en el panel; si no hay ninguno se usan los de ejemplo de src/data/bundles.js
const bundlesOf = (raw) => (raw?.bundles?.length
  ? raw.bundles.filter((b) => b.active !== false).map((b) => ({
    id: String(b.id), type: b.type, name: b.name, blurb: b.blurb || '', off: Number(b.discount_percent) || 0, items: b.items || [],
  }))
  : STATIC_BUNDLES)
// Ajustes: oferta relámpago encendida (por defecto sí), su hora de fin (vacía = termina cada día a las 11:59 pm) y fotos del menú
const settingsOf = (raw) => ({
  flashActive: raw?.settings?.flash_active !== false,
  flashEndsAt: raw?.settings?.flash_ends_at || null,
  covers: raw?.settings?.covers || {},
})

function build(raw) {
  if (!raw || !raw.products.some((p) => p.active)) {
    return { products: STATIC, categories: STATIC_CATS, categoryPhotos: {}, bundles: bundlesOf(raw), settings: settingsOf(raw), source: 'static' }
  }
  const cats = raw.categories.filter((c) => c.active)
  const byId = new Map(raw.categories.map((c) => [c.id, c]))
  const products = raw.products
    .filter((p) => p.active)
    .map((row) => {
      // Descuento propio del perfume (se pone al crearlo o editarlo en el panel)
      const base = Number(row.price) || 0
      const pct = Number(row.discount_percent) || 0
      return {
      id: String(row.id),
      name: row.name,
      category: byId.get(row.category_id)?.name || '',
      family: row.family || '',
      size: row.size_ml || 100,
      price: pct ? Math.round((base * (1 - pct / 100)) / 100) * 100 : base,
      originalPrice: pct ? base : undefined,
      discount: pct,
      image: row.image_url || '',
      photos: [row.image_url, ...(row.photos || [])].filter(Boolean),
      description: row.description || '',
      notes: { ...NO_NOTES, ...(row.notes || {}) },
      tone: '#1a1a1a',
      accent: '#d6d6d6',
      stock: row.stock ?? 20,
      wholesale: row.wholesale !== false,
      wholesaleDiscount: Number(row.wholesale_discount) || undefined,
      wholesaleDiscount12: Number(row.wholesale_discount_12) || undefined,
      wholesaleDiscount30: Number(row.wholesale_discount_30) || undefined,
      badge: row.badge || undefined,
      vendido: Boolean(row.featured),
      nuevo: Boolean(row.is_new),
      }
    })
  return {
    products,
    categories: cats.map((c) => c.name),
    categoryPhotos: Object.fromEntries(cats.filter((c) => c.photo_url).map((c) => [c.name, c.photo_url])),
    bundles: bundlesOf(raw),
    settings: settingsOf(raw),
    source: 'db',
  }
}

export function CatalogProvider({ children }) {
  const [state, setState] = useState(() => build(null))
  // Con base de datos se espera a leerla para no mostrar un instante los perfumes de ejemplo
  const [loading, setLoading] = useState(hasBackend)

  const reload = useCallback(async () => {
    try {
      setState(build(await listAll()))
    } catch {
      setState(build(null))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const value = useMemo(
    () => ({
      ...state,
      families: FAMILIES,
      reload,
      getProduct: (id) => state.products.find((p) => String(p.id) === String(id)),
    }),
    [state, reload],
  )

  if (loading) {
    return (
      <div className="boot" role="status" aria-label="Cargando">
        <img src={STORE.logo} alt="" />
      </div>
    )
  }
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export const useCatalog = () => useContext(CatalogContext)
