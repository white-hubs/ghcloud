<template>
  <div class="patrolBox">
    <div class="patrolBox_item" v-for="item in patrol">
      <div class="patrolBox_item_title">{{ item.title }}</div>
      <div class="patrolBox_item_bg">
        <CountTo :startVal="0" :endVal="item.value" separator="" :duration="4000" class="scroll-number" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import CountTo from "../../public/count-to/count-to.vue";

interface Props {
  patrol: {
    title: string;
    value: number;
  }[];
}
const props = defineProps<Props>();
</script>
<style lang="less" scoped>
.patrolBox {
  display: flex;
  justify-content: space-between;
  .patrolBox_item {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    height:150px;

    .patrolBox_item_title {
      font-size: 12px;
      font-weight: 400;
      color: #FFFFFF;
      background: linear-gradient(270deg, rgba(41,112,255,0) 0%, rgba(41,137,255,0.7) 54%, rgba(41,112,255,0) 100%);
    }

    .patrolBox_item_bg {
      background-image: url('../../../../assets/images/business-icon/triage-queue/8.png');
      background-size: 100% 100%;
      width: 82px;
      height: 86px;
      position: relative;

      .scroll-number {
        color: #fff;
        font-family: YouSheBiaoTiHei, YouSheBiaoTiHei;
        font-size: 28px;
        position: absolute;
        top: 20%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
}
</style>