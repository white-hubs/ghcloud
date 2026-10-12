<template>
  <div class="modal-layout">
    <div class="table-top">
      <a-form ref="selectForm" :model="datainfo" layout="inline">
        <a-form-item label="工程状态">
          <a-select
            class="alarm-level-select"
            v-model:value="datainfo.status"
            placeholder="请选择状态"
            :options="marketlist"
            :field-names="{ label: 'label', value: 'value' }"
          >
          </a-select>
        </a-form-item>
        <a-form-item label="所属市场">
          <a-select
            class="alarm-level-select"
            v-model:value="datainfo.marketTenant"
            placeholder="请选择市场"
            :options="marketArr"
            :field-names="{ label: 'marketName', value: 'marketTenant' }"
          >
          </a-select>
        </a-form-item>
        <a-form-item label="完成时间">
          <a-config-provider :locale="zhCN">
            <a-range-picker v-model:value="time" value-format="YYYY-MM-DD" />
          </a-config-provider>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" size="small" @click="query" :loading="loadingDataSource">查询</a-button>
          <a-button size="small" style="margin-left: 15px" @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div style="margin-top: 15px; height: 420px; overflow-y: auto">
      <div class="table_header">
        <div v-for="item in table_header">{{ item }}</div>
      </div>
      <a-spin :spinning="loadingDataSource">
        <div class="table_content">
          <div v-if="dataSource.length === 0" class="no-content">
            <NoData />
          </div>
          <div v-else v-for="(item, index) in dataSource">
            <div class="content">
              <div>{{ item.projectNum || "--" }}</div>
              <div>{{ item.projectName || "--" }}</div>
              <div>{{ item.partyB || "--" }}</div>
              <div>
                {{ item.completionTime ? dayjs(item.completionTime).format("YYYY-MM-DD HH:mm:ss") : "--" }}
              </div>
              <div>{{ item.superviseUserName || "--" }}</div>
              <div :class="item.status">{{ statusObj[item.status] }}</div>
              <div>{{ item.marketName || "--" }}</div>
            </div>
          </div>
        </div>
      </a-spin>
    </div>
    <div style="height: 30px">
      <a-pagination
        style="float: right; margin-top: 15px"
        v-model:current="datainfo.pageNumber"
        show-size-changer
        v-model:page-size="datainfo.pageSize"
        @change="onShowSizeChange"
        :total="datainfo.total"
        :show-total="(total) => `共 ${total} 条`"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs, { Dayjs } from "dayjs";
import { onMounted, reactive, ref, watch } from "vue";

import { organizationsList } from "@/api/ouaa";
import { getMarketList, looseWorksList } from "@/api/shennong/compre";
import NoData from "@/components/businessPanel/public/noData.vue";
import { filterMarketOptions } from "@/utils/common";
import enumerateData from "@/utils/enumeratie";

const { alarmLeaveOptions, alarmStatusOptions } = enumerateData();
interface Props {
  periodtime: string[];
  type: string;
  marketId: string;
}
const props = withDefaults(defineProps<Props>(), {
  type: "",
  marketId: "",
});
const entry = ref(window.config.entry);
const selectForm = ref();
const emit = defineEmits(["close"]);
const time = ref(props.periodtime);
const marketlist = [
  {
    label: "进行中",
    value: "UNDERWAY",
  },
  {
    label: "已完成",
    value: "COMPLETED",
  },
  {
    label: "待验收",
    value: "WAIT_ACCEPT",
  },
];
const statusObj = {
  UNDERWAY: "进行中",
  COMPLETED: "已完成",
  WAIT_ACCEPT: "待验收",
};

const datainfo = reactive<Record<string, unknown>>({
  marketTenant: props.marketId || undefined,
  period: "",
  status: undefined,
  state: null,
  depId: null,
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});

const dataSource = ref([]);
const loadingDataSource = ref(false);
const departmentData = ref([]);
const table_header = ["工程编号", "小散工程名称", "乙方", "完成时限", "监管负责人", "工程状态", "所属市场"];
const getDepartment = async () => {
  departmentData.value = await organizationsList({
    pageSize: 50,
    pageNumber: 1,
    enabled: true,
  });
};
const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};

const getlist = async () => {
  if (Array.isArray(datainfo.period)) datainfo.period = datainfo.period.join(",");
  const data = await looseWorksList(datainfo);
  dataSource.value = data.records;
  datainfo.total = data.total;
};
const getData = async () => {
  loadingDataSource.value = true;
  if (time.value?.length) {
    datainfo.period = dayjs(time.value[0]).format("YYYY-MM-DD 00:00:00") + "," + dayjs(time.value[1]).format("YYYY-MM-DD 23:59:59");
    getlist();
  } else {
    datainfo.period = props.periodtime;
    getlist();
  }
  loadingDataSource.value = false;
};
const query = () => {
  getData();
};
const reset = () => {
  time.value = [];

  Object.assign(datainfo, {
    marketTenant: undefined,
    period: "",
    status: undefined,
    state: null,
    depId: null,
    pageSize: 10,
    pageNumber: 1,
    total: 0,
  });
  getData();
};
const marketArr = ref<unknown[]>([]);
const getMarketListData = async () => {
  const data = await getMarketList({});
  marketArr.value = filterMarketOptions(data);
};
onMounted(() => {
  getMarketListData();
  getData();
});
</script>

<style lang="less" scoped>
:deep(.ant-btn-sm) {
  border: 1px solid #1285ff;
  background-color: rgba(4, 17, 32, 0.95);
  color: #1285ff;
}

:deep(.ant-btn-primary) {
  background-color: #1285ff;
  color: #fff;
}

.table_header {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  display: flex;
  color: #fff;
  line-height: 48px;

  div {
    width: 20%;
    padding: 0 15px;
    text-align: center;
  }
}

:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 1);
}

:deep(.ant-select-selection-item) {
  color: rgba(255, 255, 255, 1);
}

.table_content {
  // display: flex;
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

    div {
      width: 20%;
      line-height: 48px;
      height: 48px;
      border-bottom: 1px solid rgba(105, 116, 140, 0.5);
      text-align: center;
      white-space: nowrap;
      color: rgba(217, 231, 255, 1);
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.alarm-time-picker {
  width: 250px;
}

.alarm-level-select,
.handle-status-select {
  width: 150px;
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

.UNDERWAY {
  color: #ffaa26 !important;
}

.COMPLETED {
  color: #00c6bc !important;
}

.WAIT_ACCEPT {
  color: #1890ff !important;
}
:deep(.ant-pagination-total-text) {
  color: #fff;
}
</style>
<style lang="less">
.modal-table-alarm {
  .modal-width {
    width: 1250px !important;
  }
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
</style>
