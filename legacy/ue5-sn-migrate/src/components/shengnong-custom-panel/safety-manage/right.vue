<template>
  <div class="panel">
    <SubPanelTemplate title="安全巡检统计" image="xj.png" class="visiting-data inspectCard">
      <template #extra>
        <DateInlineForm v-model:modelValue="safetyInspectTime" @search="changeInspectTabTime" menuPage="safetyManage" />
      </template>
      <NumberStatistics :data="safetyInspectData" skin="row-cell" @click="handleInspectNumber" />
      <div>
        <div class="inspectTab">
          <a-tabs @change="getInspectList" v-model:activeKey="activeKey">
            <a-tab-pane key="" tab="任务数"></a-tab-pane>
            <a-tab-pane key="TEMPINSPECTION" tab="临时巡检数"></a-tab-pane>
            <a-tab-pane key="errorInspectionNum" tab="巡检异常次数"></a-tab-pane>
          </a-tabs>
        </div>
        <div class="more" @click="handleMore">查看更多></div>
        <div class="riskList" v-if="inspect.length !== 0">
          <EventAlarmItem style="cursor: pointer" @click="openInspect(item)" v-for="(item, index) in inspect"
            :width="item.width" :sort="item.sort" :ratio="item.ratio" :count="item.count" :name="item.name" />
        </div>
        <div v-else>
          <noData />
        </div>
      </div>
    </SubPanelTemplate>
    <SafetyPatrolStat @clickRow="clickAlarmAnalysisBar" />
    <rightBottomPanel />
  </div>
  <inspectModel :marketName="marketName" v-if="showInspectModel" :time="safetyInspectTime.dateRange.join(',')"
    :title="'巡检记录'" :state="recordstate" :abnormal="abnormal" :show-modal="showInspectModel"
    @close="showInspectModel = false"></inspectModel>
  <tempInspectModel :marketName="marketName" v-if="showTempInspectModel" :time="safetyInspectTime.dateRange.join(',')"
    :title="`${tempBool ? '临时巡检记录' : tempResult === 'ABNORMAL' ? '巡检异常记录' : '巡检记录'}`" :tempBool="tempBool"
    :result="tempResult" :show-modal="showTempInspectModel" @close="showTempInspectModel = false"></tempInspectModel>
  <nightPatrol :marketid="marketid" :status="statusName" :resultCode="resultCode" v-if="showNightPatrol"
    :time="secureTime.dateRange.join(',')" :title="`${ resultCode === 'ABNORMAL' ? '异常' : ''}巡更记录`"
    :show-modal="showNightPatrol" @close="showNightPatrol = false"></nightPatrol>
  <modal-table :show="showEmergencyModal" title="预案文件" @close="close" width="1200px">
    <yuan :periodtime="secureTime.dateRange.join(',')" style="min-height: 200px;"></yuan>
  </modal-table>
  <AlarmStatisticsModal @close="showInspectMore = false" :modalTitle="moreTitle" :showModal="showInspectMore"
    :parameter="moreParameter" :getDataFunc="getInspectRankApi" :fieldNames="{
      name:'marketName',
      value:'taskNum',
      chainRatio:'ratio'
    }"
  />

</template>

