<template>
  <Modal title="报警记录" :show="alarmRecordVisible" @close="closeModal" width="1280px">
    <div class="modal-layout">
      <div class="table-top">
        <a-form ref="selectForm" :model="datainfo" layout="inline" class="alarm-filter-form">
          <div class="filter-fields">
            <a-form-item label="报警市场">
              <a-select class="filter-select" v-model:value="datainfo.marketTenant" placeholder="请选择市场" allow-clear>
                <a-select-option :value="item.marketTenant" v-for="item in marketTenantList" :key="item.marketTenant">
                  {{ item.marketName }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="报警分类">
              <a-select class="filter-select" v-model:value="datainfo.alarmTypeCode" placeholder="请选择分类" allow-clear>
                <a-select-option :value="item.alarmTypeCode" v-for="item in alarmTypesList" :key="item.alarmTypeCode">
                  {{ item.alarmTypeName }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="处理状态">
              <a-select class="filter-select" v-model:value="datainfo.alarmStatus" placeholder="请选择状态" allow-clear>
                <a-select-option :value="item.value" v-for="item in alarmHandleEnumerate" :key="String(item.value)">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="报警时间">
              <a-range-picker class="alarm-time-picker filter-control" v-model:value="time" format="YYYY-MM-DD" :allowClear="false" />
            </a-form-item>
            <a-form-item>
              <a-input class="filter-keyword filter-control" placeholder="关键字" v-model:value="keyword" allow-clear />
            </a-form-item>
          </div>
          <div class="filter-actions">
            <a-button type="primary" size="small" @click="query">查询</a-button>
            <a-button size="small" class="reset-btn" @click="reset">重置</a-button>
          </div>
        </a-form>
      </div>
      <div class="table-body">
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
                <div class="ellipsis">
                  <a-popover :content="item.alarmEventTypeName">{{ item.alarmEventTypeName }}</a-popover>
                </div>
                <div class="ellipsis">
                  <a-popover :content="item.marketName">{{ item.marketName }}</a-popover>
                </div>
                <div class="ellipsis">
                  <a-popover :content="item.areaName">{{ item.areaName }}</a-popover>
                </div>
                <div class="ellipsis">
                  <a-popover :content="dayjs(item.alarmTime).format('YYYY-MM-DD HH:mm:ss')">{{
                    dayjs(item.alarmTime).format("YYYY-MM-DD HH:mm:ss")
                  }}</a-popover>
                </div>
                <div class="ellipsis" :style="getlevelcolor(item.alarmLevelName)">
                  <a-popover :content="item.alarmLevelName">{{ item.alarmLevelName }}</a-popover>
                </div>
                <div class="ellipsis">
                  <a-popover :content="item.timeoutProcessTimesName">{{ item.timeoutProcessTimesName }}</a-popover>
                </div>
                <div class="ellipsis">
                  <a-popover :content="item.alarmHandlerTimeoutStatusName">{{ item.alarmHandlerTimeoutStatusName }}</a-popover>
                </div>
                <div class="ellipsis">
                  <a-popover :content="item.alarmStatusName">{{ item.alarmStatusName }}</a-popover>
                </div>
                <div class="ellipsis">
                  <a-popover :content="item.alarmHandlerName">{{ item.alarmHandlerName }}</a-popover>
                </div>
                <div>
                  <a @click="detiles(item, index)" style="color: #5eacff; margin-left: 14px">详情</a>
                  &nbsp;&nbsp;&nbsp;
                  <a @click="position(item)" v-if="entry == 'views'">定位</a>
                </div>
              </div>
            </div>
          </div>
        </a-spin>
      </div>
      <div class="table-pagination">
        <a-pagination
          :show-total="(total) => `共 ${total} 条`"
          v-model:current="datainfo.pageNumber"
          v-model:page-size="datainfo.pageSize"
          @change="onShowSizeChange"
          :total="datainfo.total"
          show-size-changer
        />
      </div>
    </div>
  </Modal>
  <Modal
    :show="show"
    :title="`${alarmDetailData?.alarmTypeName}【${marketName || alarmDetailData?.marketName || alarmDetailData?.market}】`"
    @close="closeAlarm"
  >
    <Alarm
      v-if="show"
      @close="closeAlarm"
      @closeDevicePanel="closeDevicePanel"
      :alarmDetailData="alarmDetailData"
      :isalarm="true"
      :marketName="marketName"
    />
  </Modal>
</template>
<script setup lang="ts">
import { message, Popover } from "ant-design-vue";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import qs from "qs";
import { onMounted, reactive, ref, watch } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import useEscClose from "../hooks/useEscClose";
import Modal from "./modal.vue";
import { satalarmlevels } from "@/api/alarm";
import { alarmRecordPage, alarmTypes } from "@/api/shennong/alarm";
import { getMarketConfig } from "@/api/shennong/alarm";
import { getMarketList } from "@/api/shennong/compre";
import Alarm from "@/components/alarmdetails/equipmentModesn.vue";
import NoData from "@/components/businessPanel/public/noData.vue";
import bus from "@/utils/bus";
import { filterMarketOptions } from "@/utils/common";
import enumerateData from "@/utils/enumeratie";

const ueClient = UeClient.getInstance();
const emit = defineEmits(["close"]);

interface Props {
  parameter: Record<string, any>;
  showModal: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  title: "报警记录",
  showModal: false,
});
const alarmRecordVisible = ref(props.showModal);
const time = ref<Dayjs[]>(
  props.parameter.dateRange?.length > 1 ? [dayjs(props.parameter.dateRange[0]), dayjs(props.parameter.dateRange[1])] : [],
);
const keyword = ref("");
const datainfo = reactive<Record<string, any>>({
  period: "",
  alarmLevelId: undefined,
  alarmStatus: props.parameter.alarmStatus ?? "",
  alarmTypeCode: props.parameter.alarmTypeCode || undefined,
  pageSize: 10,
  pageNumber: 1,
  total: 0,
  marketTenant: props.parameter.marketTenant || undefined,
});
const marketTenantList = ref();
const alarmTypesList = ref();
const entry = ref(window?.config?.entry);
const selectForm = ref();
const { alarmLeaveOptions, alarmStatusOptions } = enumerateData();
const getlevelcolor = (name: string) => {
  return `color:${alarmLeaveOptions.value.find((res) => res.label == name + "报警").color}`;
};
const dataSource = ref([]);
const loadingDataSource = ref(false);
const alarmDetailData = ref<any>({});
const show = ref(false);
const marketName = ref("");
const detiles = async (item, index) => {
  marketName.value = item.marketName;
  try {
    const data = await getMarketConfig({ id: item.marketTenant });
    sessionStorage.setItem("market-tenant", data?.marketTenant);

    const params = {
      grant_type: "client_credentials",
      client_id: data.account,
      client_secret: data.password,
    };
    axios
      .post(`${data?.url}/api/ouaa/oauth/token`, qs.stringify(params))
      .then((value) => {
        sessionStorage.setItem("market-token", value.data.access_token);
        sessionStorage.setItem("market-baseUrl", data?.url);
        alarmDetailData.value = item;
        alarmDetailData.value.index = index;
        // 下钻详情：关闭列表弹窗，仅展示详情
        alarmRecordVisible.value = false;
        show.value = true;
      })
      .catch(() => {
        sessionStorage.removeItem("market-token");
        sessionStorage.removeItem("market-baseUrl");
        sessionStorage.removeItem("market-tenant");
      });
  } catch (error) {
    sessionStorage.removeItem("market-token");
    sessionStorage.removeItem("market-baseUrl");
    sessionStorage.removeItem("market-tenant");
  }
};
/** 关闭详情后回到报警列表 */
const closeAlarm = () => {
  show.value = false;
  if (props.showModal) {
    alarmRecordVisible.value = true;
  }
};
/** 详情内跳转设备等：关闭列表与详情 */
const closeDevicePanel = () => {
  show.value = false;
  alarmRecordVisible.value = false;
  emit("close");
};
/**
 * 设备定位
 */
const position = async (item) => {
  // 记录当前视角
  await ueClient.saveNowViewPoint();
  // 全局查找属性匹配的目标
  ueClient.send("getActorById", { id: item.alarmTargetCode }, function (res) {
    if (res.id) {
      closeModal();
      ueClient.send("focusActor", { id: res.id });
      ueClient.send("startFlash", { id: res.id, level: 1 });
      ueClient.send("showShell", { id: res.id });
    } else {
      message.error("模型中未找到对应设备");
    }
  });
};

const level = ref([]);
const table_header = [
  "序号",
  "报警事件",
  "报警市场",
  "报警区域",
  "报警时间",
  "报警级别",
  "处理时限",
  "超时状态",
  "处理状态",
  "处理人",
  "操作",
];
const alarmHandleEnumerate = [
  {
    label: "所有",
    value: "",
  },
  {
    label: "待接收",
    value: "ALARM_UN_CONFIRMED",
    color: "#D9001B",
  },
  {
    label: "处理中",
    value: "ALARM_PROGRESS_CONFIRMED",
    color: "#F59A23",
  },
  {
    label: "已挂起",
    value: "ALARM_SUSPEND",
    color: "#02A7F0",
  },
  {
    label: "已处理",
    value: "ALARM_HANDLER",
    color: "#70B603",
  },
];
const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};
const getTableData = async () => {
  let leveldata = await satalarmlevels();

  level.value = leveldata;
  level.value.unshift({
    name: "所有",
    id: "",
  });
};
const getData = async () => {
  try {
    dataSource.value = [];
    loadingDataSource.value = true;
    if (time.value?.length) {
      datainfo.period = dayjs(time.value[0]).format("YYYY-MM-DD 00:00:00") + "," + dayjs(time.value[1]).format("YYYY-MM-DD 23:59:59");
    } else {
      datainfo.period = "";
    }
    datainfo.keyword = keyword.value;
    let data = await alarmRecordPage({ marketTenant: props.parameter.marketTenant, ...datainfo });
    dataSource.value = data.records;
    datainfo.total = data.total;
  } catch (error) {
  } finally {
    loadingDataSource.value = false;
  }
};
const getSearch = () => {
  return new Promise(async (resolve, reject) => {
    Promise.all([await getMarketList(), await alarmTypes()])
      .then((res) => {
        marketTenantList.value = filterMarketOptions(res[0]);
        alarmTypesList.value = res[1];
        const currentMarket = marketTenantList.value.filter((item) => item.marketName === props.parameter.name)[0];
        datainfo.marketTenant = currentMarket?.marketTenant || undefined;
        resolve(res);
      })
      .catch((error) => {
        resolve("");
      });
  });
};
const query = () => {
  datainfo.pageNumber = 1;
  getData();
};
const reset = () => {
  time.value = [];
  keyword.value = "";
  Object.assign(datainfo, {
    period: "",
    alarmLevelId: undefined,
    alarmStatus: "",
    pageSize: 10,
    pageNumber: 1,
    total: 0,
    alarmHandlerResult: undefined,
    alarmTypeId: undefined,
    alarmEventTypeCode: undefined,
    alarmHandlerTimeoutStatus: undefined,
    alarmTypeCode: undefined,
    marketTenant: undefined,
  });
  getData();
};
const closeModal = () => {
  // 列表关闭时一并关掉详情，避免残留
  show.value = false;
  alarmRecordVisible.value = false;
  emit("close");
};
useEscClose(() => {
  if (show.value) {
    closeAlarm();
    return;
  }
  if (alarmRecordVisible.value) {
    closeModal();
  }
});

