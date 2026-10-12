import moment from "moment";
import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsLevel, alarmStatisticsList, recordStatus } from "@/infrastructure/api/alarm";
import { AlarmLevelType } from "@/infrastructure/api/models/alarm";
import bus from "@/infrastructure/utils/bus";
import AlarmStatisticsItem from "@/shared-ui/panel/alarmStatisticsItem";
import Pie3D from "@/shared-ui/panel/charts/pie/pie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import Pie from "@/shared-ui/panel/pie";
import TipsCount from "@/shared-ui/panel/tipsCount";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    let timeFrame = ref<ModelValueItf>();
    let takeNotes = ref<ModelValueItf>();
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
    let pieData = reactive([]);
    let falg = ref<number>(0);
    let listData = reactive([]);
    let alarmsNumber = ref<number>(0);
    let timer: any = reactive(null);
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
    // 报警级别分布
    function changeTimeFrame() {
      getAlarmLevel();
    }
    // 报警记录
    function changeTakeNotes() {
      getAlarmTakeNotes();
    }
    // 获取报警列表
    async function getAlarmTakeNotes() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: takeNotes.value.dateRange.join(","),
        type: takeNotes.value.timeType,
        pageSize: 50,
        pageNumber: 1,
      };
      let res: any = await alarmStatisticsList(params);
      let data = await recordStatus(params);
      listData = res.records.map((item) => {
        return {
          ...item,
          alarmTime: moment(item.alarmTime).format("YYYY-MM-DD"),
        };
      });
      alarmsNumber.value = data.alarmNum;
      pieData = [
        {
          value: data.alarmUnresolvedHandlerNum,
          name: "未处理数",
        },
        {
          value: data.alarmTimeoutNum,
          name: "超时报警数",
        },
      ];
      falg.value++;
    }
    // 获取报警级别分布数据
    async function getAlarmLevel() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeFrame.value.dateRange.join(","),
        type: timeFrame.value.timeType,
      };
      let res = await statisticsLevel(params);
      fakeData.value = res.map((item) => {
        item.chainRatio <= 0 ? (item.isGrow = false) : (item.isGrow = true);
        item.name += "报警";
        return item;
      });
    }
    const handelClickRow = (record) => {
      if (record.alarmTargetCode) {
        bus.emit("equipmentPosition", record);
      }
    };
    function init() {
      getAlarmLevel();
      getAlarmTakeNotes();
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
          <SubPanelTemplate title="报警级别分布" class="alarm-level">
            <div class="header">
              {" "}
              <DateInlineForm
                modelValue={timeFrame.value}
                onUpdate:modelValue={(v) => {
                  timeFrame.value = v;
                }}
                onSearch={changeTimeFrame}
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
          <SubPanelTemplate title="报警记录" class="alarm-record">
            <div class="header">
              {" "}
              <DateInlineForm
                modelValue={takeNotes.value}
                onUpdate:modelValue={(v) => {
                  takeNotes.value = v;
                }}
                onSearch={changeTakeNotes}
              ></DateInlineForm>
            </div>
            <div class="chart">
              <Pie data={alarmsNumber.value} x-data={pieData} />
              {pieData.map((item, index) => (
                <TipsCount status={String(index)} count={item.value} />
              ))}
            </div>
            <div class="footer">
              <RollTable key={falg.value} column={column} data={listData} onClickRow={handelClickRow} limitScrollNum={4}>
                <template>
                  {record.alarmStatus === "ALARM_UN_CONFIRMED" && <span style="color: #f14545"> 待处理</span>}
                  {record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" ? <span style="color: #ffab10"> 处理中</span> : null}
                  <span style="color: #00f27b"> 已处理</span>
                </template>
              </RollTable>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
