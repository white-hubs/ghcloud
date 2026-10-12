<template>
  <div >
    <SubPanelTemplate title="隧道环境指标实时监测">
      <div class="environment-box">
        <div class="environment-item" v-for="item in environmentIndex">
          <div class="environment-item-title">{{ item.label }}</div>
          <div class="environment-item-list">
            <div class="environment-item-data" v-for="data in item.data">
              <div class="environment-item-data-label">{{ data.name }}</div>
              <div class="environment-item-box">
                <div class="environment-item-value">{{ data.value?data.value+data.unit:'' }}</div>
                <div class="environment-item-sustain">{{ data.sustain?`持续${data.sustain}min`:'' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="隧道CO浓度趋势分析">
      <div class="flex-between">
        <traffic v-for="item in faultList" :key="item.color" :trafficInfo="item"></traffic>
      </div>
      <div class="chart">
        <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles" gridTop="15"
          :unit="{ x: '', y: '' }" :axisPointer="true" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备状态分布">
      <div class="flex-between">
        <PlanPie :pieData="pieData">
          <div class="content">
            <div class="total-num">{{ alarmTotal }}</div>
            <div>设备总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="pieData"></PieList>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import traffic from "../public/traffic.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import { ModelValueItf } from '../public/types'
import { concentrationTunnels, environmentalIndicators } from '@/api/securitymanagement'
import { equipmentTotal } from '@/api/equipment';
import { useStateStore } from '@/pages/state/use-state-store';

const { globalState } = useStateStore();
const environmentIndex = ref([
  {
    label:'CO浓度',
    data:[
    {
      name:'实时平均',
      value:'',
      unit:'ppm'
    },
    {
      name:'今日最高',
      value:'',
      unit:'ppm',
      sustain:''
    },
  ]
  },
  {
    label:'能见度',
    data:[
    {
      name:'实时平均',
      value:'',
      unit:'ppm',
    },
    {
      name:'今日最低',
      value:'',
      unit:'ppm',
      sustain:''
    },
  ]
  },
  {
    label:'亮度',
    data:[
    {
      name:'实时平均',
      value:'150',
      unit:'lux',
    },
    {
      name:'今日最低',
      value:'100',
      unit:'lux',
      sustain:''
    },
  ]
  },
  {
    label:'风速',
    data:[
    {
      name:'实时平均',
      value:'',
      unit:'m/s',
    },
    {
      name:'今日最高',
      value:'',
      unit:'m/s',
      sustain:''
    },
  ]
  },
]);
const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const faultList = reactive([
  {
    color: "#2989FF",
    label: "最高值",
    value: 'ppm',
  },
  {
    color: "#FFAB10",
    label: "实时平均",
    value: '20ppm',
  },
]);
const alarmTotal = ref(0)
const pieData = ref([]);
const titles = ref<string[]>(['入口段','出口段','基本段'])
const xData = ref<string[]>([])
const yData = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([
  {
    name:'入口段',
    data: [],
   linearGradientColor: ['rgb(255, 162, 0.1)', 'rgb(255, 222, 165,1)']
  },
  {
    name:'基本段',
    data: [],
   linearGradientColor: ['rgb(86, 142, 255)', 'rgb(86, 142, 255,0)']
  },
  {
    name:'出口段',
    data: [],
   linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], 
  },
])
// 设备实时数据
const deviceDataInfo = async () => {
  const deviceStatusType = {
    ALARM: "报警",
    TROUBLE: "故障",
    OFFLINE: "离线",
    NORMAL: "正常",
}
const colorList = ["#FFAB10","#2F8DFF","#F14545","#19F8F7"]
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
  }
    let res: any = await equipmentTotal(params);
    if (!res.deviceNum) {
        return;
    }
    pieData.value.length = 0
    alarmTotal.value = 0;
    res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
            label: deviceStatusType[item.name],
            color: colorList[index],
            value: item.num,
        };
        pieData.value.push(obj);
    });
};
const getTemplateData =async () => {
  const res = await concentrationTunnels()
  xData.value = res.xtitle.map(item => {
        return item+'时'
    });
  yData.value[0].data = res.xtitle.map(xItem=>{
                return res.inletSection.find(item=>item.timeFlag===xItem)?res.inletSection.find(item=>item.timeFlag===xItem).fieldData:0
  })
  yData.value[1].data = res.xtitle.map(xItem=>{
                return res.basicSegment.find(item=>item.timeFlag===xItem)?res.basicSegment.find(item=>item.timeFlag===xItem).fieldData:0
  })
  yData.value[2].data = res.xtitle.map(xItem=>{
                return res.exitSection.find(item=>item.timeFlag===xItem)?res.exitSection.find(item=>item.timeFlag===xItem).fieldData:0
  })
}
const getEnvironmentalIndicators = async () => {
 const res = await environmentalIndicators()
 faultList[0].value = (res.coMax || 0)+'ppm'
 faultList[1].value = (res.co || 0)+'ppm'
 environmentIndex.value[0].data[0].value = res.co
 environmentIndex.value[0].data[1].value = res.coMax
 environmentIndex.value[0].data[1].sustain = res.coTime

 environmentIndex.value[1].data[0].value = res.visibility
 environmentIndex.value[1].data[1].value = res.visibilityMin
 environmentIndex.value[1].data[1].sustain = res.visibilityTime

 environmentIndex.value[2].data[0].value = res.brightness
 environmentIndex.value[2].data[1].value = res.brightnessMin
 environmentIndex.value[2].data[1].sustain = res.brightnessTime

 environmentIndex.value[3].data[0].value = res.windSpeed
 environmentIndex.value[3].data[1].value = res.windSpeedMax
 environmentIndex.value[3].data[1].sustain = res.windSpeedTime
}
onMounted(()=>{
  getEnvironmentalIndicators()
  getTemplateData()
  deviceDataInfo()
})
</script>
<style lang="less" scoped>
.environment-box {
  color: #fff;

  .environment-item {


    .environment-item-title {
      font-size: 14px;
    }

    .environment-item-list {
      display: flex;
      justify-content: space-between;
    }

    .environment-item-data {
      width: 150px;
      height: 50px;
      background: rgba(142, 172, 206, 0.1);
      margin-bottom: 8px;
      padding: 0 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;

      .environment-item-data-label {
        font-size: 14px;
      }

      .environment-item-box {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        align-items: center;

        .environment-item-value {
          font-weight: bold;
        }
      }
    }
  }
}
.chart{
  height: 200px;
}
.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
}
.policeList{
  height: auto;
}
</style>
