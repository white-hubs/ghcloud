import { defineComponent, onMounted, ref } from "vue";

import AlarmMetrics, { createAlarmModalParameter, resolveAlarmStatus } from "../../_shared/alarm-metrics/alarm-metrics";
import ModalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { AlarmStatus } from "@/infrastructure/api/models/alarm";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { alarmTrend, equipmentNumber } from "@/infrastructure/utils/requestData/alarm";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./public-equipment-processing-trendsV2.module.less";

const alarmHandlingIcon = getThemeImage("alarm-handling.png");

export const PublicEquipmentProcessingTrendsV2 = defineComponent({
  name: "PublicEquipmentProcessingTrendsV2",
  setup() {
    const { globalState } = useStateStore();
    const hiddenDangerTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const alarmModalShow = ref(false);
    const alarmModalParameter = ref<Record<string, unknown>>({});
    const alarmModalStatus = ref("");
    const alarmStatusData = ref<AlarmStatus[]>([]);
    const xData = ref<string[]>([]);
    const yData = ref<number[]>([]);
    const alarmCon = ref({ count: 0, ratio: 0 });

    const openAlarmModal = (item?: AlarmStatus): void => {
      const alarmStatus = resolveAlarmStatus(item);
      alarmModalStatus.value = alarmStatus;
      alarmModalParameter.value = createAlarmModalParameter(hiddenDangerTime.value, alarmStatus);
      alarmModalShow.value = true;
    };

    const closeModal = (): void => {
      alarmModalShow.value = false;
      alarmModalStatus.value = "";
    };

    const alarmTrendInfo = async (): Promise<void> => {
      const param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: hiddenDangerTime.value.dateRange?.join(",") ?? "",
        type: hiddenDangerTime.value.timeType,
      };
      try {
        const res: { xdata: string[]; ydata: number[] } = await alarmTrend(param);
        const data: {
          alarmStatusStatistics: AlarmStatus[];
          alarmNum: number;
          chainRatio: number;
        } = await equipmentNumber(param);
        alarmStatusData.value = Array.isArray(data.alarmStatusStatistics) ? data.alarmStatusStatistics : [];
        alarmCon.value.count = Number(data.alarmNum) || 0;
        alarmCon.value.ratio = Number(data.chainRatio) || 0;
        xData.value = Array.isArray(res?.xdata) ? res.xdata : [];
        yData.value = Array.isArray(res?.ydata) ? res.ydata.map((n) => Number(n) || 0) : [];
      } catch {
        alarmStatusData.value = [];
        alarmCon.value.count = 0;
        alarmCon.value.ratio = 0;
        xData.value = [];
        yData.value = [];
      }
    };

    const onSummaryClick = (event: MouseEvent): void => {
      event.stopPropagation();
      openAlarmModal();
    };

    const onStatusClick = (event: MouseEvent, item: AlarmStatus): void => {
      event.stopPropagation();
      openAlarmModal(item);
    };

    onMounted(() => {
      void alarmTrendInfo();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["equipment-processing-trends-v2", "equipment-processing-trends-v2-panel", isZoom ? "is-zoom" : ""]}>
        <AlarmMetrics
          count={alarmCon.value.count}
          ratio={alarmCon.value.ratio}
          statuses={alarmStatusData.value}
          zoom={isZoom}
          onSummaryClick={onSummaryClick}
          onStatusClick={onStatusClick}
        />

        <div class={["chart-panel", isZoom ? "is-zoom" : ""]} data-no-zoom>
          <LineChart
            x-data={xData.value}
            gridTop={isZoom ? "28" : "26"}
            gridBottom={isZoom ? "10" : "8"}
            showLegend={false}
            axisPointer
            unit={{ x: "", y: "次" }}
            height={isZoom ? 320 : 168}
            visibleCount={6}
            scrollable
            dataZoomSlider={false}
            series={[
              {
                name: "报警数",
                data: yData.value,
                linearGradientColor: ["rgba(86, 142, 255, 0.45)", "rgba(86, 142, 255, 0)"],
                lineColor: "#568EFF",
              },
            ]}
          />
        </div>
      </div>
    );

    return () => (
      <div class="v2-panel-root equipment-processing-trends-v2-root">
        <SubPanelTemplate
          title="报警处理及趋势分析"
          class="visual-v2-sub-panel v2-panel-card equipment-processing-trends-v2-panel"
          zoomable
          zoom-title="报警处理及趋势分析详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={alarmHandlingIcon} alt="" class="title-card-icon" />,
            extra: () => (
              <DateInlineForm
                modelValue={hiddenDangerTime.value}
                onUpdate:modelValue={(v) => {
                  hiddenDangerTime.value = v;
                }}
                onSearch={alarmTrendInfo}
                data-no-zoom
              />
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
        {alarmModalShow.value && (
          <ModalAlarmTable
            showModal={alarmModalShow.value}
            alarmStatus={alarmModalStatus.value}
            parameter={alarmModalParameter.value}
            onClose={closeModal}
          />
        )}
      </div>
    );
  },
});

export default PublicEquipmentProcessingTrendsV2;
