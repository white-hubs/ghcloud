<template>
  <GLayout class="device-list-layout" title="设备列表" :showFooter="false">
    <template #content-table>
      <Tabs class="device-list-tabs" @change="tabsChange" v-model:activeKey="activeKey">
        <TabPane key="0" tab="列表">
          <div class="device-list-pane">
            <device-list />
          </div>
        </TabPane>
        <TabPane key="1" tab="拓扑图">
          <div class="topology-pane">
            <topology-diagram v-if="activeKey === '1'" />
          </div>
        </TabPane>
      </Tabs>
    </template>
  </GLayout>
</template>
<script setup lang="ts">
import { ref } from "vue";

import deviceList from "./device-list.vue";
import topologyDiagram from "./topology-diagram.vue";
const activeKey = ref("0");
const tabsChange = (value: any) => {
  activeKey.value = value;
};
</script>
<style lang="less" scoped>
.device-list-layout {
  min-height: 0;
  height: 100%;
  flex-wrap: nowrap;

  :deep(.layout-content) {
    min-height: 0;
    height: auto;
    flex: 1;
  }

  :deep(.content-right),
  :deep(.content-table) {
    min-height: 0;
  }

  :deep(.content-table) {
    overflow: hidden;
  }
}

.device-list-layout .device-list-tabs {
  display: flex;
  flex-direction: column;
  height: calc(100% - 100px);
  margin: 10px;

  :deep(.energy-tabs-nav),
  :deep(.ant-tabs-nav) {
    flex: none;
  }

  :deep(.energy-tabs-content-holder),
  :deep(.ant-tabs-content-holder) {
    min-height: 0;
    height: auto;
    flex: 1;
    overflow: hidden;
  }

  :deep(.energy-tabs-content),
  :deep(.energy-tabs-tabpane),
  :deep(.ant-tabs-content),
  :deep(.ant-tabs-tabpane) {
    min-height: 0;
    height: 100%;
  }
}

.device-list-pane {
  min-height: 0;
  height: 100%;
}

.topology-pane {
  min-height: 0;
  height: 100%;
  padding-bottom: 20px;
  box-sizing: border-box;
}
</style>
