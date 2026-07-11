import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState, useMemo, Suspense } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { ArticleCard, type ArticleCardData } from "@/components/ArticleCard";

const articlesQuery = queryOptions({
  queryKey: ["articles-list"],
  queryFn: async () => {
    const [{ data: articles, error: e1 }, { data: cats, error: e2 }] = await Promise.all([
      supabase
        .from("articles")
        .select("id, slug, title, excerpt, content, cover_image_url, reading_time, published_at, category:categories(id, name, slug)")
        .eq("status", "published")
        .order("published_at", { ascending: false }),
      supabase.from("categories").select("id, name, slug").order("name"),
    ]);
    if (e1) throw e1;
    if (e2) throw e2;
    return { articles: articles ?? [], categories: cats ?? [] };
  },
});

export const Route = createFileRoute("/articles")({
  head: () => ({
    meta: [
      { title: "Artículos — Refactor Magazine" },
      { name: "description", content: "Todos los artículos de Refactor Magazine: programación, IA, backend, frontend, arquitectura y más." },
      { property: "og:title", content: "Artículos — Refactor Magazine" },
      { property: "og:description", content: "Todos los artículos de Refactor Magazine." },
      { property: "og:url", content: "/articles" },
    ],
    links: [{ rel: "canonical", href: "/articles" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(articlesQuery),
  component: ArticlesPage,
});

function ArticlesPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-glow">Biblioteca</span>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">Todos los artículos</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Filtra por categoría o busca por título y contenido. Escritos con
            profundidad técnica y estilo editorial.
          </p>
        </div>
        <Suspense fallback={<div className="py-16 text-center text-muted-foreground">Cargando…</div>}>
          <ArticlesGrid />
        </Suspense>
      </div>
    </SiteLayout>
  );
}

function ArticlesGrid() {
  const { data } = useSuspenseQuery(articlesQuery);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return data.articles.filter((a: any) => {
      if (cat && a.category?.slug !== cat) return false;
      if (query) {
        const q = query.toLowerCase();
        return a.title.toLowerCase().includes(q) || (a.excerpt ?? "").toLowerCase().includes(q) || (a.content ?? "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [data.articles, query, cat]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar artículos…"
            className="w-full rounded-full border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={cat === null} onClick={() => setCat(null)}>Todas</FilterChip>
          {data.categories.map((c: any) => (
            <FilterChip key={c.id} active={cat === c.slug} onClick={() => setCat(c.slug)}>
              {c.name}
            </FilterChip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card-gradient p-16 text-center text-muted-foreground">
          No hay artículos que coincidan con tu búsqueda.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <ArticleCard key={a.id} article={a as ArticleCardData} />
          ))}
        </div>
      )}
    </>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-glow"
          : "border-border bg-background/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
