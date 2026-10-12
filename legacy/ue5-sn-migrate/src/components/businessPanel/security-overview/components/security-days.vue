<template>
  <div class="container">
    <img :src="icon" class="icon">
    <span class="title">安全运营天数</span>
    <div class="days-area">
      <span v-for="i in days" :key="i">{{ i }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
const icon = '/resource/v1/ue5-sn-migrate/components/businessPanel/security-overview/assets/security-days-icon.png'
import dayjs from 'dayjs'

const startTime = window.config?.systemStartTime ?? '2021-01-01'
const days = ref(dayjs().diff(startTime, 'day').toString())

let timer = null

onMounted(()=>{
  timer = setInterval(()=>{
    days.value = dayjs().diff(startTime, 'day').toString()
  })
})
onBeforeUnmount(()=>{
  timer && window.clearInterval(timer)
})
</script>
<style scoped lang="less">
.container {
  position: fixed;
  left: 50%;
  top: 104px;
  transform: translateX(-50%);
  color: white;
  display: flex;
  align-items: center;

  .icon {
    width: 18px;
  }

  .title {
    font-size: 16px;
    margin-left: 4px;
    margin-right: 20px;
  }

  .days-area {
    display: flex;
    justify-content: center;
    align-items: center;
    span {
      margin-right: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 44px;
      font-family: dsdigitalbold;
      font-weight: 700;
      width: 40px;
      height: 50px;
      background: linear-gradient(180deg, rgba(41, 137, 255, 0.16) 0%, rgba(34, 115, 214, 0.7) 100%);
      box-shadow: inset 0px 0px 10px 0px rgba(41, 137, 255, 0.4);
      border-radius: 0px 0px 0px 0px;
      opacity: 1;
      border: 1px solid;
      border-image: linear-gradient(180deg, rgba(231.3053074479103, 241.93470507860184, 255, 0.20000000298023224), rgba(221.15044355392456, 236.33527994155884, 255, 0.699999988079071)) 1 1;
    }
  }
}
</style>