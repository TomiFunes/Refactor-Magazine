import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArticleEditor, type ArticleForm } from "./admin.new";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/_authenticated/admin/edit/$id")({
  component: EditArticle,
});

function EditArticle() {
  const { id } = Route.useParams();
  const [initial, setInitial] = useState<ArticleForm | null>(null);

  useEffect(() => {
    supabase.from("articles").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (!data) return;
      setInitial({
        title: data.title ?? "",
        slug: data.slug ?? "",
        excerpt: data.excerpt ?? "",
        content: data.content ?? "",
        cover_image_url: data.cover_image_url ?? "",
        category_id: data.category_id,
        author_id: data.author_id,
        status: (data.status as "draft" | "published") ?? "draft",
        featured: data.featured,
        reading_time: data.reading_time ?? 5,
        published_at: data.published_at,
      });
    });
  }, [id]);

  if (!initial) return <SiteLayout><div className="py-24 text-center text-muted-foreground">Cargando…</div></SiteLayout>;
  return <ArticleEditor initial={initial} articleId={id} />;
}
