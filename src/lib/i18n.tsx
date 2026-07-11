import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "es" | "en";

const STORAGE_KEY = "refactor-lang";

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict.es) => string;
}

const LangCtx = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start with "es" to avoid SSR/hydration mismatch, then sync from localStorage.
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "es") setLangState(stored);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { window.localStorage.setItem(STORAGE_KEY, l); } catch {}
  };

  const t = (key: keyof typeof dict.es) => dict[lang][key] ?? dict.es[key];

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

/** Return the English value when lang is "en" and it is non-empty; else fallback to the base. */
export function pickLocalized(lang: Lang, base: string | null | undefined, en: string | null | undefined) {
  if (lang === "en" && en && en.trim().length > 0) return en;
  return base ?? "";
}

export function formatDate(iso: string | null, lang: Lang, opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(lang === "en" ? "en-US" : "es-ES", opts);
}

export const dict = {
  es: {
    // Nav
    nav_home: "Inicio",
    nav_articles: "Artículos",
    nav_about: "Sobre mí",
    nav_contact: "Contacto",
    nav_explore: "Explorar",
    // Footer
    footer_tagline: "Ideas que transforman código en conocimiento. Programación, IA, arquitectura de software y tecnología.",
    footer_nav: "Navegación",
    footer_connect: "Conecta",
    footer_rights: "Todos los derechos reservados.",
    // Home
    home_badge: "Portfolio editorial de tecnología",
    home_title_1: "Ideas que transforman",
    home_title_2: "código en conocimiento.",
    home_subtitle: "Artículos sobre programación, inteligencia artificial, arquitectura de software y tecnología — escritos con obsesión por la claridad.",
    home_cta_explore: "Explorar artículos",
    home_cta_about: "Sobre el autor",
    home_hero_alt: "Escritorio de programación con luces violetas",
    home_featured_eyebrow: "Destacados",
    home_featured_title: "Artículos que marcaron la diferencia",
    home_latest_eyebrow: "Últimos publicados",
    home_latest_title: "Lo más reciente",
    home_view_all: "Ver todos →",
    home_empty: "Aún no hay artículos publicados. Vuelve pronto.",
    // Articles list
    articles_eyebrow: "Biblioteca",
    articles_title: "Todos los artículos",
    articles_subtitle: "Filtra por categoría o busca por título y contenido. Escritos con profundidad técnica y estilo editorial.",
    articles_search_placeholder: "Buscar artículos…",
    articles_filter_all: "Todas",
    articles_empty: "No hay artículos que coincidan con tu búsqueda.",
    // Article card
    card_read_more: "Leer más",
    card_minutes: "min",
    // Article detail
    article_back: "Volver",
    article_reading_time: "min de lectura",
    article_author: "Autor",
    article_toc: "Contenido",
    article_share: "Compartir",
    article_link_copied: "Enlace copiado",
    article_not_found: "Artículo no encontrado",
    article_see_all: "← Ver todos los artículos",
    // About
    about_eyebrow: "Sobre mí",
    about_title_1: "Ingeniero de software escribiendo",
    about_title_2: "en voz alta",
    about_p1: "Soy desarrollador de software con más de una década construyendo productos digitales — desde APIs de alto rendimiento hasta interfaces obsesivamente cuidadas. Escribo sobre lo que aprendo en el camino.",
    about_p2_pre: "",
    about_p2_strong: "Refactor Magazine",
    about_p2_post: " es mi espacio para pensar en público: notas técnicas, patrones de arquitectura, experimentos con IA y reflexiones sobre la disciplina de construir.",
    about_p3: "Creo que el código es una forma de escritura y que refactorizar — nuestros sistemas y también nuestras ideas — es el trabajo más importante.",
    about_stack: "Stack favorito",
    about_stat_1: "años en la industria",
    about_stat_2: "proyectos entregados",
    about_stat_3: "curiosidad técnica",
    // Contact
    contact_eyebrow: "Contacto",
    contact_title: "Hablemos.",
    contact_subtitle: "¿Colaboración, feedback, propuesta o simplemente saludar? Escríbeme y te responderé personalmente.",
    contact_field_name: "Nombre",
    contact_field_email: "Email",
    contact_field_subject: "Asunto",
    contact_field_message: "Mensaje",
    contact_send: "Enviar mensaje",
    contact_sending: "Enviando…",
    contact_error: "No pudimos enviar tu mensaje.",
    contact_success: "Mensaje enviado. Te responderé pronto.",
    // Newsletter
    newsletter_eyebrow: "Newsletter",
    newsletter_title: "Ideas nuevas cada semana",
    newsletter_subtitle: "Recibe los mejores artículos sobre programación, IA y arquitectura directamente en tu bandeja. Sin spam, cancelas cuando quieras.",
    newsletter_email_placeholder: "tu@email.com",
    newsletter_subscribe: "Suscribirme",
    newsletter_subscribing: "Suscribiendo…",
    newsletter_already: "Ya estás suscrito. ¡Gracias!",
    newsletter_error: "No pudimos suscribirte. Intenta más tarde.",
    newsletter_success: "¡Suscripción confirmada! Nos vemos en tu bandeja.",
    // Auth
    auth_signin: "Acceso",
    auth_signup: "Crear cuenta",
    auth_subtitle: "Panel privado de Refactor Magazine.",
    auth_google: "Continuar con Google",
    auth_or: "o",
    auth_email: "Email",
    auth_password: "Contraseña",
    auth_do_signin: "Iniciar sesión",
    auth_do_signup: "Crear cuenta",
    auth_toggle_to_signup: "¿No tienes cuenta? Regístrate",
    auth_toggle_to_signin: "¿Ya tienes cuenta? Inicia sesión",
    auth_account_created: "Cuenta creada. Ya puedes iniciar sesión.",
    auth_google_error: "No se pudo iniciar sesión con Google.",
  },
  en: {
    nav_home: "Home",
    nav_articles: "Articles",
    nav_about: "About",
    nav_contact: "Contact",
    nav_explore: "Explore",
    footer_tagline: "Ideas that turn code into knowledge. Programming, AI, software architecture and technology.",
    footer_nav: "Navigation",
    footer_connect: "Connect",
    footer_rights: "All rights reserved.",
    home_badge: "Editorial tech portfolio",
    home_title_1: "Ideas that turn",
    home_title_2: "code into knowledge.",
    home_subtitle: "Articles on programming, artificial intelligence, software architecture and technology — written with an obsession for clarity.",
    home_cta_explore: "Explore articles",
    home_cta_about: "About the author",
    home_hero_alt: "Programming desk with violet lights",
    home_featured_eyebrow: "Featured",
    home_featured_title: "Articles that made a difference",
    home_latest_eyebrow: "Latest posts",
    home_latest_title: "Most recent",
    home_view_all: "View all →",
    home_empty: "No articles published yet. Come back soon.",
    articles_eyebrow: "Library",
    articles_title: "All articles",
    articles_subtitle: "Filter by category or search by title and content. Written with technical depth and editorial style.",
    articles_search_placeholder: "Search articles…",
    articles_filter_all: "All",
    articles_empty: "No articles match your search.",
    card_read_more: "Read more",
    card_minutes: "min",
    article_back: "Back",
    article_reading_time: "min read",
    article_author: "Author",
    article_toc: "Contents",
    article_share: "Share",
    article_link_copied: "Link copied",
    article_not_found: "Article not found",
    article_see_all: "← See all articles",
    about_eyebrow: "About",
    about_title_1: "Software engineer thinking",
    about_title_2: "out loud",
    about_p1: "I'm a software developer with over a decade building digital products — from high-performance APIs to obsessively polished interfaces. I write about what I learn along the way.",
    about_p2_pre: "",
    about_p2_strong: "Refactor Magazine",
    about_p2_post: " is my space to think in public: technical notes, architecture patterns, AI experiments and reflections on the craft of building.",
    about_p3: "I believe code is a form of writing, and that refactoring — our systems and also our ideas — is the most important work.",
    about_stack: "Favorite stack",
    about_stat_1: "years in the industry",
    about_stat_2: "projects shipped",
    about_stat_3: "technical curiosity",
    contact_eyebrow: "Contact",
    contact_title: "Let's talk.",
    contact_subtitle: "Collaboration, feedback, a proposal, or just to say hi? Write to me and I'll reply personally.",
    contact_field_name: "Name",
    contact_field_email: "Email",
    contact_field_subject: "Subject",
    contact_field_message: "Message",
    contact_send: "Send message",
    contact_sending: "Sending…",
    contact_error: "We couldn't send your message.",
    contact_success: "Message sent. I'll reply soon.",
    newsletter_eyebrow: "Newsletter",
    newsletter_title: "Fresh ideas every week",
    newsletter_subtitle: "Get the best articles on programming, AI and architecture straight to your inbox. No spam, unsubscribe anytime.",
    newsletter_email_placeholder: "you@email.com",
    newsletter_subscribe: "Subscribe",
    newsletter_subscribing: "Subscribing…",
    newsletter_already: "You're already subscribed. Thanks!",
    newsletter_error: "We couldn't subscribe you. Try again later.",
    newsletter_success: "Subscription confirmed! See you in your inbox.",
    auth_signin: "Sign in",
    auth_signup: "Create account",
    auth_subtitle: "Refactor Magazine private panel.",
    auth_google: "Continue with Google",
    auth_or: "or",
    auth_email: "Email",
    auth_password: "Password",
    auth_do_signin: "Sign in",
    auth_do_signup: "Create account",
    auth_toggle_to_signup: "No account? Sign up",
    auth_toggle_to_signin: "Already have an account? Sign in",
    auth_account_created: "Account created. You can now sign in.",
    auth_google_error: "Google sign-in failed.",
  },
} as const;
