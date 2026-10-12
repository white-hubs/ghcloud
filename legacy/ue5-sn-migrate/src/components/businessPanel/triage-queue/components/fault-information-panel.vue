<template>
  <SubPanelTemplate title="故障信息">
    <div class="fault-information-table">
      <div class="table-header">
        <span>故障时间</span>
        <span>设备名称</span>
        <span>设备类型</span>
        <span>故障类型</span>
      </div>
      <div class="table-body">
        <vue3-seamless-scroll :list="faultInformationData" :step="step" hover :singleHeight="36" :waitTime="waitTime">
          <div class="item" v-for="(item, index) in faultInformationData" :key="index"
            :style="{ backgroundColor: index % 2 === 0 ? 'rgba(171,177,189,0.12)' : '' }">
            <div class="time">
              <p>{{ item.time }}</p>
              <!-- <p>{{ item.time.split(' ')[1] }}</p> -->
            </div>
            <span>{{ item.deviceName }}</span>
            <span>{{ item.typeName }}</span>
            <span>{{ item.faultTypeName }}</span>
          </div>
        </vue3-seamless-scroll>
      </div>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ref } from 'vue';
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll';
import scrollParmas from "@/components/businessPanel/public/rollTable/scrollParmas";

const { step, waitTime } = scrollParmas()

/**
 * 故障信息
 */
const faultInformationData = ref([
  { time: '05-20 15:22', typeName: "监控设备", deviceName: '1号监控', faultTypeName: '设备死机' },
  { time: '05-12 10:22', typeName: "叫号机", deviceName: '2号叫号机', faultTypeName: '设备死机' },
  { time: '04-15 11:22', typeName: "签到机", deviceName: '1号签到机', faultTypeName: '设备死机' },
  { time: '04-16 09:22', typeName: "叫号机", deviceName: '2号叫号机', faultTypeName: '设备死机' },
])


</script>
<style scoped lang="less">
.fault-information-table {
  .table-header {
    width: 100%;
    height: 36px;
    background: rgba(86, 142, 255, 0.2);
    border-radius: 0px 0px 0px 0px;
    opacity: 1;
    border: 1px solid rgba(86, 142, 255, 0.302);
    display: flex;
    align-items: center;

    span {
      width: 25%;
      text-align: center;
      line-height: 36px;
      font-weight: 400;
      color: #FFFFFF;
      font-size: 14px;
    }
  }

  .table-body {
    overflow: hidden;
    height: 144px;

    .item {
      height: 36px;
      font-size: 12px;
      font-weight: 400;
      color: #D9E7FF;
      display: flex;

      .time {
        width: 25%;
        text-align: center;
        display: flex;
        flex-flow: column;
        justify-content: center;

        p {
          margin: 0;
          line-height: 13px;
        }
      }

      span {
        width: 25%;
        text-align: center;
        line-height: 36px;
      }
    }
  }
}
</style>