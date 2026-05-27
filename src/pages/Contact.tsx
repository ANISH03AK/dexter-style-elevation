import { Phone, Mail, MapPin, Clock } from "lucide-react";
import Layout from "@/components/Layout";

const Contact = () => (
  <Layout>
    <section className="container-px mx-auto max-w-[1400px] py-16">
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-red-cta mb-3 font-bold">Visit our flagship store</p>
        <h1 className="font-display text-4xl md:text-6xl font-extrabold text-foreground">DEXTER MENS CLOTHING</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Step inside our Jayankondam store for the full collection — shirts, t-shirts, pants, hoodies, innerwear and accessories.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-12">
        <div className="border-2 border-border rounded-xl p-6 bg-card">
          <MapPin className="h-6 w-6 text-red-cta" />
          <h3 className="font-display text-lg font-bold mt-4 text-foreground">Store Address</h3>
          <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
            Anna Silai, near Bazar Street,<br />Jayankondam, Tamil Nadu 621802
          </p>
        </div>
        <div className="border-2 border-border rounded-xl p-6 bg-card">
          <Clock className="h-6 w-6 text-gold" />
          <h3 className="font-display text-lg font-bold mt-4 text-foreground">Store Hours</h3>
          <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
            Open daily from <span className="font-bold">9:30 AM</span><br />
            Sunday — Saturday
          </p>
        </div>
        <div className="border-2 border-border rounded-xl p-6 bg-card">
          <Mail className="h-6 w-6 text-foreground" />
          <h3 className="font-display text-lg font-bold mt-4 text-foreground">Email & Web</h3>
          <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
            <a href="mailto:admin@dextermensclothing.in" className="link-underline">admin@dextermensclothing.in</a><br />
            <a href="https://www.dextermensclothing.in/" className="link-underline">www.dextermensclothing.in</a>
          </p>
        </div>
      </div>

      <div className="bg-ink rounded-2xl p-8 md:p-12 text-center text-primary-foreground mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold">Customer Care</p>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-3">089252 59787</h2>
        <p className="mt-3 text-primary-foreground/75">Talk to our store team — sizing, availability, custom orders.</p>
        <a
          href="tel:08925259787"
          className="mt-6 inline-flex items-center gap-3 bg-red-cta text-white px-8 py-4 text-sm uppercase tracking-[0.25em] font-bold rounded shadow-lg hover:scale-[1.02] transition-transform"
        >
          <Phone className="h-4 w-4" /> Call Store Now
        </a>
      </div>

      <div className="rounded-2xl overflow-hidden border-2 border-border shadow-elevated">
        <iframe
          title="DEXTER MENS CLOTHING — Jayankondam"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.4800363294025!2d79.2903743!3d11.0022359!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3arqzsRm118pMRIUCM%3A0x235014a8a9154fdb!2sDEXTER%20MENS%20CLOTHING!5e0!3m2!1sen!2sin!4v1716762000000!5m2!1sen!2sin"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  </Layout>
);

export default Contact;
