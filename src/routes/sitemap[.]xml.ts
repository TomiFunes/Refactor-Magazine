import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths = ["/", "/articles", "/about", "/contact"];
        let dynamicPaths: string[] = [];
        try {
          const url = process.env.SUPABASE_URL!;
          const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
          const supa = createClient(url, key, { auth: { persistSession: false } });
          const { data } = await supa
            .from("articles")
            .select("slug")
            .eq("status", "published")
            .order("published_at", { ascending: false });
          dynamicPaths = (data ?? []).map((r: any) => `/articles/${r.slug}`);
        } catch {}
        const all = [...staticPaths, ...dynamicPaths];
        const urls = all.map((p) => `  <url><loc>${BASE_URL}${p}</loc></url>`).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
