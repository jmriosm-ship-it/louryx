import { useNavigate } from 'react-router-dom'

// Flecha para volver a la página anterior (si se entró directo a esta página, lleva al inicio)
export default function BackButton({ label = 'Volver' }) {
  const nav = useNavigate()
  const back = () => (window.history.state?.idx > 0 ? nav(-1) : nav('/'))
  return (
    <button type="button" className="back-btn" onClick={back}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></svg>
      {label}
    </button>
  )
}
