import moment from "moment";
import { defineComponent } from "vue";
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsDeviceTop, statisticsStatus, alarmStatisticsList } from "@/infrastructure/api/alarm";
import { AlarmAreaTop, AlarmStatus } from "@/infrastructure/api/models/alarm";
import bus from "@/infrastructure/utils/bus";
import enumeratie from "@/infrastructure/utils/enumeratie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./electrical-build-right.module.less";

export const ElectricalBuildRight = defineComponent({
  name: "ElectricalBuildRight",
  setup(_props, ctx) {
    interface AlarmHandlType {
      list: AlarmAreaTop[];
    }
    const { alarmStatusOptions, alarmLeaveOptions } = enumeratie();
    let handleTime = ref<ModelValueItf>();
    const { globalState } = useStateStore();
    const alarmRank = reactive<AlarmHandlType>({
      list: [],
    });
    let timer: any = reactive(null);
    let timeFrame = ref<ModelValueItf>();
    let alarmStatusData = ref<AlarmStatus[]>([]);
    const colorList = ["#FFC700", "#74AEE7", "#00F27B", "#29C2FF"];
    const alarmCon = ref({
      count: 0,
      ratio: 10,
    });
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
    const data = ref([]);
    watch(
      () => globalState.business.currentAreaId,
      () => {
        clearInterval(timer);
        timer = setInterval(
          () => {
            init();
          },
          (window as any).config.pageLoopRequestTime,
        );
        init();
      },
    );
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
      getAlarmHandlTop();
    }
    onMounted(() => {
      timer = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
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
              <RollTable column={column.value} data={data.value} class="roll-table" onClickRow={handelClickRow} limitScrollNum={7}>
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

export default ElectricalBuildRight;
