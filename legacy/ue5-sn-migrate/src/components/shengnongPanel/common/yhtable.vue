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
        <a-form-item label="隐患分类" class="handle-status-select">
          <a-select v-model:value="datainfo.category">
            <a-select-option :value="item" v-for="item in alarmHandleEnumerate">{{ item }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="处理状态" class="handle-status-select">
          <a-select v-model:value="datainfo.status">
            <a-select-option :value="item.value" v-for="item in alarmHandleEnumerate1">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="提交时间">
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
    <div style="margin-top: 15px; min-height: 320px; overflow-y: auto">
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
              <div>{{ item.hiddenName }}</div>
              <div>{{ item.marketName }}</div>
              <div>{{ item.category ? item.category : "--" }}</div>
              <div>{{ item.levelName ? item.levelName : "--" }}</div>
              <div>{{ item.status ? item.status : "--" }}</div>
              <div>{{ item.remark ? item.remark : "--" }}</div>
              <div>{{ dayjs(item.hiddenCreateTime).format("YYYY-MM-DD HH:mm:ss") }}</div>
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
        :show-total="(total) => `共 ${total} 条`"
        @change="onShowSizeChange"
        show-size-changer
        :total="datainfo.total"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs, { Dayjs } from "dayjs";
import { onMounted, reactive, ref, watch } from "vue";

import { getMarketList } from "@/api/shennong/compre";
import { hiddenDangerList, hiddenDangerCategory } from "@/api/shennong/marketcard";
import NoData from "@/components/businessPanel/public/noData.vue";
import { filterMarketOptions } from "@/utils/common";

interface Props {
  periodtime: string[];
  marketid: string;
  type: string;
  status: string;
}
const props = withDefaults(defineProps<Props>(), {
  type: "",
  status: "",
  marketid: "",
});
const selectForm = ref();
const emit = defineEmits(["close"]);

const time = ref(props.periodtime);
const marketlist = ref();
const getmarket = async () => {
  const data = await getMarketList({});
  const list = await hiddenDangerCategory({});
  alarmHandleEnumerate.value = list;
  marketlist.value = filterMarketOptions(data);
};

const datainfo = reactive<Record<string, any>>({
  period: "",
  marketTenant: props.marketid,
  category: props.type,
  status: props.status,
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

const table_header = ["序号", "隐患单名称", "所属市场", "隐患类别", "隐患级别", "处理状态", "隐患描述", "提交时间"];
const alarmHandleEnumerate = ref([]);
const alarmHandleEnumerate1 = [
  {
    label: "待关闭",
    value: "TO_BE_CLOSED",
  },
  {
    label: "待确认",
    value: "WAITING_CONFIRM",
  },
  {
    label: "已确认",
    value: "CONFIRMED",
  },
  {
    label: "已结束",
    value: "FINISHED",
  },
  {
    label: "待处理",
    value: "WAITING_FOR_HANDLE",
  },
];
const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};

const getlist = async () => {
  const data = await hiddenDangerList(datainfo);
  dataSource.value = data.records;
  datainfo.total = data.total;
};
const getData = async () => {
  loadingDataSource.value = true;
  if (time.value?.length) {
    datainfo.period = dayjs(time.value[0]).format("YYYY-MM-DD 00:00:00") + "," + dayjs(time.value[1]).format("YYYY-MM-DD 23:59:59");
    getlist();
  } else {
    datainfo.period = "";
    getlist();
  }

  loadingDataSource.value = false;
};
const query = () => {
  getData();
};
const reset = () => {
  // time.value = [];

  Object.assign(datainfo, {
    marketTenant: "",
    category: "",
    status: "",
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
  datainfo.period = props.periodtime;
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
:deep(.ant-picker-clear) {
  background-color: #000;
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
.modal-table-alarm {
  .modal-width {
    width: 1250px !important;
  }
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
