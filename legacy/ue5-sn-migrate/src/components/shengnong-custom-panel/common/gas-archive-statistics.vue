<template>
  <div class="wrapper">
    <NumberStatistics :data="props.totalData" @click="handleTotalClick" />
    <div class="more" v-if="showMore" @click="moreClick">查看更多></div>
    <div style="width: 100%; overflow: hidden; padding:4px" v-if="dataList.length !== 0">
      <vue3-seamless-scroll v-if="piniaStoreMarket.currentMarketName == ''&&isScroll" :list="dataList" :step="0.5" hover
        :singleHeight="40">
        <EventAlarmItem v-for="(item, index) in dataList" :showRatio="false" :item="item" :sort="item.rank"
          :ratio="item.ratio" :count="item.count" :name="item.name" :width="item.width" @click="clickRow(item)">
        </EventAlarmItem>
      </vue3-seamless-scroll>
      <div v-else>
        <EventAlarmItem v-for="(item, index) in dataList" :showRatio="false" :item="item" :sort="item.rank"
          :ratio="item.ratio" :count="item.count" :name="item.name" :width="item.width" @click="clickRow(item)">
        </EventAlarmItem>
      </div>
    </div>
    <noData v-else />
  </div>
</template>
<script setup lang="ts">
import { ref,watch,PropType } from 'vue'
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";
import { storeMarket } from '@/piniaStore/other'
import {  getcurrentData } from "@/utils/common";
import EventAlarmItem from "./sn-market-rank.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import NumberStatistics from "./number-statistics.vue";

const props = defineProps({
  data: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  totalData: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  isScroll: {
    type: Boolean,
    default: false
  },
  showMore: {
    type: Boolean,
    default: false
  },
});
const isScroll=ref(props.isScroll)
const piniaStoreMarket = storeMarket();
const dataList = ref(props.data);
const currentMarketName = ref(true);
const emit = defineEmits(["changeTabs","clickRow",'moreClick', 'totalClick']);
const clickRow = (record) => {
  emit('clickRow', record)
};
const handleTotalClick = (record) => {
  emit('totalClick', record)
};
const moreClick = () => {
  emit('moreClick')
};
watch(
  () => props.data,
  (n) => {
    dataList.value = n;
  }
)
</script>

<style lang="less" scoped>
.wrapper {
  // height: 265px;
  width: 100%;
  cursor: pointer;
  :deep(.container.grid) {
    grid-template-columns: repeat(1, 1fr);
  }

  :deep(.container .box) {
    justify-content: space-between;
  }

  :deep(.container .box .content) {
    flex: 1;
    flex-direction: row;
    justify-content: space-between;
    align-content: flex-end;
    align-items: center;
  }
}
.more {
  color:#93AADB;
  font-size: 14px;
  text-align: right;
  margin:4px;
  cursor: pointer;
}
</style>
