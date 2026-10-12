<template>
  <Modal title="白条交易排名信息" :show="showModal && !show" @close="closeModal" wrapClassName="modal-table-device">
    <div class="modal-layout">
      <div class="table-top">
        <a-form ref="selectForm" :model="datainfo" layout="inline">
          <a-radio-group v-model:value="timeType" @change="handleTimeTypeChange" class="time-type-buttons">
            <a-radio-button 
              v-for="item in timeList" 
              :key="item.value" 
              :value="item.value"
            >
              {{ item.label }}
            </a-radio-button>
          </a-radio-group>
        </a-form>
      </div>
      <div style="margin-top: 15px">
        <div class="table_header">
          <div v-for="item in table_header">{{ item }}</div>
        </div>
        <a-spin :spinning="loading">
          <div class="table_content">
            <div v-if="dataSource.length === 0" class="no-content">
              <NoData />
            </div>
            <div v-for="(item, index) in dataSource">
              <div class="content">
                <div>{{ item.sort ?? index+1 }}</div>
                <div>{{ item.supplyName }}</div>
                <div>{{ item.supplierCode }}</div>
                <div>{{ item.tradeWeight }}</div>
                <div class="ratio">
                  <div :class="['downtriangle', item.qoqTradeWeight > 0 && 'uptriangle']"></div>
                  <div :class="[item.qoqTradeWeight > 0 ? 'up' : 'down']">
                    {{ formatLinkRatio(item.qoqTradeWeight) }}
                  </div>
                </div>
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
import { onMounted, reactive, ref, watch } from "vue";
import NoData from "@/components/businessPanel/public/noData.vue";
import { onBeforeUnmount } from 'vue'
import { supplTradeRank } from "@/api/slide-tianjin";

interface Props {
  type?: string;
  showModal: boolean;
}

const timeList = [
			{ label: "今日", value: "TODAY" },
			{ label: "近7天", value: "WEEK" },
			{ label: "近30天", value: "MONTH" },
			{ label: "近1年", value: "YEAR" }
		]

const loading = ref(false);
const emit = defineEmits(["close"]);

const props = withDefaults(defineProps<Props>(), {
  type: "TODAY",
  showModal: false,
});

let timeType = ref<string>(props.type);

const handleTimeTypeChange = ()=> {
  datainfo.pageNumber = 1;
  getData();
}

// 将小数转为整数显示
const formatLinkRatio = (value: number): string => {
  if (value === null || value === undefined) return "0%";
  // 四舍五入取整数
  return `${Math.round(value)}%`;
};

const datainfo = reactive({
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});

const dataSource = ref([]);
const show = ref(false);

const table_header = ["排名", "商家名称", "联系方式", "交易重量（kg）", "环比"];

const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};

const getData = async () => {
  try {
    loading.value = true;
    let data = await supplTradeRank({type: timeType.value, pageNumber: datainfo.pageNumber,  pageSize: datainfo.pageSize })
    dataSource.value = data.records;
    datainfo.total = data.total;
  } catch (error) {
  } finally{
    loading.value = false;
  }
};

const closeModal = () => {
  emit("close");
};
watch(
  () => props.showModal,
  () => {
    timeType.value = props.type;
    if (props.showModal) {
      datainfo.pageNumber = 1;
      getData();
    }
  }
);

onMounted(() => {
  window.addEventListener('keydown', handleEsc);
  getData();
});

// esc按键返回事件
const handleEsc = (event) => {
  if (event.key !== 'Escape') return;
  if (document.querySelector('.alarmDetail-modal')) {
    show.value = false
    return
  }

};
onBeforeUnmount(()=>{
  window.removeEventListener('keydown', handleEsc);
})
</script>

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

    .ratio {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 200px; // 设置最小宽度确保内容显示完整
      overflow: visible; // 允许内容溢出显示
      text-overflow: unset; // 取消省略号
      white-space: nowrap; // 保持不换行

      .downtriangle {
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 6px solid #d2fff3;
        margin-right: 2px;
        transform: rotate(180deg);
        flex-shrink: 0;
      }

      .uptriangle {
        border-bottom: 6px solid #ffcece;
        transform: rotate(0deg);
      }

      .up {
        color: #f14545;
        flex-shrink: 0;
      }

      .down {
        color: #2ae8bd;
        flex-shrink: 0;
      }

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
.time-type-buttons {
  :deep(.ant-radio-button-wrapper) {
    background: transparent !important;
    border: 1px solid rgba(96, 112, 128, 0.6) !important;
    color: #999 !important;
    height: 32px;
    line-height: 30px;
    box-shadow: none !important;
    
    &:hover {
      background: rgba(255, 255, 255, 0.05) !important;
      border-color: rgba(96, 112, 128, 0.8) !important;
      color: #ccc !important;
      box-shadow: none !important;
    }
    
    &:first-child {
      border-radius: 6px 0 0 6px;
    }
    
    &:last-child {
      border-radius: 0 6px 6px 0;
    }
    
    &.ant-radio-button-wrapper-checked {
      background: #fff !important;
      border-color: #fff !important;
      color: #1890ff !important;
      box-shadow: none !important;
      position: relative;
      z-index: 1;
      
      &:hover {
        background: #fff !important;
        border-color: #fff !important;
        color: #1890ff !important;
        box-shadow: none !important;
      }
      
      &::before {
        display: none !important;
      }
    }
    
    &.ant-radio-button-wrapper-disabled {
      background: transparent !important;
      border-color: rgba(96, 112, 128, 0.3) !important;
      color: rgba(153, 153, 153, 0.3) !important;
      box-shadow: none !important;
    }
    
    &:focus-within {
      box-shadow: none !important;
      outline: none !important;
    }
  }
  
  :deep(.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):focus-within) {
    box-shadow: none !important;
  }
}
</style>