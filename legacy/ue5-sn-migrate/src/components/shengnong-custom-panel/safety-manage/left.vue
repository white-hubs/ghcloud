<template>
  <div class="panel">
    <SubPanelTemplate title="安全工作情况" image="aqgz.png" class="gz">
      <template #extra>
        <DateInlineForm v-model:modelValue="safetyWorkTime" @search="changeSafetyWorkTime" menuPage="safetyManage" />
      </template>
      <div class="safety-work">
        <div style="width: 100%" v-if="!(safetyWorkData && safetyWorkData.some((item) => item.value > 0))">
          <noData />
        </div>
        <NumberStatistics v-else :data="safetyWorkData" @click="handleWorkNumber" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="隐患统计" image="yh-c.png" class="yh">
      <template #extra>
        <DateInlineForm v-model:modelValue="hiddenDangerTime" @search="changeSafetyHiddenTime" menuPage="safetyManage" />
      </template>
      <NumberStatistics :data="safetyHiddenData" skin="row-cell" @click="handleHiddenNumber" />
      <div class="elevator-analysis">
        <div class="hidden-flex" v-if="pieData.alarmTotal > 0">
          <div class="chart1">
            <elevator-analysis-pie
              @clickbar="openHiddenModalAll"
              style="width: 155px"
              :pieData="pieData.arr"
              :radius="'75'"
              pieClass="hidden-pie"
            >
              <div style="cursor: pointer" @click="openHiddenModalAll">
                <div class="alarm-total">{{ pieData.alarmTotal }}</div>
                <div class="alarm-total-text">隐患总数</div>
              </div>
            </elevator-analysis-pie>
          </div>
          <elevatorAnalysisList @handlecurrent="handleCurrentClick" :contentList="pieData.arr" style="margin-left: 10px" />
        </div>
        <noData v-else />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="安全教育统计" image="jy-c.png">
      <template #extra>
        <DateInlineForm v-model:modelValue="eduTime" @search="changeSafetyEducationTime" menuPage="safetyManage" />
      </template>
      <div class="safety-edu">
        <NumberStatistics @click="handleEduNumber" :data="safetyEduData" />
        <div class="safety-edu-tab">
          <a-tabs v-model:activeKey="safetyEduKey" @change="changeSafetyEducationTime">
            <a-tab-pane v-for="item in tabList" :key="item.key" :tab="item.label"></a-tab-pane>
          </a-tabs>
        </div>
        <div class="more" @click="handleMore">查看更多></div>
        <div class="safety-edu-list" v-if="safetyEduList.length > 0">
          <EventAlarmItem
            v-for="(item, index) in safetyEduList"
            :sort="item.rank"
            :ratio="item.ratio"
            :linkRatio="item.ratio"
            :count="item.count"
            :name="item.name"
            :sn="true"
            :width="item.width"
            @click="handleEduClick(item)"
          />
        </div>
        <noData v-else />
      </div>
    </SubPanelTemplate>
  </div>
  <modal-table v-if="showHiddenModal" :show="showHiddenModal" title="隐患排查" @close="showHiddenModal = false" width="1200px">
    <modal-record v-if="showHiddenModal" :marketid="''" :periodtime="hiddenPeriodTime" :type="type" :status="status"></modal-record>
  </modal-table>
  <modal-alarm-table :show-modal="alarmModalShow" @close="alarmModalShow = false" :parameter="alarmParameter2" />
  <AlarmStatisticsModal
    @close="showSafetyEduMore = false"
    :modalTitle="moreTitle"
    :showModal="showSafetyEduMore"
    :parameter="moreParameter"
    :getDataFunc="getSafetyEduRankApi"
  ></AlarmStatisticsModal>
  <nightPatrol
    :marketName="marketName"
    :marketid="marketid"
    :status="statusName"
    :resultCode="resultCode"
    v-if="showNightPatrol"
    :time="safetyWorkTime.dateRange.join(',')"
    :title="`巡更任务完成记录`"
    :show-modal="showNightPatrol"
    @close="showNightPatrol = false"
  ></nightPatrol>
  <inspectModel
    :marketName="marketName"
    v-if="showInspectModel"
    :time="safetyWorkTime.dateRange.join(',')"
    :title="'巡检任务完成记录'"
    :state="recordstate"
    :abnormal="abnormal"
    :show-modal="showInspectModel"
    @close="showInspectModel = false"
  ></inspectModel>
  <safetyEducationModel
    :marketName="marketName"
    v-if="showSafetyModel"
    :time="eduTime.dateRange.join(',')"
    :title="'培训记录'"
    :abnormal="abnormal"
    :show-modal="showSafetyModel"
    @close="showSafetyModel = false"
  ></safetyEducationModel>
  <examinationEducationModel
    :marketName="marketName"
    v-if="showExaminationModel"
    :time="eduTime.dateRange.join(',')"
    :title="'考试记录'"
    :abnormal="abnormal"
    :show-modal="showExaminationModel"
    @close="showExaminationModel = false"
  ></examinationEducationModel>
  <modal-table
    v-if="looseWorksShow"
    :show="looseWorksShow && !looseWorksDetailVisible"
    title="小散工程记录"
    @close="closeLooseWorksModal"
    width="1200px"
  >
    <project-record :parameter="looseWorksParameter" @detail-visible="looseWorksDetailVisible = $event"></project-record>
  </modal-table>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { ref, reactive, onMounted, computed } from "vue";

