<template>
  <SubPanelTemplate title="安全教育统计" class="alarm-event">
    <template #extra>
      <DateInlineForm v-model:modelValue="eduTime" @search="educateStat"></DateInlineForm>
    </template>
    <DeviceStatistics @handelClickItemize="handelClickItemize" imgPath="88-icon.png" :statistic="eduStatisticsData"> </DeviceStatistics>
    <div class="elevator-analysis">
      <div class="chart">
        <elevator-analysis-pie @clickbar="openSecure" :pieData="detectionData">
          <div style="color: #fff; text-align: center; font-size: 14px">{{ getallNumber(detectionData, "value") }}</div>
          <div style="color: #fff; text-align: center; font-size: 12px">教育任务数</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList @handlecurrent="openSecure" :contentList="detectionData" class="pie_list"></elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
  <safety-education-table
    :show-modal="secureModalShow"
    @close="secureModalShow = false"
    :parameter="secureParameter"
  ></safety-education-table>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import elevatorAnalysisPie from "../../public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "../../public/elevator-analysis-list.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { ModelValueItf } from "../../public/types";
import DeviceStatistics from "../../security-overview/components/device-statistics.vue";
import safetyEducationTable from "../components/safety-education-table.vue";
import { getSafetyEdu, getSafetyEduTheme } from "@/api/safety-education";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { getallNumber } from "@/utils/common";

//安全教育统计==================================================================================================
const eduTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [],
});

const secureParameter = reactive({
  period: "",
  themeId: "",
});

const secureModalShow = ref<boolean>(false);

const eduStatisticsData = reactive({
  title: "教育任务总数",
  total: 48,
  qoq: 6,
});
const detectionData = ref([]);

const getEduCount = async () => {
  const params = {
    period: eduTime.value.dateRange.join(","),
    type: eduTime.value.timeType,
  };
  const data = await getSafetyEdu(params);
  eduStatisticsData.qoq = data.chainRatio;
  eduStatisticsData.total = data.totalNum;
};

const getEduStat = async () => {
  const params = {
    period: eduTime.value.dateRange.join(","),
    type: eduTime.value.timeType,
  };
  const data = await getSafetyEduTheme(params);
  detectionData.value = data.map((item) => {
    return {
      id: item.id,
      name: item.name,
      value: item.totalNum,
    };
  });
};

const educateStat = () => {
  getEduCount();
  getEduStat();
};

const handelClickItemize = () => {
  secureParameter.period = eduTime.value.dateRange.join(",");
  secureModalShow.value = true;
};

const openSecure = (data) => {
  secureParameter.themeId = detectionData.value.find((e) => e.name === data.name).id;
  secureParameter.period = eduTime.value.dateRange.join(",");
  secureModalShow.value = true;
};
</script>

<style lang="less" scoped>
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px;
  align-items: center;

  .pie_list {
    width: 150px;
    margin-left: 10px;
  }
}

.chart {
  flex: 1;
  height: 180px;
}
</style>
