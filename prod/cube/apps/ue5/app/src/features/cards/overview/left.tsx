import dayjs from "dayjs";
import moment from "moment";
import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { CountTo } from "vue3-count-to";

import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";

import PatrolSituation from "./patrol-situation";
import SituationAnalysis from "./situation-analysis";
import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-table";
import modalEquipmentTable from "@/features/equipment/modal-table/modal-equipment-table";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAlarmSituation } from "@/infrastructure/api/alarm";
import { getDeviceSituation } from "@/infrastructure/api/device";
import { getDataDictionaryByItem } from "@/infrastructure/api/dictionary";
import { depTaskExecutionAnalysis } from "@/infrastructure/api/maintain";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    interface Itemize {
      color: string;
      value: number;
      label: string;
      ratio: number;
      applicationCode: string;
    }
    const startTime = ref(window.config?.systemStartTime ?? "2021-01-01");
    const days = ref(dayjs().diff(startTime.value, "day"));

    const monitorDays = ref<number>(1456);
    const handleAlarmTime = ref<ModelValueItf>();
    const alarmParameter = ref<Record<string, any>>({});
    const deviceParameter = ref<Record<string, any>>({
      status: "",
    });
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
      total: 18,
      itemize: [
        {
          label: "待接收",
          value: 2,
          color: "#7268FA",
        },
        {
          label: "执行中",
          value: 14,
          color: "#20E8E7",
        },
        {
          label: "已结束",
          value: 2,
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
    const handelClickDeviceNum = (item?: any) => {
      deviceModalShow.value = true;
      deviceParameter.value = { status: item?.key };
    };
    const handelClickDeviceItemize = (item?: any) => {
      deviceModalShow.value = true;
      deviceParameter.value = { applicationCode: item?.applicationCode };
    };
    const closeModal = () => {
      alarmModalShow.value = false;
      deviceModalShow.value = false;
    };
    const changeHandleAlarmTime = () => {
      rquesestAlarmSituation();
    };
    const requestDeviceSituation = async () => {
      const res = await getDeviceSituation();
      deviceSituationAnalysis.total = res.deviceNum;
      deviceSituationAnalysis.itemize.map((item) => {
        let ele = res.deviceStatusNums.find((element) => element.name === item.key);
        item.value = ele.num;
      });
      deviceSituationPieData.value = res.deviceApplicationNums.map((item, index) => {
        return {
          label: `${item.applicationName}(${Math.round(item.proportion * 10000) / 100}%)`,
          value: item.num,
          ratio: item.ratio,
          color: deviceSituationColors.value[index % 4],
          applicationCode: item.applicationCode,
        };
      });
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
      // if (alarmSituationPieData.value.length > 4) {
      //   let arr1 = alarmSituationPieData.value.slice(0, 3);
      //   let arr2 = alarmSituationPieData.value.slice(3, alarmSituationPieData.value.length);
      //   let otherTotal = arr2
      //     .map((item) => item.value)
      //     .reduce(function (pre, curr) {
      //       return pre + curr;
      //     });
      //   let otherTotalRatio = arr2
      //     .map((item) => item.ratio)
      //     .reduce(function (pre, curr) {
      //       return pre + curr;
      //     });
      //   alarmSituationPieData.value = [
      //     ...arr1,
      //     {
      //       label: `其他(${Math.round(otherTotalRatio * 100) / 100}%)`,
      //       value: otherTotal,
      //       ratio: otherTotalRatio,
      //       color: alarmSituationColors.value[4],
      //     },
      //   ];
      // }
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
    const getDictionary = async () => {
      const res = await new CubeDictionaryService().getSysDictionaryByCodeAndItemCode({
        itemCode: "SYSTEM_CREATION_TIME",
        code: "SYSTEM_CREATION_TIME",
      });
      if (res.variable) {
        startTime.value = res.variable;
        days.value = dayjs().diff(startTime.value, "day");
      }
    };

    onMounted(() => {
      requestDeviceSituation();
      getDepTaskExecutionAnalysis();
      getDictionary();
    });

    return (): JSX.Element => (
      <>
        <div class="panel">
          <SubPanelTemplate title="安全运营天数">
            {" "}
            <OperateDays value={days.value} title="监测天数"></OperateDays>
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
          <SubPanelTemplate title="设备态势">
            <div class="device-statistic">
              <SituationAnalysis
                imgPath="overView5.png"
                statistic={deviceSituationAnalysis}
                onClickNum={handelClickDeviceNum}
              ></SituationAnalysis>
              <div class="flex-between">
                <PlanPie pieData={deviceSituationPieData.value} class="device-total-pie" pie-class="device-total-pie-chart">
                  <div class="content">
                    <div class="total-num"> {deviceSituationAnalysis.total}</div>
                    <div> 设备总数</div>
                  </div>
                </PlanPie>
                <PieList
                  roundPieData={deviceSituationPieData.value}
                  onHandelClickItemize={handelClickDeviceItemize}
                  class="device-total-list"
                ></PieList>
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="巡查态势">
            {" "}
            <PatrolSituation statistic={inspectionSituationAnalysis}></PatrolSituation>
          </SubPanelTemplate>
        </div>
        <modal-alarm-table show-modal={alarmModalShow.value} onClose={closeModal} parameter={alarmParameter}></modal-alarm-table>
        <modal-equipment-table show-modal={deviceModalShow.value} onClose={closeModal} parameter={deviceParameter}></modal-equipment-table>
      </>
    );
  },
});

export default Left;
