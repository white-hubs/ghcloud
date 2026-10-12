<template>
  <div :class="['policeList', props.class]">
    <div class="thePolice" v-for="(item, index) in props.roundPieData" :key="colors[index]" @click="handelClick(item)">
      <div :title="item.name">
        <span :style="{ background: colors[index] }" class="thePoliceColor"></span>
        <span class="thePoliceLeft">{{ character(item) }}</span>
      </div>
    </div>
  </div>
</template>
  
<script lang="ts" setup>
import { reactive, computed } from "vue";
import { AlarmLevelType } from "@/api/models/alarm";
interface pieType {
  alarmNum: number;
  name: string
}
interface Props {
  roundPieData: pieType[];
  class?: string;
}
const colors = ['#6ce3e3', '#397caf', '#2c91e5', '#2c4cb2']
const emit = defineEmits(["handelClickItemize"]);
const character = computed(() => (value: pieType) => {
  let data = JSON.parse(JSON.stringify(value))
  let courseDataTotal = 0
  props.roundPieData.forEach(item => {
    courseDataTotal += item.alarmNum
  })
  if (courseDataTotal === 0) {
    data.name = data.name + '(0%)'
  } else {
    data.name = data.name + '(' + (data.alarmNum / courseDataTotal * 100).toFixed(1) + "%)"
  }
  return data.name
});

const handelClick = (item) => {
  emit("handelClickItemize", item);
};
const props = withDefaults(defineProps<Props>(), {});
</script>
  
<style lang="less" scoped>
.policeList {
  width: 100%;
  flex-wrap: wrap;
  display: flex;
  justify-content: space-between;
  overflow: auto;
}

.thePolice {
  width: 166px;
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
  