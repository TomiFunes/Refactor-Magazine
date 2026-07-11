import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";

export function Newsletter() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    setLoading(false);
    if (error) {
      if (error.code === "23505") toast.info(t("newsletter_already"));
      else toast.error(t("newsletter_error"));
      return;
    }
    toast.success(t("newsletter_success"));
    setEmail("");
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card-gradient p-10 shadow-card md:p-16">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative">
          <span className="text-xs font-medium uppercase tracking-widest text-primary-glow">{t("newsletter_eyebrow")}</span>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">{t("newsletter_title")}</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">{t("newsletter_subtitle")}</p>
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletter_email_placeholder")}
              className="flex-1 rounded-full border border-border bg-input px-5 py-3 text-sm outline-none transition-colors focus:border-primary"
            />
            <button
              disabled={loading}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? t("newsletter_subscribing") : t("newsletter_subscribe")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
