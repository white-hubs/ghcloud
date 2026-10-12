import { computed, defineComponent } from "vue";

import styles from "./eventAlarmItem.module.less";

const rankColors = ["#f14545", "#ffab10", "#2f8dff", "#74aee7", "#5b9ce2"];

export const EventAlarmItem = defineComponent({
  name: "EventAlarmItem",
  props: {
    sort: { type: Number, required: true, default: 1 },
    name: { type: String, required: true, default: "事件" },
    count: { type: Number, required: true, default: 0 },
    modes: { type: String, required: true, default: "环比" },
    ratio: { type: String, required: true, default: "3%" },
    linkRatio: { type: Number, required: true, default: 0 },
    code: { type: Number, required: false },
    sn: { type: Boolean, required: false, default: true },
    other: { type: String, required: false },
    /** 数值单位；默认不展示，报警 TOP 类卡片传「个」 */
    unit: { type: String, required: false, default: "" },
  },
  setup(props) {
    const percent = computed(() => {
      const raw = Number.parseFloat(String(props.ratio ?? "0").replace("%", ""));
      if (!Number.isFinite(raw)) return 0;
      return Math.max(0, Math.min(100, raw));
    });

    const accent = computed(() => rankColors[Math.max(0, Math.min(rankColors.length - 1, props.sort - 1))] || rankColors[4]);

    const sortClass = computed(() => {
      if (props.sort === 1) return styles.sort1;
      if (props.sort === 2) return styles.sort2;
      if (props.sort === 3) return styles.sort3;
      return styles.sortMuted;
    });

    const barWidth = computed(() => `${Math.max(percent.value, props.count > 0 ? 4 : 0)}%`);

    return (): JSX.Element => (
      <div class={styles.eventAlarmItem}>
        <div class={[styles.sort, sortClass.value]} aria-hidden="true">
          {props.sort}
        </div>
        <div class={styles.main}>
          <div class={styles.top}>
            <div class={styles.name} title={props.name}>
              <span>{props.name}</span>
              {props.other ? <span class={styles.other}>{props.other}</span> : null}
            </div>
            <div class={styles.right}>
              <span class={styles.count}>{props.count || 0}</span>
              {props.unit ? <em class={styles.unit}>{props.unit}</em> : null}
            </div>
          </div>
          <div class={styles.barTrack}>
            <div
              class={styles.barFill}
              style={{
                width: barWidth.value,
                background: `linear-gradient(90deg, ${accent.value}, ${accent.value}88)`,
              }}
            />
          </div>
          <div class={styles.meta}>
            <span class={styles.share}>占比 {percent.value}%</span>
            {props.sn ? (
              <span class={styles.trend}>
                <span class={styles.modes}>{props.modes}</span>
                <span class={[styles.arrow, props.linkRatio > 0 ? styles.arrowUp : ""]} />
                <span class={props.linkRatio > 0 ? styles.up : styles.down}>{(props.linkRatio || 0) + "%"}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  },
});

export default EventAlarmItem;
