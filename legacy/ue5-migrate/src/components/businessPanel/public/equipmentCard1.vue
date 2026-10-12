<template>
  <div class="equipmentCard">
    <div class="top">
      <div :class="['dot', status === 'warning' ? 'warningbg' : 'successbg']"></div>
      <div class="name">{{ props.title }}</div>
    </div>
    <div class="bottom">
      <div :class="['line', status === 'warning' ? 'warningbg' : 'successbg']"></div>
      <div :class="['counts', status === 'warning' ? 'warning' : 'success']">
        <count-to :startVal="0" :endVal="0" :duration="4000" class="scroll-number"></count-to>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { withDefaults } from "vue";
import { CountTo } from "vue3-count-to";
interface Props {
  title: string;
  count: number;
  status: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: "正常运行设备",
  count: 7822,
  status: "warning",
});
</script>
<style lang="less">
.equipmentCard {
  width: 160px;
  height: 58px;
  background: rgba(0, 0, 0, 0.15);
  padding: 6px 12px 13px 12px;
  .warningbg {
    background: #ffc700 !important;
  }
  .successbg {
    background: #00f27b !important;
  }
  .top {
    display: flex;
    align-items: center;
    .dot {
      width: 4px;
      height: 4px;
      background: #00f27b;
      margin-bottom: 4px;
      margin-right: 6px;
    }
    .name {
      color: #d0deee;
      font-size: 12px;
    }
  }
  .bottom {
    display: flex;
    .line {
      width: 1px;
      height: 23px;
      background: rgba(0, 242, 123, 0.2);
      margin-right: 7px;
      transform: scaleX(0.5);
      margin-left: 1.25px;
      opacity: .2;
    }
    .counts {
      color: #00f27b;
      font-size: 18px;
    }
    .warning {
      color: #ffc700 !important;
    }
    .success {
      color: #00f27b !important;
    }
  }
}
</style>