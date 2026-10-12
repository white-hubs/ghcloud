import { defineComponent } from "vue";
import { ref, reactive } from "vue";

import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import Pie from "@/shared-ui/panel/pie";
import TipsCount from "@/shared-ui/panel/tipsCount";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./logistics-alarm-records.module.less";

export const LogisticsAlarmRecords = defineComponent({
  name: "LogisticsAlarmRecords",
  setup(_props, ctx) {
    const { takeNotes, getAlarmTakeNotes, getAlarmsNumber } = useCommon();
    const { globalState } = useStateStore();

    const alarmCon = ref({
      count: 0,
      ratio: 10,
    });
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
    const pieData = reactive<any[]>([]);
    const listData = reactive([]);
    const alarmsNumber = ref<number>(0);

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
      Object.assign(listData, data.listData);
      alarmsNumber.value = data.alarmsNumber;
      Object.assign(pieData, data.pieData);
    }

    return (): JSX.Element => (
      <>
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
                <TipsCount status={String(index)} count={item.value} key={index} />
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
      </>
    );
  },
});

export default LogisticsAlarmRecords;
