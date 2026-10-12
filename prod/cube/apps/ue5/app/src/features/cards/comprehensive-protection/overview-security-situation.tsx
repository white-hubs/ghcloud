import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import DeviceStatistics from "../triage-queue/components/device-statistics";
import OverviewChartBar from "@/features/cards/hospital/overview-chartBar";
import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { groupStatistics, statisticsStatus } from "@/infrastructure/api/alarm";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./overview-security-situation.module.less";

export const OverviewSecuritySituation = defineComponent({
  name: "OverviewSecuritySituation",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const overviewTime = ref<ModelValueItf>();
    const alarmModalShow = ref<boolean>(false);

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
    // 报警状态统计&报警趋势折线图统计
    async function getAlarmsNumbers() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: overviewTime.value.dateRange.join(","),
        type: overviewTime.value.timeType,
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
      barData.xData.length ? barData.xData : (barData.xData = ["安防报警", "消防报警", "电气报警", "入侵报警"]);
      barData.yData[1].data.length ? barData.yData[1].data : (barData.yData[1].data = ["0"]);
      barData.yData[0].data.length ? barData.yData[0].data : (barData.yData[0].data = ["0"]);
    }
    const handelClickDeviceNum = () => {
      alarmModalShow.value = true;
    };
    const closeModal = () => {
      alarmModalShow.value = false;
    };

    // 放大模式下的点击处理（复用原有逻辑）
    const handelClickDeviceNumZoom = () => {
      handelClickDeviceNum();
    };

    const handleBarClick = (value: any) => {
      // 原有的图表点击处理逻辑
      console.log("Bar clicked:", value);
    };

    const handleBarClickZoom = (value: any) => {
      handleBarClick(value);
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="安全态势总览" zoomable zoom-title="安全态势总览">
          <template>
            {" "}
            <DateInlineForm
              modelValue={overviewTime.value}
              onUpdate:modelValue={(v) => {
                overviewTime.value = v;
              }}
              onSearch={getAlarmsNumbers}
              data-no-zoom
            ></DateInlineForm>
          </template>
          <DeviceStatistics
            onHandelClickItemize={handelClickDeviceNum}
            style="height: 60px"
            imgPath="overView21.png"
            statistic={deviceStatisticsData1}
            data-no-zoom
          ></DeviceStatistics>
          <div class="chart" data-no-zoom>
            {" "}
            <OverviewChartBar bottom={"0%"} xData={barData.xData} yData={barData.yData} onClickbar={handleBarClick}></OverviewChartBar>
          </div>
          <template>
            <div class="zoom-security-content">
              <DeviceStatistics
                onHandelClickItemize={handelClickDeviceNumZoom}
                style="height: 80px"
                imgPath="overView21.png"
                statistic={deviceStatisticsData1}
                data-no-zoom
              ></DeviceStatistics>
              <div class="zoom-chart">
                {" "}
                <OverviewChartBar
                  bottom={"0%"}
                  xData={barData.xData}
                  yData={barData.yData}
                  onClickbar={handleBarClickZoom}
                  height={320}
                ></OverviewChartBar>
              </div>
            </div>
          </template>
        </SubPanelTemplate>
        {alarmModalShow && (
          <modal-alarm-table show-modal={alarmModalShow.value} onClose={closeModal} parameter={overviewTime.value}></modal-alarm-table>
        )}
      </>
    );
  },
});

export default OverviewSecuritySituation;
