<template>
  <Modal :title="title" :show="showModal" @close="cancel" width="1200px">
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
          <a-form-item>
            <a-button type="primary" size="small" @click="query">查询</a-button>
            <a-button size="small" style="margin-left: 15px" @click="reset">重置</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="table-body">
        <div class="table_header">
          <div class="col-name">名称</div>
          <div class="col-market">所属市场</div>
          <div class="col-type">巡检类型</div>
          <div class="col-level">任务级别</div>
          <div class="col-executor">执行人</div>
          <div class="col-time">截止时间</div>
          <div class="col-progress">进度</div>
          <div class="col-status">状态</div>
        </div>
        <a-spin :spinning="loadingDataSource">
          <div class="table_content">
            <div v-if="dataSource.length === 0" class="no-content">
              <NoData />
            </div>
            <div v-else v-for="(item, index) in dataSource" :key="item.id || index" class="content">
              <div class="col-name ellipsis" :title="item.name">{{ item.name || "--" }}</div>
              <div class="col-market ellipsis" :title="item.marketName">{{ item.marketName || "--" }}</div>
              <div class="col-type ellipsis" :title="item.typeName">{{ item.typeName || "--" }}</div>
              <div class="col-level ellipsis" :title="item.level">{{ item.level || "--" }}</div>
              <div class="col-executor ellipsis" :title="item.executor">{{ item.executor || "--" }}</div>
              <div class="col-time ellipsis" :title="item.validEndTime">{{ item.validEndTime || "--" }}</div>
              <div class="col-progress ellipsis" :title="String(item.progressRate ?? '')">
                {{ item.progressRate ?? "--" }}
              </div>
              <div
                class="col-status ellipsis"
                :style="{ color: stateMap.get(item.status)?.color }"
                :title="stateMap.get(item.status)?.label || item.status"
              >
                {{ stateMap.get(item.status)?.label || item.status || "--" }}
              </div>
            </div>
          </div>
        </a-spin>
      </div>
      <div class="table-pagination">
        <a-pagination
          @change="getInspect"
          v-model:current="dataInfo.pageNumber"
          :total="dataInfo.total"
          :show-total="(total) => `共 ${total} 条`"
          show-size-changer
          show-less-items
        />
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { ref, reactive, onMounted } from "vue";

import { getMarketList, inspectionList, inspectionTypes } from "@/api/shennong/compre";
import NoData from "@/components/businessPanel/public/noData.vue";
import Modal from "@/components/modal-table/modal.vue";
import { filterMarketOptions } from "@/utils/common";

interface Props {
  title: string;
  showModal: boolean;
  time: string;
  marketName: string;
  state: string;
  abnormal: boolean;
}
const emit = defineEmits(["close"]);
const props = withDefaults(defineProps<Props>(), {
  title: "交易信息详情",
  showModal: false,
  state: "",
  time: dayjs(new Date()).format("YYYY-MM-DD 00:00:00") + "," + dayjs(new Date()).format("YYYY-MM-DD 23:59:59"),
});
const dataInfo = reactive<Record<string, any>>({
  marketTenant: props.marketName || undefined,
  type: undefined,
  typeName: undefined,
  state: props.state || undefined,
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});
const dataSource = ref([]);
const loadingDataSource = ref(false);
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
  ["待接收", { label: "待接收", color: "#1890FF" }],
  ["进行中", { label: "进行中", color: "#95BCF9" }],
  ["已完成", { label: "已完成", color: "#00c6bc" }],
  ["已过期", { label: "已过期", color: "#D9E7FF" }],
]);
const inspectList = ref([]);
const getmarket = async () => {
  const data = await getMarketList({});
  const res = await inspectionTypes();
  inspectList.value = res.map((item) => {
    return {
      label: item,
      value: item,
    };
  });
  marketlist.value = filterMarketOptions(data);
};
const query = () => {
  getInspect();
};
const getInspect = async () => {
  try {
    loadingDataSource.value = true;
    let params = {
      ...dataInfo,
      period: props.time,
    };
    if (props.abnormal) {
      Object.assign(params, { period: "", execPeriod: props.time, abnormal: true });
    } else {
      Object.assign(params, { execPeriod: "", period: props.time });
    }
    let res = await inspectionList(params);
    dataInfo.total = res.total;
    dataSource.value = res.records;
    dataSource.value.forEach((item: any) => {
      item.validEndTime = dayjs(item.validEndTime).format("YYYY-MM-DD HH:mm:ss");
    });
  } finally {
    loadingDataSource.value = false;
  }
};
const reset = () => {
  Object.assign(dataInfo, {
    marketTenant: undefined,
    type: undefined,
    state: undefined,
    typeName: undefined,
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

.table-body {
  margin-top: 16px;
  height: 528px;
  overflow-y: auto;
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 12px;
  color: #fff;
}

.table_header {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  display: flex;
  color: #fff;
  line-height: 48px;
  width: 100%;

  div {
    padding: 0 10px;
    text-align: center;
    white-space: nowrap;
    box-sizing: border-box;
  }
}

.table_content {
  color: #fff;

  .no-content {
    display: flex;
    justify-content: center;

    :deep(.content) {
      margin-top: 5%;
    }
  }

  .content {
    display: flex;
    width: 100%;

    div {
      line-height: 48px;
      height: 48px;
      border-bottom: 1px solid rgba(105, 116, 140, 0.5);
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0 10px;
      box-sizing: border-box;
    }
  }
}

.col-name {
  flex: 1.6 1 0;
  min-width: 0;
  width: 16%;
}
.col-market {
  flex: 1.4 1 0;
  min-width: 0;
  width: 14%;
}
.col-type {
  flex: 1.2 1 0;
  min-width: 0;
  width: 12%;
}
.col-level,
.col-executor {
  flex: 1 1 0;
  min-width: 0;
  width: 10%;
}
.col-time {
  flex: 1.8 1 0;
  min-width: 0;
  width: 18%;
}
.col-progress,
.col-status {
  flex: 1 1 0;
  min-width: 0;
  width: 10%;
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
.ant-btn-sm:not(.ant-btn-primary) {
  border: 0.00521rem solid #1285ff;
  background-color: rgba(4, 17, 32, 0.95);
  color: #1285ff;
  box-shadow: none !important;
}
.ant-btn-primary {
  background-color: #1285ff !important;
  border: 1px solid #1285ff !important;
  color: #fff !important;
  box-shadow: none !important;
}
</style>
