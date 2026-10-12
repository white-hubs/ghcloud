import { EChartsType } from "echarts";
import { defineComponent } from "vue";
import { ref, onMounted, watch } from "vue";

import { render } from "./chart";
import { storeMarket } from "@/visualization-core/stores/other";

import styles from "./stacked-bar.module.less";

export const StackedBar = defineComponent({
  name: "StackedBar",
  props: {
    yData: { type: Array, required: true },
    xData: { type: Array, required: true },
    sn: { type: Boolean, required: false },
  },
  emits: ["clickbar"],
  setup(props, { emit }) {
    const piniaStoreMarket = storeMarket();
    const charDom = ref();
    const rerender = () => {
      if (!charDom.value) {
        return;
      }
      const currentMarketName = piniaStoreMarket.currentMarketName;
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
        const xdata = props.yData[0].marketlist.xdata;
        const currentSliceIndex = getcurrentData(xdata, currentMarketName);
        props.yData.forEach((item) => {
          item.value = item.marketlist.ydata[currentSliceIndex];
        });

        const chart = render(
          charDom.value,
          xdata[currentSliceIndex].map((item) => item.marketName),
          props.yData,
          props.sn,
        );

        const currentMarketNameIndex = xdata[currentSliceIndex].findIndex((item) => item.marketName === currentMarketName);
        chart.dispatchAction({
          type: "showTip",
          seriesIndex: 0,
          dataIndex: currentMarketNameIndex,
        });

        chart.on("click", function (params) {
          emit("clickbar", params);
        });
      }
    };
    watch(
      () => [...props.xData],
      () => {
        rerender();
      },
    );

    watch(
      () => [...props.yData],
      () => {
        rerender();
      },
      { deep: true },
    );

    watch(
      () => piniaStoreMarket.currentMarketName,
      () => {
        rerender();
      },
    );
    const getcurrentData = (list, target) => {
      let foundIndex = 0;
      for (let i = 0; i < list.length; i++) {
        for (let j = 0; j < list[i].length; j++) {
          if (list[i][j]["marketName"] === target) {
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

    return (): JSX.Element => <div class="char-dom" ref={charDom}></div>;
  },
});

export default StackedBar;
