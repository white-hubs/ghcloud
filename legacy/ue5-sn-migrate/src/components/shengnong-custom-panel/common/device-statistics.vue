<template>
  <div class="wrapper">
    <NumberStatistics :data="props.data.headData" skin="row-cell" @click="handleClickNumber"/>
    <div class="device-statistics" v-if="props.data.headData.length !== 0">
      <div class="chart">
        <simple-pie
          :pieData="props.data.pieData"
          :splitLine="false"
          simple
          style="width: 155px"
          @clickbar="handleClickPie"
        >
          <div class="value" @click="handleClickPie">
            {{ props.data.headData[0].value }}
          </div>
          <div style="color: #a5b6da; text-align: center; font-size: 12px">设备总数</div>
        </simple-pie>
      </div>
      <elevatorAnalysisList
        :contentList="props.data.pieData"
        :hideRatio="true"
        @handlecurrent="handleClick"
      ></elevatorAnalysisList>
    </div>
    <noData v-else />
  </div>
</template>
<script setup lang="ts">
import { ref,watch,PropType } from 'vue'
import { storeMarket } from '@/piniaStore/other'
import {  getcurrentData } from "@/utils/common";
import SimplePie from "@/components/businessPanel/public/charts/pie/simple-pie.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import NumberStatistics from "../common/number-statistics.vue";
import { getallNumber } from "@/utils/common";
import elevatorAnalysisList from "@/components/businessPanel/public/sn-elevator-list.vue";
interface DataType{
  width:number,
  ratio:string,
  count:number,
  name:string,
  rank:number ,
  value: number;
  unit?: string | undefined;
  icon?: string | undefined;
  color?: "blue" | "green" | "yellow" | "red";
}
const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {}
    }
  },
  isScroll: {
    type: Boolean,
    default: false
  }

});
const piniaStoreMarket = storeMarket();
const risk = ref(props.data.headData);
const currentMarketName = ref(true);
const emit = defineEmits(["changeTabs","clickRow",'clickNumber', 'clickPie']);
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
    risk.value = n;
  }
)
const handleClickNumber = (item) => {
  emit("clickNumber", item);
};
const handleClickPie = (item) => {
  emit("clickPie", item);
};
const handleClick = (item) => {
  emit("clickRow", item);
};
</script>

<style lang="less" scoped>
.wrapper{
  // min-height:265px;
  width:100%;
  .device-statistics {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
}
  .chart {
  flex: 1;
  height: 140px;
}
:deep(.container>div:nth-child(1)) {
 min-width:160px;
}
:deep(.container>div:not(:first-child)) {
  position: relative;
 padding-left: 30px !important;
 flex:1;
}
:deep(.container.row-cell .box:not(:first-child) .dot){
  left:24px;
}
:deep(.alarm-analysis-name){
  color:rgba(165,182,218,1) !important;
}
:deep(.alarm-analysis){
color: #ffffff;
width: 220px;
}
}
.value {
  color: #fff; text-align: center; font-size: 32px;
  font-family: D-DIN, D-DIN-Regular;
  font-weight: bold;
  line-height: 32px;
  cursor: pointer;
}
</style>
