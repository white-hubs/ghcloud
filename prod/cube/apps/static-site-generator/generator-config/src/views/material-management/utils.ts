import type { Material, MaterialFolder } from "./types";
import { message } from "@ghcloud/cube-ui";

/** 扁平化文件夹树 */
export function flattenTree(nodes: MaterialFolder[]): MaterialFolder[] {
  const result: MaterialFolder[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children));
    }
  }
  return result;
}

/** Base64 URL-safe 编码 */
function base64EncodeURL(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** 预览素材 */
export function previewMaterial(material: Material): void {
  const ext = material.ext.toLowerCase();
  const videoExts = ["mp4", "avi", "wmv", "flv"];
  const imageExts = ["jpg", "jpeg", "bmp", "png", "gif", "svg", "webp", "ico"];
  const excelExts = ["xls", "xlsx"];
  const docExts = ["doc"];
  const docxExts = ["docx"];
  const pptExts = ["ppt", "pptx"];
  const pdfExts = ["pdf"];
  const audioExts = ["mp3", "wav", "m4a"];

  const isSupported =
    videoExts.includes(ext) ||
    imageExts.includes(ext) ||
    excelExts.includes(ext) ||
    docExts.includes(ext) ||
    docxExts.includes(ext) ||
    pptExts.includes(ext) ||
    pdfExts.includes(ext) ||
    audioExts.includes(ext);

  let url = material.url ?? "";
  if (url && !url.startsWith("http")) {
    url = window.location.origin + url;
  }

  // 图片和视频直接打开原始地址
  if (imageExts.includes(ext) || videoExts.includes(ext)) {
    window.open(url, "_blank");
    return;
  }

  if (!isSupported) {
    message.info("暂不支持该文件类型预览");
    return;
  }

  const previewUrl = `${window.location.origin}/tools/kkfileview/onlinePreview?url=${encodeURIComponent(base64EncodeURL(url))}&fileName=${encodeURIComponent(material.name)}`;
  window.open(previewUrl, "_blank");
}
