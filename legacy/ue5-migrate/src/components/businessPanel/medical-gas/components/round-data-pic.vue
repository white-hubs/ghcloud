<template>
  <div class="contanier">
    <div class="dotted"></div>
    <a-progress :stroke-color="{ '0%': '#2C8BFF', '100%': '#B2D4FF', }" :percent="percent" type="circle"
      strokeLinecap="square" trailColor="rgba(255, 255, 255, 0.1)">
      <template #format="percent">
        <img :src="props.img" class="icon" />
        <slot></slot>
      </template>
    </a-progress>
  </div>
</template>
<script setup lang="ts">
const props = withDefaults(defineProps<{
  img?: string,
  percent?: number
}>(), {
  percent: 75,
});
</script>
<style lang="less" scoped>
.contanier {
  width: 44px;
  height: 44px;
  position: relative;
  margin-right: 9px;

   .dotted {
    content: "";
    width: 30px;
    height: 30px;
    display: block;
    border: 1px dotted rgba(86, 142, 255, 0.4);
    border-radius: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    // transform: translate(-50%, -50%);
    margin-top: -15px;
    margin-left: -15px;
    animation: rotate 10s infinite linear;
  }
  .icon {
    width: 20px;
    height: 20px;
    animation: rotate 10s 5s infinite linear;
  }

  :deep(.ant-progress) {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 44px;
      height: 44px;
      transform: translate(-50%, -50%) rotate(-25deg);
      .ant-progress-text {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .ant-progress-inner {
        display: contents;
      }
    }
}
</style>