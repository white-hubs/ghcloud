import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { environmentalStatTrend } from "@/infrastructure/api/securitymanagement";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import LineChart from "@/shared-ui/panel/lineChart";

import styles from "./environmental-trend-analysis.module.less";

const PM_COLOR = "#35a9ff";
const pmIcon = getThemeImage("device-situation.png");

type TrendPoint = {
  trendX?: string;
  trendY?: number | string;
};

export const EnvironmentalTrendAnalysis = defineComponent({
  name: "EnvironmentalTrendAnalysis",
  props: {
    title: { type: String, required: false, default: "实时环境指标趋势分析" },
  },
  setup(props) {
    const xData = ref<string[]>([]);
    const series = reactive([
      {
        name: "PM2.5",
        data: [] as number[],
        smooth: true,
        showSymbol: false,
        symbolSize: 5,
        lineColor: PM_COLOR,
        linearGradientColor: ["rgba(53, 169, 255, 0.42)", "rgba(53, 169, 255, 0)"],
      },
    ]);

    const latestValue = computed(() => {
      const list = series[0].data;
      if (!list.length) return 0;
      return Number(list[list.length - 1]) || 0;
    });

    const avgValue = computed(() => {
      const list = series[0].data;
      if (!list.length) return 0;
      const sum = list.reduce((acc, item) => acc + (Number(item) || 0), 0);
      return Math.round((sum / list.length) * 10) / 10;
    });

    const changeTopTimeFrame = async (): Promise<void> => {
      try {
        const res = (await environmentalStatTrend({ periodType: "TODAY" })) as TrendPoint[];
        const rows = Array.isArray(res) ? res : [];
        xData.value = rows.map((e) => String(e?.trendX ?? ""));
        series[0].data = rows.map((e) => Number(e?.trendY) || 0);
      } catch {
        xData.value = [];
        series[0].data = [];
      }
    };

    onMounted(() => {
      void changeTopTimeFrame();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.statsRow} data-no-zoom>
          <div class={[styles.statCard, styles.isLatest]}>
            <div class={styles.statIcon} aria-hidden="true">
              <img src={pmIcon} alt="" />
            </div>
            <div class={styles.statContent}>
              <div class={styles.statLabel}>最新 PM2.5</div>
              <div class={styles.statValueRow}>
                <span class={styles.statValue}>
                  <CountTo startVal={0} endVal={latestValue.value} decimals={1} separator="" duration={1400} />
                </span>
                <span class={styles.statUnit}>μg/m³</span>
              </div>
            </div>
          </div>
          <div class={[styles.statCard, styles.isAvg]}>
            <div class={styles.statContent}>
              <div class={styles.statLabel}>今日均值</div>
              <div class={styles.statValueRow}>
                <span class={[styles.statValue, styles.isAvgValue]}>
                  <CountTo startVal={0} endVal={avgValue.value} decimals={1} separator="" duration={1400} />
                </span>
                <span class={styles.statUnit}>μg/m³</span>
              </div>
            </div>
          </div>
        </div>
        <div class={[styles.chartSurface, isZoom ? styles.isZoomChart : ""]} data-no-zoom>
          <LineChart
            x-data={xData.value}
            series={series}
            showLegend={false}
            titles={["PM2.5"]}
            colors={[PM_COLOR]}
            gridTop="28"
            gridLeft="4"
            gridRight="4"
            gridBottom="10"
            unit={{ x: "", y: "μg/m³" }}
            axisPointer
            height={isZoom ? 300 : 150}
          />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card env-trend-analysis-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={860}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="air-conditioning-trend" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default EnvironmentalTrendAnalysis;
