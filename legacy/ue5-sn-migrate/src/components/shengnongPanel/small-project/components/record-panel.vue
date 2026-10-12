<template>
  <SubPanelTemplate title="正在施工记录" class="device-statistics" image="jl.png">
    <template #extra>
      <DateInlineForm
        class="shengNongColor"
        v-model:modelValue="RecordTime"
        @search="handleTime"
      ></DateInlineForm>
    </template>
    <div class="alarmTable">
      <RollTable :column="column" :data="tableData" style="height: 300px;"
        @click-row="clickRow">
        <template #completionTime="{ record }">
          {{
            record.completionTime
              ? dayjs(record.completionTime).format("YYYY-MM-DD")
              : "--"
          }}
        </template>
        <template #status="{ record }">
          <span :class="record.status">
            {{ statusObj[record.status] }}
          </span>
        </template>
      </RollTable>
    </div>
  </SubPanelTemplate>
  <Project v-if="detailModalShow" @close="closeModal" :parameter="projectParameter" ></Project>
</template>
<script setup lang="ts">
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import SubPanelTemplate from "@/components/businessPanel/public/snPanelTemplate.vue";
import { onMounted, onUnmounted, ref, reactive, watch } from "vue";
import moment from "moment";
import dayjs from "dayjs";
import { autoPage } from "@/utils/common";
import { storeMarket } from "@/piniaStore/other";
import { looseWorksList } from "@/api/shennong/compre";
import Project from "./project-detail/index.vue";

const piniaStoreMarket = storeMarket();
const props = withDefaults(
  defineProps<{
    chartHeight?: number;
    applicationCode: string;
  }>(),
  {
    chartHeight: 300,
    applicationCode: "SMALLENFINEERING",
  }
);

const statusObj = {
  UNDERWAY: "进行中",
  COMPLETED: "已完成",
  WAIT_ACCEPT: "待验收",
};
const detailModalShow = ref<boolean>(false);
const projectParameter = ref<Record<string, any>>({
  applicationCode: "SMALLENFINEERING",
  id: "",
  marketTenant: "",
  marketName: "",
  dateRange: ""
});
const clickRow = (record) => {
  detailModalShow.value = true;
  projectParameter.value = Object.assign(projectParameter.value, record);
};
const closeModal = (backViewPoint) => {
  detailModalShow.value = false
};

const tableData = ref([]);
const column = ref([
  {
    title: "小散工程名称",
    dataIndex: "projectName",
  },
  {
    title: "所属市场",
    dataIndex: "marketName",
  },
  {
    title: "工程时间",
    dataIndex: "completionTime",
    slots: {
      customRender: "completionTime",
    },
  },
  {
    title: "工程状态",
    dataIndex: "status",
    slots: {
      customRender: "status",
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
  projectParameter.value.dateRange = RecordTime.value.dateRange;
  let param = {
    period: RecordTime.value.dateRange.join(","),
    type: RecordTime.value.timeType,
    pageSize: recordPage.pageSize,
    pageNumber: 1,
    marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: props.applicationCode,
    status: 'UNDERWAY',
  };
  let { records, total, pages } = await looseWorksList(param);

  autoPage(recordPage, total, pages);
  tableData.value = records.map((item, index) => {
    return {
      ...item,
      event: item.alarmEventName || item.alarmTargetName,
      time:
        RecordTime.value.timeType === "TODAY"
          ? moment(item.alarmTime).format("HH:mm")
          : moment(item.alarmTime).format("YYYY-MM-DD HH:mm"),
      name: item.marketName,
      level: item.alarmLevelName,
      type: item.alarmTypeName,

      market: item.marketName,
    };
  });
};
const handleTime = () => {
  tableData.value = []
  changeReceptionRecordTime()
}
let timer = null;
watch(
  () => piniaStoreMarket.currentMarket,
  (n) => {
    changeReceptionRecordTime();
  }
);
onUnmounted(() => {
  clearInterval(timer);
});
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
.UNDERWAY {
  color: #95BCF9 !important;
}

.COMPLETED {
  color: #00c6bc !important;
}

.WAIT_ACCEPT {
  color: #1890FF !important;
}
</style>
