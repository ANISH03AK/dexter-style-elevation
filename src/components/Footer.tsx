import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import dexterLogo from "@/assets/dexter-logo.png";

const Footer = () => (
  <footer className="bg-ink text-primary-foreground mt-24">
    <div className="container-px mx-auto max-w-[1400px] py-16 grid gap-12 md:grid-cols-4">
      <div>
        <div className="bg-white inline-block px-4 py-3 rounded mb-4">
          <img src={dexterLogo} alt="DEXTER" className="h-10 w-auto object-contain" />
        </div>
        <p className="text-sm text-primary-foreground/60 leading-relaxed">
          Premium menswear engineered for the modern individual. Crafted with intent.
        </p>
        <div className="flex gap-4 mt-6">
          {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
            <a key={i} href="#" className="h-9 w-9 grid place-items-center border border-white/15 rounded-full hover:bg-gold hover:text-ink hover:border-gold transition-smooth">
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>

      {[
        { title: "Shop", items: ["New Arrivals", "Shirts", "T-Shirts", "Jeans", "Jackets"] },
        { title: "Help", items: ["Shipping", "Returns", "Size Guide", "Contact"] },
        { title: "Company", items: ["About", "Careers", "Press", "Sustainability"] },
      ].map(col => (
        <div key={col.title}>
          <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-5">{col.title}</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/70">
            {col.items.map(i => (
              <li key={i}><Link to="/shop" className="link-underline">{i}</Link></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t border-white/10">
      <div className="container-px mx-auto max-w-[1400px] py-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-primary-foreground/50">
        <p>© {new Date().getFullYear()} DEXTER. All rights reserved.</p>
        <p>Crafted in Milan · Worn worldwide</p>
      </div>
    </div>
  </footer>
);

export default Footer;
