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

export const products: Product[] = [
  { id: "shirt-milan-oxford", name: "Milan Oxford Shirt", price: 1199, mrp: 2999, category: "Shirts", image: u("photo-1602810318383-e386cc2a3ccf"), tag: "Trending", rating: 4.7, reviews: 1842, description: "Crisp oxford weave with a sharp spread collar and clean tailored finish for smart daily wear." },
  { id: "shirt-riviera-linen", name: "Riviera Linen Shirt", price: 1399, mrp: 3299, category: "Shirts", image: u("photo-1564584217132-2271feaeb3c5"), tag: "New", rating: 4.6, reviews: 1218, description: "Breathable linen shirt with a relaxed silhouette built for warm days and polished evenings." },
  { id: "shirt-harbor-stripe", name: "Harbor Stripe Shirt", price: 1299, mrp: 3099, category: "Shirts", image: u("photo-1589310243389-96a5483213a8"), rating: 4.5, reviews: 964, description: "Vertical stripe cotton shirt that delivers a lean profile with lightweight everyday comfort." },
  { id: "shirt-regent-poplin", name: "Regent Poplin Shirt", price: 1499, mrp: 3599, category: "Shirts", image: u("photo-1603252109303-2751441dd157"), tag: "Premium", rating: 4.8, reviews: 776, description: "Smooth poplin construction with refined cuffs and a versatile cut for work or dinner." },

  { id: "tee-signal-crew", name: "Signal Crew Tee", price: 499, mrp: 1299, category: "T-Shirts", image: u("photo-1521572163474-6864f9cf17ab"), tag: "Hot", rating: 4.4, reviews: 3124, description: "Soft combed jersey tee with a balanced fit and durable neck rib for repeat everyday use." },
  { id: "tee-drift-oversized", name: "Drift Oversized Tee", price: 699, mrp: 1499, category: "T-Shirts", image: u("photo-1503342217505-b0a15ec3261c"), tag: "Bestseller", rating: 4.7, reviews: 2288, description: "Boxy oversized t-shirt with dropped shoulders and a premium drape that feels current and easy." },
  { id: "tee-vector-polo", name: "Vector Polo Tee", price: 799, mrp: 1699, category: "T-Shirts", image: u("photo-1586790170083-2f9ceadc732d"), rating: 4.5, reviews: 1106, description: "Minimal polo tee with a clean placket and soft-touch knit for smart-casual rotation." },
  { id: "tee-nova-pocket", name: "Nova Pocket Tee", price: 599, mrp: 1399, category: "T-Shirts", image: u("photo-1618354691373-d851c5c3a990"), tag: "New", rating: 4.3, reviews: 856, description: "Relaxed pocket tee cut from breathable cotton with subtle structure and everyday versatility." },

  { id: "jeans-indigo-taper", name: "Indigo Taper Jeans", price: 1499, mrp: 3699, category: "Jeans", image: u("photo-1542272604-787c3835535d"), tag: "Trending", rating: 4.6, reviews: 1689, description: "Mid-rise tapered denim with a deep indigo wash and comfortable stretch for all-day wear." },
  { id: "jeans-stone-straight", name: "Stone Straight Jeans", price: 1599, mrp: 3899, category: "Jeans", image: u("photo-1582552938357-32b906df40cb"), rating: 4.5, reviews: 1327, description: "Straight-leg jeans finished in a versatile stone wash with sturdy premium denim construction." },
  { id: "jeans-carbon-slim", name: "Carbon Slim Jeans", price: 1699, mrp: 4099, category: "Jeans", image: u("photo-1517438476312-10d79c5f25fd"), tag: "Limited", rating: 4.7, reviews: 948, description: "Slim black denim with a clean ankle break and sharp streamlined look for day-to-night styling." },
  { id: "jeans-vault-relaxed", name: "Vault Relaxed Jeans", price: 1799, mrp: 4399, category: "Jeans", image: u("photo-1473966968600-fa801b869a1a"), rating: 4.4, reviews: 715, description: "Relaxed-leg jeans with vintage fading and room through the thigh for laid-back comfort." },

  { id: "jacket-aspen-bomber", name: "Aspen Bomber Jacket", price: 2499, mrp: 5999, category: "Jackets", image: u("photo-1551028719-00167b16eac5"), tag: "Bestseller", rating: 4.8, reviews: 1446, description: "Structured bomber jacket with ribbed trims and a modern profile for effortless outerwear styling." },
  { id: "jacket-torque-biker", name: "Torque Biker Jacket", price: 4299, mrp: 9999, category: "Jackets", image: u("photo-1591047139829-d91aecb6caea"), tag: "Icon", rating: 4.9, reviews: 684, description: "Edge-driven biker jacket with clean panel detailing, rich texture, and a confident silhouette." },
  { id: "jacket-crown-overcoat", name: "Crown Overcoat", price: 3899, mrp: 8999, category: "Jackets", image: u("photo-1539533113208-f6df8cc8b543"), rating: 4.7, reviews: 538, description: "Longline overcoat designed with refined lapels and a sharp drape for elevated seasonal layering." },
  { id: "jacket-terrain-field", name: "Terrain Field Jacket", price: 2999, mrp: 7299, category: "Jackets", image: u("photo-1593030761757-71fae45fa0e7"), tag: "Premium", rating: 4.6, reviews: 902, description: "Utility field jacket with multiple pockets, a structured collar, and an all-weather-ready build." },

  { id: "hoodie-ember-pullover", name: "Ember Pullover Hoodie", price: 1299, mrp: 3199, category: "Hoodies", image: u("photo-1556821840-3a63f95609a7"), tag: "Cozy", rating: 4.7, reviews: 2456, description: "Heavy brushed fleece hoodie with a roomy hood and soft interior built for all-day comfort." },
  { id: "hoodie-graph-fullzip", name: "Graph Full-Zip Hoodie", price: 1499, mrp: 3499, category: "Hoodies", image: u("photo-1620799140408-edc6dcb6d633"), rating: 4.5, reviews: 1364, description: "Zip-up hoodie with clean seam lines and a structured fit for casual layering across seasons." },
  { id: "hoodie-rally-quarterzip", name: "Rally Quarter-Zip Sweat", price: 1399, mrp: 3299, category: "Hoodies", image: u("photo-1578587018452-892bacefd3f2"), tag: "New", rating: 4.4, reviews: 892, description: "Quarter-zip sweatshirt with a raised collar, smooth fleece body, and understated athletic styling." },
  { id: "hoodie-cinder-boxy", name: "Cinder Boxy Hoodie", price: 1599, mrp: 3799, category: "Hoodies", image: u("photo-1565693413579-8a73fcdf0c44"), tag: "Trending", rating: 4.6, reviews: 1179, description: "Boxy-cut hoodie with dropped shoulders and thick premium knit for a bold modern streetwear feel." },

  { id: "suit-onyx-twopiece", name: "Onyx Two-Piece Suit", price: 5499, mrp: 11999, category: "Suits", image: u("photo-1594938298603-c8148c4dae35"), tag: "Premium", rating: 4.8, reviews: 642, description: "Sharp two-piece suiting set crafted for formal events with a clean silhouette and polished finish." },
  { id: "suit-mayfair-pinstripe", name: "Mayfair Pinstripe Suit", price: 6299, mrp: 13499, category: "Suits", image: u("photo-1507679799987-c73779587ccf"), rating: 4.7, reviews: 411, description: "Tailored pinstripe suit balancing traditional elegance with a precise contemporary fit." },
  { id: "suit-velour-tuxedo", name: "Velour Tuxedo Set", price: 6999, mrp: 14999, category: "Suits", image: u("photo-1593032465175-481ac7f401a0"), tag: "Icon", rating: 4.9, reviews: 288, description: "Statement tuxedo with satin detailing and a sculpted jacket shape for black-tie occasions." },
  { id: "suit-cavendish-blazer", name: "Cavendish Blazer Suit", price: 5899, mrp: 12799, category: "Suits", image: u("photo-1617137968427-85924c800a22"), tag: "New", rating: 4.6, reviews: 356, description: "Refined blazer-led suit with structured shoulders and elegant lines that dress up instantly." },

  { id: "active-apex-tee", name: "Apex Training Tee", price: 799, mrp: 1799, category: "Activewear", image: u("photo-1571019613454-1cb2f99b2d8b"), tag: "Active", rating: 4.5, reviews: 1524, description: "Sweat-wicking performance tee built with stretch comfort and airflow for demanding sessions." },
  { id: "active-stride-jogger", name: "Stride Tapered Joggers", price: 1199, mrp: 2599, category: "Activewear", image: u("photo-1552902865-b72c031ac5ea"), rating: 4.4, reviews: 1047, description: "Technical joggers with a tapered ankle, secure pockets, and flexible movement for gym or travel." },
  { id: "active-sprint-track", name: "Sprint Track Jacket", price: 1499, mrp: 2999, category: "Activewear", image: u("photo-1591195853828-11db59a44f6b"), tag: "Trending", rating: 4.6, reviews: 813, description: "Lightweight zip track jacket designed for motion with a sleek fit and clean athletic finish." },
  { id: "active-core-short", name: "Core Training Shorts", price: 899, mrp: 1999, category: "Activewear", image: u("photo-1583468982228-19f19164aee2"), rating: 4.3, reviews: 697, description: "Breathable training shorts with easy stretch and a supportive waistband for intense workouts." },

  { id: "access-heritage-belt", name: "Heritage Leather Belt", price: 699, mrp: 1699, category: "Accessories", image: u("photo-1624222247344-550fb60583dc"), tag: "Bestseller", rating: 4.7, reviews: 934, description: "Full-grain leather belt with a brushed metal buckle and timeless finishing for dress or denim." },
  { id: "access-sterling-watch", name: "Sterling Steel Watch", price: 1799, mrp: 3999, category: "Accessories", image: u("photo-1601925260368-ae2f83cf8b7f"), tag: "Premium", rating: 4.8, reviews: 582, description: "Polished steel watch with a minimal dial and refined bracelet that elevates any outfit." },
  { id: "access-noir-wallet", name: "Noir Bifold Wallet", price: 899, mrp: 1999, category: "Accessories", image: u("photo-1627123424574-724758594e93"), rating: 4.5, reviews: 744, description: "Compact bifold wallet in rich textured leather with clean compartments and a slim profile." },
  { id: "access-luxe-scarf", name: "Luxe Wool Scarf", price: 999, mrp: 2299, category: "Accessories", image: u("photo-1572635196237-14b3f281503f"), tag: "New", rating: 4.4, reviews: 468, description: "Soft wool scarf finished with fine edges and versatile proportions for cold-weather layering." },
];

export const getProduct = (id: string) => products.find(p => p.id === id);
