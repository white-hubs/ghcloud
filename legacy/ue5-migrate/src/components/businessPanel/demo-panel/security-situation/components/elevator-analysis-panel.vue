
<template>
  <SubPanelTemplate title="电梯运行监测" class="visiting-data">
    <div class="item" v-for="item in chartData" :key="item.label">
      <div class="contanier">
        <img :src="item.img" class="aniamtion-electric-fan"/>
      </div>
      <a-statistic :title="item.label">
        <template #formatter>
          <count-to :startVal="0" :endVal="item.value" :duration="2000" separator=""></count-to>
        </template>
      </a-statistic>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { getAssetsImage } from '@/utils/getImage';
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { ModelValueItf } from '@/components/businessPanel/public/types';
import { getElevatorAnalysis } from "@/mock/security-situation"

const props = withDefaults(defineProps<{
  fromPage: FromPageType;
  chartHeight?: number;
}>(), {
  fromPage: 'PARK',
  chartHeight: 200
})
// 群控组实时数据
const visitingData = ref({
  appointment: { title: "电梯总数", value: 56, img: getAssetsImage('control1.png') },
  sign: { title: "停止", value: 6, img: getAssetsImage('control2.png') },
  waiting: { title: "运行", value: 45, img: getAssetsImage('control3.png') },
  visit: { title: "检修", value: 5, img: getAssetsImage('control4.png') },
})

const imgList = ['control1.png', 'control2.png', 'control3.png', 'control4.png']
const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const chartData = ref<{ label: string; value: number; color?: string; img?: string }[]>([]);

const getTemplateData = () => {
  // TODO  接口调用
  const { timeType } = trendTime.value
  chartData.value = getElevatorAnalysis({formPage: props.fromPage, timeType: timeType as TimeType})
  const total = chartData.value.reduce(function (total, value) {
    return total + value.value;
  }, 0);
  chartData.value.map((item, index) => {
    if (index === 0) {
      item.value = total
    }
    item.img = getAssetsImage(imgList[index] ?? 'control1.png')
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
.stacked-bar-chart {
  width: 100%;
  height: 300px;
}
:deep(.ant-statistic){
  display: flex;
  align-items: center;
  justify-content: space-around;
}
:deep(.ant-statistic-title){
  white-space: nowrap;
  margin-bottom: 0;
}
:deep(.ant-statistic-content){
  font-size: 14px !important;
  padding-left: 0 !important;
}
:deep(.grid-container){
  display: flex;
  width: 100%;
}
:deep(.grid-item){
  flex: 1;
}
:deep(.gh-count-to){
  color:#fff;
}
:deep(.sub-panel-content .item){
  margin-bottom: 15px !important;
}
.contanier{
  background: url("/resource/v1/ue5-migrate/assets/images/business-icon/triage-queue/5.png");
  background-size: 100%100%;
  width: 66px;
  height: 46px;
  position: relative;
  margin-right: 9px;
  img{
    position: absolute;
    width: 24px;
    height: 24px;
    left: 21px;
  }
}
.visiting-data {
  padding-top: 10px;
  :deep(.sub-panel-content) {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .item {
      width: 49%;
      height: 60px;
      margin-bottom: 5px;
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      padding-left: 23px;

      .ant-statistic {
        display: inline-flex;
        flex-flow: column-reverse;

        .ant-statistic-content {
          height: 29px;

          .ant-statistic-content-value {
            color: #5EA6FF;
            font-size: 22px;
            font-weight: 400;
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
</style>