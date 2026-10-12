<template>
  <div class="panel">
    <SubPanelTemplate :title="props.title">
      <template #extra>
        <DateInlineForm v-model:modelValue="timeTypeqs" @search="changeEventTime"></DateInlineForm>
      </template>
      <DeviceStatistics @handelClickItemize="handelClickItemize" imgPath="overView21.png"
        :statistic="deviceStatisticsrecord"></DeviceStatistics>
      <RollTable @clickRow="openAlarmModal" :column="column" :data="listData" :limitScrollNum="4">
        <template #alarmStatus="{ record }">
          <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
          <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
          <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
        </template>
      </RollTable>
    </SubPanelTemplate>
    <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="parameter"></modal-alarm-table>
  </div>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import DeviceStatistics from "../device-statistics.vue";
import { alarmrecords, recordStatus } from "@/api/alarm";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import moment from "moment";
import bus from "@/utils/bus";
import useCommon from "@/components/hooks/useCommon";

const props = withDefaults(defineProps<{
  title?: string;
}>(), {
  title: '报警记录'
})
let timeTypeqs = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
});
let timer: any = reactive(null);
const alarmModalShow = ref<boolean>(false);
const parameter = reactive({
  areaIds:'',
  alarmStatus:'',
  filterAlarmStatus:'',
  dateRange:[],
})
const column = reactive([
  {
    title: "报警时间",
    dataIndex: "alarmTime",
    width: 120,
  },
  {
    title: "报警级别",
    dataIndex: "alarmLevelName",
  },
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
    width: 140,
  },
  {
    title: "状态",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
  },
]);
const {
  piniaStoreArea,
  piniaStoreMenu,
} = useCommon();

const closeModal = () => {
  alarmModalShow.value = false;
};
const handelClickItemize = (value)=>{
  if(value === '未处理数'){
    parameter.alarmStatus = undefined
    parameter.filterAlarmStatus = ['ALARM_HANDLER'].toString()
  }else if (value === '已处理数') {
    parameter.alarmStatus = 'ALARM_HANDLER'
  }else{
    parameter.alarmStatus = undefined
  }
  parameter.dateRange = timeTypeqs.value.dateRange
  alarmModalShow.value = true
}
// 报警事件
const listData = ref([]);
async function changeEventTime() {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: timeTypeqs.value.dateRange.join(","),
    type: timeTypeqs.value.timeType,
    pageSize: 50,
    pageNumber: 1,
  };
  let res: any = await alarmrecords(params);
  let data = await recordStatus(params);
  deviceStatisticsrecord.total = data.alarmNum;
  deviceStatisticsrecord.itemize = [
    {
      name: "未处理数",
      label: "已处理数",
      value: data.alarmHandlerNum,
      offline: data.alarmUnresolvedHandlerNum,
      key: "OFFLINE",
    },
  ];

  listData.value = res.records.map((item) => {
    return {
      ...item,
      alarmTime: moment(item.alarmTime).format("YYYY-MM-DD"),
    };
  });
}
const openAlarmModal = (item) => {
  if (window.config.entry === 'views') {
    bus.emit("setOpenAlarmModal", {...item,hidePanel:true});
  }else{
  bus.emit("openAlarmModal", item);
  }
};

// 切换视频
watch(
  () => piniaStoreArea.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
    init();
  }
);
const deviceStatisticsrecord = reactive({
  title: "报警数",
  total: 48,
  itemize: [
    {
      name: "已处理数",
      label: "未处理数",
      value: 23,
      offline: 15,
      key: "OFFLINE",
    },
  ],
});
function init() {
  changeEventTime();
}
onMounted(() => {
  init();
  timer = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>
<style lang="less" scoped>
.panel {
  padding: 8px;
  padding-top: 0;
  display: flex;
  flex-direction: column;
}

.chart {
  height: 160px;
  display: flex;
  align-items: center;
}

.body {
  // :deep(.ant-image){
  //    width: 120px;
  //    height: 120px;
  //    .ant-image-img{
  //       width: 100%;
  //       height: 100%;
  //    }
  // }
}

.monitor {
  .body {
    margin-top: 0;
  }

  .title {
    color: #fff;
    font-size: 16px;
  }

  .group {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .camera {
      margin: 0 6px;
      width: 160px;
      height: 90px;
      margin-top: 10px;
    }
  }
}

.alarm-event {
  .footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}

.extra {
  font-family: Roboto-Regular, Roboto;
  font-weight: 400;
  margin-left: 8px;

  span {
    color: #e7f0ff;
    font-size: 12px;
  }

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin-right: 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
  }

  .radio {
    font-size: 12px;
  }

  .up {
    color: #f14545;
  }

  .down {
    color: #2ae8bd;
  }
}

.right-bar {
  width: 56px;
  height: 24px;
  background: rgba(41, 137, 255, 0.102);
  border-radius: 2px;
  border: 1px solid #2989ff;
  color: #fff;
  text-align: center;
  line-height: 24px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-around;

  img {
    width: 14px;
    height: 14px;
  }
}

.forbidden {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}
</style>
