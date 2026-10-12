/**
 * 预案审批前后版本差异比对。
 *
 * 富文本正文按标题拆分为章节、结构化任务作为独立章节；
 * 章节间按归一化标题做 LCS 对齐，章节内行再做一次 LCS 对齐，
 * 同一变更段内标签（冒号/竖线前的部分）相同的删除行与新增行配对为"修改"。
 */

export interface PlanTaskSnapshot {
  name?: unknown;
  durationMinutes?: unknown;
  executors?: Array<{
    executorType?: unknown;
    executorId?: unknown;
    user?: { name?: unknown } | null;
  }> | null;
}

export interface PlanDefinitionSnapshot {
  file?: { contentHtml?: unknown } | null;
  tasks?: PlanTaskSnapshot[] | null;
}

export interface PlanLine {
  /** 行文本（任务行为 "名称 | 时限 | 执行人"）。 */
  text: string;
  /** 行标签（冒号或竖线前的部分），用于修改配对。 */
  label: string | null;
  /** 任务行的结构化信息，用于渲染时限/执行人图标。 */
  task?: {
    name: string;
    durationMinutes: number | null;
    executorNames: string[];
  };
}

export interface PlanSection {
  /** 章节对齐键（归一化标题）。 */
  key: string;
  title: string;
  isTasks?: boolean;
  lines: PlanLine[];
}

export type DiffItemKind = "add" | "del" | "mod";

export interface DiffItem {
  kind: DiffItemKind;
  before?: PlanLine;
  after?: PlanLine;
}

export interface DiffGroup {
  /** same=无变更；add=整节新增；del=整节删除；change=节内有差异。 */
  type: "same" | "add" | "del" | "change";
  key: string;
  title: string;
  isTasks?: boolean;
  items: DiffItem[];
  addCount: number;
  delCount: number;
  modCount: number;
}

export interface SideLineStates {
  before: Map<string, "del" | "mod">;
  after: Map<string, "add" | "mod">;
}

type ResolveName = (id: unknown) => string | null | undefined;

const TASKS_SECTION_KEY = "__tasks__";
const TASKS_SECTION_TITLE = "结构化任务";
const PRE_SECTION_KEY = "content:__pre__";

/** 将一侧快照（before/after）转换为章节列表。 */
export function buildVersion(snapshot: PlanDefinitionSnapshot | null | undefined, resolveName?: ResolveName): PlanSection[] {
  if (!snapshot) {
    return [];
  }
  const sections = parseContentSections(snapshot.file?.contentHtml);
  const tasksSection = buildTasksSection(snapshot.tasks, resolveName);
  if (tasksSection) {
    sections.push(tasksSection);
  }
  return sections;
}

/** 汇总差异分组，生成中栏摘要文案。 */
export function groupSummary(group: DiffGroup): string {
  if (group.type === "same") {
    return "无变更";
  }
  if (group.type === "add") {
    return group.isTasks ? `新增${group.addCount}个任务` : "整节新增";
  }
  if (group.type === "del") {
    return group.isTasks ? `删除${group.delCount}个任务` : "整节删除";
  }
  const unit = group.isTasks ? "个任务" : "处";
  const parts: string[] = [];
  if (group.delCount) {
    parts.push(`删除${group.delCount}${unit}`);
  }
  if (group.addCount) {
    parts.push(`新增${group.addCount}${unit}`);
  }
  if (group.modCount) {
    parts.push(`变更${group.modCount}${unit}`);
  }
  return parts.join("，");
}

/** 从差异分组收集两侧行高亮状态。 */
export function collectLineStates(groups: DiffGroup[]): SideLineStates {
  const before = new Map<string, "del" | "mod">();
  const after = new Map<string, "add" | "mod">();
  groups.forEach((group) => {
    group.items.forEach((item) => {
      if (item.kind === "del" && item.before) {
        before.set(stateKey(group.key, item.before), "del");
      } else if (item.kind === "add" && item.after) {
        after.set(stateKey(group.key, item.after), "add");
      } else if (item.kind === "mod" && item.before && item.after) {
        before.set(stateKey(group.key, item.before), "mod");
        after.set(stateKey(group.key, item.after), "mod");
      }
    });
  });
  return { before, after };
}

