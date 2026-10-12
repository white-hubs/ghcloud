<template>
  <div class="char-dom" ref="charDom"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { storeMarket } from "@/piniaStore/other";
import { render } from "./snchart.ts";
import {EChartsType} from "echarts";

const piniaStoreMarket = storeMarket();
const charDom = ref();
const props = defineProps<{
  yData: { name: string; value: number[]; color: string }[];
  xData: string[];
  sn?: boolean;
}>();
const emit = defineEmits(["clickbar"]);
const rerender = () => {
  if (!charDom.value) {
    return
  }
  const currentMarketName = piniaStoreMarket.currentMarketName
  if (currentMarketName === "") {
    const chart = render(charDom.value, props.xData, props.yData, props.sn);
    chart.dispatchAction({
      type: "hideTip",
      seriesIndex: 0,
      dataIndex: 0,
    });
    chart.on("click", function (params) {
      emit("clickbar", params);
    });
  } else {
 
    if(props.yData[0].marketlist.xdata.length===1){
      const xdata = props.yData[0].marketlist.xdata;
      const chart = render(
      charDom.value,
      props.xData,
      props.yData,
      props.sn
    );
      const currentMarketNameIndex=xdata[0].findIndex((item) => item === currentMarketName)
    chart.dispatchAction({
      type: "showTip",
      seriesIndex: 0,
      dataIndex: currentMarketNameIndex,
    });

    chart.on("click", function (params) {
      emit("clickbar", params);
    });
    return
    }
    const xdata = props.yData[0].marketlist.xdata;

    
    const currentSliceIndex = getcurrentData(xdata, currentMarketName)
    
    props.yData.forEach(item => {
      item.value = item.marketlist.ydata[currentSliceIndex]
    })

    const chart = render(
      charDom.value,
      xdata[currentSliceIndex],
      props.yData,
      props.sn
    );

    const currentMarketNameIndex=xdata[currentSliceIndex].findIndex((item) => item === currentMarketName)
    chart.dispatchAction({
      type: "showTip",
      seriesIndex: 0,
      dataIndex: currentMarketNameIndex,
    });

    chart.on("click", function (params) {
      emit("clickbar", params);
    });
  }
}
watch(
  () => [...props.xData],
  () => {
    rerender()
  }
);

watch(
  () => [...props.yData],
  () => {
    rerender()
  },
  { deep: true }
);
watch(
  () => piniaStoreMarket.currentMarketName,
  () => {
      rerender()
    }
);
const getcurrentData = (list, target) => {
  let foundIndex = 0;
  for (let i = 0; i < list.length; i++) {
    for (let j = 0; j < list[i].length; j++) {

      if (list[i][j] === target) {

        foundIndex = i; // 将索引添加到数组中
      }
    }
  }
  return foundIndex;
};
onMounted(() => {
  if (charDom.value) {
    let chart = render(charDom.value, props.xData, props.yData, props.sn);

    // chart.dispatchAction({
    //     type: "showTip",
    //     seriesIndex: 0,
    //     dataIndex: 0,
    // });

    chart.on("click", function (params) {
      emit("clickbar", params);
    });
  }
});
</script>
<style lang="less" scoped>
.char-dom {
  width: 100%;
  height: 100%;
  min-height: 180px;
}
</style>
