/** 参考资源 (R6) 文件元数据 — 序列化进 instructions 的「参考资源」段落。 */

export const SKILL_REFERENCE_UPLOAD_SCENE = "AI_APPLICATION_CENTE::FILE";

export const SKILL_REFERENCE_ACCEPT_TYPES = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".pdf",
  ".doc",
  ".docx",
  ".xlsx",
  ".xls",
  ".ppt",
  ".pptx",
  ".txt",
  ".md",
] as const;

export const SKILL_REFERENCE_MAX_COUNT = 10;
export const SKILL_REFERENCE_MAX_SIZE_MB = 100;

export interface SkillReferenceFile {
  id: string;
  name: string;
  path: string;
  type: string;
  size?: number;
}

export interface SkillReferenceData {
  files: SkillReferenceFile[];
  note?: string;
}

interface SkillReferencePayload {
  v: 1;
  files: SkillReferenceFile[];
  note?: string;
}

function isSkillReferenceFile(value: unknown): value is SkillReferenceFile {
  if (!value || typeof value !== "object") {
    return false;
  }
  const file = value as Record<string, unknown>;
  return typeof file.id === "string" && typeof file.name === "string" && typeof file.path === "string" && typeof file.type === "string";
}

function parseReferencePayload(raw: string): SkillReferenceData | null {
  try {
    const parsed = JSON.parse(raw) as Partial<SkillReferencePayload>;
    if (parsed.v !== 1 || !Array.isArray(parsed.files)) {
      return null;
    }
    const files = parsed.files.filter(isSkillReferenceFile);
    const note = typeof parsed.note === "string" ? parsed.note.trim() : "";
    return { files, ...(note ? { note } : {}) };
  } catch {
    return null;
  }
}

/** 解析 reference 字段：JSON v1 为文件列表；否则视为历史纯文本说明。 */
export function parseSkillReference(raw: string | undefined): SkillReferenceData {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) {
    return { files: [] };
  }
  if (trimmed.startsWith("{")) {
    const payload = parseReferencePayload(trimmed);
    if (payload) {
      return payload;
    }
  }
  return { files: [], note: trimmed };
}

export function hasSkillReferenceContent(data: SkillReferenceData): boolean {
  return data.files.length > 0 || Boolean(data.note?.trim());
}

/** 写入 instructions；无文件且无说明时返回空串以跳过该段落。 */
export function serializeSkillReference(data: SkillReferenceData): string {
  const note = data.note?.trim() ?? "";
  if (data.files.length === 0 && !note) {
    return "";
  }
  if (data.files.length === 0) {
    return note;
  }
  const payload: SkillReferencePayload = {
    v: 1,
    files: data.files,
    ...(note ? { note } : {}),
  };
  return JSON.stringify(payload);
}

export function formatSkillReferenceSummary(raw: string | undefined): string {
  const data = parseSkillReference(raw);
  const parts: string[] = [];
  if (data.files.length > 0) {
    parts.push(`${data.files.length} 个附件`);
  }
  if (data.note?.trim()) {
    parts.push(data.note.trim());
  }
  return parts.join("；") || "暂无参考资源";
}

export interface SkillReferenceOssFile {
  businessKey: string | null;
  id: string;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  type: string;
}

export function skillReferenceToOssFiles(files: SkillReferenceFile[]): SkillReferenceOssFile[] {
  return files.map((file) => {
    const suffix = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
    return {
      businessKey: null,
      id: file.id,
      name: file.name,
      path: file.path,
      refCount: 0,
      size: file.size ?? 0,
      suffix,
      type: file.type,
    };
  });
}

export function ossFilesToSkillReference(files: SkillReferenceOssFile[]): SkillReferenceFile[] {
  return files.map((file) => ({
    id: file.id,
    name: file.name,
    path: file.path,
    type: file.type,
    size: file.size,
  }));
}

export function isImageReferenceFile(file: SkillReferenceFile): boolean {
  const lower = file.type.toLowerCase();
  if (lower.startsWith("image/")) {
    return true;
  }
  return /\.(png|jpe?g|webp|gif)$/i.test(file.name);
}
