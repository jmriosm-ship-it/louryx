import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import WhatsAppButton from './components/WhatsAppButton'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Checkout from './pages/Checkout'
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

export default function App() {
  return (
    <>
      <ScrollTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/perfume/:id" element={<Product />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </>
  )
}
