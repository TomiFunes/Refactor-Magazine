import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Github, Linkedin, Mail } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contacto — Refactor Magazine" },
      { name: "description", content: "Ponte en contacto con Refactor Magazine. Colaboraciones, proyectos y preguntas." },
      { property: "og:title", content: "Contacto — Refactor Magazine" },
      { property: "og:description", content: "Ponte en contacto con Refactor Magazine." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert(form);
    setLoading(false);
    if (error) return toast.error("No pudimos enviar tu mensaje.");
    toast.success("Mensaje enviado. Te responderé pronto.");
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-16 md:grid-cols-2 md:items-start">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-glow">Contacto</span>
            <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
              Hablemos.
            </h1>
            <p className="mt-4 text-muted-foreground">
              ¿Colaboración, feedback, propuesta o simplemente saludar?
              Escríbeme y te responderé personalmente.
            </p>
            <div className="mt-8 space-y-4 text-sm">
              <a href="mailto:hola@refactor.magazine" className="flex items-center gap-3 text-muted-foreground transition hover:text-foreground">
                <Mail className="h-5 w-5 text-primary-glow" /> hola@refactor.magazine
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener" className="flex items-center gap-3 text-muted-foreground transition hover:text-foreground">
                <Linkedin className="h-5 w-5 text-primary-glow" /> linkedin.com/in/refactor
              </a>
              <a href="https://github.com" target="_blank" rel="noopener" className="flex items-center gap-3 text-muted-foreground transition hover:text-foreground">
                <Github className="h-5 w-5 text-primary-glow" /> github.com/refactor
              </a>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border/60 bg-card-gradient p-6 shadow-card">
            <Field label="Nombre">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary" />
            </Field>
            <Field label="Email">
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary" />
            </Field>
            <Field label="Asunto">
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary" />
            </Field>
            <Field label="Mensaje">
              <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full resize-none rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary" />
            </Field>
            <button disabled={loading} className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50">
              {loading ? "Enviando…" : "Enviar mensaje"}
            </button>
          </form>
        </div>
      </div>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
