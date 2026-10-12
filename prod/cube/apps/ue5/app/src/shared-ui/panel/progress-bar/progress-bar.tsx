import { computed, defineComponent, type PropType } from "vue";

import CountTo from "@/shared-ui/panel/count-to/count-to";

import styles from "./progress-bar.module.less";

interface ClickPayload {
  label: string;
  value: number;
  total: number;
  rank?: number;
}

/**
 * detailMode:
 * - none: 仅显示 value + unit（默认，兼容旧用法）
 * - usage: 空闲/占用场景，右侧 value/total，明细展示占用、空闲、占比
 * - share: 份额场景，右侧 value/total，明细展示当前量、总量、占比
 */
export const ProgressBar = defineComponent({
  props: {
    label: {
      type: String as PropType<string>,
      required: true,
    },
    unit: {
      type: String as PropType<string>,
      required: false,
      default: "",
    },
    value: {
      type: Number as PropType<number>,
      required: true,
    },
    total: {
      type: Number as PropType<number>,
      required: true,
    },
    rank: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    showRank: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    detailMode: {
      type: String as PropType<"none" | "usage" | "share">,
      default: "none",
    },
    valueLabel: {
      type: String as PropType<string>,
      default: "",
    },
    totalLabel: {
      type: String as PropType<string>,
      default: "总数",
    },
    remainLabel: {
      type: String as PropType<string>,
      default: "剩余",
    },
    showTotalDetail: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
  },
  emits: ["click"],
  setup(props, { emit }) {
    const percent = computed(() => {
      if (!props.total || props.total <= 0) return 0;
      return Math.min(100, Math.max(0, (props.value / props.total) * 100));
    });

    const percentText = computed(() => `${percent.value.toFixed(0)}%`);

    const remainValue = computed(() => Math.max(0, props.total - props.value));

    const primaryText = computed(() => {
      if (props.detailMode === "none") return null;
      return `${props.value}/${props.total}`;
    });

    const detailParts = computed(() => {
      if (props.detailMode === "usage") {
        const freeLabel = props.valueLabel || "空闲";
        const usedLabel = props.remainLabel || "占用";
        return [
          `${props.totalLabel} ${props.total}${props.unit || ""}`,
          `${freeLabel} ${props.value}${props.unit || ""}`,
          `${usedLabel} ${remainValue.value}${props.unit || ""}`,
          `空闲率 ${percentText.value}`,
        ];
      }
      if (props.detailMode === "share") {
        const currentLabel = props.valueLabel || "当前";
        const parts = [`${currentLabel} ${props.value}${props.unit || ""}`, `占比 ${percentText.value}`];
        if (props.showTotalDetail) {
          parts.splice(1, 0, `${props.totalLabel} ${props.total}${props.unit || ""}`);
        }
        return parts;
      }
      return [];
    });

    const handleClick = () => {
      const payload: ClickPayload = {
        label: props.label,
        value: props.value,
        total: props.total,
      };
      if (props.rank !== undefined) {
        payload.rank = props.rank;
      }
      emit("click", payload);
    };

    return (): JSX.Element => {
      const rankClass = props.rank ? styles[`rank-${props.rank}`] : undefined;

      return (
        <div class={[styles["progress-bar"], props.detailMode !== "none" ? styles["is-detail"] : ""]} onClick={handleClick}>
          <div class={styles["progress-bar-text"]}>
            <div class={styles["progress-bar-label"]}>
              {props.showRank && props.rank !== undefined && <span class={[styles.rank, rankClass]}>{props.rank}</span>}
              <span title={props.label}>{props.label}</span>
            </div>
            <div class={styles["progress-bar-value"]}>
              {primaryText.value ? (
                <>
                  <span class={styles["value-ratio"]}>{primaryText.value}</span>
                  {props.unit ? <span class={styles.unit}>{props.unit}</span> : null}
                </>
              ) : (
                <>
                  <CountTo startVal={0} endVal={props.value} duration={2000} separator=""></CountTo>
                  {props.unit && <span class={styles.unit}>{props.unit}</span>}
                </>
              )}
            </div>
          </div>

          {detailParts.value.length > 0 && (
            <div class={styles["progress-bar-detail"]}>
              {detailParts.value.map((part, index) => (
                <span key={`${part}-${index}`} class={styles["detail-item"]}>
                  {part}
                </span>
              ))}
            </div>
          )}

          <div class={styles["progress-bar-inner-wrapper"]}>
            <div class={styles["progress-bar-inner"]} style={{ width: `${percent.value}%` }}></div>
          </div>
        </div>
      );
    };
  },
});
