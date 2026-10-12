import type { SkillContentInput } from "@cube-ai/agent-sdk-console";
import type { LibraryItemView, ShelfEntryView, TenantDescriptorView } from "@cube-ai/contracts";
import type { Component } from "vue";

import { AppstoreOutlined, CodeOutlined, FileSearchOutlined, SafetyCertificateOutlined, ThunderboltOutlined } from "@ghcloud/cube-ui";

import { filterUserVisibleLibraryItems, filterUserVisibleShelfEntries } from "../../utils/engine-internal-catalog";
import {
  type SkillConfig,
  type SixConfigKey,
  SIX_CONFIG_KEYS,
  SIX_CONFIG_LABELS,
  SKILL_INTRO_SECTION,
  parseSkillInstructions,
  parseSkillInstructionsFromPropose,
} from "./skill-instructions";

export type { SkillConfig, SixConfigKey } from "./skill-instructions";
export { SIX_CONFIG_KEYS, SIX_CONFIG_LABELS, parseSkillInstructions, extractSkillConfigSection } from "./skill-instructions";

import { agentConsoleClient } from "../../api/agent-console-client";
import { deriveDescriptorName } from "../agent-management/agent-data";
import {
  buildSkillActivation,
  DEFAULT_SKILL_ACTIVATION_MODE,
  resolveSkillActivationState,
  type SkillActivationMode,
} from "./skill-activation";
import { resolveShelfSkillDescription, resolveShelfSkillDisplayName } from "./skill-shelf-display-name";
import { resolveSystemBuiltinSkillContent } from "./system-skill-profiles";

const SKILL_CATEGORY_TAG_PREFIX = "ghcloud.skill.category:";

interface TenantSkillContentShape {
  displayName?: string;
  description?: string;
  instructions?: string;
  activation?: { mode?: unknown; globs?: unknown };
  trigger?: string;
  tags?: string[];
  version?: string;
}

// Skill category definitions matching the backend types
export type SkillCategory = "数据查询" | "工作执行" | "分析汇报" | "知识咨询" | "智能提醒";

export type SkillCategoryCode = "DATA_QUERY" | "WORK_EXECUTION" | "ANALYSIS_REPORT" | "KNOWLEDGE_CONSULT" | "INTELLIGENT_REMIND";

export const SKILL_CATEGORY_MAP: Record<SkillCategory, SkillCategoryCode> = {
  数据查询: "DATA_QUERY",
  工作执行: "WORK_EXECUTION",
  分析汇报: "ANALYSIS_REPORT",
  知识咨询: "KNOWLEDGE_CONSULT",
  智能提醒: "INTELLIGENT_REMIND",
};

export const SKILL_CATEGORY_REVERSE_MAP: Record<SkillCategoryCode, SkillCategory> = {
  DATA_QUERY: "数据查询",
  WORK_EXECUTION: "工作执行",
  ANALYSIS_REPORT: "分析汇报",
  KNOWLEDGE_CONSULT: "知识咨询",
  INTELLIGENT_REMIND: "智能提醒",
};

export const CATEGORY_OPTIONS: { label: SkillCategory; value: SkillCategoryCode }[] = [
  { label: "数据查询", value: "DATA_QUERY" },
  { label: "工作执行", value: "WORK_EXECUTION" },
  { label: "分析汇报", value: "ANALYSIS_REPORT" },
  { label: "知识咨询", value: "KNOWLEDGE_CONSULT" },
  { label: "智能提醒", value: "INTELLIGENT_REMIND" },
];

// Skill item interface for UI
export interface SkillCardItem {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  categoryCode: SkillCategoryCode;
  version: string;
  isBuiltin: boolean;
  published: boolean;
  intro?: string;
  // Six configurations
  config: SkillConfig;
  // UI metadata
  icon: Component;
  iconClass: string;
  /** 技能库 ref（系统 name 或租户 skl_ id） */
  libraryRef?: string;
  // User relation
  added?: boolean;
  hasUpdate?: boolean;
  localVersion?: string;
  editable?: boolean;
  shelfId?: string;
  /** 是否已上架到技能库（marketplace listing） */
  listedInLibrary?: boolean;
  /** 来自技能库安装（货架 ref），保存时 fork 为自研技能 */
  fromLibrary?: boolean;
  /** 本人创作且已上架到技能库，可在技能库页下架 */
  canUnlist?: boolean;
  /** alpha.13 skill activation wire schema 的 UI 状态 */
  activationMode?: SkillActivationMode;
  activationGlobs?: string[];
}

