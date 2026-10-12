import { defineComponent, onMounted, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { abnormalPassage } from "@/infrastructure/utils/requestData/accessControl";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./abnormal-traffic-trend.module.less";

const ABNORMAL_COLOR = "#ff6b4a";
const totalIcon = getThemeImage("alarm-count-unhandled.png");

export const AbnormalTrafficTrend = defineComponent({
  name: "AbnormalTrafficTrend",
  props: {
    title: { type: String, required: false, default: "异常通行趋势" },
  },
  setup(props) {
    const through = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const numberPasses = ref(0);
    const chartData = reactive<{ xData: string[]; yData: number[] }>({
      xData: [],
      yData: [],
    });

    const abnormalPassageInfo = async (): Promise<void> => {
      try {
        const res = await abnormalPassage(through.value?.timeType, "DO_REFUSE");
        chartData.xData = res?.xdata ?? [];
        chartData.yData = res?.series?.[0]?.value ?? [];
        numberPasses.value = (chartData.yData as number[]).reduce((sum, item) => sum + (Number(item) || 0), 0);
      } catch {
        chartData.xData = [];
        chartData.yData = [];
        numberPasses.value = 0;
      }
    };

    onMounted(() => {
      void abnormalPassageInfo();
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
            height={isZoom ? 320 : 168}
          />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card abnormal-traffic-trend-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={860}
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
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default AbnormalTrafficTrend;
