<template>
  <div class="modal-layout">
    <div class="table-top">
      <a-form ref="selectForm" :model="datainfo" layout="inline">
        <a-form-item label="所属市场">
          <a-select
            class="alarm-level-select"
            v-model:value="datainfo.marketTenant"
            placeholder="请选择市场"
            :options="marketlist"
            :field-names="{ label: 'marketName', value: 'marketTenant' }"
          >
          </a-select>
        </a-form-item>
        <a-form-item label="产品品类" class="handle-status-select">
          <a-select v-model:value="datainfo.type" style="width: 120px">
            <a-select-option :value="item" v-for="item in alarmHandleEnumerate">{{ item }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="设备状态" class="handle-status-select">
          <a-select v-model:value="datainfo.status">
            <a-select-option :value="item.value" v-for="item in alarmHandleEnumerate1">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" size="small" @click="query" :loading="loadingDataSource">查询</a-button>
          <a-button size="small" style="margin-left: 15px" @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div style="margin-top: 15px; height: 420px; overflow-y: auto">
      <div class="table_header">
        <div v-for="item in table_header" :class="{ 'col-index': item === '序号' }">{{ item }}</div>
      </div>
      <a-spin :spinning="loadingDataSource">
        <div class="table_content">
          <div v-if="dataSource.length === 0" class="no-content">
            <NoData />
          </div>
          <div v-else v-for="(item, index) in dataSource">
            <div class="content">
              <div class="col-index">{{ index + 1 }}</div>
              <div>{{ item.deviceName }}</div>
              <div>{{ item.marketName }}</div>
              <div style="">{{ item.deviceType }}</div>

              <div>{{ item.dep }}</div>
              <div>{{ item.area }}</div>
              <div :style="item.state == '正常' ? 'color:#1890FF' : 'color:#FFC234'">
                {{ item.state }}
              </div>
            </div>
          </div>
        </div>
      </a-spin>
    </div>
    <div style="height: 30px">
      <a-pagination
        style="float: right; margin-top: 15px; color: #fff"
        v-model:current="datainfo.pageNumber"
        v-model:page-size="datainfo.pageSize"
        @change="onShowSizeChange"
        :total="datainfo.total"
        :show-total="(total) => `共 ${total} 条`"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import dayjs, { Dayjs } from "dayjs";
import { onMounted, reactive, ref } from "vue";

import { getMarketList } from "@/api/shennong/compre";
import { getDeviceTypeList, getfireFightingDeviceList } from "@/api/shennong/marketcard";
import NoData from "@/components/businessPanel/public/noData.vue";
import { filterMarketOptions } from "@/utils/common";

interface Props {
  periodtime: string;
  marketid: string;
  status?: string;
  typeName?: string;
}
const props = withDefaults(defineProps<Props>(), {
  periodtime: dayjs(new Date()).format("YYYY-MM-DD 00:00:00") + "," + dayjs(new Date()).format("YYYY-MM-DD 23:59:59"),
  marketid: "",
  status: "",
  typeName: "",
});

const selectForm = ref();
const emit = defineEmits(["close"]);

const time = ref<Dayjs[]>();
const marketlist = ref();
const getmarket = async () => {
  const data = await getMarketList({});
  const list = await getDeviceTypeList({});
  alarmHandleEnumerate.value = list;
  marketlist.value = filterMarketOptions(data);
};

const alarmHandleEnumerate1 = [
  {
    label: "在线",
    value: "1",
    interValue: 1,
  },
  {
    label: "离线",
    value: "0",
    interValue: 0,
  },
];

const datainfo = reactive<Record<string, any>>({
  period: "",

  marketTenant: props.marketid,
  type: props.typeName,
  state: props.status,
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});

const dataSource = ref([]);
const loadingDataSource = ref(false);

const alarmDetailData = ref({});
const show = ref(false);
const detiles = (item) => {
  // bus.emit("openAlarmModal", item);
  alarmDetailData.value = item;
  show.value = true;
};
// 关闭弹窗

/**
 * 设备定位
 */

const table_header = ["序号", "设备名称", "所属市场", "产品品类", "归属部门", "所在区域", "状态"];
const alarmHandleEnumerate = ref(["aa", "bb"]);
const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};

const getlist = async () => {
  datainfo.period = props.periodtime;

  const data = await getfireFightingDeviceList(datainfo);
  dataSource.value = data.records;
  datainfo.total = data.total;
  loadingDataSource.value = false;
};
const getData = async () => {
  loadingDataSource.value = true;
  getlist();

  loadingDataSource.value = false;
};
const query = () => {
  getData();
};
const reset = () => {
  time.value = [];

  Object.assign(datainfo, {
    period: "",

    marketTenant: "",
    type: "",
    state: "",
    pageSize: 10,
    pageNumber: 1,
    total: 0,
  });
  getData();
};
const closeModal = () => {
  emit("close");
};

onMounted(() => {
  getmarket();
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
      margin-top: 10%;
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
  min-width: 150px;
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
</style>
<style lang="less">
.modal-table-alarm {
  .modal-width {
    width: 1250px !important;
  }
}
:deep(.ant-pagination-total-text) {
  color: #fff !important;
}
</style>
