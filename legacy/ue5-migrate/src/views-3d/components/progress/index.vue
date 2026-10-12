<template>
  <div class="container">
    <div class="progress">
      <div class="out-progress">
        <div class="inner-progress" :style="{transform:`translateX(${progress-100}%)`}"></div>
      </div>
      <div class="progress-bar-text">
        <span>加</span>
        <span style="animation-delay: 0.3s">载</span>
        <span style="animation-delay: 0.6s">中</span>
        <span style="animation-delay: 0.9s">.</span>
        <span style="animation-delay: 1.2s">.</span>
        <span style="animation-delay: 1.5s">.</span>
        <span style="animation-delay: 1.8s">.</span>
        <span style="animation-delay: 2.1s">.</span>
        <span style="animation-delay: 2.4s">.</span>
      </div>
    </div>
  </div>

</template>

<script setup lang='ts'>
import { reactive, toRefs, onMounted,defineProps } from 'vue';
const props = defineProps({
  progress:{
    type:Number,
    default:0
  }
})
/**
* 数据部分
*/
const state = reactive({})
onMounted(() => {
})
// 使用toRefs解构
// let { } = { ...toRefs(state) } 
defineExpose({
  ...toRefs(state)
})

</script>
<style scoped lang='less'>
.container {
  width: 100%;
  position: fixed;
  height: 100%;
  z-index: 9999;
  background-image: url("/resource/v1/ue5-migrate/views-3d/components/progress/loading-bg.jpg");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center center;

  .progress {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    width: 334px;
    color: #fff;
    text-align: center;

    .out-progress {
      height: 26px;
      background: rgba(0, 0, 0, 0.20);
      border: 0.6px solid rgba(50, 118, 255, 0.30);
      border-radius: 423px;
      overflow: hidden;
    }

    .inner-progress {
      width: 100%;
      height: 26px;
      transform: translateX(-320px);
      background: linear-gradient(270deg, #1de1ff, #105fff);
      border-radius: 286px;
    }

    .progress-bar-text span {
      margin-top: 10px;
      font-size: 18px;
      animation-duration: 3s;
      animation-iteration-count: infinite;
      animation-name: loading-text-bounce;
      transform-origin: center bottom;
      animation-fill-mode: both;
      display: inline-block;
    }
  }
}

@keyframes loading-text-bounce {
  0% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }

  10% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -10px, 0) scaleY(1.1);
  }

  20%,
  100% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }
}
</style>