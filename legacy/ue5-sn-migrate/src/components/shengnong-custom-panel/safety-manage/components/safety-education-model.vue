<template>
  <Modal :title="title" :show="showModal" @close="cancel" width="1100px">
    <div class="modal-layout">
      <div class="table-top">
        <a-form ref="selectForm" :model="dataInfo" layout="inline">
          <a-form-item label="所属市场">
            <a-select
              class="alarm-level-select"
              v-model:value="dataInfo.marketTenant"
              placeholder="请选择市场"
              allowClear
              :options="marketlist"
              :field-names="{ label: 'marketName', value: 'marketTenant' }"
            >
            </a-select>
          </a-form-item>
          <a-form-item label="状态">
            <a-select
              class="alarm-level-select"
              v-model:value="dataInfo.status"
              placeholder="请选择状态"
              allowClear
              :options="TrainingStatusOptions"
              :field-names="{ label: 'label', value: 'value' }"
            >
            </a-select>
          </a-form-item>
          <a-form-item label="培训类型">
            <a-select
              class="alarm-level-select"
              v-model:value="dataInfo.cultivateType"
              placeholder="请选择培训类型"
              allowClear
              :options="TrainingTypeOptions"
              :field-names="{ label: 'label', value: 'value' }"
            >
            </a-select>
          </a-form-item>
          <a-form-item label="培训形式">
            <a-select
              class="alarm-level-select"
              v-model:value="dataInfo.cultivateMode"
              placeholder="请选择培训形式"
              allowClear
              :options="TrainingModeOptions"
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
      <div style="min-height: 320px">
        <RollTable :column="columns" :data="dataSource" :showLength="20" style="margin-top: 15px; height: 420px; overflow-y: auto">
          <template #status="{ record }">
            <span :style="{ color: stateMap.get(record.status)?.color }">{{ stateMap.get(record.status)?.label || "" }}</span>
          </template>
        </RollTable>
      </div>
      <a-pagination
        @change="getSafetyCultivatePage"
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
import dayjs from "dayjs";
import { ref, reactive, onMounted } from "vue";

import { getMarketList, safetyCultivatePage } from "@/api/shennong/compre";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import Modal from "@/components/modal-table/modal.vue";
import { filterMarketOptions } from "@/utils/common";

interface Props {
  title: string;
  showModal: boolean;
  time: string;
  marketName: string;
}
const emit = defineEmits(["close"]);
const props = withDefaults(defineProps<Props>(), {
  title: "交易信息详情",
  showModal: false,
  time: dayjs(new Date()).format("YYYY-MM-DD 00:00:00") + "," + dayjs(new Date()).format("YYYY-MM-DD 23:59:59"),
});
const TrainingStatusOptions = [
  { label: "已发布", value: "PUBLISHED" },
  { label: "待发布", value: "WAIT_PUBLISH" },
  { label: "进行中", value: "TRAINING" },
  { label: "已完成", value: "OVER" },
];
const TrainingTypeOptions = [
  { label: "员工培训", value: "STAFF" },
  { label: "商户培训", value: "MERCHANT" },
];
const TrainingModeOptions = [
  { label: "线上培训", value: "ONLINE" },
  { label: "线下培训", value: "OFFLINE" },
];
const dataInfo = reactive<Record<string, any>>({
  marketTenant: props.marketName || undefined,
  status: undefined,
  cultivateType: undefined,
  cultivateMode: undefined,
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});
const columns = [
  {
    title: "序号",
    dataIndex: "index",
    width: 48,
  },
  {
    title: "任务名称",
    dataIndex: "name",
  },
  {
    title: "培训主题",
    dataIndex: "themeName",
  },
  {
    title: "培训类型",
    dataIndex: "cultivateTarget",
  },
  {
    title: "培训形式",
    dataIndex: "cultivateMode",
  },
  {
    title: "负责人",
    dataIndex: "chargeUserName",
  },
  {
    title: "主讲人",
    dataIndex: "speaker",
  },
  {
    title: "培训截止时间",
    dataIndex: "cultivateEndTime",
    width: "200",
  },
  {
    title: "培训地点",
    dataIndex: "cultivateAddress",
  },
  {
    title: "培训内容",
    dataIndex: "cultivateContent",
  },
  {
    title: "参加人数",
    dataIndex: "cultivateUserNumber",
  },
  {
    title: "状态",
    dataIndex: "cultivateTaskStatusName",
  },
];

const dataSource = ref([]);
const marketlist = ref();
const stateMap = new Map([
  ["待接收", { label: "待接收", color: "#1890FF" }],
  ["进行中", { label: "进行中", color: "#95BCF9" }],
  ["已完成", { label: "已完成", color: "#00c6bc" }],
  ["已过期", { label: "已过期", color: "#D9E7FF" }],
]);
const getmarket = async () => {
  const data = await getMarketList({});
  marketlist.value = filterMarketOptions(data);
};
const query = () => {
  getSafetyCultivatePage();
};
const getSafetyCultivatePage = async () => {
  let params = {
    ...dataInfo,
    period: props.time,
  };
  let res = await safetyCultivatePage(params);
  dataInfo.total = res.total;
  dataSource.value = res.records;
  dataSource.value.forEach((item: any, index) => {
    item.index = index + 1;
    item.cultivateTarget = TrainingTypeOptions.find((option) => option.value === item.cultivateTarget)?.label || "";
    item.cultivateMode = TrainingModeOptions.find((option) => option.value === item.cultivateMode)?.label || "";
    item.cultivateEndTime = dayjs(item.cultivateEndTime).format("YYYY-MM-DD HH:mm:ss");
  });
};
const reset = () => {
  Object.assign(dataInfo, {
    marketTenant: undefined,
    status: undefined,
    cultivateType: undefined,
    cultivateMode: undefined,
    pageSize: 10,
    pageNumber: 1,
    total: 0,
  });
  getSafetyCultivatePage();
};
const cancel = () => {
  emit("close");
};
onMounted(() => {
  getmarket();
  getSafetyCultivatePage();
});
</script>
<style lang="less" scoped>
.alarm-level-select,
.handle-status-select {
  width: 150px;
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
