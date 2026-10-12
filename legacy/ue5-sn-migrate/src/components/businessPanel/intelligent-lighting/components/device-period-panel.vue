<template>
  <SubPanelTemplate title="设备实时数据">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
    </template>
    <div class="appointment-data">
      <PlanPie :pieData="chartData">
        <div class="content">
          <div class="total-num">{{ totalNum }}</div>
          <div>设备总数</div>
        </div>
      </PlanPie>
      <PieList :roundPieData="listData"></PieList>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import PieList from "@/components/businessPanel/public/pieList.vue";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { onMounted, onUnmounted, ref } from 'vue';
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { getDevicePeriod } from "@/mock/light"

const props = withDefaults(defineProps<{
  fromPage: FromPageType;
}>(), {
  fromPage: 'PARK'
})

const trendTime = ref<ModelValueItf>();
const chartData = ref<{ label: string; value: number; color?: string }[]>([]);
const listData = ref<{ label: string; value: number; color?: string }[]>([])
const totalNum = ref(0)

const getTemplateData = () => {
  // TODO  接口调用
  const { timeType } = trendTime.value
  chartData.value = getDevicePeriod({formPage: props.fromPage, timeType: timeType as TimeType})

  const total = chartData.value.reduce(function (total, value) {
    return total + value.value;
  }, 0);

  listData.value = chartData.value.map(e => {
    return {
      ...e,
      label: e.label + `（${(e.value / total * 100).toFixed(2)}%）`
    }
  })
  totalNum.value = total

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
  // getTemplateData()
  changeTime()
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
<style scoped lang="less">
.appointment-data {
  display: flex;
  align-items: center;
  height: 100%;
  .content {
    text-align: center;
    color: #fff;
    font-size: 14px;

    .total-num {
      font-size: 16px;
    }
  }
  :deep(.policeList) {
    display: flex;
    flex-flow: column;
    justify-content: center;

    .thePolice {
      margin-bottom: 6px;
      // background: rgba(108, 128, 151, 0.1);
      background: rgba(171, 177, 189, 0.12);
      .thePoliceLeft {
        overflow: visible;
      }
    }
  }
}
</style>