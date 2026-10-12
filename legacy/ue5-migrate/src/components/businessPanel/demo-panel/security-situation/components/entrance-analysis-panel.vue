<template>
  <SubPanelTemplate title="门禁通行情况">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
    </template>
    <DisplayPanel :bg-img="'overView47.png'" :content-list="listData"></DisplayPanel>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import DisplayPanel from "@/components/businessPanel/public/display-panel.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { getDoorData } from "@/mock/security-situation"

const props = withDefaults(defineProps<{
  fromPage: FromPageType;
}>(), {
  fromPage: 'PARK'
})

const trendTime = ref<ModelValueItf>({ timeType: 'TODAY', dateRange: [] });
const chartData = ref<{ label: string; value: number; color?: string }[]>([]);
const listData = ref<{ name: string; value: number; color?: string }[]>([])

const getTemplateData = () => {
  // TODO  接口调用
  const { timeType } = trendTime.value
  chartData.value = getDoorData({ formPage: props.fromPage, timeType: timeType as TimeType })

  listData.value = chartData.value.map((item, index) => {
    return {
      name: item.label,
      value: item.value,
    }
  })
  const total = chartData.value.reduce(function (total, value) {
    return total + value.value;
  }, 0);
  listData.value.unshift({
    name: '通行总数（次）',
    value: total
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
:deep(.showPanel) {
  height: 220px;
  margin: 10px 0;
}
</style>