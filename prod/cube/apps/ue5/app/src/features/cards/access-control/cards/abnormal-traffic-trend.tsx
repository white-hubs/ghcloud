import { defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { abnormalPassage } from "@/infrastructure/utils/requestData/accessControl";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./abnormal-traffic-trend.module.less";

const ABNORMAL_COLOR = "#ff6b4a";
const totalIcon = getThemeImage("alarm-count-unhandled.png");

export const AbnormalTrafficTrend = defineComponent({
  name: "AbnormalTrafficTrend",
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
    let timer: ReturnType<typeof setInterval> | null = null;

    const abnormalPassageInfo = async (): Promise<void> => {
      try {
        const res = await abnormalPassage(through.value.timeType, "DO_REFUSE");
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
        <div class={[styles.statCard, styles.isAbnormal]} data-no-zoom>
          <div class={styles.statIcon} aria-hidden="true">
            <img src={totalIcon} alt="" />
          </div>
          <div class={styles.statContent}>
            <div class={styles.statLabel}>通行总次数</div>
            <div class={styles.statValueRow}>
              <span class={styles.statValue}>
                <CountTo startVal={0} endVal={numberPasses.value} separator="" duration={1600} />
              </span>
              <span class={styles.statUnit}>次</span>
            </div>
          </div>
        </div>
        <div class={[styles.chartSurface, isZoom ? styles.isZoomChart : ""]} data-no-zoom>
          <LineChart
            x-data={chartData.xData}
            series={[
              {
                name: "异常通行",
                data: chartData.yData,
                smooth: true,
                showSymbol: false,
                symbolSize: 5,
                lineColor: ABNORMAL_COLOR,
                linearGradientColor: ["rgba(255, 107, 74, 0.42)", "rgba(255, 107, 74, 0)"],
              },
            ]}
            showLegend={false}
            titles={["异常通行"]}
            colors={[ABNORMAL_COLOR]}
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
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="异常通行趋势"
          class="visual-v2-sub-panel v2-panel-card abnormal-traffic-trend-new-v2-panel"
          zoomable
          zoom-title="异常通行趋势详情"
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="access-control-trend" />,
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
    );
  },
});

export default AbnormalTrafficTrend;