// Predefined built-in skills (matching product requirement §6.3)
export const BUILTIN_SKILLS: Omit<SkillCardItem, "icon" | "iconClass">[] = [
  {
    id: "emergency-plan-generator",
    name: "应急预案自动生成",
    description: "根据事件类型、影响范围、可用资源自动生成标准化应急预案",
    category: "工作执行",
    categoryCode: "WORK_EXECUTION",
    version: "v1.0.0",
    isBuiltin: true,
    published: true,
    intro:
      "基于大语言模型能力结合应急管理领域知识库：自动识别事件类型和影响范围、调用标准化预案模板、生成含响应流程/资源调配/通讯方案的完整预案，支持导出PDF/Word。",
    config: {
      usageExample:
        '用户输入："化学品仓库发生泄漏，影响范围约200平方米"\nAI输出：生成含隔离区划定/人员疏散/中和剂调配/专业处置队调度的完整应急预案。\n\n用户输入："工业园区5号车间设备故障引发火灾"\nAI输出：生成火灾等级判定/消防资源调度/周边车间警戒/生产恢复方案。',
      outputSpec:
        "【输出格式】Markdown文档，含封面页+目录+六个章节（事件概述/应急组织/响应流程/资源调配/通讯方案/附件）。\n【成功标准】□ 事件等级判定有依据 □ 响应流程含时间节点 □ 资源清单含数量/位置/联系人 □ 通讯方案含三级联系人 □ 附件含疏散路线图",
      inputReq:
        "【必填】事件类型（火灾/泄漏/爆炸/自然灾害）、影响范围、事发地点、当前态势描述。\n【可选】现场照片、已有资源清单、周边环境说明、历史类似事件处置记录。",
      pitfallGuide:
        "1. 容易犯的错误：直接套用通用模板而不考虑具体场景。正确做法：判断事件类型和等级后选择对应的预案框架。\n2. 容易犯的错误：忽略资源实际可用性。正确做法：生成的资源清单须标注确认状态。\n3. 容易犯的错误：通讯方案缺少备用联系人。正确做法：每个岗位至少提供2个联系人。",
      checklist:
        "□ 事件等级判定逻辑是否正确\n□ 响应时间节点是否合理\n□ 资源清单是否包含位置和联系人\n□ 通讯方案是否包含备用联系人\n□ 疏散路线是否与实际布局一致\n□ 附件中是否包含必要的参考图",
      reference: "（暂无参考资源）",
    },
  },
  {
    id: "work-permit-pre-review",
    name: "作业票智能预审",
    description: "基于历史审批数据和规则引擎，自动预审作业票申请并提示风险点",
    category: "工作执行",
    categoryCode: "WORK_EXECUTION",
    version: "v1.0.0",
    isBuiltin: true,
    published: true,
    intro: "结合历史审批数据与规则引擎，对作业票申请逐项核验，自动标记风险点并给出审批建议，减少人工预审工作量。",
    config: {
      usageExample: "",
      outputSpec: "",
      inputReq: "",
      pitfallGuide: "",
      checklist: "",
      reference: "",
    },
  },
  {
    id: "document-auto-classify",
    name: "文档智能分类",
    description: "自动识别上传文档类型，智能打标签、分类归档，提升检索效率",
    category: "数据查询",
    categoryCode: "DATA_QUERY",
    version: "v1.0.0",
    isBuiltin: true,
    published: true,
    intro: "自动识别上传文档类型，智能打标签并分类归档，支持按标签/分类快速检索，显著提升文档管理效率。",
    config: {
      usageExample: "",
      outputSpec: "",
      inputReq: "",
      pitfallGuide: "",
      checklist: "",
      reference: "",
    },
  },
  {
    id: "inspection-route-optimize",
    name: "巡检路线优化",
    description: "基于设备风险等级和历史巡检数据，智能优化巡检路线与频次",
    category: "工作执行",
    categoryCode: "WORK_EXECUTION",
    version: "v1.0.0",
    isBuiltin: true,
    published: true,
    intro: "综合设备风险等级与历史巡检数据，智能规划最优巡检路线与频次，兼顾覆盖率与效率。",
    config: {
      usageExample: "",
      outputSpec: "",
      inputReq: "",
      pitfallGuide: "",
      checklist: "",
      reference: "",
    },
  },
  {
    id: "hazard-auto-detect",
    name: "隐患自动识别",
    description: "多源数据融合分析，实时识别现场安全隐患并给出处置建议",
    category: "智能提醒",
    categoryCode: "INTELLIGENT_REMIND",
    version: "v1.0.0",
    isBuiltin: true,
    published: true,
    intro: "融合视频、传感、台账等多源数据，实时识别现场安全隐患，自动分级并给出处置建议。",
    config: {
      usageExample: "",
      outputSpec: "",
      inputReq: "",
      pitfallGuide: "",
      checklist: "",
      reference: "",
    },
  },
  {
    id: "work-permit-ai-assistant",
    name: "作业票AI助手",
    description: "智能问答助手，解答作业票填写规范、审批流程和常见问题",
    category: "知识咨询",
    categoryCode: "KNOWLEDGE_CONSULT",
    version: "v1.0.0",
    isBuiltin: true,
    published: true,
    intro: "面向作业票填写场景的智能问答助手，解答填写规范、审批流程和常见问题，引导用户正确填报。",
    config: {
      usageExample: "",
      outputSpec: "",
      inputReq: "",
      pitfallGuide: "",
      checklist: "",
      reference: "",
    },
  },
  {
    id: "compliance-self-check",
    name: "合规性自检",
    description: "自动检查作业流程是否符合国家标准，标记不合规项并给出修正建议",
    category: "分析汇报",
    categoryCode: "ANALYSIS_REPORT",
    version: "v1.0.0",
    isBuiltin: true,
    published: true,
    intro: "依据国家标准与企业规范，自动检查作业流程合规性，标记不合规项并给出可执行的修正建议。",
    config: {
      usageExample: "",
      outputSpec: "",
      inputReq: "",
      pitfallGuide: "",
      checklist: "",
      reference: "",
    },
  },
  {
    id: "data-report-generate",
    name: "数据报表生成",
    description: "自动汇总巡检、作业、应急数据，生成可视化报表并支持导出",
    category: "分析汇报",
    categoryCode: "ANALYSIS_REPORT",
    version: "v1.0.0",
    isBuiltin: true,
    published: true,
    intro: "自动汇总巡检、作业、应急等多维数据，一键生成可视化报表，支持多种格式导出。",
    config: {
      usageExample: "",
      outputSpec: "",
      inputReq: "",
      pitfallGuide: "",
      checklist: "",
      reference: "",
    },
  },
  {
    id: "resource-smart-schedule",
    name: "资源智能调度",
    description: "根据事件等级和资源分布，自动优化调度方案，实现应急资源最优配置",
    category: "工作执行",
    categoryCode: "WORK_EXECUTION",
    version: "v1.0.0",
    isBuiltin: true,
    published: true,
    intro: "根据事件等级与资源分布，自动计算最优调度方案，实现应急资源最优配置与快速响应。",
    config: {
      usageExample: "",
      outputSpec: "",
      inputReq: "",
      pitfallGuide: "",
      checklist: "",
      reference: "",
    },
  },
  {
    id: "skill-create-assistant",
    name: "技能创建助手",
    description: "通过对话描述技能名和功能后，AI自动生成六项配置并逐项确认，确认后创建为私有技能",
    category: "知识咨询",
    categoryCode: "KNOWLEDGE_CONSULT",
    version: "v1.0.0",
    isBuiltin: true,
    published: true,
    intro:
      "对话式技能创建助手：用户描述技能名称与功能后，AI 按六项规则自动生成配置初稿，用户逐项确认或 @定向修改，确认后创建为仅自己可见的私有技能。",
    config: {
      usageExample: "",
      outputSpec: "",
      inputReq: "",
      pitfallGuide: "",
      checklist: "",
      reference: "",
    },
  },
];

