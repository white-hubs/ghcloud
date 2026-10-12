<template>
  <div class="list">
    <div v-for="(item,index) in props.data" :key="index" class="listBox">
      <div class="listBox-left">
        <div class="roundDot" :style="{background:colors[index]}" />
        <div class="text">{{ item.planType }}</div>
      </div>
      <div class="listBox-right">{{ item.planNum }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProportionOfPlanTypes } from '@/api/model/inspection'

const colors = ['#5654F5', '#4CA8FF', '#F53F3F', '#FBA33F', '#F53F3F', '#FBA33F']
const props = withDefaults(defineProps<{
  data: ProportionOfPlanTypes[] | undefined;
}>(), {
  data: () => []
});
</script>
<style scoped lang="less">
.list{
.listBox{
  margin-top: 10px;
  width: 200px;
display: flex;
justify-content: space-around;
align-items: center;
.listBox-left{
  display: flex;
  justify-content: space-around;
align-items: center;
}
.roundDot{
  width: 8px;
height: 8px;
border-radius: 50%;
margin-right: 5px;
}
.listBox-right{
  font-weight: bold;
}
}
}
</style>
