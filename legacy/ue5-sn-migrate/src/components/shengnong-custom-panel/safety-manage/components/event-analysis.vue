<template>
  <div class="wrapper">
    <div v-if="risk.length !== 0" style='display: flex;'>
      <div class="card">
        <img :src="getSnImage('aq-1.png')" width='65' height='75' alt="">
        <div class="title">巡更任务总数</div>
        <div><span class='value'>{{data.totalNum}}</span><span class='unit'>个</span></div>
      </div>
      <div style="flex:1;overflow: hidden; height: 220px">
        <EventAnalysisItem v-for="(item, index) in risk" :sort="item.rank" :ratio="item.ratio" :count="item.count"
          :lineColor="item.lineColor" :name="item.name" :width="item.width" @click="clickRow(item)" />
      </div>
    </div>
    <noData v-else />
  </div>
</template>
<script setup lang="ts">
import { ref,watch,PropType } from 'vue'
import { getSnImage } from '@/utils/getImage'
import { storeMarket } from '@/piniaStore/other'
import {  getcurrentData } from "@/utils/common";
import EventAnalysisItem from "./event-analysis-item.vue";
import noData from "@/components/businessPanel/public/noData.vue";
const props = defineProps({
  data: {
    type: Object,
    default: () =>{}
  },
});
const piniaStoreMarket = storeMarket();
const risk = ref([
]);
const currentMarketName = ref(true);
const emit = defineEmits(["clickRow"]);

const clickRow = (record) => {
  emit('clickRow', record)
};
watch(
  () => piniaStoreMarket.currentMarketName,
  (n) => {
    if (n == "") {
      currentMarketName.value = true;
    } else {
      currentMarketName.value = getcurrentData(risk.value, n);
    }
  }
);
watch(
  () => props.data,
  (n) => {
    risk.value = n? n.statList:[];
  },
  {
    immediate: true,
  }
)
</script>

<style lang="less" scoped>
.wrapper {
  // height: 258px;
 
}
:deep(.eventItem){
  padding: 3px;
  margin-bottom: 8px;
}
.card {
  min-width: 130px;
  height: 224px;
  text-align: center;
  padding: 0px;
  margin-right: 4px;
  .title {
    font-size: 16px;
    font-family: Source Han Sans CN, Source Han Sans CN-Medium;
    font-weight: Medium;
    color: #93aadb;
  }

  .value {
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-image: -webkit-linear-gradient(top, rgba(255, 255, 255, 1), rgba(161, 191, 252, 1));
    font-size: 36px;
    font-family: D-DIN, D-DIN-Regular;
    font-weight: bold;
  }

  .unit {
    font-size: 12px;
    margin-left: 4px;
    -webkit-text-fill-color: #899ba9;
    color: #899ba9 !important;
  }

  .ratio {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    font-size: 16px;

    .modes {
      font-size: 14px;
      font-family: Source Han Sans CN, Source Han Sans CN-Regular;
      font-weight: Regular;
      text-align: center;
      color: #899ba9;
    }

    .up {
      font-size: 13px;
      color: #f14545;
    }

    .down {
      font-size: 13px;
      color: #2ae8bd;
    }
  }
}
</style>
