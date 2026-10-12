<template>
  <SubPanelTemplate :title="noticeArr.title || '公告信息'">
    <div class="notification-box" v-if="noticeArr.title">
      <div class="notification-head">
        <div class="notification-level">{{ noticeArr.levelName }}</div>
        <div class="notification-title">
          <div>{{ noticeArr.typeName }}</div>
          <div class="notification-time">
            <span>{{ noticeArr.noticeTime }}</span>
          </div>
        </div>
      </div>
      <div class="notification-body">
        <div 
        :class="['scroll-text',clientHeight<200 && 'disable-animation']" 
        :style="{'animation-duration':animationTime+'s'}" ref="scrollTextRef" v-html="noticeArr.content"></div>
      </div>
    </div>
    <noData v-else></noData>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, watch} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import noData from "@/components/businessPanel/public/noData.vue";

const animationTime = ref(0)
const clientHeight = ref(0)
const scrollTextRef = ref()
const props = withDefaults(defineProps<{
  noticeArr: any;
}>(), {
  noticeArr: {
    title:'',
    levelName:'',
    typeName:'',
    noticeTime:'',
  }
})
watch(()=>props.noticeArr,()=>{
  setTimeout(() => {
    animationTime.value = calcAnimationTime()
  }, 500);
},{deep:true})
const calcAnimationTime = ()=>{
  const SPEED = 10
   clientHeight.value =  scrollTextRef.value?.clientHeight ?? 0;
  
  const time =  clientHeight.value / SPEED
  return time
}

</script>
<style lang="less" scoped>
.notification-box {
  .notification-head {
    padding-right: 6px;
    display: flex;
    color: #fff;
    font-size: 16px;

    .notification-level {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      text-align: center;
      line-height: 40px;
      color: #000;
      background-color: #fff;
    }

    .notification-title {
      flex: 1;
      margin-left: 8px;

      .notification-time {
        display: flex;
        justify-content: space-between;
      }
    }
  }

  .notification-body {
    color: #fff;
    word-wrap: break-word;
    height: 250px;
    overflow: hidden;
    .scroll-text{
      font-size: 16px;
      padding: 10px;
      animation: scroll 10s linear infinite;
    }
    .disable-animation {
        animation: unset;
      }
  }
  @keyframes scroll {
    0% {
      transform: translateY(0);
    }

    100% {
      transform: translateY(-100%);
    }
  }
}
</style>