<template>
  <div class="panel">
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
    <SubPanelTemplate title="报警事件top5">
    <template #extra>
      <DateInlineForm
        v-model:modelValue="eventInfo"
        @search="alarmEventTop"
      ></DateInlineForm>
    </template>
      <div class="body" v-show="alarmTop.arr.length > 0" style="min-height: 250px">
        <EventAlarmItem
          v-for="(item, index) in alarmTop.arr"
          :key="item.id"
          :sort="index + 1"
          :name="item.name"
          :count="item.alarmNum"
          :ratio="item.ratio + '%'"
        />
      </div>
      <div class="body" v-show="alarmTop.arr.length <= 0" style="min-height: 150px">
        <noData></noData>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备在线情况">
      <div class="charts">
        <stackedBarChart :x-data="barXData" :y-data="barYData"></stackedBarChart>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import OperateDays from "../public/operateDays.vue";
import stackedBarChart from '@/components/businessPanel/Information-release/stacked-bar-chart.vue'
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import { equipmentTotal } from '@/api/equipment'
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import EventAlarmItem from "../public/eventAlarmItem.vue";
import { ModelValueItf } from '../public/types'
import { statusNum } from '@/api/securitymanagement'
import useCommon from '@/components/hooks/useCommon'

const { getEventTop } = useCommon();
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const eventInfo = ref<ModelValueItf>();
const trend = ref<ModelValueItf>();
const barXData = ref<string[]>(['1号楼','2号楼','3号楼'])
const alarmTop = reactive({ arr: [] });
const barYData = ref<{name:string; data: number[]; color:string;}[]>([
{
    name:'正常',
    data:[1,2,3,4],
    color: '#2AE8BD'
    
  },  {
    name:'离线',
    data:[1,2,3,4],
    color: '#2989FF'
  },
])
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
const alarmTotal = ref(0)
const pieData = ref([]);
let alarmStatusData = reactive([]);
const alarmNum = ref<number>(0);
const chainRatio = ref<number>(0);
const xData = reactive({
  arr: ["1时", "2时", "3时", "4时", "5时"],
});
const series = reactive([
  {
    data: [0],
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);
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
    });
};
// 报警事件Top5
const alarmEventTop = async () => {
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: eventInfo.value.dateRange.join(","),
    type: eventInfo.value.timeType,
  };
  let res = await getEventTop(param);
  alarmTop.arr = res;
};
const getStatusNum = async () => {
  const res = await statusNum({applicationCode:'TRAFFIC_CONTROL'})
  barXData.value = res.areaStatusNum.map(item=>{
    return item.areaName
  })
  barYData.value[0].data = res.areaStatusNum.map(item=>{
    return item.onNum
  })
  barYData.value[1].data = res.areaStatusNum.map(item=>{
    return item.offlineNum
  })
}
onMounted(()=>{
  deviceDataInfo()
  getStatusNum()
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
.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;
}
.charts {
  height: 230px;
}
</style>