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
