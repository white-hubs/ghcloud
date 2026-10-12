<template>
  <div class="palte">
    <div v-for="(item,index) in props.data" :key="index" class="palteBox flex">
      <div>{{ item.name }}</div>
      <div class="flex">
        <div :style="{color:colors[index]}" style="font-weight: bold;font-size: 24px;">{{ item.value }}</div>
        <div v-if="item.ratio" class="ringRatio">
          <span>环比</span>
          <!-- uptriangle 向上三角根据Prop改变 -->
          <div :class="['downtriangle', item.ratio > 0 && 'uptriangle']" />
          <div :class="[ item.ratio > 0 ? 'up' : 'down']">{{ item.ratio + "%" }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const colors = ['#000000', '#1890FF', '#FBA33F', '#FD683E']
const props = withDefaults(defineProps<{
  data:{
    value:number;
    name:string;
    ratio?:number;
  }[];
}>(), {
  data: () => [{ value: 1, name: '巡检任务(个)', ratio: 5 }]
});

</script>
<style scoped lang="less">
.flex{
  display: flex;
justify-content: space-between;
align-items: center;
}
.palte{
  margin-top: 10px;
  margin-right: 16px;
display: flex;
align-items: center;
  .palteBox{
    width: 395px;
  height: 64px;
  background: linear-gradient(50deg, #F7FAFF 0%, rgba(245,249,255,0.22) 37%, #F7FAFF 100%);
  border-radius: 6px;
  padding: 24px;
  margin:0 5px;
  }
}

.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;
  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin: 0 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
  }

  .down {
    color: #2ae8bd;
    font-family: Roboto-Regular, Roboto;
  }

  .up {
    color: #f14545;
    font-family: Roboto-Regular, Roboto;
  }
}
</style>
