import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { equipmentTotal } from "@/infrastructure/api/equipment";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import waterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import deviceModule from "@/shared-ui/panel/deviceModule";
import Pie from "@/shared-ui/panel/pie";
import PieList from "@/shared-ui/panel/pieList";
import TipsCount from "@/shared-ui/panel/tipsCount";
import { AlarmRateList } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const { alarmLevel, getEquipmentNumber, takeNotes, getAlarmTakeNotes, getAlarmsNumber } = useCommon();
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
    const colorList = ["#2F8DFF", "#D0DEEE", "#FFAB10", "#F14545"];
    const alarmCon = ref({
      count: 0,
      ratio: 10,
    });
    const faultRate = ref<number>(0);
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
    const pieData = reactive([]);
    const listData = reactive([]);
    const alarmsNumber = ref<number>(0);
    const { globalState } = useStateStore();
    const roundPieData = ref([]);
    const alarmTotal = ref(0);

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
      roundPieData.value.length = 0;
      alarmTotal.value = 0;
      res.deviceGenreNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
          label: `${item.genreName}(${Math.round((item.num / res.deviceNum) * 10000) / 100.0}%)`,
          color: colorList[index],
          value: item.num,
        };
        roundPieData.value.push(obj);
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
      Object.assign(listData, data.listData);
      alarmsNumber.value = data.alarmsNumber;
      Object.assign(pieData, data.pieData);
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
      deviceDataInfo();
      equipmentStatistic();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备类型分布">
            <div class="flex-between">
              <PlanPie pieData={roundPieData.value}>
                <div class="content">
                  <div class="total-num"> {alarmTotal.value}</div>
                  <div> 设备总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={roundPieData.value}></PieList>
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
