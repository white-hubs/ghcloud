import moment from "moment";
import { defineComponent } from "vue";
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatisticsList, statisticsStatus, statisticsDeviceTop } from "@/infrastructure/api/alarm";
import { AlarmAreaTop } from "@/infrastructure/api/models/alarm";
import { AlarmStatus } from "@/infrastructure/api/models/alarm";
import bus from "@/infrastructure/utils/bus";
import enumeratie from "@/infrastructure/utils/enumeratie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./electrical-floor-right.module.less";

export const ElectricalFloorRight = defineComponent({
  name: "ElectricalFloorRight",
  setup(_props, ctx) {
    interface AlarmHandlType {
      list: AlarmAreaTop[];
    }
    let timer = ref<any>(null);
    const { globalState } = useStateStore();
    let timeFrame = ref<ModelValueItf>();
    const colorList = ["#FFC700", "#74AEE7", "#00F27B", "#29C2FF"];
    let handleTime = ref<ModelValueItf>();
    const alarmRank = reactive<AlarmHandlType>({
      list: [],
    });
    const { alarmStatusOptions, alarmLeaveOptions } = enumeratie();
    const alarmCon = ref({
      count: 0,
      ratio: 10,
    });
    const powerRank = [
      {
        sort: 1,
        name: "空调设备",
        linkRatio: 1.02,
        count: 368,
        ratio: "54%",
      },
      {
        sort: 2,
        name: "照明设备",
        linkRatio: -1.25,
        count: 124,
        ratio: "44%",
      },
      {
        sort: 3,
        name: "摄像机",
        linkRatio: 2.52,
        count: 85,
        ratio: "29%",
      },
      {
        sort: 4,
        name: "制冷机",
        linkRatio: 1.34,
        count: 212,
        ratio: "24%",
      },
      {
        sort: 5,
        name: "送排风",
        linkRatio: 3.2,
        count: 184,
        ratio: "18%",
      },
    ];
    let alarmStatusData = ref<AlarmStatus[]>([]);

    const column = ref([
      {
        title: "报警时间",
        dataIndex: "alarmTime",
        width: 120,
      },
      {
        title: "报警级别",
        dataIndex: "alarmLevelCode",
        slots: {
          customRender: "alarmLevelCode",
        },
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
    watch(
      () => globalState.business.currentAreaId,
      () => {
        clearInterval(timer.value);
        timer.value = setInterval(
          () => {
            init();
          },
          (window as any).config.pageLoopRequestTime,
        );
        init();
      },
    );
    const data = ref([]);
    const statusStyle = computed(() => (key: string) => {
      let option = alarmStatusOptions.value.find((item) => {
        return item.value === key;
      });
      return option;
    });
    const leaveStyle = computed(() => (key: string) => {
      let option = alarmLeaveOptions.value.find((item) => {
        return item.value === key;
      });
      return option;
    });
    // 报警处理排名
    function changeHandleTime() {
      getAlarmHandlTop();
    }
    async function getAlarmHandlTop() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: handleTime.value.dateRange.join(","),
        type: handleTime.value.timeType,
      };
      alarmRank.list = await statisticsDeviceTop(params);
      // alarmRank.list =  mockStatisticsAreaTopFloor({'timeType': handleTime.value.timeType as TimeType});
    }
    // 电气报警
    function changeTimeFrame() {
      getAlarmList();
    }
    // 报警状态数量和报警列表
    async function getAlarmList() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeFrame.value.dateRange.join(","),
        type: timeFrame.value.timeType,
        pageSize: 50,
        pageNumber: 1,
      };
      let status = await statisticsStatus(params);
      let res: any = await alarmStatisticsList(params);
      alarmStatusData.value = status.alarmStatusStatistics.map((item, index) => {
        item.color = colorList[index];
        return item;
      });
      alarmCon.value = {
        count: status.alarmNum,
        ratio: status.chainRatio,
      };
      data.value = res.records.map((item) => {
        item.alarmTime = moment(item.alarmTime).format("YYYY-MM-DD");
        return item;
      });
    }
    const handelClickRow = (record) => {
      if (record.alarmTargetCode) {
        bus.emit("equipmentPosition", record);
      }
    };
    function init() {
      getAlarmList();
    }
    onMounted(() => {
      timer.value = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });
    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="报警设备top5">
            <div class="header">
              {" "}
              <DateInlineForm
                modelValue={handleTime.value}
                onUpdate:modelValue={(v) => {
                  handleTime.value = v;
                }}
                onSearch={changeHandleTime}
              ></DateInlineForm>
            </div>
            <div class="body" style="min-height: 250px">
              {alarmRank.list.map((item, index) => (
                <EventAlarmItem
                  key={item.id}
                  sort={index + 1}
                  name={item.name}
                  linkRatio={item.chainRatio}
                  count={item.alarmNum}
                  ratio={item.ratio + "%"}
                />
              ))}
            </div>
            <div class="body" style="min-height: 150px">
              {" "}
              <noData></noData>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="电气报警">
            <div class="header">
              {" "}
              <DateInlineForm
                modelValue={timeFrame.value}
                onUpdate:modelValue={(v) => {
                  timeFrame.value = v;
                }}
                onSearch={changeTimeFrame}
              />
            </div>
            <div class="body">
              <OperateDays title="报警数" value={alarmCon.value.count} class="body-bum alarm-num">
                <div class="extra flex-start">
                  <div class="mode"> 环比</div>
                  <div class={["downtriangle", alarmCon.ratio > 0 && "uptriangle"]}></div>
                  <div class={[alarmCon.ratio < 0 ? "down" : "up"]}>{alarmCon.ratio}%</div>
                </div>
              </OperateDays>
              <GridContainer data={alarmStatusData.value}></GridContainer>
              <RollTable column={column.value} data={data.value} class="roll-table" onClickRow={handelClickRow}>
                <template>
                  {" "}
                  <span style={{ color: statusStyle(record.alarmStatus).color }}> {statusStyle(record.alarmStatus).label}</span>
                </template>
                <template>
                  {" "}
                  <span style={{ color: leaveStyle(record.alarmLevelCode).color }}> {leaveStyle(record.alarmLevelCode).label}</span>
                </template>
              </RollTable>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default ElectricalFloorRight;
