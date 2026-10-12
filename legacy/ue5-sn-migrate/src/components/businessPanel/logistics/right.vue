<template>
  <div class="panel">
    <SubPanelTemplate title="设备类型分布">
      <div class="flex-between">
        <PlanPie :pieData="roundPieData">
          <div class="content">
            <div class="total-num">{{ alarmTotal }}</div>
            <div>设备总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="roundPieData"></PieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警记录">
      <template #extra>
        <DateInlineForm v-model:modelValue="takeNotes" @search="changeTakeNotes"></DateInlineForm>
      </template>
      <div class="body">
        <OperateDays title="报警总数" :value="alarmCon.count" class="body-num"></OperateDays>
        <div class="pie-chart">
          <Pie :data="alarmsNumber" :x-data="pieData" />
          <TipsCount v-for="(item, index) in pieData" :status="String(index)" :count="item.value" />
        </div>
        <div class="footer">
          <RollTable :column="column" :data="listData">
            <template #alarmStatus="{ record }">
              <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
              <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
              <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
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
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import PieList from "../public/pieList.vue";
import OperateDays from "../public/operateDays.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import Pie3D from "../public/charts/pie/pie.vue";
import Pie from "../public/pie.vue";
import waterPolo from "../public/charts/waterPolo/waterPolo.vue";
import TipsCount from "../public/tipsCount.vue";
import RollTable from "../public/rollTable/index.vue";
import { storeArea } from "@/piniaStore/area";
import DateInlineForm from "../public/dateInlineForm.vue";
import { storeMenu } from "@/piniaStore/menu";
import { equipmentTotal } from '@/api/equipment'
import deviceModule from "../public/deviceModule.vue";
import useCommon from '@/components/hooks/useCommon'
import { AlarmRateList } from '../public/types'

const {
  alarmLevel,
  getEquipmentNumber,
  takeNotes,
  getAlarmTakeNotes,
  getAlarmsNumber,
} = useCommon();
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
const colorList = [
  "#2F8DFF",
  "#D0DEEE",
  "#FFAB10",
  "#F14545",
]
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
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const roundPieData = ref([])
const alarmTotal = ref(0)

// 设备实时数据
const deviceDataInfo = async () => {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
  }
    let res: any = await equipmentTotal(params);
    if (!res.deviceNum) {
        return;
    }
    roundPieData.value.length = 0
    alarmTotal.value = 0;
    res.deviceGenreNums.forEach((item, index) => {
      alarmTotal.value+=item.num
    let obj = {
        label: `${item.genreName}(${
        Math.round((item.num / res.deviceNum) * 10000) / 100.0
      }%)`,
      color: colorList[index],
      value: item.num,
    };
    roundPieData.value.push(obj);
  });
};
// 报警记录
async function changeTakeNotes() {
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: takeNotes.value.dateRange.join(","),
    type: takeNotes.value.timeType,
    pageSize: 1000,
    pageNumber: 1,
  };
  let data = await getAlarmTakeNotes(param);
  alarmCon.value = await getAlarmsNumber(param);
   Object.assign(listData,data.listData)
  alarmsNumber.value = data.alarmsNumber;
   Object.assign(pieData,data.pieData)
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
  deviceDataInfo()
  equipmentStatistic()
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
  height: 250px;
}
:deep(.policeList){
  height: auto;
}
.equipmentInfo {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px 0 20px;
  align-items: center;
  height: 200px;
}

</style>