export type Category =
  | "Shirts" | "T-Shirts" | "Pants" | "Jeans" | "Jackets"
  | "Hoodies" | "Suits" | "Activewear" | "Innerwear" | "Accessories";

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

// Real-world Dexter Mens Clothing default catalogue (Jayankondam store).
// These act as a static fallback; the admin-managed live DB list takes priority.
export const products: Product[] = [
  { id: "shirt-white-formal", name: "White Formal Shirt", category: "Shirts", price: 899, mrp: 1499, image: u("photo-1602810318383-e386cc2a3ccf"), tag: "Bestseller", description: "Crisp full-sleeve white shirt — perfect for office and formal events." },
  { id: "shirt-casual-checked", name: "Casual Checked Shirt", category: "Shirts", price: 799, mrp: 1399, image: u("photo-1589310243389-96a5483213a8"), tag: "Trending", description: "Soft cotton checked casual shirt with a relaxed fit." },
  { id: "shirt-printed-back", name: "Printed Back Shirt", category: "Shirts", price: 999, mrp: 1799, image: u("photo-1564584217132-2271feaeb3c5"), tag: "New", description: "Stylish printed shirt with a bold back graphic — streetwear favourite." },

  { id: "tee-oversized-drop", name: "Oversized Dropshoulder Tee", category: "T-Shirts", price: 499, mrp: 899, image: u("photo-1503342217505-b0a15ec3261c"), tag: "Hot", description: "Premium heavy-cotton oversized drop-shoulder t-shirt." },
  { id: "tee-fullsleeve", name: "Full Sleeve T-Shirt", category: "T-Shirts", price: 549, mrp: 899, image: u("photo-1618354691373-d851c5c3a990"), description: "Soft cotton full-sleeve tee — everyday comfort." },
  { id: "tee-acidwash", name: "Acid Wash T-Shirt", category: "T-Shirts", price: 599, mrp: 999, image: u("photo-1521572163474-6864f9cf17ab"), tag: "New", description: "Acid-washed cotton tee with vintage finish." },
  { id: "tee-puma-polo", name: "Puma Polo T-Shirt", category: "T-Shirts", price: 599, mrp: 1199, image: u("photo-1586790170083-2f9ceadc732d"), tag: "Branded", description: "Original Puma polo with two-button placket." },
  { id: "tee-polo-classic", name: "Classic Polo T-Shirt", category: "T-Shirts", price: 399, mrp: 799, image: u("photo-1571455786673-9d9d6c194f90"), description: "Smart casual polo t-shirt — clean lines." },

  { id: "pants-cargo", name: "Cargo Pants", category: "Pants", price: 1199, mrp: 1999, image: u("photo-1517438476312-10d79c5f25fd"), tag: "Trending", description: "Multi-pocket cargo pants with a relaxed straight fit." },
  { id: "pants-track", name: "Track Pants", category: "Pants", price: 799, mrp: 1299, image: u("photo-1552902865-b72c031ac5ea"), description: "Comfort-knit track pants with tapered ankle." },
  { id: "pants-cotton", name: "Cotton Pants", category: "Pants", price: 999, mrp: 1599, image: u("photo-1473966968600-fa801b869a1a"), description: "Soft breathable cotton pants for daily wear." },

  { id: "active-dryfit-tee", name: "Gym Dryfit T-Shirt", category: "Activewear", price: 599, mrp: 999, image: u("photo-1571019613454-1cb2f99b2d8b"), tag: "Active", description: "Sweat-wicking dry-fit tee built for training." },
  { id: "active-hoodie", name: "Premium Hoodie", category: "Hoodies", price: 1299, mrp: 2199, image: u("photo-1556821840-3a63f95609a7"), tag: "Cozy", description: "Heavy-blend pullover hoodie with brushed interior." },

  { id: "inner-jockey", name: "Jockey Innerwear (Pack)", category: "Innerwear", price: 449, mrp: 699, image: u("photo-1602810319428-019690571b5b"), tag: "Branded", description: "Original Jockey innerwear pack — premium combed cotton." },
  { id: "inner-ramraj", name: "Ramraj Innerwear (Pack)", category: "Innerwear", price: 399, mrp: 599, image: u("photo-1620799140408-edc6dcb6d633"), tag: "Branded", description: "Authentic Ramraj cotton innerwear pack." },

  { id: "access-leather-belt", name: "Leather Belt", category: "Accessories", price: 499, mrp: 899, image: u("photo-1624222247344-550fb60583dc"), tag: "Bestseller", description: "Full-grain leather belt with brushed metal buckle." },
  { id: "access-cap", name: "Premium Cap", category: "Accessories", price: 299, mrp: 599, image: u("photo-1588850561407-ed78c282e89b"), tag: "New", description: "Adjustable cotton cap with embroidered logo." },
];

export const getProduct = (id: string) => products.find(p => p.id === id);
