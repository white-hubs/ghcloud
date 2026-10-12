import { defineComponent, onBeforeUnmount, onMounted, ref, watch, provide } from "vue";

import AlarmMetrics, { createAlarmModalParameter, resolveAlarmStatus } from "../../_shared/alarm-metrics/alarm-metrics";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { resolveEquipmentManagementPanelContext } from "@/features/cards/air-exhaust/_shared/supply-exhaust-air-panel-context";
import ModalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsTrend, statisticsStatus } from "@/infrastructure/api/alarm";
import { AlarmStatus } from "@/infrastructure/api/models/alarm";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../../air-conditioning/_shared/air-conditioning-v2-shared.module.less";

import styles from "./alarm-status-and-trend.module.less";

const energyAlarmTitleIcon = getThemeImage("alarm-record.png");

export const AlarmStatusAndTrend = defineComponent({
  name: "AlarmStatusAndTrend",
  props: {
    panelName: { type: String, required: false },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const panelContext = resolveEquipmentManagementPanelContext(props.panelName);
    /** 与「报警状态和报警列表统计 / 报警记录」一致：通用面板也强制 V2 */
    const useV2 = true;
    const panelClass = panelContext.isV2
      ? panelContext.panelClass
      : "visual-v2-sub-panel v2-panel-card air-conditioning-v2-panel security-overview-alarm-status-panel";
    const zoomClass = panelContext.isV2 ? panelContext.zoomClass : [];

    const topTimeFrame = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const alarmModalShow = ref(false);
    const alarmModalParameter = ref<Record<string, unknown>>({});
    const alarmModalStatus = ref("");

    const alarmCon = ref({
      count: 0,
      ratio: 0,
    });

    const colorList = ["#FFC700", "#74AEE7", "#00F27B", "#29C2FF"];
    const alarmStatusData = ref<AlarmStatus[]>([]);
    const xData = ref<string[]>([]);
    const yData = ref<number[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    let timer: ReturnType<typeof setInterval> | null = null;

    const hasAlarmData = () => loaded.value && (alarmCon.value.count > 0 || alarmStatusData.value.length > 0 || yData.value.length > 0);

    watch(
      () => globalState.business.currentAreaId,
      () => {
        if (timer) clearInterval(timer);
        timer = setInterval(
          () => {
            init();
          },
          (window as any).config.pageLoopRequestTime,
        );
        init();
      },
    );

    function changeTopTimeFrame() {
      getAlarmsNumber();
    }

    async function getAlarmsNumber() {
      loaded.value = false;
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: topTimeFrame.value.dateRange.join(","),
        type: topTimeFrame.value.timeType,
      };
      xData.value = [];
      yData.value = [];
      try {
        const Status = await statisticsStatus(params);
        const Trend = await statisticsTrend(params);

        alarmStatusData.value = (Status?.alarmStatusStatistics ?? []).map((item: AlarmStatus, index: number) => {
          item.color = colorList[index];
          return item;
        });
        alarmCon.value = {
          count: Number(Status?.alarmNum) || 0,
          ratio: Number(Status?.chainRatio) || 0,
        };
        (Trend ?? []).forEach((item: { period: string; alarmNum: number }) => {
          let time = "";
          if (params.type === "TODAY") {
            time = "时";
          } else if (params.type === "THIS_YEAR") {
            time = "月";
          } else {
            time = "号";
          }
          xData.value.push(item.period + time);
          yData.value.push(item.alarmNum);
        });
      } catch {
        alarmCon.value = { count: 0, ratio: 0 };
        alarmStatusData.value = [];
      } finally {
        loaded.value = true;
      }
    }

    function init() {
      getAlarmsNumber();
    }

    const openAlarmModal = (item?: AlarmStatus): void => {
      const alarmStatus = resolveAlarmStatus(item);
      alarmModalStatus.value = alarmStatus;
      alarmModalParameter.value = createAlarmModalParameter(topTimeFrame.value, alarmStatus);
      alarmModalShow.value = true;
    };

    const closeAlarmModal = (): void => {
      alarmModalShow.value = false;
      alarmModalStatus.value = "";
    };

    onMounted(() => {
      init();
      timer = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });
    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
    });

    const renderDateForm = () => (
      <div class="air-conditioning-header-toolbar" data-no-zoom>
        <DateInlineForm
          modelValue={topTimeFrame.value}
          onUpdate:modelValue={(v) => {
            topTimeFrame.value = v;
          }}
          onSearch={changeTopTimeFrame}
        />
      </div>
    );

    const renderBody = (isZoom: boolean) => {
      if (!loaded.value) {
        return <PanelCardLoading zoom={isZoom} />;
      }
      if (!hasAlarmData()) {
        return (
          <div
            class={[
              styles.cardBody,
              styles.emptySurface,
              isZoom ? styles.zoomBody : "",
              "air-conditioning-card-body",
              ...(isZoom ? zoomClass : []),
            ]}
            data-no-zoom
          >
            <NoData />
          </div>
        );
      }

      return (
        <div
          class={[styles.cardBody, isZoom ? styles.zoomBody : "", "air-conditioning-card-body", ...(isZoom ? zoomClass : [])]}
          data-no-zoom
        >
          <AlarmMetrics
            count={alarmCon.value.count}
            ratio={alarmCon.value.ratio}
            statuses={alarmStatusData.value}
            zoom={isZoom}
            onSummaryClick={() => openAlarmModal()}
            onStatusClick={(_event, item) => openAlarmModal(item)}
          />
          <div class={[styles.chartSurface, "air-conditioning-chart-surface"]}>
            <LineChart
              x-data={xData.value}
              series={[
                {
                  name: "报警数",
                  data: yData.value,
                  smooth: true,
                  showSymbol: false,
                  symbolSize: 5,
                  lineColor: "#2989FF",
                  linearGradientColor: ["rgba(41, 137, 255, 0.42)", "rgba(41, 137, 255, 0)"],
                },
              ]}
              colors={["#2989FF"]}
              showLegend={false}
              unit={{ x: "", y: "次" }}
              gridTop={isZoom ? "28" : "26"}
              gridLeft="4"
              gridRight="4"
              gridBottom="32"
              axisPointer
              height={isZoom ? 360 : undefined}
            />
          </div>
        </div>
      );
    };

    return () => (
      <>
        <SubPanelTemplate
          title="报警状态和报警趋势统计"
          class={panelClass}
          zoomable={useV2}
          zoom-title="报警状态和报警趋势统计详情"
          zoom-width={1000}
          v-slots={{
            titleIcon: () =>
              panelContext.isEnergySituation ? (
                <img src={energyAlarmTitleIcon} alt="" class="energy-v2-title-icon" />
              ) : (
                <CardTitleIcon name={panelContext.isMeetingManage ? "overview-alarm" : "air-conditioning-records"} />
              ),
            extra: () => renderDateForm(),
            "zoom-content": () => renderBody(true),
            default: () => renderBody(false),
          }}
        />
        {alarmModalShow.value && (
          <ModalAlarmTable
            showModal={alarmModalShow.value}
            alarmStatus={alarmModalStatus.value}
            parameter={alarmModalParameter.value}
            onClose={closeAlarmModal}
          />
        )}
      </>
    );
  },
});

export default AlarmStatusAndTrend;
