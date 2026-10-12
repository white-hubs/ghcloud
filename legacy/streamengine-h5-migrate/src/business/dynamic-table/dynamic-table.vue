<template>
  <VanEmpty v-if="error" image="error" :description="errorMessage" />
  <template v-else-if="initialized">
    <DynamicTableAdd v-if="processType === DynamicTableProcessType.ADD" :business-type="businessType!" />
    <DynamicTableHandling v-else-if="processType === DynamicTableProcessType.HANDLING" :process-id="processId!" :business-type="businessType!"/>
    <VanEmpty v-else image="error" description="未知状态" />
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import { DynamicTableProcessType, DynamicTableRoute } from './dynamic-table'
import DynamicTableAdd from './dynamic-table-add.vue'
import DynamicTableHandling from './dynamic-table-handling.vue'

const { query: { processType, businessType, processId,notOperates } } = useRoute() as DynamicTableRoute
const initialized = ref(false)
const error = ref(false)
const errorMessage = computed(() => {
  if (error.value) {
    return '当前表单异常，请联系管理员'
  }
  return ''
})

onMounted(async () => {
  error.value = invalidQuery()
  initialized.value = true
  function invalidQuery () {
    if (processType === DynamicTableProcessType.ADD) {
      document.title = '发起审批'
      return !businessType
    }
    if (processType === DynamicTableProcessType.HANDLING) {
      document.title = '审批详情'
      return !processId
    }
    return true
  }
})

provide("notOperates", notOperates === 'true' ? true : false);
</script>

<style lang="less" scoped>
</style>
