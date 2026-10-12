import { defineComponent, type PropType } from "vue";

export interface RobotMetric {
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
}

export const RobotStatusCards = defineComponent({
  name: "RobotStatusCards",
  props: {
    metrics: {
      type: Array as PropType<RobotMetric[]>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <section class="robot-section">
        <div class="robot-section-title">
          <span class="robot-section-icon">↯</span>
          <strong>机器人状态</strong>
          <span>实时快照 · 每秒刷新</span>
        </div>
        <div class="robot-metric-grid">
          {props.metrics.map((item) => (
            <div class="robot-metric-card" key={item.label}>
              <span>{item.label}</span>
              <strong class={{ "robot-metric-accent": item.accent }}>{item.value}</strong>
              {item.suffix ? <small>{item.suffix}</small> : null}
            </div>
          ))}
        </div>
      </section>
    );
  },
});
