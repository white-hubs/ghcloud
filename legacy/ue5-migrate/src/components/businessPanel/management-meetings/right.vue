<template>
  <div >
    <SubPanelTemplate title="设备状态分布">
      <div class="flex-between">
        <PlanPie :pieData="pieData">
          <div class="content">
            <div class="total-num">{{ alarmTotal }}</div>
            <div>设备总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="pieData"></PieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备离线率" class="alarm-event">
      <div class="equipmentInfo">
        <waterPolo
          title=""
          :value="faultRate"
          unit="%"
          bgColor="#FFC700"
          color="#FFC700"
        ></waterPolo>
        <deviceModule :data-list="dataList"></deviceModule>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警记录">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="takeNotes"
          @search="changeTakeNotes"
        ></DateInlineForm>
      </template>
      <div class="body">
        <OperateDays
          title="报警总数"
          :value="alarmCon.count"
          class="body-num"
        ></OperateDays>
        <div class="pie-chart">
          <Pie :data="alarmsNumber" :x-data="pieDataAlarm" />
          <TipsCount
            v-for="(item) in pieDataAlarm"
            :status="String(item.i)"
            :count="item.value"
          />
        </div>
        <div class="footer">
          <RollTable
            :column="column"
            :data="listData"
            @click-row="handelClickRow"
          >
            <template #alarmStatus="{ record }">
              <span
                v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'"
                style="color: #f14545"
                >待处理</span
              >
              <span
                v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'"
                style="color: #ffab10"
                >处理中</span
              >
              <span
                v-else="record.alarmStatus === 'ALARM_CONFIRMED'"
                style="color: #00f27b"
                >已处理</span
              >
            </template>
          </RollTable>
        </div>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import { equipmentTotal } from '@/api/equipment'
import { AlarmRateList } from '../public/types'
import waterPolo from "../public/charts/waterPolo/waterPolo.vue";
import deviceModule from "../public/deviceModule.vue";
import useCommon from '@/components/hooks/useCommon'
import OperateDays from "../public/operateDays.vue";
import Pie from "../public/pie.vue";
import TipsCount from "../public/tipsCount.vue";
import RollTable from "../public/rollTable/index.vue";
import bus from '@/utils/bus'
import { useStateStore } from '@/pages/state/use-state-store';

const { globalState } = useStateStore()
const alarmTotal = ref(0)
const pieData = ref([]);
const faultRate = ref<number>(0);
const {
  takeNotes,
  getAlarmTakeNotes,
  getAlarmsNumber,
} = useCommon();
const deviceStatusType = {
    ALARM: "报警",
    TROUBLE: "故障",
    OFFLINE: "离线",
    NORMAL: "正常",
}
const colorList = [
  "#2F8DFF",
  "#D0DEEE",
  "#FFAB10",
  "#F14545",
]
let listData = reactive([]);
let alarmsNumber = ref<number>(0);
let pieDataAlarm = ref([]);
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
// 设备实时数据
const deviceDataInfo = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
  }
    let res: any = await equipmentTotal(params);
    if (!res.deviceNum) {
        return;
    }
    pieData.value.length = 0
    alarmTotal.value = 0;
    res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
            label: deviceStatusType[item.name],
            color: colorList[index],
            value: item.num,
        };
        pieData.value.push(obj);
        if (item.name === "OFFLINE" && res.deviceNum !== 0) {
          faultRate.value = Math.round((item.num / res.deviceNum) * 10000) / 100.0;
          dataList[0].value = res.deviceNum;
          dataList[1].value = item.num;
          dataList[1].label = faultRate.value;
        }
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
  Object.assign(listData,data.listData)
  alarmsNumber.value = data.alarmsNumber;
  pieDataAlarm.value = data.pieData.map(item=>{
    return {
      ...item,
      i:item.name === '未处理数' ? 0 : 2
    }
  })
}
const handelClickRow = (record) => {
  if (record.alarmTargetCode) {
    bus.emit("equipmentPosition", record);
  }
};
onMounted(()=>{
  deviceDataInfo()
})
</script>
<style lang="less" scoped>
.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
}
.equipmentInfo {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px 0 20px;
}
.pie-chart {
  display: flex;
  height: 100px;
  justify-content: center;

  > div {
    width: 100px;
    align-items: center;
    margin-left: 10px;
  }
}
.footer{
  height: 200px;
}
</style>