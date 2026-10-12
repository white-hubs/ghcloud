import dayjs from "dayjs";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import overviewChartBar from "../hospital/overview-chartBar";
import DeviceStatistics from "../triage-queue/components/device-statistics";
import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { groupStatistics, statisticsStatus } from "@/infrastructure/api/alarm";
import { playRecord } from "@/infrastructure/api/securitymanagement";
import enumeratie from "@/infrastructure/utils/enumeratie";
import { alarmTrend } from "@/infrastructure/utils/requestData/alarm";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const { alarmStatusOptions } = enumeratie();
    const { getAlarmsNumber } = useCommon();
    const { globalState } = useStateStore();
    const alarmInfo = reactive({
      total: 0,
      chainRatio: 0,
    });
    const overviewTime = ref<ModelValueItf>();
    const alarmModalShow = ref<boolean>(false);
    const trend = reactive<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const xData = reactive({ arr: [] });
    const series = reactive([
      {
        data: [],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
    ]);
    const alarmStatusData = reactive([]);
    const closeModal = () => {
      alarmModalShow.value = false;
    };
    const handelClickDeviceItemize = () => {
      alarmModalShow.value = true;
    };
    const column = reactive([
      {
        title: "信息名称",
        dataIndex: "itemName",
        width: 120,
      },
      {
        title: "发布时间",
        dataIndex: "startTime",
        width: 160,
      },
    ]);
    const listData = ref([]);
    // 设备报警趋势
    const getAlarmTrend = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: trend.dateRange.join(","),
        type: trend.timeType,
      };
      let res: any = await getAlarmsNumber(param);
      let data: any = await alarmTrend(param);

      xData.arr = data.xdata;
      series[0].data = data.ydata;
      alarmStatusData.length = 0;
      res.alarmStatusStatistics.forEach((item) => {
        let obj = {
          alarmStatusName: item.alarmStatusName,
          alarmNum: item.alarmNum,
          color: "",
        };
        alarmStatusOptions.value.forEach((element) => {
          if (item.alarmStatus === element.value) {
            obj.color = element.color;
          }
        });
        alarmStatusData.push(obj);
      });
      alarmInfo.total = res.count;
      alarmInfo.chainRatio = res.ratio;
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
    // 信息发布
    const getPlayRecord = async () => {
      const res = await playRecord();
      listData.value = res.records;
      listData.value.forEach((item) => {
        item.startTime = dayjs(item.startTime).format("YYYY-MM-DD HH:mm:ss");
      });
    };
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
    }
    onMounted(() => {
      getPlayRecord();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备告警统计">
            <template>
              {" "}
              <DateInlineForm
                modelValue={overviewTime.value}
                onUpdate:modelValue={(v) => {
                  overviewTime.value = v;
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
            <div class="chart">
              {" "}
              <overviewChartBar bottom={"0%"} xData={barData.xData} yData={barData.yData}></overviewChartBar>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="信息发布">
            {" "}
            <RollTable column={column} data={listData.value}></RollTable>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备报警趋势" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={trend}
                onUpdate:modelValue={(v) => {
                  Object.assign(trend, v);
                }}
                onSearch={getAlarmTrend}
              ></DateInlineForm>
            </template>
            <OperateDays value={alarmInfo.value.total} title="报警总数">
              <div class="ringRatio">
                <span> 环比</span>
                <div class={["downtriangle", alarmInfo.chainRatio > 0 && "uptriangle"]}></div>
                <div class={[alarmInfo.chainRatio > 0 ? "up" : "down"]}> {alarmInfo.chainRatio + "%"}</div>
              </div>
            </OperateDays>
            <GridContainer parameter={trend} style="margin-top: 12px" data={alarmStatusData}></GridContainer>
            <LineChart class="chart1" x-data={xData.arr} series={series}></LineChart>
          </SubPanelTemplate>
        </div>
        {alarmModalShow && (
          <modal-alarm-table show-modal={alarmModalShow.value} onClose={closeModal} parameter={overviewTime.value}></modal-alarm-table>
        )}
      </>
    );
  },
});

export default Right;
