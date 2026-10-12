<template>
  <div class="panel">
    <SubPanelTemplate title="报警响应排名" image="bj.png" class="visiting-data1">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="workOrderTime"
          @search="changeReceptionTrendsTime"
        >
        </DateInlineForm>
      </template>
      <div class="alarmTable1">
        <RollTablesn
          :column="bjColumns"
          :data="bjListData"
          :showLength="5"
          @click-row="openModel"
        >
          <template #index="{ record }">
            <div
              class="sort"
              :class="[{ up_sort: record.index > 3 }, `sort${record.index}`]"
            >
              {{ record.index }}
            </div>
          </template>
        </RollTablesn>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警事件占比" image="zb.png" class="visiting-data1">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="proportionTime"
          @search="changeReceptionProportionTime"
        >
        </DateInlineForm>
      </template>
      <div class="flex-between" v-if="pieData.length > 0">
        <div class="chart">
          <elevator-analysis-pie
            @clickbar="openModelZB"
            style="width: 155px"
            :pieData="pieData"
            :radius="'75'"
          >
            <div style="color: #fff; text-align: center; font-size: 14px">
              {{ getallNumber(pieData, "value") }}
            </div>
            <div style="color: #fff; text-align: center; font-size: 14px">报警总数</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList
          :contentList="pieData"
          style="margin-left: 10px"
        ></elevatorAnalysisList>
      </div>
      <div style="width: 100%; margin-top: 30px" v-else>
        <noData />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate
      title="报警记录"
      image="jl.png"
      class="visiting-data"
      style="height: 500px"
    >
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="RecordTime"
          @search="changeReceptionRecordTime"
        >
        </DateInlineForm>
      </template>
      <div class="alarmTable">
        <RollTable :column="columns" :data="listData" @click-row="openAlarmModel">
          <template #level="{ record }">
            <span :class="record.level === '一级' ? 'red' : 'blue'">
              {{ record.level }}
            </span>
          </template>
          <template #status="{ record }">
            <span :class="record.alarmStatusName !== '进行中' ? 'green' : 'blue'">
              {{ record.alarmStatusName }}
            </span>
          </template>
        </RollTable>
      </div>
    </SubPanelTemplate>
  </div>
  <modal-alarm-table
    :show-modal="alarmModalShow"
    @close="alarmModalShow = false"
    :parameter="alarmParameter"
  ></modal-alarm-table>
  <Alarm
    v-if="alarmAlarmModalShow"
    @close="() => {
      alarmAlarmModalShow = false
      removeMarketToken()
    }"
    :isalarm="true"
    :alarmDetailData="alarmAlarmParameter"
  ></Alarm>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from "vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import RollTablesn from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "../../businessPanel/public/snPanelTemplate.vue";
import DateInlineForm from "../../businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import elevatorAnalysisPie from "../../businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "../../businessPanel/public/elevator-analysis-list.vue";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import moment from "moment";
import { storeMarket } from "@/piniaStore/other";
import { getRandomFive } from "@/utils/enumeratie";
import { autoPage, getXDataByType, getallNumber } from "@/utils/common";
import {
  alarmConfirmSituation,
  alarmEventRatio,
  alarmRecordPage,
} from "@/api/shennong/alarm";
import noData from "@/components/businessPanel/public/noData.vue";
import { openAlarmDetail, removeMarketToken } from '@/components/hooks/useAlarm'
import Alarm from "@/components/alarmdetails/equipmentModesn.vue";

