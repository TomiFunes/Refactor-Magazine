import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { toast } from "sonner";
import { renderMarkdown, estimateReadingTime } from "@/lib/markdown";
import { ArrowLeft } from "lucide-react";

export interface ArticleForm {
  id?: string;
  title: string;
  title_en: string;
  slug: string;
  excerpt: string;
  excerpt_en: string;
  content: string;
  content_en: string;
  cover_image_url: string;
  category_id: string | null;
  author_id: string | null;
  status: "draft" | "published";
  featured: boolean;
  reading_time: number;
  published_at: string | null;
}

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function ArticleEditor({ initial, articleId }: { initial: ArticleForm; articleId?: string }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<ArticleForm>(initial);
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [authors, setAuthors] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [tab, setTab] = useState<"es" | "en">("es");

  useEffect(() => {
    supabase.from("categories").select("id, name").order("name").then(({ data }) => setCats(data ?? []));
    supabase.from("authors").select("id, name").order("name").then(({ data }) => setAuthors(data ?? []));
  }, []);

  async function save(publish?: boolean) {
    setSaving(true);
    const status = publish ? "published" : form.status;
    const payload = {
      title: form.title,
      title_en: form.title_en || null,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt || null,
      excerpt_en: form.excerpt_en || null,
      content: form.content,
      content_en: form.content_en || null,
      cover_image_url: form.cover_image_url || null,
      category_id: form.category_id || null,
      author_id: form.author_id || null,
      status,
      featured: form.featured,
      reading_time: form.reading_time || estimateReadingTime(form.content),
      published_at: status === "published" ? (form.published_at || new Date().toISOString()) : form.published_at,
    };
    let error;
    if (articleId) {
      ({ error } = await supabase.from("articles").update(payload).eq("id", articleId));
    } else {
      ({ error } = await supabase.from("articles").insert(payload));
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(publish ? "Publicado" : "Guardado");
    navigate({ to: "/admin" });
  }

  const rendered = preview ? renderMarkdown(form.content).html : "";

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Volver al panel
        </Link>

        <div className="mt-6 flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">
            {articleId ? "Editar artículo" : "Nuevo artículo"}
          </h1>
          <div className="flex gap-2">
            <button onClick={() => setPreview((p) => !p)} className="rounded-full border border-border px-4 py-2 text-sm">
              {preview ? "Editar" : "Vista previa"}
            </button>
            <button onClick={() => save(false)} disabled={saving} className="rounded-full border border-border px-4 py-2 text-sm">
              Guardar borrador
            </button>
            <button onClick={() => save(true)} disabled={saving} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
              Publicar
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })}
              placeholder="Título del artículo"
              className="w-full rounded-xl border border-border bg-input px-4 py-3 font-display text-2xl font-bold outline-none focus:border-primary"
            />
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              placeholder="slug-url"
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm font-mono outline-none focus:border-primary"
            />
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Extracto breve (aparece en tarjetas y SEO)"
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary"
            />
            {preview ? (
              <div className="prose-refactor min-h-[400px] rounded-xl border border-border bg-input p-6" dangerouslySetInnerHTML={{ __html: rendered }} />
            ) : (
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="# Empieza a escribir en Markdown…"
                rows={22}
                className="w-full rounded-xl border border-border bg-input px-4 py-3 font-mono text-sm leading-relaxed outline-none focus:border-primary"
              />
            )}
          </div>

          <aside className="space-y-4">
            <Panel title="Portada">
              <input
                value={form.cover_image_url}
                onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                placeholder="https://…"
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary"
              />
              {form.cover_image_url && (
                <img src={form.cover_image_url} alt="" className="mt-2 aspect-video w-full rounded-lg object-cover" />
              )}
            </Panel>
            <Panel title="Categoría">
              <select
                value={form.category_id ?? ""}
                onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">— Ninguna —</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Panel>
            <Panel title="Autor">
              <select
                value={form.author_id ?? ""}
                onChange={(e) => setForm({ ...form, author_id: e.target.value || null })}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">— Ninguno —</option>
                {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Panel>
            <Panel title="Tiempo de lectura (min)">
              <input
                type="number"
                min={1}
                value={form.reading_time}
                onChange={(e) => setForm({ ...form, reading_time: parseInt(e.target.value) || 1 })}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </Panel>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Artículo destacado
            </label>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card-gradient p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary-glow">{title}</div>
      {children}
    </div>
  );
}

const emptyForm: ArticleForm = {
  title: "", title_en: "", slug: "", excerpt: "", excerpt_en: "",
  content: "", content_en: "", cover_image_url: "",
  category_id: null, author_id: null, status: "draft", featured: false,
  reading_time: 5, published_at: null,
};

export const Route = createFileRoute("/_authenticated/admin/new")({
  component: () => <ArticleEditor initial={emptyForm} />,
});
