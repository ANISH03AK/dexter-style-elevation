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
  category: "Shirts" | "T-Shirts" | "Jeans" | "Jackets";
  image: string;
  tag?: string;
  description: string;
};

export const products: Product[] = [
  { id: "onyx-hoodie", name: "Onyx Oversized Hoodie", price: 10699, category: "Jackets", image: hoodie, tag: "New", description: "Heavyweight 460gsm cotton fleece. Drop shoulder cut and brushed interior for an elevated everyday silhouette." },
  { id: "atelier-shirt", name: "Atelier Linen Shirt", price: 8199, category: "Shirts", image: shirt, tag: "Bestseller", description: "Tailored from premium European linen. Mother-of-pearl buttons and a relaxed modern fit." },
  { id: "noir-overcoat", name: "Noir Wool Overcoat", price: 28999, category: "Jackets", image: coat, description: "Italian virgin wool overcoat with peak lapels. A definitive statement of refined masculinity." },
  { id: "raw-selvedge", name: "Raw Selvedge Denim", price: 15699, category: "Jeans", image: jeans, tag: "Limited", description: "14oz Japanese selvedge denim. Slim straight cut that breaks in beautifully over time." },
  { id: "essential-tee", name: "Essential Pima Tee", price: 4099, category: "T-Shirts", image: tee, description: "Ultra-soft Peruvian Pima cotton with a clean crew neck. The perfect everyday white tee." },
  { id: "rebel-leather", name: "Rebel Leather Biker", price: 49799, category: "Jackets", image: jacket, tag: "Icon", description: "Hand-finished lambskin biker jacket with asymmetric zip. A timeless rebel essential." },
];

export const getProduct = (id: string) => products.find(p => p.id === id);
