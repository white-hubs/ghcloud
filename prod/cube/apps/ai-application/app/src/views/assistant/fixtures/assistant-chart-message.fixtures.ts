/** 联调/手测用 fixture：含 mermaid + echarts 混排 */
export const ASSISTANT_CHART_MESSAGE_FIXTURE = [
  "本周告警趋势如下。",
  "",
  "```echarts",
  JSON.stringify({
    title: { text: "近7日报警" },
    xAxis: { type: "category", data: ["Mon", "Tue", "Wed"] },
    yAxis: { type: "value" },
    series: [{ type: "line", data: [12, 20, 15] }],
  }),
  "```",
  "",
  "处理流程：",
  "",
  "```mermaid",
  "flowchart TD",
  "  A[采集] --> B[分析]",
  "  B --> C[告警]",
  "```",
].join("\n");