const formatParam = () => {
  datainfo.applicationCode = props.parameter.applicationCode ? props.parameter.applicationCode : datainfo.applicationCode;
  datainfo.alarmStatus = props.parameter.alarmStatus ? props.parameter.alarmStatus : (datainfo.alarmStatus ?? "");
  datainfo.alarmHandlerResult = props.parameter.alarmHandleResult;
  datainfo.alarmTypeId = props.parameter.alarmTypeId;
  datainfo.alarmLevelId = props.parameter.alarmLevelId;
  datainfo.alarmEventTypeCode = props.parameter.alarmEventTypeCode;
  datainfo.alarmEventTypeCodes = props.parameter.alarmEventTypeCodes;
  datainfo.alarmHandlerTimeoutStatus = props.parameter.alarmHandlerTimeoutStatus;
  datainfo.alarmTypeCode = props.parameter.alarmTypeCode || undefined;
  datainfo.filterAlarmStatus = props.parameter.filterAlarmStatus;
  datainfo.marketTenant = props.parameter.marketTenant || undefined;
  datainfo.filterAlarmEventTypeCodes = props.parameter.filterAlarmEventTypeCodes;
};
watch(
  () => props.showModal,
  async () => {
    alarmRecordVisible.value = props.showModal;
    datainfo.period = "";
    datainfo.alarmLevelId = undefined;
    datainfo.alarmStatus = "";
    datainfo.alarmTypeCode = undefined;
    datainfo.pageNumber = 1;
    datainfo.total = 0;
    formatParam();
    if (alarmRecordVisible.value) {
      getSearch();
      updateTime();
      getTableData();
      getData();
    }
  },
);
watch(
  () => props.parameter,
  async () => {
    formatParam();
    getSearch();
    updateTime();
    getTableData();
  },
  { deep: true },
);
onMounted(async () => {
  formatParam();
  getSearch();
  getTableData();
  getData();
});

