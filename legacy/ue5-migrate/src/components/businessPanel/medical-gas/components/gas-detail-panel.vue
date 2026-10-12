<template>
  <SubPanelTemplate title="气体使用明细" class="device-statistics">
    <div class="device-statistics-table">
      <div class="table-header">
        <span>时间</span>
        <span>气体名称</span>
        <span>使用量（m³）</span>
      </div>
      <div class="table-body">
        <vue3-seamless-scroll :list="chartData" :step="step" hover :singleHeight="36"
          :waitTime="waitTime">
          <div class="item" v-for="(item, index) in chartData" :key="index"
            :style="{ backgroundColor: index % 2 === 0 ? 'rgba(171,177,189,0.12)' : '' }">
            <span>{{ item.time }}</span>
            <span>{{ item.label }}</span>
            <span>{{ item.value }}</span>
          </div>
        </vue3-seamless-scroll>
      </div>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll';
import scrollParmas from "@/components/businessPanel/public/rollTable/scrollParmas";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { getGasDetail } from "@/mock/medical-gas"

const props = withDefaults(defineProps<{
  fromPage: FromPageType;
}>(), {
  fromPage: 'PARK'
})

const { step, waitTime } = scrollParmas()
const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const chartData = ref<{ label: string; value: number; time?: string }[]>([]);

const getTemplateData = () => {
  // TODO  接口调用
  const { timeType } = trendTime.value
  chartData.value = getGasDetail({formPage: props.fromPage, timeType: timeType as TimeType})
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
.device-statistics {
  .device-statistics-table {
    .table-header {
      width: 100%;
      height: 36px;
      background: rgba(86, 142, 255, 0.2);
      border-radius: 0px 0px 0px 0px;
      opacity: 1;
      border: 1px solid rgba(86, 142, 255, 0.302);
      display: flex;
      align-items: center;

      span {
        // width: 25%;
        flex: 1;
        text-align: center;
        line-height: 36px;
        font-weight: 400;
        color: #FFFFFF;
        font-size: 14px;
      }
    }

    .table-body {
      overflow: hidden;
      height: 214px;

      .item {
        height: 36px;
        font-size: 12px;
        font-weight: 400;
        color: #D9E7FF;
        line-height: 36px;
        display: flex;

        span {
          // width: 25%;
          flex: 1;
          text-align: center;

          &:last-child {
            color: #FFC700
          }

          img {
            max-width: 100%;
            max-height: 100%;
          }
        }
      }
    }
  }
}
</style>