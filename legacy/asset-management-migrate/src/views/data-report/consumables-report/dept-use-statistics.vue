<template>
  <GLayout :title="pageTitle" :showfooter="false" class="over-view">
    <template #header-btn>
      <Form layout="inline">
        <TimeRadioGroup ref="timeRadioGroupRef" v-model:value="period" @change="changeDate" />
        <Button style="margin: 0 10px;" @click="timeRadioGroupRef.getDateSubsce('TODAY');handleQuery()">重置</Button>
        <Button type="primary" @click="handleQuery">查询</Button>
      </Form>
    </template>
    <template v-if="period" #layout-content>
      <div style="width: 100%;">
        <ConsumptionStatistics ref="consumptionStatisticsRef" @getTableData="getTableData" style="height:calc(45% - 16px)" :period="period" :dimension="timeFlag" />
        <ConsumableRequisitionDetails ref="consumableRequisitionDetailsRef"  style="min-height:calc(55% - 16px)" :period="period" :dimension="timeFlag" />
      </div>
    </template>
  </GLayout>
</template>
<script lang="ts">
import GLayout from '@/components/common/g-layout.vue'
import TimeRadioGroup from '@/components/common/time-radio-group.vue'
import { onMounted, ref, nextTick } from 'vue'
import ConsumableRequisitionDetails from './components/consumable-requisition-details.vue'
import ConsumptionStatistics from './components/consumption-statistics.vue'
import { usePageName } from '@ghcloud/cube-utils'
interface Component {
  getData: () => void;
}
interface tableRefComponent {
  getData: (id:string) => void;
}
</script>
<script lang="ts" setup>
const { pageTitle } = usePageName()
const timeRadioGroupRef = ref();
const period = ref('');
const timeFlag = ref('TODAY');

const consumptionStatisticsRef = ref<Component>();
const consumableRequisitionDetailsRef = ref<tableRefComponent>();

const changeDate = (flag: string) => {
  timeFlag.value = flag;
  setTimeout(() => {
    handleQuery()
  }, 0);
};

// 查询
const handleQuery = () => {
  consumptionStatisticsRef.value?.getData()
  consumableRequisitionDetailsRef.value?.getData("")
};
//  查询表格数据
const getTableData=(id:string)=>{
  consumableRequisitionDetailsRef.value?.getData(id)
}
onMounted(() => {
  nextTick(() => {
    handleQuery()
  })
})
</script>
<style scoped lang="less">
.over-view {
  background-color: rgba(238, 242, 245, 1);
  padding: 0 !important;

  :deep(.layout-header) {
    background-color: white;
    box-sizing: border-box;
    padding: 0 10px;
  }

  :deep(.layout-footer) {
    display: none;
  }

  :deep(.content-search),
  :deep(.content-table),
  :deep(.content-right) {
    display: none !important;
  }

  :deep(.layout-content) {
    height: calc(100% - 53px);
    background-color: rgba(238, 242, 245, 1);
  }

  :deep(.ant-card-head-title) {
    font-size: 14px;
    font-weight: 400;
    color: #000000;
  }

  ::-webkit-scrollbar {
    width: 0px;
  }
}
</style>
