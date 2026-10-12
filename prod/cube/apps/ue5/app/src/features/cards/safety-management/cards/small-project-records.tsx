import moment from "moment";
import { defineComponent, onMounted, reactive, ref } from "vue";

import SmallEngineeringTable from "../components/small-engineering-table";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { projectNumStatistics, projectTrendStatistics } from "@/infrastructure/api/maintain";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import LineChart from "@/shared-ui/panel/lineChart";

import styles from "./small-project-records.module.less";

const totalIcon = getThemeImage("device-total.png");
const abnormalIcon = getThemeImage("device-total-offline.png");
const LINE_COLOR = "#2989FF";

const yearPeriod = (): string =>
  `${moment().startOf("year").format("YYYY-MM-DD 00:00:00")},${moment().endOf("year").format("YYYY-MM-DD HH:mm:ss")}`;

export const SmallProjectRecords = defineComponent({
  name: "SmallProjectRecords",
  setup() {
    const showModalSmall = ref(false);
    const parameterSmall = reactive({
      type: "",
      status: "",
      period: "",
      submitTime: "",
    });
    const stats = reactive({
      total: 0,
      abnormal: 0,
    });
    const xData = ref<string[]>([]);
    const series = reactive([
      {
        name: "工程数",
        data: [] as number[],
        smooth: true,
        symbolSize: 5,
        showSymbol: false,
        lineColor: LINE_COLOR,
        linearGradientColor: ["rgba(41, 137, 255, 0.42)", "rgba(41, 137, 255, 0)"],
      },
    ]);

    const getSmallEngineeringData = async (): Promise<void> => {
      try {
        const res = await projectNumStatistics({ period: yearPeriod() });
        const data = await projectTrendStatistics();
        stats.total = Number(res?.total) || 0;
        stats.abnormal = Number(res?.abnormal) || 0;
        const rows = Array.isArray(data) ? data : [];
        xData.value = rows.map((item: { month?: string | number }) => `${item.month ?? ""}月`);
        series[0].data = rows.map((item: { num?: number }) => Number(item.num) || 0);
      } catch {
        stats.total = 0;
        stats.abnormal = 0;
        xData.value = [];
        series[0].data = [];
      }
    };

    const openModal = (status: "" | "ABNORMAL"): void => {
      parameterSmall.status = status;
      parameterSmall.period = yearPeriod();
      showModalSmall.value = true;
    };

    onMounted(() => {
      void getSmallEngineeringData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.statsRow}>
          <button type="button" class={[styles.statCard, styles.isTotal]} onClick={() => openModal("")}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={totalIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>小散工程总数</span>
              <span class={styles.statValue}>
                <CountTo startVal={0} endVal={stats.total} separator="" duration={1400} />
              </span>
            </span>
          </button>
          <button type="button" class={[styles.statCard, styles.isAbnormal]} onClick={() => openModal("ABNORMAL")}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={abnormalIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>异常数</span>
              <span class={[styles.statValue, styles.isAbnormalValue]}>
                <CountTo startVal={0} endVal={stats.abnormal} separator="" duration={1400} />
              </span>
            </span>
          </button>
        </div>
        <div class={[styles.chartSurface, isZoom ? styles.isZoomChart : ""]}>
          <LineChart
            x-data={xData.value}
            series={series}
            showLegend={false}
            colors={[LINE_COLOR]}
            gridTop="28"
            gridLeft="4"
            gridRight="4"
            gridBottom="10"
            unit={{ x: "", y: "个" }}
            axisPointer
            height={isZoom ? 320 : 168}
          />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="小散工程记录"
            class="visual-v2-sub-panel v2-panel-card small-project-records-v2-panel"
            zoomable
            zoom-title="小散工程记录详情"
            zoom-width={900}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-work-order" />,
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <SmallEngineeringTable
          showModal={showModalSmall.value}
          onClose={() => {
            showModalSmall.value = false;
          }}
          parameter={parameterSmall}
        />
      </>
    );
  },
});

export default SmallProjectRecords;
