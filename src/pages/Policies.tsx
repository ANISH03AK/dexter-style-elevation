import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ShieldCheck, FileText, Truck, RotateCcw, Ban, Phone, Mail, MapPin } from "lucide-react";
import Layout from "@/components/Layout";

type TabKey = "privacy" | "terms" | "shipping" | "returns" | "cancellation";

const tabs: { key: TabKey; label: string; icon: typeof ShieldCheck }[] = [
  { key: "privacy", label: "Privacy Policy", icon: ShieldCheck },
  { key: "terms", label: "Terms & Conditions", icon: FileText },
  { key: "shipping", label: "Shipping Policy", icon: Truck },
  { key: "returns", label: "Returns & Exchanges", icon: RotateCcw },
  { key: "cancellation", label: "Cancellation & Refunds", icon: Ban },
];

const Policies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabKey) || "privacy";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as TabKey;
    if (tabFromUrl && tabs.some(t => t.key === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const selectTab = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout>
      <section className="container-px mx-auto max-w-[1200px] py-12">
        <nav className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
          <Link to="/" className="link-underline">Home</Link> / <span className="text-foreground">Store Policies & Legal</span>
        </nav>

        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Legal & Transparency</p>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold">Store Policies</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            At DEXTER MENS CLOTHING, we believe in straightforward, transparent service. Review our official store guidelines and policies below.
          </p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
          {/* Tabs navigation */}
          <div className="border border-border rounded-xl bg-card p-3 space-y-1 sticky top-28 shadow-sm">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => selectTab(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-[0.18em] font-bold text-left transition-all ${
                  activeTab === key
                    ? "bg-ink text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 ${activeTab === key ? "text-gold" : "text-muted-foreground"}`} />
                <span>{label}</span>
              </button>
            ))}

            <div className="pt-4 mt-4 border-t border-border px-3 pb-2 text-xs text-muted-foreground">
              <p className="font-bold uppercase tracking-wider text-[10px] text-foreground mb-2">Need Immediate Help?</p>
              <p className="mb-2">Our store team is available daily from 9:30 AM to 9:30 PM.</p>
              <a href="tel:08925259787" className="inline-flex items-center gap-1.5 text-red-cta font-bold hover:underline">
                <Phone className="h-3 w-3" /> 089252 59787
              </a>
            </div>
          </div>

          {/* Content panel */}
          <div className="border border-border rounded-2xl bg-card p-6 md:p-10 shadow-sm leading-relaxed text-sm text-foreground/90 space-y-6">
            {activeTab === "privacy" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="font-display text-2xl font-bold mb-2">Privacy Policy</h2>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Last updated: October 2026</p>
                </div>

                <p>
                  At <strong>DEXTER MENS CLOTHING</strong> ("we", "our", or "us"), operating at Anna Silai, near Bazar Street, Jayankondam, Tamil Nadu, we value your trust and are committed to safeguarding your personal data.
                </p>

                <h3 className="font-display text-lg font-bold text-foreground">1. Information We Collect</h3>
                <p>
                  When you browse our catalogue, register an account, or place an order, we may collect:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                  <li><strong>Contact Details:</strong> Your full name, mobile number, and email address.</li>
                  <li><strong>Delivery Address:</strong> Street address, city, state, and pincode for accurate parcel dispatch.</li>
                  <li><strong>Transaction Details:</strong> Items purchased, order value, payment method selected (COD, UPI, or Card). We <em>never</em> store your bank card credentials or UPI PINs.</li>
                  <li><strong>Device Information:</strong> Browser type and IP address for security, rate-limiting, and error diagnosis.</li>
                </ul>

                <h3 className="font-display text-lg font-bold text-foreground">2. How We Use Your Information</h3>
                <p>
                  Your information is strictly used to:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                  <li>Process, dispatch, and track your clothing orders.</li>
                  <li>Send essential transactional updates regarding order confirmation and shipping status.</li>
                  <li>Provide customer service and assist with sizing, exchange, or store enquiries.</li>
                  <li>Prevent fraudulent transactions and protect our customers and store platform.</li>
                </ul>

                <h3 className="font-display text-lg font-bold text-foreground">3. Data Sharing & Disclosure</h3>
                <p>
                  We never sell, rent, or trade your personal information. Data is shared exclusively with trusted logistics partners (such as Delhivery or India Post) strictly to fulfil the delivery of your order.
                </p>

                <h3 className="font-display text-lg font-bold text-foreground">4. Data Security</h3>
                <p>
                  All database communications use industry-standard HTTPS encryption. Row Level Security policies on our backend ensure that customers can only view their own private order records.
                </p>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="font-display text-2xl font-bold mb-2">Terms and Conditions</h2>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Effective Date: October 2026</p>
                </div>

                <p>
                  Welcome to <strong>DEXTER MENS CLOTHING</strong>. By accessing our website (dextermensclothing.in) or purchasing from our store, you agree to comply with and be bound by the following terms.
                </p>

                <h3 className="font-display text-lg font-bold text-foreground">1. Product Pricing & Availability</h3>
                <p>
                  All prices listed on the website are in Indian Rupees (₹ INR) and are inclusive of applicable taxes. While we strive for accuracy in product descriptions and stock counts, occasional inventory changes may occur between in-store sales and online orders. In the rare event an ordered item is out of stock, we will notify you immediately to offer an alternative or a prompt refund.
                </p>

                <h3 className="font-display text-lg font-bold text-foreground">2. Brand Authenticity</h3>
                <p>
                  All branded apparel stocked at DEXTER (including Puma, Jockey, Ramraj, and our curated in-house streetwear drops) are 100% authentic and sourced directly from licensed distributors and genuine manufacturers.
                </p>

                <h3 className="font-display text-lg font-bold text-foreground">3. User Accounts</h3>
                <p>
                  You are responsible for maintaining the confidentiality of your mobile login PIN or password. Any activities occurring under your account are your responsibility. We reserve the right to suspend accounts engaged in abusive order placements or fraudulent activities.
                </p>

                <h3 className="font-display text-lg font-bold text-foreground">4. Governing Law</h3>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India, under the jurisdiction of the courts of Ariyalur / Jayankondam, Tamil Nadu.
                </p>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="font-display text-2xl font-bold mb-2">Shipping & Delivery Policy</h2>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Fast & Reliable Dispatch</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 my-4">
                  <div className="border border-border p-4 rounded-xl bg-secondary/50">
                    <p className="text-xs uppercase tracking-wider text-gold font-bold mb-1">Free Delivery</p>
                    <p className="font-display text-xl font-bold">Orders over ₹2500</p>
                    <p className="text-xs text-muted-foreground mt-1">Or order 3 or more apparel items.</p>
                  </div>
                  <div className="border border-border p-4 rounded-xl bg-secondary/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">Standard Delivery</p>
                    <p className="font-display text-xl font-bold">₹162 Flat Rate</p>
                    <p className="text-xs text-muted-foreground mt-1">For smaller single/double item orders.</p>
                  </div>
                </div>

                <h3 className="font-display text-lg font-bold text-foreground">1. Dispatch Timelines</h3>
                <p>
                  All confirmed orders are processed and packed from our Jayankondam store within <strong>24 to 48 hours</strong> (excluding national holidays and Sundays).
                </p>

                <h3 className="font-display text-lg font-bold text-foreground">2. Estimated Delivery Time</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                  <li><strong>Tamil Nadu & Puducherry:</strong> 2 to 4 business days.</li>
                  <li><strong>South India (Karnataka, Kerala, Andhra Pradesh, Telangana):</strong> 3 to 5 business days.</li>
                  <li><strong>Rest of India:</strong> 4 to 7 business days.</li>
                </ul>

                <h3 className="font-display text-lg font-bold text-foreground">3. Order Tracking</h3>
                <p>
                  Once your parcel has been handed to our courier partner, you will receive a tracking ID via SMS or email. You can also track your parcel at any time using our dedicated <Link to="/track" className="text-red-cta font-bold hover:underline">Track Order</Link> page.
                </p>

                <h3 className="font-display text-lg font-bold text-foreground">4. In-Store Pickup</h3>
                <p>
                  Customers in or around Jayankondam can opt for complimentary in-store pickup at Anna Silai, near Bazar Street during regular store hours (9:30 AM – 9:30 PM).
                </p>
              </div>
            )}

            {activeTab === "returns" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="font-display text-2xl font-bold mb-2">Return & Exchange Policy</h2>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Hassle-Free Sizing & Exchanges</p>
                </div>

                <p>
                  We want you to love your fit. If a shirt or pant isn't the right size or fit, we offer an easy exchange process.
                </p>

                <h3 className="font-display text-lg font-bold text-foreground">1. Exchange Window</h3>
                <p>
                  You may request a size exchange or store credit return within <strong>7 days</strong> of delivery.
                </p>

                <h3 className="font-display text-lg font-bold text-foreground">2. Conditions for Return / Exchange</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                  <li>The item must be unwashed, unworn, and unaltered.</li>
                  <li>Original brand tags and product packaging must be intact.</li>
                  <li>Due to hygiene reasons, innerwear, vests, and socks are strictly non-returnable unless defective on arrival.</li>
                </ul>

                <h3 className="font-display text-lg font-bold text-foreground">3. How to Initiate an Exchange</h3>
                <p>
                  To request an exchange, call or message our Jayankondam store directly at <strong>089252 59787</strong> with your Order ID and the preferred size. You can also walk into our Anna Silai showroom for an instant on-the-spot exchange.
                </p>
              </div>
            )}

            {activeTab === "cancellation" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="font-display text-2xl font-bold mb-2">Cancellation & Refund Policy</h2>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Fair & Transparent</p>
                </div>

                <h3 className="font-display text-lg font-bold text-foreground">1. Order Cancellation</h3>
                <p>
                  You can cancel your order any time before it has been marked as <strong>Shipped</strong>. Once a parcel is handed over to the courier partner, it cannot be recalled and must follow the standard return process upon delivery.
                </p>

                <h3 className="font-display text-lg font-bold text-foreground">2. Refund Processing</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                  <li><strong>Prepaid / UPI Orders:</strong> If cancelled prior to dispatch, refunds are credited back to your original payment account within 3–5 business days.</li>
                  <li><strong>Cash on Delivery Orders:</strong> No advance payment is charged, so no refund is necessary upon cancellation prior to delivery.</li>
                  <li><strong>Defective or Damaged Products:</strong> If an item arrives damaged, notify us within 48 hours of delivery at 089252 59787 with a photo of the defect. We will issue a replacement immediately or process a 100% refund.</li>
                </ul>
              </div>
            )}

            {/* Store contact footer inside policy */}
            <div className="mt-8 pt-8 border-t border-border bg-secondary/30 -mx-6 -mb-6 md:-mx-10 md:-mb-10 p-6 md:p-8 rounded-b-2xl">
              <h4 className="font-display font-bold text-base mb-2">Have questions about our policies?</h4>
              <p className="text-xs text-muted-foreground mb-4">Feel free to reach out to our Jayankondam team directly.</p>
              <div className="flex flex-wrap gap-4 text-xs font-semibold">
                <a href="tel:08925259787" className="inline-flex items-center gap-1.5 text-foreground hover:text-gold">
                  <Phone className="h-3.5 w-3.5 text-gold" /> 089252 59787
                </a>
                <a href="mailto:admin@dextermensclothing.in" className="inline-flex items-center gap-1.5 text-foreground hover:text-gold">
                  <Mail className="h-3.5 w-3.5 text-gold" /> admin@dextermensclothing.in
                </a>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-gold" /> Anna Silai, Jayankondam, TN
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Policies;
