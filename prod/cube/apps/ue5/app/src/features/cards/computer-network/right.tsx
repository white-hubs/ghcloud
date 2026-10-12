import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import waterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import deviceModule from "@/shared-ui/panel/deviceModule";
import Pie from "@/shared-ui/panel/pie";
import PieList from "@/shared-ui/panel/pieList";
import TipsCount from "@/shared-ui/panel/tipsCount";
import { AlarmRateList, ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const alarmLevelTime = ref<ModelValueItf>();
    const { globalState } = useStateStore();

    const levelPieData = ref([]);
    const levelAlarmTotal = ref(0);
    const { getAlarmLevel, takeNotes, getAlarmTakeNotes, getAlarmsNumber, getEquipmentNumber } = useCommon();
    const column = reactive([
      {
        title: "报警时间",
        dataIndex: "alarmTime",
        width: 120,
      },
      {
        title: "报警级别",
        dataIndex: "alarmLevelName",
      },
      {
        title: "报警事件",
        dataIndex: "alarmEventName",
      },
      {
        title: "状态",
        dataIndex: "alarmStatus",
        slots: {
          customRender: "alarmStatus",
        },
      },
    ]);
    const dataList = reactive<AlarmRateList[]>([
      {
        title: "设备总数",
        value: 0,
        ringRatio: false,
      },
      {
        title: "离线总数",
        value: 0,
        ringRatio: true,
        label: 0,
        unit: "%",
      },
    ]);
    const faultRate = ref<number>(0);
    const alarmCon = ref({
      count: 0,
      ratio: 10,
    });
    let listData = reactive([]);
    let alarmsNumber = ref<number>(0);
    let pieData = reactive([]);

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
    // 报警记录
    async function changeTakeNotes() {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: takeNotes.value.dateRange.join(","),
        type: takeNotes.value.timeType,
        pageSize: 1000,
        pageNumber: 1,
      };
      let data = await getAlarmTakeNotes(param);
      alarmCon.value = await getAlarmsNumber(param);
      listData = data.listData;
      alarmsNumber.value = data.alarmsNumber;
      pieData = data.pieData;
    }
    /**
     * 设备类型分布
     */
    const equipmentStatistic = async () => {
      const res = await getEquipmentNumber();
      if (JSON.stringify(res) === "{}") {
        return;
      }
      res.deviceStatusNums.forEach((item) => {
        if (item.name === "OFFLINE" && res.deviceNum !== 0) {
          faultRate.value = Math.round((item.num / res.deviceNum) * 10000) / 100.0;
          dataList[0].value = res.deviceNum;
          dataList[1].value = item.num;
          dataList[1].label = faultRate.value;
        }
      });
    };
    onMounted(() => {
      equipmentStatistic();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备报警级别" class="alarm-event">
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
          <SubPanelTemplate title="报警记录">
            <template>
              {" "}
              <DateInlineForm
                modelValue={takeNotes}
                onUpdate:modelValue={(v) => {
                  takeNotes.value = v;
                }}
                onSearch={changeTakeNotes}
              ></DateInlineForm>
            </template>
            <div class="body">
              <OperateDays title="报警总数" value={alarmCon.value.count} class="body-num"></OperateDays>
              <div class="pie-chart">
                <Pie data={alarmsNumber.value} x-data={pieData} />
                {pieData.map((item, index) => (
                  <TipsCount status={String(index)} count={item.value} />
                ))}
              </div>
              <div class="footer">
                <RollTable column={column} data={listData}>
                  <template>
                    {record.alarmStatus === "ALARM_UN_CONFIRMED" && <span style="color: #f14545"> 待处理</span>}
                    {record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" ? <span style="color: #ffab10"> 处理中</span> : null}
                    <span style="color: #00f27b"> 已处理</span>
                  </template>
                </RollTable>
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备离线率" class="alarm-event">
            <div class="equipmentInfo">
              <waterPolo title value={faultRate.value} unit="%" bgColor="#FFC700" color="#FFC700"></waterPolo>
              <deviceModule data-list={dataList}></deviceModule>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;
