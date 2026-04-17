import hoodie from "@/assets/prod-hoodie.jpg";
import shirt from "@/assets/prod-shirt.jpg";
import coat from "@/assets/prod-coat.jpg";
import jeans from "@/assets/prod-jeans.jpg";
import tee from "@/assets/prod-tee.jpg";
import jacket from "@/assets/prod-jacket.jpg";

export type Product = {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  category: "Shirts" | "T-Shirts" | "Jeans" | "Jackets" | "Hoodies" | "Suits" | "Activewear" | "Accessories";
  image: string;
  tag?: string;
  description: string;
};

// Unsplash CDN images (royalty-free) for an expanded men's catalogue
const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const products: Product[] = [
  // Local hero pieces (kept)
  { id: "onyx-hoodie", name: "Onyx Oversized Hoodie", price: 2499, mrp: 4999, category: "Hoodies", image: hoodie, tag: "New", description: "Heavyweight 460gsm cotton fleece. Drop shoulder cut and brushed interior for an elevated everyday silhouette." },
  { id: "atelier-shirt", name: "Atelier Linen Shirt", price: 1899, mrp: 3499, category: "Shirts", image: shirt, tag: "Bestseller", description: "Tailored from premium European linen. Mother-of-pearl buttons and a relaxed modern fit." },
  { id: "noir-overcoat", name: "Noir Wool Overcoat", price: 5999, mrp: 11999, category: "Jackets", image: coat, tag: "50% Off", description: "Italian virgin wool overcoat with peak lapels. A definitive statement of refined masculinity." },
  { id: "raw-selvedge", name: "Raw Selvedge Denim", price: 2299, mrp: 4499, category: "Jeans", image: jeans, tag: "Limited", description: "14oz Japanese selvedge denim. Slim straight cut that breaks in beautifully over time." },
  { id: "essential-tee", name: "Essential Pima Tee", price: 699, mrp: 1499, category: "T-Shirts", image: tee, description: "Ultra-soft Peruvian Pima cotton with a clean crew neck. The perfect everyday white tee." },
  { id: "rebel-leather", name: "Rebel Leather Biker", price: 8999, mrp: 18999, category: "Jackets", image: jacket, tag: "Icon", description: "Hand-finished lambskin biker jacket with asymmetric zip. A timeless rebel essential." },

  // Shirts
  { id: "oxford-white", name: "Classic Oxford Shirt", price: 1299, mrp: 2499, category: "Shirts", image: u("photo-1602810318383-e386cc2a3ccf"), description: "Crisp pure-cotton Oxford weave with button-down collar. A wardrobe foundation." },
  { id: "denim-shirt", name: "Western Denim Shirt", price: 1499, mrp: 2999, category: "Shirts", image: u("photo-1564584217132-2271feaeb3c5"), tag: "Trending", description: "Garment-washed cotton denim with pearl snaps and twin chest pockets." },
  { id: "checked-flannel", name: "Highland Flannel Shirt", price: 1399, mrp: 2799, category: "Shirts", image: u("photo-1589310243389-96a5483213a8"), description: "Brushed flannel in a heritage tartan. Built for crisp evenings." },
  { id: "black-formal", name: "Onyx Formal Shirt", price: 1599, mrp: 2899, category: "Shirts", image: u("photo-1603252109303-2751441dd157"), description: "Slim-cut poplin with hidden placket. Boardroom to bar ready." },
  { id: "striped-poplin", name: "Banker Stripe Shirt", price: 1499, mrp: 2799, category: "Shirts", image: u("photo-1596755094514-f87e34085b2c"), description: "Two-fold cotton poplin in classic banker stripe with French placket." },

  // T-Shirts
  { id: "black-crew", name: "Midnight Crew Tee", price: 599, mrp: 1299, category: "T-Shirts", image: u("photo-1521572163474-6864f9cf17ab"), description: "Heavyweight combed cotton in jet black. Cut for a clean drop." },
  { id: "graphic-tee", name: "Streetwave Graphic Tee", price: 799, mrp: 1599, category: "T-Shirts", image: u("photo-1503342217505-b0a15ec3261c"), tag: "Hot", description: "Boxy fit tee with hand-drawn artwork screen-printed in Mumbai." },
  { id: "polo-navy", name: "Pique Polo Navy", price: 999, mrp: 1999, category: "T-Shirts", image: u("photo-1586790170083-2f9ceadc732d"), description: "Classic two-button pique polo in deep navy. Tailored placket." },
  { id: "henley-grey", name: "Slate Henley", price: 849, mrp: 1699, category: "T-Shirts", image: u("photo-1618354691373-d851c5c3a990"), description: "Three-button henley in melange slate. Long sleeve, slim fit." },
  { id: "oversized-white", name: "Drop-Shoulder Oversized Tee", price: 749, mrp: 1499, category: "T-Shirts", image: u("photo-1576566588028-4147f3842f27"), tag: "New", description: "Boxy oversized silhouette in 240gsm cotton. Street-ready staple." },

  // Jeans / Trousers
  { id: "black-skinny", name: "Jet Black Skinny Jeans", price: 1799, mrp: 3499, category: "Jeans", image: u("photo-1542272604-787c3835535d"), description: "Stretch-cotton skinny jeans in deep black with subtle whiskering." },
  { id: "blue-tapered", name: "Tapered Indigo Jeans", price: 1899, mrp: 3699, category: "Jeans", image: u("photo-1582552938357-32b906df40cb"), tag: "Bestseller", description: "Mid-rise tapered jeans in classic indigo wash. Comfort stretch." },
  { id: "cargo-pants", name: "Utility Cargo Pants", price: 1699, mrp: 3299, category: "Jeans", image: u("photo-1517438476312-10d79c5f25fd"), description: "Six-pocket relaxed cargo in olive ripstop. Adjustable cuffs." },
  { id: "chino-stone", name: "Stone Chino Trouser", price: 1499, mrp: 2999, category: "Jeans", image: u("photo-1473966968600-fa801b869a1a"), description: "Tailored chinos in washed stone twill with a slim straight leg." },

  // Jackets / Outerwear
  { id: "bomber-olive", name: "MA-1 Bomber Jacket", price: 3499, mrp: 6999, category: "Jackets", image: u("photo-1551028719-00167b16eac5"), tag: "Drop", description: "Iconic bomber silhouette with ribbed cuffs and utility pocket." },
  { id: "denim-jacket", name: "Vintage Denim Jacket", price: 2999, mrp: 5499, category: "Jackets", image: u("photo-1591047139829-d91aecb6caea"), description: "Stonewashed trucker jacket with chest pockets. The forever layer." },
  { id: "puffer-black", name: "Arctic Puffer Jacket", price: 4499, mrp: 8999, category: "Jackets", image: u("photo-1539533113208-f6df8cc8b543"), description: "Down-filled puffer with hood and water-resistant shell." },
  { id: "blazer-charcoal", name: "Charcoal Slim Blazer", price: 4999, mrp: 9999, category: "Jackets", image: u("photo-1593030761757-71fae45fa0e7"), description: "Half-canvas slim blazer in Italian wool blend. Sharp shoulders." },

  // Hoodies & Sweats
  { id: "zip-hoodie", name: "Full-Zip Tech Hoodie", price: 1999, mrp: 3999, category: "Hoodies", image: u("photo-1556821840-3a63f95609a7"), description: "Performance fleece full-zip with kangaroo pockets and storm hood." },
  { id: "crewneck-grey", name: "Heritage Crewneck Sweat", price: 1599, mrp: 2999, category: "Hoodies", image: u("photo-1620799140408-edc6dcb6d633"), tag: "Cozy", description: "Loopback cotton crew in heather grey. Classic gym-bag shape." },
  { id: "sherpa-hoodie", name: "Sherpa-Lined Hoodie", price: 2499, mrp: 4799, category: "Hoodies", image: u("photo-1578587018452-892bacefd3f2"), description: "Borg-lined pullover hoodie. Pure winter weekend energy." },

  // Suits
  { id: "navy-suit", name: "Midnight Navy Two-Piece", price: 8999, mrp: 17999, category: "Suits", image: u("photo-1594938298603-c8148c4dae35"), tag: "Premium", description: "Half-canvas two-piece in navy super 110s wool. Tapered trouser." },
  { id: "black-tux", name: "Onyx Tuxedo", price: 11999, mrp: 22999, category: "Suits", image: u("photo-1507679799987-c73779587ccf"), description: "Peak-lapel tuxedo in jet black with satin trim. Black-tie essential." },

  // Activewear
  { id: "training-tee", name: "Pulse Training Tee", price: 899, mrp: 1799, category: "Activewear", image: u("photo-1571019613454-1cb2f99b2d8b"), description: "Sweat-wicking technical mesh tee with reflective trims." },
  { id: "joggers-black", name: "Tech Tapered Joggers", price: 1499, mrp: 2999, category: "Activewear", image: u("photo-1552902865-b72c031ac5ea"), tag: "Active", description: "Four-way stretch joggers with zipped pockets and tapered cuffs." },
  { id: "shorts-grey", name: "Performance Training Shorts", price: 999, mrp: 1899, category: "Activewear", image: u("photo-1591195853828-11db59a44f6b"), description: "Lightweight 7-inch shorts with built-in liner." },

  // Accessories
  { id: "leather-belt", name: "Italian Leather Belt", price: 1299, mrp: 2499, category: "Accessories", image: u("photo-1624222247344-550fb60583dc"), description: "Full-grain calf leather belt with brushed nickel buckle." },
  { id: "wool-scarf", name: "Cashmere-Blend Scarf", price: 1499, mrp: 2999, category: "Accessories", image: u("photo-1601925260368-ae2f83cf8b7f"), description: "Soft cashmere-blend scarf in deep charcoal. Fringed ends." },
  { id: "leather-wallet", name: "Bifold Leather Wallet", price: 999, mrp: 1999, category: "Accessories", image: u("photo-1627123424574-724758594e93"), description: "Slim bifold in vegetable-tanned leather with six card slots." },
  { id: "aviator-sunglasses", name: "Aviator Sunglasses", price: 1799, mrp: 3499, category: "Accessories", image: u("photo-1572635196237-14b3f281503f"), tag: "New", description: "Classic aviator silhouette with polarized smoke lenses." },
];

export const getProduct = (id: string) => products.find(p => p.id === id);
