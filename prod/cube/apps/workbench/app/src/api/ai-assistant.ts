import { createCubeAiClients } from "@ghcloud/cube-ai-application-service";

import { authStore } from "./auth-store";

interface SkillShelfEntry {
  targetKind?: string;
  targetId?: string;
  displayName?: string;
  runnableStatus?: string;
}

interface LibrarySkill {
  ref?: string;
  displayName?: string;
}

export interface AssistantSkillOption {
  id: string;
  label: string;
}

const INTERNAL_SKILL_IDS = new Set(["default-reasoning", "chart-output"]);

/** 与 AI 中心聊天输入区一致：仅展示当前用户可运行的技能货架。 */
export async function fetchAssistantSkills(): Promise<AssistantSkillOption[]> {
  const agentConsole = createCubeAiClients(authStore).agentConsole;
  const [shelf, systemSkills, tenantSkills] = await Promise.all([
    agentConsole.mySkills(),
    agentConsole.browseLibrarySkills({ tier: "system" }).catch(() => []),
    agentConsole.browseLibrarySkills({ tier: "tenant" }).catch(() => []),
  ]);
  const libraryNameByRef = new Map<string, string>();

  for (const item of [...systemSkills, ...tenantSkills] as LibrarySkill[]) {
    const name = item.displayName?.trim();
    if (item.ref && name) libraryNameByRef.set(item.ref, name);
  }

  const existingIds = new Set<string>();
  return (shelf as SkillShelfEntry[])
    .filter((item) => item.targetKind === "skill" && item.runnableStatus === "runnable")
    .filter((item) => Boolean(item.targetId) && !INTERNAL_SKILL_IDS.has(item.targetId!))
    .filter((item) => {
      if (existingIds.has(item.targetId!)) return false;
      existingIds.add(item.targetId!);
      return true;
    })
    .map((item) => ({
      id: item.targetId!,
      label: libraryNameByRef.get(item.targetId!) ?? (item.displayName?.trim() || item.targetId!),
    }));
}
