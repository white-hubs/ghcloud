<template>
  <Modal :title="title" :show="showModal" @close="cancel">
    <div class="modal-layout">
      <div class="table-top">
        <a-form ref="selectForm" :model="dataInfo" layout="inline">
          <a-form-item style="width: 180px" label="所属市场">
            <a-select
              class="alarm-level-select"
              v-model:value="dataInfo.marketTenant"
              placeholder="请选择市场"
              :options="marketlist"
              :field-names="{ label: 'marketName', value: 'marketTenant' }"
            >
            </a-select>
          </a-form-item>
          <a-form-item style="width: 150px; margin-left: 20px" label="状态">
            <a-select
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
      <tableData
        :dataSource="dataSource"
        :columns="columns"
        style="margin-top: 15px; height: 520px; overflow-y: auto"
      ></tableData>
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
import { ref, reactive, onMounted } from "vue";
import Modal from "@/components/modal-table/modal.vue";
import tableData from "@/components/businessPanel/meat-trading/components/tableData.vue";
import type { TableColumnType } from "ant-design-vue";
import { getMarketList, patrolList } from "@/api/shennong/compre";
interface Props {
  title: string;
  showModal: boolean;
  time: string;
  marketName: string;
  marketid: string;
  status?: string;
}
const emit = defineEmits(["close"]);
const props = withDefaults(defineProps<Props>(), {
  title: "交易信息详情",
  showModal: false,
  time: "TODAY",
  marketid: "",
  status: "",
});
const stateList = [
  {
    label: "执行中",
    value: "IN_EXECUTION",
  },
  {
    label: "待接收",
    value: "TO_BE_RECEIVED",
  },
  {
    label: "已结束",
    value: "FINISHED",
  },
];
let stateObj = stateList.filter((item) => item.label === props.status)[0];
const dataInfo = reactive<Record<string, any>>({
  marketTenant: props.marketName || props.marketid,
  state: stateObj ? stateObj.value : "",
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});
const columns = ref<TableColumnType[]>([
  // {
  //     title: '任务名称',
  //     dataIndex: 'name',
  //     sorter: true,

  //   },
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
const dataSource = ref([
  {
    name: "9月1日巡更任务",
    market: "成都",
    inspectType: "08:00-12:00",
    taskType: "巡更路线1",
    taskLevel: "5",
    executor: "张三",
    deadline: "执行中",
    schedule: "异常",
  },
  {
    name: "9月1日巡更任务",
    market: "成都",
    inspectType: "08:00-12:00",
    taskType: "巡更路线1",
    taskLevel: "5",
    executor: "张三",
    deadline: "执行中",
    schedule: "异常",
  },
  {
    name: "9月1日巡更任务",
    market: "成都",
    inspectType: "08:00-12:00",
    taskType: "巡更路线1",
    taskLevel: "5",
    executor: "张三",
    deadline: "执行中",
    schedule: "异常",
  },
  {
    name: "9月1日巡更任务",
    market: "成都",
    inspectType: "08:00-12:00",
    taskType: "巡更路线1",
    taskLevel: "5",
    executor: "张三",
    deadline: "执行中",
    schedule: "异常",
  },
  {
    name: "9月1日巡更任务",
    market: "成都",
    inspectType: "08:00-12:00",
    taskType: "巡更路线1",
    taskLevel: "5",
    executor: "张三",
    deadline: "执行中",
    schedule: "异常",
  },
]);
const marketlist = ref();
const getmarket = async () => {
  const data = await getMarketList({});
  marketlist.value = data.filter(item => item.status);
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
  dataInfo.marketTenant = "";
  dataInfo.state = "";
  dataInfo.pageNumber = 1;
  getPatrolList();
};
const cancel = () => {
  emit("close");
};
onMounted(() => {
  getmarket();
  getPatrolList();
});
</script>
<style lang="less" scoped>
:deep(.ant-pagination-total-text) {
  color: #fff;
}
</style>

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
</style>