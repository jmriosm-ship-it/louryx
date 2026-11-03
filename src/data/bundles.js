// Combos y kits. Son EJEMPLOS armados con los perfumes de products.js: el cliente debe confirmar qué lleva
// cada uno y el descuento. `items` son los perfumes (id de products.js y cuántos) y `off` el % de descuento
// sobre la suma de sus precios. El precio final se calcula solo. Si un perfume no existe en el catálogo,
// ese combo no se muestra.
export const BUNDLES = [
  {
    id: 'combo-duo', type: 'combo', name: 'Combo Dúo', off: 10,
    blurb: 'Dos de los más pedidos para empezar a vender.',
    items: [{ id: 'rasasi-hawas-fire', qty: 1 }, { id: 'afnan-9pm-night-out', qty: 1 }],
  },
  {
    id: 'combo-emprendedor', type: 'combo', name: 'Combo Emprendedor', off: 15,
    blurb: 'Seis perfumes surtidos para tu primer pedido de reventa.',
    items: [{ id: 'rasasi-hawas-fire', qty: 2 }, { id: 'jpg-le-beau-le-parfum', qty: 2 }, { id: 'afnan-9pm-night-out', qty: 2 }],
  },
  {
    id: 'combo-trio', type: 'combo', name: 'Combo Trío', off: 12,
    blurb: 'Los tres perfumes de la portada, uno de cada uno.',
    items: [{ id: 'rasasi-hawas-fire', qty: 1 }, { id: 'jpg-le-beau-le-parfum', qty: 1 }, { id: 'afnan-9pm-night-out', qty: 1 }],
  },
  {
    id: 'kit-regalo', type: 'kit', name: 'Kit Regalo', off: 8,
    blurb: 'Un perfume elegante y uno fresco, listos para regalar.',
    items: [{ id: 'jpg-le-beau-le-parfum', qty: 1 }, { id: 'rasasi-hawas-fire', qty: 1 }],
  },
  {
    id: 'kit-noche', type: 'kit', name: 'Kit Noche', off: 8,
    blurb: 'Dos aromas intensos para salir de noche.',
    items: [{ id: 'afnan-9pm-night-out', qty: 1 }, { id: 'jpg-le-beau-le-parfum', qty: 1 }],
  },
]
