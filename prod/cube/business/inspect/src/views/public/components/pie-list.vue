<template>
  <div class="pieList">
    <div class="pieValue">{{ props.value }}</div>
    <div class="pieName">{{ props.name }}</div>
    <div class="ringRatio">
      <span>环比</span>
      <!-- uptriangle 向上三角根据Prop改变 -->
      <div :class="['downtriangle', Number(props.ratio?.slice(0, props.ratio?.length - 1)) > 0 && 'uptriangle']" />
      <div :class="[ Number(props.ratio?.slice(0, props.ratio?.length - 1)) > 0 ? 'up' : 'down']">{{ props.ratio }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  value:number | undefined;
  name:string;
  ratio:string | undefined;
}>(), {
  value: 0,
  name: '任务正常完成',
  ratio: '0'
});
</script>
<style scoped lang="less">
.pieList {
  text-align: center;

  .pieValue {
    min-width: 90px;
    height: 24px;
    font-size: 26px;
    font-weight: bold;
    color: #3D3D3D;
    line-height: 24px;
    margin-bottom: 10px;
  }

  .pieName {
    min-width: 84px;
    height: 21px;
    font-size: 14px;
    font-weight: 400;
    color: #999999;
    line-height: 21px;
    margin-bottom: 10px;
  }
}

.ringRatio {
  width: 96px;
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
}</style>
