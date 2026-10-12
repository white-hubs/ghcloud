<template>
  <GLayout class="check-detail" title="盘点详情">
    <template #content-table>
      <Tabs v-model:activeKey="activeKey">
        <TabPane key="1" tab="基本信息">
          <CheckDetailBase :id="id" />
        </TabPane>
        <TabPane key="2" tab="盘点任务">
          <CheckDetailTask :id="id" />
        </TabPane>
        <TabPane key="3" tab="盘点明细">
          <CheckDetailInfo :id="id" />
        </TabPane>
      </Tabs>
    </template>
    <template #footer-page>
      <Button @click="back">返回</Button>
    </template>
  </GLayout>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'
import CheckDetailBase from './components/check-detail-base.vue';
import CheckDetailInfo from './components/check-detail-info.vue';
import CheckDetailTask from './components/check-detail-task.vue';
import { ref } from 'vue'
const { id } = useRoute().query as {id:string;}
const activeKey = ref('1')
const back=()=>{
  window.history.back()
}
</script>
<style scoped lang="less">
.check-detail{
  :deep(.content-search){
    display: none !important;
  }
}
:deep(.asset-management-tabs){
  height: 100%;
  .asset-management-tabs-content{
    height: 100%;
  }
}
</style>