/** 计算前后两版本的差异分组。 */
export function diffVersions(before: PlanSection[], after: PlanSection[]): DiffGroup[] {
  const groups: DiffGroup[] = [];
  alignSections(before, after).forEach(({ b, a }) => {
    if (b && !a) {
      groups.push(wholeSectionGroup("del", b));
    } else if (!b && a) {
      groups.push(wholeSectionGroup("add", a));
    } else if (b && a) {
      const items = diffLines(b.lines, a.lines);
      groups.push({
        type: items.length ? "change" : "same",
        key: a.key,
        title: a.title || b.title,
        isTasks: a.isTasks,
        items,
        addCount: items.filter((item) => item.kind === "add").length,
        delCount: items.filter((item) => item.kind === "del").length,
        modCount: items.filter((item) => item.kind === "mod").length,
      });
    }
  });
  return groups;
}

function wholeSectionGroup(type: "add" | "del", section: PlanSection): DiffGroup {
  const items: DiffItem[] = section.lines.map((line) => (type === "add" ? { kind: "add", after: line } : { kind: "del", before: line }));
  return {
    type,
    key: section.key,
    title: section.title,
    isTasks: section.isTasks,
    items,
    addCount: type === "add" ? items.length : 0,
    delCount: type === "del" ? items.length : 0,
    modCount: 0,
  };
}

function alignSections(before: PlanSection[], after: PlanSection[]): Array<{ b: PlanSection | null; a: PlanSection | null }> {
  const ops = lcsOps(
    before.map((section) => section.key),
    after.map((section) => section.key),
  );
  const aligned: Array<{ b: PlanSection | null; a: PlanSection | null }> = [];
  let bi = 0;
  let ai = 0;
  ops.forEach((op) => {
    if (op === "eq") {
      aligned.push({ b: before[bi++], a: after[ai++] });
    } else if (op === "del") {
      aligned.push({ b: before[bi++], a: null });
    } else {
      aligned.push({ b: null, a: after[ai++] });
    }
  });
  return aligned;
}

function diffLines(before: PlanLine[], after: PlanLine[]): DiffItem[] {
  const ops = lcsOps(
    before.map((line) => line.text),
    after.map((line) => line.text),
  );
  const items: DiffItem[] = [];
  let runDel: number[] = [];
  let runAdd: number[] = [];
  let bi = 0;
  let ai = 0;
  const flush = () => {
    if (!runDel.length && !runAdd.length) {
      return;
    }
    const usedAdds = new Set<number>();
    const modItems: DiffItem[] = [];
    const delItems: DiffItem[] = [];
    runDel.forEach((index) => {
      const label = before[index].label;
      const match = label ? runAdd.find((addIndex) => !usedAdds.has(addIndex) && after[addIndex].label === label) : undefined;
      if (match !== undefined) {
        usedAdds.add(match);
        modItems.push({ kind: "mod", before: before[index], after: after[match] });
      } else {
        delItems.push({ kind: "del", before: before[index] });
      }
    });
    const addItems: DiffItem[] = runAdd
      .filter((index) => !usedAdds.has(index))
      .map((index) => ({ kind: "add" as const, after: after[index] }));
    items.push(...delItems, ...modItems, ...addItems);
    runDel = [];
    runAdd = [];
  };
  ops.forEach((op) => {
    if (op === "eq") {
      flush();
      bi++;
      ai++;
    } else if (op === "del") {
      runDel.push(bi++);
    } else {
      runAdd.push(ai++);
    }
  });
  flush();
  return items;
}

