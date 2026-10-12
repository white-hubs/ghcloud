/**
 * iframe sandbox 白名单：放行脚本执行、弹窗（新标签打开）、模态（window.print）。
 * 严禁 `allow-same-origin`——与 `allow-scripts` 同给等于允许脚本自解沙箱、访问父页 origin，
 * 是 srcdoc 报告渲染的核心安全红线。
 */
export const HTML_REPORT_IFRAME_SANDBOX = "allow-scripts allow-popups allow-modals";

/** 父子窗口 postMessage 协议类型：子→父上报自适应高度、父→子触发打印 */
export const HTML_REPORT_MESSAGE = {
  height: "a2-report-height",
  print: "a2-report-print",
} as const;

/**
 * srcdoc 内桥接脚本（运行在 opaque-origin 沙箱 iframe）：
 * - load/resize/ResizeObserver 时把内容高度 postMessage 给父窗口（父据此设 iframe 高度）；
 * - 收到父窗口 print 消息时 window.print()（父无法跨 opaque origin 直接调用，必须走 postMessage）。
 */
function buildBridgeScript(): string {
  const heightType = JSON.stringify(HTML_REPORT_MESSAGE.height);
  const printType = JSON.stringify(HTML_REPORT_MESSAGE.print);
  return [
    "(function(){",
    `var HEIGHT=${heightType},PRINT=${printType};`,
    "function postHeight(){",
    "var h=Math.ceil(document.documentElement.getBoundingClientRect().height);",
    "if(window.parent){window.parent.postMessage({type:HEIGHT,height:h},'*');}",
    "}",
    "window.addEventListener('load',postHeight);",
    "window.addEventListener('resize',postHeight);",
    "if(typeof ResizeObserver!=='undefined'){new ResizeObserver(postHeight).observe(document.documentElement);}",
    "window.addEventListener('message',function(e){if(e&&e.data&&e.data.type===PRINT){window.print();}});",
    "})();",
  ].join("");
}

/**
 * 放行的外部 CDN 白名单。
 *
 * ⚠️ 这是对「default-src 'none' 阻断一切外网」红线的**有意安全降级**（经用户显式决策）：
 * 上游报告可能依赖托管在自有 CDN 上的脚本/样式（如 Tailwind 构建产物、ECharts 等），
 * 严格 CSP 下会白屏。此处仅放行 `https://r.kaiheai.com`，让现有报告可渲染。
 * 残余风险：允许执行该 CDN 上的外部脚本（含 `'unsafe-eval'`，Alpine 等依赖）；
 * 但 sandbox 仍无 allow-same-origin（opaque origin），无法读取父页 DOM/cookie/同源存储，
 * 且 `connect-src 'none'` 禁止 iframe 内网络请求。仅 https，绝不放通配符。
 */
export const HTML_REPORT_CDN_ALLOWLIST = ["https://r.kaiheai.com"] as const;

const HTML_REPORT_CDN = HTML_REPORT_CDN_ALLOWLIST.join(" ");

/**
 * srcdoc 内 meta CSP：默认 `none`，放行 CDN 白名单上的脚本/样式/字体/图片，以及内联 script/style。
 * `script-src` 含 `'unsafe-eval'`：上游报告常用 Alpine.js 等依赖 `new Function`/`eval` 的库，缺则白屏。
 * `connect-src 'none'`：禁止 iframe 内发起网络请求，降低数据外泄面。
 * 注意 meta CSP 下 `frame-ancestors`/`sandbox`/`report-uri` 无效，跨源隔离由 iframe sandbox 属性兜底。
 */
export const HTML_REPORT_CSP = [
  "default-src 'none'",
  `script-src ${HTML_REPORT_CDN} 'unsafe-inline' 'unsafe-eval'`,
  `style-src ${HTML_REPORT_CDN} 'unsafe-inline'`,
  `img-src 'self' data: ${HTML_REPORT_CDN}`,
  `font-src ${HTML_REPORT_CDN} data:`,
  "connect-src 'none'",
]
  .join("; ")
  .concat(";");

/** srcdoc 外壳基础排版：贴近助手正文观感，不引任何外链资源 */
const HTML_REPORT_BASE_STYLE =
  "body{margin:0;padding:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'PingFang SC','Microsoft YaHei',sans-serif;color:#1e293b;background:#fff;line-height:1.6;-webkit-font-smoothing:antialiased;}img{max-width:100%;height:auto;}";

/**
 * 组装灌入 sandbox iframe 的自包含 srcdoc：外壳 = doctype + head(CSP + 基础样式) + body。
 * body 原样嵌入 source（自包含 HTML 片段，允许内联 style/script/SVG/data 图片）。
 */
export function buildHtmlReportSrcdoc(source: string): string {
  return [
    "<!doctype html>",
    '<html lang="zh-CN">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<meta http-equiv="Content-Security-Policy" content="${HTML_REPORT_CSP}">`,
    `<style>${HTML_REPORT_BASE_STYLE}</style>`,
    "</head>",
    "<body>",
    source,
    `<script>${buildBridgeScript()}</script>`,
    "</body>",
    "</html>",
  ].join("\n");
}
