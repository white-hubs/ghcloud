<template>
  <div class="deviceList">
    <div class="deviceBox" v-for="(item, index) in props.dataList" :key="index">
      <div class="titleBox">
        <span class="drop" v-show="item.color" :style="{ background: item.color }"></span>
        <span>{{ item.title }}</span>
      </div>
      <div class="ringRatio">
        <span>{{ item.value }}</span>
        <div class="row" v-if="item.ringRatio">
          <!-- uptriangle 向上三角根据Prop改变 -->
          <div :class="['downtriangle', Number(item.label) > 0 && 'uptriangle']"></div>
          <div :class="[Number(item.label) > 0 ? 'up' : 'down']">
            {{ item.label + item.unit }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AlarmRateList } from "./types";

interface Props {
  dataList: AlarmRateList[];
}
const props = withDefaults(defineProps<Props>(), {});
</script>
<style lang="less" scoped>
.deviceList {
  .deviceBox {
    margin-top: 10px;
    width: 140px;
    height: 60px;
    background: rgba(108, 128, 151, 0.1);
    color: #fff;
    padding: 6px 0 10px 19px;

    .titleBox {
      font-size: 12px;
      position: relative;

      .drop {
        position: absolute;
        width: 8px;
        height: 8px;
        background: #2989ff;
        border-radius: 50%;
        top: 5px;
        left: -12px;
      }
    }

    .ringRatio {
      display: flex;
      align-items: center;
      justify-content: space-between;

      span {
        font-size: 24px;
      }

      .row {
        display: flex;
        align-items: center;
        font-size: 16px;
      }

      .downtriangle {
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 8px solid #d2fff3;
        margin-right: 3px;
        transform: rotate(180deg);
      }

      .uptriangle {
        border-bottom: 8px solid #ffcece;
        transform: rotate(0deg);
      }
    }
  }
}
</style>
