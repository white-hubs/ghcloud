<!-- 门禁管理 -->
<template>
  <div>
    <SubPanelTemplate title="设备利用率">
      <div class="equipmentAlarm">
        <RoundPie :eventNum="eventNum" :data="roundPieData.arr">
          <div class="content">
            <span>{{ eventNum }}</span> <br />总数
          </div>
        </RoundPie>
        <pieList @handelClickItemize="deviceAllModalShow=true" :roundPieData="roundPieData.arr"></pieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="资产利用率统计分析" class="visiting-data">
      <div class="item" v-for="item in visitingData" :key="item.title">
        <a-statistic :title="item.title">
          <template #formatter>
            <count-to :startVal="0" :endVal="item.value" :duration="2000" separator=""></count-to>
            <div class="ringRatio">
              <span style="white-space: nowrap;">环比</span>
              <!-- uptriangle 向上三角根据Prop改变 -->
              <div :class="['downtriangle', item.ratio > 0 && 'uptriangle']"></div>
              <div :class="[item.ratio > 0 ? 'up' : 'down']">{{ item.ratio + "%" }}</div>
            </div>
          </template>
        </a-statistic>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="区域占用率统计" class="alarm-event">
      <template #extra>
        <div>
          <DateInlineForm v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame">
          </DateInlineForm>
        </div>
      </template>
      <div class="line-chart">
        <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles"
          gridTop="15" :unit="{ x: '', y: '' }" :axisPointer="true" />
      </div>
    </SubPanelTemplate>
    <modal-equipmentAll-table :show-modal="deviceAllModalShow" @close="deviceAllModalShow = false"
      :parameter="deviceAllParameter"></modal-equipmentAll-table>
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "../../../public/subPanelTemplate.vue";
import RoundPie from "../../../public/charts/roundPie/roundPie.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import pieList from "../../../public/pieList.vue";
import LineChart from "../../../public/lineChart.vue";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { ModelValueItf } from "../../../public/types";
import { useStateStore } from "@/pages/state/use-state-store";

const topTimeFrame = ref<ModelValueItf>();
const { globalState } = useStateStore()
const visitingData = ref([
    { title: "整体利用率统计", value: 7800, ratio: 12.3 },   
    { title: "租赁利用率统计", value: 4500, ratio: 50.0 },   
    { title: "销售利用率", value: 1500, ratio: -5.0 },      
    { title: "区域利用率统计", value: 800, ratio: 8.7 },    
]);
const roundPieData: any = reactive({
  arr: [],
});
let timer: any = reactive(null);
const eventNum = ref<number>(0);
const titles = ref<string[]>(['住宅区','商业区','办公区','工业区'])
const xData = ref<string[]>(['周一','周二','周三','周四','周五','周六','周日'])
const yData = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([
  {
    name: '住宅区',
    data: [10, 20, 30, 10,20,40,60],
    showSymbol: false,
    smooth: true,
  },{
    name: '商业区',
    data: [20, 25, 35, 40,30,36,55],
    showSymbol: false,
    smooth: true,
  },{
    name: '办公区',
    data: [25, 28, 39, 42,24,69,50],
    showSymbol: false,
    smooth: true,
  },
  {
    name: '工业区',
    data: [30, 40, 20, 18,18,28,80],
    showSymbol: false,
    smooth: true,
  }
])
const deviceAllModalShow = ref<boolean>(false);
  const deviceAllParameter = reactive({
  areaId:globalState.business.currentAreaId,
  tagCodes:[`custom.app::visual.${globalState.business.currentMenu}`],
  filterAreaIds:[],
  deviceState:undefined,
  dateRange:[],
})
watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
    init();
  }
);
const changeTopTimeFrame = ()=>{
}
// 设备实时状态
const deviceRealTimeStatus = async () => {
  // let res: any = await deviceStatus();
  // eventNum.value = res.total;
  roundPieData.arr = [
    {
      name:'合理',
      value:10,
      color:"#328BF7",
    },
    {
      name:'浪费',
      value:30,
      color:"#FFC700",
    },
  ]
};
// 报警事件top5
// const alarmEventTop = async () => {
//   const res = [
//     {
//       name:'TODAY',
//       data:[
//         {
//           name:'异常闯入',
//           value:20
//         },
//         {
//           name:'权限错误',
//           value:10
//         },
//         {
//           name:'失效读卡',
//           value:5
//         },
//       ]
//     },
//     {
//       name:'THIS_WEEK',
//       data:[
//         {
//           name:'异常闯入',
//           value:70
//         },
//         {
//           name:'权限错误',
//           value:46
//         },
//         {
//           name:'失效读卡',
//           value:23
//         },
//         {
//           name:'门禁无信号',
//           value:1
//         },
//         {
//           name:'故障报修',
//           value:1
//         },
//       ]
//     },
//     {
//       name:'THIS_MONTH',
//       data:[
//         {
//           name:'异常闯入',
//           value:120
//         },
//         {
//           name:'权限错误',
//           value:90
//         },
//         {
//           name:'失效读卡',
//           value:65
//         },
//         {
//           name:'门禁无信号',
//           value:2
//         },
//         {
//           name:'故障报修',
//           value:3
//         },
//       ]
//     },
//     {
//       name:'THIS_YEAR',
//       data:[
//         {
//           name:'异常闯入',
//           value:723
//         },
//         {
//           name:'权限错误',
//           value:400
//         },
//         {
//           name:'失效读卡',
//           value:350
//         },
//         {
//           name:'失效读卡',
//           value:350
//         },
//       ]
//     },
//   ]
//   unusual.arr = res.find(e=>e.name === event.value.timeType).data
// };
// // 异常通行趋势
// const abnormalPassageInfo = async () => {
//   const res = [
//     {
//       name:'TODAY',
//       xdata:[
//   "1",
//   "2",
//   "3",
//   "4",
//   "5",
//   "6",
//   "7",
//   "8",
//   "9",
//   "10",
//   "11",
//   "12",
//   "13",
//   "14",
//   "15",
//   "16",
//   "17",
//   "18",
//   "19",
//   "20",
//   "21",
//   "22",
//   "23",
//   "24"
// ],
//       series:[3, 15, 7, 12, 1, 19, 8, 6, 2, 14, 0, 17, 11, 4, 5, 13, 9, 18, 10, 16, 2, 7, 14, 3]
//     },
//     {
//       name:'THIS_WEEK',
//       xdata:[
//   "26",
//   "27",
//   "28",
//   "29",
//   "30",
//   "31",
//   "1"
// ],
//       series:[12, 29, 5, 37, 21, 3, 18, 34, 27, 10, 8, 15, 25, 2, 39, 11, 23, 32, 1, 16, 36, 14, 30, 19]

