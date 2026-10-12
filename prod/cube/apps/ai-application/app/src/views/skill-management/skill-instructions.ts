/** 技能 instructions ↔ 六项配置 纯字符串解析（无 UI 依赖）。 */

export const SKILL_INTRO_SECTION = "技能详情";

export interface SkillConfig {
  usageExample?: string;
  outputSpec?: string;
  inputReq?: string;
  pitfallGuide?: string;
  checklist?: string;
  reference?: string;
}

export const SIX_CONFIG_LABELS: Record<keyof SkillConfig, string> = {
  usageExample: "使用示例",
  outputSpec: "输出规范",
  inputReq: "输入要求",
  pitfallGuide: "避坑指南",
  checklist: "自检清单",
  reference: "参考资源",
};

export const SIX_CONFIG_KEYS = [
  "usageExample",
  "outputSpec",
  "inputReq",
  "pitfallGuide",
  "checklist",
  "reference",
] as const satisfies readonly (keyof SkillConfig)[];

export type SixConfigKey = (typeof SIX_CONFIG_KEYS)[number];

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isNonEmpty(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

/** 六项配置 ↔ instructions markdown 互转（ghcloud 约定）。 */
export function parseSkillInstructions(instructions: string): SkillConfig & { intro?: string } {
  const result: SkillConfig & { intro?: string } = {};
  if (!instructions.trim()) {
    return result;
  }

  const sections = instructions.split(/^## /m);
  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) {
      continue;
    }
    const lineBreak = trimmed.indexOf("\n");
    const title = (lineBreak >= 0 ? trimmed.slice(0, lineBreak) : trimmed).trim();
    const body = (lineBreak >= 0 ? trimmed.slice(lineBreak + 1) : "").trim();
    if (title === SKILL_INTRO_SECTION) {
      result.intro = body;
      continue;
    }
    const configKey = (Object.keys(SIX_CONFIG_LABELS) as Array<keyof SkillConfig>).find((key) => SIX_CONFIG_LABELS[key] === title);
    if (configKey) {
      result[configKey] = body;
    }
  }

  if (!result.usageExample && !result.outputSpec && instructions.trim()) {
    result.intro = result.intro ?? instructions.trim();
  }

  return result;
}

function trimSkillConfigSectionBody(body: string, selfKey: SixConfigKey): string {
  const boundaryLabels = [SKILL_INTRO_SECTION, ...SIX_CONFIG_KEYS.filter((key) => key !== selfKey).map((key) => SIX_CONFIG_LABELS[key])];
  const labelPattern = boundaryLabels.map((label) => escapeRegExp(label)).join("|");

  const boundary = new RegExp(
    `\\n(?:#{2,3}\\s*(?:${labelPattern})\\s*(?:\\n|$)|(?:${labelPattern})\\s*[：:]\\s*(?:\\n|$)|(?:${labelPattern})\\s*\\n)`,
    "m",
  );
  const match = body.match(boundary);
  if (match?.index != null && match.index >= 0) {
    return body.slice(0, match.index).trim();
  }
  return body.trim();
}

function extractSectionBodyByHeading(text: string, focusLabel: string, headingLevel: "h2" | "any"): string {
  const hashPattern = headingLevel === "h2" ? "##\\s*" : "#{1,3}\\s*";
  const nextHeading = headingLevel === "h2" ? "\\n##\\s" : "\\n#{1,3}\\s";
  const match = text.match(new RegExp(`(?:^|\\n)${hashPattern}${escapeRegExp(focusLabel)}\\s*\\n([\\s\\S]*?)(?=${nextHeading}|$)`, "m"));
  return match?.[1]?.trim() ?? "";
}

function extractSectionBodyByLabelLine(text: string, focusLabel: string, focusKey: SixConfigKey): string {
  const boundaryLabels = [SKILL_INTRO_SECTION, ...SIX_CONFIG_KEYS.filter((key) => key !== focusKey).map((key) => SIX_CONFIG_LABELS[key])];
  const labelPattern = boundaryLabels.map((label) => escapeRegExp(label)).join("|");
  const match = text.match(
    new RegExp(
      `(?:^|\\n)${escapeRegExp(focusLabel)}\\s*[：:]?\\s*\\n([\\s\\S]*?)(?=\\n(?:#{1,3}\\s*(?:${labelPattern})\\s*(?:\\n|$)|(?:${labelPattern})\\s*[：:]\\s*(?:\\n|$))|$)`,
      "m",
    ),
  );
  return match?.[1]?.trim() ?? "";
}

/** 定向修改时从 AI instructions 中只提取目标配置项，并截掉误嵌入的其他章节。 */
export function extractSkillConfigSection(instructions: string, focusKey: SixConfigKey): string {
  const trimmed = instructions.trim();
  if (!trimmed) {
    return "";
  }

  const focusLabel = SIX_CONFIG_LABELS[focusKey];
  const parsed = parseSkillInstructions(trimmed);
  let body = parsed[focusKey]?.trim() ?? "";

  if (!body) {
    body = extractSectionBodyByHeading(trimmed, focusLabel, "h2");
  }

  if (!body) {
    body = extractSectionBodyByHeading(trimmed, focusLabel, "any");
  }

  if (!body) {
    body = extractSectionBodyByLabelLine(trimmed, focusLabel, focusKey);
  }

  if (!body && !/^#{1,3}\s/m.test(trimmed)) {
    return trimSkillConfigSectionBody(trimmed, focusKey);
  }

  if (!body) {
    return "";
  }

  return trimSkillConfigSectionBody(body, focusKey);
}

export function parseSkillInstructionsFromPropose(
  instructions: string,
  options?: { onlyKeys?: readonly SixConfigKey[] },
): SkillConfig & { intro?: string } {
  if (!options?.onlyKeys?.length) {
    return parseSkillInstructions(instructions);
  }

  const parsed: SkillConfig & { intro?: string } = {};
  for (const key of options.onlyKeys) {
    const extracted = extractSkillConfigSection(instructions, key);
    if (isNonEmpty(extracted)) {
      parsed[key] = extracted;
    }
  }
  return parsed;
}
