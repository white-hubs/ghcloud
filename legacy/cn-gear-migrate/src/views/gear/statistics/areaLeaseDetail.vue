<template lang="pug">
g-layout(title="区域出租")
  template(#content-table)
    .detail-form
      a-form(layout="inline" :model="form"  ref="formRef")  
        .item-title 区域信息
        a-form-item(label="区域名称")
        a-form-item(label="区域编号")
        .item-title 出租情况
        div.centerData#centerData
</template>

<script lang='jsx'>
import { defineComponent, inject, onMounted } from "vue";

export default defineComponent({
  setup() {
    const echarts = inject("echarts");

    onMounted(() => {
      let myCharts1 = echarts.init(document.getElementById("centerData"));
      myCharts1.setOption({
        legend: {},
        tooltip: {},
        dataset: {
          source: [
            ["product", "2012", "2013", "2014", "2015", "2016", "2017"],
            ["肉类区", 41.1, 30.4, 65.1, 53.3, 83.8, 98.7],

            ["肉类区", 41.1, 30.4, 65.1, 53.3, 83.8, 98.7],

            ["蔬菜区", 86.5, 92.1, 85.7, 83.1, 73.4, 55.1],
            ["水果区", 24.1, 67.2, 79.5, 86.4, 65.2, 82.5],
            ["水果区", 24.1, 67.2, 79.5, 86.4, 65.2, 82.5],
            ["水产区", 55.2, 67.1, 69.2, 72.4, 53.9, 39.1],

            ["水产区", 55.2, 67.1, 69.2, 72.4, 53.9, 39.1],
            ["海鲜区", 55.2, 67.1, 69.2, 72.4, 53.9, 39.1],

            ["干货区", 55.2, 67.1, 69.2, 72.4, 53.9, 39.1],

            ["冻品区", 55.2, 67.1, 69.2, 72.4, 53.9, 39.1],
          ],
        },
        title: [
          {
            subtext: "进场商家总数:",
            left: "10%",
            top: "85%",
            textAlign: "center",
          },
          {
            subtext: "进场车次:",
            left: "35%",
            top: "85%",
            textAlign: "center",
          },
        ],
        series: [
          {
            type: "pie",
            radius: 55,
            // radius: ['40%', '70%'],
            center: ["10%", "50%"],
            encode: {
              itemName: "product",
              value: "2012",
            },
            // No encode specified, by default, it is '2012'.
            label: {
              //去除饼图的指示折线label
              // position: "inside",
              formatter: "{d}%",
            },
            labelLine: {
              show: true,
            },
          },
          {
            type: "pie",
            radius: 55,
            center: ["35%", "50%"],
            encode: {
              itemName: "product",
              value: "2013",
            },
            label: {
              //去除饼图的指示折线label
              position: "inside",
              formatter: "{d}%",
            },
          },
        ],
      });
    });
    return {};
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
#centerData {
  width: 100%;
  height: 300px;
}
</style>
