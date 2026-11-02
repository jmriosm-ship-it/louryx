import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { STORE } from './config'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import WhatsAppButton from './components/WhatsAppButton'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Checkout from './pages/Checkout'
import Wholesale from './pages/Wholesale'
import Admin from './pages/Admin'
import { Privacy, Terms, Shipping } from './pages/Legal'
import { About, Contact, NotFound } from './pages/Info'

function ScrollTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      // el contenido puede tardar un instante en montarse al cambiar de página
      const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView(), 50)
      return () => clearTimeout(t)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

// Las secciones aparecen con un desvanecido al entrar en pantalla: al bajar suben un poco,
// y al volver a subir también aparecen (desde arriba). Se repite cada vez que entran.
function ScrollReveal() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname.startsWith('/admin') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const els = [...document.querySelectorAll('main section:not(.hero), footer.footer')]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target
          if (e.isIntersecting) {
            el.classList.remove('from-below', 'from-above')
            el.classList.add('is-in')
          } else {
            el.classList.remove('is-in')
            el.classList.add(e.boundingClientRect.top > 0 ? 'from-below' : 'from-above')
          }
        }
      },
      { threshold: 0, rootMargin: '0px 0px 12% 0px' },
    )
    els.forEach((el) => {
      el.classList.add('reveal')
      io.observe(el)
    })
    return () => {
      io.disconnect()
      els.forEach((el) => el.classList.remove('reveal', 'is-in', 'from-below', 'from-above'))
    }
  }, [pathname])
  return null
}

export default function App() {
  // El panel de administración va solo, sin el encabezado ni los botones de la tienda
  const inAdmin = useLocation().pathname.startsWith('/admin')
  return (
    <>
      <ScrollTop />
      <ScrollReveal />
      {!inAdmin && (
        <div className="announce" aria-hidden="true">
          <div className="marquee-track">
            {[...STORE.brands, ...STORE.brands].map((b, i) => <span key={i}>{b}</span>)}
          </div>
        </div>
      )}
      {!inAdmin && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/perfume/:id" element={<Product />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/mayoristas" element={<Wholesale />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/privacidad" element={<Privacy />} />
          <Route path="/terminos" element={<Terms />} />
          <Route path="/envios" element={<Shipping />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!inAdmin && <Footer />}
      {!inAdmin && <CartDrawer />}
      {!inAdmin && <WhatsAppButton />}
    </>
  )
}