import elevatorAnalysisPie from "../../businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "../../businessPanel/public/elevator-analysis-list.vue";
import { ModelValueItf } from "../../businessPanel/public/types";
import { TopParams } from "../common/alarmlist-event";
import DateInlineForm from "../common/dateInlineForm.vue";
import NumberStatistics from "../common/number-statistics.vue";
import EventAlarmItem from "../common/snEventItem.vue";
import SubPanelTemplate from "../common/snPanelTemplate.vue";
import examinationEducationModel from "./components/examination-education-model.vue";
import inspectModel from "./components/inspect-model.vue";
import nightPatrol from "./components/night-patrol.vue";
import safetyEducationModel from "./components/safety-education-model.vue";
import { safetyWork, safetyHiddenDanger } from "@/api/shennong/compre";
import { safetyEducationCultivate, safetyEducationExam, safetyEducationTaskCount } from "@/api/shennong/safety";
import noData from "@/components/businessPanel/public/noData.vue";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import modalTable from "@/components/modal-table/modal.vue";
import AlarmStatisticsModal from "@/components/shengnong-custom-panel/security-monitoring/components/alarm-statistics-modal.vue";
import projectRecord from "@/components/shengnong-custom-panel/small-project/components/project-record.vue";
import ModalRecord from "@/components/shengnongPanel/common/yhtable.vue";
import bus from "@/utils/bus";
import { getallNumber, filterMarket } from "@/utils/common";

const safetyWorkTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const hiddenDangerTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [
    dayjs(new Date()).format("YYYY-MM-DD 00:00:00"),

    dayjs(new Date()).format("YYYY-MM-DD 23:59:59"),
  ],
});
const eduTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const safetyWorkData = reactive([
  {
    name: "报警处理数",
    value: 0,
    unit: "个",
    icon: "safety-1.png",
  },
  {
    name: "隐患处理数",
    value: 0,
    unit: "个",
    icon: "safety-2.png",
  },
  {
    name: "巡检任务完成数",
    value: 0,
    unit: "个",
    icon: "safety-3.png",
  },
  {
    name: "巡更任务完成数",
    value: 0,
    unit: "个",
    icon: "safety-4.png",
  },
  {
    name: "小散工程完成数",
    value: 0,
    unit: "个",
    icon: "safety-5.png",
  },
]);
const safetyHiddenData = reactive([
  {
    name: "隐患总数",
    value: 0,
    unit: "个",
    icon: "safety-h1.png",
    color: "blue" as const,
    code: "",
  },
  {
    name: "待确认隐患数",
    value: 0,
    unit: "个",
    icon: "",
    color: "green" as const,
    code: "WAITING_CONFIRM",
  },
  {
    name: "处理中隐患数",
    value: 0,
    unit: "个",
    icon: "",
    color: "yellow" as const,
    code: "CONFIRMED",
  },
]);
const safetyEduData = reactive([
  {
    name: "培训任务总数",
    value: 0,
    unit: "",
    icon: "safety-e1.png",
  },
  {
    name: "考试任务总数",
    value: 0,
    unit: "",
    icon: "safety-e2.png",
  },
]);
const changeSafetyWorkTime = async () => {
  let res = await safetyWork({
    marketTenant: "",
    period: safetyWorkTime.value.dateRange[0] + "," + safetyWorkTime.value.dateRange[1],
  });
  safetyWorkData[0].value = Number(res.alarmDisposeNum) || 0;
  safetyWorkData[1].value = Number(res.hiddenDangerDisposeNum) || 0;
  safetyWorkData[2].value = Number(res.inspectCompleteNum) || 0;
  safetyWorkData[3].value = Number(res.patrolCompleteNum) || 0;
  safetyWorkData[4].value = Number(res.projectCompleteNum) || 0;
};

const handleHiddenNumber = (item) => {
  openHiddenModal({
    label: item.name,
    name: "",
  });
};
const handleEduNumber = (item) => {
  marketName.value = null;
  if (item.name === "培训任务总数") {
    showSafetyModel.value = true;
  } else {
    showExaminationModel.value = true;
  }
};
const handleEduClick = (item) => {
  marketName.value = item.marketTenant;
  if (safetyEduKey.value === "0") {
    showSafetyModel.value = true;
  } else {
    showExaminationModel.value = true;
  }
};
const changeSafetyHiddenTime = async () => {
  let res = await safetyHiddenDanger({
    marketTenant: "",
    period: hiddenDangerTime.value.dateRange[0] + "," + hiddenDangerTime.value.dateRange[1],
  });
  safetyHiddenData[0].value = res.totalNum || 0;
  safetyHiddenData[1].value = res.toBeConfirmedNum || 0;
  safetyHiddenData[2].value = res.inHandNum || 0;
  pieData.alarmTotal = res.totalNum || 0;
  pieData.arr = res?.classifyNums
    ?.sort((a, b) => Number(b.num) - Number(a.num))
    .slice(0, 4)
    ?.map((item, index) => {
      return {
        name: item.classify,
        value: item.num,
        color: colors[index],
      };
    });
  const total = pieData.arr?.reduce((a, b) => a + Number(b.num), 0) || 0;
  if (100 - total > 0 && pieData.arr.length > 0) {
    pieData.arr.push({
      name: "其他",
      value: `${100 - total}`,
      ratio: 0,
      color: colors[0],
    });
  }
};
const safetyEduList = ref([]);
const safetyEduKey = ref("0");
const changeSafetyEducationTime = async () => {
  try {
    let params = {
      period: eduTime.value.dateRange[0] + "," + eduTime.value.dateRange[1],
      marketTenant: "",
      pageSize: 50,
      pageNumber: 1,
    };
    const taskCountRes = await safetyEducationTaskCount(params);
    safetyEduData[0].value = taskCountRes.cultivateTaskNum || 0;
    safetyEduData[1].value = taskCountRes.examTaskNum || 0;
    let { records, total, pages } = safetyEduKey.value === "0" ? await safetyEducationCultivate(params) : await safetyEducationExam(params);
    const newRecords = filterMarket(records);
    const totalCount = getallNumber(newRecords, "totalNum");
    safetyEduList.value = newRecords
      ?.sort((a, b) => b.totalNum - a.totalNum)
      .map((item, index) => {
        return {
          ...item,
          rank: index + 1,
          name: item.marketName,
          count: item.totalNum,
          ratio: item.chainRatio,
          width: (item.totalNum / totalCount) * 100,
        };
      })
      .slice(0, 3);
  } catch (error) {}
};
const showHiddenModal = ref(false);
const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
const pieData = reactive({
  arr: [],
  alarmTotal: 0,
});
const barData = reactive({
  xData: [],
  yData: [
    {
      data: [10, 20, 30, 40, 34],
      name: "",
      color: ["rgba(97, 148, 247, 1)", "rgba(97, 148, 247, 0)"],
    },
  ],
});