function updateTime() {
  if (!props.parameter?.dateRange || props.parameter?.dateRange?.length < 2) {
    return;
  }
  time.value = [dayjs(props.parameter.dateRange[0]), dayjs(props.parameter.dateRange[1])];
}
</script>

<style lang="less" scoped>
.table-top {
  .alarm-filter-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  .filter-fields {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 16px;
    flex: 0 1 auto;
    min-width: 0;
  }

  .filter-actions {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    gap: 12px;
    margin-left: 0;
  }

  :deep(.ant-form-item) {
    margin-right: 0 !important;
    margin-bottom: 0 !important;
  }

  :deep(.ant-form-item-label > label) {
    color: #fff !important;
    height: 32px;
    line-height: 32px;
  }

  /* Select / DatePicker / Input 触发框统一 */
  :deep(.filter-select .ant-select-selector),
  :deep(.alarm-time-picker.ant-picker),
  :deep(.filter-keyword.ant-input-affix-wrapper),
  :deep(.filter-keyword.ant-input:not(.ant-input-affix-wrapper *)) {
    background: rgba(16, 40, 68, 0.9) !important;
    border: 1px solid rgba(41, 137, 255, 0.45) !important;
    border-radius: 4px !important;
    min-height: 32px !important;
    height: 32px !important;
    box-shadow: none !important;
  }

  /* allow-clear 时避免 wrapper + input 双层边框 */
  :deep(.filter-keyword.ant-input-affix-wrapper .ant-input) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    height: 30px !important;
    min-height: 30px !important;
  }

  :deep(.filter-select .ant-select-selection-placeholder),
  :deep(.filter-keyword::placeholder),
  :deep(.filter-keyword input::placeholder),
  :deep(.ant-input-affix-wrapper .ant-input::placeholder) {
    color: rgba(217, 231, 255, 0.75) !important;
    opacity: 1 !important;
    -webkit-text-fill-color: rgba(217, 231, 255, 0.75) !important;
  }

  :deep(.filter-select .ant-select-selection-item),
  :deep(.alarm-time-picker .ant-picker-input > input),
  :deep(.alarm-time-picker .ant-picker-separator),
  :deep(.alarm-time-picker .ant-picker-suffix),
  :deep(.filter-keyword),
  :deep(.filter-keyword input) {
    color: #fff !important;
    -webkit-text-fill-color: #fff !important;
  }

  :deep(.alarm-time-picker .ant-picker-input > input) {
    background: transparent !important;
  }
}

