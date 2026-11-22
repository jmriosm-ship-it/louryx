// Búsqueda tolerante: sin tildes ni mayúsculas, y con letras que suenan igual
// ("vulkan" encuentra "Vulcan", "zanzibar" = "sansibar", "dubbai" = "dubai").
export const norm = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/k/g, 'c')
    .replace(/z/g, 's')
    .replace(/(.)\1+/g, '$1')

export const words = (q) => norm(q).split(/\s+/).filter(Boolean)

// ¿El perfume coincide con todas las palabras escritas? (nombre, familia, categoría y notas)
export function matches(p, q) {
  const ws = words(q)
  if (!ws.length) return true
  const hay = norm([p.name, p.family, p.category, ...Object.values(p.notes || {}).flat()].join(' '))
  return ws.every((w) => hay.includes(w))
}

// Los que empiezan por lo escrito van primero
export const byRelevance = (q) => {
  const first = words(q)[0] || ''
  return (a, b) => Number(norm(b.name).startsWith(first)) - Number(norm(a.name).startsWith(first))
}
