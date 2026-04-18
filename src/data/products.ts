import hoodie from "@/assets/prod-hoodie.jpg";
import shirt from "@/assets/prod-shirt.jpg";
import coat from "@/assets/prod-coat.jpg";
import jeans from "@/assets/prod-jeans.jpg";
import tee from "@/assets/prod-tee.jpg";
import jacket from "@/assets/prod-jacket.jpg";

export type Category =
  | "Shirts" | "T-Shirts" | "Jeans" | "Jackets"
  | "Hoodies" | "Suits" | "Activewear" | "Accessories";

export type Product = {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  category: Category;
  image: string;
  tag?: string;
  description: string;
  rating?: number;
  reviews?: number;
};

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

// Curated Unsplash photo IDs by category (men's fashion)
const IMAGES: Record<Category, string[]> = {
  Shirts: [
    "photo-1602810318383-e386cc2a3ccf","photo-1564584217132-2271feaeb3c5",
    "photo-1589310243389-96a5483213a8","photo-1603252109303-2751441dd157",
    "photo-1596755094514-f87e34085b2c","photo-1620012253295-c15cc3e65df4",
    "photo-1626497764746-6dc36546b388","photo-1607345366928-199ea26cfe3e",
  ],
  "T-Shirts": [
    "photo-1521572163474-6864f9cf17ab","photo-1503342217505-b0a15ec3261c",
    "photo-1586790170083-2f9ceadc732d","photo-1618354691373-d851c5c3a990",
    "photo-1576566588028-4147f3842f27","photo-1581655353564-df123a1eb820",
    "photo-1583743814966-8936f5b7be1a","photo-1622445275576-721325763afe",
  ],
  Jeans: [
    "photo-1542272604-787c3835535d","photo-1582552938357-32b906df40cb",
    "photo-1517438476312-10d79c5f25fd","photo-1473966968600-fa801b869a1a",
    "photo-1604176354204-9268737828e4","photo-1604176424472-9d7122c0b9c2",
    "photo-1541099649105-f69ad21f3246","photo-1551854838-212c50b4c184",
  ],
  Jackets: [
    "photo-1551028719-00167b16eac5","photo-1591047139829-d91aecb6caea",
    "photo-1539533113208-f6df8cc8b543","photo-1593030761757-71fae45fa0e7",
    "photo-1520975954732-35dd22299614","photo-1548883354-94bcfe321cbb",
    "photo-1611312449408-fcece27cdbb7","photo-1544022613-e87ca75a784a",
  ],
  Hoodies: [
    "photo-1556821840-3a63f95609a7","photo-1620799140408-edc6dcb6d633",
    "photo-1578587018452-892bacefd3f2","photo-1565693413579-8a73fcdf0c44",
    "photo-1620799139507-2a76f79a2f4d","photo-1614975059251-992f11792b9f",
  ],
  Suits: [
    "photo-1594938298603-c8148c4dae35","photo-1507679799987-c73779587ccf",
    "photo-1593032465175-481ac7f401a0","photo-1617137968427-85924c800a22",
    "photo-1521336575822-6da63fb45455","photo-1598808503746-f34c53b9323e",
  ],
  Activewear: [
    "photo-1571019613454-1cb2f99b2d8b","photo-1552902865-b72c031ac5ea",
    "photo-1591195853828-11db59a44f6b","photo-1583468982228-19f19164aee2",
    "photo-1556906781-9a412961c28c","photo-1606902965551-dce093cda6e7",
  ],
  Accessories: [
    "photo-1624222247344-550fb60583dc","photo-1601925260368-ae2f83cf8b7f",
    "photo-1627123424574-724758594e93","photo-1572635196237-14b3f281503f",
    "photo-1547949003-9792a18a2601","photo-1622434641406-a158123450f9",
    "photo-1611923134239-b9be5816e23d","photo-1603487742131-4160ec999306",
  ],
};

const NAME_PARTS: Record<Category, { adj: string[]; noun: string[] }> = {
  Shirts: {
    adj: ["Onyx","Atelier","Heritage","Banker","Highland","Coastal","Monaco","Westend","Riviera","Linen","Oxford","Poplin","Slim","Vintage"],
    noun: ["Oxford Shirt","Linen Shirt","Flannel Shirt","Denim Shirt","Formal Shirt","Stripe Shirt","Check Shirt","Cuban Shirt","Mandarin Shirt"],
  },
  "T-Shirts": {
    adj: ["Midnight","Streetwave","Pulse","Pacific","Studio","Drop-Shoulder","Boxy","Essential","Pima","Combed","Statement","Faded"],
    noun: ["Crew Tee","Graphic Tee","V-Neck Tee","Henley","Polo","Oversized Tee","Pocket Tee","Long Sleeve Tee","Striped Tee"],
  },
  Jeans: {
    adj: ["Indigo","Onyx","Carbon","Stonewash","Raw","Selvedge","Tapered","Slim","Relaxed","Distressed","Vintage","Charcoal","Stone"],
    noun: ["Skinny Jeans","Straight Jeans","Tapered Jeans","Cargo Pants","Chino Trouser","Denim Joggers","Wide Leg Jeans","Slim Fit Jeans"],
  },
  Jackets: {
    adj: ["Noir","Arctic","Rebel","Storm","Aviator","Charcoal","Heritage","Italian","Vintage","Tactical","Urban","Highland"],
    noun: ["Bomber Jacket","Denim Jacket","Puffer Jacket","Slim Blazer","Overcoat","Trench Coat","Biker Jacket","Field Jacket","Quilted Jacket"],
  },
  Hoodies: {
    adj: ["Tech","Heritage","Sherpa","Heavyweight","Boxy","Onyx","Graphite","Ember","Studio","Retro","Lounge"],
    noun: ["Pullover Hoodie","Full-Zip Hoodie","Crewneck Sweat","Sherpa Hoodie","Half-Zip","Oversized Hoodie","Quarter-Zip Sweat"],
  },
  Suits: {
    adj: ["Midnight","Onyx","Charcoal","Pinstripe","Italian","British","Slim","Tailored","Premium","Black-Tie"],
    noun: ["Two-Piece Suit","Three-Piece Suit","Tuxedo","Wool Blazer","Formal Trouser","Dinner Jacket","Waistcoat"],
  },
  Activewear: {
    adj: ["Pulse","Velocity","Apex","Performance","Tech","Dynamic","Stride","Flux","Core"],
    noun: ["Training Tee","Tapered Joggers","Training Shorts","Compression Tights","Track Jacket","Performance Polo","Running Tee"],
  },
  Accessories: {
    adj: ["Italian","Premium","Heritage","Calfskin","Vintage","Onyx","Brushed","Classic","Modern","Sterling"],
    noun: ["Leather Belt","Cashmere Scarf","Bifold Wallet","Aviator Sunglasses","Leather Card Holder","Wool Beanie","Silk Tie","Pocket Square","Steel Watch","Bracelet"],
  },
};

