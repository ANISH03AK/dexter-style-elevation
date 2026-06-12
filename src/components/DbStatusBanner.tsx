import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DbStatusBanner = () => {
  const [status, setStatus] = useState<"checking" | "ok" | "down">("checking");

  useEffect(() => {
    let alive = true;
    const ping = async () => {
      try {
        const { error } = await supabase.from("payment_settings").select("method").limit(1);
        if (!alive) return;
        setStatus(error ? "down" : "ok");
      } catch {
        if (alive) setStatus("down");
      }
    };
    ping();
    const t = setInterval(ping, 30000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const dot =
    status === "ok" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
    : status === "down" ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
    : "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]";

  const label =
    status === "ok" ? "Database Connected"
    : status === "down" ? "Database Disconnected"
    : "Checking…";

  return (
    <div className="fixed bottom-3 left-3 z-[60] flex items-center gap-2 rounded-full bg-black/80 text-white text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 backdrop-blur border border-white/10 shadow-lg pointer-events-none">
      <span className={`inline-block h-2 w-2 rounded-full ${dot} animate-pulse`} />
      {label}
    </div>
  );
};

export default DbStatusBanner;
