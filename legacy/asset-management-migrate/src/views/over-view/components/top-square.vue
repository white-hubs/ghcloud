<template>
  <div style="margin: 16px 0;display: flex;justify-content: space-between;">
    <div v-for="(item, i) in data" :key="i" class="box" :class="{'padding-none':loading}">
      <Statistic
        v-if="!loading" :title="item.title" :value="item.value"
        :value-style="{ fontSize: '30px', fontWeight: 'bold' }"
        style="margin-right: 50px"
      />
      <Skeleton v-else />
    </div>
  </div>
</template>
<script setup lang="ts">
import { overdue } from '@/api/asset-management/asset-management'
import { ref } from 'vue'
const props = withDefaults(defineProps<{
  dimension:string;
  period:string;
}>(), {})
const data = ref<{ title: string; value: number; }[]>([
  { title: '资产总数', value: 0 },
  { title: '报修资产数', value: 0 },
  { title: '报废资产数', value: 0 },
  { title: '使用年限到期资产', value: 0 },
  { title: '维保到期资产', value: 0 }
])
const loading = ref(false)
const getData = () => {
  try {
    loading.value = true
    const params = {
      dimension: props.dimension,
      period: props.period
    }
    overdue(params).then(res => {
      if (res.data) {
        data.value[0].value = res.data.propertyNumber ?? 0
        data.value[1].value = res.data.repairReportNumber ?? 0
        data.value[2].value = res.data.weedOutNumber ?? 0
        data.value[3].value = res.data.usageNumber ?? 0
        data.value[4].value = res.data.maintenanceNumber ?? 0
      }
    })
  } catch (error) {
  } finally {
    loading.value = false
  }
}

defineExpose({
  getData
})
</script>
<style scoped lang="less">
.box {
  width: calc(calc(100% - 48px) / 5);
  height: 120px;
  background-color: white;
  box-sizing: border-box;
  padding-top: 20px;
  padding-left: 10px;
  overflow: hidden;
}

:deep(.first) {
  padding-left: 0 !important;
}

:deep(.last) {
  padding-right: 0 !important;
}
.padding-none{
  padding: 10px !important;
}
</style>
