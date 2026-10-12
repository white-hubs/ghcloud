<template>
  <div >
    <SubPanelTemplate title="今日气体使用概览" class="visiting-data">
      <div class="item" v-for="item in yData" :key="item.label">
        <RoundDataPic :img="item.img" />
        <a-statistic :title="item.label">
          <template #formatter>
            <count-to :startVal="0" :endVal="item.value" :duration="2000" separator=""></count-to>
            <span class="unit">m³</span>
            <div class="ringRatio">
              <span>环比</span>
              <!-- uptriangle 向上三角根据Prop改变 -->
              <div :class="['downtriangle', item.ratio > 0 && 'uptriangle']"></div>
              <div :class="[item.ratio > 0 ? 'up' : 'down']">{{ item.ratio.toFixed(2) + "%" }}</div>
            </div>
          </template>
        </a-statistic>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="气体用量情况">
      <template #extra>
        <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
      </template>
      <div class="body chart">
        <EventAlarmItem v-for="(item, index) in listData" :sort="index + 1" :name="item.name" :count="item.num"
          :ratio="item.ratio+ '%'" :modes="'m³'" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="气体使用趋势">
    <template #extra>
      <DateInlineForm v-model:modelValue="gasTime" @search="getGasData"></DateInlineForm>
    </template>
    <div class="chart">
      <LineChart :x-data="xDataGas" :series="yDataGas" :showLegend="true" :showBackground="true" :titles="titles"
        gridTop="15" :axisPointer="true" />
    </div>
  </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import RoundDataPic from "@/components/businessPanel/medical-gas/components/round-data-pic.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { ModelValueItf } from '../public/types'
import { getAssetsImage } from '@/utils/getImage'
import { gasUsageTrend, todayGasUsage, todayGasUsageTop } from '@/api/device'
import moment from 'moment'
import { useStateStore } from '@/pages/state/use-state-store';

const { globalState } = useStateStore()
const imgList = ['gas0.png', 'gas1.png', 'gas2.png', 'gas3.png', 'gas4.png', 'gas5.png']
const titles = ref([])
const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const gasTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const yData = ref<{label:string; value: number; ratio: number; img: string; }[]>([])
const listData = ref<{ name: string; num: number; ratio: number; }[]>([])
const xDataGas = ref<string[]>([])
const yDataGas = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([])
const getGasUsage = async ()=>{
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period:[moment().format('YYYY-MM-DD 00:00:00'),moment().format("YYYY-MM-DD HH:mm:ss")].join(",")
  }
  const res = await todayGasUsage(params)
  yData.value= res.map((item,index)=>{
    return{
      label:item.name,
      value:item.num,
      ratio:item.ratio,
      img:getAssetsImage(imgList[index]?imgList[index]:imgList[0])
    }
  })
}
const getTemplateData = async() => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: trendTime.value.dateRange.join(","),
    type: trendTime.value.timeType,
  }
  listData.value  = await todayGasUsageTop(params)
}
const getGasData = async() => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: gasTime.value.dateRange.join(","),
    type: gasTime.value.timeType,
  }
  const res = await gasUsageTrend(params)
  xDataGas.value = res.xtitle
  yDataGas.value.length = 0
  titles.value.length = 0
  
  for (const key in res.medicalGasDataVos) {
    const arr = []
    for (let i = 0; i < res.xtitle.length; i++) {
      arr.push(0)
    }
    res.xtitle.forEach((x,index)=>{
      res.medicalGasDataVos[key].forEach(item=>{
        if (x===item.timeFlag) {
          arr[index] = item.num
        }
      })
    })
    titles.value.push(key)
    yDataGas.value.push({name:key,data:arr})
  }
}
onMounted(()=>{
  getGasUsage()
})
</script>
<style lang="less" scoped>
.chart{
  height: 250px;
}
.body{
  height: 220px;
}
.visiting-data {
        height: 400px;
    :deep(.sub-panel-content) {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        margin: 15px 0;
        .item {
            width: 50%;
            height: 60px;
            margin-top: 30px;
            display: inline-flex;
            align-items: center;
            box-sizing: border-box;
            padding-left: 20px;

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
                    font-size: 12px;
                    margin: 0;
                }
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
.unit{
    display: inline-block;
    font-size: 12px;
    margin-left: 2px;
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
</style>