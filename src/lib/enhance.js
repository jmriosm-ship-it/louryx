// Mejora automática de las fotos que se suben al panel: las amplía con calidad, les da nitidez y las guarda en WebP
// (conserva el fondo transparente). Las fotos pequeñas pasan además por una red de super-resolución (ESRGAN) que se
// descarga solo cuando hace falta; si falla o tarda mucho, se usa la ampliación normal y la foto se sube igual.
const TARGET_H = 1100 // alto final aproximado de una foto vertical
const AI_BELOW = 650 // las fotos con menos alto que esto pasan por la red de super-resolución
const AI_TIMEOUT = 90000 // ms

let aiPromise = null
const loadAi = () => {
  if (!aiPromise) {
    aiPromise = (async () => {
      const [{ default: Upscaler }, { default: x2 }] = await Promise.all([import('upscaler'), import('@upscalerjs/esrgan-medium/2x')])
      return new Upscaler({ model: { ...x2, path: `${import.meta.env.BASE_URL}models/esrgan-x2/model.json` } })
    })().catch((e) => { aiPromise = null; throw e })
  }
  return aiPromise
}

const canvasOf = (w, h) => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

// Ampliación en pasos de 1,5x con suavizado de alta calidad (se ve mejor que ampliar de golpe)
function resizeSmooth(src, w, h) {
  let cur = src
  while (cur.width * 1.5 < w) {
    const next = canvasOf(Math.round(cur.width * 1.5), Math.round(cur.height * 1.5))
    const g = next.getContext('2d')
    g.imageSmoothingQuality = 'high'
    g.drawImage(cur, 0, 0, next.width, next.height)
    cur = next
  }
  const out = canvasOf(w, h)
  const g = out.getContext('2d')
  g.imageSmoothingQuality = 'high'
  g.drawImage(cur, 0, 0, w, h)
  return out
}

// Máscara de enfoque (unsharp) sobre el color; el canal de transparencia no se toca
function sharpen(canvas, amount = 0.55) {
  const w = canvas.width, h = canvas.height
  const g = canvas.getContext('2d', { willReadFrequently: true })
  const img = g.getImageData(0, 0, w, h)
  const src = img.data
  const copy = new Uint8ClampedArray(src)
  const k = amount
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4
      if (copy[i + 3] < 8) continue
      for (let c = 0; c < 3; c++) {
        const blur = (copy[i + c - 4] + copy[i + c + 4] + copy[i + c - w * 4] + copy[i + c + w * 4] + copy[i + c] * 4) / 8
        src[i + c] = copy[i + c] + (copy[i + c] - blur) * k * 2
      }
    }
  }
  g.putImageData(img, 0, 0)
}

