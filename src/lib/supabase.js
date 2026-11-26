// Conexión con Supabase (base de datos, usuarios y fotos del panel de administración).
// Si faltan las claves del archivo .env no pasa nada: la tienda usa src/data/products.js
// y el panel funciona en "modo de prueba" guardando en el navegador.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasBackend = Boolean(url && key)
export const anonKey = key

// Las fotos de la tienda pueden salir por un proxy con caché de Cloudflare (workers/img-proxy.js)
// para no gastar el tráfico de Supabase. Se activa con VITE_IMG_HOST (ej. https://img.louryxcol.com.co);
// sin esa variable las fotos se piden directo a Supabase, como antes.
const imgHost = import.meta.env.VITE_IMG_HOST?.replace(/\/$/, '')
const storagePrefix = url ? `${url}/storage/v1/object/public/` : ''
export const imgUrl = (u) => (imgHost && storagePrefix && typeof u === 'string' && u.startsWith(storagePrefix) ? `${imgHost}/${u.slice(storagePrefix.length)}` : u)
// Cambia todas las direcciones de fotos de Supabase que haya dentro de un objeto. Solo para mostrar: no toca la base de datos.
export const proxify = (data) => (imgHost && storagePrefix ? JSON.parse(JSON.stringify(data).split(storagePrefix).join(`${imgHost}/`)) : data)

let client
// La librería se carga solo cuando hay claves, para no pesar en una tienda sin base de datos.
export async function getClient() {
  if (!hasBackend) return null
  if (!client) {
    const { createClient } = await import('@supabase/supabase-js')
    client = createClient(url, key)
  }
  return client
}

// Reduce la foto antes de usarla (máximo `max` px) para que la tienda cargue rápido.
// Devuelve { blob, dataUrl }.
export async function shrinkImage(file, max = 1400, quality = 0.9) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  // PNG conserva el fondo transparente de los frascos recortados; el resto va en JPEG
  const type = file.type === 'image/png' ? 'image/png' : file.type === 'image/webp' ? 'image/webp' : 'image/jpeg'
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality))
  const dataUrl = canvas.toDataURL(type, quality)
  return { blob: blob ?? file, dataUrl, type }
}

// Sube la foto a la carpeta pública "louryx" y devuelve su dirección
export async function uploadImage(file) {
  const sb = await getClient()
  const { blob, type } = await shrinkImage(file)
  const name = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 40) || 'foto'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${name}.${type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg'}`
  const { error } = await sb.storage.from('louryx').upload(path, blob, { contentType: type, cacheControl: '31536000' })
  if (error) throw error
  return sb.storage.from('louryx').getPublicUrl(path).data.publicUrl
}
