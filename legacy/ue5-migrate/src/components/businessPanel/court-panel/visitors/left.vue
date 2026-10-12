<template>
  <div>
    <SubPanelTemplate title="今日来访人员统计">
      <div class="monitorPanelBox">
        <monitorPanel v-for="(item, index) in monitorPanelData" :key="item.name" :monitorPanelData="item">
        </monitorPanel>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="人员来访趋势">
      <template #extra>
      <DateInlineForm v-model:modelValue="energyOverviewTime" @change="changeEnergyOverviewTime">
      </DateInlineForm>
    </template>
      <div class="line-chart">
      <LineChart :x-data="receptionTrendsChartData.xData" :series="receptionTrendsChartData.yData" :showLegend="false"
        gridTop="5" :unit="{ x: '', y: '人' }" />
    </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="来访人员分布"> 
      <template #extra>
      <DateInlineForm v-model:modelValue="energyOverviewTime" @change="changeEnergyOverviewTime">
      </DateInlineForm>
    </template>
    <div class="tab-container">
        <Tabs :tabsList="tabState.tabList" v-model:active="tabState.active" @change="handleTabChange" />
      </div>
      <div class="elevator-analysis">
        <div class="chart">
          <elevatorAnalysisPie :pieData="spaceAreaData.data">
            <div style="color: #fff;text-align: center;font-size: 14px;">{{spaceAreaData.value}}</div>
            <div style="color: #fff;text-align: center;font-size: 10px;">{{spaceAreaData.name}}</div>
          </elevatorAnalysisPie>
        </div>
        <elevatorAnalysisList :showRatio="true" :contentList="spaceAreaData.data" class="pie_list">
        </elevatorAnalysisList>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import monitorPanel from "@/components/businessPanel/court-panel/court-overview/components/monitor-panel.vue"
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from '@/components/businessPanel/public/types'
import Tabs from '@/components/businessPanel/court-panel/judicial-space/components/tabs.vue'

// 司法空间数据
const monitorPanelData = ref([
  {
    imgPath: "overView109.png",
    value: "1399",
    name: "来访人员总数",
  },
  {
    imgPath: "overView106.png",
    value: "234",
    name: "律师来访统计",
  },
  {
    imgPath: "overView107.png",
    value: "1",
    name: "敏感人员来访",
  },
  {
    imgPath: "overView108.png",
    value: "9",
    name: "来访滞留人员",
  },
]);
const energyOverviewTime = ref<ModelValueItf>({
  timeType: 'THIS_WEEK',
  dateRange: []
})
const tabState=reactive({
  active: 'age',
  tabList:[
    {
      label:'年龄分布',
      value:'age'
    },
    {
      label:'性别分布',
      value:'sex'
    }
  ]
})
// 司法空间区域数据
const spaceAreaData = ref(
  {
    value: 1399,
    data: [
      {
        name: '20岁以下',
        value: 62,
        color: '#29C2FF'
      },
      {
        name: '21-30',
        value: 237,
        color: '#FFAB10'
      },
      {
        name: '31-40',
        value: 451,
        color: '#2989FF'
      },
      {
        name: '40-50',
        value: 371,
        color: '#19F8F7'
      },
      {
        name: '50以上',
        value: 278,
        color: '#EC5F67'
      },
    ],
  }
)
const receptionTrendsChartData = reactive({
  xData: ['周一', '周二', '周三', '周四', '周五', '周六'],
  yData: [
    { data: [1023,1411,1099,1132,1122,1399], linearGradientColor: ['rgba(41,137,255,0.60)', 'rgba(41,137,255,0.00)'], lineColor: 'rgba(41,137,255,0.60)' },
  ]
})
const handleTabChange = ()=>{
  if (tabState.active === 'age') {
    spaceAreaData.value.data = [
      {
        name: '20岁以下',
        value: 62,
        color: '#29C2FF'
      },
      {
        name: '21-30',
        value: 237,
        color: '#FFAB10'
      },
      {
        name: '31-40',
        value: 451,
        color: '#2989FF'
      },
      {
        name: '40-50',
        value: 371,
        color: '#19F8F7'
      },
      {
        name: '50以上',
        value: 278,
        color: '#EC5F67'
      },
    ]
  }else {
    spaceAreaData.value.data = [
      {
        name: '男',
        value: 1078,
        color: '#29C2FF'
      },
      {
        name: '女',
        value: 321,
        color: '#FFAB10'
      }
    ]
  }
}
const changeEnergyOverviewTime = ()=>{
}




</script>

<style lang="less" scoped>
.monitorPanelBox {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  padding-right: 20px;

  :deep(.monitorPanel-left) {
    .bg {
      width: 90px;

      .rotate {
        left: 30px;
      }
    }
  }
}

.hospitalInfo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;

  img {
    width: 152px;
    height: 128px;
  }

  .hospitalInfo-text {
    width: 169px;
    color: #fff;
    font-size: 12px;

    .hospitalInfo-title {
      font-size: 14px;
      margin-bottom: 5px;
    }
  }

  .scroll_box {
    height: 100px;
    overflow: hidden;

    .scroll-text {
      animation: scroll 10s linear infinite;
      color: #D9E7FF;
    }
  }

  @keyframes scroll {
    0% {
      transform: translateY(0);
    }

    100% {
      transform: translateY(-100%);
    }
  }
}

.tab-container {
  display: flex;
  padding-right: 14px;
  justify-self: flex-end;
}

.line-chart {
  height: 200px;
}

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px;
  align-items: center;

  .pie_list {
    width: 180px;
    height: 180px;

    // margin-left: 10px;
    :deep(.alarm-analysis-name) {
      width: 90px;
    }

    :deep(.alarm-analysisBox) {
      width: auto;
    }
  }

  .chart {
    flex: 1;
    height: 140px;
  }
}
.line-chart{
  height: 180px;
}
</style>