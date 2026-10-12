<!-- 门禁管理 -->
<template>
  <div class="panel">
    <SubPanelTemplate title="设备实时状态">
      <div class="equipmentAlarm">
        <RoundPie :eventNum="eventNum" :data="roundPieData.arr">
          <div class="content">
            <span>{{ eventNum }}</span> <br />设备总数
          </div>
        </RoundPie>
        <pieList @handelClickItemize="deviceAllModalShow=true" :roundPieData="roundPieData.arr"></pieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="异常事件top5" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="event" @search="alarmEventTop"></DateInlineForm>
      </template>
      <div class="body" style="min-height: 250px">
        <EventAlarmItem v-for="(item, index) in unusual.arr" :sort="1" :name="item.name" :linkRatio="item.ringRatio"
          :count="item.value" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="异常通行趋势" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="through" @search="abnormalPassageInfo"></DateInlineForm>
      </template>
      <OperateDays :value="numberPasses" title="异常通行次数"> </OperateDays>
      <div class="chart">
        <LineChart :x-data="ecahrtsData.xData" :series="[
            {
              data: ecahrtsData.yData,
              linearGradientColor: ['rgb(255, 162, 0.1)', 'rgb(255, 222, 165,1)'],
            },
          ]" />
      </div>
    </SubPanelTemplate>
    <modal-equipmentAll-table :show-modal="deviceAllModalShow" @close="deviceAllModalShow = false"
    :parameter="deviceAllParameter"></modal-equipmentAll-table>
  </div>
</template> 
<script lang="ts" setup>
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import RoundPie from "../public/charts/roundPie/roundPie.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import pieList from "../public/pieList.vue";
import EventAlarmItem from "../public/eventAlarmItem.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import changeBar from "../public/changeBar.vue";
import OperateDays from "../public/operateDays.vue";
import LineChart from "../public/lineChart.vue";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import {
  deviceStatus,
  alarmEvent,
  abnormalPassage,
} from "@/utils/requestData/accessControl";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { storeMenu } from "@/piniaStore/menu";
import { storeArea } from "@/piniaStore/area";

const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();

const roundPieData: any = reactive({
  arr: [],
});
let timer: any = reactive(null);
let event = ref();
let through = ref();
let numberPasses = ref(0);
const eventNum = ref<number>(0);
const unusual = reactive({
  arr: [],
});
const deviceAllModalShow = ref<boolean>(false);
  const deviceAllParameter = reactive({
  areaId:piniaStoreArea.currentAreaId,
  tagCodes:[`custom.app::visual.${piniaStoreMenu.currentMenu}`],
  filterAreaIds:[],
  deviceState:undefined,
  dateRange:[],
})
const ecahrtsData = reactive({
  xData: [],
  yData: [],
});
watch(
  () => piniaStoreArea.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
    init();
  }
);
// 设备实时状态
const deviceRealTimeStatus = async () => {
  let res: any = await deviceStatus();
  eventNum.value = res.total;
  roundPieData.arr = res.data;
};
// 报警事件top5
const alarmEventTop = async () => {
  const res = [
    {
      name:'TODAY',
      data:[
        {
          name:'异常闯入',
          value:20
        },
        {
          name:'权限错误',
          value:10
        },
        {
          name:'失效读卡',
          value:5
        },
        {
          name:'门禁无信号',
          value:0
        },
        {
          name:'故障报修',
          value:0
        },
      ]
    },
    {
      name:'THIS_WEEK',
      data:[
        {
          name:'异常闯入',
          value:70
        },
        {
          name:'权限错误',
          value:46
        },
        {
          name:'失效读卡',
          value:23
        },
        {
          name:'门禁无信号',
          value:1
        },
        {
          name:'故障报修',
          value:1
        },
      ]
    },
    {
      name:'THIS_MONTH',
      data:[
        {
          name:'异常闯入',
          value:120
        },
        {
          name:'权限错误',
          value:90
        },
        {
          name:'失效读卡',
          value:65
        },
        {
          name:'门禁无信号',
          value:2
        },
        {
          name:'故障报修',
          value:3
        },
      ]
    },
    {
      name:'THIS_YEAR',
      data:[
        {
          name:'异常闯入',
          value:723
        },
        {
          name:'权限错误',
          value:400
        },
        {
          name:'失效读卡',
          value:350
        },
        {
          name:'门禁无信号',
          value:20
        },
        {
          name:'故障报修',
          value:10
        },
      ]
    },
  ]
  unusual.arr = res.find(e=>e.name === event.value.timeType).data
};
// 异常通行趋势
const abnormalPassageInfo = async () => {
  const res = [
    {
      name:'TODAY',
      xdata:[
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24"
],
      series:[3, 15, 7, 12, 1, 19, 8, 6, 2, 14, 0, 17, 11, 4, 5, 13, 9, 18, 10, 16, 2, 7, 14, 3]
    },
    {
      name:'THIS_WEEK',
      xdata:[
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "1"
],
      series:[12, 29, 5, 37, 21, 3, 18, 34, 27, 10, 8, 15, 25, 2, 39, 11, 23, 32, 1, 16, 36, 14, 30, 19]

    },
    {
      name:'THIS_MONTH',
      xdata:[
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31"
],
      series:[56, 23, 78, 45, 12, 67, 89, 34, 2, 91, 15, 38, 49, 73, 27, 11, 60, 4, 82, 5, 99, 39, 31, 88]

    },
    {
      name:'THIS_YEAR',
      xdata:[
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12"
],
      series:[34, 145, 87, 12, 66, 178, 23, 91, 57, 4, 99, 150, 38, 76, 145, 65, 22, 3, 110, 200, 54, 79, 167, 88]
    },
  ]
  const data = res.find(e=>e.name === through.value.timeType)
  ecahrtsData.xData = data.xdata;
  ecahrtsData.yData = data.series
  numberPasses.value = 0;
  data.series.forEach((item) => {
    numberPasses.value += item;
  });
};
const init = () => {
  deviceRealTimeStatus();
};
onMounted(() => {
  alarmEventTop();
  abnormalPassageInfo();
  deviceRealTimeStatus();
  timer = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>
<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .content {
    font-size: 12px;
  }
}

.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;
}

.chart {
  height: 200px;
  display: flex;
}
</style>
