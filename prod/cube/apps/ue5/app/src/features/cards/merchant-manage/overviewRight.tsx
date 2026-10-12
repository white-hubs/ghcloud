import { defineComponent } from "vue";
import { onMounted, reactive, ref } from "vue";

import DeviceStatistics from "../security-monitoring-safty/device-statistics";
import modalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getDeviceBuyArea, getDeviceNumber } from "@/infrastructure/api/device";
import { sceneTypePage } from "@/infrastructure/api/mdata";
import { getFaultyEquipmentTop, getHazardStatistics } from "@/infrastructure/api/merchant";
import { getStateTotal } from "@/infrastructure/api/personnel";
import { setDeviceData } from "@/infrastructure/utils/common";
import { buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import barChart from "@/shared-ui/panel/charts/bar/barChart";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./overviewRight.module.less";

export const OverviewRight = defineComponent({
  name: "OverviewRight",
  setup(_props, ctx) {
    const workOrderTime = ref<ModelValueItf>();
    const hiddenDangerTime = ref<ModelValueItf>();
    const xData = ref<string[]>([]);
    const yData = ref<number[]>([]);
    const alarmStatusData = ref([
      { alarmStatus: "ALARM_PROGRESS_CONFIRMED", alarmStatusName: "工单总数", alarmNum: 0, color: "rgb(255, 199, 0)" },
      { alarmStatus: "ALARM_PROGRESS_CONFIRMED", alarmStatusName: "未处理", alarmNum: 0, color: "rgb(0, 242, 123)" },
      { alarmStatus: "ALARM_PROGRESS_CONFIRMED", alarmStatusName: "已处理 ", alarmNum: "", color: "rgb(41, 194, 255)" },
    ]);
    const detectionData = ref([]);
    const alarmTotal = ref<number>(0);
    const deviceStatisticsData = reactive({
      title: "设备总数",
      total: 48,
      itemize: [
        {
          name: "在线设备数",
          label: "离线设备数",
          value: 23,
          offline: 15,
          key: "OFFLINE1",
        },
      ],
    });
    const { globalState } = useStateStore();
    const deviceParameter = reactive({
      areaId: "",
      status: "",
      filterAreaIds: [],
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      dateRange: [],
    });
    const hiddenDanger = reactive({
      PieData: [],
      total: 0,
    });
    const monitorSituationColors = ref<string[]>(["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"]);
    const personStatistic = reactive({
      total: 0,
      onDutyNum: 0,
      leaveNum: 0,
    });
    const deviceModalShow = ref(false);

    const requestStateTotal = async () => {
      const res = await getStateTotal();
      personStatistic.total = res.find((item) => item.name === "TOTAL")?.value;
      personStatistic.onDutyNum = res.find((item) => item.name === "ON_DUTY")?.value;
      personStatistic.leaveNum = res.find((item) => item.name === "OFF_DUTY")?.value;
    };
    const alarmRegion = (value) => {
      deviceParameter.status = "";
      if (value.name === "其他") {
        deviceParameter.areaId = undefined;
        deviceParameter.filterAreaIds = detectionData.value.map((e) => e.areaId);
      } else {
        deviceParameter.areaId = detectionData.value.find((e) => e.name === value.name).areaId;
        deviceParameter.filterAreaIds = [];
      }
      deviceModalShow.value = true;
    };

    const changeHandleworkOrderTime = async () => {
      const res = await getFaultyEquipmentTop({ period: workOrderTime.value.dateRange.join(",") });
      xData.value.length = 0;
      yData.value.length = 0;
      res.forEach((item) => {
        xData.value.push(item.name);
        yData.value.push(item.value);
      });
    };
    const alarmEventTop = async () => {
      let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
      const data = await getDeviceNumber({ tagCodes: deviceParameter.tagCodes[0], areaId: globalState.business.currentAreaId });
      deviceStatisticsData.total = data.totalNumber;
      deviceStatisticsData.itemize[0].value = data.offlineNumber;
      deviceStatisticsData.itemize[0].offline = data.normalNumber;
      const res = await getDeviceBuyArea({
        tagCodes: deviceParameter.tagCodes,
        areaLevel: globalState.business.currentAreaLeave,
      });
      alarmTotal.value = 0;
      detectionData.value = setDeviceData(res, colorList);
      detectionData.value.forEach((item) => {
        alarmTotal.value += item.value;
      });
    };
    const deviceOpen = (value) => {
      if (value === "离线设备数") {
        deviceParameter.status = "OFFLINE";
      } else if (value === "在线设备数") {
        deviceParameter.status = "ONLINE";
      } else {
        deviceParameter.status = "";
      }
      deviceParameter.areaId = globalState.business.currentAreaId;
      deviceModalShow.value = true;
    };
    const changeHandleHiddenDangerTime = async () => {
      const res = await getHazardStatistics({ period: hiddenDangerTime.value.dateRange.join(",") });
      alarmStatusData.value[0].alarmNum = res.total;
      alarmStatusData.value[1].alarmNum = res.afoot;
      alarmStatusData.value[2].alarmNum = res.end;
      hiddenDanger.total = 0;
      hiddenDanger.PieData = res.data.map((item, index) => {
        hiddenDanger.total += item.value;
        return {
          label: item.name,
          value: item.value,
          color: monitorSituationColors.value[index],
        };
      });
    };
    /** 获取菜单 */
    async function getMenuList() {
      const res = await sceneTypePage();
      const arr = res.filter((e) => {
        return e.name.includes("安防");
      });
      if (arr.length) {
        deviceParameter.tagCodes = buildVisualMenuTagCodes(arr[0].id);
      }
    }
    onMounted(async () => {
      await getMenuList();
      requestStateTotal();
      alarmEventTop();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="监控态势" class="alarm-event">
            <DeviceStatistics onHandelClickItemize={deviceOpen} imgPath="overView5.png" statistic={deviceStatisticsData}></DeviceStatistics>
            <div class="elevator-analysis">
              <div class="chart">
                <elevator-analysis-pie onClickbar={alarmRegion} pieData={detectionData.value}>
                  <div style="color: #fff;text-align: center;font-size: 14px;"> {alarmTotal.value}</div>
                  <div style="color: #fff;text-align: center;font-size: 14px;"> 设备总数</div>
                </elevator-analysis-pie>
              </div>
              <elevatorAnalysisList
                onHandlecurrent={alarmRegion}
                showRatio={false}
                contentList={detectionData.value}
                class="pie_list"
              ></elevatorAnalysisList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="隐患统计">
            <template>
              {" "}
              <DateInlineForm
                modelValue={hiddenDangerTime.value}
                onUpdate:modelValue={(v) => {
                  hiddenDangerTime.value = v;
                }}
                onSearch={changeHandleHiddenDangerTime}
              ></DateInlineForm>
            </template>
            <GridContainer style="margin-top: 10px" data={alarmStatusData.value}></GridContainer>
            <div class="monitor-statistic">
              <div class="flex-between">
                <PlanPie pieData={hiddenDanger.PieData}>
                  <div class="content">
                    <div class="total-num"> {hiddenDanger.total}</div>
                    <div> 工单总数</div>
                  </div>
                </PlanPie>
                <PieList roundPieData={hiddenDanger.PieData}></PieList>
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报修工单统计">
            <template>
              {" "}
              <DateInlineForm
                modelValue={workOrderTime.value}
                onUpdate:modelValue={(v) => {
                  workOrderTime.value = v;
                }}
                onSearch={changeHandleworkOrderTime}
              ></DateInlineForm>
            </template>
            <div class="charts">
              {" "}
              <barChart title={""} x-data={xData.value} data={[{ color: "#1890FF", name: "", data: yData }]} class="columnBox" />
            </div>
          </SubPanelTemplate>
          <modal-equipmentAll-table
            show-modal={deviceModalShow.value}
            onClose={() => {
              deviceModalShow.value = false;
            }}
            parameter={deviceParameter}
          ></modal-equipmentAll-table>
        </div>
      </>
    );
  },
});

export default OverviewRight;
