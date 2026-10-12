/** 提取正文前移除脚本、隐藏 textarea 等反爬噪声 */

export function sanitizeHtmlForExtraction(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<textarea[^>]*style\s*=\s*["'][^"']*display\s*:\s*none[^"']*["'][^>]*>[\s\S]*?<\/textarea>/gi, " ")
    .replace(/<textarea[^>]*name\s*=\s*["']aliyunwaf_[^"']*["'][^>]*>[\s\S]*?<\/textarea>/gi, " ")
    .replace(/<textarea[^>]*id\s*=\s*["']renderData["'][^>]*>[\s\S]*?<\/textarea>/gi, " ");
}