const hiddenType = {
  隐患总数: "",
  待确认隐患数: "WAITING_CONFIRM",
  处理中隐患数: "CONFIRMED",
};
const type = ref("");
const status = ref("");
const hiddenPeriodTime = ref();
const openHiddenModal = (data) => {
  status.value = hiddenType[data.label];
  type.value = "";
  hiddenPeriodTime.value = hiddenDangerTime.value.dateRange;
  showHiddenModal.value = true;
};
const openHiddenModalAll = () => {
  status.value = "";
  type.value = "";
  hiddenPeriodTime.value = hiddenDangerTime.value.dateRange;
  showHiddenModal.value = true;
};
const handleCurrentClick = (data) => {
  status.value = "";
  type.value = data.name === "其他" ? "" : data.name;
  hiddenPeriodTime.value = hiddenDangerTime.value.dateRange;
  showHiddenModal.value = true;
};
const tabList = [
  {
    label: "培训数",
    key: "0",
  },
  {
    label: "考试数",
    key: "1",
  },
];
const moreTitle = computed(() => {
  const title = tabList.find((item) => item.key === safetyEduKey.value)?.label;
  return `安全教育统计-${title}`;
});
const showSafetyEduMore = ref(false);
const moreParameter = ref<Record<string, any>>({
  applicationCode: "",
  alarmStatus: "",
  alarmTypeCode: "",
});
const getSafetyEduRankApi = async (param?: Record<string, any>): Promise<any> => {
  if (safetyEduKey.value === "0") {
    let params = {
      period: eduTime.value.dateRange.join(","),
      type: eduTime.value.timeType,
      pageSize: param.pageSize,
      pageNumber: param.pageNumber,
      marketTenant: "",
    };
    return await safetyEducationCultivate(params);
  } else {
    let params = {
      taskStatus: "",
      period: eduTime.value.dateRange.join(","),
      type: eduTime.value.timeType,
      pageSize: param.pageSize,
      pageNumber: param.pageNumber,
    };
    return await safetyEducationExam(params);
  }
};
const handleMore = () => {
  moreParameter.value = {
    type: eduTime.value.timeType,
    dateRange: eduTime.value.dateRange,
  };
  showSafetyEduMore.value = true;
};

const alarmModalShow = ref<boolean>(false);
const alarmParameter2 = ref<Record<string, any>>({
  applicationCode: "",
  alarmStatus: "",
  alarmTypeCode: "",
});
const showNightPatrol = ref(false);
const marketName = ref("");
const marketid = ref("");
const statusName = ref("");
const resultCode = ref("");
const showInspectModel = ref(false);
const showSafetyModel = ref(false);
const showExaminationModel = ref(false);
const recordstate = ref("");
const abnormal = ref(false);