<script setup lang="ts">
import { ModelValueItf } from "@/components/businessPanel/public/types";
import noData from "@/components/businessPanel/public/noData.vue";
import { ref, reactive, onMounted, computed } from "vue";
import EventAlarmItem from "../common/snEventItem.vue";
import inspectModel from "./components/inspect-model.vue";
import tempInspectModel from "./components/temp-inspect-model.vue";
import nightPatrol from "./components/night-patrol.vue";
import modalTable from "@/components/modal-table/modal.vue";
import SubPanelTemplate from "../common/snPanelTemplate.vue";
import DateInlineForm from "../common/dateInlineForm.vue";
import NumberStatistics from "../common/number-statistics.vue";
import yuan from "./components/yuan.vue";
import { getrandom } from "@/utils/enumeratie";
import { getallNumber } from "@/utils/common";
import {
  safetyInspection,
  safetyMarketInspection,
  safetyPatrol,
  emergencyFile,
  safetyMarketInspectionRank,
} from "@/api/shennong/compre";
import AlarmStatisticsModal from "@/components/shengnong-custom-panel/security-monitoring/components/alarm-statistics-modal.vue";
import rightBottomPanel from "./components/right-bottom-panel.vue";
import { filterMarket } from "@/utils/common";
import SafetyPatrolStat from "./components/safety-patrol-stat.vue";
import dayjs from "dayjs";
const safetyInspectTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const secureTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [dayjs().startOf("year").format('YYYY-MM-DD 00:00:00'), dayjs().endOf("year").format('YYYY-MM-DD HH:mm:ss')],
});
const safetyInspectData = reactive([
  {
    name: '巡检任务总数',
    value: 0,
    unit: '个',
    icon: '',
    color: 'blue' as const,
    code: '',
  },
  {
    name: '临时巡检数',
    value: 0,
    unit: '个',
    icon: '',
    color: 'green' as const,
    code: 'TEMPINSPECTION',
  },
  {
    name: '巡检异常次数',
    value: 0,
    unit: '次',
    icon: '',
    color: 'yellow' as const,
    code: 'errorInspectionNum',
  },
]);

const showEmergencyModal = ref(false);
const close = () => {
  showEmergencyModal.value = false;
};
const marketName = ref("");
const activeKey = ref("");
const inspect = ref([]);
const alarmStatisticsData = ref({
  totalNum: 0,//报警总数
  totalRatio: 0,//报警环比
  statList:[
      {
        sort:1,
        name:'异常任务数',
        key:'errCount',
        count:0,
        modes:'1',
        linkRatio:1,
        code:1,
        sn:true,
        width:0,
        rank:1,
        lineColor:['rgba(250,78,78,0.00)','#fa4e4e']
      },
        {
        sort:2,
        name:'待完成任务数',
        key:'waitCount',
        count:0,
        modes:'1',
        linkRatio:1,
        code:1,
        sn:true,
        width:0,
        rank:1,
        lineColor:['rgba(247,160,59,0.00)','#f7a03b']
      },
      {
        sort:3,
        name:'已完成任务数',
        key:'finishedCount',
        count:0,
        modes:'1',
        linkRatio:1,
        code:1,
        sn:true,
        width:0,
        rank:1,
        lineColor:['rgba(57,238,143,0.00)','#3bf793']
      },
      {
        sort:4,
        name:'处理中任务数',
        key:'executionCount',
        count:0,
        modes:'1',
        linkRatio:1,
        code:1,
        sn:true,
        width:0,
        rank:1,
        lineColor:['rgba(75,134,255,0.00)','#4b86ff']
      },
  ]
});
const showInspectModel = ref(false);
const showTempInspectModel = ref(false);
const showNightPatrol = ref(false);
const market = reactive({
  total: 0,
  pageSize: 50,
  pageNumber: 1,
  pages: 0,
});
const handleInspectNumber = (item) => {
  openInspect({
    label: item.name,
  });
}
const changeInspectTabTime = async () => {
  let res = await safetyInspection({
    period: safetyInspectTime.value.dateRange.join(","),
    marketTenant: '',
  });
  safetyInspectData[0].value = res.inspectionTaskNum || 0;
  safetyInspectData[1].value = res.tempInspectionNum;
  safetyInspectData[2].value = res.errorInspectionNum; 
  getInspectList();
};
const getInspectList = async () => {
  let result = { total: 0, records: [], pages: 0 }
  if (activeKey.value === 'TEMPINSPECTION') {
    let params = {
      period: safetyInspectTime.value.dateRange.join(","),
      type: safetyInspectTime.value.timeType,
      pageSize: market.pageSize,
      pageNumber: market.pageNumber,
      tempBool: true,
      result: '',
    };
    result = await safetyMarketInspectionRank(params);
  } else if (activeKey.value === 'errorInspectionNum') {
    let params = {
      period: safetyInspectTime.value.dateRange.join(","),
      type: safetyInspectTime.value.timeType,
      pageSize: market.pageSize,
      pageNumber: market.pageNumber,
      tempBool: false,
      result: 'ABNORMAL',
    };
    result = await safetyMarketInspectionRank(params);
  } else {
    let params = {
      taskStatus: activeKey.value,
      period: safetyInspectTime.value.dateRange.join(","),
      type: safetyInspectTime.value.timeType,
      pageSize: market.pageSize,
      pageNumber: market.pageNumber,
    };
    result = await safetyMarketInspection(params);
  }
  let { records } = result
  const newRecords = filterMarket(records)
  const total = getallNumber(newRecords, "taskNum")
  inspect.value = newRecords.map((item, index) => {
    return {
      name: item.marketName,
      marketName: item.marketName,
      count: item.taskNum,
      ratio: item.ratio,
      sort: index + 1,
      marketTenant: item.marketTenant,
      width: item.taskNum / total * 100,
    };
  }).slice(0, 3);
};

