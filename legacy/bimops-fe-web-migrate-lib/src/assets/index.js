import { useWebSocket } from "./webSocket";

export { useWebSocket };

export function getAssetsUrl (url, base = import.meta.url) {
  return new URL(url, base).href
}