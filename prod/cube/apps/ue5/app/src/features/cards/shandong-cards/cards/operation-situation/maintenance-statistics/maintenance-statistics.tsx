import { defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import OverviewChartBar from "@/features/cards/hospital/overview-chartBar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeMaintainStatisticsService } from "@/infrastructure/api/service";
import { generateXAxisData } from "@/infrastructure/utils/common";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import styles from "./maintenance-statistics.module.less";

export const MaintenanceStatistics = defineComponent({
  name: "MaintenanceStatistics",
  setup() {
    const timeRange = ref<ModelValueItf>({
      timeType: "THIS_MONTH",
      dateRange: [],
    });
    const xData = ref<string[]>([]);
    const yData = ref([
      {
        data: [] as number[],
        name: "维保次数",
        color: ["rgba(41, 137, 255, 0.92)", "rgba(41, 137, 255, 0.12)"],
      },
    ]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const hasValue = ref(false);

    const getData = async (): Promise<void> => {
      try {
        const result = await cubeMaintainStatisticsService.getMaintenanceStatistics({
          type: timeRange.value.timeType,
          period: timeRange.value.dateRange?.join(",") ?? "",
        });
        const categories = generateXAxisData(timeRange.value.timeType);
        const mappedValues = Array.from({ length: categories.length }, () => 0);
        const rows = Array.isArray(result) ? result : [];

        rows.forEach((item: { date?: string; num?: number }) => {
          let index = -1;
          const dateText = String(item.date ?? "");
          switch (timeRange.value.timeType) {
            case "TODAY":
              index = Number.parseInt(dateText.split(":")[0] || "", 10);
              break;
            case "THIS_WEEK":
            case "THIS_MONTH":
            case "THIS_YEAR":
              index = Number.parseInt(dateText, 10) - 1;
              break;
            default:
              break;
          }
          if (index >= 0 && index < mappedValues.length) {
            mappedValues[index] = Number(item.num) || 0;
          }
        });

        xData.value = categories;
        yData.value[0].data = mappedValues;
        hasValue.value = mappedValues.some((v) => v > 0);
      } catch {
        xData.value = [];
        yData.value[0].data = [];
        hasValue.value = false;
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.zoomBody : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasValue.value ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={styles.chartSurface}>
            <OverviewChartBar title="次" xData={xData.value} yData={yData.value} gridTop={28} height="100%" />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="维保统计"
          class="visual-v2-sub-panel v2-panel-card maintenance-statistics-v2-panel"
          zoomable
          zoom-title="维保统计详情"
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-work-order" />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={timeRange.value}
                  onUpdate:modelValue={(v) => {
                    timeRange.value = v;
                  }}
                  onSearch={getData}
                  timeList={[
                    { label: "本周", value: "THIS_WEEK" },
                    { label: "本月", value: "THIS_MONTH" },
                    { label: "今年", value: "THIS_YEAR" },
                  ]}
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

export default MaintenanceStatistics;
