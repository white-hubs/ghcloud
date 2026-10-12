import { defineComponent, type PropType } from "vue";

import type { KeyPersonRiskLevel } from "@ghcloud/cube-service-interface/safety-personnel";
import { Tag } from "@ghcloud/cube-ui";

import { KEY_PERSON_RISK_LEVEL_LABEL } from "@/constants";

const COLOR_MAP: Record<KeyPersonRiskLevel, string> = {
  HIGH: "error",
  MEDIUM: "warning",
  LOW: "processing",
};

export const RiskLevelTag = defineComponent({
  props: {
    level: { type: String as PropType<KeyPersonRiskLevel>, required: true },
  },
  setup(props) {
    return (): JSX.Element => <Tag color={COLOR_MAP[props.level]}>{KEY_PERSON_RISK_LEVEL_LABEL[props.level]}</Tag>;
  },
});
