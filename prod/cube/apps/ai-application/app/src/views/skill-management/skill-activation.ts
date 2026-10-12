export type SkillActivationMode = "always" | "semantic" | "manual" | "path";

export interface SkillActivationState {
  activationMode: SkillActivationMode;
  activationGlobs: string[];
}

export type SkillActivation = { mode: "always" } | { mode: "semantic" } | { mode: "manual" } | { mode: "path"; globs: string[] };

export const DEFAULT_SKILL_ACTIVATION_MODE: SkillActivationMode = "semantic";

export const SKILL_ACTIVATION_OPTIONS: { label: string; value: SkillActivationMode; description: string }[] = [
  { label: "语义召回", value: "semantic", description: "根据用户意图自动匹配技能" },
  { label: "手动启用", value: "manual", description: "仅在用户或模型明确点名时启用" },
  { label: "始终启用", value: "always", description: "每次会话都注入技能上下文" },
  { label: "路径匹配", value: "path", description: "仅当命中文件路径规则时启用" },
];

const LEGACY_TRIGGER_TO_ACTIVATION: Record<string, SkillActivationMode> = {
  always: "always",
  semantic: "semantic",
  explicit: "manual",
};

function normalizeGlobs(globs: readonly string[] | undefined): string[] {
  return (globs ?? []).map((glob) => glob.trim()).filter(Boolean);
}

function isActivationMode(value: unknown): value is SkillActivationMode {
  return value === "always" || value === "semantic" || value === "manual" || value === "path";
}

export function buildSkillActivation(state: SkillActivationState): SkillActivation {
  if (state.activationMode === "path") {
    const globs = normalizeGlobs(state.activationGlobs);
    if (globs.length === 0) {
      throw new Error("路径匹配激活方式必须填写至少一个路径规则");
    }
    return { mode: "path", globs };
  }

  return { mode: state.activationMode };
}

export function parseActivationGlobsText(text: string): string[] {
  return text
    .split(/\r?\n|,/)
    .map((glob) => glob.trim())
    .filter(Boolean);
}

export function formatActivationGlobsText(globs: readonly string[] | undefined): string {
  return normalizeGlobs(globs).join("\n");
}

export function resolveSkillActivationState(content: {
  activation?: { mode?: unknown; globs?: unknown };
  trigger?: unknown;
}): SkillActivationState {
  const { activation } = content;
  if (activation && isActivationMode(activation.mode)) {
    if (activation.mode === "path") {
      return {
        activationMode: "path",
        activationGlobs: Array.isArray(activation.globs)
          ? normalizeGlobs(activation.globs.filter((glob): glob is string => typeof glob === "string"))
          : [],
      };
    }
    return { activationMode: activation.mode, activationGlobs: [] };
  }

  if (typeof content.trigger === "string") {
    return {
      activationMode: LEGACY_TRIGGER_TO_ACTIVATION[content.trigger] ?? DEFAULT_SKILL_ACTIVATION_MODE,
      activationGlobs: [],
    };
  }

  return { activationMode: DEFAULT_SKILL_ACTIVATION_MODE, activationGlobs: [] };
}
