import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Package, MapPin, LogOut, Phone, Mail, Clock, CheckCircle2, Truck, ExternalLink, Loader2, Save } from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

type OrderItem = {
  id: string;
  name: string;
  image?: string;
  price: number;
  size: string;
  qty: number;
};

type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  items: OrderItem[];
  total: number;
  payment_method: string;
  status: string;
};

const Account = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    // Load profile
    const loadProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, email")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setEmail(data.email || user.email || "");
      } else {
        setFullName((user.user_metadata?.full_name as string) || "");
        const rawPhone = (user.user_metadata?.phone as string) || (user.email?.split("@")[0] || "");
        setPhone(rawPhone.replace(/\D/g, ""));
        setEmail(user.email || "");
      }
    };

    // Load user orders
    const loadOrders = async () => {
      setLoadingOrders(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data as unknown as Order[]);
      }
      setLoadingOrders(false);
    };

    loadProfile();
    loadOrders();
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });

    setSavingProfile(false);
    if (error) {
      toast.error(`Could not save profile: ${error.message}`);
    } else {
      toast.success("Profile updated successfully");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
    toast.success("Signed out successfully");
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-gold animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container-px mx-auto max-w-[1200px] py-12">
        <nav className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
          <Link to="/" className="link-underline">Home</Link> / <span className="text-foreground">My Account</span>
        </nav>

        {/* Account header */}
        <div className="relative overflow-hidden rounded-2xl bg-ink text-primary-foreground p-6 sm:p-8 mb-10 shadow-lg">
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold mb-1">Customer Dashboard</p>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold">{fullName || "Valued Member"}</h1>
              <div className="mt-2 flex items-center gap-4 text-xs text-white/70 flex-wrap">
                {phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gold" /> +91 {phone}
                  </span>
                )}
                {email && !email.endsWith("@dexter.phone") && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-gold" /> {email}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 border border-white/20 text-white px-5 py-2.5 rounded-lg text-xs uppercase tracking-[0.2em] font-bold hover:bg-white/10 hover:text-gold transition"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Tab triggers */}
        <div className="flex border-b border-border mb-8 gap-4">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-2 text-xs uppercase tracking-[0.22em] font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "orders"
                ? "border-red-cta text-red-cta"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="h-4 w-4" /> My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-2 text-xs uppercase tracking-[0.22em] font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "profile"
                ? "border-red-cta text-red-cta"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" /> Profile & Settings
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            {loadingOrders ? (
              <div className="py-20 flex justify-center items-center">
                <Loader2 className="h-8 w-8 text-gold animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">No orders placed yet</h3>
                <p className="text-sm text-muted-foreground mb-6">Explore our curated collection and place your first order.</p>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-ink text-primary-foreground px-6 py-3 rounded-lg text-xs uppercase tracking-[0.25em] font-bold hover:bg-gold hover:text-ink transition"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const statusColors =
                    order.status === "delivered"
                      ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                      : order.status === "shipped"
                      ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
                      : order.status === "cancelled"
                      ? "bg-red-500/15 text-red-600 border-red-500/30"
                      : "bg-gold/20 text-gold border-gold/40";

                  return (
                    <div
                      key={order.id}
                      className="border border-border rounded-xl bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Order header */}
                      <div className="bg-secondary/40 p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3 border-b border-border">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Order ID</p>
                          <p className="font-mono font-bold text-sm">DX-{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {new Date(order.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold border ${statusColors}`}>
                            {order.status}
                          </span>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Total</p>
                            <p className="font-display font-bold text-base text-gold">{formatINR(order.total)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="p-4 sm:p-5 space-y-3">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="h-12 w-10 object-cover rounded bg-secondary shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground">Size: {item.size} · Qty: {item.qty}</p>
                            </div>
                            <span className="font-semibold text-sm">{formatINR(Number(item.price) * item.qty)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer / shipping info */}
                      <div className="bg-secondary/20 p-4 sm:p-5 border-t border-border flex items-center justify-between flex-wrap gap-3 text-xs">
                        <div className="flex items-start gap-1.5 text-muted-foreground max-w-md">
                          <MapPin className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                          <span>Delivering to: {order.address}, {order.city} — {order.pincode}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/track`}
                            className="inline-flex items-center gap-1.5 text-red-cta hover:underline font-bold uppercase tracking-wider text-[11px]"
                          >
                            <Truck className="h-3.5 w-3.5" /> Track Package
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-xl border border-border rounded-xl bg-card p-6 md:p-8 shadow-sm">
            <h2 className="font-display text-2xl font-bold mb-2">Customer Profile</h2>
            <p className="text-xs text-muted-foreground mb-6">Manage your registered details for faster order dispatch.</p>

            <form onSubmit={saveProfile} className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">Full Name</label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">Mobile Number</label>
                <div className="flex items-center gap-2 border border-border rounded-lg px-4 py-3 bg-secondary/50">
                  <span className="text-sm text-muted-foreground">+91</span>
                  <input
                    value={phone}
                    disabled
                    placeholder="10-digit mobile"
                    className="flex-1 text-sm bg-transparent outline-none text-muted-foreground cursor-not-allowed"
                  />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Primary Login</span>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email.endsWith("@dexter.phone") ? "" : email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com for order receipts"
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background focus:outline-none focus:border-gold"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center justify-center gap-2 bg-ink text-primary-foreground px-6 py-3.5 rounded-lg text-xs uppercase tracking-[0.25em] font-bold hover:bg-gold hover:text-ink transition disabled:opacity-60"
              >
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
              </button>
            </form>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Account;
