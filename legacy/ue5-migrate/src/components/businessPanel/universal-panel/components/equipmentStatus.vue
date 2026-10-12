<template>
  <SubPanelTemplate title="设备状态统计">
    <OperateDays title="设备总数" :value="deviceTotal" />
    <div class="chart">
      <RingChart :pieData="pieData" seriesName="设备类型统计" :total="deviceTotal"></RingChart>
    </div>
    <div class="statistic">
      <div class="statistic-item" v-for="(item, index) in pieData">
        <a-statistic :value="item.value" :valueStyle="statisticStyle">
          <template #title>
            <div class="title flex-start">
              <div class="box" :style="statisticValueStyle(index)"></div>
              <span>{{ item.name }}</span>
            </div>
          </template>
          <template #suffix>
            <span>{{ item.ratio }}</span>
          </template>
        </a-statistic>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";

import RingChart from "../../public/charts/ring/ring.vue";
import OperateDays from "../../public/operateDays.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { statusStat } from "@/api/maintain";

const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
const deviceTotal = ref(0);
const pieData = ref([]);

const statisticValueStyle = computed(() => (index) => {
  return {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: colors[index % colors.length],
  };
});

const statisticStyle = computed(() => {
  return {
    fontSize: "16px",
    color: "#FFFFFF",
    paddingLeft: "16px",
  };
});

const getDeviceStatus = async () => {
  const res = await statusStat();
  pieData.value.length = 0;
  deviceTotal.value = 0;
  pieData.value = res.map((item, index) => {
    deviceTotal.value += item.num;
    return {
      name: item.name,
      value: item.num,
      color: colors[index],
    };
  });
};

onMounted(() => {
  getDeviceStatus();
});
</script>

<style lang="less" scoped>
.chart {
  width: 100%;
  height: 140px;
}
.statistic {
  display: grid;
  grid-column-gap: 10px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  margin-top: 10px;

  .title {
    font-size: 12px;
    color: #d0deee;

    .box {
      margin-right: 8px;
    }
  }
}
</style>
