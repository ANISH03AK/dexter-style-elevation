import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2, Wallet, CreditCard, Banknote, GripVertical } from "lucide-react";

export type PayMethodRow = {
  method: string;
  enabled: boolean;
  label: string | null;
  description: string | null;
  instructions: string | null;
  upi_vpa: string | null;
  payee_name: string | null;
  sort_order: number;
};

const iconFor = (m: string) => (m === "upi" ? Wallet : m === "card" ? CreditCard : Banknote);

const blank = {
  method: "", label: "", description: "", instructions: "", upi_vpa: "", payee_name: "", sort_order: 0,
};

const PaymentMethods = () => {
  const [rows, setRows] = useState<PayMethodRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(blank);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("payment_settings")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    if (data) setRows(data as unknown as PayMethodRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-pay-methods")
      .on("postgres_changes", { event: "*", schema: "public", table: "payment_settings" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const patch = (method: string, changes: Partial<PayMethodRow>) =>
    setRows(rs => rs.map(r => (r.method === method ? { ...r, ...changes } : r)));

  const save = async (row: PayMethodRow) => {
    setBusy(row.method);
    const { error } = await supabase
      .from("payment_settings")
      .update({
        enabled: row.enabled,
        label: row.label,
        description: row.description,
        instructions: row.instructions,
        upi_vpa: row.upi_vpa,
        payee_name: row.payee_name,
        sort_order: Number(row.sort_order) || 0,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("method", row.method);
    setBusy(null);
    if (error) toast.error(error.message);
    else toast.success(`${(row.label || row.method).toUpperCase()} saved`);
  };

  const toggle = async (row: PayMethodRow, next: boolean) => {
    patch(row.method, { enabled: next });
    const { error } = await supabase
      .from("payment_settings")
      .update({ enabled: next, updated_at: new Date().toISOString() } as never)
      .eq("method", row.method);
    if (error) { patch(row.method, { enabled: !next }); toast.error(error.message); }
    else toast.success(`${(row.label || row.method).toUpperCase()} ${next ? "live on checkout" : "hidden"}`);
  };

  const remove = async (row: PayMethodRow) => {
    if (!confirm(`Delete payment method "${row.label || row.method}"?`)) return;
    const { error } = await supabase.from("payment_settings").delete().eq("method", row.method);
    if (error) toast.error(error.message);
    else { toast.success("Payment method deleted"); load(); }
  };

  const create = async () => {
    const slug = draft.method.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!slug) { toast.error("Enter an ID (e.g. netbanking)"); return; }
    if (!draft.label.trim()) { toast.error("Enter a display name"); return; }
    setBusy("__new");
    const { error } = await supabase.from("payment_settings").insert({
      method: slug,
      enabled: true,
      label: draft.label.trim(),
      description: draft.description.trim() || null,
      instructions: draft.instructions.trim() || null,
      upi_vpa: draft.upi_vpa.trim() || null,
      payee_name: draft.payee_name.trim() || null,
      sort_order: Number(draft.sort_order) || rows.length,
    } as never);
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Payment method added");
    setDraft(blank); setAdding(false); load();
  };

  if (loading) return <div className="py-16 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin text-gold" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-muted-foreground max-w-xl">
          Methods shown here appear on checkout in the order below. UPI details you enter are shown to the
          customer so the money lands directly in your account.
        </p>
        <button onClick={() => setAdding(a => !a)} className="inline-flex items-center gap-2 bg-ink text-primary-foreground px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] rounded-md hover:bg-gold hover:text-ink transition-colors">
          <Plus className="h-3.5 w-3.5" /> {adding ? "Cancel" : "Add Method"}
        </button>
      </div>

      {adding && (
        <div className="border-2 border-gold/40 rounded-xl p-5 bg-gold/5 grid md:grid-cols-2 gap-3 animate-fade-in">
          <F label="ID (slug)"><input className="input" value={draft.method} onChange={e => setDraft({ ...draft, method: e.target.value })} placeholder="netbanking" /></F>
          <F label="Display Name"><input className="input" value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} placeholder="Net Banking" /></F>
          <F label="Short Description"><input className="input" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} placeholder="All major Indian banks" /></F>
          <F label="Display Order"><input type="number" className="input" value={draft.sort_order} onChange={e => setDraft({ ...draft, sort_order: Number(e.target.value) as never })} /></F>
          <F label="UPI ID / VPA (optional)"><input className="input" value={draft.upi_vpa} onChange={e => setDraft({ ...draft, upi_vpa: e.target.value })} placeholder="dexter@okaxis" /></F>
          <F label="Payee Name (optional)"><input className="input" value={draft.payee_name} onChange={e => setDraft({ ...draft, payee_name: e.target.value })} placeholder="Dexter Mens Clothing" /></F>
          <div className="md:col-span-2">
            <F label="Instructions shown to customer"><textarea rows={2} className="input resize-none" value={draft.instructions} onChange={e => setDraft({ ...draft, instructions: e.target.value })} placeholder="Pay to the UPI ID above and enter the transaction reference." /></F>
          </div>
          <div className="md:col-span-2">
            <button disabled={busy === "__new"} onClick={create} className="inline-flex items-center gap-2 bg-gold text-ink px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] rounded-md font-bold disabled:opacity-60">
              {busy === "__new" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Create
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {rows.map(row => {
          const Icon = iconFor(row.method);
          return (
            <div key={row.method} className={`border-2 rounded-xl p-5 transition-colors ${row.enabled ? "border-gold/60 bg-gold/[0.04]" : "border-border bg-card opacity-80"}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full grid place-items-center ${row.enabled ? "bg-gold/20 text-gold" : "bg-muted text-muted-foreground"}`}><Icon className="h-5 w-5" /></div>
                  <div>
                    <p className="font-semibold text-sm">{row.label || row.method}</p>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground flex items-center gap-1"><GripVertical className="h-3 w-3" />#{row.sort_order} · {row.method}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggle(row, !row.enabled)} aria-pressed={row.enabled} className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${row.enabled ? "bg-gold" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${row.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                  <button onClick={() => remove(row)} className="h-9 w-9 grid place-items-center rounded-md border border-border text-red-cta hover:bg-red-cta hover:text-white transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mt-4">
                <F label="Display Name"><input className="input" value={row.label ?? ""} onChange={e => patch(row.method, { label: e.target.value })} /></F>
                <F label="Short Description"><input className="input" value={row.description ?? ""} onChange={e => patch(row.method, { description: e.target.value })} /></F>
                <F label="UPI ID / VPA"><input className="input" value={row.upi_vpa ?? ""} onChange={e => patch(row.method, { upi_vpa: e.target.value })} placeholder="dexter@okaxis" /></F>
                <F label="Payee Name"><input className="input" value={row.payee_name ?? ""} onChange={e => patch(row.method, { payee_name: e.target.value })} placeholder="Dexter Mens Clothing" /></F>
                <F label="Display Order"><input type="number" className="input" value={row.sort_order} onChange={e => patch(row.method, { sort_order: Number(e.target.value) })} /></F>
                <div className="md:col-span-2">
                  <F label="Instructions shown to customer"><textarea rows={2} className="input resize-none" value={row.instructions ?? ""} onChange={e => patch(row.method, { instructions: e.target.value })} /></F>
                </div>
              </div>

              <button disabled={busy === row.method} onClick={() => save(row)} className="mt-4 inline-flex items-center gap-2 bg-ink text-primary-foreground px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] rounded-md hover:bg-gold hover:text-ink transition-colors disabled:opacity-60">
                {busy === row.method ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
              </button>
            </div>
          );
        })}
        {rows.length === 0 && <p className="text-sm text-muted-foreground py-10 text-center">No payment methods yet — add one above.</p>}
      </div>
    </div>
  );
};

const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground block mb-1.5">{label}</label>
    {children}
  </div>
);

export default PaymentMethods;
