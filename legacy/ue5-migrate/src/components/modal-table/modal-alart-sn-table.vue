<template>
  <Modal
    title="报警记录"
    :show="showModal"
    @close="closeModal"
    wrapClassName="modal-table-alarm"
  >
    <div class="modal-layout">
      <div class="table-top">
        <a-form ref="selectForm" :model="datainfo" layout="inline">
          <a-form-item label="报警市场">
            <a-select class="alarm-level-select" v-model:value="datainfo.marketTenant">
              <a-select-option
                :value="item.marketTenant"
                v-for="item in marketTenantList"
                >{{ item.marketName }}</a-select-option
              >
            </a-select>
          </a-form-item>
          <a-form-item label="报警分类" class="handle-status-select">
            <a-select v-model:value="datainfo.alarmTypeCode">
              <a-select-option
                :value="item.alarmTypeCode"
                v-for="item in alarmTypesList"
                >{{ item.alarmTypeName }}</a-select-option
              >
            </a-select>
          </a-form-item>
          <a-form-item label="处理状态" class="handle-status-select">
            <a-select v-model:value="datainfo.alarmStatus">
              <a-select-option :value="item.value" v-for="item in alarmHandleEnumerate">{{
                item.label
              }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="报警时间">
            <a-range-picker
              class="alarm-time-picker"
              v-model:value="time"
              format="YYYY-MM-DD"
              :allowClear="false"
            />
          </a-form-item>
          <a-form-item label="">
            <a-input
              style="width: 150px"
              placeholder="设备名称、报警规则"
              v-model:value="keyword"
            />
          </a-form-item>
          <a-form-item>
            <a-button
              type="primary"
              size="small"
              @click="query"
              :loading="loadingDataSource"
              >查询</a-button
            >
            <a-button size="small" style="margin-left: 15px" @click="reset"
              >重置</a-button
            >
          </a-form-item>
        </a-form>
      </div>
      <div style="margin-top: 15px;height:480px; overflow-y: auto;">
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
                <div>{{ index + 1 }}</div>
                <div>{{ item.alarmEventTypeName }}</div>
                <div>{{ item.marketName }}</div>
                <div>{{ item.areaName }}</div>
                <div>{{ dayjs(item.alarmTime).format("YYYY-MM-DD HH:mm:ss") }}</div>
                <div :style="getlevelcolor(item.alarmLevelName)">
                  {{ item.alarmLevelName }}
                </div>
                <div>{{ item.timeoutProcessTimesName }}</div>
                <div>{{ item.alarmHandlerTimeoutStatusName || "--" }}</div>
                <div>{{ item.alarmStatusName }}</div>
                <div>
                  {{
                    item.estimateHandlerTime
                      ? dayjs(item.estimateHandlerTime).format("YYYY-MM-DD HH:mm:ss")
                      : "--"
                  }}
                </div>
                <div>{{ item.alarmHandlerName || "--" }}</div>
                <div>
                  <a
                    @click="detiles(item, index)"
                    style="color: #5eacff; margin-left: 14px"
                    >详情</a
                  >
                  &nbsp;&nbsp;&nbsp;
                  <a @click="position(item)" v-if="entry == 'views'">定位</a>
                </div>
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
          :total="datainfo.total"
          show-size-changer
        />
      </div>
    </div>
    <Alarm
      @closeDevicePanel="closeDevicePanel"
      :alarmDetailData="alarmDetailData"
      v-if="show"
      @close="show = false"
      :isalarm="true"
      :marketName="marketName"
    >
    </Alarm>
  </Modal>
</template>
<script setup lang="ts">
import Modal from "./modal.vue";
import { message } from "ant-design-vue";
import { onMounted, reactive, ref, watch } from "vue";
import Alarm from "@/components/alarmdetails/equipmentModesn.vue";
import enumerateData from "@/utils/enumeratie";
import dayjs, { Dayjs } from "dayjs";
import NoData from "@/components/businessPanel/public/noData.vue";
import {UeClient} from "@ghcloud/cube-visual-sdk";
import { satalarmlevels } from "@/api/alarm";
import { getMarketList } from "@/api/shennong/compre";
import { alarmRecordPage, alarmTypes } from "@/api/shennong/alarm";
import bus from "@/utils/bus";
import { getMarketConfig } from "@/api/shennong/alarm";
import axios from "axios";
import qs from "qs";
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
const time = ref<Dayjs[]>(
  props.parameter.dateRange?.length > 1
    ? [dayjs(props.parameter.dateRange[0]), dayjs(props.parameter.dateRange[1])]
    : []
);
const keyword = ref("");
const datainfo = reactive<Record<string, any>>({
  period: "",
  alarmLevelId: "",
  alarmStatus: "",
  alarmTypeCode: "",
  pageSize: 10,
  pageNumber: 1,
  total: 0,
  marketTenant: props.parameter.marketTenant
});
const marketTenantList = ref();
const alarmTypesList = ref();
const entry = ref(window.config.entry);
const selectForm = ref();
const { alarmLeaveOptions, alarmStatusOptions } = enumerateData();
const getlevelcolor = (name: string) => {
  return `color:${
    alarmLeaveOptions.value.find((res) => res.label == name + "报警").color
  }`;
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
      .post(`${data?.url}/api/ouaa/oauth2/token`, qs.stringify(params))
      .then((value) => {
        sessionStorage.setItem("market-token", value.data.access_token);
        sessionStorage.setItem("market-baseUrl", data?.url);
        alarmDetailData.value = item;
        alarmDetailData.value.index = index;
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
// 关闭弹窗
const closeDevicePanel = () => {
  // show.value = false;

  emit("close");
  show.value = false;
};
/**
 * 设备定位
 */
const position = async (item) => {
  // 记录当前视角
  await ueClient.saveNowViewPoint();
  // 全局查找属性匹配的目标
  ueClient.send(
    "getActorById",
    { id: item.alarmTargetCode },
    function (res) {
      if (res.id) {
        closeModal();
        ueClient.send("focusActor", { id: res.id});
        ueClient.send("startFlash", { id: res.id, level: 1 });
        ueClient.send("showShell", { id: res.id});
      } else {
        message.error("模型中未找到对应设备");
      }
    }
  );
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
  "预计处理时间",
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
    dataSource.value = []
    loadingDataSource.value = true;
    if (time.value?.length) {
      datainfo.period =
        dayjs(time.value[0]).format("YYYY-MM-DD 00:00:00") +
        "," +
        dayjs(time.value[1]).format("YYYY-MM-DD 23:59:59");
    } else {
      datainfo.period = "";
    }
    datainfo.keyword = keyword.value;
    let data = await alarmRecordPage({marketTenant: props.parameter.marketTenant, ...datainfo});
    dataSource.value = data.records;
    datainfo.total = data.total;
  } catch (error) {
  }finally{
    loadingDataSource.value = false;
  }
};
const getSearch = () => {
  return new Promise(async (resolve, reject) => {
    Promise.all([await getMarketList(), await alarmTypes()])
      .then((res) => {
        marketTenantList.value = res[0];
        alarmTypesList.value = res[1];
        // if(!datainfo.marketTenant && props.parameter.name) {
        const currentMarket = marketTenantList.value.filter(
          (item) => item.marketName === props.parameter.name
        )[0];
        datainfo.marketTenant = currentMarket?.marketTenant;
        // }
        resolve(res);
      })
      .catch((error) => {
        resolve('');
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
    alarmLevelId: "",
    alarmStatus: "",
    pageSize: 10,
    pageNumber: 1,
    total: 0,
    alarmHandlerResult: "",
    alarmTypeId: "",
    alarmEventTypeCode: "",
    alarmHandlerTimeoutStatus: "",
    alarmTypeCode: "",
    marketTenant: "",
  });
  getData();
};
const closeModal = () => {
  emit("close");
};
watch(
  () => props.showModal,
  async () => {
    datainfo.period = "";
    datainfo.alarmLevelId = "";
    datainfo.alarmStatus = "";
    datainfo.alarmTypeCode = "";
    datainfo.pageNumber = 1;
    datainfo.total = 0;

    if (props.showModal) {
      datainfo.applicationCode = props.parameter.applicationCode
        ? props.parameter.applicationCode
        : datainfo.applicationCode;
      datainfo.alarmStatus = props.parameter.alarmStatus
        ? props.parameter.alarmStatus
        : datainfo.alarmStatus;
      datainfo.alarmHandlerResult = props.parameter.alarmHandleResult;
      datainfo.alarmTypeId = props.parameter.alarmTypeId;
      datainfo.alarmLevelId = props.parameter.alarmLevelId;
      datainfo.alarmEventTypeCode = props.parameter.alarmEventTypeCode;
      datainfo.alarmHandlerTimeoutStatus = props.parameter.alarmHandlerTimeoutStatus;
      datainfo.alarmTypeCode = props.parameter.alarmTypeCode;
      datainfo.marketTenant = props.parameter.marketTenant;
      updateTime();
      getTableData();
      getSearch();
      getData();
    }
  }
);
watch(
  () => props.parameter,
  async () => {
    datainfo.applicationCode = props.parameter.applicationCode
      ? props.parameter.applicationCode
      : datainfo.applicationCode;
    datainfo.alarmStatus = props.parameter.alarmStatus
      ? props.parameter.alarmStatus
      : datainfo.alarmStatus;
    datainfo.alarmHandlerResult = props.parameter.alarmHandleResult;
    datainfo.alarmTypeId = props.parameter.alarmTypeId;
    datainfo.alarmLevelId = props.parameter.alarmLevelId;
    datainfo.alarmEventTypeCode = props.parameter.alarmEventTypeCode;
    datainfo.alarmHandlerTimeoutStatus = props.parameter.alarmHandlerTimeoutStatus;
    datainfo.alarmTypeCode = props.parameter.alarmTypeCode;
    datainfo.marketTenant = props.parameter.marketTenant;
    getSearch();
    updateTime();
    getTableData();
  },
  { deep: true }
);
onMounted(async () => {
  getSearch();
  getTableData();
  getData()
});

function updateTime() {
  if (!props.parameter?.dateRange || props.parameter?.dateRange?.length < 2) {
    return;
  }
  time.value = [dayjs(props.parameter.dateRange[0]), dayjs(props.parameter.dateRange[1])];
}
</script>

<style lang="less" scoped>
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
    text-wrap: nowrap;
  }
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
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.alarm-time-picker {
  width: 230px;
}

.alarm-level-select,
.handle-status-select {
  width: 150px;
}
:deep(.ant-btn-sm) {
  border: 1px solid #1285ff;
  background-color: rgba(4, 17, 32, 0.95);
  color: #1285ff;
}
:deep(.ant-btn-primary) {
  background-color: #1285ff;
  color: #fff;
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
  background: rgba(4, 17, 32, 0.8) !important;
}
</style>
<style lang="less" scoped>
.modal-table-alarm {
  .modal-width {
    width: 1250px !important;
    // height:600px!important
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
background: rgba(4, 17, 32, 0.8) !important;
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
// background: rgba(4, 17, 32, 0.8) !important;
// background: rgba(216, 216, 216, 0.1) !important;
}
:deep(.ant-select-item-empty){
  background: rgba(255, 255, 255, 0.1) !important;
}
:deep(.ant-empty-small), :deep(.ant-picker-input > input){
  color: #fff !important;
}
</style>
