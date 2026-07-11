// Tiny markdown-to-HTML renderer. Good enough for article bodies.
// Supports: headings, bold, italic, inline code, code blocks, links,
// images, lists, blockquotes, hr, paragraphs.

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function renderMarkdown(md: string): { html: string; toc: TocEntry[] } {
  const toc: TocEntry[] = [];
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inCode = false;
  let codeLang = "";
  let codeBuf: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let paraBuf: string[] = [];

  const flushPara = () => {
    if (paraBuf.length) {
      out.push(`<p>${inline(paraBuf.join(" "))}</p>`);
      paraBuf = [];
    }
  };
  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  function inline(s: string) {
    let t = escapeHtml(s);
    // images ![alt](url)
    t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" loading="lazy" />');
    // links [text](url)
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    // inline code
    t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
    // bold
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    // italic
    t = t.replace(/(^|\W)\*([^*]+)\*/g, "$1<em>$2</em>");
    return t;
  }

  for (const raw of lines) {
    const line = raw;
    if (inCode) {
      if (line.trim().startsWith("```")) {
        out.push(
          `<pre><code${codeLang ? ` class="language-${codeLang}"` : ""}>${escapeHtml(codeBuf.join("\n"))}</code></pre>`,
        );
        codeBuf = [];
        inCode = false;
        codeLang = "";
      } else codeBuf.push(line);
      continue;
    }
    if (line.trim().startsWith("```")) {
      flushPara();
      closeList();
      inCode = true;
      codeLang = line.trim().replace(/```/, "").trim();
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      flushPara();
      closeList();
      const level = h[1].length;
      const text = h[2].trim();
      const id = slugify(text);
      toc.push({ id, text, level });
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      continue;
    }
    if (/^\s*---\s*$/.test(line)) {
      flushPara();
      closeList();
      out.push("<hr />");
      continue;
    }
    const ul = /^\s*[-*]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (ul || ol) {
      flushPara();
      const type = ul ? "ul" : "ol";
      if (listType !== type) {
        closeList();
        out.push(`<${type}>`);
        listType = type;
      }
      out.push(`<li>${inline((ul || ol)![1])}</li>`);
      continue;
    }
    const bq = /^>\s?(.*)$/.exec(line);
    if (bq) {
      flushPara();
      closeList();
      out.push(`<blockquote>${inline(bq[1])}</blockquote>`);
      continue;
    }
    if (line.trim() === "") {
      flushPara();
      closeList();
      continue;
    }
    closeList();
    paraBuf.push(line);
  }
  flushPara();
  closeList();
  if (inCode)
    out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
  return { html: out.join("\n"), toc };
}

export function estimateReadingTime(md: string) {
  const words = md.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
