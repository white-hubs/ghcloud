import { parseEchartsOption } from "./assistant-echarts-option";

export type ChartType = "mermaid" | "echarts";
export type UnclosedChartFenceMode = "placeholder" | "code";

export type MessageSegment =
  | { kind: "markdown"; source: string }
  /** 流式未闭合时默认占位等待闭合；可通过 debug 模式切回普通代码块展示 */
  | { kind: "chart-pending"; chartType: ChartType }
  /** JSON 非法、图表渲染失败或 debug 未闭合时：按普通代码块展示 */
  | { kind: "chart-fence"; chartType: ChartType; fenceMarkdown: string }
  | { kind: "chart"; chartType: ChartType; source: string }
  /** html-output 围栏流式未闭合：占位等待闭合后再渲染，避免半截 HTML */
  | { kind: "html-report-pending" }
  /** html-output 围栏闭合：body 作为自包含 HTML 片段灌入 sandbox iframe */
  | { kind: "html-report"; source: string };

/** 特殊围栏语言：整段 body 交给 sandbox iframe 渲染完整报告（刻意区别于被禁的裸 `html`） */
const HTML_OUTPUT_LANG = "html-output";

function isChartLang(lang: string): lang is ChartType {
  const normalized = lang.trim().toLowerCase();
  return normalized === "mermaid" || normalized === "echarts";
}

function normalizeChartType(lang: string): ChartType {
  return lang.trim().toLowerCase() as ChartType;
}

function pushMarkdown(segments: MessageSegment[], source: string): void {
  const trimmed = source.trim();
  if (trimmed.length === 0) {
    return;
  }
  segments.push({ kind: "markdown", source: trimmed });
}

/** 生成可交给 markdown-it 渲染的 fence 原文（未闭合时不带结尾 ```） */
export function formatChartFenceMarkdown(chartType: ChartType, body: string, closed: boolean): string {
  const lines = [`\`\`\`${chartType}`];
  if (body.length > 0) {
    lines.push(body);
  }
  if (closed) {
    lines.push("```");
  }
  return lines.join("\n");
}

function parseClosedChartSegment(chartType: ChartType, body: string): MessageSegment {
  const trimmedBody = body.trim();
  if (chartType === "echarts") {
    const parsed = parseEchartsOption(trimmedBody);
    if (!parsed.ok) {
      return {
        kind: "chart-fence",
        chartType,
        fenceMarkdown: formatChartFenceMarkdown(chartType, body, true),
      };
    }
  }
  return { kind: "chart", chartType, source: trimmedBody };
}

/** 从围栏起始行的下一行开始吃到闭合 ``` 为止；chart 与 html-output 共用，避免重复 */
function captureFenceBody(lines: string[], startIndex: number): { body: string; closed: boolean; nextIndex: number } {
  const bodyLines: string[] = [];
  let index = startIndex;
  let closed = false;
  while (index < lines.length) {
    const bodyLine = lines[index] ?? "";
    if (/^```\s*$/.test(bodyLine)) {
      closed = true;
      index += 1;
      break;
    }
    bodyLines.push(bodyLine);
    index += 1;
  }
  return { body: bodyLines.join("\n"), closed, nextIndex: index };
}

/**
 * 将助手 Markdown 正文拆为可混排渲染的段（特殊围栏在 markdown-it 之前切出）。
 * 识别严格语言标签 `mermaid` / `echarts`（图表）与 `html-output`（报告 iframe）；其余围栏回落普通 markdown。
 */
export function parseMessageSegments(markdown: string, opts: { unclosedChartFenceMode?: UnclosedChartFenceMode } = {}): MessageSegment[] {
  const unclosedChartFenceMode = opts.unclosedChartFenceMode ?? "placeholder";
  const lines = markdown.split("\n");
  const segments: MessageSegment[] = [];
  const markdownBuffer: string[] = [];

  const flushMarkdown = (): void => {
    if (markdownBuffer.length === 0) {
      return;
    }
    pushMarkdown(segments, markdownBuffer.join("\n"));
    markdownBuffer.length = 0;
  };

  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    const fenceMatch = line.match(/^```([^\s`]+)\s*$/);
    if (fenceMatch == null || fenceMatch[1] == null) {
      markdownBuffer.push(line);
      index += 1;
      continue;
    }

    const lang = fenceMatch[1];

    if (isChartLang(lang)) {
      const chartType = normalizeChartType(lang);
      flushMarkdown();
      const { body, closed, nextIndex } = captureFenceBody(lines, index + 1);
      index = nextIndex;
      if (!closed) {
        if (unclosedChartFenceMode === "code") {
          segments.push({
            kind: "chart-fence",
            chartType,
            fenceMarkdown: formatChartFenceMarkdown(chartType, body, false),
          });
        } else {
          segments.push({ kind: "chart-pending", chartType });
        }
        break;
      }
      segments.push(parseClosedChartSegment(chartType, body));
      continue;
    }

    if (lang.trim().toLowerCase() === HTML_OUTPUT_LANG) {
      flushMarkdown();
      const { body, closed, nextIndex } = captureFenceBody(lines, index + 1);
      index = nextIndex;
      if (!closed) {
        segments.push({ kind: "html-report-pending" });
        break;
      }
      segments.push({ kind: "html-report", source: body.trim() });
      continue;
    }

    markdownBuffer.push(line);
    index += 1;
  }

  flushMarkdown();

  return segments;
}