const clickAlarmAnalysisBar = (record) => {
  marketid.value = record.marketTenant
  secureTime.value.dateRange=record.dateRange
  resultCode.value = record.activeKey ? "ABNORMAL" : ''
  showNightPatrol.value = true;
};
const changePatrolTime = async () => {
  let param = {
    period: secureTime.value.dateRange.join(","),
    type: secureTime.value.timeType,
    marketTenant: '',
  };
  let result = await safetyPatrol(param);
  const { errCount, executionCount, finishedCount, totalCount, waitCount} = result;
  const total = Number(errCount) + Number(executionCount) + Number(finishedCount) + Number(waitCount)
  alarmStatisticsData.value.totalNum = totalCount
  alarmStatisticsData.value.statList[0].count = errCount
  alarmStatisticsData.value.statList[0].width = errCount / total
  alarmStatisticsData.value.statList[1].count = waitCount
  alarmStatisticsData.value.statList[1].width = waitCount / total
  alarmStatisticsData.value.statList[2].count = finishedCount
  alarmStatisticsData.value.statList[2].width = finishedCount / total
  alarmStatisticsData.value.statList[3].count = executionCount
  alarmStatisticsData.value.statList[3].width = executionCount / total
};
const recordstate = ref("");
const abnormal = ref(false);
const statetype = {
  巡检任务总数: "",
  待接受任务数: "ACCEPT",
  进行中任务数: "EXECUTING",
  临时巡检数: "TEMPINSPECTION",
  巡检异常次数: "",
};
const tempBool = ref()
const tempResult = ref()
const openInspect = (item) => {
  recordstate.value = statetype[item.label];
  if (!item.label && activeKey.value !== 'errorInspectionNum') {
    recordstate.value = activeKey.value;
  }
  if (item) {
    marketName.value = item.marketTenant;
  } else {
    marketName.value = "";
  }
  abnormal.value = false
  // abnormal.value = item.label === "巡检异常次数" || activeKey.value === 'errorInspectionNum'
  if (recordstate.value === 'TEMPINSPECTION') {
    tempBool.value = true
    tempResult.value = ''
    showTempInspectModel.value = true;
    showInspectModel.value = false;
  } else if (item.label === "巡检异常次数" || activeKey.value === 'errorInspectionNum') {
    tempBool.value = false
    tempResult.value = 'ABNORMAL'
    showTempInspectModel.value = true;
    abnormal.value = true
    showInspectModel.value = false;
  } else {
    showInspectModel.value = true;
    showTempInspectModel.value = false;
  }
};
const marketid = ref("");
const statusName = ref("");
const resultCode = ref("");
const emergencyFileTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const pieData = ref([
  {
    name: "电动车管理",
    value: getrandom(15),
    color: "#94BAF9",
  },
  {
    name: "消防预案制度",
    value: getrandom(70),
    color: "#6C9BE8",
  },
  {
    name: "小散工程管理制度",
    value: getrandom(70),
    color: "#3F7CDF",
  },
  {
    name: "其他",
    value: getrandom(15),
    color: "#2989FF",
  },
]);
const emergencyFileClick = (data) => {
  showEmergencyModal.value = true;
};
const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
const changeEmergencyFileTime = async (): Promise<void> => {
  let param = {
    period: '',
    type: '',
    marketTenant: '',
  };
  let res: any = await emergencyFile(param);
  pieData.value = res.classifyStatistics.map((item, index) => {
    return {
      name: item.classifyName,
      value: item.classifyNum,
      color: colors[index % colors.length],
    };
  });
};

