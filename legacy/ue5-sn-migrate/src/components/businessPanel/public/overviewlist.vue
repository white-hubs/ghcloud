<template>
    <div class="policeList">
      <div class="thePolice" v-for="item in poprs.roundPieData" :key="item.color">
        <div :title="item.label">
          <span :style="{ background: item.color }" class="thePoliceColor"></span>
          <span class="thePoliceLeft">{{ item.label.split("(")[0] }} </span> <span style="margin-left: 3px;">{{ item.ratio }}%</span>
          <span style="line-height: 20px">
            {{ character(item.label) }}
            {{ item.label.split("(")[1] }}</span
          >
        </div>
        <span>{{ item.value }}</span>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { reactive, computed } from "vue";
  interface pieData {
    label: string;
    color: string;
    value: number;
    ratio:number
  }
  interface Props {
    roundPieData: pieData[];
  }
  const character = computed(() => (value: string) => {
    if (value.indexOf("(") !== -1) {
      return "(";
    } else {
      return "";
    }
  });
  const poprs = withDefaults(defineProps<Props>(), {});
  </script>
  
  <style lang="less" scoped>
  .thePolice {
    width: 200px;
    height: 24px;
    background: rgba(108, 128, 151, 0.5);
    border-radius: 0px 0px 0px 0px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    padding: 0 10px;
    margin-bottom: 15px;
  
    div {
      display: flex;
      align-items: center;
      .thePoliceLeft {
        margin-left: 5px;
        display: inline-block;
        max-width: 76px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
  
      .thePoliceColor {
        display: inline-block;
        width: 8px;
        height: 8px;
        background: #328bf7;
        border-radius: 50%;
      }
  
      span {
        font-size: 12px;
      }
    }
    span {
      font-weight: bold;
      font-size: 16px;
    }
  }
  
  .policeList .thePolice:last-child {
    margin-bottom: 0;
  }
  </style>
  