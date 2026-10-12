import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { emergencyDevicePage, emergencyDeviceStat, emergencyFacilityStat, emergencyUserStats } from "@/infrastructure/api/emergency";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import waterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import deviceModule from "@/shared-ui/panel/deviceModule";
import pieList from "@/shared-ui/panel/pieList";
import { AlarmRateList, ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const roundPieData = ref([
      {
        value: 0,
        label: "已使用",
        color: "rgba(3, 182, 21, 1)",
      },
      {
        value: 0,
        label: "未使用",
        color: "rgba(245, 154, 35, 1)",
      },
    ]);
    const roundPieData1 = ref([]);
    const devicesNum = ref(0);
    const deviceTotal = ref(0);
    const column = reactive([
      {
        title: "设备名称",
        dataIndex: "name",
        width: 120,
      },
      {
        title: "已使用",
        dataIndex: "deviceUsedNum",
      },
      {
        title: "未使用",
        dataIndex: "notUsedValue",
      },
    ]);
    const listData = ref([
      {
        alarmTime: "111",
        alarmLevelName: "222",
        alarmEventName: "333",
      },
      {
        alarmTime: "111",
        alarmLevelName: "222",
        alarmEventName: "333",
      },
      {
        alarmTime: "111",
        alarmLevelName: "222",
        alarmEventName: "333",
      },
    ]);
    const alarmRateData = reactive({
      proportion: 0,
      deviceTotal: "",
      alarmNum: "",
      chainRatio: "",
    });
    const dataList = reactive<AlarmRateList[]>([
      {
        title: "总数",
        value: 0,
        ringRatio: false,
      },
      {
        title: "已使用",
        value: 0,
        ringRatio: false,
        label: 0,
      },
    ]);
    const colorList = ["#2F8DFF", "#D0DEEE", "#FFAB10", "#F14545"];
    const getAlarmLevel = async () => {
      const res = await emergencyUserStats();
      roundPieData1.value = res.map((item, index) => {
        return {
          value: item.value,
          label: item.name,
          color: colorList[index],
        };
      });
    };

    const emergencyFacilityEvent = async () => {
      const res = await emergencyDeviceStat();
      const data = await emergencyDevicePage();
      roundPieData.value[0].value = res.usedValue;
      roundPieData.value[1].value = res.notUsedValue;
      deviceTotal.value = res.total;
      listData.value = data.records.map((item) => {
        return {
          ...item,
          notUsedValue: item.deviceNum - item.deviceUsedNum,
        };
      });
    };
    const emergencyFacilities = async () => {
      const res = await emergencyFacilityStat();
      dataList[0].value = res.total;
      dataList[1].value = res.usedValue;
      alarmRateData.proportion = res.total ? (res.usedValue / res.total) * 100 : 0;
    };
    onMounted(() => {
      emergencyFacilityEvent();
      emergencyFacilities();
      getAlarmLevel();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="应急人员统计">
            <div class="equipmentAlarm">
              <RoundPie data={roundPieData1.value} eventNum={devicesNum.value}></RoundPie>
              <pieList roundPieData={roundPieData1.value}></pieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="应急设备统计">
            <div class="equipmentAlarm">
              <PlanPie pieData={roundPieData.value}>
                <div class="content">
                  <div class="total-num"> {deviceTotal.value}</div>
                  <div> 设备总数</div>
                </div>
              </PlanPie>
              <pieList roundPieData={roundPieData.value}></pieList>
            </div>
            <div class="footer">
              {" "}
              <RollTable column={column} data={listData.value}></RollTable>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="应急设施使用率" class="alarm-event">
            <div class="equipmentInfo">
              <waterPolo title value={alarmRateData.proportion} unit="%" bgColor="#2989FF" color="#2989FF"></waterPolo>
              <deviceModule data-list={dataList}></deviceModule>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;
