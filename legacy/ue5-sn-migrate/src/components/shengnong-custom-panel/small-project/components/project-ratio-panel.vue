<template>
  <div class="panel">
  <SubPanelTemplate title="工程巡查统计" image="xs-c1.png">
      <template #extra>
        <DateInlineForm v-model:modelValue="topTime" @search="changeTopTime" menuPage="smallProject" />
      </template>
      <div class="content">
        <NumberStatistics :data="numberData" @click="handleInspectNumber" />
        <div class="content-tab">
          <a-tabs v-model:activeKey="tabKey" @change="changeTab" >
            <a-tab-pane v-for="item in tabList" :key="item.key" :tab="item.label"></a-tab-pane>
          </a-tabs>
        </div>
        <div class="more" @click="handleMore">查看更多></div>
        <div class="content-list" v-if="eventItemList.length > 0">
          <EventAlarmItem
            style="cursor: pointer"
            v-for="(item, index) in eventItemList"
            :sort="item.rank"
            :ratio="item.ratio"
            :linkRatio="item.ratio"
            :count="item.count"
            :name="item.name"
            :sn="true"
            :width="item.width"
            @click="openInspect(item)"
          />
        </div>
        <noData v-else />
      </div>
    </SubPanelTemplate>
</div>
  <inspectModel
    :marketName="marketTenant"
    :abnormal="abnormal"
    v-if="showInspectModel"
    :time="topTime.dateRange.join(',')"
    :title="'工程巡查任务'"
    :show-modal="showInspectModel"
    @close="showInspectModel = false"
  ></inspectModel>
  <AlarmStatisticsModal 
    @close="showInspectMore = false" 
    :modalTitle="moreTitle" 
    :showModal="showInspectMore" 
    :parameter="moreParameter" 
    :getDataFunc="getMarketInspectionMore"
    :fieldNames="{
      name: 'marketName',
      value: 'taskNum',
      chainRatio: 'ratio',
    }">
  </AlarmStatisticsModal>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { filterMarket, getallNumber} from "@/utils/common";
import { storeMarket } from "@/piniaStore/other";
import noData from "@/components/businessPanel/public/noData.vue";
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import DateInlineForm from "../../common/dateInlineForm.vue";
import NumberStatistics from "../../common/number-statistics.vue";
import EventAlarmItem from '../../common/snEventItem.vue'
import { safetyMarketInspectionStatistics, safetyMarketInspection } from "@/api/shennong/small-project";
import inspectModel from "./inspect-model.vue";
import AlarmStatisticsModal from "@/components/shengnong-custom-panel/security-monitoring/components/alarm-statistics-modal.vue";

const piniaStoreMarket = storeMarket();
const props = withDefaults(
  defineProps<{
    chartHeight?: number;
    applicationCode: string;
  }>(),
  {
    chartHeight: 300,
    applicationCode: "SMALL_ENGINEERING",
  }
);

const tabList = [
  {
    label: "巡查数",
    key: "all",
  },
  {
    label: "巡查异常数",
    key: "abnormal",
  },
]
const tabKey = ref('all')
const eventItemList = ref([])
const moreTitle = computed(() => {
  const title = tabList.find((item) => item.key === tabKey.value)?.label
  return `工程巡查统计-${title}`
})
const numberData = reactive([
  {
    name: '工程巡查总数',
    value: 0,
    unit: '',
    icon: "xs-c3.png",
  },
  {
    name: '巡查异常总数',
    value: 0,
    unit: '',
    icon: "xs-c4.png",
    color: "red",
  },
]);
const showInspectMore = ref(false)
const topTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});

const moreParameter = ref<Record<string, any>>({
  applicationCode: props.applicationCode,
  period: [],
  marketTenant: ""
});

const getMarketInspectionMore =  async (param?: Record<string, any>): Promise<any> => {
  let params = {
    taskStatus: '',
    period: topTime.value.dateRange.join(","),
    type: topTime.value.timeType,
    pageSize: param.pageSize,
    pageNumber: param.pageNumber,
    abnormal: tabAbnormal.value,
    businessType: 'SMALL_ENGINEERING',
  };
  return await safetyMarketInspection(params);
};

const handleMore = () => {
  showInspectMore.value = true;
  moreParameter.value = {
    type: topTime.value.timeType,
    dateRange: topTime.value.dateRange,
    marketTenant: '',
    pageSize: 1,
    pageNumber: 10,
    abnormal: tabAbnormal.value,
    businessType: 'SMALL_ENGINEERING',
  };
}
const changeTopTime = async () => {
  let params = {
      period: topTime.value.dateRange.join(","),
      marketTenant: '',
      pageSize: 50,
      pageNumber: 1,
      abnormal: tabAbnormal.value,
      businessType: 'SMALL_ENGINEERING',
  };
  getSafetyMarketInspectionStatistics(params);
  getSafetyMarketInspection(params);
};

const tabAbnormal = computed(() => {
  return tabKey.value === 'all'? null : true
})
const changeTab = async () => {
  let params = {
      period: topTime.value.dateRange.join(","),
      marketTenant: '',
      pageSize: 50,
      pageNumber: 1,
      abnormal: tabAbnormal.value,
      businessType: 'SMALL_ENGINEERING',
  };
  getSafetyMarketInspection(params);
}

const getSafetyMarketInspectionStatistics = async (params: Record<string, any>) => {
  try {
    const taskCountRes = await safetyMarketInspectionStatistics(params);
    numberData[0].value = taskCountRes.inspectionTaskNum ?? 0;
    numberData[1].value = taskCountRes.errorInspectionNum ?? 0;
  } catch (error) {
  }
}

const getSafetyMarketInspection = async (params: Record<string, any>) => {
  try {
    let { records,total,pages } = await safetyMarketInspection(params);
    const newRecords = filterMarket(records)
    const totalCount = getallNumber(newRecords, "taskNum")
    eventItemList.value = newRecords?.sort((a, b) => b.taskNum - a.taskNum).map((item, index) => {
      return {
        ...item,
        rank: index + 1,
        name: item.marketName,
        count: item.taskNum,
        ratio: item.ratio,
        width: item.taskNum / totalCount * 100,
      };
    }).slice(0, 6);
  } catch (error) {
  }
}

const handleInspectNumber = (item) => {
  openInspect({
    label: item.name,
    actionTag: 'TotalStatistics',
    numberAbnormal: item.name === '巡查异常总数',
  });
}

const marketTenant = ref("");
const abnormal = ref(false)
const showInspectModel = ref(false);
const openInspect = (record) => {
  marketTenant.value = record.marketTenant;
  abnormal.value = record.actionTag ? record.numberAbnormal : tabAbnormal.value;
  showInspectModel.value = true;
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
