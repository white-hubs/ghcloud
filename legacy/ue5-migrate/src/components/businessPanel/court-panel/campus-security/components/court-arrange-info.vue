<template>
  <div class="arrange-info">
    <!-- 头部统计UI -->
    <div class="monitorPanelBox">
      <monitorPanel v-for="(item, index) in monitorPanelData" :key="item.name" :monitorPanelData="item"></monitorPanel>
    </div>
    <!-- 趋势图 -->
    <childLevelSubPanel title="近一周庭审安排趋势图" >
    <div class="line-chart">
      <LineChart :x-data="receptionTrendsChartData.xData" :series="receptionTrendsChartData.yData" :showLegend="false"
        gridTop="5" :unit="{ x: '', y: '次庭审' }" />
    </div>
  </childLevelSubPanel>
    <!-- 待审信息列表 -->
    <childLevelSubPanel title="待庭审信息列表" >
      <div class="wait-court-trail">
      <div class="list">
        <HistoryCourtTrial :dataSource="dataSource"/>
      </div>
    </div>
    </childLevelSubPanel>
  </div>
</template>

<script setup lang='ts'>
import { reactive, toRefs, onMounted, ref, watch } from 'vue';
import HistoryCourtTrial from './history-court-trial.vue';
import monitorPanel from "@/components/businessPanel/court-panel/court-overview/components/monitor-panel.vue"
import childLevelSubPanel from "@/components/businessPanel/public/childLevelSubPanel.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";

interface Props {
	modelValue: string;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue:'THIS_YEAR'
})
const dataSource = [
  {
    id: '1',
    title: '胡某某诉张某买卖合同纠纷',
    case: '民事（2024）川0602民初59934号',
    reason: '买卖合同纠纷',
    name: '张某',
    time: '2024年11月13日 09:00'
  },
  {
    id: '2',
    title: '被继承人债务清偿纠纷',
    case: '民事（2024）川0602民终9324号',
    reason: '被继承人债务清偿纠纷',
    name: '李某',
    time: '2024年11月13日 10:40'
  },
  {
    id: '3',
    title: '胡某某诉张某买卖合同纠纷',
    case: '民事（2024）川0602民初59934号',
    reason: '买卖合同纠纷',
    name: '张某',
    time: '2024年11月13日 09:00'
  },
  {
    id: '4',
    title: '被继承人债务清偿纠纷',
    case: '民事（2024）川0602民终9324号',
    reason: '被继承人债务清偿纠纷',
    name: '李某',
    time: '2024年11月13日 10:40'
  },
]
watch(()=>props.modelValue,()=>{
  if (props.modelValue === 'THIS_YEAR') {
    monitorPanelData.value[0].value = '631'
    monitorPanelData.value[1].value = '127'
  }else if (props.modelValue === 'THIS_MONTH') {
    monitorPanelData.value[0].value = '55'
    monitorPanelData.value[1].value = '13'
  }else if (props.modelValue === 'THIS_WEEK') {
    monitorPanelData.value[0].value = '19'
    monitorPanelData.value[1].value = '4'
  }else if (props.modelValue === 'TODAY') {
    monitorPanelData.value[0].value = '0'
    monitorPanelData.value[1].value = '0'
  }
})

const monitorPanelData = ref([
  {
    imgPath: 'overView115.png',
    value: '631',
    unit:'',
    name: '已庭审数',
    
  },
  {
    imgPath: 'overView114.png',
    value: '127',
    unit:'',
    name: '待庭审数',
  },
])
const receptionTrendsChartData = reactive({
  xData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  yData: [
    { data: [3,4,3,5,4,3,3], linearGradientColor: ['rgba(41,137,255,0.60)', 'rgba(41,137,255,0.00)'], lineColor: 'rgba(41,137,255,0.60)' },
  ]
})
onMounted(() => {
})
// 使用toRefs解构

</script>
<style scoped lang='less'>
.arrange-info {
  .court-stat {
    min-height: 100px;
  }

  .trend-chart {
    .chart {
      height: 200px;
    }
  }

  .wait-court-trail {
    .list {
      margin: 12px 0;
      height: 200px;
      overflow: hidden;
    }
  }

  .title {
    display: flex;
    align-items: center;

    .line {
      content: '';
      display: inline-block;
      background: #2989ff;
      width: 2px;
      height: 16px;
      margin-right: 4px;
    }

    .text {
      flex: 1;
      padding: 8px 10px 4px;
      opacity: .9;
      background: linear-gradient(13deg, #2989ff 10%, rgba(41, 137, 255, 0.00) 100%);
      font-size: 14px;
      font-family: Source Han Sans CN, Source Han Sans CN-Medium;
      font-weight: Medium;
      text-align: left;
      position: relative;
      color: #e6f2ff;
    }
  }

}
.monitorPanelBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 20px;

  :deep(.monitorPanel-right) {
    min-width: 80px;
  }
}
.line-chart{
  height: 180px;
}
</style>