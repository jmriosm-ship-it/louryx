import { asset } from '../config'

// Frasco dibujado en SVG con el color del perfume. Si hay foto, se usa la foto.
export default function Bottle({ product, className = '' }) {
  if (product.image) return <img className={className} src={asset(product.image)} alt={product.name} loading="lazy" />
  const { tone, accent, name } = product
  const id = `g-${product.id}`
  return (
    <svg className={className} viewBox="0 0 200 260" role="img" aria-label={`Frasco de ${name}`}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor={tone} />
          <stop offset="0.45" stopColor={accent} stopOpacity="0.55" />
          <stop offset="1" stopColor={tone} />
        </linearGradient>
        <linearGradient id={`${id}-cap`} x1="0" x2="1">
          <stop offset="0" stopColor="#6b6b6b" />
          <stop offset="0.5" stopColor="#f0f0f0" />
          <stop offset="1" stopColor="#6b6b6b" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="240" rx="62" ry="8" fill="#000" opacity="0.35" />
      <rect x="82" y="20" width="36" height="34" rx="4" fill={`url(#${id}-cap)`} />
      <rect x="90" y="52" width="20" height="14" fill={`url(#${id}-cap)`} opacity="0.8" />
      <rect x="40" y="66" width="120" height="168" rx="18" fill={`url(#${id})`} stroke={accent} strokeOpacity="0.5" />
      <rect x="52" y="78" width="14" height="144" rx="7" fill="#fff" opacity="0.14" />
      <rect x="62" y="130" width="76" height="52" rx="3" fill="#000" opacity="0.55" stroke={accent} strokeOpacity="0.6" />
      <text x="100" y="152" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="11" letterSpacing="3" fill={accent}>LOURYX</text>
      <text x="100" y="170" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="7" letterSpacing="1.5" fill="#fff" opacity="0.8">
        {name.toUpperCase()}
      </text>
    </svg>
  )
}