const applicationCode = "ELECTRICMANAGE";
const piniaStoreMarket = storeMarket();
const workOrderTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const proportionTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const RecordTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const alarmParameter = ref<Record<string, any>>({
  applicationCode: applicationCode,
  alarmTypeCode: applicationCode,
});
const alarmModalShow = ref<boolean>(false);
const bjListData = ref();
const bjColumns = [
  {
    title: "排名",
    dataIndex: "index",
    slots: {
      customRender: "index",
    },
  },
  {
    title: "市场名称",
    dataIndex: "name",
  },
  {
    title: "未确认报警数",
    dataIndex: "alarm",
  },
];
const columns = [
  {
    title: "报警事件",
    dataIndex: "alarmEventTypeName",
  },
  {
    title: "报警市场",
    dataIndex: "marketName",
  },
  {
    title: "报警级别",
    dataIndex: "level",
    slots: {
      customRender: "level",
    },
  },
  {
    title: "状态",
    dataIndex: "status",
    slots: {
      customRender: "status",
    },
  },
  {
    title: "报警时间",
    dataIndex: "time",
    width: 120,
  },
];
const bjPage = reactive({
  total: 0,
  pageSize: 50,
  pageNumber: 1,
  pages: 0,
});
const changeReceptionTrendsTime = async () => {
  alarmParameter.value.dateRange = workOrderTime.value.dateRange;
  let param = {
    period: workOrderTime.value.dateRange.join(","),
    type: workOrderTime.value.timeType,
    pageSize: bjPage.pageSize,
    pageNumber: 1,
    marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: applicationCode,
  };
  let { records, total, pages } = await alarmConfirmSituation(param);
  // autoPage(bjPage, total, pages)
  bjListData.value = [];
  if (Array.isArray(records) && records.length > 0) {
    bjListData.value = records
      .sort((a, b) => b.totalNum - a.totalNum)
      .map((item, index) => {
        return {
          ...item,
          index: index + 1,
          name: item.marketName,
          alarm: item.totalNum,
        };
      });
  }
};
const colors = ["#94BAF9", "#6C9BE8", "#3F7CDF", "#2989FF"];
const pieData = ref([]);
const changeReceptionProportionTime = async () => {
  alarmParameter.value.dateRange = proportionTime.value.dateRange;
  let param = {
    period: proportionTime.value.dateRange.join(","),
    type: proportionTime.value.timeType,
    marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: applicationCode,
  };
  let res: any = await alarmEventRatio(param);
  pieData.value = res.map((item, index) => {
    return {
      ...item,
      name: item.name,
      value: item.totalNum,
      ratio: item.ratio,
      color: colors[index % colors.length],
    };
  });
};
const listData = ref();
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
    marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: applicationCode,
  };
  let { records, total, pages } = await alarmRecordPage(param);
  autoPage(recordPage, total, pages);
  listData.value = records
    .map((item) => {
      return {
        ...item,
        event: item.alarmEventName || item.alarmTargetName,
        // time: moment(item.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
        time:
          RecordTime.value.timeType === "TODAY"
            ? moment(item.alarmTime).format("HH:mm:ss")
            : moment(item.alarmTime).format("YYYY-MM-DD HH:mm:ss"),

        name: item.marketName,
        level: item.alarmLevelName,
        type: item.alarmTypeName,
        status: item.alarmStatusName,
      };
    })
    .filter((item) =>
      piniaStoreMarket.currentMarketName
        ? item.name === piniaStoreMarket.currentMarketName
        : true
    );
};
const alarmAlarmParameter = ref<Record<string, any>>({
  applicationCode: applicationCode,
  alarmTypeCode: applicationCode,
});
const alarmAlarmModalShow = ref<boolean>(false);
const openAlarmModel = async (record) => {
  await openAlarmDetail(record, (res)=>{
    alarmAlarmParameter.value = Object.assign(alarmAlarmParameter.value, record);
    alarmAlarmModalShow.value = true;
  })
};
const openModel = (record) => {
  alarmModalShow.value = true;
  alarmParameter.value = {
    applicationCode: applicationCode,
    alarmTypeCode: applicationCode,
    dateRange: workOrderTime.value.dateRange
  }
  alarmParameter.value = Object.assign(alarmParameter.value, {
    ...record,
    marketTenant: parseInt(record.marketTenant),
    alarmStatus:
      record.alarmStatus == undefined ? "ALARM_UN_CONFIRMED" : record.alarmStatus,
  });
};
const openModelZB = (record) => {
  alarmModalShow.value = true;
  alarmParameter.value = {
    applicationCode: applicationCode,
    alarmTypeCode: applicationCode,
    dateRange: proportionTime.value.dateRange
  }
  alarmParameter.value = Object.assign(alarmParameter.value, {
    ...record,
    name: piniaStoreMarket.currentMarketName,
  });
};
let timer = null;
// 报警响应排名,报警记录 每15秒轮播
onMounted(() => {
  timer = setInterval(() => {
    changeReceptionProportionTime()
    // changeReceptionTrendsTime()
  }, (window as any).config.pageLoopRequestTime);
});

watch(
  () => piniaStoreMarket.currentMarket,
  (n) => {
    changeReceptionRecordTime();
    changeReceptionProportionTime();
    // viewCurrentMarketAlarmRecords()
    // changeReceptionTrendsTime()
  }
);
onUnmounted(() => {
  clearInterval(timer);
});
</script>
<style lang="less" scoped>
.alarmTable {
  height: 300px;

  .red {
    color: #f14545;
  }

  .green {
    color: #2ae8bd;
  }

  .blue {
    color: #1890ff;
  }
}

.chart {
  flex: 1;
  height: 250px;
}

.sort {
  width: 30px;
  line-height: 18px;
  border-radius: 2px;
  font-size: 16px;
  text-align: center;
  // margin-right: 11px;
  margin: auto;
  background: rgba(50, 142, 255, 0.2);
  border: 1px solid #2989ff;
  color: #2f8dff;

  &.up_sort {
    background: rgba(21, 58, 105, 0.3);
    border: 1px solid #79a0d0;
    color: #e6f7ff;
  }
}

.alarmTable1 {
  height: 250px;
}

.sort1 {
  background: rgba(241, 69, 69, 0.302);
  border: 1px solid #f14545;
  color: #fff;
}

.sort2 {
  background: rgba(255, 171, 16, 0.3);
  border: 1px solid #ffab10;
  color: #fff;
}

.sort3 {
  color: #fff;
  background: rgba(50, 142, 255, 0.2);
  border: 1px solid #2989ff;
}
.nodata {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
.visiting-data1 {
  height: 300px;
}
</style>
