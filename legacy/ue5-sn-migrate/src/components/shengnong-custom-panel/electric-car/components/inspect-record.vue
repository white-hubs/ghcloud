<template>
  <div class="modal-layout">
    <div class="table-top">
      <a-form ref="selectForm" :model="datainfo" layout="inline">
        <a-form-item label="所属市场">
          <a-select class="alarm-level-select" v-model:value="datainfo.marketTenant">
            <a-select-option :value="item.marketTenant" v-for="item in marketTenantList">{{ item.marketName }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="时间">
          <a-config-provider :locale="zhCN">
            <a-range-picker v-model:value="time" value-format="YYYY-MM-DD" :allowClear="false" />
          </a-config-provider>
        </a-form-item>

        <a-form-item label="">
          <a-input v-model:value="datainfo.keyword" placeholder="请输入巡检对象名称" style="width: 150px" />
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
              <div class="ellipsis">{{ item.targetName || "--" }}</div>
              <div class="ellipsis">{{ item.marketName || "--" }}</div>
              <div class="ellipsis">
                {{
                  item?.errorTag === "CHARGE"
                    ? "违规充电"
                    : item?.errorTag === "PARKING"
                      ? "违规停车"
                      : item?.errorTag === "CHARGE,PARKING" || item?.errorTag === "PARKING,CHARGE"
                        ? "违规充电,违规停车"
                        : ""
                }}
              </div>
              <div class="ellipsis">{{ item.taskName || "临时巡检" }}</div>
              <div class="ellipsis">
                {{ item.time ? dayjs(item.time).format("YYYY-MM-DD HH:mm") : "--" }}
              </div>
              <div class="ellipsis">{{ item.nickname || "--" }}</div>
              <div :class="item.result" class="ellipsis">
                {{ item.result ? (item.result === "NORMAL" ? "正常" : item.result === "ABNORMAL" ? "异常" : "") : "--" }}
              </div>
              <div class="ellipsis">
                <a style="color: #5eacff" @click="clickRow(item)">详情</a>
              </div>
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
  <Modal
    :show="detailModalShow"
    :title="`车辆违规/违停详情【${inspectParameter?.marketName || inspectParameter?.market || inspectParameter.name}】`"
    @close="closeModal"
  >
    <inspect v-if="detailModalShow" @close="closeModal" :parameter="inspectParameter"></inspect>
  </Modal>
</template>
<script setup lang="ts">
import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs from "dayjs";
import { onUnmounted, nextTick, reactive, ref, watch } from "vue";

import inspect from "./inspect-detail/index.vue";
import { getMarketConfig } from "@/api/shennong/alarm";
import { getMarketList } from "@/api/shennong/compre";
import { getSafetyMarketElectronicCarData } from "@/api/shennong/safety";
import NoData from "@/components/businessPanel/public/noData.vue";
import useEscClose from "@/components/hooks/useEscClose";
import Modal from "@/components/modal-table/modal.vue";
import { storeArea } from "@/piniaStore/area";
import { filterMarketOptions } from "@/utils/common";

interface Props {
  parameter: Record<string, any>;
  showTenantSearch?: boolean;
}
const piniaStoreArea = storeArea();
const props = defineProps<Props>();
const selectForm = ref();
const emit = defineEmits(["close", "detailVisible"]);
const marketTenantList = ref([]);
const time = ref(props.parameter.period);
const getSearch = () => {
  return new Promise(async (resolve, reject) => {
    Promise.all([await getMarketList()])
      .then((res) => {
        marketTenantList.value = filterMarketOptions(res[0]);
        resolve(res);
      })
      .catch((error) => {
        resolve("");
      });
  });
};
const datainfo = reactive<Record<string, unknown>>({
  marketTenant: props.parameter.marketTenant || null,
  period: "",
  keyword: "",
  tagList: [],
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});

watch(
  () => props.parameter,
  async () => {
    datainfo.marketTenant = props.parameter.marketTenant;
    datainfo.id = props.parameter.id;
    Object.assign(datainfo, props.parameter);
    nextTick(() => {
      getSearch();
      getData();
      // getMarketListData()
      // getMarketDetail(datainfo.marketTenant as string)
    });
  },
  { deep: true, immediate: true },
);

const dataSource = ref([]);
const loadingDataSource = ref(false);
const table_header = ["巡检对象", "所属市场", "违规类型", "所属巡检任务", "巡检时间", "巡检人", "巡检结果", "操作"];
const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};

const getlist = async () => {
  if (Array.isArray(datainfo.period)) datainfo.period = datainfo.period.join(",");
  datainfo.tagList = props.parameter.tagList;
  const params = {
    errorTags: datainfo.tagList,
    period: datainfo.period,
    targetName: datainfo?.keyword,
    pageSize: datainfo.pageSize,
    marketTenant: datainfo.marketTenant,
    pageNumber: datainfo.pageNumber,
  };
  const data = await getSafetyMarketElectronicCarData(params);
  dataSource.value = data.records;
  datainfo.total = data.total;
};
const getData = async () => {
  loadingDataSource.value = true;
  if (time.value?.length) {
    datainfo.period = dayjs(time.value[0]).format("YYYY-MM-DD 00:00:00") + "," + dayjs(time.value[1]).format("YYYY-MM-DD 23:59:59");
  }
  loadingDataSource.value = false;
  getlist();
};
const query = () => {
  getData();
};
const reset = () => {
  time.value = [];
  Object.assign(datainfo, {
    marketTenant: null,
    period: "",
    keyword: "",
    depId: null,
    pageSize: 10,
    pageNumber: 1,
    total: 0,
  });
  getData();
};
const marketData = ref(piniaStoreArea.marketDataCN ?? []);
// const getMarketListData = async () => {
//   const tenant = marketData.value.find(e => e.marketName === props.parameter.name)?.marketTenant
//   datainfo.marketTenant = props.parameter.marketTenant || tenant;
// };
const detailModalShow = ref<boolean>(false);
const inspectParameter = ref<Record<string, any>>({
  applicationCode: "",
  id: "",
  marketTenant: "",
  marketName: "",
  dateRange: "",
});
const clickRow = (record) => {
  inspectParameter.value = Object.assign(inspectParameter.value, { ...datainfo, ...record });
  detailModalShow.value = true;
  emit("detailVisible", true);
};
const closeModal = () => {
  detailModalShow.value = false;
  emit("detailVisible", false);
};
useEscClose(() => {
  if (detailModalShow.value) {
    closeModal();
  }
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

.NORMAL {
  color: #1ec138 !important;
}

.ABNORMAL {
  color: #ff3d3d !important;
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
