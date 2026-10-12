<template>
  <div class="panel">
    <div class="rank-wrapper">
      <!-- <div class="more" @click="gertmore">查看更多>></div> -->
      <div>
        <ranklist :listData="risk" title="安全指数周排名"></ranklist>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from "vue";
import EventAlarmItem from "../businessPanel/public/snEventItem.vue";
import elevatorAnalysisPie from "../businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "../businessPanel/public/elevator-analysis-list.vue";
import RollTable from "../businessPanel/public/rollTable/snindex.vue";
import SubPanelTemplate from "../businessPanel/public/snPanelTemplate.vue";
import DateInlineForm from "../businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from "../businessPanel/public/types";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import { getallNumber, autoPage } from "../../utils/common";
import ranklist from "@/components/shengnongPanel/common/ranklist.vue";
import modalTable from "@/components/modal-table/modal.vue";
import { storeMarket } from "@/piniaStore/other";
import { alarmEventRatio, alarmConfirmSituation, riskIndex } from "@/api/shennong/alarm";
import { getMarketList, riskAnalyse } from "@/api/shennong/compre";
import moment from "moment";
import dayjs from 'dayjs'
const piniaStoreMarket = storeMarket();
const alarmModalShow = ref<boolean>(false);
const modalshow = ref(false);
const alarmParameter = ref<Record<string, any>>({
  applicationCode: "",
  alarmStatus: "",
});

const workOrderTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const pieTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const riskTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const risk = ref([]);

const data = ref();
const page = reactive({
  total: 0,
  pageSize: 5,
  pageNumber: 1,
  pages: 0,
});
const colors = ["#94BAF9", "#6C9BE8", "#3F7CDF", "#2989FF"];
const pieData = ref([]);
const handlecurrent = (item) => {
  alarmParameter.value.alarmEventTypeCode = item.id;
  alarmModalShow.value = true;
};
const changepieTime = async () => {
  alarmParameter.value.dateRange = pieTime.value.dateRange;
  let param = {
    period: `${moment()
      .startOf("week")
      .add(1, "days")
      .format("YYYY-MM-DD 00:00:00")},${moment()
      .endOf("week")
      .add(1, "days")
      .format("YYYY-MM-DD 23:59:59")}`,
    type: pieTime.value.timeType,
    marketTenant: piniaStoreMarket.currentMarket,
  };
  let res: any = await alarmEventRatio(param);
  pieData.value = [];
  pieData.value = res.map((item, index) => {
    return {
      name: item.name,
      value: item.totalNum,
      id: item.id,
      color: colors[index % colors.length],
    };
  });
};
const changeReceptionTrendsTime = async () => {
  alarmParameter.value.dateRange = workOrderTime.value.dateRange;
  let param = {
    period: workOrderTime.value.dateRange.join(","),
    type: workOrderTime.value.timeType,
    pageSize: page.pageSize,
    pageNumber: page.pageNumber,
    marketTenant: piniaStoreMarket.currentMarket,
  };
  let { records, total, pages } = await alarmConfirmSituation(param);
  autoPage(page, total, pages);
  data.value = [];
  if (Array.isArray(records) && records.length > 0) {
    data.value = records
      .sort((a, b) => b.totalNum - a.totalNum)
      .map((item, index) => {
        return {
          rank: index + 1,
          name: item.marketName,
          num: item.totalNum,
          marketTenant: item.marketTenant,
        };
      });
  }
};

const changeTimeRisk = async () => {
  const period = dayjs().subtract(1, 'week').startOf('week').format('YYYY-MM-DD')+','+dayjs().subtract(1, 'week').endOf('week').format('YYYY-MM-DD')
  let param = {
    period: period,
    marketTenant: piniaStoreMarket.currentMarket,
  };
  let res: any = await riskIndex(param);
  const data = await getMarketList()
  res.forEach(item=>{
    data.forEach(e=>{
      if(item.marketTenant === e.marketTenant){
        item.status = e.status
      }
    })
  })
  risk.value = [];
  risk.value = res.filter(item => !!item.status)
    .map((item, index) => {
      return {
        name: item.marketName,
        count: item.status ? 100 - Number(item.riskIndex) : 0,
        ratio: item.status ? 100 - Number(item.riskIndex) : 0,
        id: item.marketTenant,
        status:item.status
      };
    }).sort((a, b) => {
      return b.ratio - a.ratio;
    })
    .slice(0, 10);
};
const column = ref([
  {
    title: "排名",
    dataIndex: "rank",
    width: 60,
    slots: {
      customRender: "rank",
    },
  },
  {
    title: "市场名称",
    dataIndex: "name",
  },
  {
    title: "未确认报警数",
    dataIndex: "num",
  },
]);
let timer = null;
// 报警响应情况 每15秒轮播
onMounted(() => {
  changeTimeRisk();
  timer = setInterval(() => {
    changeTimeRisk();
    changeReceptionTrendsTime();
  }, (window as any).config.pageLoopRequestTime);
});