// Icon pool for skill cards (matching agent-management pattern)
const SKILL_ICON_POOL = [
  { icon: SafetyCertificateOutlined, iconClass: "blue" },
  { icon: ThunderboltOutlined, iconClass: "pink" },
  { icon: CodeOutlined, iconClass: "indigo" },
  { icon: AppstoreOutlined, iconClass: "orange" },
  { icon: FileSearchOutlined, iconClass: "teal" },
] as const;

// Hash function to pick icon based on skill id
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.codePointAt(i)!) >>> 0;
  }
  return hash;
}

// Pick visual icon and class for a skill
export function pickSkillVisual(id: string): {
  icon: Component;
  iconClass: string;
} {
  const visual = SKILL_ICON_POOL[hashString(id) % SKILL_ICON_POOL.length] ?? SKILL_ICON_POOL[0];
  return { icon: visual.icon, iconClass: visual.iconClass };
}

function encodeSkillCategoryTag(category: SkillCategoryCode): string {
  return `${SKILL_CATEGORY_TAG_PREFIX}${category}`;
}

function decodeSkillCategoryFromTags(tags: string[] | undefined): SkillCategoryCode | undefined {
  if (!tags?.length) {
    return undefined;
  }
  for (const tag of tags) {
    if (!tag.startsWith(SKILL_CATEGORY_TAG_PREFIX)) {
      continue;
    }
    const code = tag.slice(SKILL_CATEGORY_TAG_PREFIX.length) as SkillCategoryCode;
    if (code in SKILL_CATEGORY_REVERSE_MAP) {
      return code;
    }
  }
  return undefined;
}

function buildSkillCategoryTags(category: SkillCategoryCode, existingTags?: string[]): string[] {
  const preserved = (existingTags ?? []).filter((tag) => !tag.startsWith(SKILL_CATEGORY_TAG_PREFIX));
  return [...preserved, encodeSkillCategoryTag(category)];
}

function buildSkillInstructions(
  form: Pick<SkillFormState, "intro" | "usageExample" | "outputSpec" | "inputReq" | "pitfallGuide" | "checklist" | "reference">,
): string {
  const sections: string[] = [];
  if (form.intro.trim()) {
    sections.push(`## ${SKILL_INTRO_SECTION}\n${form.intro.trim()}`);
  }
  const configFields: (keyof SkillConfig)[] = ["usageExample", "outputSpec", "inputReq", "pitfallGuide", "checklist", "reference"];
  for (const key of configFields) {
    const value = form[key]?.trim();
    if (value) {
      sections.push(`## ${SIX_CONFIG_LABELS[key]}\n${value}`);
    }
  }
  return sections.join("\n\n");
}

export function buildSkillContentFromForm(form: SkillFormState, existingTags?: string[]): SkillContentInput {
  const instructions = buildSkillInstructions(form);
  return {
    displayName: form.name.trim(),
    description: form.description.trim(),
    instructions: instructions || form.description.trim(),
    activation: buildSkillActivation(form),
    tags: buildSkillCategoryTags(form.category, existingTags),
    ...(form.published && form.id ? { version: "1.0.0" } : {}),
  };
}

export function buildSkillContentFromGenerated(config: {
  name?: string;
  description?: string;
  category?: SkillCategoryCode;
  intro?: string;
  usageExample?: string;
  outputSpec?: string;
  inputReq?: string;
  pitfallGuide?: string;
  checklist?: string;
  reference?: string;
  activationMode?: SkillActivationMode;
  activationGlobs?: string[];
}): SkillContentInput {
  return buildSkillContentFromForm({
    name: config.name ?? "",
    description: config.description ?? "",
    category: config.category ?? "WORK_EXECUTION",
    intro: config.intro ?? "",
    activationMode: config.activationMode ?? DEFAULT_SKILL_ACTIVATION_MODE,
    activationGlobs: config.activationGlobs ?? [],
    published: false,
    usageExample: config.usageExample ?? "",
    outputSpec: config.outputSpec ?? "",
    inputReq: config.inputReq ?? "",
    pitfallGuide: config.pitfallGuide ?? "",
    checklist: config.checklist ?? "",
    reference: config.reference ?? "",
  });
}

function resolveSkillCategory(
  categoryCode: SkillCategoryCode | undefined,
  fallback: SkillCategory = "工作执行",
): { category: SkillCategory; categoryCode: SkillCategoryCode } {
  const code = categoryCode ?? "WORK_EXECUTION";
  return {
    category: SKILL_CATEGORY_REVERSE_MAP[code] ?? fallback,
    categoryCode: code in SKILL_CATEGORY_REVERSE_MAP ? code : "WORK_EXECUTION",
  };
}

function emptySkillConfig(): SkillConfig {
  return {
    usageExample: undefined,
    outputSpec: undefined,
    inputReq: undefined,
    pitfallGuide: undefined,
    checklist: undefined,
    reference: undefined,
  };
}

function mapContentToSkillCardBase(
  id: string,
  content: TenantSkillContentShape,
  options: {
    isBuiltin?: boolean;
    published?: boolean;
    version?: string;
    editable?: boolean;
    libraryRef?: string;
    /** 列表摘要：不解析 instructions（详情/六项配置仅详情接口填充） */
    summaryOnly?: boolean;
  } = {},
): Omit<SkillCardItem, "icon" | "iconClass"> {
  const categoryCode = decodeSkillCategoryFromTags(content.tags);
  const { category, categoryCode: resolvedCode } = resolveSkillCategory(categoryCode);
  const activation = resolveSkillActivationState(content);
  const summaryOnly = options.summaryOnly === true || !content.instructions?.trim();
  const parsed = summaryOnly ? null : parseSkillInstructions(content.instructions ?? "");

  return {
    id,
    libraryRef: options.libraryRef,
    name: content.displayName?.trim() || id,
    description: content.description?.trim() || "暂无描述",
    category,
    categoryCode: resolvedCode,
    version: content.version?.trim() || options.version || "v1.0.0",
    isBuiltin: options.isBuiltin ?? false,
    published: options.published ?? true,
    intro: parsed?.intro,
    config: parsed
      ? {
          usageExample: parsed.usageExample,
          outputSpec: parsed.outputSpec,
          inputReq: parsed.inputReq,
          pitfallGuide: parsed.pitfallGuide,
          checklist: parsed.checklist,
          reference: parsed.reference,
        }
      : emptySkillConfig(),
    activationMode: activation.activationMode,
    activationGlobs: activation.activationGlobs,
    editable: options.editable,
  };
}

