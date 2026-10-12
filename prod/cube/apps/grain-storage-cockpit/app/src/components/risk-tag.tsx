import { defineComponent, type PropType } from "vue";

import { Tag } from "@ghcloud/cube-ui";

import { RISK_META } from "@/mocks/cockpit-data";
import type { RiskLevel } from "@/types/cockpit";

export const RiskTag = defineComponent({
  name: "RiskTag",
  props: {
    level: { type: String as PropType<RiskLevel>, required: true },
    text: { type: String, default: "" },
    category: { type: Boolean, default: false },
  },
  setup: (props) => {
    return (): JSX.Element => (
      <Tag class={["cockpit-tag", props.category ? "cockpit-tag--category" : `cockpit-tag--${props.level}`]}>
        {props.text || RISK_META[props.level].label}
      </Tag>
    );
  },
});
