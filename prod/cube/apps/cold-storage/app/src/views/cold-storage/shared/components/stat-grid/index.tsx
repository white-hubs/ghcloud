import { defineComponent, type PropType } from "vue";

import type { StatItem } from "../types";

import "./index.less";

export const StatGrid = defineComponent({
  name: "StatGrid",
  props: {
    items: {
      type: Array as PropType<StatItem[]>,
      required: true,
    },
  },
  setup: (props) => () => (
    <div class="cs-stat-grid">
      {props.items.map((item) => (
        <div class="cs-stat-card" key={`${item.label}-${item.value}`}>
          <span>{item.label}</span>
          <b class={item.tone ? `tone-${item.tone}` : ""}>{item.value}</b>
        </div>
      ))}
    </div>
  ),
});