export function mapDescriptorToSkillCard(
  view: TenantDescriptorView,
  listing?: { listed: boolean } | null,
  options?: { editable?: boolean; summaryOnly?: boolean },
): SkillCardItem {
  const content = (view.content ?? { description: "", instructions: "" }) as TenantSkillContentShape;
  const visual = pickSkillVisual(view.id);
  const summaryOnly = options?.summaryOnly === true || !content.instructions?.trim();
  const base = mapContentToSkillCardBase(view.id, content, {
    published: view.status === "published",
    version: view.publishedVersionNo != null ? `v${view.publishedVersionNo}` : `v${view.headVersionNo}`,
    editable: options?.editable ?? false,
    summaryOnly,
  });
  return {
    ...base,
    icon: visual.icon,
    iconClass: visual.iconClass,
    published: listing?.listed ?? view.status === "published",
    listedInLibrary: listing?.listed === true,
  };
}

export function mapLibraryItemToSkillCard(
  item: LibraryItemView,
  installedRefs?: ReadonlySet<string>,
  shelfByTarget?: ReadonlyMap<string, ShelfEntryView>,
  authoredIds?: ReadonlySet<string>,
  options?: { summaryOnly?: boolean },
): SkillCardItem {
  const visual = pickSkillVisual(item.ref);
  const summaryOnly = options?.summaryOnly !== false;
  const systemProfile = item.tier === "system" ? resolveSystemBuiltinSkillContent(item.ref) : null;
  // 列表只用库元数据；详情才带 content / 系统内置完整 instructions
  const content: TenantSkillContentShape =
    !summaryOnly && item.tier === "tenant" && item.content && typeof item.content === "object"
      ? (item.content as TenantSkillContentShape)
      : !summaryOnly && item.tier === "system" && systemProfile
        ? {
            displayName: systemProfile.displayName,
            description: systemProfile.description,
            tags: systemProfile.tags,
            version: systemProfile.version,
            instructions: systemProfile.instructions,
          }
        : {
            displayName: item.displayName ?? systemProfile?.displayName,
            description: item.description ?? systemProfile?.description,
            tags: item.tags ?? systemProfile?.tags,
            version: systemProfile?.version,
            instructions: "",
          };

  const shelfEntry = shelfByTarget?.get(item.ref);
  const latestVersionNo = item.tier === "tenant" && item.sharedVersionNo != null ? item.sharedVersionNo : undefined;
  const hasUpdate =
    shelfEntry != null && latestVersionNo != null && shelfEntry.pinVersionNo != null && latestVersionNo > shelfEntry.pinVersionNo;

  const base = mapContentToSkillCardBase(item.ref, content, {
    libraryRef: item.ref,
    isBuiltin: item.tier === "system",
    published: true,
    version: item.tier === "tenant" && item.sharedVersionNo != null ? `v${item.sharedVersionNo}` : (content.version ?? "v1.0.0"),
    editable: false,
    summaryOnly,
  });

  return {
    ...base,
    icon: visual.icon,
    iconClass: visual.iconClass,
    added: installedRefs?.has(item.ref) ?? false,
    hasUpdate,
    shelfId: shelfEntry?.id,
    canUnlist: item.tier === "tenant" && item.ref.startsWith("skl_") && (authoredIds?.has(item.ref) ?? false),
    localVersion: shelfEntry?.pinVersionNo != null ? `v${shelfEntry.pinVersionNo}` : base.version,
  };
}

export function mapShelfEntryToSkillCard(entry: ShelfEntryView, libraryByRef: Map<string, LibraryItemView>): SkillCardItem {
  const visual = pickSkillVisual(entry.targetId);
  const libraryItem = libraryByRef.get(entry.targetId);
  const systemProfile = libraryItem?.tier === "system" || !libraryItem ? resolveSystemBuiltinSkillContent(entry.targetId) : null;
  const resolvedDisplayName = resolveShelfSkillDisplayName(entry, libraryItem);
  const resolvedDescription = resolveShelfSkillDescription(entry, libraryItem);
  // 货架列表只拼摘要；库 browse 已不含 content，勿再依赖 instructions
  const content: TenantSkillContentShape = {
    displayName: resolvedDisplayName,
    description: resolvedDescription,
    tags: libraryItem?.tags ?? systemProfile?.tags,
    instructions: "",
  };

  const latestVersionNo = libraryItem?.tier === "tenant" && libraryItem.sharedVersionNo != null ? libraryItem.sharedVersionNo : undefined;
  const hasUpdate = entry.source === "ref" && latestVersionNo != null && entry.pinVersionNo != null && latestVersionNo > entry.pinVersionNo;

  const base = mapContentToSkillCardBase(entry.targetId, content, {
    libraryRef: entry.source === "ref" ? entry.targetId : undefined,
    isBuiltin: entry.source === "ref" && (libraryItem?.tier === "system" || systemProfile != null),
    published: entry.runnableStatus === "runnable",
    version: entry.effectiveVersionNo != null ? `v${entry.effectiveVersionNo}` : "v1.0.0",
    editable: false,
    summaryOnly: true,
  });

  return {
    ...base,
    icon: visual.icon,
    iconClass: visual.iconClass,
    name: resolvedDisplayName,
    description: resolvedDescription || base.description,
    shelfId: entry.id,
    fromLibrary: true,
    editable: false,
    added: true,
    hasUpdate,
    localVersion: entry.pinVersionNo != null ? `v${entry.pinVersionNo}` : base.version,
  };
}

export async function fetchInstalledLibrarySkillRefs(): Promise<Set<string>> {
  const shelf = await agentConsoleClient.mySkills({ source: "ref" });
  return new Set(shelf.filter((entry) => entry.targetKind === "skill").map((entry) => entry.targetId));
}

/** 货架上已拥有的技能 ref（含库安装 + 本人创作），用于技能库「已添加」态。 */
export async function fetchOwnedSkillRefs(): Promise<Set<string>> {
  const shelf = await agentConsoleClient.mySkills();
  return new Set(shelf.filter((entry) => entry.targetKind === "skill").map((entry) => entry.targetId));
}

