import { computed, defineComponent, type PropType } from "vue";

import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import "./flow-stats-body.module.less";

type IconType = "people" | "chart" | "clock";
type TrendType = "up" | "down";

interface TrendItem {
  label: string;
  value: string;
  type: TrendType;
}

export interface FlowStatItem {
  icon: IconType;
  label: string;
  numericValue: number;
  unit: string;
  badge?: string;
  trends?: TrendItem[];
  note?: string;
}

const iconSources: Record<IconType, string> = {
  people: getThemeImage("cumulative-person-times.png"),
  chart: getThemeImage("hourly-peak-attendance.png"),
  clock: getThemeImage("times-people-second.png"),
};

export const FlowStatsBody = defineComponent({
  name: "FlowStatsBody",
  props: {
    items: { type: Array as PropType<FlowStatItem[]>, required: true },
    primary: { type: Object as PropType<FlowStatItem>, required: true },
    isZoom: { type: Boolean, default: false },
    fillPanel: { type: Boolean, default: false },
  },
  setup(props) {
    const secondaryItems = computed(() => props.items.slice(1));
    /** 峰值时间说明提到主横幅底栏，次级卡片不再重复展示 */
    const bannerNote = computed(() => props.primary.note || secondaryItems.value.find((item) => item.note)?.note || "");

    return () => (
      <div
        class={[
          "flow-stats-body",
          "people-flow-today-statistics-v2-panel",
          props.isZoom ? "is-zoom" : "",
          props.fillPanel ? "is-fill-panel" : "",
        ]}
      >
        <div class="flow-summary-banner">
          <div class="flow-summary-glow" aria-hidden="true" />
          <div class="flow-summary-inner">
            <div class="flow-summary-icon" aria-hidden="true">
              <img src={iconSources.people} alt="" class="flow-summary-icon-svg" />
            </div>
            <div class="flow-summary-content">
              <div class="flow-summary-head">
                <span class="flow-summary-label">{props.primary.label}</span>
                {props.primary.badge ? <span class="flow-summary-badge">{props.primary.badge}</span> : null}
              </div>
              <div class="flow-summary-value-row">
                <CountTo class="flow-summary-value" startVal={0} endVal={props.primary.numericValue} separator="" duration={2200} />
                <span class="flow-summary-unit">{props.primary.unit}</span>
              </div>
              {props.primary.trends?.length ? (
                <div class="flow-summary-trends">
                  {props.primary.trends.map((trend) => (
                    <span class={["flow-trend-chip", trend.type === "up" ? "is-up" : "is-down"]} key={trend.label}>
                      {trend.label} {trend.type === "up" ? "↑" : "↓"}
                      {trend.value}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          {bannerNote.value ? <div class="flow-summary-footer">{bannerNote.value}</div> : null}
        </div>

        <div class="flow-metrics-grid">
          {secondaryItems.value.map((item) => (
            <div class={["flow-metric-card", `is-${item.icon}`]} key={item.label}>
              <div class="flow-metric-icon" aria-hidden="true">
                <img src={iconSources[item.icon]} alt="" class="flow-metric-icon-svg" />
              </div>
              <div class="flow-metric-body">
                <div class="flow-metric-label">{item.label}</div>
                <div class="flow-metric-value-row">
                  <CountTo class="flow-metric-value" startVal={0} endVal={item.numericValue} separator="" duration={2000} />
                  <span class="flow-metric-unit">{item.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
});
