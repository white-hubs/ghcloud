import hljs from "highlight.js";
import MarkdownIt from "markdown-it";

import { resolveGeneratedMediaUrl } from "./assistant-generated-media";

import "highlight.js/styles/github.css";

const CHART_FENCE_LANGS = new Set(["echarts", "mermaid"]);
const FENCE_LANG_ALIASES: Record<string, string> = {
  echarts: "json",
};

function escapeHtml(source: string): string {
  return source.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight(source: string, langName: string): string {
    const normalizedLang = langName.trim().toLowerCase();
    const highlightLang = FENCE_LANG_ALIASES[normalizedLang] ?? normalizedLang;
    if (highlightLang !== "" && hljs.getLanguage(highlightLang) != null) {
      try {
        return hljs.highlight(source, { language: highlightLang, ignoreIllegals: true }).value;
      } catch {
        // 回退到自动检测
      }
    }
    if (CHART_FENCE_LANGS.has(normalizedLang)) {
      return escapeHtml(source);
    }
    try {
      return hljs.highlightAuto(source).value;
    } catch {
      return escapeHtml(source);
    }
  },
});

/** markdown-it 默认 fence 的 `<code>` 无 `hljs` 类，github 等主题需根类才能稳定命中 token 颜色 */
const defaultFence = md.renderer.rules.fence;
if (typeof defaultFence === "function") {
  md.renderer.rules.fence = (...args): string => {
    const rendered = defaultFence(...args);
    return rendered.replace('<code class="', '<code class="hljs ').replace("<code>", '<code class="hljs">');
  };
}

export interface RenderAssistantMarkdownOptions {
  mediaBaseUrl?: string;
}

/** 给外链图片补常用属性，减少部分 CDN 对 Referer 的拦截；无法修复已 404 的地址 */
function decorateAssistantImgTags(html: string, mediaBaseUrl?: string): string {
  if (!html.includes("<img")) {
    return html;
  }
  return html.replace(/<img\s+([^>]*?)src="([^"]+)"([^>]*)>/gi, (_full, beforeSrc: string, src: string, afterSrc: string) => {
    const normalizedSrc = mediaBaseUrl ? resolveGeneratedMediaUrl(src, mediaBaseUrl) : src;
    return `<img loading="lazy" decoding="async" referrerpolicy="no-referrer" ${beforeSrc}src="${normalizedSrc}"${afterSrc}>`;
  });
}

/** 将助手 Markdown 转为安全 HTML（禁止 raw HTML，由 markdown-it 转义） */
export function renderAssistantMarkdownToHtml(source: string, options: RenderAssistantMarkdownOptions = {}): string {
  const trimmed = source.trim();
  if (trimmed === "") {
    return "";
  }
  return decorateAssistantImgTags(md.render(source), options.mediaBaseUrl);
}
