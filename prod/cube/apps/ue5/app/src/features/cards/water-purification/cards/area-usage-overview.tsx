import { computed, defineComponent, onMounted, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { usageStatByArea } from "@/infrastructure/api/securitymanagement";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "./area-usage-overview.module.less";

const titleIcon = getThemeImage("regional-pedestrian-flow-ranking.png");
const PIE_COLORS = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A", "#26C2BC", "#A78BFA"];

type PieItem = { name: string; value: number; color: string };

const toPieData = (list: Array<{ areaName: string; totalUsage: number }>): PieItem[] =>
  list.map((item, index) => ({
    name: item.areaName,
    value: Number(item.totalUsage) || 0,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));

export const AreaUsageOverview = defineComponent({
  name: "AreaUsageOverview",
  setup() {
    const { currentTheme } = useVisualTheme();
    const isMinimalWhite = computed(() => currentTheme.value === "minimal-white");
    const pieRingVariant = computed(() => (isMinimalWhite.value ? "clean" : "default"));

    const dosageTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const pieData = ref<PieItem[]>([]);
    const hasData = computed(() => pieData.value.some((item) => item.value > 0));
    const totalUsage = computed(() => pieData.value.reduce((sum, item) => sum + Number(item.value || 0), 0));

    const getDosageData = async (): Promise<void> => {
      const params = {
        period: dosageTime.value.dateRange?.join(",") ?? "",
        type: dosageTime.value.timeType,
      };
      try {
        const res = await usageStatByArea(params);
        const list = Array.isArray(res) ? res : [];
        pieData.value = toPieData(
          list.map((item: { areaName: string; totalUsage: number }) => ({
            areaName: item.areaName,
            totalUsage: item.totalUsage,
          })),
        );
      } catch {
        pieData.value = [];
      }
    };

    onMounted(() => {
      void getDosageData();
    });

    const renderBody = (isZoom: boolean) => (
      <div class={["area-usage-overview-v2", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {hasData.value ? (
          <div class={["device-chart-row", isZoom ? "is-zoom" : "", isMinimalWhite.value ? "is-clean-ring" : ""]}>
            <div class={["chart-pie-wrap", isZoom ? "is-zoom" : ""]}>
              <ElevatorAnalysisPie
                class="elevator-analysis-left"
                radius={isMinimalWhite.value ? "78" : "75"}
                ringVariant={pieRingVariant.value}
                pieData={pieData.value}
              >
                <div class="pie-center-value">{totalUsage.value}</div>
                <div class="pie-center-label">总用量</div>
              </ElevatorAnalysisPie>
            </div>
            <div class={["legend-list", isZoom ? "is-zoom" : ""]}>
              {pieData.value.map((item) => (
                <div class="legend-item" key={`${isZoom ? "zoom-" : ""}${item.name}`}>
                  <div class="legend-left">
                    <span class="legend-color" style={{ background: item.color }} />
                    <span class="legend-name" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                  <span class="legend-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div class={["empty-panel", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        )}
      </div>
    );

    return () => (
      <div class="v2-panel-root area-usage-overview-v2-root">
        <SubPanelTemplate
          title="区域使用量概况"
          class="visual-v2-sub-panel v2-panel-card area-usage-overview-v2-panel"
          zoomable
          zoom-title="区域使用量概况详情"
          zoom-width={720}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="title-icon-img" />,
            extra: () => (
              <div class="header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={dosageTime.value}
                  onUpdate:modelValue={(v) => {
                    dosageTime.value = {
                      timeType: v?.timeType || "TODAY",
                      dateRange: [...(v?.dateRange ?? [])],
                    };
                  }}
                  onSearch={getDosageData}
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

export default AreaUsageOverview;
