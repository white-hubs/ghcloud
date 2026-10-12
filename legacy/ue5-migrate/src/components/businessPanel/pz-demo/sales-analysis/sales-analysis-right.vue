<template>
  <SubPanelTemplate title="销售渠道分析">
    <div class="echarts">
      <overviewChartBar :title="''" :xData="['线上推广','客户回购','商务推荐','公投招标']" :yData="[
        {
            data: [90, 40, 120, 70],
            name: '',
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        }
    ]"></overviewChartBar>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="销售趋势 ">
    <div class="chart">
      <LineChart :x-data="xData" :series="[
        {
    name:'',
    data:[213, 70, 190, 340, 460, 90, 270, 120, 380, 410, 60, 290],
    linearGradientColor:['red', 'rgba(86, 142, 255, 0.1)'],
    lineColor:'rgba(86, 142, 255, 1)',
    smooth:false,
    symbolSize: 40
  }
      ]" :showLegend="true" :showBackground="true" :titles="titles" gridTop="15" :unit="{ x: '', y: '元' }"
        :axisPointer="true" />
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="销售面积统计分析" class="visiting-data">
    <!-- <template #extra>
      <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime">
      </DateInlineForm>
    </template>
    <div class="table-box">
      <RollTable :column="columns" :data="data" :showLength="8">
        <template #alarmStatus="{ record }">
          <span class=" delect">删除</span>
        </template>
      </RollTable>
    </div> -->
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

</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from '@/components/businessPanel/public/types';
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"

const visitingData = ref([
    { title: "已销售面积", value: 7800, ratio: 12.3 },   
    { title: "销售率", value: 60, ratio: 10.0 },   
    { title: "今年销售面积", value: 1500, ratio: 5.0 },      
    { title: "今年相对销售率", value: 40, ratio: 8.7 },    
]);
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