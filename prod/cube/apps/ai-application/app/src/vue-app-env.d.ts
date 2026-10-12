/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * AI-Center 统一网关前缀。façade 与 assistant 均从此 base 派生
   * （assistant 用 `${base}/agent`）。qiankun 子应用挂在 mf-root 下时，
   * 相对 `/api/...` 会打到主壳域名而非子应用 Vite proxy；本地联调设为绝对基址
   * （无尾斜杠），例：`http://localhost:8890/api/ai-center`。默认 `/api/ai-center`。
   */
  readonly VITE_AI_CENTER_API_BASE?: string;
  /**
   * 聊天 composer 手动知识库引入（pill / @）。默认关闭；设为 true/1/on 可恢复。
   * 智能体绑定知识库的静默注入不受此开关影响。
   */
  readonly VITE_ASSISTANT_KB_REFS_UI_ENABLED?: string;
  /**
   * Assistant chart/flowchart streaming debug switch.
   * - placeholder (default): show a loading placeholder until ```echarts / ```mermaid closes.
   * - code: render unclosed chart fences as ordinary code blocks for stream debugging.
   */
  readonly VITE_ASSISTANT_UNCLOSED_CHART_FENCE_MODE?: "placeholder" | "code";
  /**
   * 思考过程渲染模式（默认 steps；其余模式建议调试时通过 URL query
   * `?thinkingMode=prose` 或 localStorage 显式启用，见 assistant-thinking-mode.ts）。
   * - steps（默认）：思考步骤（方案 B）。一轮拍平成线性步骤时间线（步骤 N + 叙述 + 内联工具卡 + 耗时），
   *   叙述留在步骤区、正文气泡只流最终答案，配合 alpha.16 真流式；结束折叠为「思考过程 · N 步 · M 次工具」。
   * - prose：思考文本。一轮所有阶段拍平成一段连续叙述，打字机匀速吐字、结束折叠。
   * - feed：思考流。过程拍平成追加式状态行，窗口封顶、结束折叠。
   * - descriptive：单行摘要。单行覆盖 + 流式摘要短语（客户端截取首句）+ 常驻计时，不展开。
   * - compact：单行覆盖粗粒度阶段短语（"正在思考"等），不展开。
   * - silent：无思考过程，等待中整条替换为等待动画，收到正文才开始流式渲染。
   * - detailed：完整可展开 reasoning 树（思考树），调试用。
   */
  readonly VITE_ASSISTANT_THINKING_RENDER_MODE?: "steps" | "prose" | "feed" | "silent" | "compact" | "descriptive" | "detailed";
}

declare module "*.module.less" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare module "*.less" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare const __ENV__: {
  readonly applicationCode: string;
};
