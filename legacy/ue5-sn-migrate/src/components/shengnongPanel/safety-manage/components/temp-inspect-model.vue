<template>
  <Modal :title="title" :show="showModal" @close="cancel">
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
          <a-form-item label="巡检结果">
            <a-select
              class="alarm-level-select"
              v-model:value="dataInfo.result"
              placeholder="请选择巡检结果"
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
                <div>{{ item.targetName || '--' }}</div>
                <div>{{ item.marketName || '--' }}</div>
                <div>
                  {{
                    item.time
                      ? dayjs(item.time).format("YYYY-MM-DD HH:mm")
                      : "--"
                  }}
                </div>
                <div>{{ item.nickname || '--' }}</div>
                <div :class="item.result">{{ item.result ? (item.result === "NORMAL" ? "正常" : item.result === "ABNORMAL" ? "异常" : "") : "--" }}</div>
                <div :class="item.result">{{ item.errNumber ?? '--' }}</div>
                <!-- <div>
                  <a style="color: #5eacff;" @click="clickRow(item)">详情</a>
                </div> -->
              </div>
            </div>
          </div>
        </a-spin>
      </div>
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
  <inspect v-if="detailModalShow" @close="closeModal" :parameter="inspectParameter" title="临时巡检详情"></inspect>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import Modal from "@/components/modal-table/modal.vue";
import { getMarketList, inspectionTempList } from "@/api/shennong/compre";
import dayjs from "dayjs";
import inspect from "../../electric-car/components/inspect-detail/index.vue";
import { storeMarket } from "@/piniaStore/other";
const piniaStoreMarket = storeMarket();

interface Props {
  title: string;
  showModal: boolean;
  time: string;
  marketName: string;
  result: string;
}
const emit = defineEmits(["close"]);
const props = withDefaults(defineProps<Props>(), {
  title: "临时巡检记录",
  showModal: false,
  result: "",
  time:
    dayjs(new Date()).format("YYYY-MM-DD 00:00:00") +
    "," +
    dayjs(new Date()).format("YYYY-MM-DD 23:59:59"),
});
const dataInfo = reactive<Record<string, any>>({
  marketTenant: props.marketName || piniaStoreMarket.currentMarket ,
  result: props.result,
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});
const loadingDataSource = ref(false);
const table_header = [
  "巡检对象",
  "所属市场",
  "巡检时间",
  "巡检人",
  "巡检结果",
  "异常项",
];
const dataSource = ref([]);
const marketlist = ref();
const stateList = [
  {
    label: "正常",
    value: "NORMAL",
  },
  {
    label: "异常",
    value: "ABNORMAL",
  },
];
const getmarket = async () => {
  const data = await getMarketList({});
  marketlist.value = data.filter(item => item.status);
};
const query = () => {
  getInspect();
};
const getInspect = async () => {
  loadingDataSource.value = true;
  dataInfo.result = props.result;
  let params = {
    ...dataInfo,
    period: props.time,
  };
  let res = await inspectionTempList(params);
  loadingDataSource.value = false;
  dataInfo.total = res.total;
  dataSource.value = res.records;
  dataSource.value.forEach((item: any) => {
    item.time = dayjs(item.time).format("YYYY-MM-DD HH:mm:ss");
  });
};
const reset = () => {
  Object.assign(dataInfo, {
    marketTenant: null,
    result: "",
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

const detailModalShow = ref<boolean>(false);
const inspectParameter = ref<Record<string, any>>({
  applicationCode: "",
  id: "",
  marketTenant: "",
  marketName: "",
  dateRange: "",
  refreshAuth: true
});
const closeModal = (backViewPoint) => {
  detailModalShow.value = false
};
const clickRow = (record) => {
  inspectParameter.value = Object.assign(inspectParameter.value, { ...record});
  inspectParameter.value.refreshAuth = true
  detailModalShow.value = true;
};
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

.NORMAL {
  color: #1EC138 !important;
}

.ABNORMAL {
  color: #FF3D3D !important;
}
</style>
