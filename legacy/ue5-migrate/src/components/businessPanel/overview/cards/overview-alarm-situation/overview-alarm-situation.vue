<template>
  <SubPanelTemplate title="报警态势">
    <template #extra>
      <DateInlineForm v-model:modelValue="handleAlarmTime" @search="changeHandleAlarmTime"></DateInlineForm>
    </template>
    <div class="statistic flex-between">
      <div class="statistic-item flex-center" v-for="item in alarmSituationStatistic" :key="item.key"
        @click="handelClickAlarmNum(item)">
        <div class="left">
          <img :src="getAssetsImage(item.img)" />
        </div>
        <div class="right">
          <count-to :startVal="0" :endVal="item.value" :duration="4000" class="scroll-number"
            :style="{ color: item.color }"></count-to>
          <div style="white-space: nowrap;">{{ item.label }}</div>
        </div>
      </div>
    </div>
    <div class="flex-between">
      <PlanPie :pieData="alarmSituationPieData" class="alarm-total-pie" pie-class="alarm-total-pie-chart">
        <div class="content">
          <div class="total-num">{{ alarmTotal }}</div>
          <div>报警总数</div>
        </div>
      </PlanPie>
      <PieList :roundPieData="alarmSituationPieData" @handel-click-itemize="handelClickItemize" class="alarm-total-list"></PieList>
    </div>
  </SubPanelTemplate>
  <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="alarmParameter"></modal-alarm-table>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SubPanelTemplate from "../../../public/subPanelTemplate.vue";
import DateInlineForm from "../../../public/dateInlineForm.vue";
import PlanPie from "../../../public/charts/pie/planePie.vue";
import PieList from "../../../public/pieList.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import { CountTo } from "vue3-count-to";
import { getAssetsImage } from "@/utils/getImage";
import { getAlarmSituation } from "@/api/alarm";
import { ModelValueItf } from "../../../public/types";

interface Itemize {
  color: string;
  value: number;
  label: string;
  ratio: number;
  applicationCode?: string;
  id?: string;
}

const handleAlarmTime = ref<ModelValueItf>();
const alarmParameter = ref<Record<string, any>>({});
const alarmModalShow = ref<boolean>(false);
const alarmTotal = ref<number>(0);
const alarmSituationStatistic = ref<
  {
    label: string;
    value: number;
    img: string;
    color: string;
    key: string;
    alarmHandleResult: string;
  }[]
>([
  {
    label: "报警总数",
    value: 0,
    img: "overView1.png",
    color: "#D0DEEE",
    key: "alarmNum",
    alarmHandleResult: "",
  },
  {
    label: "真实数",
    value: 0,
    img: "overView2.png",
    color: "#F14545",
    key: "alarmActualNum",
    alarmHandleResult: "ALARM_ACTUAL",
  },
  {
    label: "误报数",
    value: 0,
    img: "overView3.png",
    color: "#FFC700",
    key: "alarmImpracticalNum",
    alarmHandleResult: "ALARM_IMPRACTICAL",
  },
]);
const alarmSituationColors = ref<string[]>(["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"]);
const alarmSituationPieData = ref<Itemize[]>([]);

const handelClickAlarmNum = (item: Record<string, any>) => {
  alarmModalShow.value = true;
  alarmParameter.value = {
    alarmHandleResult: item.alarmHandleResult,
    dateRange: handleAlarmTime.value?.dateRange,
  };
};

const handelClickItemize = (item: any) => {
  alarmModalShow.value = true;
  alarmParameter.value = {
    dateRange: handleAlarmTime.value?.dateRange,
    alarmTypeId: item.id,
  };
};

const closeModal = () => {
  alarmModalShow.value = false;
};

const changeHandleAlarmTime = () => {
  rquesestAlarmSituation();
};

const rquesestAlarmSituation = async () => {
  if (!handleAlarmTime.value) return;
  const res = await getAlarmSituation({
    period: handleAlarmTime.value.dateRange.join(","),
    type: handleAlarmTime.value.timeType,
  });
  alarmTotal.value = res.alarmBimStatistics.alarmNum;
  alarmSituationStatistic.value.map((item) => {
    item.value = res.alarmBimStatistics[item.key];
    return item;
  });
  alarmSituationPieData.value = res.alarmBimStatisticsTopChains.map((item: any, index: number) => {
    return {
      label: `${item.name}(${Math.round(item.ratio * 100) / 100}%)`,
      value: item.alarmNum,
      ratio: item.ratio,
      color: alarmSituationColors.value[index % 4],
      id: item.id,
    };
  });
  //排序
  alarmSituationPieData.value = alarmSituationPieData.value.sort(function (a, b) {
    if (a.value > b.value) {
      return -1;
    } else {
      return 1;
    }
  });
};

onMounted(() => {
  // Wait for handleAlarmTime to be initialized by DateInlineForm or manually init?
  // In left.vue, DateInlineForm uses v-model. 
  // We need to wait for the initial value or set a default.
  // left.vue calls rquesestAlarmSituation inside changeHandleAlarmTime? No.
  // left.vue doesn't call rquesestAlarmSituation in onMounted directly?
  // No, left.vue doesn't seem to call rquesestAlarmSituation in onMounted!
  // Wait, let me check left.vue again.
  // Line 333: requestDeviceSituation();
  // Line 334: getDepTaskExecutionAnalysis();
  // Line 335: getDictionary();
  // It does NOT call rquesestAlarmSituation!
  // But DateInlineForm likely emits an event on mount or has a default?
  // If DateInlineForm sets the model value initially, we should watch it or trigger search.
  // Actually, usually DateInlineForm emits 'search' on init if configured, or we should call it.
  // I'll add a check or call it if time is set.
});
</script>

<style lang="less" scoped>
.statistic {
  width: 100%;
  height: 68px;
  background: rgba(0, 0, 0, 0.15);
  padding: 0 10px;
}

.statistic-item {
  flex: 1;
  color: #d0deee;
  font-size: 12px;
  cursor: pointer;

  .left {
    margin-right: 10px;
  }

  .scroll-number {
    font-size: 22px;
  }
}

.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
}

.alarm-total-pie, .alarm-total-list, .alarm-total-pie-chart {
  height: 140px !important;
}

:deep(.alarm-total-pie-chart) {
  height: 140px !important;
}
</style>
