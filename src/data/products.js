// Catálogo. Para agregar un perfume, duplica un bloque y cambia los datos.
// `image` es opcional: si pones una ruta (ej. '/perfumes/noir.jpg') se usa la foto,
// si no, se dibuja el frasco con el color `tone`.
// `vendido: true` hace que aparezca en "Más vendidos" del inicio (se muestran 5; el primero va grande).
// `nuevo: true` hace que el perfume aparezca en el carrusel de la portada (el último agregado sale primero).
export const CATEGORIES = ['Mujer', 'Hombre', 'Unisex']
export const FAMILIES = ['Floral', 'Amaderado', 'Oriental', 'Cítrico', 'Gourmand', 'Fresco']

export const products = [
  { id: 'victorias-secret-tease', vendido: true, name: "Victoria's Secret Tease", category: 'Mujer', family: 'Gourmand', size: 100, price: 259000, tone: '#6b3a3a', accent: '#e8b4bc', image: '/perfumes/tease.jpg', badge: 'Nuevo', nuevo: true, stock: 10,
    notes: { salida: ['Pera', 'Naranja'], corazon: ['Flores blancas', 'Durazno'], fondo: ['Vainilla', 'Almizcle'] },
    description: 'Dulce, cremoso y seductor. Un gourmand floral con fondo de vainilla, pensado para dejar huella.' },
  { id: 'jpg-le-beau', vendido: true, name: 'Le Beau', category: 'Hombre', family: 'Fresco', size: 100, price: 349000, tone: '#0f6b73', accent: '#d9b873', image: '/perfumes/le-beau.jpg', badge: 'Nuevo', nuevo: true, stock: 8,
    notes: { salida: ['Bergamota', 'Cardamomo'], corazon: ['Coco', 'Jengibre'], fondo: ['Haba tonka', 'Madera de cedro'] },
    description: 'Fresco, tropical y sensual. Coco cremoso sobre un fondo cálido de haba tonka, en un frasco inolvidable.' },
  { id: 'dior-sauvage', name: 'Dior Sauvage', category: 'Hombre', family: 'Amaderado', size: 100, price: 389000, tone: '#14233f', accent: '#c9a96a', image: '/perfumes/sauvage.png', badge: 'Nuevo', nuevo: true, stock: 8,
    notes: { salida: ['Bergamota', 'Pimienta'], corazon: ['Lavanda', 'Pachulí'], fondo: ['Ambroxan', 'Vainilla'] },
    description: 'Fresco, especiado y magnético. Bergamota y pimienta sobre un fondo cálido de ambroxan y vainilla, con estela larga.' },
  { id: 'lv-les-sables-roses', name: 'Les Sables Roses', category: 'Unisex', family: 'Oriental', size: 100, price: 890000, tone: '#3a1a22', accent: '#d9a441', image: '/perfumes/sables-roses.png', badge: 'Nuevo', nuevo: true, vendido: true, stock: 4,
    notes: { salida: ['Azafrán', 'Bergamota'], corazon: ['Rosa', 'Oud'], fondo: ['Ámbar', 'Almizcle'] },
    description: 'Rosa profunda sobre oud y azafrán. Una fragancia de lujo, cálida y misteriosa, de las que se recuerdan.' },
  { id: 'ysl-libre-intense', name: 'Libre Intense', category: 'Mujer', family: 'Oriental', size: 90, price: 520000, tone: '#8a4a10', accent: '#f0b255', image: '/perfumes/libre-intense.png', badge: 'Nuevo', nuevo: true, vendido: true, stock: 6,
    notes: { salida: ['Mandarina', 'Lavanda'], corazon: ['Flor de azahar', 'Jazmín'], fondo: ['Vainilla', 'Ámbar'] },
    description: 'Lavanda y azahar con un fondo de vainilla ámbar. Libre, intensa y con mucha presencia.' },
  { id: 'armaf-club-de-nuit-untold', name: 'Club de Nuit Untold', category: 'Unisex', family: 'Oriental', size: 105, price: 210000, tone: '#7a0f1f', accent: '#e8c35a', image: '/perfumes/club-de-nuit-untold.png', badge: 'Nuevo', nuevo: true, vendido: true, stock: 12,
    notes: { salida: ['Limón', 'Azafrán'], corazon: ['Jazmín', 'Pimienta'], fondo: ['Ámbar', 'Almizcle'] },
    description: 'Especiado, ambarado y con estela larga. Un clásico árabe de Armaf para destacar de noche.' },
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
