<!-- 门禁管理 -->
<template>
  <div>
    <SubPanelTemplate title="区域设备利用率">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmtimeType"></DateInlineForm>
      </template>
      <displayPanel :bg-img="'overView16.png'" :content-list="contentList" :showimg="true"></displayPanel>
    </SubPanelTemplate>
    <SubPanelTemplate title="空间资源利用分析" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="throughType" @search="trafficAnalysisInfo"></DateInlineForm>
      </template>
      <div class="equipmentAlarm" v-show="roundPieData.arr.length > 0">
        <planPie :pie-data="roundPieData.arr">
          <div class="content">
            <div class="pie-center">{{ throughNum }}</div>
            <div>总数</div>
          </div>
        </planPie>
        <pieList :roundPieData="roundPieData.arr"></pieList>
      </div>
      <div class="equipmentAlarm" v-show="roundPieData.arr.length <= 0">
        <noData></noData>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="不同设备利用率统计" class="alarm-event">
      <RollTable :column="columns" :data="data" :showLength="8"> </RollTable>
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "../../../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import planPie from "../../../public/charts/pie/planePie.vue";
import pieList from "../../../public/pieList.vue";
import displayPanel from "@/components/businessPanel/public/display-panelsafty.vue";
import RollTable from "../../../public/rollTable/index.vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useStateStore } from "@/pages/state/use-state-store";
const { globalState } = useStateStore()

let through = ref();
let throughType = ref();
const contentList = ref([
  {
    name:'住宅区',
    value:'80%'
  },
  {
    name:'商业区',
    value:'85%'
  },
  {
    name:'办公区',
    value:'89%'
  },
  {
    name:'工业区',
    value:'90%'
  }
]);
const throughNum = ref(0);
const ecahrtsData = reactive({
  xData: [],
  yData: [],
});
const alarmtimeType = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
});
let timer = ref<any>(null);
let numberPasses = ref(0);
const roundPieData = reactive({
  arr: [],
});

const columns = ref([
  {
    title: "时间",
    dataIndex: "eventTime",
    width: 120,
  },
  {
    title: "设备名称",
    dataIndex: 'deviceName',
  },
  {
    title: "利用率",
    dataIndex: "useRatio",
  },
]);
const data = ref<any>([
  {
    eventTime:'2024-09-05',
    deviceName:'门口闸机',
    useRatio:'10%'
  },
  {
    eventTime:'2024-09-05',
    deviceName:'门口闸机',
    useRatio:'20%'
  },
  {
    eventTime:'2024-09-05',
    deviceName:'门口闸机',
    useRatio:'10%'
  },
  {
    eventTime:'2024-09-05',
    deviceName:'门口闸机',
    useRatio:'30%'
  },
  {
    eventTime:'2024-09-05',
    deviceName:'门口闸机',
    useRatio:'10%'
  },
  {
    eventTime:'2024-09-05',
    deviceName:'门口闸机',
    useRatio:'50%'
  },
  {
    eventTime:'2024-08-28',
    deviceName:'门口闸机',
    useRatio:'60%'
  },
]);
watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer.value);
    timer.value = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
    init();
  }
);

// 人流通行趋势
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
      series:[15, 2, 27, 9, 18, 5, 22, 13, 30, 7, 1, 25, 14, 19, 3, 29, 11, 6, 24, 8]  ,
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
      series:[23, 57, 12, 89, 34, 76, 45, 8, 91, 67, 3, 54, 29, 72, 11, 38, 99, 15, 84, 60],
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
      series:[142, 57, 89, 13, 175, 66, 34, 199, 88, 27, 105, 3, 78, 154, 22, 11, 63, 91, 47, 172] ,
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
      series:[342, 76, 215, 487, 58, 134, 299, 401, 23, 475, 88, 157, 290, 7, 399, 212, 64, 378, 91, 450] ,
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
// 通行分析
const trafficAnalysisInfo = async () => {
  const res = [
    {
      name:'TODAY',
      total:270,
      arr:18
  },
     {
      name:'THIS_WEEK',
      total:900,
      arr:67
   },
     {
      name:'THIS_MONTH',
      total:1500,
      arr:163
 },
     {
      name:'THIS_YEAR',
      total:4400,
      arr:2646
  },
  ]
  const data = res.find(e=>e.name === throughType.value.timeType)
  throughNum.value = data.total+data.arr;
  roundPieData.arr = [
    {
      name:'合理',
      value:data.total,
      color:"#328BF7",
    },
    {
      name:'浪费',
      value:data.arr,
      color:"#FFC700",
    },
  ]
};
// 实时通行数据
const init = () => {
  // accessTypeInfo()
  trafficAnalysisInfo();
  abnormalPassageInfo();
};
onMounted(() => {
  init();
  timer.value = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(() => {
  clearInterval(timer.value);
});
</script>
<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .content {
    font-size: 16px;
  }

  .pie-center {
    font-size: 18px;
    font-weight: bold;
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
  height: 180px;
  display: flex;
}

.iconOutlined {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #cbe2ff;
}

.content {
  color: #fff;
  text-align: center;
  font-size: 12px;
}
</style>
