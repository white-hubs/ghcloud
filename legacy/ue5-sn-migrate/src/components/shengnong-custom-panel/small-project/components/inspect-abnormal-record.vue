<template>
  <Modal :title="title" :show="listVisible" @close="cancel" width="1000px">
    <div class="modal-layout">
      <div class="table-top">
        <a-form ref="selectForm" :model="dataInfo" layout="inline">
          <a-form-item label="所属市场">
            <a-select
              class="alarm-level-select"
              v-model:value="dataInfo.marketTenant"
              placeholder="请选择市场"
              :options="marketlist"
              :field-names="{ label: 'marketName', value: 'marketTenant' }"
            >
            </a-select>
          </a-form-item>
          <a-form-item label="巡检结果">
            <a-select
              class="alarm-level-select"
              v-model:value="dataInfo.result"
              placeholder="请选择巡检结果"
              :options="stateList"
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
      <RollTable :column="columns" :data="dataSource" :showLength="20" style="margin-top: 15px; height: 420px; overflow-y: auto">
        <template #status="{ record }">
          <span :style="{ color: '#00c6bc' }">已完成</span>
        </template>
        <template #result="{ record }">
          <span :style="{ color: stateMap.get(record.result)?.color }">{{ stateMap.get(record.result)?.label || "" }}</span>
        </template>
        <template #operate="{ record }">
          <a style="color: #2989ff" @click="goDetails(record)"> 详情 </a>
        </template>
      </RollTable>
      <a-pagination
        @change="getInspect"
        v-model:current="dataInfo.pageNumber"
        :total="dataInfo.total"
        :show-total="(total) => `共 ${total} 条`"
        show-size-changer
        show-less-items
        style="text-align: right; margin-top: 10px"
      />
    </div>
  </Modal>
  <Modal :show="detailModalShow" title="工程巡查异常记录" @close="closeDetail">
    <inspect v-if="detailModalShow" @close="closeDetail" :parameter="inspectParameter"></inspect>
  </Modal>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { ref, reactive, onMounted, watch } from "vue";

import inspect from "./inspect-detail/index.vue";
import { getMarketList, inspectionTypes } from "@/api/shennong/compre";
import { safetyMarketInspectRecord } from "@/api/shennong/small-project";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { openAlarmDetail } from "@/components/hooks/useAlarm";
import useEscClose from "@/components/hooks/useEscClose";
import Modal from "@/components/modal-table/modal.vue";
import { storeMarket } from "@/piniaStore/other";
import { filterMarketOptions } from "@/utils/common";

const piniaStoreMarket = storeMarket();

interface Props {
  title: string;
  showModal: boolean;
  time: string;
  marketName: string;
  status?: string;
}
const emit = defineEmits(["close"]);
const props = withDefaults(defineProps<Props>(), {
  title: "工程巡查记录",
  showModal: false,
  status: "",
  time: dayjs(new Date()).format("YYYY-MM-DD 00:00:00") + "," + dayjs(new Date()).format("YYYY-MM-DD 23:59:59"),
});
const dataInfo = reactive<Record<string, any>>({
  marketTenant: props.marketName || "",
  type: "",
  typeName: "",
  result: "",
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});
const columns = ref([
  {
    title: "名称",
    dataIndex: "targetName",
    sorter: true,
  },
  {
    title: "所属市场",
    dataIndex: "marketName",
    sorter: true,
  },
  {
    title: "执行人",
    dataIndex: "nickname",
    sorter: true,
  },
  {
    title: "状态",
    dataIndex: "status",
    slots: {
      customRender: "status",
    },
  },
  {
    title: "巡检结果",
    dataIndex: "result",
    slots: {
      customRender: "result",
    },
  },
  {
    title: "异常项",
    dataIndex: "errorItem",
    sorter: true,
  },
  {
    title: "操作",
    dataIndex: "operate",
    slots: {
      customRender: "operate",
    },
  },
]);
const dataSource = ref([]);
const marketlist = ref();
const stateList = [
  {
    label: "正常",
    value: "NORMAL",
  },
  {
    label: "异常",
    value: "ABNORMAL",
  },
];
const stateMap = new Map([
  ["NORMAL", { label: "正常", color: "#35D93D" }],
  ["ABNORMAL", { label: "异常", color: "#FFC700" }],
]);
const inspectList = ref([]);
const getmarket = async () => {
  const data = await getMarketList({});
  marketlist.value = filterMarketOptions(data);
  const res = await inspectionTypes();
  // inspectList.value = res.map((item) => {
  //   return {
  //     label: item,
  //     value: item,
  //   };
  // });
};
const query = () => {
  getInspect();
};
const getInspect = async () => {
  let params = {
    ...dataInfo,
    period: props.time,
    businessType: "SMALL_ENGINEERING",
  };
  let res = await safetyMarketInspectRecord(params);
  dataInfo.total = res.total;
  dataSource.value = res.records;
  dataSource.value.forEach((item: any) => {
    item.validEndTime = dayjs(item.validEndTime).format("YYYY-MM-DD HH:mm:ss");
  });
};
const reset = () => {
  Object.assign(dataInfo, {
    marketTenant: null,
    type: "",
    result: "",
    typeName: "",
    pageSize: 10,
    pageNumber: 1,
    total: 0,
  });
  getInspect();
};
const detailModalShow = ref<boolean>(false);
const listVisible = ref(props.showModal);
watch(
  () => props.showModal,
  (v) => {
    listVisible.value = v;
    if (!v) {
      detailModalShow.value = false;
    }
  },
);
const inspectParameter = ref<Record<string, any>>({
  applicationCode: "SMALLENFINEERING",
  id: "",
  marketTenant: "",
  marketName: "",
  dateRange: "",
});
const goDetails = async (record) => {
  await openAlarmDetail(record, (res) => {
    inspectParameter.value = Object.assign(inspectParameter.value, record);
  });
  listVisible.value = false;
  detailModalShow.value = true;
};
const closeDetail = () => {
  detailModalShow.value = false;
  if (props.showModal) {
    listVisible.value = true;
  }
};
useEscClose(() => {
  if (detailModalShow.value) {
    closeDetail();
  }
});
const cancel = () => {
  detailModalShow.value = false;
  listVisible.value = false;
  emit("close");
};
onMounted(() => {
  getmarket();
  getInspect();
});
</script>
<style lang="less" scoped>
.alarm-level-select,
.handle-status-select {
  width: 150px;
}
:deep(.ant-pagination-total-text),
:deep(.form-item) {
  color: #fff;
}
:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 1);
}

:deep(.ant-select-selection-item) {
  color: rgba(255, 255, 255, 1);
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
:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 1);
}
:deep(.ant-select-selection-item) {
  color: rgba(255, 255, 255, 1);
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
:deep(.roll-table) {
  margin-top: 20px;
}
:deep(.roll-table .header) {
  height: 45px;
  background: rgba(16, 40, 68, 0.8);
}
:deep(.roll-table .table-tr) {
  height: 45px;
}
:deep(.form-item > div.form-item-label) {
  width: auto;
}
</style>
