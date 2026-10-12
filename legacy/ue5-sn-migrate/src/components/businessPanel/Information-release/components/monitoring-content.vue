<template>
  <div class="modal-layout">
    <div class="table-top">
      <a-form ref="selectForm" :model="datainfo" layout="inline">
        <a-form-item label="设备">
          <a-input v-model:value="keyword" />
        </a-form-item>
        <a-form-item label="区域" class="handle-status-select">
          <a-select v-model:value="datainfo.alarmStatus">
            <a-select-option :value="item.value" v-for="item in alarmHandleEnumerate">{{
              item.label
              }}</a-select-option>
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
        <div v-for="item in table_header">{{ item }}</div>
      </div>
      <a-spin :spinning="loadingDataSource">
        <div class="table_content">
          <div v-if="dataSource.length === 0" class="no-content">
            <NoData />
          </div>
          <div v-else v-for="(item,index) in dataSource">
            <div class="content">
              <div>{{ index+1}}</div>
              <div>{{ item.name }}</div>
              <div>{{ item.market }}</div>
              <div style="">{{ item.type }}</div>
              <!-- <div :style="getlevelcolor(item.alarmLevelName)">
                {{ item.alarmLevelName }}
              </div> -->
              <div>{{ item.date }}</div>
              <div>{{ item.time }}</div>
              <div :style="item.status=='在用'?'color:blue':'color:green'">{{ item.status }}</div>
              <div>{{ item.manger }}</div>
              <div>{{ item.area }}</div>
              <div>{{ item.user }}</div>

            </div>
          </div>
        </div>
      </a-spin>
    </div>
    <div style="height: 30px">
      <a-pagination style="float: right; margin-top: 15px" v-model:current="datainfo.pageNumber"
        v-model:page-size="datainfo.pageSize" @change="onShowSizeChange" :total="datainfo.total" />
    </div>
  </div>
</template>
<script setup lang="ts">



import { TableColumnType, message } from "ant-design-vue";
import { onMounted, reactive, ref, watch } from "vue";

import { alarmStatisticsList, alarmrecords, satalarmlevels } from "@/api/alarm";
import enumerateData from "@/utils/enumeratie";
import dayjs, { Dayjs } from "dayjs";
import moment from "moment";
import NoData from "@/components/businessPanel/public/noData.vue";
import {UeClient} from "@ghcloud/cube-visual-sdk";
import bus from "@/utils/bus";
const ueClient = UeClient.getInstance();

const { alarmLeaveOptions, alarmStatusOptions } = enumerateData();
interface Props {

}
const entry = ref(window.config.entry);

const selectForm = ref();
const emit = defineEmits(["close"]);


const time = ref<Dayjs[]>(

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
const formSlot = (item) => {
return item.slotName ? item.slotName : "noSlot";
};
const alarmDetailData = ref({});
const show = ref(false);
const detiles = (item) => {
// bus.emit("openAlarmModal", item);
alarmDetailData.value = item;
show.value = true;
};
const level = ref([]);
const table_header = ["标题", "所属区域", "所属设备", "发布时间", "截止时间",'播放时长','循环次数'];
const alarmHandleEnumerate = [
{
  label: "负一楼",
  value: "",
},
{
  label: "一楼",
  value: "ALARM_UN_CONFIRMED",
},
{
  label: "二楼",
  value: "ALARM_PROGRESS_CONFIRMED",
},
{
  label: "三楼",
  value: "ALARM_SUSPEND",
},
{
  label: "四楼",
  value: "ALARM_HANDLER",
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
loadingDataSource.value = true;
if (time.value?.length) {
  datainfo.period =
    dayjs(time.value[0]).format("YYYY-MM-DD 00:00:00") +
    "," +
    dayjs(time.value[1]).format("YYYY-MM-DD 23:59:59");
} else {
  datainfo.period = "";
}



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


onMounted(() => {
getTableData();
});


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
