<template>
  <SubPanelTemplate title="消防设备">
    <div class="body">
      <OperateDays title="设备数" :value="equipmentData.deviceNum" class="body-num"></OperateDays>
      <GridContainer :data="devicestatistic"></GridContainer>
      <div class="chart">
        <RoseChart :pieData="pieData" title="" v-if="pieData.length"></RoseChart>
        <RoundPie :data="[]" :eventNum="0" v-else>
          <div class="content"><span>0</span> <br />消防设备</div>
        </RoundPie>
      </div>
      <div class="statistic-lenged">
        <div class="statistic-item" v-for="(item, index) in pieData">
          <a-statistic :value="item.value" :valueStyle="statisticStyle">
            <template #title>
              <div class="title flex-start">
                <div class="box" :style="statisticValueStyle(index)"></div>
                <span>{{ item.name }}</span>
              </div>
            </template>
            <template #suffix>
              <span>{{ item.chainRatio }}</span>
            </template>
          </a-statistic>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, reactive, watch, onBeforeUnmount } from "vue";

import useCommon from "../../../hooks/useCommon";
import RoseChart from "../../public/charts/roseChart/roseChart.vue";
import RoundPie from "../../public/charts/roundPie/roundPie.vue";
import GridContainer from "../../public/gridContainer.vue";
import OperateDays from "../../public/operateDays.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();

let timer: any = reactive(null);
const pieData = ref([]);
const devicestatistic = ref([]);
const statisticValueStyle = computed(() => (index) => {
  return {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: pieData.value[index]?.itemStyle?.color,
  };
});
const statisticStyle = computed(() => {
  return {
    fontSize: "16px",
    color: "#FFFFFF",
    paddingLeft: "16px",
  };
});
let deviceStatusType = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};
let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];

watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(
      () => {
        init();
      },
      (window as any).config.pageLoopRequestTime,
    );
    init();
  },
);
const { getEquipmentNumber } = useCommon();
let equipmentData = reactive({
  deviceNum: 0,
  devices: [],
  deviceGenreNums: {},
});

// 动环设备
const getEquipmentInfo = async () => {
  pieData.value.length = 0;
  devicestatistic.value.length = 0;
  let res: any = await getEquipmentNumber();
  // let res: any = mockEquipmentNumber()
  equipmentData.deviceNum = res.deviceNum;
  equipmentData.devices = res.devices;
  equipmentData.deviceGenreNums = res.deviceGenreNums;
  res.deviceStatusNums.forEach((item, index) => {
    devicestatistic.value.push({
      alarmStatusName: deviceStatusType[item.name],
      alarmNum: item.num,
      color: colorList[index],
    });
  });
  res.deviceGenreNums.forEach((item, index) => {
    pieData.value.push({
      name: item.genreName,
      value: item.num,
      color: colorList[index],
    });
  });
};
function init() {
  getEquipmentInfo();
}
onMounted(() => {
  init();
});
onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>

<style lang="less" scoped>
.body-num {
  margin: 10px 0;
}

.chart {
  height: 160px;
}
.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
}
</style>