async function buildLibrarySkillLookup(): Promise<Map<string, LibraryItemView>> {
  const map = new Map<string, LibraryItemView>();
  for (const tier of ["system", "tenant"] as const) {
    try {
      const items = filterUserVisibleLibraryItems(await agentConsoleClient.browseLibrarySkills({ tier }));
      for (const item of items) {
        map.set(item.ref, item);
      }
    } catch {
      /* 单 tier 失败不阻塞其余来源 */
    }
  }
  return map;
}

async function resolveSkillListing(skillId: string): Promise<{ listed: boolean } | null> {
  try {
    return await agentConsoleClient.getSkillListing(skillId);
  } catch {
    return null;
  }
}

function buildLibrarySkillCardsFromBrowse(
  systemItems: LibraryItemView[],
  tenantItems: LibraryItemView[],
  allShelf: ShelfEntryView[],
  opts?: { category?: SkillCategoryCode },
): SkillCardItem[] {
  const skillShelf = allShelf.filter((entry) => entry.targetKind === "skill");
  const ownedRefs = new Set(skillShelf.map((entry) => entry.targetId));
  const refShelf = skillShelf.filter((entry) => entry.source === "ref");
  const authoredIds = new Set(skillShelf.filter((entry) => entry.source === "authored").map((entry) => entry.targetId));
  const shelfByTarget = new Map(refShelf.map((entry) => [entry.targetId, entry]));

  let cards = filterUserVisibleLibraryItems([...systemItems, ...tenantItems]).map((item) =>
    mapLibraryItemToSkillCard(item, ownedRefs, shelfByTarget, authoredIds, { summaryOnly: true }),
  );
  if (opts?.category) {
    cards = cards.filter((skill) => skill.categoryCode === opts.category);
  }
  return cards;
}

function mapAuthoredShelfSummary(
  entry: ShelfEntryView,
  view: TenantDescriptorView | null | undefined,
  listedInLibrary: boolean,
): SkillCardItem {
  const visual = pickSkillVisual(entry.targetId);
  if (view) {
    // listSkills 已去掉 instructions；此处只拼卡片摘要，详情再 getSkill
    const card = mapDescriptorToSkillCard(view, { listed: listedInLibrary }, { editable: true, summaryOnly: true });
    return {
      ...card,
      shelfId: entry.id,
      fromLibrary: false,
      added: true,
    };
  }
  const base = mapContentToSkillCardBase(
    entry.targetId,
    { displayName: entry.displayName, description: "", instructions: "" },
    {
      published: entry.runnableStatus === "runnable",
      version: entry.effectiveVersionNo != null ? `v${entry.effectiveVersionNo}` : "v1.0.0",
      editable: true,
      summaryOnly: true,
    },
  );
  return {
    ...base,
    icon: visual.icon,
    iconClass: visual.iconClass,
    shelfId: entry.id,
    fromLibrary: false,
    added: true,
    listedInLibrary,
  };
}

async function buildMySkillCardsFromShelf(
  allShelf: ShelfEntryView[],
  libraryByRef: Map<string, LibraryItemView>,
): Promise<SkillCardItem[]> {
  const skillShelf = allShelf.filter((entry) => entry.targetKind === "skill");
  const refEntries = skillShelf.filter((entry) => entry.source === "ref");
  const authoredEntries = skillShelf.filter((entry) => entry.source === "authored");

  // 一次 listSkills（无 instructions），避免 N× getSkill / getSkillListing
  const authoredById = new Map<string, TenantDescriptorView>();
  if (authoredEntries.length > 0) {
    try {
      const listed = await agentConsoleClient.listSkills();
      for (const view of listed) {
        authoredById.set(view.id, view);
      }
    } catch {
      /* 列表失败时退回货架 displayName */
    }
  }

  const authoredCards = authoredEntries.map((entry) =>
    mapAuthoredShelfSummary(entry, authoredById.get(entry.targetId), libraryByRef.has(entry.targetId)),
  );
  const refCards = refEntries.map((entry) => mapShelfEntryToSkillCard(entry, libraryByRef));
  return [...authoredCards, ...refCards];
}

/** 技能库：系统预置 + 租户已上架技能。 */
export async function fetchLibrarySkillCards(opts?: { q?: string; category?: SkillCategoryCode }): Promise<SkillCardItem[]> {
  const q = opts?.q?.trim();
  const browseOpts = q ? { q } : {};
  // 只拉一次 mySkills（旧实现同时调了 fetchOwnedSkillRefs + mySkills，重复一次）
  const [systemItems, tenantItems, allShelfRaw] = await Promise.all([
    agentConsoleClient.browseLibrarySkills({ tier: "system", ...browseOpts }),
    agentConsoleClient.browseLibrarySkills({ tier: "tenant", ...browseOpts }),
    agentConsoleClient.mySkills(),
  ]);
  const allShelf = filterUserVisibleShelfEntries(allShelfRaw);
  return buildLibrarySkillCardsFromBrowse(systemItems, tenantItems, allShelf, { category: opts?.category });
}

/** 我的技能：货架 authored（本人创作）+ ref（库安装）。 */
export async function fetchMySkillCards(): Promise<SkillCardItem[]> {
  const shelf = filterUserVisibleShelfEntries(await agentConsoleClient.mySkills());
  const skillShelf = shelf.filter((entry) => entry.targetKind === "skill");
  const refEntries = skillShelf.filter((entry) => entry.source === "ref");
  const libraryByRef = refEntries.length > 0 ? await buildLibrarySkillLookup() : new Map<string, LibraryItemView>();
  return buildMySkillCardsFromShelf(shelf, libraryByRef);
}

/**
 * Hub 页一次拉齐「库 + 我的」：mySkills / browseLibrary 各只请求一轮，避免两 tab 并行加载时的重复。
 */
