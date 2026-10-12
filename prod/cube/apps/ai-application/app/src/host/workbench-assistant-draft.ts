export const WORKBENCH_ASSISTANT_DRAFT_STORAGE_KEY = "cube-ai-application:workbench-assistant-draft";

export interface WorkbenchAssistantDraft {
  question: string;
  skillIds: string[];
  createdAt: number;
}

const MAX_DRAFT_AGE = 10 * 60 * 1000;

export function readWorkbenchAssistantDraft(): WorkbenchAssistantDraft | null {
  try {
    const raw = sessionStorage.getItem(WORKBENCH_ASSISTANT_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WorkbenchAssistantDraft>;
    if (
      typeof parsed.question !== "string" ||
      !Array.isArray(parsed.skillIds) ||
      !parsed.skillIds.every((item) => typeof item === "string") ||
      typeof parsed.createdAt !== "number" ||
      Date.now() - parsed.createdAt > MAX_DRAFT_AGE
    ) {
      sessionStorage.removeItem(WORKBENCH_ASSISTANT_DRAFT_STORAGE_KEY);
      return null;
    }
    return { question: parsed.question, skillIds: parsed.skillIds, createdAt: parsed.createdAt };
  } catch {
    return null;
  }
}

export function clearWorkbenchAssistantDraft(): void {
  sessionStorage.removeItem(WORKBENCH_ASSISTANT_DRAFT_STORAGE_KEY);
}