// Quita el fondo blanco que queda atrapado dentro del asa o del aro de un frasco (hueco blanco rodeado de color, arriba y hacia un lado).
// Es prudente: solo toca manchas blancas parejas, de tamaño medio, cuadradas y ubicadas en la parte alta y en los costados;
// una etiqueta blanca en el centro del frasco no se toca.
function clearEnclosedWhite(canvas) {
  const w = canvas.width, h = canvas.height
  const g = canvas.getContext('2d', { willReadFrequently: true })
  const img = g.getImageData(0, 0, w, h)
  const d = img.data
  let minX = w, maxX = -1, minY = h, maxY = -1
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y }
  if (maxX < 0) return
  const bw = maxX - minX + 1, bh = maxY - minY + 1
  const white = new Uint8Array(w * h)
  for (let p = 0; p < w * h; p++) white[p] = d[p * 4 + 3] > 200 && d[p * 4] > 234 && d[p * 4 + 1] > 234 && d[p * 4 + 2] > 234 ? 1 : 0
  const seen = new Uint8Array(w * h)
  for (let s0 = 0; s0 < w * h; s0++) {
    if (!white[s0] || seen[s0]) continue
    const comp = [s0]
    seen[s0] = 1
    let colored = 0, trans = 0, x0 = w, x1 = -1, y0 = h, y1 = -1
    for (let k = 0; k < comp.length; k++) {
      const p = comp[k], x = p % w, y = (p / w) | 0
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) { trans++; continue }
        const q = ny * w + nx
        if (white[q]) { if (!seen[q]) { seen[q] = 1; comp.push(q) } } else if (d[q * 4 + 3] < 120) trans++
        else colored++
      }
    }
    const area = comp.length, per = colored + trans
    const cw = x1 - x0 + 1, ch = y1 - y0 + 1
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
    const top = (cy - minY) / bh < 0.45
    const side = Math.abs((cx - minX) / bw - 0.5) > 0.2
    if (area > bw * bh * 0.006 && area < bw * bh * 0.07 && area / (cw * ch) > 0.72 && per && colored / per > 0.7 && trans / per < 0.25 && top && side) {
      for (const p of comp) d[p * 4 + 3] = 0
      for (const p of comp) { // un píxel más alrededor, para que no quede un borde claro
        const x = p % w, y = (p / w) | 0
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy
          if (nx >= 0 && ny >= 0 && nx < w && ny < h) { const q = (ny * w + nx) * 4; if (d[q] > 215 && d[q + 1] > 215 && d[q + 2] > 215) d[q + 3] = 0 }
        }
      }
    }
  }
  g.putImageData(img, 0, 0)
}

const withTimeout = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('tardó demasiado')), ms))])

// Devuelve un File ya mejorado (WebP). `onStep` recibe un texto para mostrar el avance.
export async function enhanceFile(file, { ai = true, onStep } = {}) {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') return file
  const bitmap = await createImageBitmap(file)
  const hasAlphaType = file.type === 'image/png' || file.type === 'image/webp'
  // ampliar solo si la foto es chica; nunca reducir por debajo del original
  const scale = Math.min(Math.max(1, TARGET_H / bitmap.height), 4)
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)

  const base = canvasOf(bitmap.width, bitmap.height)
  base.getContext('2d').drawImage(bitmap, 0, 0)
  if (hasAlphaType) clearEnclosedWhite(base)
  let work = base

  if (ai && scale > 1.4 && bitmap.height < AI_BELOW) {
    try {
      onStep?.('Mejorando la foto con IA…')
      const up = await withTimeout(loadAi(), AI_TIMEOUT)
      // la red trabaja el color sobre fondo negro; la transparencia se amplía aparte y se vuelve a unir
      const flat = canvasOf(base.width, base.height)
      const fg = flat.getContext('2d')
      fg.fillStyle = '#000'
      fg.fillRect(0, 0, flat.width, flat.height)
      fg.drawImage(base, 0, 0)
      const dataUrl = await withTimeout(up.upscale(flat, { patchSize: 64, padding: 4 }), AI_TIMEOUT)
      const im = new Image()
      im.src = dataUrl
      await im.decode()
      const big = canvasOf(im.naturalWidth, im.naturalHeight)
      big.getContext('2d').drawImage(im, 0, 0)
      if (hasAlphaType) {
        // la transparencia original, ampliada con suavizado, recorta el resultado
        const mask = resizeSmooth(base, big.width, big.height)
        const bg = big.getContext('2d')
        bg.globalCompositeOperation = 'destination-in'
        bg.drawImage(mask, 0, 0)
        bg.globalCompositeOperation = 'source-over'
      }
      work = big
    } catch {
      work = base // sin IA: sigue con la ampliación normal
    }
  }

  onStep?.('Dando nitidez…')
  const out = work.width === w && work.height === h ? work : resizeSmooth(work, w, h)
  sharpen(out, work === base ? 0.6 : 0.4)
  const blob = await new Promise((resolve) => out.toBlob(resolve, 'image/webp', 0.92))
  if (!blob || blob.type !== 'image/webp') return file // el navegador no sabe guardar WebP
  const name = file.name.replace(/\.[^.]+$/, '') || 'foto'
  return new File([blob], `${name}.webp`, { type: 'image/webp' })
}
