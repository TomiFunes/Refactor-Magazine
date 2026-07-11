import { createFileRoute } from "@tanstack/react-router";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Sobre mí — Refactor Magazine" },
      { name: "description", content: "Sobre el autor de Refactor Magazine: experiencia, tecnologías favoritas y trayectoria profesional." },
      { property: "og:title", content: "Sobre mí — Refactor Magazine" },
      { property: "og:description", content: "El autor detrás de Refactor Magazine." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const stack = [
  "TypeScript", "React", "Next.js", "Node.js", "Python", "PostgreSQL",
  "Docker", "AWS", "Kubernetes", "LangChain", "OpenAI", "Tailwind CSS",
];

function AboutPage() {
  const { t } = useLang();
  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-6 py-20">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary-glow">{t("about_eyebrow")}</span>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          {t("about_title_1")} <span className="text-gradient">{t("about_title_2")}</span>.
        </h1>

        <div className="mt-12 grid gap-10 md:grid-cols-[220px_1fr]">
          <div>
            <div className="aspect-square w-full rounded-2xl border border-border/60 bg-gradient-to-br from-primary/30 to-primary-glow/10 shadow-card">
              <div className="flex h-full items-center justify-center font-display text-6xl text-primary-glow/70">R</div>
            </div>
            <div className="mt-4 flex gap-2">
              <a href="https://github.com" target="_blank" rel="noopener" aria-label="GitHub" className="rounded-full border border-border p-2 text-muted-foreground hover:border-primary hover:text-primary-glow"><Github className="h-4 w-4" /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn" className="rounded-full border border-border p-2 text-muted-foreground hover:border-primary hover:text-primary-glow"><Linkedin className="h-4 w-4" /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter" className="rounded-full border border-border p-2 text-muted-foreground hover:border-primary hover:text-primary-glow"><Twitter className="h-4 w-4" /></a>
              <a href="mailto:hola@refactor.magazine" aria-label="Email" className="rounded-full border border-border p-2 text-muted-foreground hover:border-primary hover:text-primary-glow"><Mail className="h-4 w-4" /></a>
            </div>
          </div>

          <div className="space-y-5 text-lg text-muted-foreground">
            <p>{t("about_p1")}</p>
            <p>
              {t("about_p2_pre")}<strong className="text-foreground">{t("about_p2_strong")}</strong>{t("about_p2_post")}
            </p>
            <p>{t("about_p3")}</p>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold">{t("about_stack")}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {stack.map((s) => (
              <span key={s} className="rounded-full border border-border bg-background/40 px-3 py-1 text-sm text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            { k: "10+", v: t("about_stat_1") },
            { k: "50+", v: t("about_stat_2") },
            { k: "∞", v: t("about_stat_3") },
          ].map((s) => (
            <div key={s.v} className="rounded-2xl border border-border/60 bg-card-gradient p-6">
              <div className="font-display text-3xl font-bold text-gradient">{s.k}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
