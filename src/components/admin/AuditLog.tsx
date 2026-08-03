import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, ShieldCheck, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

type AuditRow = {
  id: string;
  table_name: string;
  action: string;
  record_id: string | null;
  actor_id: string | null;
  actor_email: string | null;
  summary: string | null;
  created_at: string;
};

const ACTIONS = ["ALL", "INSERT", "UPDATE", "DELETE"] as const;

const actionStyles: Record<string, string> = {
  INSERT: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  UPDATE: "bg-primary/15 text-primary border-primary/30",
  DELETE: "bg-destructive/15 text-destructive border-destructive/30",
};

const label = (a: string) => (a === "INSERT" ? "Created" : a === "UPDATE" ? "Updated" : "Deleted");

const AuditLog = () => {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<(typeof ACTIONS)[number]>("ALL");
  const [q, setQ] = useState("");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("audit_logs")
      .select("id, table_name, action, record_id, actor_id, actor_email, summary, created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    setRows((data as AuditRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => setSessionEmail(data.user?.email ?? null));
    const ch = supabase
      .channel("a-audit")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "audit_logs" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (action === "ALL" || r.action === action) &&
        (!term ||
          r.table_name.toLowerCase().includes(term) ||
          (r.summary ?? "").toLowerCase().includes(term) ||
          (r.actor_email ?? "").toLowerCase().includes(term)),
    );
  }, [rows, action, q]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Signed in as <span className="text-foreground">{sessionEmail ?? "unknown session"}</span>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {ACTIONS.map((a) => (
          <Button
            key={a}
            size="sm"
            variant={action === a ? "default" : "outline"}
            className="text-[11px] uppercase tracking-[0.18em]"
            onClick={() => setAction(a)}
          >
            {a === "ALL" ? "All" : label(a)}
          </Button>
        ))}
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search section, item or user…"
          className="h-9 w-full sm:w-64"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading activity…
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">No activity recorded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-secondary/50 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">When</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Section</th>
                <th className="px-4 py-3 text-left">Item</th>
                <th className="px-4 py-3 text-left">User session</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border/60 hover:bg-secondary/30">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {new Date(r.created_at).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={actionStyles[r.action] ?? ""}>
                      {label(r.action)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 capitalize">{r.table_name.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">
                    <span className="block max-w-[220px] truncate">{r.summary ?? "—"}</span>
                    <span className="text-[11px] text-muted-foreground">{r.record_id?.slice(0, 8) ?? ""}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <UserCircle2 className="h-3.5 w-3.5" />
                      {r.actor_email ?? (r.actor_id ? r.actor_id.slice(0, 8) : "Guest / system")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLog;
