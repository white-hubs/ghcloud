import type { EChartsOption } from "echarts";

import { RISK_META } from "@/mocks/cockpit-data";
import type { DepotSummary } from "@/types/cockpit";

export const HUNAN_MAP_NAME = "hunan";
export const CHANGSHA_REGION_NAME = "长沙市";

export const buildHunanMapOption = (depot: DepotSummary, dimmed = false): EChartsOption => ({
  backgroundColor: "transparent",
  geo: {
    map: HUNAN_MAP_NAME,
    roam: false,
    layoutCenter: ["47%", "54%"],
    layoutSize: "92%",
    label: { show: true, color: "rgba(148,163,184,.56)", fontSize: 10 },
    itemStyle: {
      areaColor: "rgba(20,45,85,.62)",
      borderColor: "rgba(56,189,248,.62)",
      borderWidth: 1.1,
      shadowColor: "rgba(22,119,255,.45)",
      shadowBlur: 20,
      shadowOffsetY: 5,
    },
    emphasis: {
      itemStyle: { areaColor: "rgba(22,119,255,.3)" },
      label: { color: "#bae7ff" },
    },
    select: { disabled: true },
    regions: [
      {
        name: CHANGSHA_REGION_NAME,
        itemStyle: {
          areaColor: "rgba(19,194,194,.34)",
          borderColor: "#5cdbd3",
          borderWidth: 2,
          shadowColor: "rgba(19,194,194,.75)",
          shadowBlur: 16,
        },
        label: { color: "#5cdbd3", fontWeight: "bold" },
      },
    ],
  },
  tooltip: {
    show: !dimmed,
    trigger: "item",
    backgroundColor: "rgba(8,18,36,.96)",
    borderColor: "rgba(56,189,248,.45)",
    textStyle: { color: "#cbd5e1", fontSize: 11 },
    formatter: (params: unknown) => {
      const item = params as { seriesType?: string; name?: string };
      if (item.seriesType !== "effectScatter") return "";
      return `${depot.name}　<span style="color:${RISK_META[depot.level].color}">${RISK_META[depot.level].label}</span><br/>库存 ${depot.stock} 万吨 · 未闭环 ${depot.open} 起<br/><span style="color:#64748b">点击查看库区摘要</span>`;
    },
  },
  series: [
    {
      name: "重点库区",
      type: "effectScatter",
      coordinateSystem: "geo",
      zlevel: 3,
      rippleEffect: { period: 2.6, scale: 3, brushType: "stroke" },
      symbolSize: 40,
      data: [
        {
          name: depot.name,
          value: [...depot.coord, depot.stock],
          itemStyle: {
            color: RISK_META[depot.level].color,
            shadowColor: RISK_META[depot.level].color,
            shadowBlur: 16,
            opacity: dimmed ? 0.18 : 1,
          },
          label: {
            show: true,
            position: "bottom",
            distance: 4,
            formatter: `{name|${depot.name}}\n{info|${depot.stock}万吨 · 未闭环${depot.open}}`,
            rich: {
              name: { color: "#e2e8f0", fontSize: 13, fontWeight: "bold", lineHeight: 18, textShadowColor: "#000", textShadowBlur: 6 },
              info: { color: "#94a3b8", fontSize: 10, lineHeight: 14, textShadowColor: "#000", textShadowBlur: 6 },
            },
          },
        },
      ],
    },
  ],
});
