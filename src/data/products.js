// Catálogo. Para agregar un perfume, duplica un bloque y cambia los datos.
// `image` es opcional: si pones una ruta (ej. '/perfumes/noir.jpg') se usa la foto,
// si no, se dibuja el frasco con el color `tone`.
export const CATEGORIES = ['Mujer', 'Hombre', 'Unisex']
export const FAMILIES = ['Floral', 'Amaderado', 'Oriental', 'Cítrico', 'Gourmand', 'Fresco']

export const products = [
  { id: 'noir-absolu', name: 'Noir Absolu', category: 'Hombre', family: 'Amaderado', size: 100, price: 289000, tone: '#2b2118', accent: '#c9a96a', badge: 'Más vendido', stock: 12,
    notes: { salida: ['Bergamota', 'Pimienta negra'], corazon: ['Cuero', 'Cedro'], fondo: ['Vetiver', 'Ámbar'] },
    description: 'Intenso y nocturno. Un amaderado profundo con cuero y especias, pensado para dejar huella.' },
  { id: 'rosa-velvet', name: 'Rosa Velvet', category: 'Mujer', family: 'Floral', size: 75, price: 259000, tone: '#6b2737', accent: '#e8b4bc', badge: 'Nuevo', stock: 8,
    notes: { salida: ['Frambuesa', 'Lichi'], corazon: ['Rosa de Damasco', 'Peonía'], fondo: ['Almizcle', 'Pachulí'] },
    description: 'Rosa aterciopelada con un toque frutal. Romántica, sofisticada y muy femenina.' },
  { id: 'ambre-oud', name: 'Ambre Oud', category: 'Unisex', family: 'Oriental', size: 50, price: 349000, tone: '#4a2c12', accent: '#d9a441', badge: 'Edición limitada', stock: 5,
    notes: { salida: ['Azafrán', 'Cardamomo'], corazon: ['Oud', 'Rosa'], fondo: ['Ámbar', 'Vainilla'] },
    description: 'Oud cálido y resinoso con azafrán. Lujo oriental para quienes buscan algo distinto.' },
  { id: 'citrus-aura', name: 'Citrus Aura', category: 'Unisex', family: 'Cítrico', size: 100, price: 189000, tone: '#8a7a1f', accent: '#f3e27a', stock: 20,
    notes: { salida: ['Limón', 'Mandarina'], corazon: ['Neroli', 'Jengibre'], fondo: ['Musgo', 'Madera blanca'] },
    description: 'Fresco, luminoso y energizante. Ideal para el día a día y el clima cálido.' },
  { id: 'vanille-douce', name: 'Vanille Douce', category: 'Mujer', family: 'Gourmand', size: 75, price: 239000, tone: '#7a5a3a', accent: '#f0d9b5', stock: 14,
    notes: { salida: ['Pera', 'Canela'], corazon: ['Orquídea', 'Caramelo'], fondo: ['Vainilla', 'Haba tonka'] },
    description: 'Dulce y envolvente, como un abrazo. Vainilla cremosa con un fondo suave de haba tonka.' },
  { id: 'marine-bleu', name: 'Marine Bleu', category: 'Hombre', family: 'Fresco', size: 100, price: 215000, tone: '#17405c', accent: '#8fd0ee', stock: 18,
    notes: { salida: ['Notas marinas', 'Menta'], corazon: ['Salvia', 'Lavanda'], fondo: ['Cedro', 'Ámbar gris'] },
    description: 'Brisa de mar y salvia. Limpio, versátil y perfecto para la oficina.' },
  { id: 'jardin-blanc', name: 'Jardín Blanc', category: 'Mujer', family: 'Floral', size: 50, price: 199000, tone: '#8b8680', accent: '#ffffff', stock: 10,
    notes: { salida: ['Pera', 'Freesia'], corazon: ['Jazmín', 'Azahar'], fondo: ['Sándalo', 'Almizcle blanco'] },
    description: 'Flores blancas delicadas y luminosas. Elegancia silenciosa para todos los días.' },
  { id: 'cuir-sauvage', name: 'Cuir Sauvage', category: 'Hombre', family: 'Oriental', size: 100, price: 319000, tone: '#3a1d14', accent: '#b5651d', stock: 7,
    notes: { salida: ['Mandarina', 'Especias'], corazon: ['Cuero', 'Tabaco'], fondo: ['Vainilla', 'Benjuí'] },
    description: 'Cuero y tabaco con fondo dulce. Carácter fuerte, estela larga.' },
  { id: 'eclat-dore', name: 'Éclat Doré', category: 'Mujer', family: 'Oriental', size: 75, price: 275000, tone: '#8c6a1e', accent: '#f5d98a', badge: 'Favorito', stock: 9,
    notes: { salida: ['Naranja sanguina', 'Bergamota'], corazon: ['Iris', 'Ylang-ylang'], fondo: ['Ámbar', 'Sándalo'] },
    description: 'Un destello dorado: cítrico brillante que se funde en un fondo ambarado y sedoso.' },
  { id: 'bois-mystique', name: 'Bois Mystique', category: 'Unisex', family: 'Amaderado', size: 100, price: 299000, tone: '#24332a', accent: '#9bb89a', stock: 11,
    notes: { salida: ['Incienso', 'Pimienta rosa'], corazon: ['Cedro', 'Iris'], fondo: ['Vetiver', 'Musgo de roble'] },
    description: 'Bosque húmedo e incienso. Sereno, profundo y muy elegante.' },
  { id: 'fleur-nuit', name: 'Fleur de Nuit', category: 'Mujer', family: 'Floral', size: 100, price: 269000, tone: '#2c1f4a', accent: '#b9a0e8', stock: 6,
    notes: { salida: ['Grosella negra', 'Mandarina'], corazon: ['Tuberosa', 'Jazmín'], fondo: ['Vainilla', 'Pachulí'] },
    description: 'Flor nocturna, seductora y misteriosa. Para salir de noche.' },
  { id: 'sport-ice', name: 'Sport Ice', category: 'Hombre', family: 'Cítrico', size: 100, price: 169000, tone: '#1d5560', accent: '#aef0f2', stock: 25,
    notes: { salida: ['Pomelo', 'Menta'], corazon: ['Geranio', 'Enebro'], fondo: ['Madera de cedro', 'Almizcle'] },
    description: 'Frescura helada para entrenar o para el calor. Ligero y revitalizante.' },
]

export const getProduct = (id) => products.find((p) => p.id === id)
