<template>
  <div class="panel">
    <SubPanelTemplate title="报警记录" image="zh.png">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="tableTime"
          @search="changeReceptionRecordTime"
        ></DateInlineForm>
      </template>
      <RollTable :column="column" :data="tableData" @click-row="clickrow">
        <template #level="{ record }">
          <span :style="record.level === '一级' ? 'color:red' : 'color:blue'">
            {{ record.level }}
          </span>
        </template>
      </RollTable>
    </SubPanelTemplate>
  </div>

  <Alarm
    v-if="alarmModalShow"
    @close="alarmclose"
    :isalarm="true"
    :alarmDetailData="alarmParameter"
    :xf="true"
  ></Alarm>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted } from "vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "@/components/businessPanel/public/snPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { autoPage, getXDataByType } from "@/utils/common";
import Alarm from "@/components/alarmdetails/equipmentModesn.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import {
  getGasConsumptionData,
  EnergyConsumptionTrends,
} from "@/mock/energy-consumption";
import { getAssetsImage } from "@/utils/getImage";
import { getrandom, getRandomFive } from "@/utils/enumeratie";
import { storeMarket } from "@/piniaStore/other";
import { alarmRecordPage } from "@/api/shennong/alarm";
import { getMarketConfig } from "@/api/shennong/alarm";
import moment from "moment";
import axios from "axios";
import qs from "qs";

const applicationCode = "FIRECONTROL";
const piniaStoreMarket = storeMarket();

const alarmModalShow = ref(false);
const alarmParameter = ref<Record<string, any>>({
  applicationCode: applicationCode,
});
const closeModal = () => {
  alarmModalShow.value = false;
};
const clickrow = async (record) => {
  try {
    const data = await getMarketConfig({ id: record.marketTenant });
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
        alarmModalShow.value = true;
        alarmParameter.value = Object.assign(alarmParameter.value, record);
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
const alarmclose = () => {
  sessionStorage.removeItem("market-baseUrl");
  sessionStorage.removeItem("market-tenant");
  sessionStorage.removeItem("market-token");

  alarmModalShow.value = false;
};
let color = ["#E52121", "#F37712"];
const column = ref([
  {
    title: "报警事件",
    dataIndex: "event",
  },
  {
    title: "报警时间",
    dataIndex: "time",
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
    title: "报警状态",
    dataIndex: "status",
  },
]);
const tableTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const tableData = ref([]);
const recordPage = reactive({
  total: 0,
  pageSize: 5,
  pageNumber: 1,
  pages: 0,
});
const changeReceptionRecordTime = async () => {
  alarmParameter.value.dateRange = tableTime.value.dateRange;
  let param = {
    period: tableTime.value.dateRange.join(","),
    type: tableTime.value.timeType,
    pageSize: recordPage.pageSize,
    pageNumber: 1,
    marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: applicationCode,
  };
  let { records, total, pages } = await alarmRecordPage(param);
  autoPage(recordPage, total, pages);
  tableData.value = records.map((item, index) => {
    return {
      ...item,
      event: item.alarmEventTypeName,
      time: moment(item.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
      name: item.marketName,
      level: item.alarmLevelName,
      type: item.alarmTypeName,
      status: item.alarmStatusName,
    };
  });
};

let timer = null;
// 报警事件排名 报警记录 每15秒轮播
onMounted(() => {
  timer = setInterval(() => {
    // changeReceptionRecordTime()
  }, (window as any).config.pageLoopRequestTime);
});

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
.visiting-data {
  .title {
    color: #fff;
    font-size: 12px;
  }

  :deep(.sub-panel-content) {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .item {
      width: 50%;
      height: 60px;
      margin-top: 30px;
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      padding-left: 20px;

      .ant-statistic {
        display: inline-flex;
        flex-flow: column-reverse;

        .ant-statistic-content {
          height: 29px;

          .ant-statistic-content-value {
            color: #fff;
            font-size: 22px;
            font-weight: 400;
            position: relative;
            top: -25px;
          }
        }

        .ant-statistic-title {
          color: #d0deee;
          font-size: 12px;
          margin: 0;
        }
      }

      .ringRatio {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
      }

      .downtriangle {
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 8px solid #d2fff3;
        margin: 0 3px;
        transform: rotate(180deg);
      }

      .uptriangle {
        border-bottom: 8px solid #ffcece;
        transform: rotate(0deg);
      }

      .down {
        color: #2ae8bd;
        font-family: Roboto-Regular, Roboto;
      }

      .up {
        color: #f14545;
        font-family: Roboto-Regular, Roboto;
      }
    }
  }
}

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
}
.more {
  width: 100%;
  cursor: pointer;
  margin-top: -5px;
  font-size: 14px;
  font-family: Source Han Sans CN-Regular, Source Han Sans CN;
  font-weight: 400;
  color: #6194f7;
  text-align: right;
}
.chart {
  flex: 1;
  height: 220px;
}
.panel {
  position: inherit;
  z-index: 9999;
  display: flex;
  height: 300px;
}
</style>