watch(
  () => piniaStoreMarket.currentMarket,
  (n) => {
    if(n){
      clearInterval(timer);
      changeReceptionTrendsTime();
      changeTimeRisk();
    }else{
      changeReceptionTrendsTime();
      changeTimeRisk();
      timer = setInterval(() => {
        changeReceptionTrendsTime();
        changeTimeRisk();
      }, (window as any).config.pageLoopRequestTime);
    }
  }
);

onUnmounted(() => {
  clearInterval(timer);
});
</script>
<style scoped lang="less">
.visiting-data {
  margin-top: 20px;
  height: 350px;
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
  height: 240px;
}
.levelone {
  width: 30px;
  line-height: 18px;
  border-radius: 2px;
  font-size: 16px;
  text-align: center;
  background: rgba(241, 69, 69, 0.302);
  border-radius: 2px 2px 2px 2px;
  opacity: 1;
  border: 1px solid #ed4949;
  color: #fff;
  font-size: 16px;
}
.level {
  width: 30px;
  line-height: 18px;
  border-radius: 2px;
  font-size: 16px;
  text-align: center;
  background: rgba(63, 124, 223, 0.102);
  border-radius: 2px 2px 2px 2px;
  opacity: 1;
  border: 1px solid #3f7cdf;
  color: #fff;
  font-size: 16px;
}
.leveltwo {
  width: 30px;
  line-height: 18px;
  border-radius: 2px;
  font-size: 16px;
  text-align: center;
  background: rgba(63, 124, 223, 0.102);
  border-radius: 2px 2px 2px 2px;
  opacity: 1;
  border: 1px solid #ffaa00;
  color: #fff;
  font-size: 16px;
}

.fx-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .name {
    font-size: 12px;
    font-family: Source Han Sans CN-Regular, Source Han Sans CN;
    font-weight: 400;
    color: #e2edff;
  }
  .score {
    font-size: 26px;
    font-family: pnzd;
    font-weight: 400;
    color: #19d9a9;
  }
}
.line {
  width: 100%;
  border: 1px dotted;
  border-image: linear-gradient(
      90deg,
      rgba(226.0000017285347, 237.0000010728836, 255, 1),
      rgba(226.0000017285347, 237.0000010728836, 255, 0.10000000149011612),
      rgba(226.0000017285347, 237.0000010728836, 255, 1),
      rgba(226.0000017285347, 237.0000010728836, 255, 0.15000000596046448)
    )
    1 1;
}

.content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;

  .device {
    margin-top: 10px;
    width: 22%;
    border-right: 1px dashed;

    border-image: linear-gradient(
        360deg,
        rgba(226.0000017285347, 237.0000010728836, 255, 1),
        rgba(226.0000017285347, 237.0000010728836, 255, 0.10000000149011612),
        rgba(226.0000017285347, 237.0000010728836, 255, 1),
        rgba(226.0000017285347, 237.0000010728836, 255, 0.15000000596046448)
      )
      1 1;
  }
  .name {
    font-size: 12px;
    font-weight: 400;
    color: rgba(226, 237, 255, 0.7);
  }
  .value {
    font-size: 24px;
    font-family: pnzd;
    font-weight: 400;
    color: #ccdfff;
  }
  .ratio {
    margin-left: 5px;
    font-size: 12px;
    font-family: Roboto-Regular, Roboto;
    font-weight: 400;
    color: #19d9a9;
  }
}
.tableList {
  margin-top: 30px;
  width: 100%;
}
.EventAlarm-box {
  height: 380px;
}
</style>
