import { defineComponent, type PropType } from "vue";

import { RISK_LEVEL_LABEL } from "@/constants";
import type { RiskLevel } from "@/types/risk";

import styles from "./risk-level-badge.module.less";

const LEVEL_CLASS: Record<RiskLevel, string> = {
  MAJOR: styles.major,
  SIGNIFICANT: styles.significant,
  GENERAL: styles.general,
  LOW: styles.low,
};

export const RiskLevelBadge = defineComponent({
  name: "RiskLevelBadge",
  props: {
    level: {
      type: String as PropType<RiskLevel | undefined>,
      default: undefined,
    },
    emptyText: {
      type: String,
      default: "未评估",
    },
  },
  setup(props) {
    return (): JSX.Element => {
      if (!props.level) return <span class={styles.empty}>{props.emptyText}</span>;
      return <span class={[styles.badge, LEVEL_CLASS[props.level]].join(" ")}>{RISK_LEVEL_LABEL[props.level]}</span>;
    };
  },
});
