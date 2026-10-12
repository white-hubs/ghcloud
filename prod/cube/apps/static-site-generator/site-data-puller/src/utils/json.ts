/**
 * 解析 JSON 文本，将 id / categoryId 等超过 16 位的数字提前转为字符串，
 * 避免 JS Number 精度丢失。
 */
export function safeJsonParse(text: string): unknown {
  const safeText = text.replace(/"id"\s*:\s*(\d{16,})/g, '"id":"$1"').replace(/"categoryId"\s*:\s*(\d{16,})/g, '"categoryId":"$1"');
  return JSON.parse(safeText);
}

/**
 * 将对象序列化为 JSON 字符串，并把 id / categoryId 的字符串值重新转为数字格式，
 * 以匹配本地样本文件的格式（同时保留原始精确位数）。
 */
export function stringifyBigIntAsNumber(value: unknown): string {
  const text = JSON.stringify(value, null, 2);
  return text.replace(/"id"\s*:\s*"(\d{16,})"/g, '"id":$1').replace(/"categoryId"\s*:\s*"(\d{16,})"/g, '"categoryId":$1');
}
