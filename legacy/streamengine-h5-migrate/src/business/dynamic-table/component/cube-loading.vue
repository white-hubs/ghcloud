<template>
  <transition name="van-fade">
    <div class="loader-bg" v-show="props.visible">
      <div class="loader"></div>
    </div>
  </transition>
</template>
<script setup lang="ts">
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
</script>
<style scoped less>
.loader-bg{
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 2000;
  top: 0;
  left: 0;
  background-color: #ffffffb0;
}
.loader {
  width: 10vw;
  aspect-ratio: 1;
  --c: no-repeat linear-gradient(#1C66FF 0 0);
  background: 
    var(--c) 0%  50%,
    var(--c) 25%  50%,
    var(--c) 50%  50%,
    var(--c) 75%  50%,
    var(--c) 100% 50%;
  animation: l7 1s infinite linear alternate;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2000;
  transform: translate(-50%,-50%);
  transform-style: preserve-3d;
  &::before{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%,-50%,-1px);
    width: 30vw;
    height: 20vw;
    background-color: #ffffff50;
    backdrop-filter: blur(0px);
    box-shadow: inset 1px 1px 1px #ffffff90, 2px 2px 15px #00000026;
    border-radius: 2vw;
    content: '';
    z-index: -1;
  }
}
@keyframes l7 {
  0%  {background-size: 15% 50% ,15% 50% ,15% 50% }
  20% {background-size: 15% 15% ,15% 50% ,15% 50% }
  40% {background-size: 15% 100%,15% 15% ,15% 50% }
  60% {background-size: 15% 50% ,15% 100%,15% 15% }
  80% {background-size: 15% 50% ,15% 50% ,15% 100%}
  100%{background-size: 15% 50% ,15% 50% ,15% 50% }
}                
</style>