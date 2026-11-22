// Quita el fondo liso de una foto de producto (blanco, gris o de un solo color) y la recorta al frasco.
// Funciona en el navegador, sin servicios externos: toma el color de los bordes de la foto como "fondo"
// y borra todo lo que se parece a ese color y toca el borde. Lo de adentro del frasco no se toca.
const TOLERANCE = 42 // qué tan distinto puede ser un píxel del fondo para borrarse (0 a 441)
const MAX_SIDE = 1200

const dist = (d, i, r, g, b) => Math.hypot(d[i] - r, d[i + 1] - g, d[i + 2] - b)

export async function cutoutFile(file) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(bitmap, 0, 0, w, h)
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data

  // Si la foto ya trae fondo transparente, no hay nada que quitar
  let transparent = 0
  for (let i = 3; i < d.length; i += 4) if (d[i] < 250) transparent++
  if (transparent > w * h * 0.02) return file

  // Color del fondo: el promedio de los píxeles del borde; si varían mucho, el fondo no es parejo
  const edge = []
  for (let x = 0; x < w; x++) edge.push((x) * 4, ((h - 1) * w + x) * 4)
  for (let y = 0; y < h; y++) edge.push((y * w) * 4, (y * w + w - 1) * 4)
  let r = 0, g = 0, b = 0
  for (const i of edge) { r += d[i]; g += d[i + 1]; b += d[i + 2] }
  r /= edge.length; g /= edge.length; b /= edge.length
  const far = edge.filter((i) => dist(d, i, r, g, b) > TOLERANCE).length
  if (far > edge.length * 0.12) throw new Error('el fondo no es parejo')

  // Relleno desde los bordes: se borra lo que se parece al fondo y está conectado con el borde
  const gone = new Uint8Array(w * h)
  const stack = []
  const push = (p) => {
    if (gone[p] || dist(d, p * 4, r, g, b) > TOLERANCE) return
    gone[p] = 1
    stack.push(p)
  }
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x) }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1) }
  while (stack.length) {
    const p = stack.pop()
    const x = p % w
    if (x > 0) push(p - 1)
    if (x < w - 1) push(p + 1)
    if (p >= w) push(p - w)
    if (p < w * (h - 1)) push(p + w)
  }

  // Borde suave: los píxeles que tocan lo borrado quedan semitransparentes para que no se vea dentado
  const alpha = new Float32Array(w * h)
  let minX = w, minY = h, maxX = -1, maxY = -1
  for (let p = 0; p < w * h; p++) alpha[p] = gone[p] ? 0 : 1
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x
      if (gone[p]) continue
      const around = gone[p - 1] + gone[p + 1] + gone[p - w] + gone[p + w]
      if (around) alpha[p] = 1 - around * 0.22
    }
  }
  for (let p = 0; p < w * h; p++) {
    d[p * 4 + 3] = Math.round(alpha[p] * 255)
    if (!gone[p]) {
      const x = p % w, y = (p - x) / w
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  if (maxX < 0 || (maxX - minX) * (maxY - minY) < w * h * 0.03) throw new Error('no se encontró el frasco')
  ctx.putImageData(img, 0, 0)

  // Recorte ajustado al frasco con un poco de aire
  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.03)
  const x0 = Math.max(0, minX - pad), y0 = Math.max(0, minY - pad)
  const x1 = Math.min(w, maxX + pad + 1), y1 = Math.min(h, maxY + pad + 1)
  const out = document.createElement('canvas')
  out.width = x1 - x0
  out.height = y1 - y0
  out.getContext('2d').drawImage(canvas, x0, y0, out.width, out.height, 0, 0, out.width, out.height)
  const blob = await new Promise((resolve) => out.toBlob(resolve, 'image/png'))
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.png', { type: 'image/png' })
}
