import styles from "./dosage-chart.module.less";
import { defineComponent, computed } from "vue";

export const DosageChart = defineComponent({
  name: "DosageChart",
  props: {
    current: {
      type: Number,
      default: 0,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    unit: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "剩余药量",
    },
  },
  setup(props) {
    const CHART_SIZE = 220;
    const STROKE_WIDTH = 22;
    const RADIUS = (CHART_SIZE - STROKE_WIDTH) / 2;
    const CIRCLE_LENGTH = 2 * Math.PI * RADIUS;

    const percentage = computed(() => {
      const range = props.max - props.min;
      if (range <= 0) {
        return 0;
      }
      const value = Math.max(props.min, Math.min(props.max, props.current));
      return ((value - props.min) / range) * 100;
    });

    const progressOffset = computed(() => CIRCLE_LENGTH - (percentage.value / 100) * CIRCLE_LENGTH);
    const markerAngle = computed(() => (percentage.value / 100) * 360 - 90);
    const markerStyle = computed(() => ({
      transform: `rotate(${markerAngle.value}deg) translateY(-${RADIUS}px)`,
    }));
    const displayValue = computed(() => props.current);
    const fontSize = computed(() => {
      const len = String(props.current).length;
      if (len > 6) {
        return "40px";
      }
      if (len > 4) {
        return "40px";
      }
      return "40px";
    });

    return () => (
      <div class={styles["dosage-chart-container"]}>
        <div class={styles["ring-chart"]}>
          <svg class={styles["ring-svg"]} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
            <circle class={styles["ring-track"]} cx={CHART_SIZE / 2} cy={CHART_SIZE / 2} r={RADIUS} />
            <circle
              class={styles["ring-progress"]}
              cx={CHART_SIZE / 2}
              cy={CHART_SIZE / 2}
              r={RADIUS}
              stroke-dasharray={CIRCLE_LENGTH}
              stroke-dashoffset={progressOffset.value}
            />
          </svg>
          <div class={styles["progress-marker"]} style={markerStyle.value}>
            {/* <div class={styles["progress-marker-inner"]} /> */}
          </div>
          <div class={styles["chart-content-bo"]}>
            <div class={styles["chart-content"]}>
              <span class={styles.value} style={{ fontSize: fontSize.value }}>
                {displayValue.value}
              </span>
              <span class={styles.unit}>{props.unit}</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
