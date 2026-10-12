import { defineComponent, type PropType } from "vue";

import type { Tone } from "../types";

import "./index.less";

export const MiniLineChart = defineComponent({
  name: "MiniLineChart",
  props: {
    title: {
      type: String,
      default: "",
    },
    tone: {
      type: String as PropType<Tone>,
      default: "blue",
    },
    lines: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  setup: (props) => {
    const strokeMap: Record<Tone, string> = {
      blue: "#165dff",
      green: "#00b42a",
      orange: "#ff7d00",
      red: "#ef4444",
      gray: "#86909c",
      purple: "#667eea",
    };
    return () => (
      <div class="cs-chart">
        {props.title && <div class="cs-chart-title">{props.title}</div>}
        <svg viewBox="0 0 400 120" aria-hidden="true">
          {[24, 48, 72, 96].map((y) => (
            <line key={y} x1="16" x2="384" y1={y} y2={y} class="grid-line" />
          ))}
          {props.lines.map((points, index) => (
            <polyline
              key={points}
              points={points}
              fill="none"
              stroke={index === 0 ? strokeMap[props.tone] : ["#00b42a", "#ff7d00", "#ef4444"][index - 1]}
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          ))}
        </svg>
      </div>
    );
  },
});
