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
          <a-form-item label="处理状态" class="handle-status-select">
            <a-select v-model:value="datainfo.alarmStatus">
              <a-select-option :value="item.value" v-for="item in alarmHandleEnumerate">{{
                item.label
              }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="报警等级" class="handle-status-select">
            <a-select v-model:value="datainfo.alarmLevelCode">
              <a-select-option :value="item.value" v-for="item in alarmLevelCodeEnumerate">{{
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
          <a-form-item label="关键字">
            <a-input v-model:value="keyword" />
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
      <div style="margin-top: 15px">
        <div class="table_header">
          <div v-for="item in table_header">{{ item }}</div>
        </div>
        <a-spin :spinning="loadingDataSource">
          <div class="table_content">
            <div v-if="dataSource.length === 0" class="no-content">
              <NoData />
            </div>
            <div v-else v-for="item in dataSource">
              <div class="content">
                <div>{{ dayjs(item.alarmTime).format("YYYY-MM-DD HH:mm:ss") }}</div>
                <div style="">{{ item.alarmTargetName }}</div>
                <div :style="getlevelcolor(item.alarmLevelName)">
                  {{ item.alarmLevelName }}
                </div>
                <div>{{ item.alarmEventName }}</div>
                <div>{{ item.alarmStatusName }}</div>
                <div>
                  <a @click="detiles(item)">详情</a>
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
          style="float: right; margin-top: 15px"
          v-model:current="datainfo.pageNumber"
          v-model:page-size="datainfo.pageSize"
          @change="onShowSizeChange"
          :total="datainfo.total"
          :show-total="total => `总数 ${total}`"
        />
      </div>
    </div>
    <Alarm
      @closeDevicePanel="closeDevicePanel"
      :alarmDetailData="alarmDetailData"
      v-if="show"
      @close="show = false"
      :isalarm="true"
    >
    </Alarm>
  </Modal>
</template>
<script setup lang="ts">
import Modal from "./modal.vue";
import type { FormItem } from "./type";
import { message } from "ant-design-vue";
import { onMounted, reactive, ref, watch } from "vue";
import Alarm from "@/components/alarmdetails/equipmentMode.vue";
import { alarmStatisticsList } from "@/api/alarm";
import enumerateData from "@/utils/enumeratie";
import dayjs, { Dayjs } from "dayjs";
import NoData from "@/components/businessPanel/public/noData.vue";
import { UeClient } from "@ghcloud/cube-visual-sdk";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore()

const ueClient = UeClient.getInstance();

const { alarmLeaveOptions } = enumerateData();
interface Props {
  parameter?: Record<string, any>;
  alarmStatus?:string;
  alarmLevelCode?: string;
  showModal: boolean;
}
const entry = ref(window.config.entry);

const selectForm = ref();
const emit = defineEmits(["close"]);
const getlevelcolor = (name: string) => {
  return `color:${
    alarmLeaveOptions.value.find((res) => res.label == name + "报警").color
  }`;
};
const props = withDefaults(defineProps<Props>(), {
  title: "报警记录",
  showModal: false,
});
const time = ref<Dayjs[]>(
  props.parameter?.dateRange?.length > 1
    ? [dayjs(props.parameter.dateRange[0]), dayjs(props.parameter.dateRange[1])]
    : []
);
const keyword = ref("");
const datainfo = reactive<Record<string, any>>({
  period: "",
  alarmLevelId: "",
  alarmStatus: "",
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});

const dataSource = ref([
]);
const loadingDataSource = ref(false);
// 解析表单插槽名
const formSlot = (item: FormItem) => {
  return item.slotName ? item.slotName : "noSlot";
};
const alarmDetailData = ref({});
const show = ref(false);
const detiles = (item) => {
  // bus.emit("openAlarmModal", item);
  alarmDetailData.value = item;
  show.value = true;
};
// 关闭弹窗
const closeDevicePanel = () => {
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
const table_header = ["报警时间", "报警设备", "报警级别", "报警事件", "处理状态", "操作"];
const alarmHandleEnumerate = [
  {
    label: "所有",
    value: "",
  },
  {
    label: "待接收",
    value: "ALARM_UN_CONFIRMED",
  },
  {
    label: "处理中",
    value: "ALARM_PROGRESS_CONFIRMED",
  },
  {
    label: "已挂起",
    value: "ALARM_SUSPEND",
  },
  {
    label: "已处理",
    value: "ALARM_HANDLER",
  },
];
const alarmLevelCodeEnumerate = [
  {
    label: "所有",
    value: "",
  },
  {
    label: "一级报警",
    value: "one_level",
  },
  {
    label: "二级报警",
    value: "two_level",
  },
  {
    label: "三级报警",
    value: "three_level",
  },
  {
    label: "四级报警",
    value: "four_level",
  },
];
const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};
const getData = async () => {
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
  datainfo.alarmHandlerResult = props.parameter.alarmHandleResult;
  datainfo.applicationCode = props.parameter.applicationCode;
  datainfo.alarmTypeId = props.parameter.alarmTypeId;
  datainfo.sceneType=  globalState.business.currentMenu,
  datainfo.areaId=  globalState.business.currentAreaId,
  datainfo.alarmStatus = props.alarmStatus
      ? props.alarmStatus
      : datainfo.alarmStatus;
  datainfo.alarmLevelCode = props.alarmLevelCode
      ? props.alarmLevelCode
      : datainfo.alarmLevelCode;
  let data = await alarmStatisticsList(datainfo);
  dataSource.value = data.records;
  datainfo.total = data.total;
  loadingDataSource.value = false;
};
const query = () => {
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
  });
  getData();
};
const closeModal = () => {
  emit("close");
};
watch(
  () => props.showModal,
  () => {
    if (props.showModal) {
      updateTime();
      getData();
    }
  }
);
watch(
  () => props.parameter,
  () => {
    datainfo.applicationCode = props.parameter.applicationCode
      ? props.parameter.applicationCode
      : datainfo.applicationCode;
    datainfo.alarmStatus = props.parameter.alarmStatus
      ? props.parameter.alarmStatus
      : datainfo.alarmStatus;
    updateTime();
    getData();
  }
);
onMounted(() => {
  updateTime();
      getData();
});

function updateTime() {
  if (!props.parameter?.dateRange || props.parameter?.dateRange?.length < 2) {
    return;
  }
  time.value = [dayjs(props.parameter.dateRange[0]), dayjs(props.parameter.dateRange[1])];
}
onMounted(()=>{
  getData();
})
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
  }
}

.table_content {
  // display: flex;
  color: #fff;
  min-height: 200px;
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
  background: rgba(4, 17, 32, 0.8) !important;
}
:deep(.ant-form-item-label > label) {
  color: #fff !important;
}
:deep(.ant-select-selector) {
  color:#fff;
}
</style>
<style lang="less">
.modal-table-alarm {
  .modal-width {
    width: 1250px !important;
  }
}
.ant-pagination-total-text{
  color: #fff !important;
  margin-right: 10px;
}

</style>
