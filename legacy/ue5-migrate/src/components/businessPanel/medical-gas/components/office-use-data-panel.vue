<template>
  <SubPanelTemplate title="科室使用量概况" class="visiting-data">
      <template #extra>
        <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
      </template>
    <div class="chart">
        <RoundPie :pieData="pieData"/>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import RoundPie from "./round-pie.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { onMounted, onUnmounted, ref } from 'vue';
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { getOfficeUseData } from "@/mock/medical-gas"

const props = withDefaults(defineProps<{
  fromPage: FromPageType;
}>(), {
  fromPage: 'PARK'
})

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
const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const chartData = ref<{ label: string; value: number;}[]>([]);

const getTemplateData = () => {
  // TODO  接口调用
  const { timeType } = trendTime.value
  chartData.value = getOfficeUseData({formPage: props.fromPage, timeType: timeType as TimeType})
  pieData.value.map((item,index)=>{
    const data = chartData.value.map(item => item.value)
    const labelData = chartData.value.map(item => item.label)
    pieData.value[index].value = data[index]
    pieData.value[index].name = labelData[index]
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
.chart {
    height: 220px;
    width: 100%;
}
@keyframes rotate {
    from {
        transform: translate(-50%, -50%) rotate(0);
    }

    to {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}

.rotate {
    animation: rotate 15s infinite linear;
}

.reverse {
    animation-direction: reverse;
}
</style>