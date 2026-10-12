<template>
  <SubPanelTemplate title="报警记录" class="device-statistics" image="jl.png">
    <template #extra>
      <DateInlineForm
        class="shengNongColor"
        v-model:modelValue="RecordTime"
        @search="changeReceptionRecordTime"
      ></DateInlineForm>
    </template>
    <div class="alarmTable">
      <RollTable :column="column" :data="tableData" 
        @click-row="clickRowAlarm">
        <template #level="{ record }">
          <span :class="record.level === '一级' ? 'red' : 'blue'">
            {{ record.level }}
          </span>
        </template>
        <template #alarmStatusName="{ record }">
          <span :class="record.alarmStatusName !== '进行中' ? 'green' : 'blue'">
            {{ record.alarmStatusName }}
          </span>
        </template>

        <!-- <template #level="{ record }">
          <span :style="`color:${color[record.level-1]}`">{{ record.level }}</span>
        </template> -->
      </RollTable>
    </div>
  </SubPanelTemplate>
  <Alarm
    v-if="alarmDetailModalShow"
    @close="closeModal"
    :isalarm="true"
    :alarmDetailData="alarmDetailParameter"
  ></Alarm>
</template>
<script setup lang="ts">
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import SubPanelTemplate from "@/components/businessPanel/public/snPanelTemplate.vue";
import { onMounted, onUnmounted, ref, reactive, watch } from "vue";
import moment from "moment";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import { autoPage } from "@/utils/common";
import { storeMarket } from "@/piniaStore/other";
import { alarmRecordPage } from "@/api/shennong/alarm";
import { openAlarmDetail, removeMarketToken } from '@/components/hooks/useAlarm'
import Alarm from "@/components/alarmdetails/equipmentModesn.vue";


const piniaStoreMarket = storeMarket();
const props = withDefaults(
  defineProps<{
    chartHeight?: number;
    applicationCode: string;
  }>(),
  {
    chartHeight: 300,
    applicationCode: "SECURITY_MONITORING",
  }
);

const alarmDetailModalShow = ref(false);
const alarmDetailParameter = ref({
  applicationCode: props.applicationCode,
  alarmTypeCode: props.applicationCode,
});
const clickRowAlarm = async (record) => {
  await openAlarmDetail(record, (res)=>{
    alarmDetailParameter.value = Object.assign(alarmDetailParameter.value, record);
    alarmDetailModalShow.value = true;
  })
};

const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({
  applicationCode: "SECURITY_MONITORING",
  alarmStatus: "",
  alarmTypeCode: "SECURITY_MONITORING",
});
const closeModal = () => {
  alarmDetailModalShow.value = false;
}
const clickrow = (record) => {
  alarmModalShow.value = true;
  alarmParameter.value = Object.assign(alarmParameter.value, record);
};
let color = ["#E52121", "#F37712"];
const tableData = ref([]);
const column = ref([
  {
    title: "报警事件",
    dataIndex: "alarmEventTypeName",
  },
  {
    title: "报警时间",
    dataIndex: "time",
  },
  {
    title: "报警市场",
    dataIndex: "market",
  },
  {
    title: "报警级别",
    dataIndex: "level",
    slots: {
      customRender: "level",
    },
  },

  {
    title: "报警状态",
    dataIndex: "alarmStatusName",
    slots: {
      customRender: "alarmStatusName",
    },
  },
]);
const RecordTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const recordPage = reactive({
  total: 0,
  pageSize: 50,
  pageNumber: 1,
  pages: 0,
});
const changeReceptionRecordTime = async () => {
  alarmParameter.value.dateRange = RecordTime.value.dateRange;
  let param = {
    period: RecordTime.value.dateRange.join(","),
    type: RecordTime.value.timeType,
    pageSize: recordPage.pageSize,
    pageNumber: 1,
    marketTenant: '',
    applicationCode: props.applicationCode,
  };
  let { records, total, pages } = await alarmRecordPage(param);

  autoPage(recordPage, total, pages);
  tableData.value = records.map((item, index) => {
    return {
      ...item,
      event: item.alarmEventName || item.alarmTargetName,
      time:
        RecordTime.value.timeType === "TODAY"
          ? moment(item.alarmTime).format("HH:mm:ss")
          : moment(item.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
      name: item.marketName,
      level: item.alarmLevelName,
      type: item.alarmTypeName,

      market: item.marketName,
    };
  });
};

</script>
<style scoped lang="less">
.device-statistics {
  .table-th,
  .table-td {
    overflow: inherit;
    text-overflow: inherit;
    white-space: inherit;
  }
}
.red {
  color: #f14545;
}

.green {
  color: #2ae8bd;
}

.blue {
  color: #1890ff;
}
</style>