export async function fetchSkillHubSnapshot(): Promise<{
  librarySkills: SkillCardItem[];
  mySkills: SkillCardItem[];
}> {
  const [systemItems, tenantItems, allShelfRaw] = await Promise.all([
    agentConsoleClient.browseLibrarySkills({ tier: "system" }),
    agentConsoleClient.browseLibrarySkills({ tier: "tenant" }),
    agentConsoleClient.mySkills(),
  ]);
  const allShelf = filterUserVisibleShelfEntries(allShelfRaw);
  const libraryByRef = new Map<string, LibraryItemView>();
  for (const item of filterUserVisibleLibraryItems([...systemItems, ...tenantItems])) {
    libraryByRef.set(item.ref, item);
  }

  const [librarySkills, mySkills] = await Promise.all([
    Promise.resolve(buildLibrarySkillCardsFromBrowse(systemItems, tenantItems, allShelf)),
    buildMySkillCardsFromShelf(allShelf, libraryByRef),
  ]);
  return { librarySkills, mySkills };
}

/** 拉取技能详情（库 ref 或租户 descriptor）。 */
export async function fetchSkillCardDetail(skillId: string, mode: "library" | "mine"): Promise<SkillCardItem | null> {
  try {
    if (skillId.startsWith("skl_")) {
      const view = await agentConsoleClient.getSkill(skillId);
      const listing = await resolveSkillListing(skillId);
      const card = mapDescriptorToSkillCard(view, listing, { editable: mode === "mine" });
      if (mode !== "mine") {
        return card;
      }
      const shelf = await agentConsoleClient.mySkills();
      const shelfEntry = shelf.find((entry) => entry.targetKind === "skill" && entry.targetId === skillId);
      return {
        ...card,
        shelfId: shelfEntry?.id,
        fromLibrary: false,
        editable: true,
      };
    }
    const item = await agentConsoleClient.getLibrarySkill(skillId);
    const ownedRefs = await fetchOwnedSkillRefs();
    const allShelf = await agentConsoleClient.mySkills();
    const refShelf = allShelf.filter((entry) => entry.targetKind === "skill" && entry.source === "ref");
    const authoredIds = new Set(
      allShelf.filter((entry) => entry.targetKind === "skill" && entry.source === "authored").map((entry) => entry.targetId),
    );
    const shelfByTarget = new Map(refShelf.map((entry) => [entry.targetId, entry]));
    const shelfEntry = shelfByTarget.get(skillId);
    const card = mapLibraryItemToSkillCard(item, ownedRefs, shelfByTarget, authoredIds, { summaryOnly: false });
    if (mode === "mine") {
      return {
        ...card,
        editable: false,
        fromLibrary: true,
        shelfId: shelfEntry?.id,
        added: true,
      };
    }
    return card;
  } catch {
    return null;
  }
}

export { deriveDescriptorName };

// Format skill status label
export function formatSkillStatusLabel(item: SkillCardItem): string {
  if (item.isBuiltin) {
    return "内置";
  }
  if (item.added) {
    return item.hasUpdate ? "有新版本" : "已添加";
  }
  return item.published ? "已发布" : "草稿";
}

// Skill form state for create/edit
export interface SkillFormState {
  id?: string;
  name: string;
  description: string;
  category: SkillCategoryCode;
  intro: string;
  published: boolean;
  // Six configurations
  usageExample: string;
  outputSpec: string;
  inputReq: string;
  pitfallGuide: string;
  checklist: string;
  reference: string;
  activationMode: SkillActivationMode;
  activationGlobs: string[];
  fromLibrary?: boolean;
  shelfId?: string;
}

// Initial form state
export function createInitialSkillForm(): SkillFormState {
  return {
    name: "",
    description: "",
    category: "WORK_EXECUTION",
    intro: "",
    activationMode: DEFAULT_SKILL_ACTIVATION_MODE,
    activationGlobs: [],
    published: false,
    usageExample: "",
    outputSpec: "",
    inputReq: "",
    pitfallGuide: "",
    checklist: "",
    reference: "",
  };
}

// Six configuration descriptions
/** cube-ui Textarea 默认 maxlength=500 且显示字数；技能长文本需放开 */
export const SKILL_LONG_TEXTAREA_PROPS = {
  showCount: false,
  maxlength: 20_000,
} as const;

export const SKILL_META_TEXTAREA_AUTO_SIZE = { minRows: 2, maxRows: 6 } as const;

export const SIX_CONFIG_DESCRIPTIONS: Record<keyof SkillConfig, string> = {
  usageExample: "用户输入→AI输出 配对示例",
  outputSpec: "格式模板 + 成功标准",
  inputReq: "必填 + 可选信息项",
  pitfallGuide: "易错点 + 正确做法",
  checklist: "输出前逐项核对",
  reference: "上传图片、文档等模板/手册资料",
};

/** 对话创建技能的六项 + 元信息 */
export interface SkillGeneratedConfig {
  name: string;
  description: string;
  category?: SkillCategoryCode;
  intro?: string;
  usageExample: string;
  outputSpec: string;
  inputReq: string;
  pitfallGuide: string;
  checklist: string;
  reference: string;
  activationMode: SkillActivationMode;
  activationGlobs: string[];
  finished: boolean;
}

export function createInitialGeneratedConfig(): SkillGeneratedConfig {
  return {
    name: "",
    description: "",
    usageExample: "",
    outputSpec: "",
    inputReq: "",
    pitfallGuide: "",
    checklist: "",
    reference: "",
    activationMode: DEFAULT_SKILL_ACTIVATION_MODE,
    activationGlobs: [],
    finished: false,
  };
}

const SKILL_CREATE_WELCOME_MESSAGE =
  '你好！请告诉我要创建的<strong>技能名称</strong>和<strong>功能描述</strong>（例如："隐患整改通知单生成，根据巡检结果自动填入整改项目"），我会自动生成六项配置。';

export function getSkillCreateWelcomeMessage(): string {
  return SKILL_CREATE_WELCOME_MESSAGE;
}

/** 解析对话输入中的技能名称与功能描述 */
export function parseSkillCreateInput(text: string): { name: string; description: string } | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const commaMatch = trimmed.match(/^(.+?)[，,]\s*(.+)$/);
  if (commaMatch) {
    const name = commaMatch[1]?.trim() ?? "";
    const description = commaMatch[2]?.trim() ?? "";
    if (name.length >= 2 && description.length >= 4) {
      return { name, description };
    }
  }

  const colonMatch = trimmed.match(/^(.+?)[：:]\s*(.+)$/);
  if (colonMatch) {
    const name = colonMatch[1]?.trim() ?? "";
    const description = colonMatch[2]?.trim() ?? "";
    if (name.length >= 2 && description.length >= 4) {
      return { name, description };
    }
  }

  if (trimmed.length >= 8) {
    const name = trimmed.slice(0, Math.min(20, trimmed.length));
    return { name, description: trimmed };
  }

  return null;
}

