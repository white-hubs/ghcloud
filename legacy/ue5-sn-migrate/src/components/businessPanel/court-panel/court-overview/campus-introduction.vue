<template>
  <SubPanelTemplate title="院区介绍">
    <div class="monitorPanelBox">
      <monitorPanel v-for="(item, index) in monitorPanelData" :key="item.name" :monitorPanelData="item"></monitorPanel>
    </div>
    <div class="hospitalInfo">
      <img :src="getAssetsImage('overView110.png')" alt="">
      <div class="hospitalInfo-text">
        <div class="hospitalInfo-title">成都市人民中级法院</div>
        <div class="scroll_box">
          <div class="scroll-text">
            成都市中级人民法院（以下简称成都中院）成立于1950年10月，前身为成都市人民法院，全院共有政法专项编制541人；内设25个庭级部门，审判业务部门14个，审判综合部门5个，行政综合部门6个。成都市设有1个中级法院，在20个行政区和高新区、天府新区共设22个基层法院，82个人民法庭。成都中院现有抚琴西路办公区和第二办公区（东区）两个办公区，地址分别是成都市金牛区抚琴西路109号，成都市金牛区花牌坊街2号附16号。
          </div>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="司法数据统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="energyOverviewTime" @search="changeHandleEnergyOverviewTime">
      </DateInlineForm>
    </template>
    <overviewPanel :overPanelData="overPanelData">
    </overviewPanel>
  </SubPanelTemplate>
  <SubPanelTemplate :title="'分条线收结存趋势图'">
    <template #extra>
      <div>
        <DateInlineForm  v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame">
        </DateInlineForm>
      </div>
    </template>
    <div class="line-chart">
      <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles" gridTop="15"
        :unit="{ x: '', y: '' }" :axisPointer="true" />
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="司法业务空间" class="alarm-event">
    <div class="elevator-analysis">
      <div class="chart">
        <elevator-analysis-pie :pieData="detectionData">
          <div style="color: #fff;text-align: center;font-size: 14px;">334</div>
          <div style="color: #fff;text-align: center;font-size: 10px;">司法空间</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList :showRatio="true" :contentList="detectionData" class="pie_list"></elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { getAssetsImage } from '@/utils/getImage';
import monitorPanel from "./components/monitor-panel.vue"
import { ModelValueItf } from '@/components/businessPanel/public/types'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import overviewPanel from "./components/overview-panel.vue"
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"

const energyOverviewTime = ref<ModelValueItf>()
const titles = ref<string[]>(['民事','刑事','行政','执行'])
const xData = ref<string[]>(['旧存','新收','结案','未结'])
const yData = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([
  {
    name: '民事',
    data: [2700, 13000, 9000, 4000],
    showSymbol: false,
    smooth: true,
  },{
    name: '行政',
    data: [400, 3000, 3000, 2500],
    showSymbol: false,
    smooth: true,
  },{
    name: '刑事',
    data: [200, 300,2700, 2000],
    showSymbol: false,
    smooth: true,
  },
  {
    name: '执行',
    data: [900, 8000, 7000, 3500],
  }
])
const monitorPanelData = ref([
  {
    imgPath: 'overView100.png',
    value: '20008',
    unit: 'm²',
    name: '占地面积'
  },
  {
    imgPath: 'overView99.png',
    value: '56442',
    unit: 'm²',
    name: '建筑面积'
  },
])

const topTimeFrame = ref<ModelValueItf>();

const detectionData = ref([
  {
    name:'法庭',
    value:89,
    color:'#29C2FF'
  },
  {
    name:'调解室',
    value:37,
    color:'#FFAB10'
  },
  {
    name:'诉服大厅（立案）',
    value:1,
    color:'#2989FF'
  },
  {
    name:'信访大厅',
    value:1,
    color:'#19F8F7'
  },
  {
    name:'其他',
    value:6,
    color:'#2AE8BD'
  },
])
const overPanelData = reactive({
  tittle: '受理数',
  rate:10,
  total: 51269,

  panelData1: 7768,
  panelName1: '旧存数',
  panelRatio1: 7.41,

  panelData2: -29.9,
  panelRatio2: 12805,
  panelName2: '新收数',

  panelData3: 22463,
  panelRatio3: -18.07,
  panelName3: '结案数',

  panelData4: 8233,
  panelRatio4: 15.68,
  panelName4: '未结数',
})
const changeHandleEnergyOverviewTime = () => {
  
}
const changeTopTimeFrame = ()=>{
}
</script>
<style lang="less" scoped>
.monitorPanelBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 20px;
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
</style>