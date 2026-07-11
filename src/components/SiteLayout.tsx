import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import type { ReactNode } from "react";
import logoAsset from "@/assets/logo.png.asset.json";

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      activeProps={{ className: "text-foreground" }}
    >
      {children}
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoAsset.url} alt="Refactor Magazine" className="h-8 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/articles">Artículos</NavLink>
          <NavLink to="/about">Sobre mí</NavLink>
          <NavLink to="/contact">Contacto</NavLink>
        </nav>
        <Link
          to="/articles"
          className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:scale-105"
        >
          Explorar
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-3">
        <div>
          <img src={logoAsset.url} alt="Refactor Magazine" className="h-8 w-auto" />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Ideas que transforman código en conocimiento. Programación, IA,
            arquitectura de software y tecnología.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Navegación</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/articles" className="hover:text-foreground">Artículos</Link></li>
            <li><Link to="/about" className="hover:text-foreground">Sobre mí</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contacto</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Conecta</h4>
          <div className="mt-3 flex gap-3">
            <a href="https://github.com" target="_blank" rel="noopener" aria-label="GitHub" className="rounded-full border border-border p-2 text-muted-foreground transition hover:border-primary hover:text-primary-glow"><Github className="h-4 w-4" /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn" className="rounded-full border border-border p-2 text-muted-foreground transition hover:border-primary hover:text-primary-glow"><Linkedin className="h-4 w-4" /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter" className="rounded-full border border-border p-2 text-muted-foreground transition hover:border-primary hover:text-primary-glow"><Twitter className="h-4 w-4" /></a>
            <a href="mailto:hola@refactor.magazine" aria-label="Email" className="rounded-full border border-border p-2 text-muted-foreground transition hover:border-primary hover:text-primary-glow"><Mail className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Refactor Magazine. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-hero">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
