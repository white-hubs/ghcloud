import { SKILL_INTRO_SECTION, SIX_CONFIG_KEYS, SIX_CONFIG_LABELS, type SkillConfig } from "./skill-instructions";

export interface SystemBuiltinSkillProfile {
  displayName: string;
  description: string;
  version: string;
  categoryCode: "KNOWLEDGE_CONSULT" | "ANALYSIS_REPORT";
  tags: string[];
  intro: string;
  config: SkillConfig;
}

function buildInstructionsMarkdown(profile: Pick<SystemBuiltinSkillProfile, "intro" | "config">): string {
  const sections: string[] = [];
  if (profile.intro.trim()) {
    sections.push(`## ${SKILL_INTRO_SECTION}\n${profile.intro.trim()}`);
  }
  for (const key of SIX_CONFIG_KEYS) {
    const body = profile.config[key]?.trim();
    if (body) {
      sections.push(`## ${SIX_CONFIG_LABELS[key]}\n${body}`);
    }
  }
  return sections.join("\n\n");
}

const SKILL_CATEGORY_TAG_PREFIX = "ghcloud.skill.category:";

function profileTags(categoryCode: SystemBuiltinSkillProfile["categoryCode"], extra: string[]): string[] {
  return [...extra, `${SKILL_CATEGORY_TAG_PREFIX}${categoryCode}`];
}

