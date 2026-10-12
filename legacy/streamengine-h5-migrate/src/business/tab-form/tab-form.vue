<template>
  <div id="tab-form" style="width: 100vw;background: #f3f7fa; height: calc(100vh - 46px);overflow-y: hidden;" v-if="initialized">
    <van-tabs id="init-tab" v-model:active="active" style="height: 100%;"	>
      <van-tab title="表单信息" name="0" style="height: 100%;">
        <div class="tab">
          <DynamicTableAdd v-if="processType === DynamicTableProcessType.ADD" :business-type="businessType!" :process-id="processId" isChildrenComponent/>
          <DynamicTableHandling  v-else-if="processType === DynamicTableProcessType.HANDLING" :process-id="processId!" isChildrenComponent/>
        </div>
      </van-tab>
      <van-tab title="审批流程" name="1" style="height: 100%;">
        <div class="tab">
         <Process :active="active"></Process>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, ref } from 'vue'
import DynamicTableAdd from '../dynamic-table/dynamic-table-add.vue'
import 'vant/es/notify/index.css'
import { useRoute } from 'vue-router'
import DynamicTableHandling from '../dynamic-table/dynamic-table-handling.vue'
import Process from '../process/process.vue'
import { DynamicTableRoute,DynamicTableProcessType } from '../dynamic-table/dynamic-table'
import bus from '../../infrastructure/bus'

const emits=defineEmits(['submit'])
const active=ref('0')
const taskQueen=JSON.parse(sessionStorage.getItem('taskQueen') as string)
const { query } = useRoute() as DynamicTableRoute
let businessType = query.businessType  ?? taskQueen?.[0]?.businessType??''
const processId=query.processId  ?? taskQueen?.[0]?.processId??''
const notOperates = query.notOperates 
const processType = ref((query.processType ?? '').toUpperCase())
const initialized = ref(false)

bus.on('handelRepeat',(type:unknown)=>{
  businessType=type
  processType.value = DynamicTableProcessType.ADD
})

onMounted(async () => {
  initialized.value = true
})
onBeforeUnmount(()=>{
  bus.off('handelRepeat')
})
provide("notOperates", notOperates === 'true' ? true : false);
provide("isChildrenComponent", true)
</script>
<style scoped lang="less">
.tab{
  height: 100%; overflow:auto;width: 100% 
}
:deep(.van-tabs__content){
  height: calc(100vh - 90px);
}
:deep(.dynamic-table){
  height: 100% !important;
  .form{
    height: calc(100% - 56px);
    overflow-y: auto;
  }
}
:deep(.process){
  height: 100% !important;
  overflow-y: auto;
}

</style>