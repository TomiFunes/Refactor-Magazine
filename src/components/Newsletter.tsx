import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    setLoading(false);
    if (error) {
      if (error.code === "23505") toast.info("Ya estás suscrito. ¡Gracias!");
      else toast.error("No pudimos suscribirte. Intenta más tarde.");
      return;
    }
    toast.success("¡Suscripción confirmada! Nos vemos en tu bandeja.");
    setEmail("");
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card-gradient p-10 shadow-card md:p-16">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative">
          <span className="text-xs font-medium uppercase tracking-widest text-primary-glow">Newsletter</span>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Ideas nuevas cada semana</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Recibe los mejores artículos sobre programación, IA y arquitectura
            directamente en tu bandeja. Sin spam, cancelas cuando quieras.
          </p>
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="flex-1 rounded-full border border-border bg-input px-5 py-3 text-sm outline-none transition-colors focus:border-primary"
            />
            <button
              disabled={loading}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? "Suscribiendo…" : "Suscribirme"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
