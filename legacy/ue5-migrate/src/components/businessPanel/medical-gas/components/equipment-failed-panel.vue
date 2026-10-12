<template>
  <SubPanelTemplate title="设备离线率">
    <div class="faultBox">
        <LightingRound class="LightingRoundBox" :data="roundData"></LightingRound>
        <div class="faultBox-right">
            <faultBox :data="faultData"></faultBox>
        </div>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import LightingRound from "@/components/businessPanel/intelligent-lighting/components/lighting-round.vue";
import faultBox from "@/components/businessPanel/operation/faultBox.vue"
import { onMounted, onUnmounted, ref } from 'vue';
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { getEquipmentFailed } from "@/mock/medical-gas"

const props = withDefaults(defineProps<{
  fromPage: FromPageType;
}>(), {
  fromPage: 'PARK'
})

const roundData = ref([
    {
        statistic: { title: '故障率', total: '40.00%' },
    }
])
const faultData = ref<{name: string; value: number; color: string}[]>([])

const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const chartData = ref<{ label: string; value: number; color?: string }[]>([]);
const listData = ref<{ label: string; value: number; color?: string }[]>([])
const colorList = ['#2989FF', '#FFC700']

const getTemplateData = () => {
  // TODO  接口调用
  const { timeType } = trendTime.value
  chartData.value = getEquipmentFailed({formPage: props.fromPage, timeType: timeType as TimeType})
  
  chartData.value.map((item, index) => {
    return {
      label: item.label,
      value: item.value,
      color: colorList[index] ?? '#FFAB10',
    }
  })

  roundData.value[0].statistic.total = (chartData.value[1].value / chartData.value[0].value * 100).toFixed(2) + '%'
  faultData.value = chartData.value.map((e,i) => {
    return {
      name: e.label,
      value: e.value,
      color: colorList[i]
    }
  })
}

// 模拟动态数据
let timer = null
let timeList = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR']
let index = 1
const changeTime = () => {
  timer = setInterval(() => {
    trendTime.value.timeType = timeList[index]
    getTemplateData()
    index++;
    if (index > timeList.length - 1) {
      index = 0
      // return
    }
  }, window.config.pageLoopRequestTime)
}

onMounted(() => {
  getTemplateData()
  changeTime()
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
<style scoped lang="less">

.faultBox {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    .LightingRoundBox{
        flex:1
    }
    .faultBox-value {
        padding-left: 10px;
    }
}
:deep(.faultBox .faultBox-value) {
   padding-left: 10px;
}
</style>