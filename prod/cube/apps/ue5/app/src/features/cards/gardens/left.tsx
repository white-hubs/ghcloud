import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import stackedBarChart from "@/features/cards/Information-release/stacked-bar-chart";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { equipmentTotal } from "@/infrastructure/api/equipment";
import { statusNum } from "@/infrastructure/api/securitymanagement";
import bus from "@/infrastructure/utils/bus";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import Pie from "@/shared-ui/panel/pie";
import PieList from "@/shared-ui/panel/pieList";
import TipsCount from "@/shared-ui/panel/tipsCount";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    const { takeNotes, getAlarmTakeNotes, getAlarmsNumber } = useCommon();
    const barXData = ref<string[]>(["1号楼", "2号楼", "3号楼"]);
    const barYData = ref<{ name: string; data: number[]; color: string }[]>([
      {
        name: "正常",
        data: [],
        color: "#2AE8BD",
      },
      {
        name: "离线",
        data: [],
        color: "#2989FF",
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
    const alarmTotal = ref(0);
    const pieData = ref([]);
    const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const colorList = ["#2F8DFF", "#D0DEEE", "#FFAB10", "#F14545"];
    const alarmCon = ref({
      count: 0,
      ratio: 10,
    });
    let listData = reactive([]);
    let alarmsNumber = ref<number>(0);
    let pieDataAlarm = reactive([]);
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
      pieData.value.length = 0;
      alarmTotal.value = 0;
      res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
          label: deviceStatusType[item.name],
          color: colorList[index],
          value: item.num,
        };
        pieData.value.push(obj);
      });
    };
    const handelClickRow = (record) => {
      if (record.alarmTargetCode) {
        bus.emit("equipmentPosition", record);
      }
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
      pieDataAlarm = data.pieData;
    }
    const getStatusNum = async () => {
      const res = await statusNum({ applicationCode: "GARDENS" });
      barXData.value = res.areaStatusNum.map((item) => {
        return item.areaName;
      });
      barYData.value[0].data = res.areaStatusNum.map((item) => {
        return item.onNum;
      });
      barYData.value[1].data = res.areaStatusNum.map((item) => {
        return item.offlineNum;
      });
    };
    onMounted(() => {
      deviceDataInfo();
      getStatusNum();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="园林设备状态分布">
            <div class="flex-between">
              <PlanPie pieData={pieData.value}>
                <div class="content">
                  <div class="total-num"> {alarmTotal.value}</div>
                  <div> 设备总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={pieData.value}></PieList>
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
                <Pie data={alarmsNumber.value} x-data={pieDataAlarm} />
                {pieDataAlarm.map((item, index) => (
                  <TipsCount status={String(index)} count={item.value} />
                ))}
              </div>
              <div class="footer">
                <RollTable column={column} data={listData} onClickRow={handelClickRow}>
                  <template>
                    {record.alarmStatus === "ALARM_UN_CONFIRMED" && <span style="color: #f14545"> 待处理</span>}
                    {record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" ? <span style="color: #ffab10"> 处理中</span> : null}
                    <span style="color: #00f27b"> 已处理</span>
                  </template>
                </RollTable>
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备在线情况">
            {" "}
            <div class="charts">
              {" "}
              <stackedBarChart x-data={barXData.value} y-data={barYData.value}></stackedBarChart>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
