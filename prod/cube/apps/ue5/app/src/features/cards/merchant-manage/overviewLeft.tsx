import moment from "moment";
import { defineComponent } from "vue";
import { onMounted, reactive, ref } from "vue";
import { CountTo } from "vue3-count-to";

import PatrolSituation from "../overview/patrol-situation";
import DeviceStatistics from "../security-monitoring-safty/device-statistics";
import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-table";
import modalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAlarmSituation } from "@/infrastructure/api/alarm";
import { getDeviceBuyArea, getDeviceNumber } from "@/infrastructure/api/device";
import { depTaskExecutionAnalysis } from "@/infrastructure/api/maintain";
import { setDeviceData } from "@/infrastructure/utils/common";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import { buildVisualMenuTagCode, buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./overviewLeft.module.less";

export const OverviewLeft = defineComponent({
  name: "OverviewLeft",
  setup(_props, ctx) {
    interface Itemize {
      color: string;
      value: number;
      label: string;
      ratio: number;
      applicationCode: string;
    }
    const { globalState } = useStateStore();
    const monitorDays = ref<number>(Math.abs(moment("2023-09-18").diff(moment(), "days")));
    const handleAlarmTime = ref<ModelValueItf>();
    const alarmParameter = ref<Record<string, any>>({});
    const deviceParameter = reactive({
      areaId: "",
      status: "",
      filterAreaIds: [],
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      dateRange: [],
    });
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
    const detectionData = ref([]);
    const alarmModalShow = ref<boolean>(false);
    const deviceModalShow = ref<boolean>(false);
    const alarmTotal = ref<number>(0);
    const alarmSituationStatistic = ref<
      {
        label: string;
        value: number;
        img: string;
        color: string;
        key: string;
        alarmHandleResult: string;
      }[]
    >([
      {
        label: "报警总数",
        value: 0,
        img: "overView1.png",
        color: "#D0DEEE",
        key: "alarmNum",
        alarmHandleResult: "",
      },
      {
        label: "真实数",
        value: 0,
        img: "overView2.png",
        color: "#F14545",
        key: "alarmActualNum",
        alarmHandleResult: "ALARM_ACTUAL",
      },
      {
        label: "误报数",
        value: 0,
        img: "overView3.png",
        color: "#FFC700",
        key: "alarmImpracticalNum",
        alarmHandleResult: "ALARM_IMPRACTICAL",
      },
    ]);
    const alarmSituationColors = ref<string[]>(["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"]);
    const alarmSituationPieData = ref<Itemize[]>([]);
    const deviceSituationAnalysis = reactive({
      title: "设备总数",
      total: 0,
      itemize: [
        {
          label: "在线",
          value: 0,
          color: "#35D93D",
          key: "NORMAL",
        },
        {
          label: "离线",
          value: 0,
          color: "#D0DEEE",
          key: "OFFLINE",
        },
        {
          label: "故障",
          value: 0,
          color: "#FFC700",
          key: "TROUBLE",
        },
        {
          label: "报警",
          value: 0,
          color: "#F14545",
          key: "ALARM",
        },
      ],
    });
    const deviceSituationColors = ref<string[]>(["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"]);
    const deviceSituationPieData = ref<Itemize[]>([]);
    const inspectionSituationAnalysis = reactive({
      title: "巡检总数",
      total: 0,
      itemize: [
        {
          label: "任务总数",
          value: 0,
          color: "#7268FA",
        },
        {
          label: "超时任务数",
          value: 0,
          color: "#20E8E7",
        },
        {
          label: "过期任务数",
          value: 0,
          color: "#2F8DFF",
        },
        {
          label: "异常任务数",
          value: 0,
          color: "#35D93D",
        },
      ],
    });
    const patrolSituationAnalysis = reactive({
      title: "巡更总数",
      total: 0,
      itemize: [
        {
          label: "待接收",
          value: 0,
          color: "#7268FA",
        },
        {
          label: "执行中",
          value: 0,
          color: "#20E8E7",
        },
        {
          label: "已结束",
          value: 0,
          color: "#2F8DFF",
        },
      ],
    });
    const handelClickAlarmNum = (item: Record<string, any>) => {
      alarmModalShow.value = true;
      alarmParameter.value = {
        alarmHandleResult: item.alarmHandleResult,
        dateRange: handleAlarmTime.value?.dateRange,
      };
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
    const alarmEventTop = async () => {
      let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
      const data = await getDeviceNumber({
        tagCodes: buildVisualMenuTagCode(globalState.business.currentMenu),
        areaId: globalState.business.currentAreaId,
      });
      deviceStatisticsData.total = data.totalNumber;
      deviceStatisticsData.itemize[0].value = data.offlineNumber;
      deviceStatisticsData.itemize[0].offline = data.normalNumber;
      const res = await getDeviceBuyArea({
        tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
        areaLevel: globalState.business.currentAreaLeave + 1,
      });
      alarmTotal.value = 0;
      detectionData.value = setDeviceData(res, colorList);
      detectionData.value.forEach((item) => {
        alarmTotal.value += item.value;
      });
    };
    const closeModal = () => {
      alarmModalShow.value = false;
      deviceModalShow.value = false;
    };
    const changeHandleAlarmTime = () => {
      rquesestAlarmSituation();
    };

    const rquesestAlarmSituation = async () => {
      const res = await getAlarmSituation({
        period: handleAlarmTime.value.dateRange.join(","),
        type: handleAlarmTime.value.timeType,
      });
      alarmTotal.value = res.alarmBimStatistics.alarmNum;
      alarmSituationStatistic.value.map((item) => {
        item.value = res.alarmBimStatistics[item.key];
        return item;
      });
      alarmSituationPieData.value = res.alarmBimStatisticsTopChains.map((item, index) => {
        return {
          label: `${item.name}(${Math.round(item.ratio * 100) / 100}%)`,
          value: item.alarmNum,
          ratio: item.ratio,
          color: alarmSituationColors.value[index % 4],
          id: item.id,
        };
      });
      //排序
      alarmSituationPieData.value = alarmSituationPieData.value.sort(function (a, b) {
        if (a.value > b.value) {
          return -1;
        } else {
          return 1;
        }
      });
    };
    const handelClickItemize = (item) => {
      alarmModalShow.value = true;
      alarmParameter.value = {
        dateRange: handleAlarmTime.value?.dateRange,
        alarmTypeId: item.id,
      };
    };
    const getDepTaskExecutionAnalysis = async () => {
      const res = await depTaskExecutionAnalysis({
        period: [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(","),
      });
      inspectionSituationAnalysis.itemize[0].value = res.totalTaskNum;
      inspectionSituationAnalysis.itemize[1].value = res.overTimeTaskNum;
      inspectionSituationAnalysis.itemize[2].value = res.expiredTaskNum;
      inspectionSituationAnalysis.itemize[3].value = res.abnormalTaskNum;
      inspectionSituationAnalysis.total = res.totalTaskNum;
    };
    onMounted(() => {
      getDepTaskExecutionAnalysis();
      alarmEventTop();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="安全运营天数">
            {" "}
            <OperateDays value={monitorDays.value} title="监测天数"></OperateDays>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警态势">
            <template>
              {" "}
              <DateInlineForm
                modelValue={handleAlarmTime.value}
                onUpdate:modelValue={(v) => {
                  handleAlarmTime.value = v;
                }}
                onSearch={changeHandleAlarmTime}
              ></DateInlineForm>
            </template>
            <div class="statistic flex-between">
              {alarmSituationStatistic.map((item) => (
                <div class="statistic-item flex-center" onClick={handelClickAlarmNum(item)}>
                  <div class="left">
                    {" "}
                    <img src={getAssetsImage(item.img)} />
                  </div>
                  <div class="right">
                    <count-to
                      startVal={0}
                      endVal={item.value}
                      duration={4000}
                      class="scroll-number"
                      style={{ color: item.color }}
                    ></count-to>
                    <div style="white-space: nowrap;"> {item.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div class="flex-between">
              <PlanPie pieData={alarmSituationPieData.value} class="alarm-total-pie" pie-class="alarm-total-pie-chart">
                <div class="content">
                  <div class="total-num"> {alarmTotal.value}</div>
                  <div> 报警总数</div>
                </div>
              </PlanPie>
              <PieList
                roundPieData={alarmSituationPieData.value}
                onHandelClickItemize={handelClickItemize}
                class="alarm-total-list"
              ></PieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备态势" class="alarm-event">
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
          <SubPanelTemplate title="巡查态势">
            {" "}
            <PatrolSituation statistic={inspectionSituationAnalysis}></PatrolSituation>
          </SubPanelTemplate>
        </div>
        <modal-alarm-table show-modal={alarmModalShow.value} onClose={closeModal} parameter={alarmParameter}></modal-alarm-table>
        <modal-equipmentAll-table
          show-modal={deviceModalShow.value}
          onClose={() => {
            deviceModalShow.value = false;
          }}
          parameter={deviceParameter}
        ></modal-equipmentAll-table>
      </>
    );
  },
});

export default OverviewLeft;
