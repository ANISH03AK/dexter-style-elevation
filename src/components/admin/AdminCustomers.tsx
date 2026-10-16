import { useState, useEffect } from "react";
import { Users, Search, ShoppingBag, Phone, Mail, Calendar, IndianRupee } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
};

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      // Aggregate customers from orders and profiles
      try {
        const { data: orders } = await supabase.from("orders").select("*");
        const map: Record<string, Customer> = {};

        if (orders) {
          orders.forEach((o: any) => {
            const key = o.phone || o.customer_name || o.id;
            if (!map[key]) {
              map[key] = {
                id: o.user_id || key,
                name: o.customer_name || "Guest Customer",
                email: null,
                phone: o.phone || null,
                ordersCount: 0,
                totalSpent: 0,
                lastOrderDate: o.created_at,
              };
            }
            map[key].ordersCount += 1;
            map[key].totalSpent += Number(o.total) || 0;
            if (new Date(o.created_at) > new Date(map[key].lastOrderDate || 0)) {
              map[key].lastOrderDate = o.created_at;
            }
          });
        }

        const list = Object.values(map);
        setCustomers(list.sort((a, b) => b.totalSpent - a.totalSpent));
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      (c.phone && c.phone.includes(query)) ||
      (c.email && c.email.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-red-cta font-extrabold">CRM & Shoppers</span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground mt-1">
            Customer Management
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Browse verified shoppers, order frequency, total lifetime value, and Jayankondam customer contact details.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-foreground">Total Verified Customers</span>
          <p className="font-display text-2xl font-black text-gold">{customers.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by customer name or phone number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-card border border-border pl-9 pr-4 py-2 text-xs rounded-lg"
        />
      </div>

      {/* Table */}
      <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b border-border uppercase tracking-wider text-[10px] text-muted-foreground font-extrabold">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone / Contact</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Latest Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No customers found matching your query.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">{c.phone || "—"}</td>
                    <td className="py-3 px-4 font-bold">
                      <span className="bg-secondary px-2 py-0.5 rounded">{c.ordersCount}</span>
                    </td>
                    <td className="py-3 px-4 font-black text-ink">{formatINR(c.totalSpent)}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
