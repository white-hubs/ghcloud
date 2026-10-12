<template>
  <SubPanelTemplate title="租售比分析">
    <template #extra>
      <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime">
      </DateInlineForm>
    </template>
    <div class="echarts">
      <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles" gridTop="15"
        :unit="{ x: '', y: '间' }" :axisPointer="true" />
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="用户行为分析 ">
    <div class="chart">
      <overviewChartBar :title="''" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="业绩评价与指标监控">
    <template #extra>
      <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime">
      </DateInlineForm>
    </template>
    <div class="table-box">
      <RollTable :column="columns" :data="data" :showLength="8">
        <template #alarmStatus="{ record }">
          <span class=" delect">删除</span>
        </template>
      </RollTable>
    </div>
  </SubPanelTemplate>

</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from '../public/types'
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"

const xData = ref<string[]>([
  '1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'
])
const titles = ref<string[]>(['租','售'])
const yData = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>(
  [{
    name:'租',
    data:[ 34, 78, 16, 92, 45, 23, 67, 89, 56, 12, 71, 99 ],
    linearGradientColor:['rgba(120, 252, 252, 0.5)', 'rgba(120, 252, 252, 0.1)'],
    lineColor:'rgba(120, 252, 252, 1)',
    smooth:true,
    symbolSize: 8
  },{
    name:'售',
    data:[23, 7, 19, 34, 46, 9, 27, 12, 38, 41, 6, 29],
    linearGradientColor:['rgba(86, 142, 255, 0.5)', 'rgba(86, 142, 255, 0.1)'],
    lineColor:'rgba(86, 142, 255, 1)',
    smooth:true,
    symbolSize: 8
  }
])
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
  height: 240px;
}
.chart{
  height: 240px;
}
.delect {
  color: #f14545;
  cursor: pointer;
}

.table-box {
  height: 290px;
}
</style>