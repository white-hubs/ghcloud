import { defineComponent } from "vue";
import { ref, reactive, toRefs, onMounted, onUnmounted } from "vue";

import DeviceStatistics from "../triage-queue/components/device-statistics";
import monitorPanel from "./monitor-panel";
import overviewChartBar from "./overview-chartBar";
import EnergyTrend from "@/features/cards/energy-consumption/components/energy-trend";
import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import modalEquipmentTable from "@/features/equipment/modal-table/modal-equipment-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { groupStatistics, statisticsStatus } from "@/infrastructure/api/alarm";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import { ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./home-page-right.module.less";

export const HomePageRight = defineComponent({
  name: "HomePageRight",
  setup(_props, ctx) {
    //综合能耗趋势图
    const { getEquipmentNumber } = useCommon();
    const { globalState } = useStateStore();
    const deviceModalShow = ref<boolean>(false);
    const overviewTime = ref<ModelValueItf>({ timeType: "THIS_MONTH" });
    const alarmModalShow = ref<boolean>(false);
    const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const colorList = ["#2AE8BD", "#2989FF", "#FFC700", "#EF424A"];

    const deviceParameter = ref<Record<string, any>>({
      status: "",
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
    const monitorPanelData = ref([
      {
        imgPath: "overView5.png",
        value: 0,
        name: "系统总量",
      },
      {
        imgPath: "overView29.png",
        value: 0,
        name: "设备总量",
      },
    ]);
    let alarmTotal = ref<number>(0);
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
    const handelClickDeviceItemize = (item?: any) => {
      if (item !== 0) {
        deviceModalShow.value = true;
      }
    };
    const handelClickDeviceNum = () => {
      alarmModalShow.value = true;
    };
    const pieData = ref([
      {
        name: "正常",
        value: 0,
        color: "#2AE8BD",
      },
      {
        name: "离线",
        value: 0,
        color: "#2989FF",
      },
      {
        name: "故障",
        value: 0,
        color: "#FFC700",
      },
      {
        name: "告警",
        value: 0,
        color: "#F14545",
      },
    ]);
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
    const receptionTrendsChartData = reactive({
      xData: ["4", "8", "12", "16", "20", "24h"],
      yData: [
        { data: [], linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"], lineColor: "rgba(120, 252, 252, 1)" },
      ],
    });
    /**
     * 设备统计
     */
    const deviceStatisticsData = reactive({
      title: "报警总量",
      total: 48,
      itemize: [
        {
          name: "处理占比",
          label: "已处理",
          value: 23,
          key: "OFFLINE",
        },
      ],
      list: [
        { img: getAssetsImage("overView5.png"), typeName: "监控设备", total: "333", offlineNum: "33" },
        { img: getAssetsImage("overView5.png"), typeName: "叫号机", total: "33", offlineNum: "33" },
        { img: getAssetsImage("overView5.png"), typeName: "签到机", total: "233", offlineNum: "33" },
        { img: getAssetsImage("overView5.png"), typeName: "叫号机", total: "33", offlineNum: "33" },
      ],
    });

    // 设备实时数据
    const deviceDataInfo = async () => {
      let res: any = await getEquipmentNumber();
      if (!res.deviceNum) {
        return;
      }
      deviceStatisticsData.total = res.deviceNum;
      pieData.value.length = 0;
      res.deviceStatusNums.forEach((item, index) => {
        pieData.value.push({
          name: deviceStatusType[item.name],
          value: item.num,
          color: colorList[index],
        });
      });
      monitorPanelData.value[0].value = res.equipmentOverview;
      monitorPanelData.value[1].value = res.deviceNum;
      alarmTotal.value = res.deviceNum;
    };
    const closeModal = () => {
      alarmModalShow.value = false;
      deviceModalShow.value = false;
    };

    onMounted(() => {
      deviceDataInfo();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="安全态势总览">
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
              onHandelClickItemize={handelClickDeviceNum}
              style="height: 60px;"
              imgPath="overView21.png"
              statistic={deviceStatisticsData1}
            ></DeviceStatistics>
            <div class="chart">
              {" "}
              <overviewChartBar bottom={"0%"} xData={barData.xData} yData={barData.yData}></overviewChartBar>
            </div>
          </SubPanelTemplate>
          <EnergyTrend></EnergyTrend>
          <SubPanelTemplate title="设备情况总览">
            <div class="monitorPanelBox">
              {monitorPanelData.map((item, index) => (
                <monitorPanel onHandelClickItemize={handelClickDeviceItemize(index)} key={item.name} monitorPanelData={item}></monitorPanel>
              ))}
            </div>
            <div class="elevator-analysis">
              <div class="chart">
                <elevator-analysis-pie pieData={pieData.value}>
                  <div style="color: #fff;text-align: center;font-size: 14px;"> {alarmTotal.value}</div>
                  <div style="color: #fff;text-align: center;font-size: 14px;"> 总量</div>
                </elevator-analysis-pie>
              </div>
              <elevatorAnalysisList contentList={pieData.value} class="analysisList"></elevatorAnalysisList>
            </div>
          </SubPanelTemplate>
        </div>
        {alarmModalShow && (
          <modal-alarm-table show-modal={alarmModalShow.value} onClose={closeModal} parameter={overviewTime.value}></modal-alarm-table>
        )}
        {deviceModalShow && (
          <modal-equipment-table
            show-modal={deviceModalShow.value}
            onClose={closeModal}
            parameter={deviceParameter}
          ></modal-equipment-table>
        )}
      </>
    );
  },
});

export default HomePageRight;
