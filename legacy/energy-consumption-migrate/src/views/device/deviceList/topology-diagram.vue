<template>
  <div class="topology-diagram">
    <Form class="topology-filter" layout="inline" style="margin-top: 10px">
      <FormItem label="能耗分类">
        <Select
          placeholder="请选择"
          v-model:value="instrumentType"
          style="width: 180px"
          :options="classifyList"
          :field-names="{ label: 'categoryName', value: 'categoryCode' }"
        >
        </Select>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="search">查询</Button>
        <Button style="margin-left: 10px" @click="reset">重置</Button>
      </FormItem>
    </Form>
    <div class="topology-scroll">
      <div v-if="topology && topology[0] && topology[0].length === 0" class="noData">暂无数据！</div>
      <e-tree v-else class="contractTable" :treeData="topology" @click-series="clickSeries"></e-tree>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { onMounted } from "vue";

import { getTopologyDiagram } from "@/api/device";
import { EnergyCollectConfigList } from "@/api/energyOverview";
onMounted(async () => {
  getStructureTableList();
  topologyDiagramData();
});
const topology = ref();
const instrumentType = ref("electricity_meter");
const classifyList = ref([]);
const search = () => {
  topology.value = [];
  topologyDiagramData();
};
const reset = () => {
  instrumentType.value = "electricity_meter";
  topologyDiagramData();
};
const clickSeries = (data: { id: string; deviceId: string; instrumentType: string }) => {
  if (data.id)
    history.pushState(
      {},
      "",
      `/portal/energy-consumption/device/detail?id=${data.id}&deviceId=${data.deviceId}&instrumentType=${data.instrumentType}`,
    );
};
const topologyDiagramData = async () => {
  const { data } = await getTopologyDiagram({ instrumentType: instrumentType.value });
  topology.value = data;
  topology.value = [
    {
      label: {
        formatter: "设备拓扑",
      },
      children: data,
    },
  ];
};
const getStructureTableList = async () => {
  const { data } = await EnergyCollectConfigList();
  classifyList.value = data;
};
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
.topology-diagram {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.topology-filter {
  flex: none;
}

.topology-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.contractTable {
  width: 100%;
  min-width: 0;
}
.noData {
  width: 100%;
  text-align: center;
}
</style>
