<template>
  <div >
    <SubPanelTemplate title="气体用量情况">
      <template #extra>
        <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
      </template>
      <div class="body chart">
        <EventAlarmItem v-for="(item, index) in listData" :sort="index + 1" :name="item.label" :count="item.value"
          :ratio="item.ratio.toFixed(2) + '%'" :modes="'次'" />
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
  <SubPanelTemplate title="科室使用量概况" class="visiting-data">
      <template #extra>
        <DateInlineForm v-model:modelValue="dosageTime" @search="getDosageData"></DateInlineForm>
      </template>
    <div class="chart">
        <RoundPie :pieData="pieData"/>
    </div>
  </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { ModelValueItf } from '../public/types'
import { getAssetsImage } from '@/utils/getImage'
import RoundPie from "@/components/businessPanel/medical-gas/components/round-pie.vue";

const titles = ['氧气','二氧化碳']
const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const gasTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const dosageTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
  const pieData = ref<{name:string; value:number;}[]>([
    {
        name: '手术室',
        value: 45
    },
    {
        name: '预麻室',
        value: 50
    },
    {
        name: '恢复室',
        value: 20
    },
    {
        name: '清创室',
        value: 20
    },
    {
        name: '妇产科科室',
        value: 30
    },
    {
        name: 'ICU科室',
        value: 50
    },
])
const listData = ref<{ label: string; value: number; ratio: number; }[]>([])
const xDataGas = ref<string[]>(['1','2','3','4'])
const yDataGas = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([
{
    name:'氧气',
    data:[31,12,3,24,5]
  }, {
    name:'二氧化碳',
    data:[12,2,23,4,25]
  },
])

const getTemplateData = () => {}
const getGasData = () => {}
const getDosageData = () => {}
</script>
<style lang="less" scoped>
.chart{
  height: 300px;   
    width: 100%;
}
.body{
  height: 220px;
}
.visiting-data {
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