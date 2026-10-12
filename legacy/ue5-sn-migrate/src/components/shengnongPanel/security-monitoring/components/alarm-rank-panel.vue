<template>
  <SubPanelTemplate title="报警排名" image="tj.png">
    <template #extra>
      <DateInlineForm
        class="shengNongColor"
        v-model:modelValue="riskTime"
        @search="changeTimeRisk"
      ></DateInlineForm>
    </template>
    <div class="body" :style="{ height: px2rem(chartHeight + 'px') }">
      <div class="more">
        <div class="inspectTab">
          <a-tabs
            style="position: absolute; right: 0"
            v-model:activeKey="currenrnumber"
            @change="changeTimeRisk"
          >
            <a-tab-pane key="ALARM_ALL" tab="报警数"></a-tab-pane>
            <a-tab-pane key="ALARM_HANDLER" tab="处理数" force-render></a-tab-pane>
            <!-- <a-tab-pane key="ALARM_PROGRESS" tab="响应数"></a-tab-pane> -->
          </a-tabs>
        </div>
      </div>
      <div v-if="risk.length > 0" style="overflow: hidden">
        <vue3-seamless-scroll
          v-if="piniaStoreMarket.currentMarketName == ''"
          :list="risk"
          :step="0.5"
          hover
          :singleHeight="40"
        >
          <EventAlarmItem
            v-for="(item, index) in risk"
            :sort="item.rank"
            :ratio="item.ratio"
            :count="item.count"
            :name="item.name"
            :linkRatio="item.ratio"
            :width="item.width"
            @click="openalarm(item)"
          />
        </vue3-seamless-scroll>
        <div v-else>
          <EventAlarmItem
            v-for="(item, index) in risk"
            :sort="item.rank"
            :ratio="item.ratio"
            :count="item.count"
            :name="item.name"
            :linkRatio="item.ratio"
            :width="item.width"
            @click="openalarm(item)"
          />
        </div>
      </div>

      <div style="width: 100%; margin-top: 30px" v-else>
        <noData />
      </div>
    </div>
  </SubPanelTemplate>
  <modal-alarm-table
    :show-modal="alarmModalShow"
    @close="closeModal"
    :parameter="alarmParameter"
  ></modal-alarm-table>
</template>
<script setup lang="ts">
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";

import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/snPanelTemplate.vue";
import EventAlarmItem from "@/components/businessPanel/public/snEventItem.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { px2rem, autoPage, getcurrentData, getallNumber } from "@/utils/common";
import { storeMarket } from "@/piniaStore/other";
import { alarmStatisticsRank } from "@/api/shennong/alarm";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import noData from "@/components/businessPanel/public/noData.vue";

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

const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({
  applicationCode: props.applicationCode,
  alarmStatus: "",
  alarmTypeCode: props.applicationCode,
});
const closeModal = () => {
  alarmModalShow.value = false;
};
const openalarm = (record) => {

  alarmModalShow.value = true;
  alarmParameter.value = Object.assign(alarmParameter.value, record);
  alarmParameter.value.alarmStatus =
    currenrnumber.value == "ALARM_ALL" ? "" : "ALARM_HANDLER";
};
const currenrnumber = ref("ALARM_ALL");
const riskTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const risk = ref([]);
const riskPage = reactive({
  total: 0,
  pageSize: 50,
  pageNumber: 1,
  pages: 0,
});
const changeTimeRisk = async () => {
  alarmParameter.value.dateRange = riskTime.value.dateRange;
  let param = {
    period: riskTime.value.dateRange.join(","),
    type: riskTime.value.timeType,
    stateRange: currenrnumber.value,
    pageSize: riskPage.pageSize,
    pageNumber: riskPage.pageNumber,
    // marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: props.applicationCode,
  };
  let { records, total, pages } = await alarmStatisticsRank(param);
  // autoPage(riskPage, total, pages)
  risk.value = [];
  if (Array.isArray(records) && records.length > 0) {
    risk.value = records
      .sort((a, b) => b.totalNum - a.totalNum)
      .map((item, index) => {
        return {
          ...item,
          rank: index + 1,
          name: item.marketName,
          count: item.totalNum,
          ratio: item.chainRatio,
          width: item.totalNum / getallNumber(records, "totalNum"),
        };
      });
  }
};

let timer = null;
// 报警事件排名 每15秒轮播
onMounted(() => {
  timer = setInterval(() => {
    // changeTimeRisk()
  }, (window as any).config.pageLoopRequestTime);
});

watch(
  () => piniaStoreMarket.currentMarket,
  (n) => {
    // changeTimeRisk()
  }
);
const currentMarketName = ref(true);
watch(
  () => piniaStoreMarket.currentMarketName,
  (n) => {

    if (n == "") {
      currentMarketName.value = true;
    } else {
      currentMarketName.value = getcurrentData(risk.value, n);
    }
  }
);
onUnmounted(() => {
  clearInterval(timer);
});
</script>
<style scoped lang="less">
.inspectTab {
  height: 40px;
  text-align: right;
  margin-top: 10px;
  position: relative;

  :deep(.ant-tabs-tab-btn) {
    color: #93aadb;
  }

  :deep(.ant-tabs-nav::after) {
    content: none;
  }

  :deep(.ant-tabs-nav::before) {
    content: none;
  }

  :deep(.ant-tabs-tab-active) {
    background: linear-gradient(
      180deg,
      rgba(97, 148, 247, 0.0196) 0%,
      rgba(97, 148, 247, 0.5) 96%
    );
    color: #6194f7;
  }

  :deep(.ant-tabs-tab) {
    height: 22px;
  }
}
.eventAlarmItem {
  margin-bottom: 15px !important;
}
.more {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  cursor: pointer;
  margin-top: -5px;
  color: #93aadb;
  font-size: 12px;
  div {
    margin-right: 10px;
  }
}
.bgc {
  font-size: 14px;
  background: linear-gradient(
    180deg,
    rgba(97, 148, 247, 0.0196) 0%,
    rgba(97, 148, 247, 0.5) 96%
  );
  font-weight: 500;
  color: #6194f7;
}
</style>