const looseWorksShow = ref<boolean>(false);
const looseWorksDetailVisible = ref(false);
const closeLooseWorksModal = () => {
  looseWorksShow.value = false;
  looseWorksDetailVisible.value = false;
};
const looseWorksParameter = ref<Record<string, any>>({
  applicationCode: "",
  period: [],
  marketTenant: "",
  status: "COMPLETED",
});
const handleWorkNumber = (item) => {
  marketName.value = "";
  if (item.name === "报警处理数") {
    alarmParameter2.value = {
      applicationCode: "",
      alarmTypeCode: "",
      dateRange: safetyWorkTime.value.dateRange,
      alarmStatus: "ALARM_HANDLER",
    };
    alarmModalShow.value = true;
  } else if (item.name === "隐患处理数") {
    status.value = "FINISHED";
    type.value = "";
    hiddenPeriodTime.value = hiddenDangerTime.value.dateRange;
    showHiddenModal.value = true;
  } else if (item.name === "巡更任务完成数") {
    statusName.value = "已结束";
    resultCode.value = "";
    showNightPatrol.value = true;
  } else if (item.name === "巡检任务完成数") {
    recordstate.value = "OVER";
    showInspectModel.value = true;
  } else if (item.name === "小散工程完成数") {
    looseWorksParameter.value = {
      applicationCode: "",
      marketTenant: "",
      period: safetyWorkTime.value.dateRange,
      status: "COMPLETED",
    };
    looseWorksShow.value = true;
    looseWorksDetailVisible.value = false;
  }
};

bus.on("topPanelClick", (item: TopParams): void => {
  if (item?.key === "projectNum") {
    looseWorksParameter.value = {
      applicationCode: "",
      marketTenant: "",
      period: item?.period?.split(","),
      status: "UNDERWAY",
    };
    looseWorksShow.value = true;
    looseWorksDetailVisible.value = false;
  } else if (item?.key === "hiddenDangerNum") {
    status.value = "WAITING_CONFIRM";
    type.value = "";
    hiddenPeriodTime.value = item?.period?.split(",");
    showHiddenModal.value = true;
  }
});

onMounted(() => {
  changeSafetyWorkTime();
  changeSafetyHiddenTime();
  changeSafetyEducationTime();
});
</script>
<style lang="less" scoped>
:deep(.sub-panel-header) {
  border-right: none;
}

.secure {
  :deep(.chart) {
    height: 100% !important;
  }

  .secure-list {
    // margin: 0 0 0 50px;
    // width: 116px;

    .secure-box {
      margin-bottom: 9px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      .secure-title {
        color: #a5b6da;
        font-size: 12px;
      }

      .secure-value {
        font-size: 12px;
        color: #baccde;
      }
    }
  }
}

.hidden-danger {
  .hidden-danger-box {
    width: 112px;
    height: 56px;
    padding: 8px 12px;

    .hidden-danger-name {
      font-size: 12px;
      color: #93aadb;
    }

    .hidden-danger-value {
      font-family: "PangMenZhengDao";
      font-size: 20px;
      color: #ffffff;
    }
  }
}

.elevator-analysis {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chart1 {
  flex: 1;
  width: 152px;
  height: 152px;
}
.chart {
  flex: 1;
  height: 260px;
}
.yh {
  // height: 320px;
}
.safety-work {
  margin-left: 10px;
}

.safety-edu-tab {
  height: 30px;
  text-align: right;
  position: relative;
  margin-top: 10px;

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
    height: 26px;
  }
}
.alarm-total {
  color: #fff;
  text-align: center;
  font-size: 32px;
  font-family: D-DIN, D-DIN-Regular;
  font-weight: bold;
  line-height: 32px;
  cursor: pointer;
}
.alarm-total-text {
  color: #fff;
  text-align: center;
  font-size: 15px;
}
.more {
  color: #93aadb;
  font-size: 14px;
  text-align: right;
  padding: 0 4px;
  cursor: pointer;
}
.hidden-flex {
  display: flex;
  width: 100%;
  align-items: center;
}
:deep(.alarm-analysis) {
  height: auto;
}
:deep(.eventAlarmItem) {
  margin-bottom: 14px;
}
:deep(.container.grid) {
  gap: 8px;
}
:deep(.alarm-analysis .alarm-analysisBox) {
  margin-bottom: 5px;
}
:deep(.container .box) {
  padding: 5px 10px;
}
</style>
