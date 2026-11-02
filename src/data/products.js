// Catálogo. Para agregar un perfume, duplica un bloque y cambia los datos.
// `image` es opcional: si pones una ruta (ej. '/perfumes/noir.jpg') se usa la foto,
// si no, se dibuja el frasco con el color `tone`.
// `vendido: true` hace que aparezca en "Más vendidos" del inicio (se muestran 5; el primero va grande).
// `nuevo: true` hace que el perfume aparezca en el carrusel de la portada (el último agregado sale primero).
export const CATEGORIES = ['Mujer', 'Hombre', 'Unisex']
export const FAMILIES = ['Floral', 'Amaderado', 'Oriental', 'Cítrico', 'Gourmand', 'Fresco']

export const products = [
  { id: 'rasasi-hawas-fire', name: 'Hawas Fire', category: 'Hombre', family: 'Fresco', size: 100, price: 190000, tone: '#8a0f1f', accent: '#e8453c', image: '/perfumes/hawas-fire.png', badge: 'Nuevo', nuevo: true, stock: 10,
    notes: { salida: ['Pomelo', 'Bergamota'], corazon: ['Canela', 'Jengibre'], fondo: ['Ámbar', 'Almizcle'] },
    description: 'Fresco, especiado y con mucha energía. Un clásico de Rasasi con salida cítrica y fondo ambarado de larga duración.' },
  { id: 'jpg-le-beau-le-parfum', name: 'Le Beau Le Parfum', category: 'Hombre', family: 'Amaderado', size: 125, price: 420000, tone: '#0f4f57', accent: '#d9b873', image: '/perfumes/le-beau-le-parfum.png', badge: 'Nuevo', nuevo: true, stock: 6,
    notes: { salida: ['Cardamomo', 'Bergamota'], corazon: ['Coco', 'Iris'], fondo: ['Madera de cedro', 'Haba tonka'] },
    description: 'Más profundo e intenso que el Le Beau original. Coco cremoso sobre maderas cálidas, en un frasco que se reconoce al instante.' },
  { id: 'afnan-9pm-night-out', name: '9pm Night Out', category: 'Hombre', family: 'Oriental', size: 100, price: 195000, tone: '#1c1c1c', accent: '#bdbdbd', image: '/perfumes/9pm-night-out.png', badge: 'Nuevo', nuevo: true, stock: 12,
    notes: { salida: ['Manzana', 'Canela'], corazon: ['Lavanda', 'Flor de naranjo'], fondo: ['Vainilla', 'Haba tonka'] },
    description: 'Dulce, especiado y hecho para la noche. Un extrait de Afnan con estela larga y mucha presencia.' },
]

export const getProduct = (id) => products.find((p) => p.id === id)
