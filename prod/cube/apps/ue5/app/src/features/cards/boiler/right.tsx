import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted, computed } from "vue";

import overviewChartBar from "../hospital/overview-chartBar";
import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatisticsList } from "@/infrastructure/api/alarm";
import { equipmentTotal } from "@/infrastructure/api/equipment";
import { getBoilerOverTemperStatistics } from "@/infrastructure/api/securitymanagement";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    const transactionTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const colorList = ["#2F8DFF", "#D0DEEE", "#FFAB10", "#F14545"];
    const column = reactive([
      {
        title: "报警时间",
        dataIndex: "alarmTime",
        width: 120,
      },
      {
        title: "报警级别",
        dataIndex: "alarmLevelName",
        width: 120,
      },
      {
        title: "报警事件",
        dataIndex: "alarmEventName",
        width: 140,
      },
      {
        title: "状态",
        dataIndex: "alarmStatus",
        slots: {
          customRender: "alarmStatus",
        },
      },
    ]);
    const listData = ref([]);
    const barData = reactive({
      xData: ["1", "2", "3"],
      yData: [
        {
          data: [],
          name: "",
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
      ],
    });
    const deviceStatistic = ref([]);
    const monitorSituationPieData = ref<{ label: string; value: number; color: string }[]>([]);
    const roundPieData = ref([]);
    const overTemperData = ref([]);
    const alarmTotal = ref(0);
    const temperatureAlarmTotal = ref(0);
    const pieData = ref([]);
    const deviceFlag = ref("overview");
    const alarmModalShow = ref<boolean>(false);
    const alarmParameter = ref<Record<string, any>>({});
    const handelClickDeviceNum = (item) => {
      alarmModalShow.value = true;
    };
    const closeModal = () => {
      alarmModalShow.value = false;
    };
    // 设备实时数据
    const deviceDataInfo = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      let res: any = await equipmentTotal(params);
      if (!res.deviceNum) {
        return;
      }
      monitorSituationPieData.value.length = 0;
      deviceStatistic.value.length = 0;
      roundPieData.value.length = 0;
      alarmTotal.value = 0;
      res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
          label: deviceStatusType[item.name],
          color: colorList[index],
          value: item.num,
        };
        pieData.value.push(obj);
        deviceStatistic.value.push({
          alarmStatusName: deviceStatusType[item.name],
          color: colorList[index],
          alarmNum: item.num,
        });
      });
      res.deviceGenreNums.forEach((item, index) => {
        let obj = {
          label: `${item.genreName}(${Math.round((item.num / res.deviceNum) * 10000) / 100.0}%)`,
          color: colorList[index],
          value: item.num,
        };
        roundPieData.value.push(obj);
      });
    };
    // 获取报警列表
    async function getAlarmTakeNotes() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        pageSize: 50,
        pageNumber: 1,
      };
      let res: any = await alarmStatisticsList(params);

      listData.value = res.records.map((item) => {
        return {
          ...item,
          alarmTime: moment(item.alarmTime).format("YYYY-MM-DD"),
        };
      });
    }
    const changeTransactionTime = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        period: transactionTime.value.dateRange.join(","),
        type: transactionTime.value.timeType,
      };
      const result = await getBoilerOverTemperStatistics(param);
      barData.xData = result.xtitle;
      temperatureAlarmTotal.value = 0;
      barData.yData[0].data = result.xtitle.map((xItem) => {
        return result.timeGroupStatistics.find((item) => item.dateFlag === xItem)
          ? result.timeGroupStatistics.find((item) => item.dateFlag === xItem)?.alarmNum
          : 0;
      });
      overTemperData.value = result.deviceStatistics.map((item, index) => {
        temperatureAlarmTotal.value += item.alarmNum;
        return {
          label: item.deviceName,
          value: item.alarmNum,
          color: colorList[index],
        };
      });
    };
    onMounted(() => {
      deviceDataInfo();
      getAlarmTakeNotes();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备统计">
            <a-radio-group
              value={deviceFlag.value}
              onUpdate:value={(v) => {
                deviceFlag.value = v;
              }}
              button-style="solid"
            >
              <a-radio-button value="overview"> 设备总览</a-radio-button>
              <a-radio-button value="monitor"> 设备状态监测</a-radio-button>
            </a-radio-group>
            <div>
              <OperateDays title="设备总数" value={alarmTotal.value}></OperateDays>
              <div class="flex-between">
                <PlanPie pieData={roundPieData.value}>
                  <div class="content">
                    <div class="total-num"> {alarmTotal.value}</div>
                    <div> 设备总数</div>
                  </div>
                </PlanPie>
                <PieList roundPieData={roundPieData.value}></PieList>
              </div>
            </div>
            <div>
              <GridContainer data={deviceStatistic.value}></GridContainer>
              <div class="chart">
                <PlanPie pieData={pieData.value}>
                  <div class="content">
                    <div class="total-num"> {alarmTotal.value}</div>
                    <div> 设备总数</div>
                  </div>
                </PlanPie>
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="超温统计">
            <template>
              {" "}
              <DateInlineForm
                modelValue={transactionTime.value}
                onUpdate:modelValue={(v) => {
                  transactionTime.value = v;
                }}
                onSearch={changeTransactionTime}
              ></DateInlineForm>
            </template>
            <div class="flex-between">
              <PlanPie pieData={overTemperData.value}>
                <div class="content">
                  <div class="total-num"> {temperatureAlarmTotal.value}</div>
                  <div> 设备总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={overTemperData.value}></PieList>
            </div>
            <div class="barChart">
              {" "}
              <overviewChartBar bottom={"0%"} title={""} xData={barData.xData} yData={barData.yData}></overviewChartBar>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备报警">
            <template>
              {" "}
              <span class="more" onClick={handelClickDeviceNum}>
                {" "}
                查看更多{">>"}
              </span>
            </template>
            <RollTable style="height: 200px;" column={column} data={listData.value}>
              <template>
                {record.alarmStatus === "ALARM_UN_CONFIRMED" && <span style="color: #f14545"> 待处理</span>}
                {record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" ? <span style="color: #ffab10"> 处理中</span> : null}
                <span style="color: #00f27b"> 已处理</span>
              </template>
            </RollTable>
          </SubPanelTemplate>
        </div>
        <modal-alarm-table show-modal={alarmModalShow.value} onClose={closeModal} parameter={alarmParameter}></modal-alarm-table>
      </>
    );
  },
});

export default Right;
