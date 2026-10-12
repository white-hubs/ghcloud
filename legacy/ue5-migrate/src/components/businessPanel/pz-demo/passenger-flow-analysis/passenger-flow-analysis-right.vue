<template>
  <SubPanelTemplate title="高峰时间统计分析">
    <template #extra>
      <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime">
      </DateInlineForm>
    </template>
    <div class="echarts">
      <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles" gridTop="15"
        :unit="{ x: '', y: '间' }" :axisPointer="true" />
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="空间热点统计分析 ">
    <div class="chart">
      <overviewChartBar :title="''" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="客户画像构建">
    <template #extra>
      <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime">
      </DateInlineForm>
    </template>
    <LightingRound class="LightingBox" :data="roundData"></LightingRound>
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
import LightingRound from '@/components/businessPanel/security-overview/components/lighting-round.vue';
// 风险源分析
const roundData = reactive([
    {
        statistic: { title: '客户男性率', value: '70', unit: '%' },
        legendList: [
            { name: '客户女性数', color: '#FFAB10', value: 30,type:'flow-order',key:'ACTIVE' },
            { name: '客户男性数', color: '#2AE8BD', value: 70,type:'flow-order',key:'FINISHED' }
        ],
    },
    {
        statistic: { title: '回购率', value: '10', unit: '%' },
        legendList: [
            { name: '客户回购次数', color: '#2989FF', value: 10 ,type:'staff',key:'WORKING'},
            { name: '客户消费次数', color: '#FFAB10', value: 100 ,type:'staff',key:'LEAVE_POST'}
        ],
        key:'staff'
    },
])
const xData = ref<string[]>([
  '1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'
])
const titles = ref<string[]>(['停留','离开'])
const yData = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>(
  [{
    name:'停留',
    data:[ 34, 78, 16, 92, 45, 23, 67, 89, 56, 12, 71, 99 ],
    linearGradientColor:['rgba(28, 58, 252, 0.5)', 'rgba(28, 58, 252, 0.1)'],
    lineColor:'rgba(28, 58, 252, 1)',
    smooth:true,
    symbolSize: 8
  },{
    name:'离开',
    data:[23, 7, 19, 34, 46, 9, 27, 12, 38, 41, 6, 29],
    linearGradientColor:['rgba(128, 158, 255, 0.5)', 'rgba(128, 158, 255, 0.1)'],
    lineColor:'rgba(128, 158, 255, 1)',
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
        },
        {
            data: [20, 25, 38, 44,70],
            name: '',
            color: ['rgba(255, 137, 137, 0.80)', 'rgba(255, 137, 137, 0)']
        },
        {
            data: [15, 18, 33, 52,80],
            name: '',
            color: ['rgba(255, 255, 137, 0.80)', 'rgba(255, 255, 137, 0)']
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

.table-box {
  height: 290px;
}

:deep(.LightingBox) {
  &.round-wrap .monitorBox {
    flex-direction: column;
    width: 90px;
  }

  .monitor .monitorBox .monitorValue {
    font-size: 16px;
    font-family: D-DIN, D-DIN;
    font-weight: 700;
  }

  .monitor .monitorBox .monitorList .monitorColor {
    display: none !important;
  }

  .monitor {
    width: 180px !important;
    justify-content: space-between;
    margin-top: 15px;
  }

  .info {
    position: relative;
    justify-content: space-around;
    flex-direction: row;

    &::after {
      content: '';
      display: inline-block;
      height: 1px;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      position: absolute;
      width: 200px;
      top: 92px;
      left: 121px;
    }

    &::before {
      content: '';
      display: inline-block;
      height: 1px;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      position: absolute;
      top: 80px;
      left: 90px;
      width: 35px;
      transform: rotateZ(40deg);
    }
  }

  .roate {
    width: 67px !important;
    height: 67px !important;
  }

  .r1 {
    width: 90px !important;
    height: 90px !important;
  }

  .r2 {
    width: 80px !important;
    height: 80px !important;
  }

  .r3 {
    width: 80px !important;
    height: 80px !important;
    border-radius: 100%;
  }

  .item {
    height: 110px !important;
  }

  .icon {
    width: 30px !important;
    height: 30px !important;
  }
}
</style>