/** 系统内置技能展示档案（库 API 不返回 instructions，前端用此补全六项配置）。 */
export const SYSTEM_BUILTIN_SKILL_PROFILES: Record<string, SystemBuiltinSkillProfile> = {
  "default-reasoning": {
    displayName: "默认推理",
    description: "默认推理技能：理解用户意图、拆解执行步骤、按需调用工具，并以简洁、有据的方式给出结论。",
    version: "1.0.0",
    categoryCode: "KNOWLEDGE_CONSULT",
    tags: profileTags("KNOWLEDGE_CONSULT", ["reasoning", "default"]),
    intro:
      "平台内置的通用推理技能，适用于日常问答、任务拆解、信息整合与结果汇总。激活后，助手会先澄清目标，再按步骤推进，仅在确有必要时调用工具，避免冗长铺垫与无依据臆测。",
    config: {
      usageExample: `**示例 1 — 任务拆解**

用户：「帮我整理本周项目进展，列出风险点。」

助手：先确认时间范围与项目范围 → 按「已完成 / 进行中 / 阻塞项」归纳 → 标注风险与建议 → 给出简短结论。

**示例 2 — 工具协同**

用户：「查一下安全生产相关规范，并总结三条要点。」

助手：识别需检索外部或知识库信息 → 调用合适工具获取依据 → 用条目化方式输出要点，并说明信息来源或不确定性。

**示例 3 — 澄清后作答**

用户：「优化一下这个方案。」

助手：先追问缺失上下文（方案对象、约束、目标指标）→ 在信息足够后再给出可执行建议，而非直接泛泛而谈。`,
      outputSpec: `- **先意图、后结论**：首段用一两句话复述用户目标，再给出答案或行动建议。
- **结构清晰**：复杂问题使用有序步骤、分点或短段落；避免大段堆砌。
- **有据可依**：引用工具结果、知识库或用户给定事实；不确定时明确说明假设与局限。
- **适度简洁**：默认控制篇幅；用户要求详细分析时再展开。
- **安全克制**：不编造未验证的数据、法规条文或操作结果；不输出有害、违规内容。
- **技能边界**：本技能不替代专业图表输出（统计可视化请使用「图表输出」技能）或领域专用流程。`,
      inputReq: `**必填**

- 用户问题或任务描述（可含背景、约束、期望格式）。

**可选**

- 相关文档片段、表格数据、历史对话上下文。
- 输出格式偏好（条目、表格、邮件、报告提纲等）。
- 时间范围、对象范围、优先级等约束。`,
      pitfallGuide: `1. **跳过理解直接作答**：未弄清「优化什么」「给谁看」就给出泛化建议。应先澄清关键缺失信息。
2. **工具滥用**：简单常识问题也强行调用检索。应判断是否真的需要外部信息。
3. **结论无依据**：把推测写成确定事实。应区分「已知」「推断」「待确认」。
4. **结构混乱**：多个子问题混在一段里。应分点回应，必要时先列提纲。
5. **过度冗长**：重复用户原话或堆砌套话。应删繁就简，保留可执行信息。`,
      checklist: `- [ ] 是否准确复述了用户核心目标？
- [ ] 步骤或分点是否覆盖用户全部子问题？
- [ ] 关键结论是否有依据或已标注不确定性？
- [ ] 是否避免无关扩写与重复？
- [ ] 是否仅在必要时建议调用工具或引用知识库？
- [ ] 语气是否专业、中立、可执行？`,
      reference: "（内置系统技能，无需额外参考资源。）",
    },
  },
  "chart-output": {
    displayName: "图表输出",
    description:
      "适用于统计、汇总、趋势、对比、可视化、图表、流程图、架构图、时序图等场景；用户提到图表、可视化、统计图、ECharts、Mermaid 时使用。",
    version: "1.0.3",
    categoryCode: "ANALYSIS_REPORT",
    tags: profileTags("ANALYSIS_REPORT", ["chart", "visualization", "mermaid", "echarts"]),
    intro:
      "指导助手在需要**数据可视化**或**结构图示**时，输出可被聊天界面直接渲染的代码块。数据类图表使用 `echarts` 围栏；流程、架构、状态、时序类图示使用 `mermaid` 围栏。正文仅作简要说明，不把渲染责任推给用户或外部编辑器。",
    config: {
      usageExample: `**示例 1 — 数据图表**

用户：「对比一下四个季度的销售额。」

助手：用一两句话说明数据含义 → 输出一个 \`echarts\` 围栏（如柱状图），JSON 内含 \`xAxis.data\` 与 \`series[].data\`。

**示例 2 — 流程图**

用户：「画一下告警处置流程。」

助手：简述流程背景 → 输出 \`mermaid\` 围栏（如 \`flowchart TD\`）。

**示例 3 — 无数据时**

用户：「随便生成几个图看看效果。」

助手：构造少量合理示例数据 → 输出 2～3 个简单 \`echarts\` 图，**不要**用 Mermaid 画数据图。`,
      outputSpec: `### 路由规则

- 统计、趋势、对比、可视化、看板等：使用 **\`echarts\`**。
- 流程图、架构图、状态图、时序图：使用 **\`mermaid\`**。
- 禁止用 Mermaid \`xychart-beta\` / \`pie\` 画数据图。

### 渲染契约

- 仅渲染 \`echarts\` 或 \`mermaid\` 围栏；不提技能名、不推卸到外部编辑器。
- 禁止 \`javascript\` / \`js\` / \`html\` 围栏及 \`echarts.init\`、\`setOption\`、\`option =\` 等初始化代码。

### ECharts 硬性要求

- 围栏内为可被 \`JSON.parse()\` 解析的严格 JSON 对象。
- 禁止 \`formatter\`、\`colorFormatter\`、\`animationDurationUpdate\` 等键。
- 数据写在 \`xAxis.data\`、\`series[].data\` 等字段；无法保证合法 JSON 时改用 Markdown 表格。

### 通用

- 单次回复默认不超过 3 个图表围栏（除非用户明确要求更多）。`,
      inputReq: `**必填**

- 图表类型或意图（趋势、对比、占比、流程、架构等）。
- 至少一项：指标名称、维度、时间范围或流程节点描述。

**可选**

- 原始数据、表格、CSV 片段。
- 图表风格偏好（柱状/折线/饼图、配色、是否显示数值标签）。
- 数量要求（单图或多图）。`,
      pitfallGuide: `1. **数据图误用 Mermaid**：统计、KPI、占比等应走 \`echarts\`。
2. **JSON 不合法**：含函数、注释或尾逗号。应输出严格 JSON。
3. **使用 formatter**：引入禁用键。应在围栏外用文字说明。
4. **输出初始化代码**：围栏内只能是 option 对象。
5. **推卸渲染**：不要要求用户去外部网站粘贴。
6. **一次堆太多图**：默认控制在 3 个围栏以内。`,
      checklist: `- [ ] 数据图是否使用 \`echarts\`，流程/架构图是否使用 \`mermaid\`？
- [ ] \`echarts\` 是否为严格 JSON，且不含禁用键？
- [ ] 是否未输出 JS 初始化代码？
- [ ] 无数据时是否提供了合理示例？
- [ ] 围栏外说明是否简洁？
- [ ] 图表数量是否合理？`,
      reference: "（内置系统技能，无需额外参考资源。）",
    },
  },
  "model-interact": {
    displayName: "模型交互",
    description:
      "数字孪生/可视化端模型操控：切换天气、切换时间（自动/上午/下午/晚上）、环游、漫游、进入漫游路线、俯瞰、鸟瞰、默认视角、画质、驾驶模式、全屏、功能菜单、态势模块、设备详情/监控、开灯关灯、照明回路；用户要操作三维模型场景时使用。",
    version: "1.0.3",
    categoryCode: "KNOWLEDGE_CONSULT",
    tags: profileTags("KNOWLEDGE_CONSULT", ["twin", "model-command", "ue5", "roam", "漫游", "天气", "画质", "视角", "时间"]),
    intro:
      "命中天气/时间/漫游/视角/画质等强制激活场景时，必须输出一条可被可视化宿主解析的严格 JSON 指令（可包在 json 围栏内）。执行与回执由宿主完成；禁止推脱「服务未接入」、禁止自造 action、禁止编造已执行。",
    config: {
      usageExample: `**示例 1 — 切换天气**

用户：「切换天气到多云。」

助手：\`{"action":"changeModelWeather","params":{"value":"Cloudy"}}\`

**示例 2 — 切换模型时间**

用户：「把模型时间切到下午。」

助手：\`{"action":"changeModelTime","params":{"value":"afternoon"}}\`

**示例 3 — 进入漫游**

用户：「进入办公区漫游路线。」

助手：\`{"action":"toggleStartRoam","params":{"value":"办公区漫游"}}\`

**示例 4 — 动态楼栋视角**

用户：「切换到华威一号楼视角。」

助手：\`{"action":"changePerspectiveBuilding","params":{"value":"华威一号楼"}}\``,
      outputSpec: `### 输出契约

- 命中强制激活场景时，回复主体为**一条**可 \`JSON.parse\` 的指令：\`{ "action", "params?" }\`。
- action 只能用白名单字面量；禁止 \`set_weather\` / \`enterOfficeRoamingRoute\` 等自造名。
- 时间 \`changeModelTime\` 的 value 与标题栏一致：\`auto\` / \`morning\` / \`afternoon\` / \`evening\`（也可用 \`9:00:00\` 等时钟值）。
- 允许包在 \`json\` 围栏内；禁止 \`js\` 围栏与伪代码。
- 禁止声称已执行成功；禁止以「服务未接入」推脱。

### 宿主说明

- 是否真正下发由可视化/孪生端决定；非孪生端会提示用户前往可视化端操作。`,
      inputReq: `**必填**

- 可识别的模型操控意图（自然语言即可）。

**按 action 可选/必填**

- 时间/天气枚举、楼栋名、楼层、漫游路线名、态势/模块名、设备名、属性名、开/关状态等。`,
      pitfallGuide: `1. **伪 JS**：无引号键或单引号。应输出严格 JSON。
2. **编造执行结果**：不要写「已切换成功」。
3. **自造 action**：进入漫游只能用 \`toggleStartRoam\`。
4. **缺参瞎填**：楼栋/设备等缺失时应先澄清。
5. **推脱未接入**：禁止；宿主已接入。`,
      checklist: `- [ ] 是否命中强制激活场景并输出白名单 JSON？
- [ ] 是否只有一条严格 JSON、未自造 action？
- [ ] 是否未推脱未接入、未声称已执行？`,
      reference: "技能资源：`references/command-catalog.md`（与 descriptors/skills/model-interact 同步）。",
    },
  },
};

export function resolveSystemBuiltinSkillContent(ref: string): {
  displayName?: string;
  description?: string;
  tags?: string[];
  version?: string;
  instructions: string;
} | null {
  const profile = SYSTEM_BUILTIN_SKILL_PROFILES[ref];
  if (!profile) {
    return null;
  }
  return {
    displayName: profile.displayName,
    description: profile.description,
    tags: profile.tags,
    version: profile.version,
    instructions: buildInstructionsMarkdown(profile),
  };
}
