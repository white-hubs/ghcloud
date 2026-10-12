<template>
  <SubPanelTemplate title="设备统计" class="device-statistics">
    <DeviceStatistics @handelClickItemize="handelClickItemize" imgPath="business-icon/triage-queue/6.png" :statistic="deviceStatisticsData"></DeviceStatistics>
    <div class="device-statistics-table">
      <div class="table-header">
        <span>类型图片</span>
        <span>设备类型</span>
        <span>设备总数</span>
        <span>离线数</span>
      </div>
      <div class="table-body">
        <vue3-seamless-scroll :list="deviceStatisticsData.list" :step="step" hover :singleHeight="36"
          :waitTime="waitTime">
          <div class="item" v-for="(item, index) in deviceStatisticsData.list" :key="index"
            :style="{ backgroundColor: index % 2 === 0 ? 'rgba(171,177,189,0.12)' : '' }">
            <span>
              <img :src="item.img">
            </span>
            <span>{{ item.typeName }}</span>
            <span>{{ item.total }}</span>
            <span>{{ item.offlineNum }}</span>
          </div>
        </vue3-seamless-scroll>
      </div>
    </div>
  </SubPanelTemplate>
  <modal-equipmentAll-table :show-modal="deviceAllModalShow" @close="deviceAllModalShow = false"
    :parameter="deviceAllParameter"></modal-equipmentAll-table>
</template>
<script setup lang="ts">
import DeviceStatistics from './device-statistics.vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { getAssetsImage } from '@/utils/getImage';
import { onUnmounted, reactive, ref } from 'vue';
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll';
import scrollParmas from "@/components/businessPanel/public/rollTable/scrollParmas";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import { useStateStore } from '@/pages/state/use-state-store';

const { step, waitTime } = scrollParmas()
/**
 * 设备统计
 */
const deviceStatisticsData = reactive({
  title: "设备总数",
  total: 3345,
  itemize: [
    {
      label: "离线",
      value: 234,
      key: "OFFLINE",
    }
  ],
  list: [
    { img: getAssetsImage('overView5.png'), typeName: "监控设备", total: '333', offlineNum: '33' },
    { img: getAssetsImage('overView5.png'), typeName: "叫号机", total: '33', offlineNum: '33' },
    { img: getAssetsImage('overView5.png'), typeName: "签到机", total: '233', offlineNum: '33' },
    { img: getAssetsImage('overView5.png'), typeName: "叫号机", total: '33', offlineNum: '33' },
  ]
});

const handelClickItemize = ()=>{
  deviceAllModalShow.value = true
}
const deviceAllModalShow = ref<boolean>(false);
const { globalState } = useStateStore()
const deviceAllParameter = reactive({
  areaId:globalState.business.currentAreaId,
  tagCodes:[`custom.app::visual.${globalState.business.currentMenu}`],
  filterAreaIds:[],
  deviceState:undefined,
  dateRange:[],
})
let timer = null

onUnmounted(() => {
  clearInterval(timer)
})



</script>
<style scoped lang="less">
.device-statistics {
  .device-statistics-table {
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
        line-height: 36px;
        display: flex;

        span {
          width: 25%;
          text-align: center;

          &:last-child {
            color: #FFC700
          }

          img {
            max-width: 100%;
            max-height: 100%;
          }
        }
      }
    }
  }
}
</style>