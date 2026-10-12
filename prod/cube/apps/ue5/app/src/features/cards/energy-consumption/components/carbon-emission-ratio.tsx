import { computed, defineComponent, onMounted, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { usageStatTypeList } from "@/infrastructure/api/energy";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "./carbon-emission-ratio.module.less";

const titleIcon = getThemeImage("carbon-emissions.png");
const PIE_COLORS = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A", "#26C2BC", "#A78BFA", "#8c8f96"];

type PieItem = { name: string; value: number; color: string };

export const CarbonEmissionRatio = defineComponent({
  name: "CarbonEmissionRatio",
  props: {
    title: { type: String, required: true, default: "碳排量分类占比" },
  },
  setup(props) {
    const { currentTheme } = useVisualTheme();
    const isMinimalWhite = computed(() => currentTheme.value === "minimal-white");
    const pieRingVariant = computed(() => (isMinimalWhite.value ? "clean" : "default"));

    const timeFrame = ref<ModelValueItf>({ timeType: "THIS_MONTH", dateRange: [] });
    const pieData = ref<PieItem[]>([]);
    const hasData = computed(() => pieData.value.some((item) => item.value > 0));
    const totalValue = computed(() => pieData.value.reduce((sum, item) => sum + Number(item.value || 0), 0));

    const fetchData = async (): Promise<void> => {
      try {
        const res = await usageStatTypeList({ period: timeFrame.value.dateRange?.join(",") ?? "" });
        const list = Array.isArray(res) ? res : [];
        pieData.value = list.map((item, index) => ({
          name: item.instrumentTypeName,
          value: Number(item.dcValue) || 0,
          color: PIE_COLORS[index % PIE_COLORS.length],
        }));
      } catch {
        pieData.value = [];
      }
    };

    onMounted(() => {
      void fetchData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["energy-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {hasData.value ? (
          <div class={["energy-v2-proportion", isZoom ? "is-zoom" : ""]}>
            <div class={["energy-v2-pie-wrap", isZoom ? "is-zoom" : ""]}>
              <ElevatorAnalysisPie
                class="elevator-analysis-left"
                radius={isMinimalWhite.value ? "78" : "75"}
                ringVariant={pieRingVariant.value}
                pieData={pieData.value}
              >
                <div class="energy-v2-pie-center-value">{totalValue.value}</div>
                <div class="energy-v2-pie-center-label">碳排</div>
              </ElevatorAnalysisPie>
            </div>
            <div class={["energy-v2-legend-list", isZoom ? "is-zoom" : ""]}>
              {pieData.value.map((item) => (
                <div class="energy-v2-legend-item" key={`${isZoom ? "zoom-" : ""}${item.name}`}>
                  <div class="energy-v2-legend-left">
                    <span class="energy-v2-legend-color" style={{ background: item.color }} />
                    <span class="energy-v2-legend-name" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                  <span class="energy-v2-legend-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <NoData />
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root carbon-emission-ratio-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card energy-v2-panel carbon-emission-ratio-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={720}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="energy-v2-title-icon" />,
            extra: () => (
              <div class="energy-v2-filter-group" data-no-zoom>
                <DateInlineForm
                  modelValue={timeFrame.value}
                  onUpdate:modelValue={(v) => {
                    timeFrame.value = {
                      timeType: v?.timeType || "THIS_MONTH",
                      dateRange: [...(v?.dateRange ?? [])],
                    };
                  }}
                  onSearch={fetchData}
                />
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default CarbonEmissionRatio;
