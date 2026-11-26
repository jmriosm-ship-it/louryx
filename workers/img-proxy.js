// Worker de Cloudflare "lx-img" para Louryx (dominio img.louryxcol.com.co).
// Hace dos cosas para que la tienda no dependa del cupo gratis de Supabase:
//
//  1. FOTOS  (/louryx/...)  Cada foto se baja de Supabase UNA sola vez, se guarda en KV
//     (el almacén de Cloudflare) y desde ahí se entrega siempre. Los nombres de las fotos
//     son únicos y no cambian, así que la copia nunca queda vieja.
//  2. CATÁLOGO (/catalogo)  Entrega categorías, perfumes, combos y ajustes con una caché de 60 s.
//     Si Supabase falla o está restringido, entrega la última copia buena guardada en KV,
//     así la tienda sigue mostrando perfumes.
//
// Requiere un espacio de KV conectado a este Worker con el nombre de variable  FOTOS.
const ORIGIN = 'https://vtcjkqxceqcdtjqbipwc.supabase.co'
const CORS = { 'Access-Control-Allow-Origin': '*' }
const COPIA_CADA_MS = 15 * 60 * 1000 // la copia del catálogo se renueva como máximo cada 15 min (KV gratis: 1.000 escrituras al día)

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET, HEAD', 'Access-Control-Max-Age': '86400' } })
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Método no permitido', { status: 405, headers: CORS })

    const url = new URL(request.url)
    if (url.pathname === '/catalogo') return catalogo(url, env, ctx)
    // Solo se sirven las fotos de la carpeta pública "louryx", no cualquier cosa de Supabase
    if (url.pathname.startsWith('/louryx/')) return foto(url, env, ctx)
    return new Response('No encontrado', { status: 404, headers: CORS })
  },
}

async function foto(url, env, ctx) {
  const cache = caches.default
  const cacheKey = new Request(url.origin + url.pathname)
  const enCache = await cache.match(cacheKey)
  if (enCache) return enCache

  let body
  let type
  const guardada = await env.FOTOS.getWithMetadata(url.pathname, 'arrayBuffer')
  if (guardada.value) {
    body = guardada.value
    type = guardada.metadata?.type
  } else {
    const res = await fetch(`${ORIGIN}/storage/v1/object/public${url.pathname}`)
    if (!res.ok) return new Response('No disponible', { status: res.status === 404 ? 404 : 502, headers: CORS })
    type = res.headers.get('content-type') || 'image/jpeg'
    body = await res.arrayBuffer()
    ctx.waitUntil(env.FOTOS.put(url.pathname, body, { metadata: { type } }))
  }

  const out = new Response(body, {
    headers: { 'Content-Type': type || 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable', ...CORS },
  })
  ctx.waitUntil(cache.put(cacheKey, out.clone()))
  return out
}

async function catalogo(url, env, ctx) {
  const cache = caches.default
  const cacheKey = new Request(url.origin + '/catalogo')
  const enCache = await cache.match(cacheKey)
  if (enCache) return enCache

  try {
    // La clave pública de Supabase la manda la tienda en la dirección (?k=...); es la misma que ya está en la página
    const key = url.searchParams.get('k')
    if (!key) throw new Error('sin clave')
    const pedir = async (ruta, tolerante) => {
      const r = await fetch(`${ORIGIN}/rest/v1/${ruta}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
      if (!r.ok) {
        if (tolerante) return []
        throw new Error(`supabase ${r.status}`)
      }
      return r.json()
    }
    // Mismas consultas y orden que usa la tienda (src/lib/catalogStore.js)
    const [categories, products, bundles, ajustes] = await Promise.all([
      pedir('louryx_categories?select=*&order=sort.asc,name.asc'),
      pedir('louryx_products?select=*&order=created_at.asc'),
      pedir('louryx_bundles?select=*&order=sort.asc,created_at.asc', true),
      pedir('louryx_settings?select=*&key=eq.shop', true),
    ])
    const settings = ajustes[0]?.value || {}
    const body = JSON.stringify({ categories, products, bundles, settings })
    if (products.length > 0) ctx.waitUntil(guardarCopia(env, body))

    const res = new Response(body, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60', ...CORS } })
    ctx.waitUntil(cache.put(cacheKey, res.clone()))
    return res
  } catch {
    // Supabase falló o está restringido: se entrega la última copia buena
    const copia = await env.FOTOS.get('snapshot:catalogo')
    if (copia) return new Response(copia, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30', 'X-Copia': '1', ...CORS } })
    return new Response('Catálogo no disponible', { status: 502, headers: CORS })
  }
}

async function guardarCopia(env, body) {
  const ultima = Number(await env.FOTOS.get('snapshot:at')) || 0
  if (Date.now() - ultima < COPIA_CADA_MS) return
  await env.FOTOS.put('snapshot:catalogo', body)
  await env.FOTOS.put('snapshot:at', String(Date.now()))
}
