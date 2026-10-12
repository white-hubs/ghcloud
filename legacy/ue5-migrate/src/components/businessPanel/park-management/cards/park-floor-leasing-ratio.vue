<template>
  <SubPanelTemplate title="园区楼层租赁比情况">
    <template #extra>
      <a-select ref="select" v-model:value="areaData" style="width: 80px" @change="getParkFloors">
        <a-select-option v-for="item in areaList" :value="item.id">{{ item.name }}</a-select-option>
      </a-select>
    </template>
    <div class="charts">
      <stackedColumn :unit="'%'" :xData="buildUtilization.xData" :yData="buildUtilization.yData"></stackedColumn>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import { getAreaList } from "@/api/mdata";
import { parkFloors } from "@/api/park";
import stackedColumn from "@/components/businessPanel/public/charts/stacked-column/stackedColumn.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const areaList = ref([]);
const areaData = ref();
const buildUtilization = reactive({
  xData: [],
  yData: [
    {
      name: "已租赁",
      data: [],
    },
    {
      name: "未租赁",
      data: [],
    },
  ],
});

const getAreaListData = async () => {
  const res = await getAreaList();
  areaList.value = res[0].children;
  areaData.value = areaList.value[0].id;
};

const getParkFloors = async () => {
  const res = await parkFloors(areaData.value);
  buildUtilization.xData = res.map((item) => {
    return item.areaName;
  });
  buildUtilization.yData[0].data = res.map((item) => {
    return item.rentedAreaRate;
  });
  buildUtilization.yData[1].data = res.map((item) => {
    return item.unleasedAreaRate;
  });
};

onMounted(async () => {
  await getAreaListData();
  getParkFloors();
});
</script>

<style lang="less" scoped>
.charts {
  height: 240px;
}
</style>
