export interface KnowledgeSearchDetailPayload {
  title: string;
  text: string;
  typeName: string;
  keyword: string;
  documentId: string;
  chunkId: string;
  headingPath?: string[] | null;
}

const STORAGE_KEY = "ai-application:knowledge-search:detail-payload";

export function saveSearchDetailPayload(payload: KnowledgeSearchDetailPayload): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}

export function readSearchDetailPayload(): KnowledgeSearchDetailPayload | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as KnowledgeSearchDetailPayload;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
