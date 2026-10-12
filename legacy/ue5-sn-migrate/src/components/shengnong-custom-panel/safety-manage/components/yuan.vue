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
        <a-form-item label="事件分类" class="handle-status-select">
          <a-select v-model:value="datainfo.type">
            <a-select-option :value="item.value" v-for="item in alarmHandleEnumerate">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" size="small" @click="query" :loading="loadingDataSource">查询</a-button>
          <a-button size="small" style="margin-left: 15px" @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div style="margin-top: 15px">
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
              <div>{{ item.name }}</div>
              <div>{{ item.emergencyEventTypeName }}</div>
              <div>{{ item.marketName }}</div>

              <div>{{ item.remark }}</div>
            </div>
          </div>
        </div>
      </a-spin>
    </div>
    <div style="height: 30px">
      <a-pagination
        style="float: right; margin-top: 15px"
        v-model:current="datainfo.pageNumber"
        v-model:page-size="datainfo.pageSize"
        @change="onShowSizeChange"
        :total="datainfo.total"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import dayjs, { Dayjs } from "dayjs";
import { onMounted, reactive, ref, watch } from "vue";

import { getMarketList, emergencyFilelist } from "@/api/shennong/compre";
import NoData from "@/components/businessPanel/public/noData.vue";
import { filterMarketOptions } from "@/utils/common";

interface Props {
  periodtime: string;
  type: string;
}
const props = withDefaults(defineProps<Props>(), {
  periodtime: dayjs(new Date()).format("YYYY-MM-DD 00:00:00") + "," + dayjs(new Date()).format("YYYY-MM-DD 23:59:59"),
  type: "",
});
const selectForm = ref();
const emit = defineEmits(["close"]);

const time = ref<Dayjs[]>();
const marketlist = ref();
const getmarket = async () => {
  const data = await getMarketList({});
  marketlist.value = filterMarketOptions(data);
};

const datainfo = reactive<Record<string, any>>({
  period: "",
  putInDate: "",
  marketTenant: undefined,
  type: undefined,
  state: undefined,
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

const table_header = ["序号", "文件名称", "事件分类", "所属市场", "备注说明"];
const alarmHandleEnumerate = [
  {
    label: "消防设备",
    value: "FIRE_FIGHTING_EQUIPMENT",
  },
  {
    label: "电动车",
    value: "TRANSPORT_DEVICES",
  },
  {
    label: "易燃设备",
    value: "FLAMMABLE_EQUIPMENT",
  },
];
const alarmHandleEnumerate1 = [
  {
    label: "审批中",
    value: "UNDER",
  },
  {
    label: "闲置",
    value: "LEAVE_UNUSED",
  },
  {
    label: "在用",
    value: "MAKE_USE_OF",
  },
  {
    label: "报废",
    value: "WEED_OUT",
  },
  {
    label: "已删除",
    value: "DELETE",
  },
];
const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};

const getlist = async () => {
  datainfo.period = props.periodtime;

  const data = await emergencyFilelist(datainfo);
  dataSource.value = data.records;
  datainfo.total = data.total;
};
const getData = async () => {
  loadingDataSource.value = true;
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

  Object.assign(datainfo, {
    period: "",
    putInDate: "",
    marketTenant: undefined,
    type: undefined,
    state: undefined,
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
  datainfo.type = props.type;
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
</style>
<style lang="less">
.modal-table-alarm {
  .modal-width {
    width: 1250px !important;
  }
}
</style>
