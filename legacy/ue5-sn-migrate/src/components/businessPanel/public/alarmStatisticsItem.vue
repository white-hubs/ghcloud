<template>
  <div class="alarmStatisticsItem">
    <div class="title">
      <div>{{ props.name }}</div>
      <div class="title_line">
        <div :class="['level_line', useClass]"></div>
      </div>
    </div>
    <div class="content">
      <div class="count">{{ props.alarmNum }}</div>
      <div class="mode">{{ props.mode }}</div>
      <div :class="['downtriangle', props.isGrow && 'uptriangle']"></div>
      <div :class="[props.isGrow ? 'down' : 'up']">{{ props.chainRatio }}%</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 报警等级列表组件
import { withDefaults, computed, ComputedRef } from "vue";
interface Props {
  level: number;
  alarmNum: number;
  mode: string;
  isGrow: boolean;
  chainRatio: number;
  name: string;
}
const props = withDefaults(defineProps<Props>(), {
  level: 1,
  alarmNum: 0,
  mode: "环比",
  isGrow: true,
  chainRatio: 0,
  name: "一级报警",
});
const useClass: ComputedRef<string> = computed(() => {
  const classMap = new Map<number, string>([
    [1, "one_level"],
    [2, "second_level"],
    [3, "third_level"],
    [4, "fourth_level"],
  ]);
  return classMap.get(props.level);
});
</script>

<style lang="less" scoped>
.alarmStatisticsItem {
  width: 160px;
  margin-bottom: 20px;
  .title {
    color: #d9e7ff;
    font-size: 14px;
    display: flex;
    align-items: center;
    .title_line {
      flex: 1;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      position: relative;
      .one_level {
        background: #6ee3e1;
      }
      .second_level {
        background: #2e92e4;
      }
      .third_level {
        background: #2c4db0;
      }
      .fourth_level {
        background: #3a7cb0;
      }
      .level_line {
        width: 20px;
        height: 2px;
        position: absolute;
        bottom: -1px;
        right: 3px;
      }
    }
  }
  .content {
    margin-top: 5px;
    height: 38px;
    background: rgba(255, 255, 255, 0.1);
    padding: 9px 0 11px;
    display: flex;
    .count {
      font-size: 22px;
      line-height: 19px;
      color: #d9edff;
      margin-right: 7px;
    }
    .mode {
      font-size: 12px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      color: #d9e7ff;
      line-height: 22px;
      margin-right: 3px;
    }
    .downtriangle {
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-bottom: 8px solid #2ae8bd;
      margin-right: 3px;
      margin-top: 8px;
      transform: rotate(180deg);
    }
    .uptriangle {
      border-bottom: 8px solid #f14545;
      transform: rotate(0deg);
    }
    .up {
      color: #2ae8bd;
      font-family: Roboto-Regular, Roboto;
      font-size: 16px;
    }
    .down {
      color: #f14545;
      font-family: Roboto-Regular, Roboto;
      font-size: 16px;
    }
  }
}
</style>