function resolveCategoryLabel(category?: SkillCategoryCode): SkillCategory {
  if (category && category in SKILL_CATEGORY_REVERSE_MAP) {
    return SKILL_CATEGORY_REVERSE_MAP[category];
  }
  return "工作执行";
}

/** 按产品 §4.2.2 生成六项默认 Markdown 模板 */
export function buildDefaultSixConfig(
  name: string,
  description: string,
  category?: SkillCategoryCode,
): Pick<SkillGeneratedConfig, "intro" | "usageExample" | "outputSpec" | "inputReq" | "pitfallGuide" | "checklist" | "reference"> {
  const categoryLabel = resolveCategoryLabel(category);
  const descPreview = description.length > 40 ? `${description.slice(0, 40)}…` : description;

  return {
    intro: description,
    usageExample: `示例 1
用户输入："${descPreview}"
AI输出：根据「${name}」的功能定位，生成符合${categoryLabel}场景的标准化输出。

示例 2
用户输入：请针对当前${categoryLabel}场景生成一份${name}
AI输出：识别场景要素，匹配预设模板，生成结构化${name}内容。`,
    outputSpec: `【输出格式】
# 【${name}】

## 基本信息
- 任务类型：【由AI填充】
- 处理时间：【由AI填充】
- 处理状态：【由AI填充】

## 输出内容
【由AI根据用户输入和技能定位自动生成】

【成功标准】
□ 输出结果完整，包含所有必填字段
□ 格式规范，符合${categoryLabel}领域标准
□ 数据准确，无幻觉或错误信息`,
    inputReq: `【必填】
- ${categoryLabel}场景描述或具体任务说明
- 处理目标或期望结果

【可选】
- 参考模板或历史数据
- 特殊约束或偏好说明`,
    pitfallGuide: `1. 容易犯的错误：AI 可能忽略${categoryLabel}领域的专业术语规范
   正确做法：在生成内容前先确认术语表或参考资源

2. 容易犯的错误：AI 可能输出过于通用的内容，缺乏针对性
   正确做法：要求 AI 结合具体场景和输入数据进行定制化输出`,
    checklist: `□ 输出结果是否包含所有必填字段
□ 格式是否符合${categoryLabel}领域规范
□ 数据是否有明确的来源引用
□ 是否存在明显的事实错误或幻觉
□ 输出内容是否可直接交付或只需微调`,
    reference: "",
  };
}

function isNonEmpty(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

/** AI 结果与默认模板合并；onlyKeys 存在时仅更新指定项 */
export function mergeGeneratedConfig(
  aiParsed: SkillConfig & { intro?: string },
  defaults: SkillConfig & { intro?: string },
  options?: { onlyKeys?: readonly SixConfigKey[] },
): SkillConfig & { intro?: string } {
  const keys = options?.onlyKeys ?? SIX_CONFIG_KEYS;
  const result: SkillConfig & { intro?: string } = { ...defaults };

  for (const key of keys) {
    if (isNonEmpty(aiParsed[key])) {
      result[key] = aiParsed[key]!.trim();
    }
  }

  if (!options?.onlyKeys && isNonEmpty(aiParsed.intro)) {
    result.intro = aiParsed.intro!.trim();
  }

  return result;
}

export function resolveConfigKeyFromLabel(label: string): SixConfigKey | null {
  const trimmed = label.trim();
  const byKey = SIX_CONFIG_KEYS.find((key) => key === trimmed);
  if (byKey) {
    return byKey;
  }
  const byLabel = (Object.keys(SIX_CONFIG_LABELS) as SixConfigKey[]).find((key) => SIX_CONFIG_LABELS[key] === trimmed);
  return byLabel ?? null;
}

export function validateSixConfig(
  config: Pick<SkillGeneratedConfig, "usageExample" | "outputSpec" | "inputReq" | "pitfallGuide" | "checklist">,
): { valid: boolean; missing: { key: SixConfigKey; label: string }[] } {
  const requiredKeys: SixConfigKey[] = ["usageExample", "outputSpec", "inputReq", "pitfallGuide", "checklist"];
  const missing = requiredKeys.filter((key) => !isNonEmpty(config[key])).map((key) => ({ key, label: SIX_CONFIG_LABELS[key] }));
  return { valid: missing.length === 0, missing };
}

export function isConfirmCreateMessage(text: string): boolean {
  const normalized = text.trim().replaceAll(/\s+/g, "");
  return normalized === "确认创建" || normalized === "确认";
}

export function isConfirmSaveMessage(text: string): boolean {
  const normalized = text.trim().replaceAll(/\s+/g, "");
  return normalized === "确认保存" || normalized === "保存" || isConfirmCreateMessage(text);
}

const SKILL_PROPOSE_CHINESE_HINT = "请全程使用简体中文撰写（含技能描述、技能详情及六项配置），不要使用英文。";

/** 为 propose intent/focus 追加简体中文要求，避免生成英文技能详情。 */
export function withSkillProposeLanguageHint(text: string): string {
  const trimmed = text.trim();
  if (/简体中文|使用中文|中文撰写|不要用英文/.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}\n\n【语言要求】${SKILL_PROPOSE_CHINESE_HINT}`;
}

/** @配置项 定向修改时构造 focus，约束 AI 只改单项且保留 ghcloud 章节标题。 */
export function buildFocusedConfigProposeFocus(configKey: SixConfigKey, directiveText: string): string {
  const label = SIX_CONFIG_LABELS[configKey];
  return [
    directiveText.trim(),
    "",
    "【定向修改 — 必须遵守】",
    `1. 仅修改「${label}」这一项；不要重写技能详情、技能描述或其他五项配置。`,
    `2. instructions 中必须保留章节标题「## ${label}」，只输出/更新该章节正文。`,
    "3. 不要输出其他 ## 章节（使用示例、输入要求、避坑指南、自检清单、参考资源），除非用户明确要求。",
    `4. 在现有「## ${label}」内容基础上按用户意见修改，不要整篇重写全部技能说明。`,
  ].join("\n");
}

