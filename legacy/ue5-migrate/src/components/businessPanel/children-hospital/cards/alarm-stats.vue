<template>
  <SubPanelTemplate title="报警态势">
    <template #extra>
      <DateInlineForm v-model:modelValue="receiveOverviewTime" @search="changeHandleReceiveOverviewTime"> </DateInlineForm>
    </template>
    <a-radio-group @change="changeHandleReceiveOverviewTime" class="body-num" v-model:value="alarmApplication" button-style="solid">
      <a-radio-button value="atrend">设备报警统计</a-radio-button>
      <a-radio-button value="statistics">报警等级统计</a-radio-button>
    </a-radio-group>
    <OperateDays title="报警数" :value="alarmCon.count" class="body-num">
      <div class="extra flex-start">
        <div class="mode">环比</div>
        <div :class="['downtriangle', alarmCon.ratio > 0 && 'uptriangle']"></div>
        <div :class="[alarmCon.ratio < 0 ? 'down' : 'up']">{{ alarmCon.ratio }}%</div>
      </div>
    </OperateDays>
    <div class="flex-between">
      <PlanPie :pieData="alarmCon.alarmStatusStatistics" class="alarm-total-pie" pie-class="alarm-total-pie-chart">
        <div class="content">
          <img :src="getAssetsImage('overView21.png')" alt="" />
        </div>
      </PlanPie>
      <PieList :roundPieData="alarmCon.alarmStatusStatistics" class="alarm-total-list"></PieList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import { statisticsLevel, statisticsStatus } from "@/api/alarm";
import { deviceAlarmNum } from "@/api/device";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import PieList from "@/components/businessPanel/public/pieList.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { useStateStore } from "@/pages/state/use-state-store";
import { getAssetsImage } from "@/utils/getImage";

const { globalState } = useStateStore();
const receiveOverviewTime = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: [],
});
const alarmApplication = ref("atrend");
const alarmCon = ref({
  count: 0,
  ratio: 10,
  alarmStatusStatistics: [] as any[],
});
let colorList = ["#2AE8BD", "#99C7FF", "#FFC700", "#F14545"];

const changeHandleReceiveOverviewTime = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: receiveOverviewTime.value.dateRange.join(","),
    type: receiveOverviewTime.value.timeType,
  };
  alarmCon.value.alarmStatusStatistics = [];
  let status = await statisticsStatus(params);
  alarmCon.value.count = status.alarmNum;
  alarmCon.value.ratio = status.chainRatio;
  if (alarmApplication.value === "atrend") {
    let num = await deviceAlarmNum(params);
    alarmCon.value.alarmStatusStatistics = num.result.map((item: any, index: number) => {
      return {
        color: colorList[index],
        value: item.alarmNum,
        label: item.genreName,
      };
    });
  } else {
    let res = await statisticsLevel(params);
    alarmCon.value.alarmStatusStatistics = res.map((item: any, index: number) => {
      return {
        color: colorList[index],
        value: item.alarmNum,
        label: item.name,
      };
    });
  }
};

onMounted(() => {
  changeHandleReceiveOverviewTime();
});
</script>

<style lang="less" scoped>
.alarm-total-pie,
.alarm-total-list,
.alarm-total-pie-chart {
  height: 140px !important;
}

.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  img {
    width: 24px;
    height: 24px;
  }
}

:deep(.alarm-total-pie-chart) {
  height: 140px !important;
}

:deep(.ant-radio-button-wrapper) {
  background: none;
  border: none;
  color: #fff;
}

:deep(.ant-radio-button-wrapper-checked) {
  background: linear-gradient(180deg, rgba(41, 137, 255, 0.4) 0%, rgba(41, 137, 255, 0.8) 100%) !important;
}

.body-num {
  margin-bottom: 10px;
}

.extra {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #fff;
  .mode {
    margin-right: 5px;
  }
}
.downtriangle {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #2ae8bd;
  margin: 0 5px;
}
.uptriangle {
  border-top: none;
  border-bottom: 6px solid #f14545;
}
.down {
  color: #2ae8bd;
}
.up {
  color: #f14545;
}
</style>