.filter-select {
  width: 132px;
}

.filter-keyword {
  width: 160px;
}

.alarm-time-picker {
  width: 230px;
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
  padding-bottom: 0;
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
    width: 20%;
    padding: 0 15px;
    text-align: center;
    text-wrap: nowrap;
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

    div {
      width: 20%;
      line-height: 48px;
      height: 48px;
      border-bottom: 1px solid rgba(105, 116, 140, 0.5);
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0 10px;
    }
  }
}

:deep(.ant-btn-sm:not(.ant-btn-primary)) {
  border: 1px solid #1285ff !important;
  background-color: rgba(4, 17, 32, 0.95);
  color: #1285ff;
  box-shadow: none !important;
}

:deep(.ant-btn-primary.ant-btn-sm),
:deep(.ant-btn-primary) {
  background-color: #1285ff !important;
  border: 1px solid #1285ff !important;
  color: #fff !important;
  box-shadow: none !important;
  outline: none !important;
  text-shadow: none !important;
}

:deep(.ant-btn-primary::before),
:deep(.ant-btn-primary::after) {
  display: none !important;
}

:deep(.ant-pagination-total-text),
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

:deep(.ant-select-item),
:deep(.ant-empty-small) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}

:deep(.ant-select-item-empty) {
  background: rgba(255, 255, 255, 0.1) !important;
}
</style>