//     },
//     {
//       name:'THIS_MONTH',
//       xdata:[
//   "1",
//   "2",
//   "3",
//   "4",
//   "5",
//   "6",
//   "7",
//   "8",
//   "9",
//   "10",
//   "11",
//   "12",
//   "13",
//   "14",
//   "15",
//   "16",
//   "17",
//   "18",
//   "19",
//   "20",
//   "21",
//   "22",
//   "23",
//   "24",
//   "25",
//   "26",
//   "27",
//   "28",
//   "29",
//   "30",
//   "31"
// ],
//       series:[56, 23, 78, 45, 12, 67, 89, 34, 2, 91, 15, 38, 49, 73, 27, 11, 60, 4, 82, 5, 99, 39, 31, 88]

//     },
//     {
//       name:'THIS_YEAR',
//       xdata:[
//   "1",
//   "2",
//   "3",
//   "4",
//   "5",
//   "6",
//   "7",
//   "8",
//   "9",
//   "10",
//   "11",
//   "12"
// ],
//       series:[34, 145, 87, 12, 66, 178, 23, 91, 57, 4, 99, 150, 38, 76, 145, 65, 22, 3, 110, 200, 54, 79, 167, 88]
//     },
//   ]
//   const data = res.find(e=>e.name === through.value.timeType)
//   ecahrtsData.xData = data.xdata;
//   ecahrtsData.yData = data.series
//   numberPasses.value = 0;
//   data.series.forEach((item) => {
//     numberPasses.value += item;
//   });
//   numberPasses.value = '10%'
// };
const init = () => {
  deviceRealTimeStatus();
};
onMounted(() => {
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
.line-chart {
  height: 280px;

  :deep(.chart) {
    height: 100%;
  }
}

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

.visiting-data {
  :deep(.sub-panel-content) {
    display: flex;
    flex-wrap: wrap;

    .item {
      height: 60px;
      width: 50%;
      margin-top: 30px;
      margin-bottom: 10px;
      justify-content: center;
      box-sizing: border-box;
      padding-left: 20px;

      .unit {
        font-size: 12px;
      }

      .ant-statistic {
        display: inline-flex;
        flex-flow: column-reverse;

        .ant-statistic-content {
          height: 29px;

          .ant-statistic-content-value {
            color: #fff;
            font-size: 22px;
            font-weight: 400;
            position: relative;
            top: -25px;
          }
        }

        .ant-statistic-title {
          color: #D0DEEE;
          font-size: 16px;
          font-weight: bold;
          margin: 0;
        }
      }
    }
  }

  .ringRatio {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
  }

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin: 0 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
  }

  .down {
    color: #2ae8bd;
    font-family: Roboto-Regular, Roboto;
  }

  .up {
    color: #f14545;
    font-family: Roboto-Regular, Roboto;
  }
}
</style>
