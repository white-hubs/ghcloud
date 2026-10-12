<template>
  <div class="panel">
  <SubPanelTemplate title="工程整改统计" image="xs-c1.png">
      <template #extra>
        <DateInlineForm v-model:modelValue="topTime" @search="changeTopTime" menuPage="smallProject" />
      </template>
      <div class="content">
        <NumberStatistics :data="numberData" skin="row" @click="handleInspectNumber" />
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
            @click="openInspect(item)"
          />
        </div>
        <noData v-else />
      </div>
    </SubPanelTemplate>
</div>
  <reformRecord
    v-if="reformRecordShow"
    :title="'工程整改记录'"
    :marketTenant="marketTenant"
    :time="topTime.dateRange.join(',')"
    :show-modal="reformRecordShow"
    @close="reformRecordShow = false"
  ></reformRecord>
  <AlarmStatisticsModal 
    @close="showLooseWorkMore = false" 
    :modalTitle="'工程整改统计'" 
    :showModal="showLooseWorkMore" 
    :parameter="moreParameter" 
    :getDataFunc="getLooseWorkStatisticsReform"
    :showChainRatio="false"
    :fieldNames="{
      name: 'marketName',
      value: 'num',
    }">
  </AlarmStatisticsModal>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { filterMarket, getallNumber} from "@/utils/common";
import { storeMarket } from "@/piniaStore/other";
import reformRecord from "./reform-record.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import DateInlineForm from "../../common/dateInlineForm.vue";
import NumberStatistics from "../../common/number-statistics.vue";
import EventAlarmItem from '../../common/snEventItem.vue'
import { safetyMarketLooseWorkStatisticsReform } from "@/api/shennong/small-project";
import AlarmStatisticsModal from "@/components/shengnong-custom-panel/security-monitoring/components/alarm-statistics-modal.vue";

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

const eventItemList = ref([])
const numberData = reactive<any>([
  {
    value: 0,
    icon: "xs-c3.png",
    iconTit: '工程整改数',
    ratioTit: '环比',
    ratio: '0'
  },
]);
const showLooseWorkMore = ref(false)
const topTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const moreParameter = ref<Record<string, any>>({
  applicationCode: props.applicationCode,
  period: [],
  marketTenant: ""
});
const handleMore = () => {
  showLooseWorkMore.value = true;
  moreParameter.value = {
    type: topTime.value.timeType,
    dateRange: topTime.value.dateRange,
  };
}
const getLooseWorkStatisticsReform =  async (param?: Record<string, any>): Promise<any> => {
  let params = {
    period: topTime.value.dateRange.join(","),
    type: topTime.value.timeType,
    marketTenant: '',
    pageSize: param.pageSize,
    pageNumber: param.pageNumber,
  };
  return safetyMarketLooseWorkStatisticsReform(params);
};
const changeTopTime = async () => {
  try {
    let params = {
      period: topTime.value.dateRange.join(","),
      marketTenant: '',
      pageSize: 50,
      pageNumber: 1,
    };
    const response = await safetyMarketLooseWorkStatisticsReform(params);
    numberData[0].value = response.reformNum ?? 0;
    numberData[0].ratio = `${Math.round(Number(response.reformChainRatio)) || 0}`;
    const newRecords = filterMarket(response?.records)
    const totalCount = getallNumber(newRecords, "num")
    eventItemList.value = newRecords?.sort((a, b) => b.num - a.num).map((item, index) => {
      return {
        ...item,
        rank: index + 1,
        name: item.marketName,
        count: item.num,
        width: item.num / totalCount * 100,
      };
    }).slice(0, 3);
  } catch (error) {
  }
};
const marketTenant = ref();
const handleInspectNumber = (item) => {
  openInspect({
    label: item.name,
  });
}

const reformRecordShow = ref<boolean>(false);
const openInspect = (record) => {
  marketTenant.value = record.marketTenant;
  reformRecordShow.value = true;
};
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
    background: linear-gradient(
      180deg,
      rgba(97, 148, 247, 0.0196) 0%,
      rgba(97, 148, 247, 0.5) 96%
    );
    color: #6194f7;
  }

  :deep(.ant-tabs-tab) {
    height: 36px;
  }
}
.more {
  color:#93AADB;
  font-size: 14px;
  text-align: right;
  padding:4px;
  cursor: pointer;
}
</style>
