<template>
  <Modal :title="itemData.meatTestingItemName" :show="showModal && !show" @close="closeModal" wrapClassName="modal-table-device">
    <div class="modal-layout">
      <div class="table-top">
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-label">{{ timeTitle }}{{ itemData.meatTestingItemName }}检测不合格数：</span>
            <span class="stat-value unqualified">{{ itemData.notPassSum }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总批次数：</span>
            <span class="stat-value total">{{ itemData.totalSum }}</span>
          </div>
          <div class="stat-item ratio-item">
            <span class="ratio-label">环比</span>
            <caret-up-outlined v-if="itemData.notPassSum >= 0" class="ratio-icon up" />
            <caret-down-outlined v-else class="ratio-icon down" />
            <span :class="itemData.notPassSum >= 0 ? 'ratio-value up' : 'ratio-value down'">{{ itemData.notPassSum }}%</span>
          </div>
        </div>
        <div class="time-display">
          <div class="time-range-info">{{ currentTimeTitle }} vs {{ lastTimeTitle }}</div>
        </div>
      </div>
      <div style="margin-top: 15px">
        <div class="table_header">
          <div v-for="item in table_header" :key="item">{{ item }}</div>
        </div>
        <a-spin :spinning="loading">
          <div class="table_content">
            <div v-if="dataSource.length === 0" class="no-content">
              <NoData />
            </div>
            <div v-for="item in dataSource" :key="item.id ">
              <div class="content">
                <div>{{ item.supplierName }}</div>
                <div>{{ item.supplierId }}</div>
                <div>{{ item.porkReportCode }}</div>
                <div>{{ item.checkResult }}</div>
                <div>{{ item.inspectorName }}</div>
              </div>
            </div>
          </div>
        </a-spin>
      </div>
      <div style="height: 30px">
        <a-pagination style="float: right; margin-top: 15px" v-model:current="datainfo.pageNumber"
          v-model:page-size="datainfo.pageSize" @change="onShowSizeChange" :total="datainfo.total" />
      </div>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import Modal from "../../../../components/modal-table/modal.vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import {CaretUpOutlined, CaretDownOutlined} from '@ant-design/icons-vue'
import NoData from "@/components/businessPanel/public/noData.vue";
import { onBeforeUnmount } from 'vue'
import { meatTradeTestingPage } from "@/api/slide-tianjin";
import dayjs from "dayjs";
import { MeatTradeRankVO } from '@/api/models/slide';

// 定义数据项的接口
interface UnqualifiedItem {
    id: string,
    supplierId: string,
    supplierName: string,
    porkReportCode: string,
    checkResult: string,
    inspectorName: string,
  }

interface Props {
  itemData: MeatTradeRankVO;
  timeType: string;
  showModal: boolean;
}

const loading = ref<boolean>(false);
const emit = defineEmits<{
  close: []
}>();

const timeList = [
  { label: "今日", value: "TODAY" },
  { label: "近7天", value: "THIS_WEEK" },
  { label: "近30天", value: "THIS_MONTH" },
  { label: "近1年", value: "THIS_YEAR" }
];

const table_header = computed((): string[] => ["商家名称", "商家编号", "批次号", props.itemData.meatTestingItemName, "登记员"]);

const props = withDefaults(defineProps<Props>(), {
  itemData: {
    id: '',
    timeRange: '',
    startDate: '',
    endDate: '',
    meatTestingItem: '',
    meatTestingItemCode: '',
    meatTestingItemName: '',
    totalCheckNumSum: 0,
    totalSum: 0,
    notPassSum: 0,
    prevTotalCheckNumSum: 0,
    prevTotalSum: 0,
    prevNotPassSum: 0,
    checkNumSumRate: 0,
    totalSumRate: 0,
    notPassSumRate: 0,
  },
  timeType: "TODAY",
  showModal: false,
});

const timeTitle = computed((): string => {
  const time = timeList.find(item => item.value === props.timeType)
  return time?.label || '今日'
})

const currentTimeTitle = computed((): string => {
  if (props.timeType === 'TODAY') {
     return `${dayjs().subtract(1, 'day').format('YYYY-MM-DD')} - ${dayjs().format('YYYY-MM-DD')}`
  }else if (props.timeType === 'THIS_WEEK') {
    return `${dayjs().subtract(7, 'day').format('YYYY-MM-DD')} - ${dayjs().format('YYYY-MM-DD')}`
  }else if (props.timeType === 'THIS_MONTH') {
    return `${dayjs().subtract(30, 'day').format('YYYY-MM-DD')} - ${dayjs().format('YYYY-MM-DD')}`
  }else if (props.timeType === 'THIS_YEAR') {
    return `${dayjs().subtract(365, 'day').format('YYYY-MM-DD')} - ${dayjs().format('YYYY-MM-DD')}`
  }
  return '';
});

const lastTimeTitle = computed((): string => {
  if (props.timeType === 'TODAY') {
     return `${dayjs().subtract(2, 'day').format('YYYY-MM-DD')} - ${dayjs().subtract(1, 'day').format('YYYY-MM-DD')}`
  }else if (props.timeType === 'THIS_WEEK') {
    return `${dayjs().subtract(15, 'day').format('YYYY-MM-DD')} - ${dayjs().subtract(8, 'day').format('YYYY-MM-DD')}`
  }else if (props.timeType === 'THIS_MONTH') {
     return `${dayjs().subtract(61, 'month').format('YYYY-MM-DD')} - ${dayjs().subtract(31, 'day').format('YYYY-MM-DD')}`
  }else if (props.timeType === 'THIS_YEAR') {
     return `${dayjs().subtract(731, 'day').format('YYYY-MM-DD')} - ${dayjs().subtract(366, 'day').format('YYYY-MM-DD')}`
  }
  return '';
});

const period = computed((): string => {
  if (props.timeType === 'TODAY') {
     return `${dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')},${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
  }else if (props.timeType === 'THIS_WEEK') {
    return `${dayjs().subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss')},${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
  }else if (props.timeType === 'THIS_MONTH') {
    return `${dayjs().subtract(30, 'day').format('YYYY-MM-DD HH:mm:ss')},${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
  }else if (props.timeType === 'THIS_YEAR') {
    return `${dayjs().subtract(365, 'day').format('YYYY-MM-DD HH:mm:ss')},${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
  }
  return '';
});

const datainfo = reactive({
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});

const dataSource = ref<UnqualifiedItem[]>([]);
const show = ref<boolean>(false);

const onShowSizeChange = (current: number, size: number): void => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};

const getData = async (): Promise<void> => {
  try {
    loading.value = true;
    const data = await meatTradeTestingPage({
      itemCode: props.itemData.meatTestingItemCode, 
      type: props.timeType, 
      period: period.value, 
      pageNumber: datainfo.pageNumber,  
      pageSize: datainfo.pageSize,
    });
    dataSource.value = data.records;
    datainfo.total = data.total;
  } catch (error) {
  } finally{
    loading.value = false;
  }
};

const closeModal = (): void => {
  emit("close");
};

watch(
  () => props.showModal,
  () => {
    if (props.showModal) {
      datainfo.pageNumber = 1;
      getData();
    }
  }
);

const handleEsc = (event: KeyboardEvent): void => {
  if (event.key !== 'Escape') return;
  if (document.querySelector('.alarmDetail-modal')) {
    show.value = false
    return
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleEsc);
  getData();
});

onBeforeUnmount(()=>{
  window.removeEventListener('keydown', handleEsc);
})
</script>

<!-- 样式部分保持不变 -->
<style lang="less" scoped>
:deep(.ant-select-selection-item) {
  color: #fff;
}

:deep(.ant-form-item-label > label) {
  color: #fff;
}

:deep(.ant-picker-input > input) {
  color: #fff;
}

:deep(.ant-picker-input > input::placeholder) {
  color: #fff;
}

:deep(.ant-table-thead > tr > th) {
  color: #fff;
}

:deep(.ant-table-tbody > tr > td) {
  color: #fff;
}

:deep(.ant-table-tbody > tr > td.ant-table-cell-row-hover) {
  background-color: transparent;
}

:deep(.ant-select-selector) {
  background: rgba(216, 216, 216, 0.1) !important;
  border: 1px solid rgba(96, 112, 128, 0.6) !important;
}

:deep(.ant-picker-range) {
  background: rgba(216, 216, 216, 0.1) !important;
  border: 1px solid rgba(96, 112, 128, 0.6) !important;
}

:deep(.ant-table-cell) {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  border-bottom: rgba(16, 40, 68, 0.8);
}

.table-top {
  display: flex;
  flex-direction: column;
  padding: 10px 20px;
  background: linear-gradient(135deg, rgba(16, 40, 68, 0.9) 0%, rgba(25, 55, 85, 0.8) 100%);
  border-radius: 8px;
  border: 1px solid rgba(96, 112, 128, 0.3);
  margin-bottom: 20px;
  gap: 16px;
  
  .stats-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      
      .stat-label {
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        font-weight: 400;
        white-space: nowrap;
      }
      
      .stat-value {
        font-size: 18px;
        font-weight: 600;
        
        &.unqualified {
          color: #F14545;
        }
        
        &.total {
          color: #52C41A;
        }
      }
      
      &.ratio-item {
        justify-content: flex-end;
        padding: 12px 20px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        flex: 0 0 auto;
        
        .ratio-label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }
        
        .ratio-icon {
          font-size: 16px;
          
          &.up {
            color: #ffcece;
          }
          
          &.down {
            color: #d2fff3;
          }
        }
        
        .ratio-value {
          font-size: 20px;
          font-weight: 600;

          &.up {
            color: #ffcece;
          }
          
          &.down {
            color: #d2fff3;
          }
        }
      }
    }
  }
  
  .time-display {
    display: flex;
    justify-content: flex-start;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    
    .time-range-info {
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 12px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      white-space: nowrap;
      letter-spacing: 0.5px;
      
      &::before {
        content: '📅';
        margin-right: 6px;
        font-size: 14px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .table-top {
    .stats-row {
      flex-direction: column;
      gap: 12px;
      
      .stat-item {
        justify-content: center;
        
        &.ratio-item {
          justify-content: center;
        }
      }
    }
  }
}

.table_header {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  display: flex;
  color: #fff;
  line-height: 48px;

  div {
    width: 20%;
    text-align: center;
    padding: 0 15px;
  }
}

.table_content {
  // display: flex;
  color: #fff;
  min-height: 200px;

  .no-content {
    display: flex;
    justify-content: center;

    :deep(.content) {
      margin-top: 10%;
    }
  }

  .content {
    display: flex;

    div {
      width: 20%;
      line-height: 48px;
      text-align: center;
      height: 48px;
      border-bottom: 1px solid rgba(105, 116, 140, 0.5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

:deep(.ant-pagination-item-ellipsis) {
  color: #fff !important;
}

.overflow {
  overflow: hidden; //超出的文本隐藏
  text-overflow: ellipsis; //溢出用省略号显示
  white-space: nowrap;
}

:deep(.ant-pagination-item-link) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

:deep(.ant-pagination-item) {
  background: rgba(255, 255, 255, 0.1);

  a {
    color: #fff;
  }
}

:deep(.ant-pagination-item-active) {
  background: #1890ff;

  a {
    color: #fff;
  }
}

:deep(.ant-modal-content) {
  background: rgba(4, 17, 32, 0.8) !important;
}


:deep(.modal-width) {
  width: 940px !important;
}
</style>
<style scoped lang="less">
.modal-table-device {
  .modal-width {
    width: 940px !important;
  }

  .ant-modal {
    // top: 200px !important;
  }

  a {
    color: #2989FF;
  }
}
</style>