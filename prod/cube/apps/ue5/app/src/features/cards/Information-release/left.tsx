import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatisticsList } from "@/infrastructure/api/alarm";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import pieGuidance from "@/shared-ui/panel/charts/pie/pie-guidance";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import { ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    let takeNotes = ref<ModelValueItf>();

    const { getEquipmentNumber } = useCommon();
    let deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
    const yData = ref([
      { name: "在线", value: 5.6, itemStyle: { color: "#2F8DFF" } },
      { name: "离线", value: 1, itemStyle: { color: "#2AE8BD" } },
      { name: "关屏", value: 1, itemStyle: { color: "#ccc" } },
    ]);
    const listData = ref<{ label: string; value: number; color?: string }[]>([]);

    const product = reactive({
      column: [
        {
          title: "设备名称",
          dataIndex: "name",
        },
        {
          title: "离线时间",
          dataIndex: "offlineDuration",
        },
        {
          title: "离线时长",
          dataIndex: "offlineTime",
        },
      ],
      tableData: [
        {
          name: "门诊大厅屏01",
          offlineDuration: "6月16日 12:23",
          offlineTime: "1天2小时23分",
        },
        {
          name: "电梯屏01",
          offlineDuration: "6月15日 15:46",
          offlineTime: "2天1小时46分",
        },
        {
          name: "候诊屏04",
          offlineDuration: "6月1日5 13:13",
          offlineTime: "2天5小时13分",
        },
        {
          name: "门诊大厅屏01",
          offlineDuration: "6月16日 12:23",
          offlineTime: "1天2小时23分",
        },
      ],
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
    const monitorSituationPieData = ref<{ name: string; value: number; color: string }[]>([
      { name: "门诊大厅屏", value: 30000, color: "#FFAB10" },
      { name: "电梯屏", value: 2000, color: "#2F8DFF" },
      { name: "候诊排队屏", value: 748, color: "#F14545" },
      { name: "病房走廊屏", value: 6000, color: "#19F8F7" },
      { name: "诊间门口频", value: 6000, color: "#2AE8BD" },
    ]);

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
      listData.value = res.records.map((item) => {
        return {
          ...item,
          alarmTime: moment(item.alarmTime).format("YYYY-MM-DD"),
        };
      });
    }
    const getEquipmentInfo = async () => {
      monitorSituationPieData.value.length = 0;
      yData.value.length = 0;
      let res: any = await getEquipmentNumber();
      if (!res.deviceNum) {
        return;
      }
      res.deviceStatusNums.forEach((item, index) => {
        yData.value.push({
          name: deviceStatusType[item.name],
          value: item.num,
          itemStyle: { color: colorList[index] },
        });
      });
      res.deviceGenreNums.forEach((item, index) => {
        monitorSituationPieData.value.push({
          name: item.genreName,
          value: item.num,
          color: colorList[index],
        });
      });
    };
    onMounted(() => {
      getEquipmentInfo();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备状态总览">
            {" "}
            <div class="chart">
              {" "}
              <pieGuidance y-data={yData.value}></pieGuidance>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备分类统计">
            <div class="appointment-data">
              <PlanPie pieData={monitorSituationPieData.value}>
                {" "}
                <img src={getAssetsImage("business-icon/triage-queue-appointment.png")} />
              </PlanPie>
              <elevatorAnalysisList contentList={monitorSituationPieData.value} style="margin-left: 10px;"></elevatorAnalysisList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警记录" class="product-table">
            <template>
              {" "}
              <DateInlineForm
                modelValue={takeNotes.value}
                onUpdate:modelValue={(v) => {
                  takeNotes.value = v;
                }}
                onSearch={changeTakeNotes}
              ></DateInlineForm>
            </template>
            <div class="footer">
              <RollTable column={column} data={listData.value} limitScrollNum={4}>
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