const PRICE_RANGE: Record<Category, [number, number]> = {
  Shirts: [499, 1899],
  "T-Shirts": [299, 999],
  Jeans: [699, 2199],
  Jackets: [1499, 5999],
  Hoodies: [799, 2299],
  Suits: [3999, 9999],
  Activewear: [499, 1499],
  Accessories: [299, 1799],
};

const TAGS = ["New","Trending","Hot","Bestseller","Limited","Drop","Premium","Cozy","Active","Icon","50% Off","60% Off","70% Off"];

// Seeded PRNG so the catalog is stable between renders/builds
const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6D2B79F5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const COUNT_PER_CAT = 125; // 8 cats × 125 = 1000 generated
const CATEGORIES = Object.keys(IMAGES) as Category[];

const seed = mulberry32(20251);
const pick = <T,>(arr: T[]) => arr[Math.floor(seed() * arr.length)];
const rangeInt = (min: number, max: number) => Math.floor(seed() * (max - min + 1)) + min;

const seen = new Set<string>();
const generated: Product[] = [];

for (const cat of CATEGORIES) {
  for (let i = 0; i < COUNT_PER_CAT; i++) {
    const adj = pick(NAME_PARTS[cat].adj);
    const noun = pick(NAME_PARTS[cat].noun);
    const name = `${adj} ${noun}`;
    const baseId = `${cat.toLowerCase().replace(/[^a-z]/g, "")}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    let id = baseId;
    let n = 2;
    while (seen.has(id)) { id = `${baseId}-${n++}`; }
    seen.add(id);

    const [pmin, pmax] = PRICE_RANGE[cat];
    const price = Math.round(rangeInt(pmin, pmax) / 10) * 10;
    const mrp = Math.round((price * (1.8 + seed() * 0.9)) / 10) * 10; // 45-65% off
    const tag = seed() < 0.35 ? pick(TAGS) : undefined;
    const rating = +(3.6 + seed() * 1.4).toFixed(1);
    const reviews = rangeInt(12, 4800);
    const image = u(pick(IMAGES[cat]));

    generated.push({
      id,
      name,
      price,
      mrp,
      category: cat,
      image,
      tag,
      rating,
      reviews,
      description: `${name.toLowerCase()} crafted from premium materials. Modern fit, durable construction, and signature DEXTER detailing for everyday luxury.`,
    });
  }
}

const heroes: Product[] = [
  { id: "onyx-hoodie", name: "Onyx Oversized Hoodie", price: 1299, mrp: 4999, category: "Hoodies", image: hoodie, tag: "Bestseller", rating: 4.7, reviews: 2840, description: "Heavyweight 460gsm cotton fleece. Drop shoulder cut and brushed interior for an elevated everyday silhouette." },
  { id: "atelier-shirt", name: "Atelier Linen Shirt", price: 999, mrp: 3499, category: "Shirts", image: shirt, tag: "Trending", rating: 4.6, reviews: 1820, description: "Tailored from premium European linen. Mother-of-pearl buttons and a relaxed modern fit." },
  { id: "noir-overcoat", name: "Noir Wool Overcoat", price: 3499, mrp: 11999, category: "Jackets", image: coat, tag: "70% Off", rating: 4.8, reviews: 940, description: "Italian virgin wool overcoat with peak lapels. A definitive statement of refined masculinity." },
  { id: "raw-selvedge", name: "Raw Selvedge Denim", price: 1499, mrp: 4499, category: "Jeans", image: jeans, tag: "Limited", rating: 4.5, reviews: 1320, description: "14oz Japanese selvedge denim. Slim straight cut that breaks in beautifully over time." },
  { id: "essential-tee", name: "Essential Pima Tee", price: 399, mrp: 1499, category: "T-Shirts", image: tee, tag: "Hot", rating: 4.4, reviews: 5240, description: "Ultra-soft Peruvian Pima cotton with a clean crew neck. The perfect everyday white tee." },
  { id: "rebel-leather", name: "Rebel Leather Biker", price: 5999, mrp: 18999, category: "Jackets", image: jacket, tag: "Icon", rating: 4.9, reviews: 612, description: "Hand-finished lambskin biker jacket with asymmetric zip. A timeless rebel essential." },
];

export const products: Product[] = [...heroes, ...generated];

export const getProduct = (id: string) => products.find(p => p.id === id);
