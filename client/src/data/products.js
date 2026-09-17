import { categories } from './categories';

/**
 * Demo catalogue — UI placeholder data only. See ./README.md.
 *
 * Shaped to match server/src/models/Product.js, with `category` pre-populated
 * the way the API will return it. `images` is intentionally left empty so the
 * ImageFrame placeholder renders; a real URL dropped in here displays instead,
 * with no component change.
 */

const byId = Object.fromEntries(categories.map((category) => [category._id, category]));

/** Fills in the fields that are identical across every demo product. */
function make({ id, cat, name, sku, brand, price, salePrice = null, stock, rating, ratingCount, sold, featured = false, short, description, specs, daysAgo }) {
  const category = byId[cat];

  return {
    _id: id,
    name,
    slug: name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, ''),
    sku,
    brand,
    shortDescription: short,
    description,
    specifications: specs,
    images: [],
    category: { _id: category._id, name: category.name, slug: category.slug },
    price,
    salePrice,
    stock,
    lowStockThreshold: 5,
    status: 'active',
    isFeatured: featured,
    isNew: daysAgo <= 14,
    ratingAverage: rating,
    ratingCount,
    unitsSold: sold,
    createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
  };
}

export const products = [
  // --- Fashion -------------------------------------------------------------
  make({
    id: 'p-001', cat: 'cat-fashion', name: 'Handloom Cotton Shirt', sku: 'GV-FSN-1001', brand: 'Gavora Essentials',
    price: 2499, salePrice: 1799, stock: 24, rating: 4.5, ratingCount: 128, sold: 412, featured: true, daysAgo: 12,
    short: 'Breathable handloom cotton with a relaxed, unfussy cut.',
    description:
      'Woven on traditional handlooms and finished with a soft wash, this shirt is built for long Indian summers. The weave keeps air moving, and the cut is relaxed through the chest without looking oversized. Pattern-matched at the placket and reinforced at every stress point.',
    specs: [
      { key: 'Material', value: '100% handloom cotton' },
      { key: 'Fit', value: 'Relaxed regular' },
      { key: 'Sleeve', value: 'Full sleeve with single-button cuff' },
      { key: 'Care', value: 'Machine wash cold, line dry in shade' },
      { key: 'Country of origin', value: 'India' },
    ],
  }),
  make({
    id: 'p-002', cat: 'cat-fashion', name: 'Merino Wool Crew Sweater', sku: 'GV-FSN-1002', brand: 'Northwind',
    price: 4299, salePrice: 3299, stock: 11, rating: 4.7, ratingCount: 86, sold: 231, daysAgo: 30,
    short: 'Fine-gauge merino that layers without bulk.',
    description:
      'A fine-gauge merino crew that works under a jacket or on its own. Merino regulates temperature far better than acrylic, so it stays comfortable indoors as well as out, and it resists odour between washes.',
    specs: [
      { key: 'Material', value: '100% extra-fine merino wool' },
      { key: 'Gauge', value: '14 gauge' },
      { key: 'Fit', value: 'Regular' },
      { key: 'Care', value: 'Hand wash cold, dry flat' },
    ],
  }),
  make({
    id: 'p-003', cat: 'cat-fashion', name: 'Linen Blend Trousers', sku: 'GV-FSN-1003', brand: 'Gavora Essentials',
    price: 2899, stock: 0, rating: 4.2, ratingCount: 54, sold: 168, daysAgo: 48,
    short: 'Linen-cotton blend with a clean, tailored drape.',
    description:
      'Linen keeps these cool, while the cotton content stops them creasing the moment you sit down. Side-adjuster waistband, deep front pockets and a half-lined seat for comfort through a full day.',
    specs: [
      { key: 'Material', value: '55% linen, 45% cotton' },
      { key: 'Fit', value: 'Tapered' },
      { key: 'Closure', value: 'Hook bar with concealed button' },
      { key: 'Care', value: 'Machine wash cold' },
    ],
  }),
  make({
    id: 'p-004', cat: 'cat-fashion', name: 'Block Print Cotton Scarf', sku: 'GV-FSN-1004', brand: 'Rangeen',
    price: 1299, salePrice: 899, stock: 38, rating: 4.4, ratingCount: 41, sold: 97, daysAgo: 6,
    short: 'Hand block printed in Bagru with natural dyes.',
    description:
      'Each scarf is hand block printed in Bagru using natural dyes, so slight variation between pieces is expected and is the point. Soft enough to wear against the skin, generous enough to double as a light wrap.',
    specs: [
      { key: 'Material', value: 'Mulmul cotton' },
      { key: 'Dimensions', value: '200 cm x 70 cm' },
      { key: 'Technique', value: 'Hand block print, natural dye' },
      { key: 'Care', value: 'First wash separately' },
    ],
  }),

  // --- Home & Kitchen ------------------------------------------------------
  make({
    id: 'p-005', cat: 'cat-home-kitchen', name: 'Brass Table Lamp', sku: 'GV-HMK-2001', brand: 'Atelier Kosh',
    price: 5499, salePrice: 4299, stock: 9, rating: 4.8, ratingCount: 73, sold: 184, featured: true, daysAgo: 18,
    short: 'Solid brass base with a hand-stitched cotton shade.',
    description:
      'Turned from solid brass and left unlacquered, so it develops a patina over the years rather than flaking. The cotton shade is hand-stitched and throws a warm, even pool of light — a reading lamp, not a spotlight.',
    specs: [
      { key: 'Material', value: 'Solid brass, cotton shade' },
      { key: 'Height', value: '42 cm' },
      { key: 'Bulb', value: 'E27, max 15W LED (not included)' },
      { key: 'Cable', value: '1.8 m braided, in-line switch' },
      { key: 'Warranty', value: '2 years on wiring' },
    ],
  }),
  make({
    id: 'p-006', cat: 'cat-home-kitchen', name: 'Cast Iron Skillet 26cm', sku: 'GV-HMK-2002', brand: 'Ferro',
    price: 3299, salePrice: 2599, stock: 16, rating: 4.9, ratingCount: 214, sold: 638, featured: true, daysAgo: 60,
    short: 'Pre-seasoned cast iron that improves with every use.',
    description:
      'Sand-cast in a single piece with no rivets to work loose, then pre-seasoned with vegetable oil so it is ready on arrival. Holds heat long enough to sear properly and moves straight from hob to oven.',
    specs: [
      { key: 'Material', value: 'Cast iron, pre-seasoned' },
      { key: 'Diameter', value: '26 cm' },
      { key: 'Weight', value: '2.4 kg' },
      { key: 'Compatibility', value: 'Gas, induction, oven, open flame' },
      { key: 'Care', value: 'Hand wash, dry on heat, wipe with oil' },
    ],
  }),
  make({
    id: 'p-007', cat: 'cat-home-kitchen', name: 'Stoneware Dinner Set of 4', sku: 'GV-HMK-2003', brand: 'Terra Studio',
    price: 6999, salePrice: 5199, stock: 4, rating: 4.6, ratingCount: 62, sold: 143, daysAgo: 25,
    short: 'Reactive-glaze stoneware, microwave and dishwasher safe.',
    description:
      'Wheel-thrown stoneware finished in a reactive glaze, which means every plate fires slightly differently. Chip-resistant at the rim and heavy enough to feel substantial without being awkward to lift.',
    specs: [
      { key: 'Material', value: 'Glazed stoneware' },
      { key: 'Includes', value: '4 dinner plates, 4 side plates, 4 bowls' },
      { key: 'Plate diameter', value: '27 cm' },
      { key: 'Safe for', value: 'Microwave, dishwasher, oven to 180°C' },
    ],
  }),
  make({
    id: 'p-008', cat: 'cat-home-kitchen', name: 'Cotton Waffle Bath Towel', sku: 'GV-HMK-2004', brand: 'Gavora Home',
    price: 1899, stock: 42, rating: 4.3, ratingCount: 97, sold: 276, daysAgo: 40,
    short: 'Quick-drying waffle weave in long-staple cotton.',
    description:
      'A waffle weave holds less water than terry, so it dries far faster and stays fresh in humid bathrooms. Long-staple cotton means it softens with washing instead of shedding lint.',
    specs: [
      { key: 'Material', value: '100% long-staple cotton' },
      { key: 'Dimensions', value: '140 cm x 70 cm' },
      { key: 'Weight', value: '400 GSM' },
      { key: 'Care', value: 'Machine wash warm, tumble dry low' },
    ],
  }),

  // --- Jewellery -----------------------------------------------------------
  make({
    id: 'p-009', cat: 'cat-jewellery', name: 'Sterling Silver Hoop Earrings', sku: 'GV-JWL-3001', brand: 'Kalaa',
    price: 2199, salePrice: 1649, stock: 27, rating: 4.7, ratingCount: 156, sold: 389, featured: true, daysAgo: 15,
    short: '925 sterling silver hoops, light enough for all day.',
    description:
      'Hand-finished 925 sterling silver with a hinged catch that closes flush. At just under four grams a pair they can be worn from morning to night without pulling on the lobe.',
    specs: [
      { key: 'Material', value: '925 sterling silver' },
      { key: 'Diameter', value: '24 mm' },
      { key: 'Weight', value: '3.8 g per pair' },
      { key: 'Closure', value: 'Hinged snap' },
      { key: 'Hallmark', value: 'BIS hallmarked' },
    ],
  }),
  make({
    id: 'p-010', cat: 'cat-jewellery', name: 'Kundan Statement Necklace', sku: 'GV-JWL-3002', brand: 'Virasat',
    price: 8999, salePrice: 6499, stock: 6, rating: 4.5, ratingCount: 38, sold: 71, daysAgo: 22,
    short: 'Traditional kundan setting with an adjustable dori.',
    description:
      'Set by hand in the traditional kundan technique, with uncut stones bedded in lac and framed in gold-plated brass. The dori adjusts across a wide range so it sits correctly with different necklines.',
    specs: [
      { key: 'Material', value: 'Gold-plated brass, glass kundan' },
      { key: 'Length', value: 'Adjustable 36-46 cm' },
      { key: 'Includes', value: 'Necklace and matching earrings' },
      { key: 'Care', value: 'Keep dry, store in the pouch provided' },
    ],
  }),
  make({
    id: 'p-011', cat: 'cat-jewellery', name: 'Oxidised Silver Jhumkas', sku: 'GV-JWL-3003', brand: 'Kalaa',
    price: 1799, stock: 0, rating: 4.4, ratingCount: 64, sold: 152, daysAgo: 55,
    short: 'Oxidised finish with fine filigree bell work.',
    description:
      'Filigree jhumkas with an oxidised finish that throws the detail into relief. Deliberately light for their size, so the traditional look does not come with a full evening of discomfort.',
    specs: [
      { key: 'Material', value: 'Oxidised brass alloy' },
      { key: 'Drop length', value: '52 mm' },
      { key: 'Weight', value: '9 g per pair' },
      { key: 'Closure', value: 'Push-back stud' },
    ],
  }),
  make({
    id: 'p-012', cat: 'cat-jewellery', name: 'Rose Quartz Pendant Chain', sku: 'GV-JWL-3004', brand: 'Solaya',
    price: 2799, salePrice: 2099, stock: 13, rating: 4.6, ratingCount: 45, sold: 108, daysAgo: 9,
    short: 'Faceted rose quartz on a fine silver chain.',
    description:
      'A single faceted rose quartz drop on a fine 925 silver chain. Natural stone, so colour and inclusions vary between pieces — each pendant is genuinely one of a kind.',
    specs: [
      { key: 'Stone', value: 'Natural rose quartz' },
      { key: 'Chain', value: '925 sterling silver, 45 cm' },
      { key: 'Pendant', value: '14 mm drop' },
      { key: 'Clasp', value: 'Spring ring' },
    ],
  }),

  // --- Beauty --------------------------------------------------------------
  make({
    id: 'p-013', cat: 'cat-beauty', name: 'Cold Pressed Argan Hair Oil', sku: 'GV-BTY-4001', brand: 'Sattva',
    price: 1499, salePrice: 1099, stock: 55, rating: 4.6, ratingCount: 302, sold: 894, featured: true, daysAgo: 20,
    short: 'Single-ingredient argan oil, cold pressed and unrefined.',
    description:
      'One ingredient: cold-pressed argan oil, unrefined and unscented. Cold pressing keeps the vitamin E intact, which heat extraction destroys. Amber glass because argan oil degrades in light.',
    specs: [
      { key: 'Ingredients', value: '100% Argania spinosa kernel oil' },
      { key: 'Volume', value: '100 ml' },
      { key: 'Extraction', value: 'Cold pressed, unrefined' },
      { key: 'Packaging', value: 'Amber glass with glass dropper' },
      { key: 'Shelf life', value: '24 months unopened' },
    ],
  }),
  make({
    id: 'p-014', cat: 'cat-beauty', name: 'Vitamin C Face Serum', sku: 'GV-BTY-4002', brand: 'Sattva',
    price: 1899, salePrice: 1424, stock: 31, rating: 4.4, ratingCount: 187, sold: 521, daysAgo: 14,
    short: '10% stabilised vitamin C with hyaluronic acid.',
    description:
      'A 10% stabilised vitamin C serum — high enough to be effective, low enough to suit most skin without stinging. Buffered with hyaluronic acid and packed in airless glass, because vitamin C oxidises on contact with air.',
    specs: [
      { key: 'Key actives', value: '10% ethyl ascorbic acid, 1% hyaluronic acid' },
      { key: 'Volume', value: '30 ml' },
      { key: 'Skin type', value: 'All, including sensitive' },
      { key: 'Free from', value: 'Parabens, sulphates, added fragrance' },
      { key: 'Patch test', value: 'Recommended before first use' },
    ],
  }),
  make({
    id: 'p-015', cat: 'cat-beauty', name: 'Sandalwood Soap Trio', sku: 'GV-BTY-4003', brand: 'Vann',
    price: 899, stock: 68, rating: 4.5, ratingCount: 121, sold: 340, daysAgo: 35,
    short: 'Cold-process soap cured for six weeks.',
    description:
      'Cold-process soap cured for six weeks, which produces a harder bar that lasts noticeably longer than melt-and-pour. Scented with real sandalwood oil rather than synthetic fragrance.',
    specs: [
      { key: 'Includes', value: '3 bars, 100 g each' },
      { key: 'Base oils', value: 'Coconut, castor, rice bran' },
      { key: 'Method', value: 'Cold process, 6-week cure' },
      { key: 'Packaging', value: 'Plastic-free kraft wrap' },
    ],
  }),
  make({
    id: 'p-016', cat: 'cat-beauty', name: 'Neem & Clay Face Mask', sku: 'GV-BTY-4004', brand: 'Vann',
    price: 1199, salePrice: 849, stock: 3, rating: 4.2, ratingCount: 76, sold: 195, daysAgo: 44,
    short: 'Bentonite clay mask for oily and combination skin.',
    description:
      'Bentonite clay with neem and turmeric, supplied dry so there are no preservatives to react to. Mix a spoonful with water or rose water as you need it.',
    specs: [
      { key: 'Key ingredients', value: 'Bentonite clay, neem, turmeric' },
      { key: 'Weight', value: '100 g' },
      { key: 'Skin type', value: 'Oily, combination' },
      { key: 'Use', value: 'Twice weekly, 10 minutes' },
    ],
  }),

  // --- Toys ----------------------------------------------------------------
  make({
    id: 'p-017', cat: 'cat-toys', name: 'Wooden Building Blocks Set', sku: 'GV-TOY-5001', brand: 'Chotu Works',
    price: 2299, salePrice: 1799, stock: 22, rating: 4.8, ratingCount: 143, sold: 367, featured: true, daysAgo: 28,
    short: '60 solid rubberwood blocks with non-toxic finish.',
    description:
      'Sixty solid rubberwood blocks, sanded smooth and finished with food-grade non-toxic stain. No batteries, no screen, no instructions — the appeal is that they can become anything.',
    specs: [
      { key: 'Material', value: 'Solid rubberwood' },
      { key: 'Pieces', value: '60 blocks in 8 shapes' },
      { key: 'Finish', value: 'Food-grade non-toxic stain' },
      { key: 'Age', value: '3 years and above' },
      { key: 'Safety', value: 'BIS certified, no small parts' },
    ],
  }),
  make({
    id: 'p-018', cat: 'cat-toys', name: 'Cotton Plush Elephant', sku: 'GV-TOY-5002', brand: 'Chotu Works',
    price: 1299, stock: 34, rating: 4.7, ratingCount: 88, sold: 219, daysAgo: 33,
    short: 'Machine-washable plush with embroidered features.',
    description:
      'Filled with recycled polyester and covered in organic cotton. Features are embroidered rather than glued on, so there is nothing for a determined toddler to pull loose. Fully machine washable.',
    specs: [
      { key: 'Outer', value: 'Organic cotton' },
      { key: 'Filling', value: 'Recycled polyester fibre' },
      { key: 'Height', value: '28 cm' },
      { key: 'Age', value: 'Newborn and above' },
      { key: 'Care', value: 'Machine wash in a laundry bag' },
    ],
  }),
  make({
    id: 'p-019', cat: 'cat-toys', name: 'Wooden Shape Puzzle Board', sku: 'GV-TOY-5003', brand: 'Little Loom',
    price: 999, salePrice: 749, stock: 47, rating: 4.4, ratingCount: 67, sold: 178, daysAgo: 50,
    short: 'Chunky knobbed pieces sized for small hands.',
    description:
      'Twelve chunky knobbed pieces in a solid board. The knobs are sized for a pincer grip, which is exactly the motor skill this age is working on. Edges are fully rounded.',
    specs: [
      { key: 'Material', value: 'Plywood with water-based paint' },
      { key: 'Pieces', value: '12' },
      { key: 'Board size', value: '30 cm x 22 cm' },
      { key: 'Age', value: '18 months and above' },
    ],
  }),
  make({
    id: 'p-020', cat: 'cat-toys', name: 'Family Strategy Board Game', sku: 'GV-TOY-5004', brand: 'Adda Games',
    price: 1699, salePrice: 1359, stock: 19, rating: 4.6, ratingCount: 94, sold: 246, daysAgo: 11,
    short: 'Thirty-minute strategy game for two to five players.',
    description:
      'A tile-laying strategy game that teaches in about five minutes and finishes inside half an hour, which is the difference between a game that gets played and one that stays on the shelf.',
    specs: [
      { key: 'Players', value: '2 to 5' },
      { key: 'Play time', value: '30 to 45 minutes' },
      { key: 'Age', value: '8 years and above' },
      { key: 'Includes', value: '90 tiles, 5 player sets, cloth bag, rulebook' },
    ],
  }),

  // --- Bags ----------------------------------------------------------------
  make({
    id: 'p-021', cat: 'cat-bags', name: 'Waxed Canvas Weekender', sku: 'GV-BAG-6001', brand: 'Terrain Co',
    price: 6499, salePrice: 4999, stock: 8, rating: 4.8, ratingCount: 112, sold: 287, featured: true, daysAgo: 16,
    short: 'Water-resistant waxed canvas with leather trim.',
    description:
      'Waxed canvas over a leather base, with a YKK zip and box-stitched handles rated well past the weight anyone will actually carry. Cabin-legal on most Indian carriers and it softens into shape with use.',
    specs: [
      { key: 'Material', value: '18 oz waxed canvas, full-grain leather trim' },
      { key: 'Capacity', value: '38 litres' },
      { key: 'Dimensions', value: '52 x 28 x 26 cm' },
      { key: 'Hardware', value: 'YKK zips, antique brass finish' },
      { key: 'Warranty', value: '3 years on stitching and hardware' },
    ],
  }),
  make({
    id: 'p-022', cat: 'cat-bags', name: 'Everyday Laptop Backpack', sku: 'GV-BAG-6002', brand: 'Terrain Co',
    price: 3999, salePrice: 3199, stock: 26, rating: 4.5, ratingCount: 198, sold: 574, daysAgo: 26,
    short: 'Padded 15-inch sleeve with a luggage pass-through.',
    description:
      'A suspended, padded sleeve keeps a 15-inch laptop off the bottom of the bag, which is where drops do their damage. Water-resistant recycled shell, luggage pass-through, and a side pocket that fits a one-litre bottle.',
    specs: [
      { key: 'Material', value: 'Recycled polyester, water-resistant coating' },
      { key: 'Laptop', value: 'Fits up to 15 inch' },
      { key: 'Capacity', value: '22 litres' },
      { key: 'Weight', value: '780 g' },
      { key: 'Warranty', value: '2 years' },
    ],
  }),
  make({
    id: 'p-023', cat: 'cat-bags', name: 'Woven Jute Tote', sku: 'GV-BAG-6003', brand: 'Bunai',
    price: 1599, stock: 51, rating: 4.3, ratingCount: 73, sold: 201, daysAgo: 38,
    short: 'Hand-woven jute with a cotton-lined interior.',
    description:
      'Hand-woven jute with a full cotton lining, so nothing snags and small items cannot escape through the weave. Flat-bottomed, which means it stands up on its own when you set it down.',
    specs: [
      { key: 'Material', value: 'Natural jute, cotton lining' },
      { key: 'Dimensions', value: '40 x 35 x 14 cm' },
      { key: 'Handle drop', value: '24 cm' },
      { key: 'Interior', value: 'One zip pocket' },
    ],
  }),
  make({
    id: 'p-024', cat: 'cat-bags', name: 'Leather Card Wallet', sku: 'GV-BAG-6004', brand: 'Hide & Seam',
    price: 1899, salePrice: 1424, stock: 2, rating: 4.7, ratingCount: 156, sold: 431, daysAgo: 42,
    short: 'Full-grain leather, six slots, no bulk.',
    description:
      'Full-grain leather that darkens and takes on character rather than peeling like corrected grain. Six card slots and a centre pocket for folded notes, in a profile thin enough for a front pocket.',
    specs: [
      { key: 'Material', value: 'Full-grain vegetable-tanned leather' },
      { key: 'Capacity', value: '6 cards plus folded notes' },
      { key: 'Dimensions', value: '10.5 x 7.5 x 1 cm' },
      { key: 'Stitching', value: 'Hand-saddle stitched with waxed thread' },
    ],
  }),

  // --- Stationery ----------------------------------------------------------
  make({
    id: 'p-025', cat: 'cat-stationery', name: 'Hardbound Dotted Notebook', sku: 'GV-STN-7001', brand: 'Margin',
    price: 899, salePrice: 679, stock: 73, rating: 4.6, ratingCount: 241, sold: 812, featured: true, daysAgo: 8,
    short: '120 GSM dotted paper that will not ghost.',
    description:
      'A 120 GSM dotted notebook that takes fountain pen and fineliner without ghosting or bleeding through — 70 GSM paper cannot do this. Lies flat at any page thanks to a sewn binding.',
    specs: [
      { key: 'Paper', value: '120 GSM, acid free' },
      { key: 'Pages', value: '192, dotted 5 mm' },
      { key: 'Size', value: 'A5, 148 x 210 mm' },
      { key: 'Binding', value: 'Sewn, lies flat' },
      { key: 'Extras', value: 'Two ribbon markers, elastic closure, rear pocket' },
    ],
  }),
  make({
    id: 'p-026', cat: 'cat-stationery', name: 'Brass Fountain Pen', sku: 'GV-STN-7002', brand: 'Margin',
    price: 2499, salePrice: 1999, stock: 14, rating: 4.7, ratingCount: 98, sold: 213, daysAgo: 21,
    short: 'Machined brass body with a fine German nib.',
    description:
      'A machined brass body that patinas with handling, fitted with a German fine steel nib. Takes standard international cartridges or the converter supplied, so you are never tied to one ink.',
    specs: [
      { key: 'Body', value: 'Machined solid brass' },
      { key: 'Nib', value: 'German steel, fine' },
      { key: 'Filling', value: 'International cartridge or converter' },
      { key: 'Weight', value: '38 g' },
      { key: 'Includes', value: 'Converter, 2 ink cartridges, cloth sleeve' },
    ],
  }),
  make({
    id: 'p-027', cat: 'cat-stationery', name: 'Desk Organiser Tray', sku: 'GV-STN-7003', brand: 'Kaaj',
    price: 1499, stock: 29, rating: 4.3, ratingCount: 52, sold: 134, daysAgo: 46,
    short: 'Solid mango wood with felt-lined compartments.',
    description:
      'Solid mango wood with four felt-lined compartments, so pens and keys do not rattle or scratch. Weighted enough that it does not slide when you drop something into it.',
    specs: [
      { key: 'Material', value: 'Solid mango wood, felt lining' },
      { key: 'Dimensions', value: '32 x 18 x 5 cm' },
      { key: 'Compartments', value: '4' },
      { key: 'Finish', value: 'Natural matte lacquer' },
    ],
  }),
  make({
    id: 'p-028', cat: 'cat-stationery', name: 'Gel Pen Set of 8', sku: 'GV-STN-7004', brand: 'Kaaj',
    price: 649, salePrice: 519, stock: 88, rating: 4.1, ratingCount: 164, sold: 498, daysAgo: 52,
    short: 'Quick-drying 0.5 mm gel ink in eight colours.',
    description:
      'Quick-drying 0.5 mm gel ink, which matters if you are left-handed and tired of smudged pages. Needle tips for control, and refillable rather than disposable.',
    specs: [
      { key: 'Tip', value: '0.5 mm needle point' },
      { key: 'Colours', value: '8' },
      { key: 'Ink', value: 'Quick-dry gel, water resistant once dry' },
      { key: 'Refillable', value: 'Yes' },
    ],
  }),

  // --- Gifts ---------------------------------------------------------------
  make({
    id: 'p-029', cat: 'cat-gifts', name: 'Artisan Tea Gift Box', sku: 'GV-GFT-8001', brand: 'Gavora Gifting',
    price: 2499, salePrice: 1899, stock: 21, rating: 4.7, ratingCount: 132, sold: 356, featured: true, daysAgo: 10,
    short: 'Six single-estate teas in a reusable wooden box.',
    description:
      'Six single-estate teas from Darjeeling, Assam and the Nilgiris, in a reusable wooden box with a hinged lid. Includes a card explaining where each tea comes from and how to brew it.',
    specs: [
      { key: 'Includes', value: '6 teas, 50 g each, with brewing card' },
      { key: 'Origins', value: 'Darjeeling, Assam, Nilgiris' },
      { key: 'Packaging', value: 'Reusable wooden box' },
      { key: 'Shelf life', value: '18 months' },
    ],
  }),
  make({
    id: 'p-030', cat: 'cat-gifts', name: 'Scented Candle Duo', sku: 'GV-GFT-8002', brand: 'Vann',
    price: 1999, salePrice: 1499, stock: 36, rating: 4.5, ratingCount: 87, sold: 224, daysAgo: 19,
    short: 'Soy wax with cotton wicks and a 40-hour burn.',
    description:
      'Soy wax with cotton wicks, which burns cleaner and cooler than paraffin and will not soot up the glass. Roughly forty hours per candle, in reusable glass tumblers.',
    specs: [
      { key: 'Wax', value: '100% soy' },
      { key: 'Wick', value: 'Lead-free cotton' },
      { key: 'Burn time', value: 'About 40 hours each' },
      { key: 'Scents', value: 'Sandalwood & Cedar, Jasmine & Lime' },
      { key: 'Weight', value: '200 g each' },
    ],
  }),
  make({
    id: 'p-031', cat: 'cat-gifts', name: 'Housewarming Hamper', sku: 'GV-GFT-8003', brand: 'Gavora Gifting',
    price: 4999, salePrice: 3999, stock: 7, rating: 4.6, ratingCount: 43, sold: 96, daysAgo: 24,
    short: 'Curated hamper with a handwritten note option.',
    description:
      'A hamper put together to be genuinely useful in a new home rather than decorative: a stoneware serving bowl, brass tealight holders, tea and a soy candle. A handwritten note can be added at checkout.',
    specs: [
      { key: 'Includes', value: 'Serving bowl, 2 tealight holders, tea tin, candle' },
      { key: 'Packaging', value: 'Rigid gift box with fabric ribbon' },
      { key: 'Personalisation', value: 'Handwritten note available' },
      { key: 'Dimensions', value: '36 x 28 x 14 cm' },
    ],
  }),
  make({
    id: 'p-032', cat: 'cat-gifts', name: 'Festive Dry Fruit Tin', sku: 'GV-GFT-8004', brand: 'Gavora Gifting',
    price: 1799, stock: 0, rating: 4.4, ratingCount: 118, sold: 402, daysAgo: 5,
    short: 'Four-compartment tin of graded dry fruit.',
    description:
      'Four compartments of graded almonds, cashews, pistachios and raisins in a decorative tin that gets reused long after the contents are gone. Sealed and date-stamped at packing.',
    specs: [
      { key: 'Includes', value: 'Almonds, cashews, pistachios, raisins' },
      { key: 'Net weight', value: '600 g total' },
      { key: 'Packaging', value: 'Reusable four-compartment tin' },
      { key: 'Best before', value: '6 months from packing date' },
    ],
  }),
];

export default products;