/** 最长公共子序列对齐，返回 before/after 元素的操作序列。 */
function lcsOps(before: string[], after: string[]): Array<"eq" | "del" | "add"> {
  const m = before.length;
  const n = after.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array.from({ length: n + 1 }, () => 0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = before[i] === after[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops: Array<"eq" | "del" | "add"> = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (before[i] === after[j]) {
      ops.push("eq");
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push("del");
      i++;
    } else {
      ops.push("add");
      j++;
    }
  }
  while (i < m) {
    ops.push("del");
    i++;
  }
  while (j < n) {
    ops.push("add");
    j++;
  }
  return ops;
}

function parseContentSections(contentHtml: unknown): PlanSection[] {
  if (typeof contentHtml !== "string" || !contentHtml.trim() || typeof document === "undefined") {
    return [];
  }
  const root = document.createElement("div");
  root.innerHTML = contentHtml;
  const sections: PlanSection[] = [];
  let current: PlanSection = { key: PRE_SECTION_KEY, title: "", lines: [] };
  const pushLine = (text: string) => {
    const normalized = text
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (normalized) {
      current.lines.push({ text: normalized, label: labelOf(normalized) });
    }
  };
  const flush = () => {
    if (current.title || current.lines.length) {
      sections.push(current);
    }
  };
  root.childNodes.forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      if (node.textContent) {
        pushLine(node.textContent);
      }
      return;
    }
    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) {
      flush();
      const title = element.textContent?.replace(/\s+/g, " ").trim() || "";
      current = { key: sectionKey(title), title, lines: [] };
      return;
    }
    if (tag === "ul" || tag === "ol") {
      element.querySelectorAll("li").forEach((li) => pushLine(li.textContent || ""));
      return;
    }
    if (tag === "table") {
      element.querySelectorAll("tr").forEach((tr) => {
        const cells = Array.from(tr.querySelectorAll("th,td"))
          .map((cell) => cell.textContent?.replace(/\s+/g, " ").trim() || "")
          .filter(Boolean);
        if (cells.length) {
          pushLine(cells.join(" | "));
        }
      });
      return;
    }
    pushLine(element.textContent || "");
  });
  flush();
  return sections;
}

function buildTasksSection(tasks: PlanTaskSnapshot[] | null | undefined, resolveName?: ResolveName): PlanSection | null {
  if (!Array.isArray(tasks) || !tasks.length) {
    return null;
  }
  const lines: PlanLine[] = [];
  tasks.forEach((task) => {
    const name = typeof task.name === "string" ? task.name.trim() : "";
    if (!name) {
      return;
    }
    const durationMinutes = typeof task.durationMinutes === "number" ? task.durationMinutes : null;
    const executorNames = (task.executors || [])
      .map((executor) => {
        if (executor?.user && typeof executor.user.name === "string" && executor.user.name.trim()) {
          return executor.user.name.trim();
        }
        return executor?.executorId != null ? resolveName?.(executor.executorId) || null : null;
      })
      .filter((item): item is string => Boolean(item));
    const parts = [name];
    if (durationMinutes != null) {
      parts.push(`${durationMinutes}分钟`);
    }
    if (executorNames.length) {
      parts.push(executorNames.join("、"));
    }
    lines.push({
      text: parts.join(" | "),
      label: name,
      task: { name, durationMinutes, executorNames },
    });
  });
  if (!lines.length) {
    return null;
  }
  return { key: TASKS_SECTION_KEY, title: TASKS_SECTION_TITLE, isTasks: true, lines };
}

function sectionKey(title: string): string {
  const normalized = title
    .trim()
    .toLowerCase()
    .replace(/^[\s§第]*[0-9]+(?:[.．、][0-9]+)*[\s.．、:：]*/, "")
    .replace(/^[\s]*[一二三四五六七八九十百]+[、.．\s:：]*/, "")
    .trim();
  return `content:${normalized || title.trim()}`;
}

function labelOf(text: string): string | null {
  const label = text.split(/[：:|]/)[0]?.trim();
  return label && label.length >= 1 && label.length <= 20 ? label : null;
}

function stateKey(sectionKey: string, line: PlanLine): string {
  return `${sectionKey}::${line.text}`;
}
