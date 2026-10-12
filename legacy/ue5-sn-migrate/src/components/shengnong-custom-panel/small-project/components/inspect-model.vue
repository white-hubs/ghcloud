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
              :options="marketlist"
              :field-names="{ label: 'marketName', value: 'marketTenant' }"
            >
            </a-select>
          </a-form-item>
          <!-- <a-form-item label="巡检类型">
            <a-select
              class="alarm-level-select"
              v-model:value="dataInfo.typeName"
              placeholder="请选择巡检类型"
              :options="inspectList"
              :field-names="{ label: 'label', value: 'value' }"
            >
            </a-select>
          </a-form-item> -->
          <a-form-item label="状态">
            <a-select
              class="alarm-level-select"
              v-model:value="dataInfo.state"
              placeholder="请选择状态"
              :options="stateList"
              :field-names="{ label: 'label', value: 'value' }"
            >
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" size="small" @click="query">查询</a-button>
            <a-button size="small" style="margin-left: 15px" @click="reset"
              >重置</a-button
            >
          </a-form-item>
        </a-form>
      </div>
      <RollTable :column="columns" :data="dataSource" :showLength="20" style="margin-top: 15px; height: 420px; overflow-y: auto">
        <template #status="{ record }">
          <span :style="{color: stateMap.get(record.status)?.color}">{{ stateMap.get(record.status)?.label || '' }}</span>
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
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import Modal from "@/components/modal-table/modal.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { getMarketList, inspectionList, inspectionTypes } from "@/api/shennong/compre";
import dayjs from "dayjs";
import { storeMarket } from "@/piniaStore/other";
import { filterMarketOptions } from "@/utils/common";
const piniaStoreMarket = storeMarket();

interface Props {
  title: string;
  showModal: boolean;
  time: string;
  marketName: string;
  state?: string;
  abnormal?: boolean;
}
const emit = defineEmits(["close"]);
const props = withDefaults(defineProps<Props>(), {
  title: "工程巡查任务",
  showModal: false,
  state: "",
  time:
    dayjs(new Date()).format("YYYY-MM-DD 00:00:00") +
    "," +
    dayjs(new Date()).format("YYYY-MM-DD 23:59:59"),
});
const dataInfo = reactive<Record<string, any>>({
  marketTenant: props.marketName || '' ,
  type: "",
  typeName: "",
  state: props?.state,
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});
const columns = ref([
  {
    title: "名称",
    dataIndex: "name",
    sorter: true,
  },
  {
    title: "所属市场",
    dataIndex: "marketName",
    sorter: true,
  },
  {
    title: "巡检类型",
    dataIndex: "typeName",
    sorter: true,
  },
  // {
  //   title: "任务类型",
  //   dataIndex: "taskType",
  //   sorter: true,
  // },
  {
    title: "任务级别",
    dataIndex: "level",
    sorter: true,
  },
  {
    title: "执行人",
    dataIndex: "executor",
    sorter: true,
  },
  {
    title: "截止时间",
    dataIndex: "validEndTime",
    sorter: true,
  },
  {
    title: "进度",
    dataIndex: "progressRate",
    sorter: true,
  },
  {
    title: "状态",
    dataIndex: "status",
    slots: {
      customRender: "status",
    },
  },
]);
const dataSource = ref([]);
const marketlist = ref();
const stateList = [
  {
    label: "待接收",
    value: "ACCEPT",
  },
  {
    label: "进行中",
    value: "EXECUTING",
  },
  {
    label: "已完成",
    value: "OVER",
  },
  {
    label: "已过期",
    value: "EXPIRE",
  },
];
const stateMap = new Map([
  ["待接收", {label: "待接收", color: "#1890FF"}],
  ["进行中", {label: "进行中", color: "#95BCF9"}],
  ["已完成", {label: "已完成", color: "#00c6bc"}],
  ["已过期", {label: "已过期", color: "#D9E7FF"}],
])
const inspectList = ref([]);
const getmarket = async () => {
  const data = await getMarketList({});
  marketlist.value = filterMarketOptions(data)
};
const query = () => {
  getInspect();
};
const getInspect = async () => {
  let params = {
    ...dataInfo,
    period: props.time,
    businessType: 'SMALL_ENGINEERING',
  };
  if (props.abnormal) {
    Object.assign(params, {period: '', execPeriod: props.time, abnormal: true})
  } else {
    Object.assign(params, {execPeriod: '', period: props.time})
  }
  let res = await inspectionList(params);
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
    state: "",
    typeName: "",
    pageSize: 10,
    pageNumber: 1,
    total: 0,
  });
  getInspect();
};
const cancel = () => {
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
:deep(.ant-form-item-label > label){

color: rgba(255, 255, 255, 1);
}
:deep(.ant-select-selection-item){

color: rgba(255, 255, 255, 1);
}
:deep(.ant-select-item),:deep(.ant-empty-small){
background: rgba(255, 255, 255, 0.1) !important;
color: #fff !important;
}
:deep(.ant-select-item-empty){
  background: rgba(255, 255, 255, 0.1) !important;
}
:deep(.ant-empty-small), :deep(.ant-picker-input > input){
  color: #fff !important;
}
.ant-btn-sm {
    border: 0.00521rem solid #1285FF;
    background-color: rgba(4, 17, 32, 0.95);
    color: #1285FF;
}
.ant-btn-primary {
    background-color: #1285FF;
    color: #fff;
}
:deep(.roll-table) {
  margin-top: 20px;
}
:deep(.roll-table .header) {
  height: 45px;
  background: rgba(16,40,68,0.80);
}
:deep(.roll-table .table-tr) {
  height: 45px;
}
:deep(.form-item > div.form-item-label){
  width: auto;
}
</style>
