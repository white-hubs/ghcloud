import { defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import PassageRecordsTable from "../components/passage-records-table";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { abnormalPassage } from "@/infrastructure/utils/requestData/accessControl";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./personnel-traffic-trend.module.less";

const totalIcon = getThemeImage("alarm-count.png");
const LINE_COLOR = "#2989FF";

export const PersonnelTrafficTrend = defineComponent({
  name: "PersonnelTrafficTrend",
  setup() {
    const { globalState } = useStateStore();
    const through = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const numberPasses = ref(0);
    const chartData = reactive<{ xData: string[]; yData: number[] }>({
      xData: [],
      yData: [],
    });
    const showModal = ref(false);
    const trafficParams = reactive({
      date: [] as string[],
      eventResult: "DO_PASS",
    });
    let timer: ReturnType<typeof setInterval> | null = null;

    const abnormalPassageInfo = async (): Promise<void> => {
      try {
        const res = await abnormalPassage(through.value.timeType, "DO_PASS");
        chartData.xData = Array.isArray(res?.xdata) ? res.xdata : [];
        const values = Array.isArray(res?.series?.[0]?.value) ? res.series[0].value : [];
        chartData.yData = values.map((item: number) => Number(item) || 0);
        numberPasses.value = chartData.yData.reduce((sum, item) => sum + item, 0);
      } catch {
        chartData.xData = [];
        chartData.yData = [];
        numberPasses.value = 0;
      }
    };

    const openRecords = (): void => {
      trafficParams.eventResult = "DO_PASS";
      trafficParams.date = [...(through.value.dateRange ?? [])];
      showModal.value = true;
    };

    const startLoop = (): void => {
      if (timer) clearInterval(timer);
      timer = setInterval(
        () => {
          void abnormalPassageInfo();
        },
        (window as any).config.pageLoopRequestTime,
      );
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        startLoop();
        void abnormalPassageInfo();
      },
    );

    onMounted(() => {
      void abnormalPassageInfo();
      startLoop();
    });

    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.statsRow}>
          <button type="button" class={[styles.statCard, styles.isTotal, styles.isClickable]} onClick={openRecords}>
            <span class={styles.rowIcon} aria-hidden="true">
              <img src={totalIcon} alt="" />
            </span>
            <span class={styles.rowBody}>
              <span class={styles.rowLabel}>通行总次数</span>
              <span class={styles.rowValue}>
                <CountTo startVal={0} endVal={numberPasses.value} separator="" duration={1600} />
                <span class={styles.rowUnit}>次</span>
              </span>
            </span>
          </button>
        </div>
        <div class={[styles.chartSurface, isZoom ? styles.isZoomChart : ""]}>
          <LineChart
            x-data={chartData.xData}
            series={[
              {
                name: "通行次数",
                data: chartData.yData,
                smooth: true,
                symbolSize: 5,
                showSymbol: false,
                lineColor: LINE_COLOR,
                linearGradientColor: ["rgba(41, 137, 255, 0.42)", "rgba(41, 137, 255, 0)"],
              },
            ]}
            colors={[LINE_COLOR]}
            showLegend={false}
            gridTop="28"
            gridLeft="4"
            gridRight="4"
            gridBottom="10"
            unit={{ x: "", y: "次" }}
            axisPointer
            height={isZoom ? 320 : undefined}
          />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="人流通行趋势"
            class="visual-v2-sub-panel v2-panel-card personnel-traffic-trend-v2-panel"
            zoomable
            zoom-title="人流通行趋势详情"
            zoom-width={900}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="access-control-people" />,
              extra: () => (
                <div class={styles.headerToolbar} data-no-zoom>
                  <DateInlineForm
                    modelValue={through.value}
                    onUpdate:modelValue={(v) => {
                      through.value = v;
                    }}
                    onSearch={abnormalPassageInfo}
                  />
                </div>
              ),
              "zoom-content": () => renderBody(true),
              default: () => renderBody(false),
            }}
          />
        </div>
        <PassageRecordsTable
          showModal={showModal.value}
          parameter={trafficParams}
          onClose={() => {
            showModal.value = false;
          }}
        />
      </>
    );
  },
});

export default PersonnelTrafficTrend;
