
<template>
  <SubPanelTemplate title="群控组实时数据" class="visiting-data">
    <template #extra>
      <a style="color: #5EA6FF;" @click="handleAll" >全部>></a>
    </template>
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
  <!-- 照明群控弹窗 -->
  <GroupControlModal title="照明群控" :showModal="deviceModalShow" @close="closeModal" :footer="null"/>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import GroupControlModal from './group-control-modal.vue';
import { getAssetsImage } from '@/utils/getImage';
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { onMounted, onUnmounted, ref } from 'vue';
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { getGroupControl } from "@/mock/light"

const emit = defineEmits(["clickAll"]);

const props = withDefaults(defineProps<{
  fromPage: FromPageType;
}>(), {
  fromPage: 'PARK'
})

const deviceModalShow = ref<boolean>(false);
const handleAll = (text:string) => {
  deviceModalShow.value = true
  emit("clickAll");
}
const closeModal = () => {
  deviceModalShow.value = false;
};

const imgList = ['control1.png', 'control2.png', 'control3.png', 'control4.png']
const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const chartData = ref<{ label: string; value: number; color?: string; img?: string }[]>([]);

const getTemplateData = () => {
  // TODO  接口调用
  const { timeType } = trendTime.value
  chartData.value = getGroupControl({formPage: props.fromPage, timeType: timeType as TimeType})
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
.contanier{
  background: url("/resource/v1/ue5-sn-migrate/assets/images/business-icon/triage-queue/5.png");
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
  :deep(.sub-panel-content) {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .item {
      width: 49%;
      height: 60px;
      margin-bottom: 15px;
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