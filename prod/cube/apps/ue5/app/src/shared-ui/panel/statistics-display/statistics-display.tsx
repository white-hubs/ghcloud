import { type VNode, defineComponent, computed } from "vue";

import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import styles from "./statistics-display.module.less";

export const StatisticsDisplay = defineComponent({
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const ratioClass = computed(() => {
      if (props.data.ratio === undefined || props.data.ratio === null) {
        return "";
      }
      return props.data.ratio >= 0 ? styles.green : styles.red;
    });

    return (): VNode => (
      <div class={styles.static}>
        <div class={styles.iconWrapper}>
          <img src={getAssetsImage("overView4.png")} />
          <img class={styles.icon} src={getAssetsImage(props.data.icon)} />
        </div>
        <div class={styles.info}>
          <div class={styles.name}>{props.data.name}</div>
          <div class={styles.valueWrapper}>
            <CountTo class={styles.value} startVal={0} endVal={props.data.value} duration={2000} separator="" />
            {props.data.ratio !== undefined && props.data.ratio !== null && (
              <span class={[styles.ratio, ratioClass.value]}>
                {props.data.ratio > 0 ? "+" : ""}
                {props.data.ratio}%
              </span>
            )}
            {props.data.unit && <span class={styles.unit}>{props.data.unit}</span>}
          </div>
        </div>
      </div>
    );
  },
});
