<template>
  <SubPanelTemplate title="未结案件实时统计">
    <div class="monitorPanelBox">
      <monitorPanel v-for="(item, index) in monitorPanelData" :key="item.name" :monitorPanelData="item"></monitorPanel>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="案件积压预警">
    <div class="bar-chart">
      <overviewChartBar :bottom="'0%'" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="审判质效分析">
    <childLevelSubPanel title="重点考核指标分析" style="margin-top: 12px;" class="child-level">
      <AssessmentIndicators :overPanelData="overPanelData"/>
    </childLevelSubPanel>
    <childLevelSubPanel title="各基层法院在全市的排名TOP5" style="margin-top: 12px;" class="child-level">
      <div class="eventAlarmItem-body">
        <EventAlarmItem v-for="(item, index) in listData" :sort="index + 1" :sn="false" :name="item.name"
          :count="item.value" :ratio="item.ratio" :modes="'次'" />
      </div>
    </childLevelSubPanel>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import { getAssetsImage } from '@/utils/getImage';
import monitorPanel from "./components/monitor-panel.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import childLevelSubPanel from "@/components/businessPanel/public/childLevelSubPanel.vue";
import AssessmentIndicators from './components/assessment-indicators.vue';
import { ModelValueItf } from '../../public/types'
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue";

const barData = reactive({
  xData: [ '1-2年未结案','2-3年未结案','3年及以上'],
  yData: [
    {
      data: [789,543,311],
      name: '案件预案数',
      color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
    }
  ]
})
const overPanelData = ref({
  title:'受理数',
  rate:6.8,
  total:2.62,
  valueData:[
    {
      label:'优于区间',
      value:6
    },
    {
      label:'位于区间',
      value:13
    },
    {
      label:'劣于区间',
      value:6
    },
  ]
})
const listData = ref<{ name: string;ratio: string; value: number; }[]>([
  {
    name:'高新法院',
    value:1000,
    ratio:'100%'
  },
  {
    name:'锦江法院',
    value:900,
    ratio:'90%'
  },
  {
    name:'青羊法院',
    value:800,
    ratio:'80%'
  },
  {
    name:'成华法院',
    value:700,
    ratio:'70%'
  },
  {
    name:'武侯法院',
    value:600,
    ratio:'60%'
  },
])
const monitorPanelData = ref([
  {
    imgPath: 'overView105.png',
    value: '18',
    unit:'',
    name: '未结总数',
  },
  {
    imgPath: 'overView113.png',
    value: '5',
    unit:'',
    name: '新增未结',
  },
  {
    imgPath: 'overView111.png',
    value: '26',
    unit:'',
    name: '已化解未结',
  },
  {
    imgPath: 'overView112.png',
    value: '1.45',
    unit:'%',
    name: '未结案化解率',
  },
])

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

.chart {
  height: 150px;
}

.line-chart {
  height: 180px;
}

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0px 10px;
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

.child-level {
  :deep(.time-type) {
    width: 50px !important;
  }
}

:deep(.sub-panel-content) {
  padding: 0 !important;
}

.bar-chart {
  height: 200px;
}
</style>