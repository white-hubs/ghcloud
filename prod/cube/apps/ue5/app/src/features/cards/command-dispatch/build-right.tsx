import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { AlarmLevelType } from "@/infrastructure/api/models/alarm";
import bus from "@/infrastructure/utils/bus";
import AlarmStatisticsItem from "@/shared-ui/panel/alarmStatisticsItem";
import Pie3D from "@/shared-ui/panel/charts/pie/pie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import Pie from "@/shared-ui/panel/pie";
import TipsCount from "@/shared-ui/panel/tipsCount";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./build-right.module.less";

export const BuildRight = defineComponent({
  name: "BuildRight",
  setup(_props, ctx) {
    const fakeData = ref<AlarmLevelType[]>([
      {
        alarmNum: 0,
        name: "一级报警",
        chainRatio: 0,
        isGrow: false,
      },
    ]);
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
    const alarmCon = ref({
      count: 0,
      ratio: 10,
    });

    let pieData = reactive([]);
    let listData = reactive([]);
    let alarmsNumber = ref<number>(0);
    let timer: any = reactive(null);
    let falg = ref<number>(0);
    const { alarmLevel, getAlarmLevel, takeNotes, getAlarmTakeNotes, getAlarmsNumber } = useCommon();
    const { globalState } = useStateStore();

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
    // 报警级别
    async function changeAlarmLevel() {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: alarmLevel.value.dateRange.join(","),
        type: alarmLevel.value.timeType,
      };
      fakeData.value = await getAlarmLevel(param);
    }
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
      falg.value++;
    }
    function init() {
      changeAlarmLevel();
      changeTakeNotes();
    }
    const handelClickRow = (record) => {
      if (record.alarmTargetCode) {
        bus.emit("equipmentPosition", record);
      }
    };
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
          <SubPanelTemplate title="报警级别统计" class="alarm-level">
            <div class="herader">
              {" "}
              <DateInlineForm
                modelValue={alarmLevel}
                onUpdate:modelValue={(v) => {
                  alarmLevel.value = v;
                }}
                onSearch={changeAlarmLevel}
              ></DateInlineForm>
            </div>
            <div class="chart">
              {" "}
              <Pie3D data={fakeData.value} label-key="name" value-key="alarmNum" />
            </div>
            <div class="footer">
              {fakeData.map((item, index) => (
                <AlarmStatisticsItem
                  key={item.name}
                  level={index + 1}
                  alarmNum={item.alarmNum}
                  chainRatio={item.chainRatio}
                  name={item.name}
                  is-grow={item.isGrow}
                />
              ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警记录">
            <div class="header">
              {" "}
              <DateInlineForm
                modelValue={takeNotes}
                onUpdate:modelValue={(v) => {
                  takeNotes.value = v;
                }}
                onSearch={changeTakeNotes}
              ></DateInlineForm>
            </div>
            <div class="body">
              <OperateDays title="报警总数" value={alarmCon.value.count} class="body-num"></OperateDays>
              <div class="pie-chart">
                <Pie data={alarmsNumber.value} x-data={pieData} />
                {pieData.map((item, index) => (
                  <TipsCount status={String(index)} count={item.value} />
                ))}
              </div>
              <div class="footer">
                <RollTable key={falg.value} column={column} data={listData} onClickRow={handelClickRow}>
                  <template>
                    {record.alarmStatus === "ALARM_UN_CONFIRMED" && <span style="color: #f14545"> 待处理</span>}
                    {record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" ? <span style="color: #ffab10"> 处理中</span> : null}
                    <span style="color: #00f27b"> 已处理</span>
                  </template>
                </RollTable>
              </div>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default BuildRight;
