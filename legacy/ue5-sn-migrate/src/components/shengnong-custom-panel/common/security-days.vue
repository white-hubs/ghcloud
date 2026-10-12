<template>
  <div class="container">
    <span class="title">安全监测天数</span>
    <div class="days-area">
      <img class="left" :src="getSnImage('day-l.png')" alt="">
      <div class="days-content">
        <span v-for="i in days" :key="i">
          <count-to :startVal="0" :endVal="Number(i)" :duration="2000" separator="" class="number-count" />
        </span>
      </div>
      <img class="left" :src="getSnImage('day-r.png')" alt="">
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import dayjs from 'dayjs'
import { getSnImage } from "@/utils/getImage";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue"

interface Props {
  systemStartTime: string;
} 
const props = withDefaults(defineProps<Props>(), {
  systemStartTime: "2020-08-13",
});
const startTime = props.systemStartTime
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
  flex-direction: column;

  .icon {
    width: 18px;
  }

  .title {
    font-size: 18px;
    font-family: Source Han Sans CN, Source Han Sans CN-Regular;
    font-weight: Regular;
    text-align: center;
    color: #d4e2ff;
    width: 200px;
    height: 24px;
    line-height: 24px;
    background: url("/resource/v1/ue5-sn-migrate/assets/images/sn/day-bg.png") no-repeat;
    background-size: 100% 100%;
  }

  .days-area {
    display: flex;
    justify-content: center;
    align-items: center;
    .days-content{
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 15px 20px;
      background: linear-gradient(90deg,rgba(0,34,61,0.00), rgba(36,141,250,0.09) 53%, rgba(9,49,114,0.00));
    
      background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/days-bg.png");
      background-position: bottom;
      background-size: cover;
      margin: 0 15px;
    }
    .days-content > span:nth-child(1){
      background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/day-s.png");
      background-size: contain;
      background-repeat: no-repeat;
      .number-count{
        background: none;
        border-image: none;
      }
    }
    .days-content > span:nth-last-child(1){
      background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/day-e.png");
      background-size: contain;
      background-repeat: no-repeat;
      .number-count{
        background: none;
        border-image: none;
        margin-right: 0;
      }
    }
    .number-count {
      margin-right: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 44px;
      font-weight: 700;
      width: 58px;
      height: 80px;
      border-radius: 0px 0px 0px 0px;
      opacity: 1;
      font-size: 54px;
      line-height: 80px;

      background: linear-gradient(0deg,#011539 29%, rgba(29,103,234,0.80));
      border: 1px solid transparent;
      border-image: linear-gradient(0deg, rgba(21,98,255,0.60), #c0d3ff 51%, rgba(21,98,255,0.60)) 1 1;
      
    }
  }
  .left{
    width: 34px;
    height: 104px;

  }
  .right{
    width: 34px;
    height: auto;

  }
}
</style>