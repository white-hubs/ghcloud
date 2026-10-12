import { computed, defineComponent } from "vue";
import type { PropType } from "vue";

import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "./device-status-body.module.less";

interface StatCard {
  label: string;
  value: number;
  cardClass: string;
  iconClass: string;
  iconSrc?: string;
  valueClass: string;
  statusKey?: string;
}

interface StatusPieItem {
  name: string;
  value: number;
  color: string;
  statusKey?: string;
}

export const DeviceStatusBody = defineComponent({
  name: "DeviceStatusBody",
  props: {
    statCards: { type: Array as PropType<StatCard[]>, required: true },
    pieData: { type: Array as PropType<StatusPieItem[]>, required: true },
    deviceTotal: { type: Number, required: true },
    isZoom: { type: Boolean, default: false },
    showFullLabels: { type: Boolean, default: false },
  },
  emits: ["click-stat"],
  setup(props, { emit }) {
    const { currentTheme } = useVisualTheme();
    const isMinimalWhite = computed(() => currentTheme.value === "minimal-white");

    return (): JSX.Element => (
      <div class={["device-status-body", props.isZoom ? "is-zoom" : "", props.showFullLabels ? "show-full-labels" : ""]}>
        <div class="stats-row">
          {props.statCards.map((item) => (
            <div class={["stat-card", item.cardClass]} key={item.label} onClick={() => emit("click-stat", item)}>
              <div class={["stat-icon", item.iconSrc ? "stat-icon-image" : item.iconClass]}>
                {item.iconSrc ? <img src={item.iconSrc} alt="" class="stat-icon-img" /> : null}
              </div>
              <div class="stat-content">
                <div class="stat-label">{item.label}</div>
                <div class={["stat-value", item.valueClass]}>
                  <CountTo startVal={0} endVal={item.value} separator="" duration={2200} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div class={["device-chart-row", isMinimalWhite.value ? "is-clean-ring" : ""]}>
          <div class="chart-pie-wrap">
            <ElevatorAnalysisPie
              class="elevator-analysis-left"
              radius={isMinimalWhite.value ? "78" : "75"}
              ringVariant={isMinimalWhite.value ? "clean" : "default"}
              pieData={props.pieData}
            >
              <div class="pie-center-value">
                <CountTo startVal={0} endVal={props.deviceTotal} separator="" duration={2000} />
              </div>
              <div class="pie-center-label">设备总数</div>
            </ElevatorAnalysisPie>
          </div>
          <div class={["legend-list", props.isZoom ? "is-zoom" : ""]}>
            {props.pieData.map((item) => (
              <div class="legend-item" key={item.name} onClick={() => emit("click-stat", item)}>
                <div class="legend-left">
                  <span class="legend-color" style={{ background: item.color }}></span>
                  <span class="legend-name" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <span class="legend-value">{item.value}个</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
});

export default DeviceStatusBody;
