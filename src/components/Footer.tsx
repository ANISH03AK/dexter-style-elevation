import { Instagram, Facebook, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import dexterLogo from "@/assets/dexter-logo.png";

const Footer = () => (
  <footer className="bg-ink text-primary-foreground mt-24">
    <div className="container-px mx-auto max-w-[1400px] py-16 grid gap-12 md:grid-cols-4">
      <div>
        <img src={dexterLogo} alt="DEXTER MENS CLOTHING" className="h-14 w-auto object-contain mb-5 brightness-0 invert" />
        <p className="text-sm text-primary-foreground/70 leading-relaxed">
          DEXTER MENS CLOTHING — Premium menswear in Jayankondam. Shirts, tees, pants, hoodies, innerwear and accessories.
        </p>
        <div className="flex gap-3 mt-6">
          <a href="#" aria-label="Instagram" className="h-9 w-9 grid place-items-center border border-white/20 rounded-full hover:bg-gold hover:text-ink hover:border-gold transition-smooth">
            <Instagram className="h-4 w-4" />
          </a>
          <a href="#" aria-label="Facebook" className="h-9 w-9 grid place-items-center border border-white/20 rounded-full hover:bg-gold hover:text-ink hover:border-gold transition-smooth">
            <Facebook className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-5 font-bold">Shop</h4>
        <ul className="space-y-3 text-sm text-primary-foreground/80">
          {["Shirts","T-Shirts","Pants","Hoodies","Innerwear","Accessories"].map(i => (
            <li key={i}><Link to={`/shop?cat=${encodeURIComponent(i)}`} className="link-underline">{i}</Link></li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-5 font-bold">Visit Store</h4>
        <ul className="space-y-3 text-sm text-primary-foreground/80">
          <li className="flex gap-2"><MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" /><span>Anna Silai, near Bazar Street, Jayankondam, Tamil Nadu 621802</span></li>
          <li className="flex gap-2"><Phone className="h-4 w-4 text-gold shrink-0 mt-0.5" /><a href="tel:08925259787" className="link-underline">089252 59787</a></li>
          <li className="flex gap-2"><Mail className="h-4 w-4 text-gold shrink-0 mt-0.5" /><a href="mailto:admin@dextermensclothing.in" className="link-underline">admin@dextermensclothing.in</a></li>
        </ul>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-5 font-bold">Customer Care</h4>
        <ul className="space-y-3 text-sm text-primary-foreground/80">
          <li><Link to="/contact" className="link-underline">Contact Us</Link></li>
          <li><Link to="/about" className="link-underline">About DEXTER</Link></li>
          <li><Link to="/cart" className="link-underline">Cart</Link></li>
          <li><span className="opacity-80">Open daily from 9:30 AM</span></li>
        </ul>
        <a href="tel:08925259787" className="mt-5 inline-flex items-center gap-2 bg-red-cta text-white px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-bold rounded">
          <Phone className="h-3.5 w-3.5" /> Call Store Now
        </a>
      </div>
    </div>
    <div className="border-t border-white/10">
      <div className="container-px mx-auto max-w-[1400px] py-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-primary-foreground/60">
        <p>© {new Date().getFullYear()} DEXTER MENS CLOTHING. All rights reserved.</p>
        <p><a href="https://www.dextermensclothing.in/" className="hover:text-gold">www.dextermensclothing.in</a></p>
      </div>
    </div>
  </footer>
);

export default Footer;
