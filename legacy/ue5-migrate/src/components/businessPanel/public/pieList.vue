<template>
  <div :class="['policeList', props.class]">
    <div
      class="thePolice"
      v-for="item in props.roundPieData"
      :key="item.color"
      @click="handelClick(item)"
    >
      <div :title="item.label?item.label:item.name">
        <span :style="{ background: item.color }" class="thePoliceColor"></span>
        <span class="thePoliceLeft" v-if="isArray(item.label) ||isArray(item.name) ">{{isArray(item.label)?item.label.split("(")[0]:item.name.split("(")[0] }}</span>
        <span class="thePoliceLeft" v-else>{{item.label || item.name }}</span>
        <span style="line-height: 20px" v-if="isArray(item.label) || isArray(item.name)">
          {{ character(item.label?item.label:item.name) }}
          {{ item.label?item.label.split("(")[1]:item.name.split("(")[1] }}</span
        >
      </div>
      <span style="flex: 1; display: flex; justify-content: space-around;">
        <span>
          <count-to v-if="typeof item.value === 'number' " :startVal="0" :endVal="item.value" :duration="1000" separator=""></count-to>
          <span v-else>{{ item.value }}</span>
          <span v-if="item.unit" style="margin-left: 2px;">{{ item.unit }}</span>
        </span>
        <span class="ratio" v-if="item.ratio">{{ item.ratio }}</span>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { isArray } from '@pansy/utils'
import countTo from "./count-to/count-to.vue";
import { computed } from "vue";
interface pieData {
  label?: string;
  code?: string;
  unit?: string;
  name?: string;
  color: string;
  value: number|string;
  ratio: number|string;
}
interface Props {
  roundPieData: pieData[];
  class?: string;
}
const emit = defineEmits(["handelClickItemize"]);
const character = computed(() => (value: string) => {
  if (value.indexOf("(") !== -1) {
    return "(";
  } else {
    return "";
  }
});
const handelClick = (item) => {
  emit("handelClickItemize", item);
};
const props = withDefaults(defineProps<Props>(), {});
</script>

<style lang="less" scoped>
.policeList {
  width: 100%;
  height: 168px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.thePolice {
  width: 100%;
  height: 24px;
  background: rgba(108, 128, 151, 0.5);
  border-radius: 0px 0px 0px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  padding: 0 4px;
  margin-bottom: 15px;
  cursor: pointer;
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
