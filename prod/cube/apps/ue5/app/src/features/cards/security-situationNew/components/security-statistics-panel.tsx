import { defineComponent } from "vue";
import { reactive, ref } from "vue";

import overviewChartBar from "../../hospital/overview-chartBar";
import DeviceStatistics from "../../triage-queue/components/device-statistics";
import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { groupStatistics, statisticsStatus } from "@/infrastructure/api/alarm";
import { px2rem } from "@/infrastructure/utils/common";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./security-statistics-panel.module.less";

export const SecurityStatisticsPanel = defineComponent({
  name: "SecurityStatisticsPanel",
  props: {
    fromPage: { type: null, required: true, default: "PARK" },
    chartHeight: { type: Number, required: false, default: 220 },
  },
  setup(props, ctx) {
    const { globalState } = useStateStore();
    const alarmParameter = ref<Record<string, any>>({});
    const handelClickDeviceItemize = (item?: any) => {
      alarmModalShow.value = true;
    };
    const closeModal = () => {
      alarmModalShow.value = false;
    };
    const barData = reactive({
      xData: ["安防报警", "消防报警", "电气报警", "入侵报警"],
      yData: [
        {
          data: [],
          name: "已处理",
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
        {
          data: [],
          name: "处理中",
          color: ["rgba(42, 232, 189, 0.80)", "rgba(42, 232, 189, 0)"],
        },
      ],
    });
    /**
     * 设备统计
     */
    const deviceStatisticsData1 = reactive({
      title: "告警总量",
      total: 0,
      itemize: [
        {
          name: "处理占比",
          label: "已处理",
          value: 0,
          key: "OFFLINE",
        },
      ],
    });
    const trendTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    // 报警状态统计&报警趋势折线图统计
    async function getAlarmsNumbers() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: trendTime.value.dateRange.join(","),
        type: trendTime.value.timeType,
      };
      const Status = await statisticsStatus(params);
      deviceStatisticsData1.total = Status.alarmNum;
      Status.alarmStatusStatistics.forEach((item) => {
        if (item.alarmStatusName === "已处理") {
          deviceStatisticsData1.itemize[0].value = item.alarmNum;
        }
      });
      const res = await groupStatistics(params);
      barData.xData = res.map((item) => item.applicationName);
      barData.yData[0].data = res.map((item) => item.alarmHandler);
      barData.yData[1].data = res.map((item) => item.alarmProgressConfirmed);
      barData.yData[0].data.length ? barData.yData[0].data : (barData.yData[0].data = [""]);
      barData.yData[1].data.length ? barData.yData[1].data : (barData.yData[1].data = [""]);
      barData.xData.length ? barData.xData : (barData.xData = ["安防报警", "消防报警", "电气报警", "入侵报警"]);
    }

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="安全态势总览">
          <template>
            {" "}
            <DateInlineForm
              modelValue={trendTime.value}
              onUpdate:modelValue={(v) => {
                trendTime.value = v;
              }}
              onSearch={getAlarmsNumbers}
            ></DateInlineForm>
          </template>
          <DeviceStatistics
            onHandelClickItemize={handelClickDeviceItemize}
            style="height: 60px;"
            imgPath="overView21.png"
            statistic={deviceStatisticsData1}
          ></DeviceStatistics>
          <div class="stacked-bar-chart" style={{ height: px2rem(chartHeight + "px") }}>
            {" "}
            <overviewChartBar xData={barData.xData} yData={barData.yData}></overviewChartBar>
          </div>
        </SubPanelTemplate>
        {alarmModalShow && (
          <modal-alarm-table show-modal={alarmModalShow} onClose={closeModal} parameter={trendTime.value}></modal-alarm-table>
        )}
      </>
    );
  },
});

export default SecurityStatisticsPanel;
