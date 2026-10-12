import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { inOutTrend } from "@/infrastructure/api/door";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./personnel-entry-situation.module.less";

/** 对齐图2：指标行 + 清透折线区 */
const enterIcon = getThemeImage("alarm-count-unhandled.png");
const leaveIcon = getThemeImage("alarm-count-handled.png");

const ENTER_COLOR = "#ffab10";
const LEAVE_COLOR = "#29c2ff";

type SeriesItem = {
  name: string;
  data: number[];
  linearGradientColor?: string[];
  lineColor?: string;
  showSymbol?: boolean;
  smooth?: boolean;
  symbolSize?: number;
};

export const PersonnelEntrySituation = defineComponent({
  name: "PersonnelEntrySituation",
  setup() {
    const enterTotal = ref(0);
    const leaveTotal = ref(0);
    const xData = ref<string[]>([]);
    const series = reactive<SeriesItem[]>([
      {
        name: "进入",
        data: [],
        smooth: true,
        symbolSize: 5,
        showSymbol: false,
        lineColor: ENTER_COLOR,
        linearGradientColor: ["rgba(255, 171, 16, 0.4)", "rgba(255, 171, 16, 0)"],
      },
      {
        name: "离开",
        data: [],
        smooth: true,
        symbolSize: 5,
        showSymbol: false,
        lineColor: LEAVE_COLOR,
        linearGradientColor: ["rgba(41, 194, 255, 0.4)", "rgba(41, 194, 255, 0)"],
      },
    ]);
    const trendTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });

    const metricRows = computed(() => [
      {
        key: "enter",
        label: "进入",
        value: enterTotal.value,
        icon: enterIcon,
        toneClass: styles.isEnter,
      },
      {
        key: "leave",
        label: "离开",
        value: leaveTotal.value,
        icon: leaveIcon,
        toneClass: styles.isLeave,
      },
    ]);

    const getTemplateData = async (): Promise<void> => {
      try {
        const res = await inOutTrend({
          type: trendTime.value.timeType,
          period: trendTime.value.dateRange?.join(",") ?? "",
        });
        enterTotal.value = Number(res?.inTotal) || 0;
        leaveTotal.value = Number(res?.outTotal) || 0;
        const titles = Array.isArray(res?.xtitle) ? res.xtitle : [];
        const inTrend = Array.isArray(res?.inTrend) ? res.inTrend : [];
        const outTrend = Array.isArray(res?.outTrend) ? res.outTrend : [];
        xData.value = titles;
        series[0].data = titles.map((xItem) => {
          const hit = inTrend.find((item) => item.timeValue === xItem);
          return Number(hit?.num) || 0;
        });
        series[1].data = titles.map((xItem) => {
          const hit = outTrend.find((item) => item.timeValue === xItem);
          return Number(hit?.num) || 0;
        });
      } catch {
        enterTotal.value = 0;
        leaveTotal.value = 0;
        xData.value = [];
        series[0].data = [];
        series[1].data = [];
      }
    };

    onMounted(() => {
      void getTemplateData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.statsRow}>
          {metricRows.value.map((item) => (
            <div class={[styles.statCard, item.toneClass]} key={`${isZoom ? "zoom-" : ""}${item.key}`}>
              <div class={styles.rowIcon} aria-hidden="true">
                <img src={item.icon} alt="" />
              </div>
              <div class={styles.rowBody}>
                <span class={styles.rowLabel}>{item.label}</span>
                <span class={styles.rowValue}>
                  <CountTo startVal={0} endVal={item.value} separator="" duration={1600} />
                  <span class={styles.rowUnit}>人</span>
                </span>
              </div>
            </div>
          ))}
        </div>
        <div class={[styles.chartSurface, isZoom ? styles.isZoomChart : ""]}>
          <LineChart
            x-data={xData.value}
            series={series}
            showLegend
            titles={["进入", "离开"]}
            colors={[ENTER_COLOR, LEAVE_COLOR]}
            gridTop="28"
            gridLeft="4"
            gridRight="4"
            gridBottom="10"
            unit={{ x: "", y: "人" }}
            axisPointer
            height={isZoom ? 320 : 168}
          />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="人员出入情况"
          class="visual-v2-sub-panel v2-panel-card personnel-entry-situation-v2-panel"
          zoomable
          zoom-title="人员出入情况详情"
          zoom-width={860}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-personnel" />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={trendTime.value}
                  onUpdate:modelValue={(v) => {
                    trendTime.value = v;
                  }}
                  onSearch={getTemplateData}
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

export default PersonnelEntrySituation;
