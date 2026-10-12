import { computed, defineComponent, onMounted, reactive, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { scheduledPeriods } from "@/infrastructure/api/conference";
import LineChart from "@/shared-ui/panel/lineChart";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "./management-meetings-v2-shared.module.less";

export const BookingPeriodAnalysis = defineComponent({
  name: "BookingPeriodAnalysis",
  props: {
    title: { type: String, required: false, default: "预定时段分析" },
  },
  setup(props) {
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const periodTime = reactive<{ xData: string[]; yData: number[] }>({
      xData: [],
      yData: [],
    });

    const getScheduledPeriods = async (): Promise<void> => {
      try {
        const res = await scheduledPeriods();
        periodTime.xData = [];
        periodTime.yData = [];
        const source = res && typeof res === "object" ? res : {};
        for (const key in source) {
          periodTime.xData.push(`${key}时`);
          periodTime.yData.push(Number(source[key]) || 0);
        }
      } catch {
        periodTime.xData = [];
        periodTime.yData = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getScheduledPeriods();
    });

    const hasData = computed(() => periodTime.xData.length > 0);

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["meeting-manage-v2-body", isZoom ? "is-zoom access-control-v2-panel access-control-card-theme" : ""]}>
        <div class="meeting-manage-chart-surface">
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : hasData.value ? (
            <div class="meeting-manage-chart">
              <LineChart
                x-data={periodTime.xData}
                series={[{ data: periodTime.yData, name: "预订次数" }]}
                showLegend={false}
                showBackground={true}
                titles={[""]}
                gridTop={isZoom ? "12" : "28"}
                unit={{ x: "", y: "次" }}
                axisPointer={true}
              />
            </div>
          ) : (
            <div class={["meeting-manage-empty", isZoom ? "is-zoom" : ""]}>
              <NoData />
            </div>
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="meeting-manage-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme meeting-manage-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="meeting-period" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default BookingPeriodAnalysis;
