<template>
  <Modal :title="title" :show="showModal" @close="cancel" width="1000px">
    <div class="modal-layout">
      <div class="table-top">
        <a-form ref="selectForm" :model="dataInfo" layout="inline">
          <a-form-item label="所属市场">
            <a-select
              class="alarm-level-select"
              v-model:value="dataInfo.marketTenant"
              placeholder="请选择市场"
              allow-clear
              :options="marketlist"
              :field-names="{ label: 'marketName', value: 'marketTenant' }"
            >
            </a-select>
          </a-form-item>
          <a-form-item label="状态">
            <a-select
              class="alarm-level-select"
              v-model:value="dataInfo.state"
              placeholder="请选择状态"
              allow-clear
              :options="stateList"
              :field-names="{ label: 'label', value: 'value' }"
            >
            </a-select>
          </a-form-item>
          <a-form-item label="任务结果">
            <a-select
              class="alarm-level-select"
              v-model:value="dataInfo.resultCode"
              placeholder="请选择任务结果"
              allow-clear
              :options="resultCodeList"
              :field-names="{ label: 'label', value: 'value' }"
            >
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" size="small" @click="query">查询</a-button>
            <a-button size="small" style="margin-left: 15px" @click="reset">重置</a-button>
          </a-form-item>
        </a-form>
      </div>
      <tableData :dataSource="dataSource" :columns="columns" style="margin-top: 15px; height: 420px; overflow-y: auto"> </tableData>
      <a-pagination
        @change="getPatrolList"
        v-model:current="dataInfo.pageNumber"
        :total="dataInfo.total"
        :show-total="(total) => `共 ${total} 条`"
        show-size-changer
        show-less-items
        style="text-align: right; margin-top: 10px"
      />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import type { TableColumnType } from "ant-design-vue";
import { ref, reactive, onMounted, watch } from "vue";

import { getMarketList, patrolList } from "@/api/shennong/compre";
import tableData from "@/components/businessPanel/meat-trading/components/tableData.vue";
import Modal from "@/components/modal-table/modal.vue";
import { filterMarketOptions } from "@/utils/common";
interface Props {
  title: string;
  showModal: boolean;
  time: string;
  marketName?: string;
  marketid: string;
  status?: string;
  resultCode?: string;
}
const emit = defineEmits(["close"]);
const props = withDefaults(defineProps<Props>(), {
  title: "交易信息详情",
  showModal: false,
  time: "TODAY",
  marketid: "",
  resultCode: "",
});
const stateList = [
  {
    label: "处理中",
    value: "IN_EXECUTION",
  },
  {
    label: "待确认",
    value: "TO_BE_RECEIVED",
  },
  {
    label: "已结束",
    value: "FINISHED",
  },
];
const resultCodeList = [
  {
    label: "正常",
    value: "NORMAL",
  },
  {
    label: "异常",
    value: "ABNORMAL",
  },
];
let stateObj = stateList.filter((item) => item.label === props.status)[0];
const dataInfo = reactive<Record<string, any>>({
  marketTenant: props.marketName || props.marketid || undefined,
  state: stateObj ? stateObj.value : undefined,
  resultCode: props.resultCode || undefined,
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});
const columns = ref<TableColumnType[]>([
  {
    title: "所属市场",
    dataIndex: "marketName",
    sorter: true,
  },
  {
    title: "巡更时间段",
    dataIndex: "executeData",
    sorter: true,
  },
  {
    title: "巡更路线",
    dataIndex: "routeName",
    sorter: true,
  },
  {
    title: "巡更点数",
    dataIndex: "locationNum",
    sorter: true,
  },
  {
    title: "巡更人员",
    dataIndex: "userName",
    sorter: true,
  },
  {
    title: "状态",
    dataIndex: "status",
    sorter: true,
  },
  {
    title: "任务结果",
    dataIndex: "result",
    sorter: true,
  },
]);
const dataSource = ref([]);
const marketlist = ref();
const getmarket = async () => {
  const data = await getMarketList({});
  marketlist.value = filterMarketOptions(data);
};
const getPatrolList = async () => {
  let params = {
    ...dataInfo,
    period: props.time,
  };
  let res = await patrolList(params);
  dataSource.value = res.records;
  dataInfo.total = res.total;
};
const query = () => {
  getPatrolList();
};
const reset = () => {
  dataInfo.marketTenant = undefined;
  dataInfo.state = undefined;
  dataInfo.resultCode = undefined;
  dataInfo.pageNumber = 1;
  getPatrolList();
};
const cancel = () => {
  emit("close");
};
onMounted(() => {
  dataInfo.marketTenant = props.marketid || undefined;
  getmarket();
  getPatrolList();
});
</script>

<style lang="less" scoped>
.alarm-level-select,
.handle-status-select {
  width: 150px;
}

.table-top {
  :deep(.ant-form-inline) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    row-gap: 12px;
  }

  :deep(.ant-form-item) {
    margin-right: 16px;
    margin-bottom: 0;
  }

  :deep(.ant-form-item-control-input) {
    min-height: 32px;
  }
}

:deep(.ant-pagination-total-text) {
  color: #fff;
}

:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 1);
}

:deep(.ant-select-selection-item) {
  color: rgba(255, 255, 255, 1);
}

:deep(.ant-select-selection-placeholder) {
  color: rgba(255, 255, 255, 0.45) !important;
}

:deep(.ant-pagination-item-ellipsis) {
  color: #fff !important;
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
  background-color: rgba(4, 17, 32, 0.92) !important;
}

:deep(.ant-select-item),
:deep(.ant-empty-small) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}

:deep(.ant-select-item-empty) {
  background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.ant-empty-small),
:deep(.ant-picker-input > input) {
  color: #fff !important;
}

.ant-btn-sm {
  border: 0.00521rem solid #1285ff;
  background-color: rgba(4, 17, 32, 0.95);
  color: #1285ff;
}

.ant-btn-primary {
  background-color: #1285ff;
  color: #fff;
}
</style>
