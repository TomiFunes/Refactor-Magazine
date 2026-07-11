import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, LogOut, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminDashboard,
});

interface Row {
  id: string;
  title: string;
  slug: string;
  status: string;
  featured: boolean;
  published_at: string | null;
  updated_at: string;
  category: { name: string } | null;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  async function load() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    const admin = !!roleData;
    setIsAdmin(admin);
    if (!admin) return;
    const { data, error } = await supabase
      .from("articles")
      .select("id, title, slug, status, featured, published_at, updated_at, category:categories(name)")
      .order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRows((data ?? []) as Row[]);
  }
  useEffect(() => { load(); }, []);

  async function onDelete(id: string) {
    if (!confirm("¿Borrar este artículo?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Artículo borrado");
    load();
  }

  async function onLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (isAdmin === false) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-primary-glow" />
          <h1 className="mt-4 font-display text-3xl font-bold">Sin permisos de administrador</h1>
          <p className="mt-3 text-muted-foreground">
            Tu cuenta está autenticada pero no tiene el rol <code className="rounded bg-muted px-1.5 py-0.5">admin</code>.
            Pide a un administrador que te añada a la tabla <code className="rounded bg-muted px-1.5 py-0.5">user_roles</code> con rol <code>admin</code>.
          </p>
          <button onClick={onLogout} className="mt-6 rounded-full border border-border px-5 py-2 text-sm">
            Cerrar sesión
          </button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-glow">Panel</span>
            <h1 className="font-display text-3xl font-bold">Artículos</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/new" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
              <Plus className="h-4 w-4" /> Nuevo
            </Link>
            <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </div>
        </div>

        {rows === null ? (
          <div className="py-12 text-center text-muted-foreground">Cargando…</div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card-gradient p-12 text-center text-muted-foreground">
            Aún no hay artículos. Crea el primero.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card-gradient">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 text-left text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="p-4">Título</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Actualizado</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/40 last:border-0">
                    <td className="p-4">
                      <div className="font-medium">{r.title} {r.featured && <span className="ml-1 text-primary-glow">★</span>}</div>
                      <div className="text-xs text-muted-foreground">/{r.slug}</div>
                    </td>
                    <td className="p-4 text-muted-foreground">{r.category?.name ?? "—"}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "published" ? "bg-primary/20 text-primary-glow" : "bg-muted text-muted-foreground"}`}>
                        {r.status === "published" ? "Publicado" : "Borrador"}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(r.updated_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Link to="/admin/edit/$id" params={{ id: r.id }} className="rounded-lg border border-border p-2 hover:border-primary hover:text-primary-glow">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button onClick={() => onDelete(r.id)} className="rounded-lg border border-border p-2 hover:border-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
