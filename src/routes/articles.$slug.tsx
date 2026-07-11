import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { Clock, ArrowLeft, Twitter, Linkedin, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { renderMarkdown } from "@/lib/markdown";
import { toast } from "sonner";
import { useLang, pickLocalized, formatDate } from "@/lib/i18n";

function articleQuery(slug: string) {
  return queryOptions({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, title, title_en, excerpt, excerpt_en, content, content_en, cover_image_url, reading_time, published_at, category:categories(name, name_en, slug), author:authors(name, slug, avatar_url, bio)")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });
}

export const Route = createFileRoute("/articles/$slug")({
  loader: ({ params, context }) => context.queryClient.ensureQueryData(articleQuery(params.slug)),
  head: ({ params, loaderData }) => {
    const a = loaderData as any;
    const title = a?.title ? `${a.title} — Refactor Magazine` : "Artículo — Refactor Magazine";
    const desc = a?.excerpt ?? "Artículo de Refactor Magazine";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/articles/${params.slug}` },
        ...(a?.cover_image_url ? [{ property: "og:image", content: a.cover_image_url }] : []),
      ],
      links: [{ rel: "canonical", href: `/articles/${params.slug}` }],
    };
  },
  component: ArticleDetail,
  notFoundComponent: SlugNotFound,
});

function SlugNotFound() {
  const { t } = useLang();
  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="text-3xl font-bold">{t("article_not_found")}</h1>
        <Link to="/articles" className="mt-6 inline-block text-primary-glow hover:underline">{t("article_see_all")}</Link>
      </div>
    </SiteLayout>
  );
}

function ArticleDetail() {
  return (
    <SiteLayout>
      <Suspense fallback={<div className="py-32 text-center text-muted-foreground">…</div>}>
        <ArticleContent />
      </Suspense>
    </SiteLayout>
  );
}

function ArticleContent() {
  const { slug } = Route.useParams();
  const { data: a } = useSuspenseQuery(articleQuery(slug));
  const { lang, t } = useLang();

  const title = pickLocalized(lang, a.title, a.title_en);
  const excerpt = pickLocalized(lang, a.excerpt, a.excerpt_en);
  const content = pickLocalized(lang, a.content, a.content_en);
  const catName = a.category ? pickLocalized(lang, a.category.name, a.category.name_en) : null;
  const { html, toc } = renderMarkdown(content || "");
  const date = formatDate(a.published_at, lang, { year: "numeric", month: "long", day: "numeric" });
  const url = typeof window !== "undefined" ? window.location.href : "";

  return (
    <article>
      <div className="relative">
        {a.cover_image_url && (
          <div className="absolute inset-0 h-[60vh] overflow-hidden">
            <img src={a.cover_image_url} alt={title} className="h-full w-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          </div>
        )}
        <div className="relative mx-auto max-w-3xl px-6 pb-12 pt-16 md:pt-24">
          <Link to="/articles" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {t("article_back")}
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {catName && (
              <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-glow">
                {catName}
              </span>
            )}
            <span>{date}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{a.reading_time} {t("article_reading_time")}</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.1] md:text-5xl">
            {title}
          </h1>
          {excerpt && <p className="mt-4 text-lg text-muted-foreground">{excerpt}</p>}
          {a.author && (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow font-display font-bold">
                {a.author.name?.[0]?.toUpperCase() ?? "R"}
              </div>
              <div>
                <div className="text-sm font-medium">{a.author.name}</div>
                <div className="text-xs text-muted-foreground">{t("article_author")}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {a.cover_image_url && (
        <div className="mx-auto max-w-4xl px-6">
          <img src={a.cover_image_url} alt={title} className="w-full rounded-2xl border border-border/60 shadow-card" />
        </div>
      )}

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1fr_260px]">
        <div className="prose-refactor min-w-0" dangerouslySetInnerHTML={{ __html: html }} />
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            {toc.length > 0 && (
              <div className="rounded-2xl border border-border/60 bg-card-gradient p-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-primary-glow">{t("article_toc")}</div>
                <ul className="mt-3 space-y-2 text-sm">
                  {toc.filter((tt) => tt.level <= 3).map((tt) => (
                    <li key={tt.id} style={{ paddingLeft: `${(tt.level - 1) * 12}px` }}>
                      <a href={`#${tt.id}`} className="text-muted-foreground transition hover:text-primary-glow">
                        {tt.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-6 rounded-2xl border border-border/60 bg-card-gradient p-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-primary-glow">{t("article_share")}</div>
              <div className="mt-3 flex gap-2">
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener" aria-label="Twitter" className="rounded-full border border-border p-2 hover:border-primary hover:text-primary-glow"><Twitter className="h-4 w-4" /></a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener" aria-label="LinkedIn" className="rounded-full border border-border p-2 hover:border-primary hover:text-primary-glow"><Linkedin className="h-4 w-4" /></a>
                <button
                  onClick={() => { navigator.clipboard.writeText(url); toast.success(t("article_link_copied")); }}
                  aria-label="Copy link"
                  className="rounded-full border border-border p-2 hover:border-primary hover:text-primary-glow"
                >
                  <Link2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
