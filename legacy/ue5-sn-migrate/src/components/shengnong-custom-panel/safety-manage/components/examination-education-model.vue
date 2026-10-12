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
              :options="ExamTaskStatusOptions"
              :field-names="{ label: 'label', value: 'value' }"
            >
            </a-select>
          </a-form-item>
          <a-form-item label="考试类型">
            <a-select
              class="alarm-level-select"
              v-model:value="dataInfo.examType"
              placeholder="请选择考试类型"
              allowClear
              :options="ExamTaskTypeOptions"
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
          <template #examPaperName="{ record }">
            <span>{{ record?.examPapers?.map((e) => e?.name)?.join(",") }}</span>
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

import { getMarketList, educationStatisticsExamPage } from "@/api/shennong/compre";
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

const ExamTaskStatusOptions = [
  { label: "待发布", value: "UNPUBLISHED" },
  { label: "待考试", value: "STAY_EXAM" },
  { label: "进行中", value: "IN_PROGRESS" },
  { label: "已结束", value: "ENDED" },
];
const ExamTaskTypeOptions = [
  { label: "员工考核", value: "STAFF_EXAM" },
  { label: "商户考核", value: "MERCHANT_EXAM" },
];
const dataInfo = reactive<Record<string, any>>({
  marketTenant: props.marketName || undefined,
  status: undefined,
  examType: undefined,
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
    title: "考试主题",
    dataIndex: "themeName",
  },
  {
    title: "考试类型",
    dataIndex: "examTaskType",
  },
  {
    title: "负责人",
    dataIndex: "chargeUserName",
  },
  {
    title: "考试开始时间",
    dataIndex: "examStartTime",
    width: "200",
  },
  {
    title: "考试结束时间",
    dataIndex: "examEndTime",
    width: "200",
  },
  {
    title: "试卷",
    dataIndex: "examPaperName",
    slots: {
      customRender: "examPaperName",
    },
  },
  {
    title: "考试说明",
    dataIndex: "remark",
  },
  {
    title: "参加人数",
    dataIndex: "examUserNumber",
  },
  {
    title: "状态",
    dataIndex: "examTaskStatus",
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
  let res = await educationStatisticsExamPage(params);
  dataInfo.total = res.total;
  dataSource.value = res.records;
  dataSource.value.forEach((item: any, index) => {
    item.index = index + 1;
    item.examTaskType = ExamTaskTypeOptions.find((option) => option.value === item.examTaskType)?.label || "";
    item.examTaskStatus = ExamTaskStatusOptions.find((option) => option.value === item.examTaskStatus)?.label || "";
    item.examStartTime = dayjs(item.examStartTime).format("YYYY-MM-DD HH:mm:ss");
    item.examEndTime = dayjs(item.examEndTime).format("YYYY-MM-DD HH:mm:ss");
  });
};
const reset = () => {
  Object.assign(dataInfo, {
    marketTenant: undefined,
    status: undefined,
    examType: undefined,
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
