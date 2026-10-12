// 获取assets静态资源
export const getAssetsFile = (url: string): string => {
  return new URL(`../assets/images/${url}`, import.meta.url).href;
};
/**
 * 文件大小 字节转换单位
 * @param size
 * @returns {string|*}
 */
export const filterSize = (size: number): string => {
  if (!size) return "";
  if (size < pow1024(1)) return size + " B";
  if (size < pow1024(2)) return (size / pow1024(1)).toFixed(2) + " KB";
  if (size < pow1024(3)) return (size / pow1024(2)).toFixed(2) + " MB";
  if (size < pow1024(4)) return (size / pow1024(3)).toFixed(2) + " GB";
  return (size / pow1024(4)).toFixed(2) + " TB";
};
function pow1024(num: number): number {
  return Math.pow(1024, num);
}
function bin2hex(s: string): string {
  let o = "";
  for (let i = 0; i < s.length; i++) {
    const n = s.charCodeAt(i).toString(16);
    o += n.length < 2 ? "0" + n : n;
  }
  return o;
}

function getCanvasFingerprint(): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new Date().getTime().toString();
  }
  ctx.textBaseline = "top";
  ctx.rect(0, 0, 10, 10);
  ctx.rect(2, 2, 6, 6);

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#f60";
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = "#069";
  ctx.font = "11pt no-real-font-123";
  ctx.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 2, 15);
  ctx.fillStyle = "rgba(102, 204, 0, 0.2)";
  ctx.font = "18pt Arial";
  ctx.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 4, 45);
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "rgb(255,0,255)";
  ctx.beginPath();
  ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgb(0,255,255)";
  ctx.beginPath();
  ctx.arc(100, 50, 50, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgb(255,255,0)";
  ctx.beginPath();
  ctx.arc(75, 100, 50, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgb(255,0,255)";

  ctx.arc(75, 75, 75, 0, Math.PI * 2, true);
  ctx.arc(75, 75, 25, 0, Math.PI * 2, true);

  const b64 = canvas.toDataURL().replace("data:image/png;base64,", "");
  const bin = atob(b64);
  const front = bin2hex(bin.slice(0, 4));
  const back = bin2hex(bin.slice(-4));
  return front + back;
}

// 生成浏览器指纹（Canvas 前 8 位 + 后 8 位 hex，共 16 位）
export const getDeviceFingerprint = async (): Promise<void> => {
  localStorage.setItem("browserId", getCanvasFingerprint());
};
// 获取路径参数
export const getUrlParams = (): Record<string, string> => {
  const locationHref = window.location.href;
  const str = locationHref.split("?")[1];
  if (!str) return {};
  const params = str.split("&");
  const handleParams: Record<string, string> = {};
  for (let i = 0; i < params.length; i++) {
    const g = params[i].split("=");
    handleParams[g[0]] = g[1];
  }
  return handleParams;
};
// 时间转换
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}小时${minutes}分钟${remainingSeconds}秒`;
};

export const typeList = ["doc", "docx", "excel", "xlsx", "xls", "pdf", "ppt", "txt", "zip", "rar", "mp4", "mp3"];
export const imgType = ["jpg", "jpeg", "png", "gif", "bmp", "jpge", "webp", "mpeg", "raw", "heic"];
