import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { SiteLayout } from "@/components/SiteLayout";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso — Refactor Magazine" },
      { name: "description", content: "Panel privado de Refactor Magazine." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success(t("auth_account_created"));
      setMode("signin");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return toast.error(error.message);
      navigate({ to: "/admin" });
    }
  }

  async function onGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error(t("auth_google_error"));
  }

  return (
    <SiteLayout>
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-6 py-16">
        <div className="w-full rounded-2xl border border-border/60 bg-card-gradient p-8 shadow-card">
          <h1 className="font-display text-3xl font-bold">
            {mode === "signin" ? t("auth_signin") : t("auth_signup")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("auth_subtitle")}</p>

          <button
            onClick={onGoogle}
            className="mt-6 w-full rounded-full border border-border bg-background/40 py-2.5 text-sm font-medium transition hover:border-primary/60"
          >
            {t("auth_google")}
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> {t("auth_or")} <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth_email")}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth_password")}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button disabled={loading} className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
              {loading ? "…" : mode === "signin" ? t("auth_do_signin") : t("auth_do_signup")}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? t("auth_toggle_to_signup") : t("auth_toggle_to_signin")}
          </button>
        </div>
      </div>
    </SiteLayout>
  );
}
