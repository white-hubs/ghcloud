<template>
  <div class="wrapper">
    <div v-if="risk.length !== 0" style='display: flex;'>
      <div class="left">
        <div class="card" @click="clickTotal" >
          <img :src="getSnImage('icon-1.png')" class="total-icon" alt="">
          <div class="title">报警总数</div>
          <div class="total-value">
            <span class='value'>
              <count-to :startVal="0" :endVal="Number(data?.totalNum)" :duration="2000" separator="" class="count" />
            </span>
            <span class='unit'>个</span>
          </div>
          <div class="ratio">
            <div class="modes">环比</div>
            <div> <img :src="data.totalRatio > 0?getSnImage('up.png'):getSnImage('down.png')" alt=""> </div>
            <div :class="[data.totalRatio > 0 ? 'up' : 'down']"> 
              <!-- {{ ( data?.totalRatio || 0)+ "%" }} -->
              <count-to :startVal="0" :endVal="Math.round(Number(data?.totalRatio))" :duration="2000" separator="" class="count" />%
            </div>
          </div>
        </div>
      </div>
      <div style="flex:1;overflow: hidden;" class="right">
        <EventAnalysisItem v-for="(item, index) in risk" :sort="item.rank" :ratio="item.ratio" :linkRatio="item.ratio" :count="item.count"
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
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue"

const props = defineProps({
  data: {
    type: Object,
    default: () =>{}
  },
});
const piniaStoreMarket = storeMarket();
const risk = ref([
]);
const alarmTotal = ref({
  totalRatio:0,
  totalNum:0
})
const currentMarketName = ref(true);
const emit = defineEmits(["clickRow", "clickTotal"]);

const clickRow = (record) => {
  emit('clickRow', record)
};
const clickTotal = (record) => {
  emit('clickTotal', record)
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
  // min-height: 268px;
  cursor: pointer;
}
:deep(.eventItem){
  padding: 6px;
  margin-bottom: 10px;
  overflow: hidden;
  &:last-child{
    margin-bottom: 0;
  }
}
.right{
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.left{
  background: url("/resource/v1/ue5-sn-migrate/assets/images/sn/stat_bg.png") no-repeat;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  margin-right: 8px;
}
.total-icon{
  width: 75px;
  height: auto;
}
.total-value{
  display: flex;
  flex-direction: column;
}
.card {
  min-width: 130px;
  // height: 224px;
  text-align: center;
  padding: 0px;

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
:deep(.eventItem){
  padding: 10px 6px;
  margin-bottom: 6px;
}
</style>
