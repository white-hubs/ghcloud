import moment from "moment";
import { defineComponent } from "vue";
import { ref, onMounted } from "vue";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatisticsList } from "@/infrastructure/api/alarm";
import { equipmentNumber } from "@/infrastructure/utils/requestData/alarm";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const { getAlarmLevel } = useCommon();
    const column = [
      {
        title: "报警事件",
        dataIndex: "alarmEventName",
        width: 120,
      },
      {
        title: "报警时间",
        dataIndex: "alarmTime",
      },
      {
        title: "处理情况",
        dataIndex: "alarmStatus",
        slots: {
          customRender: "alarmStatus",
        },
        width: 140,
      },
    ];
    const alarmListData = ref([]);
    const alarmCon = ref({
      count: 0,
      ratio: 0,
    });
    const hiddenDangerTime = ref<ModelValueItf>();
    const alarmLevelTime = ref<ModelValueItf>();
    const deviceStatistic = ref([
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "处理中",
        color: "#FFC700",
      },
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "挂起",
        color: "#74AEE7",
      },
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "已处理",
        color: "#00F27B",
      },
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "待确认",
        color: "#29C2FF",
      },
    ]);
    const levelStatistic = ref([
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "一级",
        color: "#FFC700",
      },
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "二级",
        color: "#74AEE7",
      },
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "三级",
        color: "#00F27B",
      },
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "四级",
        color: "#29C2FF",
      },
    ]);
    const levelPieData = ref([]);
    const alarmTotal = ref(0);
    const levelAlarmTotal = ref(0);
    const monitorSituationPieData = ref([]);
    // 获取报警列表
    const getAlarmTakeNotes = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        type: "THIS_YEAR",
        period: [moment().startOf("year").format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(","),
        pageSize: 10,
        pageNumber: 1,
      };
      let res: any = await alarmStatisticsList(params);
      alarmListData.value = res.records.map((item) => {
        return {
          ...item,
          alarmTime: moment(item.alarmTime).format("YYYY-MM-DD"),
        };
      });
    };
    // 设备报警趋势
    const changeHandleHiddenDangerTime = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: hiddenDangerTime.value.dateRange.join(","),
        type: hiddenDangerTime.value.timeType,
      };
      let data: any = await equipmentNumber(param);
      deviceStatistic.value = data.alarmStatusStatistics;
      alarmCon.value.count = data.alarmNum;
      alarmCon.value.ratio = data.chainRatio;
      alarmTotal.value = data.alarmNum;
      monitorSituationPieData.value = data.alarmStatusStatistics.map((item) => {
        return {
          label: item.alarmStatusName,
          value: item.alarmNum,
          color: item.color,
        };
      });
    };
    // 报警级别
    const changeAlarmLevelTime = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: alarmLevelTime.value.dateRange.join(","),
        type: alarmLevelTime.value.timeType,
      };
      levelPieData.value.length = 0;
      levelAlarmTotal.value = 0;
      const res = await getAlarmLevel(param);
      res.forEach((item, index) => {
        levelAlarmTotal.value += item.alarmNum;
        levelStatistic.value[index].alarmNum = item.alarmNum;
        levelPieData.value.push({
          label: item.name,
          value: item.alarmNum,
          color: levelStatistic.value[index].color,
        });
      });
    };
    onMounted(() => {
      getAlarmTakeNotes();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="最新周界报警" class="alarm-event">
            <div class="footer">
              <RollTable column={column} data={alarmListData.value} limitScrollNum={4}>
                <template>
                  {record.alarmStatus === "ALARM_UN_CONFIRMED" && <span style="color: #f14545"> 待处理</span>}
                  {record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" ? <span style="color: #ffab10"> 处理中</span> : null}
                  <span style="color: #00f27b"> 已处理</span>
                </template>
              </RollTable>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警处理情况" class="alarm-event">
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
            <OperateDays title="报警数" value={alarmCon.value.count}>
              <div class="extra flex-start">
                <div class="mode"> 环比</div>
                <div class={["downtriangle", alarmCon.ratio > 0 && "uptriangle"]}></div>
                <div class={[alarmCon.ratio < 0 ? "down" : "up"]}>{alarmCon.ratio}%</div>
              </div>
            </OperateDays>
            <GridContainer data={deviceStatistic.value} class="body-bum"></GridContainer>
            <div class="flex-between mg-10">
              <PlanPie pieData={monitorSituationPieData.value}>
                <div class="content">
                  <div class="total-num"> {alarmTotal.value}</div>
                  <div> 报警总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={monitorSituationPieData.value}></PieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="周界防范报警级别" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={alarmLevelTime.value}
                onUpdate:modelValue={(v) => {
                  alarmLevelTime.value = v;
                }}
                onSearch={changeAlarmLevelTime}
              ></DateInlineForm>
            </template>
            <GridContainer data={levelStatistic.value}></GridContainer>
            <div class="flex-between mg-10">
              <PlanPie pieData={levelPieData.value}>
                <div class="content">
                  <div class="total-num"> {levelAlarmTotal.value}</div>
                  <div> 报警总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={levelPieData.value}></PieList>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;
