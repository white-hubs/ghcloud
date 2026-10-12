const BLOCK_TAGS = new Set([
  "address",
  "article",
  "aside",
  "blockquote",
  "br",
  "dd",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "li",
  "main",
  "nav",
  "ol",
  "p",
  "pre",
  "section",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "ul",
]);

const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => ENTITY_MAP[name.toLowerCase()] ?? match);
}

function stripTags(html: string): string {
  let output = "";
  let index = 0;
  let inTag = false;
  let tagName = "";

  while (index < html.length) {
    const char = html[index];
    if (char === undefined) {
      break;
    }

    if (inTag) {
      if (char === ">") {
        const closing = tagName.startsWith("/");
        const normalized = closing ? tagName.slice(1).trim().toLowerCase() : tagName.trim().toLowerCase();
        if (!closing && BLOCK_TAGS.has(normalized)) {
          output += "\n";
        }
        inTag = false;
        tagName = "";
      } else {
        tagName += char;
      }
      index += 1;
      continue;
    }

    if (char === "<") {
      inTag = true;
      tagName = "";
      index += 1;
      continue;
    }

    output += char;
    index += 1;
  }

  return output;
}

export function htmlToText(html: string): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");

  const stripped = stripTags(withoutScripts);
  const decoded = decodeHtmlEntities(stripped);
  return decoded
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
