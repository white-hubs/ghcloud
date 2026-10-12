<template>
  <SubPanelTemplate title="人车出入情况 ">
    <template #extra>
      <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime">
      </DateInlineForm>
    </template>
    <LightingRound class="LightingBox" :data="roundData"></LightingRound>
  </SubPanelTemplate>
  <SubPanelTemplate title="异常通行趋势" class="alarm-event">
    <template #extra>
      <DateInlineForm v-model:modelValue="through" @search="abnormalPassageInfo"></DateInlineForm>
    </template>
    <OperateDays :value="numberPasses" title="通行总次数"> </OperateDays>
    <div class="chart">
      <LineChart :x-data="echartsData.xData" :series="[
            {
              data: echartsData.yData,
              linearGradientColor: ['rgb(255, 162, 0.1)', 'rgb(255, 222, 165,1)'],
            },
          ]" />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import LineChart from "@/components/businessPanel//public/lineChart.vue";
import LightingRound from "@/components/businessPanel/intelligent-lighting/components/lighting-round.vue"
import { abnormalPassage } from '@/utils/requestData/accessControl'
import { ModelValueItf } from '../public/types'

const overviewTime = ref<ModelValueItf>()

let through = ref();
let numberPasses = ref(0);
const echartsData = reactive({
  xData: [],
  yData: [],
});
// 异常通行趋势
const abnormalPassageInfo = async () => {
  let res = await abnormalPassage(through.value.timeType, "DO_REFUSE");
  echartsData.xData = res.xdata;
  echartsData.yData = res.series[0].value;
  numberPasses.value = 0;
  res.series[0].value.forEach((item) => {
    numberPasses.value += item;
  });
};

const changeHandleOverviewTime = () => {
   
};
const roundData = ref([
    {
        statistic: { icon: 'overView13.png' },
        legendList: [
            { name: '进入', color: '#2AE8BD', value: 23 },
            { name: '离开', color: '#2989FF', value: 23 }
        ]
    },
    {
        statistic: { icon: 'overView30.png' },
        legendList: [
            { name: '进入', color: '#2AE8BD', value: 23 },
            { name: '离开', color: '#2989FF', value: 23 }
        ]
    },
])
</script>
<style lang="less" scoped>
.chart {
  height: 220px;
}
:deep(.LightingBox) {
    .info{
        position: relative;
        &::after{
            content: '';
            display: inline-block;
            height: 1px;
            border-top: 1px solid rgba(255,255,255,0.3);
            position: absolute;
            width: 200px;
            top: 72px;
            left: 116px;
        }
        &::before{
            content: '';
            display: inline-block;
            height: 1px;
            border-top: 1px solid rgba(255,255,255,0.3);
            position: absolute;
            top: 60px;
            left: 85px;
            width: 35px;
            transform: rotateZ(40deg);
        }
    }
    .roate {
      width: 57px !important;
      height: 57px !important;
    }
    .r1 {
        width: 80px !important;
        height: 80px !important;
    }

    .r2 {
        width: 70px !important;
        height: 70px !important;
    }

    .r3 {
        width: 70px !important;
        height: 70px !important;
        border-radius: 100%;
    }

    .item {
        height: 110px !important;
    }
    
    .icon {
      width: 30px !important;
      height: 30px !important;
    }
    .monitor{
        width: 180px !important;
        justify-content: space-between;
        margin-bottom: 10px;
    }
}
:deep(.round-wrap){
    flex-direction: column;
}
:deep(.round-wrap .info){
    flex-direction: row;
    justify-content: space-around;
}
</style>