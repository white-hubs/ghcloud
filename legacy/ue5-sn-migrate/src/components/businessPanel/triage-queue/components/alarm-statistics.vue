<template>
  <div class="alarm-statistics">
    <div class="item" v-for="(item, i) in props.statisticsData" :key="i">
      <CaretRightOutlined :style="{ fontSize: '14px', color: item.color }" class="arrow" />
      <div class="info">
        <span class="value" :style="{ color: item.color }">
          <count-to :startVal="0" :endVal="item.value" :duration="2000" separator=""></count-to>
        </span>
        <span class="event-name">{{ item.eventName }}</span>
        <span class="rate" :style="{ color: item.rate > 0 ? '#F14545' : '#2AE8BD' }">
          <CaretRightOutlined :style="{ fontSize: '12px', color: item.rate > 0 ? '#FFCECE' : '#D2FFF3' }"
            :rotate="item.rate > 0 ? -90 : 90" />
          <count-to :startVal="0" :endVal="item.rate" :duration="2000" separator="" decimals="2"></count-to>%
        </span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { CaretRightOutlined } from '@ant-design/icons-vue';
import CountTo from "../../public/count-to/count-to.vue";

const props = withDefaults(defineProps<{
  statisticsData: { eventName: string, value: number, rate: number, color: string }[]
}>(), {
  statisticsData: () => []
})
</script>
<style scoped lang="less">
.alarm-statistics {
  width: 100%;
  height: 68px;
  background: rgba(0, 0, 0, 0.15);
  display: flex;

  .item {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    &:after {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      width: 1px;
      height: 30px;
      border-left: 1px dashed rgba(255, 255, 255, 0.2);
      content: '';
    }

    :deep(.arrow) {
      margin-top: -20px;
      margin-right: 3px;
    }

    .info {
      display: flex;
      flex-flow: column;
      justify-content: center;
      text-align: center;

      .value {
        font-size: 20px;
        font-weight: 400;
        line-height: 10px;
      }

      .event-name {
        font-size: 12px;
        font-weight: 400;
        color: #D0DEEE;
        margin-top: 4px;
      }

      .rate {
        font-size: 12px;
        font-weight: 400;
        line-height: 0;
      }
    }
  }

  :nth-last-child(1) {
    &:after {
      display: none;
    }
  }
}
</style>