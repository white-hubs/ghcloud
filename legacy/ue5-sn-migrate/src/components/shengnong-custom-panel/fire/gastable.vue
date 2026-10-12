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
        <a-form-item label="风险源类别" class="handle-status-select" v-show="showClass">
          <a-select v-model:value="datainfo.class">
            <a-select-option :value="item.value" v-for="item in alarmHandleEnumerate">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态" class="handle-status-select" style="margin-left: 10px">
          <a-select v-model:value="datainfo.state">
            <a-select-option :value="item.value" v-for="item in alarmHandleEnumerate1">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="入库时间">
          <a-range-picker class="alarm-time-picker" v-model:value="time" format="YYYY-MM-DD" :allowClear="false" />
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
              <div>{{ item.serialNumber || "--" }}</div>
              <div>{{ item.bimCode || "--" }}</div>
              <div>{{ item.propertyName || "--" }}</div>
              <div>{{ item.marketName || "--" }}</div>
              <div>{{ item.deviceType || "--" }}</div>
              <div>{{ item.area || "--" }}</div>
              <div>{{ item.stallName || "--" }}</div>
              <div>{{ item.sitePointName || "--" }}</div>
              <div>{{ item.address || item.attribute || "--" }}</div>
              <div :style="item.state == '已过期' ? 'color:#FFC234' : 'color:#1890FF'">
                {{ item.state || "--" }}
              </div>
              <div style="">{{ item.maintenanceDepName || "--" }}</div>
              <div style="">{{ item.receiveDepName || "--" }}</div>
            </div>
          </div>
        </div>
      </a-spin>
    </div>
    <div style="height: 30px">
      <a-pagination
        style="float: right; margin-top: 15px; color: #fff"
        :show-total="(total) => `共 ${total} 条`"
        v-model:current="datainfo.pageNumber"
        v-model:page-size="datainfo.pageSize"
        @change="onShowSizeChange"
        show-size-changer
        :total="datainfo.total"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { TableColumnType, message } from "ant-design-vue";
import dayjs, { Dayjs } from "dayjs";
import { onMounted, reactive, ref, watch } from "vue";

import { getMarketList } from "@/api/shennong/compre";
import { getdeviceList } from "@/api/shennong/marketcard";
import NoData from "@/components/businessPanel/public/noData.vue";
import { filterMarketOptions } from "@/utils/common";
import enumerateData from "@/utils/enumeratie";

const { alarmLeaveOptions, alarmStatusOptions } = enumerateData();
interface Props {
  periodtime: string;
  type: string;
  marketid: string;
  status?: string;
  marketName: string;
  showClass: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  periodtime: dayjs(new Date()).format("YYYY-MM-DD 00:00:00") + "," + dayjs(new Date()).format("YYYY-MM-DD 23:59:59"),
  type: "",
  marketid: "",
  marketName: "",
  status: "",
  showClass: true,
});

const selectForm = ref();
const emit = defineEmits(["close"]);

const time = ref<Dayjs[]>([]);
watch(
  () => props.periodtime,
  (newVal) => {
    if (newVal) {
      const arr = props.periodtime.split(",") ?? [];
      time.value = [dayjs(arr[0]), dayjs(arr[1])];
    }
  },
  { immediate: true, deep: true },
);
const marketlist = ref();
const getmarket = () => {
  return new Promise(async (resolve, reject) => {
    Promise.all([await getMarketList()])
      .then((res) => {
        marketlist.value = filterMarketOptions(res[0]);
        if (props.marketName) {
          const currentMarket = marketlist.value.filter((item) => item.marketName === props.marketName)[0];
          datainfo.marketTenant = currentMarket?.marketTenant;
        }
        if (props.marketid) {
          datainfo.marketTenant = props.marketid;
        }
        resolve(res);
      })
      .catch((error) => {
        resolve("");
      });
  });
};

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

const table_header = [
  "序号",
  "风险源编码",
  "模型编码",
  "风险源名称",
  "所属市场",
  "风险源类别",
  "所在区域",
  "关联档位",
  "关联现场点",
  "详细地址",
  "状态",
  "维护部门",
  "使用部门",
];
let alarmHandleEnumerate = [
  {
    label: "氧气瓶",
    value: "OXYGEN_CYLINDER",
  },
  {
    label: "电动车",
    value: "ELECTRO_MOBILE",
  },
  {
    label: "消防设备",
    value: "FIRE_FIGHTING_EQUIPMENT",
  },
];
const alarmHandleEnumerate1 = [
  {
    label: "未过期",
    value: "NORMAL",
  },
  {
    label: "已过期",
    value: "EXPIRE",
  },
];
let stateObj = alarmHandleEnumerate1.filter((item) => item.label === props.status)[0];
const datainfo = reactive<Record<string, any>>({
  period: "",
  putInDate: "",
  marketTenant: props.marketid,
  type: "",
  subType: "",
  class: "",
  state: props.status ? (props.status === "未过期" ? "NORMAL" : "EXPIRE") : "",
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});

const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};

const getlist = async () => {
  datainfo.period = props.periodtime;
  const data = await getdeviceList(datainfo);
  dataSource.value = data.records;
  datainfo.total = data.total;
};
const getData = async () => {
  loadingDataSource.value = true;
  if (["OXYGEN_CYLINDER", "ELECTRO_MOBILE"].includes(datainfo.class) || ["OXYGEN_CYLINDER", "ELECTRO_MOBILE"].includes(props.type)) {
    datainfo.type = "";
    datainfo.subType = datainfo.class;
  } else {
    datainfo.subType = "";
    datainfo.type = datainfo.class;
  }
  if (time.value?.length) {
    datainfo.putInDate = dayjs(time.value[0]).format("YYYY-MM-DD 00:00:00") + "," + dayjs(time.value[1]).format("YYYY-MM-DD 23:59:59");
    getlist();
  } else {
    datainfo.putInDate = "";
    getlist();
  }

  loadingDataSource.value = false;
};
const query = () => {
  getData();
};
const reset = () => {
  time.value = [];
  const classValue = datainfo.class;
  Object.assign(datainfo, {
    period: "",
    putInDate: "",
    marketTenant: "",
    type: "",
    subType: "",
    class: props.showClass ? "" : classValue,
    state: "",
    pageSize: 10,
    pageNumber: 1,
    total: 0,
  });
  getData();
};
watch(
  () => props.type,
  (n) => {
    datainfo.state = "";
    time.value = [];
    getmarket().then((res) => {
      getData();
    });
  },
);
onMounted(() => {
  datainfo.class = props.type;
  if (["OXYGEN_CYLINDER", "ELECTRO_MOBILE"].includes(datainfo.class) || ["OXYGEN_CYLINDER", "ELECTRO_MOBILE"].includes(props.type)) {
    datainfo.type = "";
    datainfo.subType = datainfo.class;
  } else {
    datainfo.subType = "";
    datainfo.type = datainfo.class;
  }
  getmarket().then((res) => {
    getData();
  });
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
    width: 22%;
    padding: 0 5px;
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
      margin-top: 3%;
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
:deep(.ant-empty-small),
.ant-empty-small {
  color: #fff;
}
:deep(.ant-pagination-item),
:deep(.ant-select-dropdown) {
  background: rgba(255, 255, 255, 0.1) !important;
  a {
    color: #fff;
  }
}

:deep(.ant-pagination-item-active) {
  background: #1890ff !important;
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
