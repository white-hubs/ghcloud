<template>
  <div >
    <SubPanelTemplate title="设备报警级别" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmLevelTime" @search="changeAlarmLevelTime"></DateInlineForm>
      </template>
      <GridContainer :data="levelStatistic"></GridContainer>
      <div class="flex-between mg-10">
        <PlanPie :pieData="levelPieData">
          <div class="content">
            <div class="total-num">{{ levelAlarmTotal }}</div>
            <div>报警总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="levelPieData"></PieList>
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
          <Pie :data="alarmsNumber" :x-data="pieData" />
          <TipsCount
            v-for="(item, index) in pieData"
            :status="String(index)"
            :count="item.value"
          />
        </div>
        <div class="footer">
          <RollTable
            :column="column"
            :data="listData"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import deviceModule from "../public/deviceModule.vue";
import TipsCount from "../public/tipsCount.vue";
import Pie from "../public/pie.vue";
import waterPolo from "../public/charts/waterPolo/waterPolo.vue";
import PieList from "../public/pieList.vue";
import RollTable from "../public/rollTable/index.vue";
import GridContainer from "../public/gridContainer.vue";
import OperateDays from "../public/operateDays.vue";
import { AlarmRateList, ModelValueItf } from '../public/types'
import useCommon from '@/components/hooks/useCommon'
import { useStateStore } from '@/pages/state/use-state-store';
const alarmLevelTime = ref<ModelValueItf>()
const { globalState } = useStateStore();

const levelPieData = ref([])
const levelAlarmTotal = ref(0)
const {
  getAlarmLevel,
  takeNotes,
  getAlarmTakeNotes,
  getAlarmsNumber,
  getEquipmentNumber
} = useCommon();
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
const faultRate = ref<number>(0);
const alarmCon = ref({
  count: 0,
  ratio: 10,
});
let listData = reactive([]);
let alarmsNumber = ref<number>(0);
let pieData = reactive([]);

const levelStatistic = ref([
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '一级',
    color: '#FFC700'
  },
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '二级',
    color: '#74AEE7'
  },
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '三级',
    color: '#00F27B'
  },
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '四级',
    color: '#29C2FF'
  },
]);
// 报警级别
const changeAlarmLevelTime =async ()=>{
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: alarmLevelTime.value.dateRange.join(","),
    type: alarmLevelTime.value.timeType,
  };
levelPieData.value.length = 0
levelAlarmTotal.value = 0
 const res = await getAlarmLevel(param);
 res.forEach((item,index)=>{
  levelAlarmTotal.value+=item.alarmNum
  levelStatistic.value[index].alarmNum = item.alarmNum
  levelPieData.value.push({
    label:item.name,
    value:item.alarmNum,
    color:levelStatistic.value[index].color
  })
 })
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
onMounted(()=>{
  equipmentStatistic();
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
.mg-10{
  margin-top: 10px;
}
.footer{
  max-height: 200px;
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
</style>