const moreTitle = computed(() => {
  const title = activeKey.value === 'TEMPINSPECTION' ? '临时巡检' : activeKey.value === 'errorInspectionNum' ? '巡检异常次数' : '任务数'
  return `安全巡检统计-${title}`
})
const showInspectMore = ref(false)
const moreParameter = ref<Record<string, any>>({
  applicationCode: "",
  alarmStatus: "",
  alarmTypeCode: "",
});
const getInspectRankApi =  async (param?: Record<string, any>): Promise<any> => {
  if (activeKey.value === 'TEMPINSPECTION') {
    let params = {
      period: safetyInspectTime.value.dateRange.join(","),
      type: safetyInspectTime.value.timeType,
      pageSize: param.pageSize,
      pageNumber: param.pageNumber,
      marketTenant: '',
      tempBool: true,
      result: '',
    };
    return await safetyMarketInspectionRank(params);
  } else if (activeKey.value === 'errorInspectionNum') {
    let params = {
      period: safetyInspectTime.value.dateRange.join(","),
      type: safetyInspectTime.value.timeType,
      pageSize: param.pageSize,
      pageNumber: param.pageNumber,
      marketTenant: '',
      tempBool: false,
      result: 'ABNORMAL',
    };
    return await safetyMarketInspectionRank(params);
  } else {
    let params = {
      taskStatus: '',
      period: safetyInspectTime.value.dateRange.join(","),
      type: safetyInspectTime.value.timeType,
      pageSize: param.pageSize,
      pageNumber: param.pageNumber,
    };
    return await safetyMarketInspection(params);
  }
};
const handleMore = () => {
  moreParameter.value = {
    type: safetyInspectTime.value.timeType,
    dateRange: safetyInspectTime.value.dateRange,
  };
  showInspectMore.value = true;
}
onMounted(() => {
  getInspectList();
  changePatrolTime();
  changeEmergencyFileTime();
});
</script>
<style lang="less" scoped>
.inspectTab {
  height: 30px;
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
    background: linear-gradient(180deg,
        rgba(97, 148, 247, 0.0196) 0%,
        rgba(97, 148, 247, 0.5) 96%);
    color: #6194f7;
  }

  :deep(.ant-tabs-tab) {
    height: 26px;
  }
}

:deep(.inspectCard .hidden-danger .hidden-danger-box .hidden-danger-name) {
  white-space: nowrap;
}

:deep(.inspectCard .hidden-danger .hidden-danger-box) {
  width: 30%;
  overflow: hidden;
  background-size: cover;
}

:deep(.inspectCard .ant-tabs > .ant-tabs-nav) {
  display: inline-block;
}

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
}

.chart {
  flex: 1;
  height: 180px;
}

.mt-20 {
  margin-top: 20px;
}

.riskList {
  overflow: hidden;
  // height: 250px;
  margin-top: 10px;
}

.tj {
  // height: 285px;
}

.more {
  color: #93AADB;
  font-size: 14px;
  text-align: right;
  padding: 0 4px;
  cursor: pointer;
}

.alarm-total {
  color: #fff;
  text-align: center;
  font-size: 32px;
  font-family: D-DIN, D-DIN-Regular;
  font-weight: bold;
}

.alarm-total-text {
  color: #fff;
  text-align: center;
  font-size: 15px;
}
:deep(.eventAlarmItem){
  margin-bottom: 10px;
}
:deep(.eventAlarmItem .line){
  margin-top: 5px;
}
:deep(.container .box){
  padding: 5px 10px;
}
</style>
