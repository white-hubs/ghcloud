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
  <SubPanelTemplate title="空置率分析 ">
    <div class="chart">
      <overviewChartBar :title="''" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="空间资产状态监控">
    <template #extra>
      <DateInlineForm v-model:modelValue="workOrderTime" @search="changeHandleworkOrderTime"></DateInlineForm>
    </template>
    <displayPanel :bg-img="'overView16.png'" :content-list="contentList" :showimg="false"></displayPanel>
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
import displayPanel from "@/components/businessPanel/public/display-panelsafty.vue";
import { getAssetsImage } from '@/utils/getImage';
const contentList = ref([
  {
    name: "设备离线率",
    field:"timeoutRatio",
    value: 10,
  },
  {
    name: "设备故障率",
    field:"actualRatio",
    value: 20,
  },
  {
    name: "设备损坏率",
    field:"ratio",
    value: 10,
  },
  {
    name: "设备正常运行率",
    field:"handlerRatio",
    value: 10,
  },
]);
const xData = ref<string[]>([
  '1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'
])
const workOrderTime = ref<ModelValueItf>();
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
// 群控组实时数据
const visitingData = ref([
    { title: "氧气", value: 3345, img: getAssetsImage('overView36.png'), ratio: 0.5, unit: 'm³' },
    { title: "二氧化碳", value: 2346, img: getAssetsImage('overView35.png'), ratio: 0.5, unit: 'm³' },
    { title: "笑气", value: 1345, img: getAssetsImage('overView34.png'), ratio: 0.5, unit: 'm³' },
    { title: "压缩空气", value: 345, img: getAssetsImage('overView38.png'), ratio: 0.5, unit: 'm³' },
    { title: "负压吸引", value: 345, img: getAssetsImage('overView37.png'), ratio: 0.5, unit: 'm³' },
    { title: "氦气", value: 345, img: getAssetsImage('overView39.png'), ratio: 0.5, unit: 'm³' },
])
const changeHandleworkOrderTime = () => {
    // requestFlowNumberStatistic();
};
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
.visiting-data {
  :deep(.sub-panel-content) {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .item {
      width: 50%;
      height: 60px;
      margin-top: 30px;
      margin-bottom: 10px;
      display: inline-flex;
      align-items: center;
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
          font-size: 22px;
          margin: 0;
        }
      }
    }
  }
}

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
</style>