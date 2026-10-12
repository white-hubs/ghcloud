<template>
  <div style="width: 100vw;background: #f3f7fa ">
    <van-tabs v-model:active="active" v-if="!isSubmit">
      <van-tab title="表单信息" name="0">
        <div class="tab">
          <DynamicTableAdd v-if="processType === DynamicTableProcessType.ADD" :business-type="businessType!" @success="(val)=>{isSubmit=val}"/>
          <DynamicTableHandling v-else-if="processType === DynamicTableProcessType.HANDLING" :process-id="processId!" />
        </div>
      </van-tab>
      <van-tab title="审批流程" name="1" :disabled="processType === DynamicTableProcessType.ADD">
        <div class="tab">
         <Process></Process>
        </div>
      </van-tab>
    </van-tabs>
    <div v-else style="display: flex;flex-direction: column;align-items: center;margin-top: 100px;">
      <van-icon name="checked" color="var(--van-primary-color)" size="80"/>
      <p >发起成功</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import DynamicTableAdd from './components/dynamic-table-add.vue'
import { useRoute } from 'vue-router'
import { DynamicTableRoute,DynamicTableProcessType } from '../dynamic-table/dynamic-table'
import DynamicTableHandling from './components/dynamic-table-handling.vue'
import Process from './components/process.vue'
const active=ref('0')
const isSubmit=ref(false)
const { query: { processType, businessType, processId,notOperates } } = useRoute() as DynamicTableRoute
</script>
<style scoped lang="less">
.tab{
  height: 94vh; overflow:auto;width: 100% 
}
</style>