export function hasProposeUpdatesForKeys(instructions: string, onlyKeys: readonly SixConfigKey[]): boolean {
  const parsed = parseSkillInstructionsFromPropose(instructions, { onlyKeys });
  return onlyKeys.some((key) => isNonEmpty(parsed[key]));
}

export function formStateToGeneratedConfig(form: SkillFormState): SkillGeneratedConfig {
  return {
    name: form.name,
    description: form.description,
    category: form.category,
    intro: form.intro ?? "",
    activationMode: form.activationMode,
    activationGlobs: form.activationGlobs,
    usageExample: form.usageExample,
    outputSpec: form.outputSpec,
    inputReq: form.inputReq,
    pitfallGuide: form.pitfallGuide,
    checklist: form.checklist,
    reference: form.reference,
    finished: true,
  };
}

export function generatedConfigToFormState(config: SkillGeneratedConfig, options: { id?: string; published?: boolean }): SkillFormState {
  return {
    ...(options.id !== undefined ? { id: options.id } : {}),
    name: config.name,
    description: config.description,
    category: config.category ?? "WORK_EXECUTION",
    intro: config.intro ?? "",
    activationMode: config.activationMode ?? DEFAULT_SKILL_ACTIVATION_MODE,
    activationGlobs: config.activationGlobs ?? [],
    published: options.published ?? false,
    usageExample: config.usageExample,
    outputSpec: config.outputSpec,
    inputReq: config.inputReq,
    pitfallGuide: config.pitfallGuide,
    checklist: config.checklist,
    reference: config.reference,
  };
}

export function applySkillProposeContent(
  current: SkillGeneratedConfig,
  content: { displayName?: string; description?: string; instructions?: string },
  options?: { onlyKeys?: readonly SixConfigKey[] },
): SkillGeneratedConfig {
  const parsed = parseSkillInstructionsFromPropose(content.instructions ?? "", options);
  const merged = mergeGeneratedConfig(
    parsed,
    {
      intro: current.intro,
      usageExample: current.usageExample,
      outputSpec: current.outputSpec,
      inputReq: current.inputReq,
      pitfallGuide: current.pitfallGuide,
      checklist: current.checklist,
      reference: current.reference,
    },
    options,
  );

  const isFocusedUpdate = Boolean(options?.onlyKeys?.length > 0);

  return {
    ...current,
    name: isFocusedUpdate ? current.name : content.displayName?.trim() || current.name,
    description: isFocusedUpdate ? current.description : content.description?.trim() || current.description,
    intro: merged.intro ?? current.intro ?? "",
    activationMode: current.activationMode,
    activationGlobs: current.activationGlobs,
    usageExample: merged.usageExample ?? current.usageExample,
    outputSpec: merged.outputSpec ?? current.outputSpec,
    inputReq: merged.inputReq ?? current.inputReq,
    pitfallGuide: merged.pitfallGuide ?? current.pitfallGuide,
    checklist: merged.checklist ?? current.checklist,
    reference: merged.reference ?? current.reference,
    finished: true,
  };
}

export function getSkillEditWelcomeMessage(skillName: string): string {
  const name = skillName.trim() || "技能";
  return `你好！当前正在编辑<strong>${name}</strong>。请描述修改需求，我会基于现有配置调整；也可用 <code>@配置项名称</code> + 修改意见定向优化某项。确认后回复「确认保存」或点击右下角保存。`;
}

/** 将 AI propose 结果与默认模板合并为完整 GeneratedConfig */
export function buildGeneratedConfigFromPropose(
  parsed: SkillConfig & { intro?: string },
  input: { name: string; description: string; category?: SkillCategoryCode },
  options?: { onlyKeys?: readonly SixConfigKey[] },
): SkillGeneratedConfig {
  const defaults = buildDefaultSixConfig(input.name, input.description, input.category);
  const merged = mergeGeneratedConfig(parsed, defaults, options);

  return {
    name: input.name,
    description: input.description,
    ...(input.category !== undefined ? { category: input.category } : {}),
    intro: merged.intro ?? input.description,
    activationMode: DEFAULT_SKILL_ACTIVATION_MODE,
    activationGlobs: [],
    usageExample: merged.usageExample ?? defaults.usageExample,
    outputSpec: merged.outputSpec ?? defaults.outputSpec,
    inputReq: merged.inputReq ?? defaults.inputReq,
    pitfallGuide: merged.pitfallGuide ?? defaults.pitfallGuide,
    checklist: merged.checklist ?? defaults.checklist,
    reference: merged.reference ?? "",
    finished: true,
  };
}

// Convert SkillCardItem to form state
export function skillToForm(skill: SkillCardItem): SkillFormState {
  return {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    category: skill.categoryCode,
    intro: skill.intro ?? "",
    activationMode: skill.activationMode ?? DEFAULT_SKILL_ACTIVATION_MODE,
    activationGlobs: skill.activationGlobs ?? [],
    published: skill.published,
    fromLibrary: skill.fromLibrary ?? false,
    shelfId: skill.shelfId,
    usageExample: skill.config.usageExample ?? "",
    outputSpec: skill.config.outputSpec ?? "",
    inputReq: skill.config.inputReq ?? "",
    pitfallGuide: skill.config.pitfallGuide ?? "",
    checklist: skill.config.checklist ?? "",
    reference: skill.config.reference ?? "",
  };
}

// Convert form state to SkillCardItem (partial)
export function formToSkillPartial(form: SkillFormState): Omit<SkillCardItem, "icon" | "iconClass"> {
  const category = SKILL_CATEGORY_REVERSE_MAP[form.category] ?? "工作执行";
  return {
    id: form.id ?? `skill-${Date.now()}`,
    name: form.name,
    description: form.description,
    category,
    categoryCode: form.category,
    version: "v1.0.0",
    isBuiltin: false,
    published: form.published,
    intro: form.intro,
    activationMode: form.activationMode,
    activationGlobs: form.activationGlobs,
    config: {
      usageExample: form.usageExample,
      outputSpec: form.outputSpec,
      inputReq: form.inputReq,
      pitfallGuide: form.pitfallGuide,
      checklist: form.checklist,
      reference: form.reference,
    },
    editable: true,
  };
}
