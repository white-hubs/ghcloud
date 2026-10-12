<template>
  <Modal  title="综合能耗"  :show="showModal" @close="closeModal" wrapClassName="modal-table-device">
    <div>
      <a-radio-group v-model:value="energyParams.type" button-style="solid" @change="changeType(true)">
        <a-radio-button value="汇总">汇总</a-radio-button>
        <a-radio-button value="分类">分类</a-radio-button>
        <a-radio-button value="分项">分项</a-radio-button>
        <a-radio-button value="区域">区域</a-radio-button>
      </a-radio-group>
      <a-range-picker v-model:value="energyParams.period" value-format="YYYY-MM-DD"
        style="margin-left: 10px;" />
        <a-button type="primary" style="margin-left: 10px;" @click="changeType(true)">查询</a-button>
      </div>
    <a-table class="table-box" :scroll="{y:scrollY}" :dataSource="dataSource" :columns="columns" :pagination="false" />
    <a-pagination style="text-align: right;margin-top: 10px;" :showSizeChanger="false" @change="changeType(false)" v-model:current="current"
      :total="total" />
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import Modal from "@/components/modal-table/modal.vue";
import { energyDailySummarySummaryPage, energyDailySummaryTrend, energyDailyUsageProjectPage, energyDailyUsageTypePage, projectStatCategory, statTimeCategory } from '@/api/energy'
import moment from 'moment'

interface Props {
  showModal: boolean;
}
const emit = defineEmits(["close"]);
const dateFormat = "YYYY-MM-DD HH:mm:ss";
const energyParams = reactive({
  type:'汇总',
  period:['']
})
const dataSource = ref([])
const columns = ref()
const props = withDefaults(defineProps<Props>(), {
  showModal: false,
});
const total = ref(0)
const current = ref(1)
const scrollY = ref(350)
const closeModal = () => {
  emit("close");
};
const changeType = async (value)=>{
  if (value) {
    current.value = 1
  }
  const prams = {
    pageSize:10,
    pageNumber:current.value,
    period:energyParams.period?energyParams.period.join(","):''
  }
  if (energyParams.type === '汇总') {
    columns.value = [
      {
          title: '日期',
          align: 'center',
          dataIndex: 'time',
      },
      {
          title: '综合能耗 tce',
          align: 'center',
          dataIndex: 'value',
      },
    ]
    const res = await energyDailySummarySummaryPage(prams)
    total.value = res.total
    dataSource.value = res.records.map(e=>{
      return {
        time:e.dateStr,
        value:e.zhValue
      }
    })
  }else if(energyParams.type === '分类'){
    columns.value = [
      {
          title: '日期',
          align: 'center',
          dataIndex: 'time',
      },
      {
          title: '分类',
          align: 'center',
          dataIndex: 'name',
      },
      {
          title: '综合能耗 tce',
          align: 'center',
          dataIndex: 'value',
      },
    ]
    const res = await energyDailyUsageTypePage(prams)
    total.value = res.total
    dataSource.value = res.records.map(e=>{
      return {
        time:e.time,
        value:e.zhValue,
        name:e.instrumentTypeName
      }
    })
  }else if (energyParams.type === '分项') {
    columns.value = [
      {
          title: '日期',
          align: 'center',
          dataIndex: 'time',
      },
      {
          title: '分类',
          align: 'center',
          dataIndex: 'instrumentTypeName',
      },
      {
          title: '分项',
          align: 'center',
          dataIndex: 'name',
      },
      {
          title: '综合能耗 tce',
          align: 'center',
          dataIndex: 'value',
      },
    ]
    const res = await energyDailyUsageProjectPage({...prams,projectCategory:'ITEM'})
    total.value = res.total
    dataSource.value = res.records.map(e=>{
      return {
        time:e.time,
        value:e.zhValue,
        instrumentTypeName:e.instrumentTypeName,
        name:e.projectName
      }
    })
  }else if (energyParams.type === '区域') {
    columns.value = [
      {
          title: '日期',
          align: 'center',
          dataIndex: 'time',
      },
      {
          title: '分类',
          align: 'center',
          dataIndex: 'instrumentTypeName',
      },
      {
          title: '区域',
          align: 'center',
          dataIndex: 'name',
      },
      {
          title: '综合能耗 tce',
          align: 'center',
          dataIndex: 'value',
      },
    ]
    const res = await energyDailyUsageProjectPage({...prams,projectCategory:'AREA'})
    dataSource.value = res.records.map(e=>{
      return {
        time:e.time,
        value:e.zhValue,
        instrumentTypeName:e.instrumentTypeName,
        name:e.projectName
      }
    })
  }
}
// 计算table-y的高度
const getScrollY = (): void => {
  const ele = document.querySelector('.ant-modal-body')
  const height = ele?.clientHeight
  if (height) {
    scrollY.value = height - 180
  }
}
window.onresize = () => {
  getScrollY()
}
onMounted(()=>{
  changeType(true)
  getScrollY()
})
</script>
<style lang="less" scoped>
:deep(.ant-table) {
  background-color: transparent;
}

:deep(.ant-table-container) {
  background-color: transparent;
}

:deep(.ant-table-content) {
  background-color: transparent;
}

:deep(.ant-table-thead) {
  th {
    background-color: rgba(16, 40, 68, 0.4x);
  }
}

:deep(.ant-table-tbody) {
  td {
    background-color: transparent;
    border-bottom: thin solid rgba(105, 116, 140, 0.50);
  }

  tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)>td {
    //自定义table行hover上去的背景颜色
    background: transparent;
    cursor: default;
  }
}

:deep(.ant-empty) {
  color: #d0deee;
}

:deep(.ant-table-thead > tr > th) {
  color: #fff;
  background: rgba(16, 40, 68, 0.8);
}

.room-home-bottom {
  margin-top: 20px;
}

:deep(.ant-table-tbody > tr > td.ant-table-cell-row-hover) {
  background-color: rgba(16, 40, 68, 0.8);
}

:deep(.ant-table-cell) {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  border-bottom: rgba(16, 40, 68, 0.8);
}

:deep(.ant-picker-clear) {
  background-color: #000;
}

:deep(.ant-pagination-item-active a) {
  color: #fff !important;
}

.ant-picker-clear {
  background-color: #000;
}

:deep(.ant-table-cell-scrollbar) {
  display: none;
}

.table-box {
  height: 500px;
  margin-top: 6px;
}
</style>