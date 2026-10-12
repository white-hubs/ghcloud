<!-- 给排水 -->
<template>
  <div >
    <SubPanelTemplate title="设备类型分布">
      <div class="equipmentAlarm">
        <RoundPie :data="roundPieData" :eventNum="eventNum">
          <div class="content">
            <span>{{ eventNum }}</span> <br />设备总数
          </div>
        </RoundPie>
        <pieList :roundPieData="roundPieData"></pieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备离线率" class="alarm-event">
      <div class="equipmentInfo">
        <waterPolo
          title=""
          :value="faultRate"
          unit="%"
          bgColor="#FFC700"
          color="#FFC700"
        ></waterPolo>
        <deviceModule :data-list="dataList"></deviceModule>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警Top5" class="alarm-event">
      <template #extra>
        <DateInlineForm
        v-model:modelValue="handleTime"
        @search="areaAlarmStatistic"
        ></DateInlineForm>
      </template>
      <div class="body" style="min-height: 250px" v-show="areaAlarmRank.length > 0">
        <EventAlarmItem
          v-for="(item, index) in areaAlarmRank"
          :sort="index+1"
          :name="item.name"
          :linkRatio="item.chainRatio"
          :count="item.alarmNum"
          :ratio="item.ratio + '%'"
        />
      </div>
      <div class="body" style="min-height: 250px" v-show="areaAlarmRank.length <= 0">
        <noData></noData>
      </div>
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import RoundPie from "../public/charts/roundPie/roundPie.vue";
import EventAlarmItem from "../public/eventAlarmItem.vue";
import pieList from "../public/pieList.vue";
import noData from "../public/noData.vue";
import changeBar from "../public/changeBar.vue";
import LineChart from "..//public/lineChart.vue";
import waterPolo from "../public/charts/waterPolo/waterPolo.vue";
import deviceModule from "../public/deviceModule.vue";
import { onMounted, reactive, ref, watch } from "vue";
import useCommon from "../../hooks/useCommon";
import { statisticsDeviceTop } from "@/api/alarm";
import { AlarmRateList, ModelValueItf } from "../public/types";
import { AlarmAreaTop } from "@/api/models/alarm";
import { useStateStore } from "@/pages/state/use-state-store";
interface RoundPie {
  label: string;
  value: number;
  color: string;
}
const dataList = reactive<AlarmRateList[]>([
  {
    title: "设备总数",
    value: 0,
    ringRatio: false,
  },
  {
    title: "离线总数",
    value: 0,
    ringRatio: true,
    label: "",
    unit: "%",
  },
]);
const faultRate = ref<number>(0);
const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
const { globalState } = useStateStore();
const eventNum = ref<number>(0);
const handleTime = ref<ModelValueItf>();
const roundPieData = ref<RoundPie[]>([]);
const areaAlarmRank = ref<AlarmAreaTop[]>([]);
const { getEquipmentNumber } = useCommon();
const timer = ref<any>(null);
onMounted(() => {
  init();
  timer.value = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
});
const init = () => {
  equipmentStatistic();
  areaAlarmStatistic();
};
/**
 * 设备类型分布
 */
const equipmentStatistic = async () => {
  const res = await getEquipmentNumber();
  if (JSON.stringify(res) === "{}") {
    return;
  }
  res.deviceStatusNums.forEach((item) => {
    if (item.name === "OFFLINE" && res.deviceNum !== 0) {
      faultRate.value = Math.round((item.num / res.deviceNum) * 10000) / 100.0;
      dataList[0].value = res.deviceNum;
      dataList[1].value = item.num;
      dataList[1].label = faultRate.value;
    }
  });
  eventNum.value = res.deviceNum;
  roundPieData.value.length = 0;
  res.deviceGenreNums.forEach((item, index) => {
    let obj = {
      label: `${item.genreName}(${
        Math.round((item.num / res.deviceNum) * 10000) / 100.0
      }%)`,
      color: colors[index],
      value: item.num,
    };
    roundPieData.value.push(obj);
  });
};
/**
 * 区域报警Top5
 */
const areaAlarmStatistic = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: handleTime.value.dateRange.join(","),
    type: handleTime.value.timeType,
  };
  const res = await statisticsDeviceTop(params);
  areaAlarmRank.value = res;
};
watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer.value);
    init();
    timer.value = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
  }
);
</script>
<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;
  .content {
    font-size: 12px;
  }
}

.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;
}

.chart {
  height: 140px;
  display: flex;
}

.iconOutlined {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #cbe2ff;
}

.equipmentInfo {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px 0 20px;
}
:deep(.deviceList){
  flex-direction: column;
}
</style>
