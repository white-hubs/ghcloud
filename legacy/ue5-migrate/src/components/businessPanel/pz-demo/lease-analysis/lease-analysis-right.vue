<template>
  <SubPanelTemplate title="租赁率趋势分析">
    <template #extra>
      <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime">
      </DateInlineForm>
    </template>
    <div class="echarts">
      <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles" gridTop="15"
        :unit="{ x: '', y: '间' }" :axisPointer="true" />
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="运营成本分析">
    <div class="chart">
      <overviewChartBar :title="''" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="租赁收益统计分析">
    <template #extra>
      <DateInlineForm :timeList="timeList" v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame">
      </DateInlineForm>
    </template>
    <div class="elevator-analysis">
      <div class="chart">
        <elevator-analysis-pie :pieData="appointmentChartData">
          <div>{{ appointmentTotalNum }}</div>
          <div>{{ appointmentTotalName }}</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList :contentList="appointmentChartData" class="elevatorAnalysisList">
      </elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from '@/components/businessPanel/public/types';
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
const xData = ref<string[]>([
  '1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'
])
const appointmentTotalNum = ref(0)
const appointmentTotalName = ref('成本总和')
const titles = ref<string[]>(['租','售'])
const yData = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>(
  [{
    name:'租赁',
    data:[ 34, 78, 16, 92, 45, 23, 67, 89, 56, 12, 71, 99 ],
    linearGradientColor:['rgba(120, 252, 252, 0.5)', 'rgba(120, 252, 252, 0.1)'],
    lineColor:'rgba(120, 252, 252, 1)',
    smooth:true,
    symbolSize: 8
  }
])
const timeList = [
  { label: "人力统计", value: "rili" },
  { label: "区域统计", value: "quyu" },
  { label: "维护统计", value: "weihu" },
  { label: "能耗统计", value: "nenghao" },
  { label: "本月统计", value: "benyue" },
]
const topTimeFrame = ref({
  timeType:'rili',
});
const appointmentChartData = ref<{ name: string; value: number; color: string; ratio?: string }[]>(
  []
);
const changeTopTimeFrame = ()=>{
  appointmentTotalNum.value = 0
 if(topTimeFrame.value.timeType === 'rili'){
  appointmentChartData.value = [
    { name: '行政办公区', value: 4500000, color: '#FFAB10' },   
    { name: '生产研发区', value: 600000, color: '#2F8DFF'  }, 
    { name: '仓储物流区', value: 450000, color: '#F14545' }, 
    { name: '公共服务区', value: 1200000, color:'#19F8F7' },
  ]
  appointmentTotalName.value = '收益总和'
 }else if (topTimeFrame.value.timeType === 'quyu') {
  appointmentChartData.value = [
    { name: '行政办公区', value: 12000, color: '#FFAB10' },   
    { name: '生产研发区', value: 6000, color: '#2F8DFF'  }, 
    { name: '仓储物流区', value: 3800, color: '#F14545' }, 
    { name: '公共服务区', value: 2790, color:'#19F8F7' },
    { name: '其他区域', value: 880, color: "#B9D9FF" } 
  ]
 }else if (topTimeFrame.value.timeType === 'weihu') {
  appointmentChartData.value = [
    { name: '建筑物维护', value: 45000, color: '#FFAB10' },   
    { name: '设施设备维护', value: 6000, color: '#2F8DFF'  }, 
    { name: '环境维护', value: 400, color: '#F14545' }, 
    { name: '安全维护', value: 1000, color:'#19F8F7' },
    { name: '其他维护', value: 1500, color: "#B9D9FF" } 
  ]
 }
 appointmentChartData.value.forEach(e=>{
    appointmentTotalNum.value+= e.value 
  })
}
const columns = ref([
  {
    title: "人员",
    dataIndex: "name",
    width: 120,
  },
  {
    title: "绩效",
    dataIndex: "value",
  },
  {
    title: "操作",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
  },
]);
const barData = reactive({
    xData: ['行政区','生产区','仓储物流','公共区','其他区域'],
    yData: [
        {
            data: [10, 20, 30, 40,80],
            name: '',
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        }
    ]
})
const data = ref<any>([
    {
        "name": "李明",
        "value": "优"
    },
    {
        "name": "张伟",
        "value": "优"
    },
    {
        "name": "王芳",
        "value": "优"
    },
    {
        "name": "赵丽",
        "value": "良"
    },
    {
        "name": "孙磊",
        "value": "良"
    },
    {
        "name": "周敏",
        "value": "良"
    },
    {
        "name": "吴秀英",
        "value": "良"
    },
    {
        "name": "郑洁",
        "value": "差"
    },
    {
        "name": "陈婷婷",
        "value": "良"
    },
    {
        "name": "刘阳",
        "value": "差"
    },
    {
        "name": "高强",
        "value": "良"
    },
    {
        "name": "黄小芳",
        "value": "良"
    },
    {
        "name": "李晓红",
        "value": "差"
    },
    {
        "name": "郭建军",
        "value": "优"
    },
    {
        "name": "马海燕",
        "value": "优"
    },
    {
        "name": "刘小刚",
        "value": "优"
    },
    {
        "name": "张桂兰",
        "value": "优"
    },
    {
        "name": "王丽梅",
        "value": "良"
    },
    {
        "name": "赵静",
        "value": "良"
    },
    {
        "name": "孙明辉",
        "value": "良"
    },
    {
        "name": "周大力",
        "value": "良"
    },
    {
        "name": "吴丽华",
        "value": "良"
    },
    {
        "name": "郑东",
        "value": "良"
    },
    {
        "name": "陈娜",
        "value": "良"
    },
    {
        "name": "刘俊",
        "value": "良"
    },
    {
        "name": "高玉兰",
        "value": "良"
    },
    {
        "name": "黄海涛",
        "value": "差"
    },
    {
        "name": "李建新",
        "value": "差"
    },
    {
        "name": "郭秀丽",
        "value": "优"
    }
]);
const overviewTime = ref<ModelValueItf>({
  timeType: 'TODAY',
  dateRange: []
})
const changeHandleOverviewTime = () => {
};
onMounted(()=>{
})
</script>
<style lang="less" scoped>
.echarts {
  height: 200px;
}

.chart {
  height: 200px;
}

.delect {
  color: #f14545;
  cursor: pointer;
}

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;

  div {
    color: #fff;
    text-align: center;
    font-size: 14px;
  }

  .chart {
    flex: 1;
    height: 200px;
  }
}

.elevatorAnalysisList {
  margin-left: 10px;
  width: 180px;
}

.DeviceStatistics {
  height: 60px;
}

.table-box {
  height: 290px;
}
</style>