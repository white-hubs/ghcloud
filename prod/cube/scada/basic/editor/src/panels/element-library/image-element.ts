export const DEFAULT_IMAGE_GROUP = "未分组";
export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024;
export const IMAGE_FILE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";

const SUPPORTED_IMAGE_TYPES = new Set(IMAGE_FILE_ACCEPT.split(","));

export interface CreateImageElementOptions {
  label: string;
  group?: string;
}

export interface ImageElementAsset {
  type: string;
  label: string;
  group: string;
  svgContent: string;
}

export interface UpdatedImageElementMetadata {
  label: string;
  group: string;
  svgContent: string;
}

interface ImageDimensions {
  width: number;
  height: number;
}

export function isSupportedImageFile(file: File): boolean {
  if (SUPPORTED_IMAGE_TYPES.has(file.type)) return true;
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name);
}

export async function createImageElementFromFile(file: File, options: CreateImageElementOptions): Promise<ImageElementAsset> {
  if (!isSupportedImageFile(file)) {
    throw new Error("仅支持 PNG、JPG、WebP、GIF 和 SVG 图片");
  }
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    throw new Error("图片大小不能超过 10MB");
  }

  const label = options.label.trim();
  if (!label) throw new Error("请输入图片名称");

  const group = options.group?.trim() || DEFAULT_IMAGE_GROUP;
  const dataUrl = await readFileAsDataUrl(file);
  const dimensions = await readImageDimensions(dataUrl);
  const type = createImageElementType();
  const displaySize = fitDisplaySize(dimensions);

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:scada="http://cube-scada.io/ns/v1"
     viewBox="0 0 ${dimensions.width} ${dimensions.height}"
     width="${displaySize.width}"
     height="${displaySize.height}">
  <metadata>
    <scada:element>
      <scada:meta type="${escapeXmlAttribute(type)}" label="${escapeXmlAttribute(label)}" category="${escapeXmlAttribute(group)}" version="1.0.0" assetKind="image" assetGroup="${escapeXmlAttribute(group)}"/>
      <scada:props/>
      <scada:mappings/>
      <scada:animations/>
    </scada:element>
  </metadata>
  <image id="asset-image" href="${escapeXmlAttribute(dataUrl)}" x="0" y="0" width="${dimensions.width}" height="${dimensions.height}" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

  return { type, label, group, svgContent };
}

export function updateImageElementMetadata(svgContent: string, updates: { label: string; group: string }): UpdatedImageElementMetadata {
  const label = updates.label.trim();
  if (!label) throw new Error("请输入图片名称");
  const group = updates.group.trim() || DEFAULT_IMAGE_GROUP;
  const metaPattern = /<scada:meta\b[^>]*\/?\s*>/i;
  if (!metaPattern.test(svgContent)) {
    throw new Error("图片图元缺少 scada:meta 元数据");
  }

  return {
    label,
    group,
    svgContent: svgContent.replace(metaPattern, (metaTag) => {
      const withLabel = setXmlAttribute(metaTag, "label", label);
      const withCategory = setXmlAttribute(withLabel, "category", group);
      return setXmlAttribute(withCategory, "assetGroup", group);
    }),
  };
}

function createImageElementType(): string {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `custom-image-${id}`.toLowerCase();
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("无法读取图片文件"));
    };
    reader.onerror = () => reject(new Error("无法读取图片文件"));
    reader.readAsDataURL(file);
  });
}

function readImageDimensions(dataUrl: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const width = Math.max(1, image.naturalWidth || image.width);
      const height = Math.max(1, image.naturalHeight || image.height);
      resolve({ width, height });
    };
    image.onerror = () => reject(new Error("图片内容无效或已损坏"));
    image.src = dataUrl;
  });
}

function fitDisplaySize(dimensions: ImageDimensions): ImageDimensions {
  const scale = Math.min(1, 240 / dimensions.width, 180 / dimensions.height);
  return {
    width: Math.max(1, Math.round(dimensions.width * scale)),
    height: Math.max(1, Math.round(dimensions.height * scale)),
  };
}

function escapeXmlAttribute(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("'", "&apos;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function setXmlAttribute(tag: string, name: string, value: string): string {
  const escaped = escapeXmlAttribute(value);
  const pattern = new RegExp(`(\\s${name}\\s*=\\s*)(["'])(.*?)(\\2)`, "i");
  if (pattern.test(tag)) {
    return tag.replace(pattern, (_match, prefix: string, quote: string) => `${prefix}${quote}${escaped}${quote}`);
  }
  return tag.replace(/\s*\/?\s*>$/, (ending) => ` ${name}="${escaped}"${ending}`);
}
