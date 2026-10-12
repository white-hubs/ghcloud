import { defineComponent, type PropType } from "vue";

import { Button } from "@ghcloud/cube-ui";

import type { TabItem } from "../types";

import "./index.less";

export const PrototypeTabs = defineComponent({
  name: "PrototypeTabs",
  props: {
    tabs: {
      type: Array as PropType<TabItem[]>,
      required: true,
    },
    activeKey: {
      type: String,
      required: true,
    },
  },
  emits: ["update:activeKey"],
  setup:
    (props, { emit }) =>
    () => (
      <div class="cs-tabs">
        {props.tabs.map((tab) => (
          <Button
            key={tab.key}
            type="text"
            class={props.activeKey === tab.key ? "cs-tab active" : "cs-tab"}
            onClick={() => emit("update:activeKey", tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    ),
});
