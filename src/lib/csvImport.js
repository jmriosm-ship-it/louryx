// Importar perfumes desde un archivo CSV (Excel: Archivo > Guardar como > CSV).
export const COLUMNS = ['nombre', 'categoria', 'precio', 'tamano_ml', 'cantidad', 'descuento', 'familia', 'etiqueta', 'mas_vendido', 'nuevo', 'descripcion']

const EXAMPLE = [
  ['Aventus Creed', 'Hombre', 520000, 100, 10, '', 'Frutal', '', 'si', 'no', 'Piña, abedul y almizcle.'],
  ['Good Girl', 'Mujer', 380000, 80, 6, 10, 'Dulce', 'Nuevo', 'no', 'si', 'Tuberosa, cacao y haba tonka.'],
]

const quote = (v) => (/[;"\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v))

// Plantilla que se descarga: separada con ; para que Excel en español la abra en columnas
export const templateCsv = () => '﻿' + [COLUMNS, ...EXAMPLE].map((r) => r.map(quote).join(';')).join('\r\n')

const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')

// Lee el texto CSV (separador , ; o tab, comillas y saltos de línea dentro de comillas)
export function parseCsv(text) {
  const t = text.replace(/^﻿/, '')
  const first = t.split(/\r?\n/)[0] || ''
  const sep = [';', ',', '\t'].sort((a, b) => first.split(b).length - first.split(a).length)[0]
  const rows = []
  let row = [], cell = '', q = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (q) {
      if (c === '"' && t[i + 1] === '"') { cell += '"'; i++ } else if (c === '"') q = false
      else cell += c
    } else if (c === '"') q = true
    else if (c === sep) { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++
      row.push(cell); cell = ''
      if (row.some((x) => x.trim())) rows.push(row)
      row = []
    } else cell += c
  }
  row.push(cell)
  if (row.some((x) => x.trim())) rows.push(row)
  if (rows.length < 2) return []
  const head = rows[0].map(norm)
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])))
}

const yes = (v) => /^(si|s|1|true|x|yes)$/.test(norm(v))
const num = (v) => Number(String(v).replace(/[^0-9.,-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')) || 0

// Convierte una fila en los campos de un perfume. Solo el nombre es obligatorio; sin precio queda en 0 (se corrige después en el panel).
export function rowToProduct(r, line) {
  const name = r.nombre || r.name
  const price = num(r.precio || r.price)
  if (!name) return { error: `Fila ${line}: falta el nombre` }
  const disc = num(r.descuento)
  return {
    category: r.categoria || '',
    row: {
      name, price: price || undefined, description: r.descripcion || '', family: r.familia || null, badge: r.etiqueta || null,
      size_ml: num(r.tamano_ml || r.tamano || r.ml) || 100,
      stock: Math.max(0, Math.round(num(r.cantidad || r.stock)) || 0),
      discount_percent: disc > 0 ? Math.min(90, Math.round(disc)) : null,
      featured: yes(r.mas_vendido), is_new: yes(r.nuevo), active: true, wholesale: true,
    },
  }
}
