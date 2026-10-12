import { defineComponent, onMounted, ref } from "vue";

import { getEnergyMetricGlyph, getEnergyMetricKind } from "../_shared/energy-metric-glyphs";
import { getEnergyUnit } from "../utils/energy-units";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statCategoryAll } from "@/infrastructure/api/energy";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./energy-statistics.module.less";

const titleIcon = getThemeImage("energy-consumption-statistics.png");

interface StatMetric {
  ratio: number;
  value: number;
  title: string;
  unit: string;
  instrumentType: string;
}

export const EnergyStatistics = defineComponent({
  name: "EnergyStatistics",
  props: {
    title: { type: String, required: true, default: "能耗用能统计" },
  },
  setup(props) {
    const timeFrame = ref<ModelValueItf>({ timeType: "THIS_MONTH", dateRange: [] });
    const visitingData = ref<StatMetric[]>([]);

    const changeHandleworkOrderTime = async (): Promise<void> => {
      visitingData.value = [];
      const params = {
        period: timeFrame.value.dateRange?.join(",") ?? "",
        type: timeFrame.value.timeType,
      };
      let res = await statCategoryAll(params);
      res = res.filter((item) => item.instrumentType !== "zh" && item.instrumentType !== "carbon");
      visitingData.value = res.map((item) => ({
        ratio: item.qoqValueRate || 0,
        value: item.value,
        title: item.instrumentTypeName || "",
        unit: getEnergyUnit(item.instrumentType),
        instrumentType: item.instrumentType,
      }));
    };

    onMounted(() => {
      void changeHandleworkOrderTime();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["energy-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {visitingData.value.length ? (
          <div class={["energy-v2-statistics-grid", isZoom ? "is-zoom" : ""]}>
            {visitingData.value.map((item) => {
              const ratioClass = item.ratio > 0 ? "is-up" : "is-down";
              const metricKind = getEnergyMetricKind(item);
              return (
                <div class="energy-v2-stat-metric-card" key={`${isZoom ? "zoom-" : ""}${item.title}`}>
                  <div class={["energy-v2-stat-metric-icon", `is-${metricKind}`]} aria-hidden="true">
                    <span class="energy-v2-stat-metric-badge">
                      <svg class="energy-v2-stat-metric-badge-svg" viewBox="0 0 24 24">
                        <path d={getEnergyMetricGlyph(item)} fill="currentColor" />
                      </svg>
                    </span>
                  </div>
                  <div class="energy-v2-stat-metric-content">
                    <div class="energy-v2-stat-metric-label">{item.title}</div>
                    <div class="energy-v2-stat-metric-value-row">
                      <div class="energy-v2-stat-metric-value-wrap">
                        <CountTo class="energy-v2-stat-metric-value" startVal={0} endVal={item.value} separator="" duration={2000} />
                        {item.unit ? <span class="energy-v2-stat-metric-unit">{item.unit}</span> : null}
                      </div>
                      <div class="energy-v2-stat-metric-ratio">
                        <span class="energy-v2-ratio-label">环比</span>
                        <span class={["energy-v2-ratio-arrow", ratioClass]} aria-hidden="true"></span>
                        <span class={["energy-v2-ratio-value", ratioClass]}>{item.ratio}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <NoData />
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root energy-statistics-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card energy-v2-panel energy-statistics-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={640}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="energy-v2-title-icon" />,
            extra: () => (
              <DateInlineForm
                modelValue={timeFrame.value}
                onUpdate:modelValue={(value) => {
                  timeFrame.value = value;
                }}
                data-no-zoom
                onSearch={changeHandleworkOrderTime}
              />
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default EnergyStatistics;
