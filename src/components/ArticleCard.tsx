import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { useLang, pickLocalized, formatDate } from "@/lib/i18n";

export interface ArticleCardData {
  id: string;
  slug: string;
  title: string;
  title_en?: string | null;
  excerpt: string | null;
  excerpt_en?: string | null;
  cover_image_url: string | null;
  reading_time: number;
  published_at: string | null;
  category?: { name: string; name_en?: string | null; slug: string } | null;
}

export function ArticleCard({ article, featured }: { article: ArticleCardData; featured?: boolean }) {
  const { lang, t } = useLang();
  const title = pickLocalized(lang, article.title, article.title_en);
  const excerpt = pickLocalized(lang, article.excerpt, article.excerpt_en);
  const catName = article.category
    ? pickLocalized(lang, article.category.name, article.category.name_en)
    : null;

  return (
    <Link
      to="/articles/$slug"
      params={{ slug: article.slug }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card-gradient shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow ${featured ? "md:col-span-2 md:flex-row" : ""}`}
    >
      <div className={`relative overflow-hidden ${featured ? "md:w-1/2" : "aspect-[16/10]"}`}>
        {article.cover_image_url ? (
          <img
            src={article.cover_image_url}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-accent/40">
            <span className="font-display text-4xl text-primary-glow/60">R</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {catName && (
            <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-medium text-primary-glow">
              {catName}
            </span>
          )}
          <span>{formatDate(article.published_at, lang)}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.reading_time} {t("card_minutes")}</span>
        </div>
        <h3 className={`font-display font-bold leading-tight text-foreground transition-colors group-hover:text-primary-glow ${featured ? "text-2xl md:text-3xl" : "text-xl"}`}>
          {title}
        </h3>
        {excerpt && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{excerpt}</p>
        )}
        <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary-glow">
          {t("card_read_more")} <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}
