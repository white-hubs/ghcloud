<template>
  <SubPanelTemplate title="小散工程记录">
    <div class="monitorPanelBox">
      <monitorPanel
        v-for="(item, index) in monitorPanelData"
        :key="item.name"
        :monitorPanelData="item"
        @handel-click-itemize="handelClickDevice(index)"
      ></monitorPanel>
    </div>
    <div class="elevator-analysis">
      <LineChart class="line_char" :x-data="xData.arr" :series="series"></LineChart>
    </div>
  </SubPanelTemplate>
  <small-engineering-table
    :showModal="showModalSmall"
    @close="showModalSmall = false"
    :parameter="parameterSmall"
  ></small-engineering-table>
</template>

<script setup lang="ts">
import moment from "moment";
import { ref, reactive, onMounted } from "vue";

import LineChart from "../../public/lineChart.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import monitorPanel from "../components/monitor-panel.vue";
import smallEngineeringTable from "../components/small-engineering-table.vue";
import { projectNumStatistics, projectTrendStatistics } from "@/api/maintain";

const showModalSmall = ref(false);
const parameterSmall = reactive({
  type: "",
  status: "",
  period: "",
  submitTime: "",
});

//小散工程记录==================================================================================================
const monitorPanelData = ref([
  {
    imgPath: "overView5.png",
    value: 0,
    name: "小散工程总数",
    color: "rgba(41, 137, 255, 1)",
  },
  {
    imgPath: "overView87.png",
    value: 0,
    name: "小散工程异常数",
    color: "rgba(255, 171, 16, 1)",
  },
]);
const series = reactive([
  {
    data: [10, 12, 34, 5, 12],
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
    smooth: false,
  },
]);
const xData = reactive({
  arr: ["1时", "2时", "3时", "4时", "5时"],
});

const getSmallEngineeringData = async () => {
  const res = await projectNumStatistics({
    period: moment().startOf("year").format("YYYY-MM-DD 00:00:00") + "," + moment().endOf("year").format("YYYY-MM-DD HH:mm:ss"),
  });
  const data = await projectTrendStatistics();
  monitorPanelData.value[0].value = res.total;
  monitorPanelData.value[1].value = res.abnormal;
  xData.arr = [];
  series[0].data = [];
  data.forEach((item) => {
    xData.arr.push(item.month + "月");
    series[0].data.push(item.num);
  });
};

const handelClickDevice = (item?: any) => {
  if (item === 0) {
    parameterSmall.status = "";
  } else {
    parameterSmall.status = "ABNORMAL";
  }
  parameterSmall.period =
    moment().startOf("year").format("YYYY-MM-DD 00:00:00") + "," + moment().endOf("year").format("YYYY-MM-DD HH:mm:ss");
  showModalSmall.value = true;
};

onMounted(() => {
  getSmallEngineeringData();
});
</script>

<style lang="less" scoped>
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.monitorPanelBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.line_char {
  width: 100%;
  height: 200px;
}
</style>
