import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { ArticleCard, type ArticleCardData } from "@/components/ArticleCard";
import { Newsletter } from "@/components/Newsletter";
import heroDesk from "@/assets/hero-desk.jpg";
import logoAsset from "@/assets/logo.png.asset.json";
import { useLang } from "@/lib/i18n";

const homeArticlesQuery = queryOptions({
  queryKey: ["home-articles"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("id, slug, title, title_en, excerpt, excerpt_en, cover_image_url, reading_time, published_at, featured, category:categories(name, name_en, slug)")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(9);
    if (error) throw error;
    return (data ?? []) as (ArticleCardData & { featured: boolean })[];
  },
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeArticlesQuery),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <Hero />
      <Suspense fallback={<div className="py-24 text-center text-muted-foreground">…</div>}>
        <FeaturedAndLatest />
      </Suspense>
      <Newsletter />
    </SiteLayout>
  );
}

function Hero() {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-primary/25 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-40 h-96 w-96 rounded-full bg-primary-glow/20 blur-[120px]" />
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-32">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <img src={logoAsset.url} alt="Refactor Magazine" className="h-16 w-auto" />
          <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-glow">
            <Sparkles className="h-3 w-3" /> {t("home_badge")}
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            {t("home_title_1")}{" "}
            <span className="text-gradient">{t("home_title_2")}</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">{t("home_subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/articles"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105"
            >
              {t("home_cta_explore")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center rounded-full border border-border bg-background/40 px-6 py-3 text-sm font-medium backdrop-blur transition hover:border-primary/50 hover:text-primary-glow"
            >
              {t("home_cta_about")}
            </Link>
          </div>
        </div>
        <div className="relative animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/30 to-primary-glow/10 blur-2xl" />
          <img
            src={heroDesk}
            width={1600}
            height={1200}
            alt={t("home_hero_alt")}
            className="relative aspect-[4/3] w-full rounded-3xl border border-border/60 object-cover shadow-glow"
          />
        </div>
      </div>
    </section>
  );
}

function FeaturedAndLatest() {
  const { t } = useLang();
  const { data } = useSuspenseQuery(homeArticlesQuery);
  const featured = data.filter((a) => a.featured).slice(0, 3);
  const latest = data.slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {featured.length > 0 && (
        <section className="mb-20">
          <SectionHeading eyebrow={t("home_featured_eyebrow")} title={t("home_featured_title")} />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {featured.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
      <section>
        <div className="flex items-end justify-between">
          <SectionHeading eyebrow={t("home_latest_eyebrow")} title={t("home_latest_title")} />
          <Link to="/articles" className="hidden text-sm font-medium text-primary-glow hover:underline md:inline">
            {t("home_view_all")}
          </Link>
        </div>
        {latest.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-border/60 bg-card-gradient p-12 text-center text-muted-foreground">
            {t("home_empty")}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-primary-glow">{eyebrow}</span>
      <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">{title}</h2>
    </div>
  );
}
