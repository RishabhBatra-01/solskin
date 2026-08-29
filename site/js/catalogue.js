/* ============================================================
   SOLSKIN — catalogue
   ------------------------------------------------------------
   Read from solskin.com/products.json on 29 Aug 2026, then
   DE-DUPLICATED. The live store lists the same SKU under two
   different product names, at the same price, with two different
   RRPs and two different discount percentages:

     SOL_GMD200_D25  "Glow Starter Kit - Gradual Tan"          £32.38  was £47.98  -33%
     SOL_GMD200_D25  "Gradual Tanning Moisturiser & Tan Drops" £32.38  was £35.98  -10%

     SOL_MD200_D25   "Glow Starter Kit - Mousse"               £38.69
     SOL_MD200_D25   "Tan Mousse & Drops"                      £38.69

   The same variant is also labelled "LIGHT TO MEDIUM" on one
   product and "FAIR TO MEDIUM" on another.

   One SKU, one name, one shade vocabulary. That is most of what a
   product picker is for.
   ============================================================ */

const SHADES = {
  fair:   { id: 'fair',   label: 'Fair',          hex: '#E8C9A8' },
  light:  { id: 'light',  label: 'Light',         hex: '#DDB68F' },
  medium: { id: 'medium', label: 'Medium',        hex: '#C89A6B' },
  olive:  { id: 'olive',  label: 'Olive',         hex: '#B98A5C' },
  deep:   { id: 'deep',   label: 'Deep',          hex: '#8A5A34' }
};

const PRODUCTS = [
  {
    id: 'mousse', name: 'Tan Mousse', img: 'img/shop/mousse.jpg',
    price: 21.99, sub: 19.79, size: '200ml', cat: ['body', 'face'],
    develops: '6–8 hours', speed: 'overnight', depth: ['noticeable', 'deep'],
    blurb: 'A deep bronze in one application. The fastest route to a proper tan.',
    variants: [
      { sku: 'SOL_MD200',  label: 'Dark',      shade: 'medium' },
      { sku: 'SOL_MVD200', label: 'Very Dark', shade: 'deep' }
    ]
  },
  {
    id: 'gradual', name: 'Gradual Tanning Moisturiser', img: 'img/shop/gradual.jpg',
    price: 14.99, sub: 13.49, size: '200ml', cat: ['body', 'face'],
    develops: 'builds daily', speed: 'slow', depth: ['subtle', 'noticeable'],
    blurb: 'Build it a day at a time and stop wherever you like. The safest place to start.',
    variants: [
      // the live store shows this same SKU as both "Light to Medium" and
      // "Fair to Medium". One name.
      { sku: 'SOL_GLM200', label: 'Light to Medium',  shade: 'light' },
      { sku: 'SOL_GMD200', label: 'Medium to Dark',   shade: 'medium' }
    ]
  },
  {
    id: 'drops', name: 'Tan Drops', img: 'img/shop/drops.jpg',
    price: 20.99, sub: 18.89, size: '25ml', cat: ['face'],
    develops: '4–8 hours', speed: 'overnight', depth: ['subtle', 'noticeable', 'deep'],
    blurb: 'Mix into your own moisturiser and control exactly how deep it goes.',
    variants: [{ sku: 'SOL_D25', label: 'One shade, you set the depth', shade: 'medium' }]
  },
  {
    id: 'shimmer', name: 'Shimmer Body Instant Glow', img: 'img/shop/shimmer.jpg',
    price: 16.47, sub: 14.82, size: '100ml', cat: ['body', 'noTan'],
    develops: 'instant', speed: 'tonight', depth: ['subtle'],
    blurb: 'For tonight. Washes off. Layers over a tan or stands on its own.',
    variants: [{ sku: 'SOL_S100', label: 'Instant, wash-off', shade: 'light' }]
  }
];

const TOOLS = [
  { id: 'mitt',  name: 'Tan Mitt',                  price: 12.00, cat: ['tools'] },
  { id: 'brush', name: 'Sculpt & Glow Tanning Brush', price: 15.00, cat: ['tools'] },
  { id: 'exfol', name: 'Exfoliator Glove Set',      price: 11.99, cat: ['tools'] }
];

/* Canonical bundles. Each appears ONCE, under one name, with the
   honest saving against the sum of its parts. */
const BUNDLES = [
  { id: 'mousse-mitt',  name: 'Tan Mousse & Mitt',      price: 29.69, parts: ['mousse', 'mitt'],   base: 'mousse' },
  { id: 'gradual-drops',name: 'Gradual Tan & Drops',    price: 32.38, parts: ['gradual', 'drops'], base: 'gradual' },
  { id: 'mousse-drops', name: 'Tan Mousse & Drops',     price: 38.69, parts: ['mousse', 'drops'],  base: 'mousse' },
  { id: 'starter',      name: 'Gradual Tan, Drops & Mitt', price: 35.15, parts: ['gradual','drops','mitt'], base: 'gradual' }
];

const byId = id => PRODUCTS.find(p => p.id === id) || TOOLS.find(t => t.id === id);
const money = n => '£' + n.toFixed(2);

/* the sum of a bundle's parts at full price — used to show a saving
   that is actually true, rather than an RRP that varies by listing */
function partsTotal(b) {
  return b.parts.reduce((sum, id) => sum + (byId(id) ? byId(id).price : 0), 0);
}
