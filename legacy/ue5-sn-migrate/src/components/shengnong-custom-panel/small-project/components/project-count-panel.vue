<template>
  <div class="panel">
    <SubPanelTemplate title="小散工程数" image="xs-c1.png">
      <template #extra>
        <DateInlineForm v-model:modelValue="topTime" @search="changeTopTime" menuPage="smallProject" />
      </template>
      <div class="content">
        <div class="more" @click="handleMore">查看更多></div>
        <div class="content-list" v-if="eventItemList.length > 0">
          <EventAlarmItem
            v-for="(item, index) in eventItemList"
            :sort="item.rank"
            :ratio="item.ratio"
            :linkRatio="item.ratio"
            :count="item.count"
            :name="item.name"
            :sn="true"
            :width="item.width"
            :hideRatio="true"
            @click="openSmall(item)"
          />
        </div>
        <noData v-else />
      </div>
    </SubPanelTemplate>
  </div>
  <modal-table v-if="looseWorksShow" :show="looseWorksShow && !looseWorksDetailVisible" title="小散工程记录" @close="closeListModal">
    <project-record :parameter="moreParameter" @detail-visible="looseWorksDetailVisible = $event"></project-record>
  </modal-table>
  <AlarmStatisticsModal
    @close="showLooseWorkMore = false"
    :modalTitle="'各市场小散工程数'"
    :showModal="showLooseWorkMore"
    :parameter="moreParameter"
    :getDataFunc="getMarketLooseWorks"
    :showChainRatio="false"
    :fieldNames="{
      name: 'marketName',
      value: 'num',
    }"
  >
  </AlarmStatisticsModal>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";

import { TopParams } from "../../common/alarmlist-event";
import DateInlineForm from "../../common/dateInlineForm.vue";
import EventAlarmItem from "../../common/snEventItem.vue";
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import projectRecord from "./project-record.vue";
import { safetyMarketLooseWorks } from "@/api/shennong/small-project";
import noData from "@/components/businessPanel/public/noData.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import modalTable from "@/components/modal-table/modal.vue";
import AlarmStatisticsModal from "@/components/shengnong-custom-panel/security-monitoring/components/alarm-statistics-modal.vue";
import { storeMarket } from "@/piniaStore/other";
import bus from "@/utils/bus";
import { getallNumber } from "@/utils/common";
import { filterMarket } from "@/utils/common";

const piniaStoreMarket = storeMarket();
const props = withDefaults(
  defineProps<{
    chartHeight?: number;
    applicationCode: string;
  }>(),
  {
    chartHeight: 300,
    applicationCode: "SMALLENFINEERING",
  },
);

const looseWorksShow = ref<boolean>(false);
const looseWorksDetailVisible = ref(false);
const closeListModal = () => {
  looseWorksShow.value = false;
  looseWorksDetailVisible.value = false;
};
const closeModal = () => {
  closeListModal();
};
const eventItemList = ref([]);
const showLooseWorkMore = ref(false);
const topTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const moreParameter = ref<Record<string, any>>({
  applicationCode: props.applicationCode,
  period: [],
  marketTenant: "",
});
const handleMore = () => {
  moreParameter.value = {
    type: topTime.value.timeType,
    dateRange: topTime.value.dateRange,
    applicationCode: "SMALLENFINEERING",
  };
  showLooseWorkMore.value = true;
};
const getMarketLooseWorks = async (param?: Record<string, any>): Promise<any> => {
  let params = {
    period: topTime.value.dateRange.join(","),
    type: topTime.value.timeType,
    pageSize: param.pageSize,
    pageNumber: param.pageNumber,
  };
  return await safetyMarketLooseWorks(params);
};
const changeTopTime = async () => {
  try {
    let params = {
      period: topTime.value.dateRange.join(","),
      marketTenant: "",
      pageSize: 50,
      pageNumber: 1,
    };
    const { records } = await safetyMarketLooseWorks(params);
    const newRecords = filterMarket(records);
    const totalCount = getallNumber(newRecords, "num");
    eventItemList.value = newRecords
      ?.sort((a, b) => b.num - a.num)
      .map((item, index) => {
        return {
          ...item,
          rank: index + 1,
          name: item.marketName,
          count: item.num,
          width: (item.num / totalCount) * 100,
        };
      })
      .slice(0, 3);
  } catch (error) {}
};
const openSmall = (record) => {
  moreParameter.value = {
    applicationCode: props.applicationCode,
    marketTenant: record?.marketTenant,
    period: topTime.value.dateRange,
    status: "",
  };
  looseWorksShow.value = true;
  looseWorksDetailVisible.value = false;
};

bus.on("topPanelClick", (item: TopParams): void => {
  if (item?.key === "totalNum") {
    moreParameter.value = {
      applicationCode: props.applicationCode,
      period: item?.period?.split(","),
    };
    looseWorksShow.value = true;
    looseWorksDetailVisible.value = false;
  } else if (item?.key === "underwayNum") {
    moreParameter.value = {
      applicationCode: props.applicationCode,
      period: item?.period?.split(","),
      stateRange: "NORMAL",
    };
    looseWorksShow.value = true;
    looseWorksDetailVisible.value = false;
  } else if (item?.key === "abnormalNum") {
    moreParameter.value = {
      applicationCode: props.applicationCode,
      period: item?.period?.split(","),
      stateRange: "ABNORMAL",
    };
    looseWorksShow.value = true;
    looseWorksDetailVisible.value = false;
  }
});
onMounted(() => {
  changeTopTime();
});
</script>
<style lang="less" scoped>
.chart {
  width: 1.80917rem;
  height: 450px;
  margin-bottom: 30px;
}

.content-tab {
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
    background: linear-gradient(180deg, rgba(97, 148, 247, 0.0196) 0%, rgba(97, 148, 247, 0.5) 96%);
    color: #6194f7;
  }

  :deep(.ant-tabs-tab) {
    height: 36px;
  }
}
.more {
  color: #93aadb;
  font-size: 14px;
  text-align: right;
  padding: 4px;
  cursor: pointer;
}
</style>
