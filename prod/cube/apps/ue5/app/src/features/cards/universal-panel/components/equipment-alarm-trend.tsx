import moment from "moment";
import { computed, defineComponent, onMounted, reactive, ref, watch, provide } from "vue";

import AlarmMetrics, { createAlarmModalParameter, resolveAlarmStatus } from "../../_shared/alarm-metrics/alarm-metrics";
import {
  AIR_CONDITIONING_PANEL_CLASS,
  airConditioningZoomClass,
  isAirConditioningPanel,
} from "../../air-conditioning/_shared/air-conditioning-panel-context";
import UniversalPanelCardIcon from "../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "../_shared/universal-panel-v2";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import ModalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { AlarmStatus } from "@/infrastructure/api/models/alarm";
import { alarmTrend, equipmentNumber } from "@/infrastructure/utils/requestData/alarm";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../../air-conditioning/_shared/air-conditioning-v2-shared.module.less";
import "../_shared/universal-panel-v2-shared.less";

import styles from "./equipment-alarm-trend.module.less";

export const EquipmentAlarmTrend = defineComponent({
  name: "EquipmentAlarmTrend",
  props: {
    title: { type: String, required: true, default: "设备报警趋势" },
    panelName: { type: String, required: false },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const isAirConditioning = isAirConditioningPanel(props.panelName);

    const now = moment();
    const trend = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [now.format("YYYY-MM-DD 00:00:00"), now.format("YYYY-MM-DD HH:mm:ss")],
    });
    const alarmNum = ref<number>(0);
    const chainRatio = ref<number>(0);
    const alarmStatusData = ref<AlarmStatus[]>([]);
    const alarmModalShow = ref(false);
    const alarmModalParameter = ref<Record<string, unknown>>({});
    const alarmModalStatus = ref("");
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const xData = reactive({
      arr: ["1时", "2时", "3时", "4时", "5时"],
    });
    const series = reactive([
      {
        data: [0],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
    ]);

    const isEmpty = computed(() => {
      if (!loaded.value) {
        return false;
      }
      const trendValues = series[0].data ?? [];
      const hasTrendData = xData.arr.length > 0 && trendValues.some((value) => Number(value) !== 0);
      return !hasTrendData && alarmNum.value === 0;
    });

    // 设备报警趋势
    const alarmTrendInfo = async (): Promise<void> => {
      const param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: trend.value.dateRange.join(","),
        type: trend.value.timeType,
      };

      try {
        const [res, data]: [any, any] = await Promise.all([alarmTrend(param), equipmentNumber(param)]);
        alarmStatusData.value = Array.isArray(data?.alarmStatusStatistics) ? data.alarmStatusStatistics : [];
        alarmNum.value = Number(data?.alarmNum) || 0;
        chainRatio.value = Number(data?.chainRatio) || 0;
        xData.arr = Array.isArray(res?.xdata) && res.xdata.length > 0 ? res.xdata : ["1时", "2时", "3时", "4时", "5时"];
        series[0].data = Array.isArray(res?.ydata) ? res.ydata : [0];
      } catch {
        alarmStatusData.value = [];
        alarmNum.value = 0;
        chainRatio.value = 0;
        xData.arr = ["1时", "2时", "3时", "4时", "5时"];
        series[0].data = [0];
      } finally {
        loaded.value = true;
      }
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        void alarmTrendInfo();
      },
    );

    onMounted(() => {
      void alarmTrendInfo();
    });

    const openAlarmModal = (item?: AlarmStatus): void => {
      const alarmStatus = resolveAlarmStatus(item);
      alarmModalStatus.value = alarmStatus;
      alarmModalParameter.value = createAlarmModalParameter(trend.value, alarmStatus);
      alarmModalShow.value = true;
    };

    const closeAlarmModal = (): void => {
      alarmModalShow.value = false;
      alarmModalStatus.value = "";
    };

    const renderDateForm = (): JSX.Element => (
      <div class={isAirConditioning ? "air-conditioning-header-toolbar" : "header-toolbar"} data-no-zoom>
        <DateInlineForm
          modelValue={trend.value}
          onUpdate:modelValue={(v) => {
            trend.value = v;
          }}
          onSearch={alarmTrendInfo}
        />
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={[
          "up-card-body",
          styles.cardBody,
          isZoom ? styles.zoomBody : "",
          ...(isAirConditioning ? ["air-conditioning-card-body"] : []),
          ...(isZoom ? (isAirConditioning ? airConditioningZoomClass : universalPanelZoomClass) : []),
        ]}
        data-no-zoom
      >
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : isEmpty.value ? (
          <div class="up-empty">
            <NoData />
          </div>
        ) : (
          <>
            <AlarmMetrics
              count={alarmNum.value}
              ratio={chainRatio.value}
              statuses={alarmStatusData.value}
              zoom={isZoom}
              onSummaryClick={() => openAlarmModal()}
              onStatusClick={(_event, item) => openAlarmModal(item)}
            />
            <div
              class={[
                styles.chartSurface,
                "up-chart-surface",
                ...(isAirConditioning ? ["air-conditioning-chart-surface", "air-conditioning-surface"] : []),
              ]}
            >
              <LineChart
                x-data={xData.arr}
                series={series}
                showLegend={false}
                unit={{ x: "", y: "次" }}
                scrollable
                dataZoomSlider={false}
              />
            </div>
          </>
        )}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title={props.title}
            class={isAirConditioning ? AIR_CONDITIONING_PANEL_CLASS : `${UNIVERSAL_PANEL_V2_CLASS} equipment-alarm-trend-v2-panel`}
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={1000}
            v-slots={{
              titleIcon: () =>
                isAirConditioning ? <CardTitleIcon name="air-conditioning-trend" /> : <UniversalPanelCardIcon name="trend" />,
              extra: () => renderDateForm(),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
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

export default EquipmentAlarmTrend;
