<template>
  <SubPanelTemplate title="电气设备">
    <!-- <div class="header">
              <DateInlineForm />
          </div> -->
    <div class="body">
      <OperateDays title="设备数" :value="equipmentData.deviceNum" class="body-num"></OperateDays>
      <GridContainer :data="devicestatistic" @click-item="handelClickDeviceNum"></GridContainer>
      <div class="chart">
        <RingChart :pieData="pieData" seriesName="设备类型统计" :total="equipmentData.deviceNum"></RingChart>
        <!-- <Pie3D :dataValue="pieData" :internalDiameterRatio="0" :autoRotate="true"></Pie3D> -->
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
              <span>{{ item.ratio }}</span>
            </template>
          </a-statistic>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
  <modal-equipment-table :show-modal="deviceModalShow" @close="closeModal" :parameter="deviceParameter"></modal-equipment-table>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, reactive, onBeforeUnmount, watch } from "vue";

import useCommon from "../../../hooks/useCommon";
import RingChart from "../../public/charts/ring/ring.vue";
import GridContainer from "../../public/gridContainer.vue";
import OperateDays from "../../public/operateDays.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import modalEquipmentTable from "@/components/modal-table/modal-equipment-table.vue";
import { useStateStore } from "@/pages/state/use-state-store";

let timer: any = reactive(null);
const { globalState } = useStateStore();

let equipmentData = reactive({
  deviceNum: 0,
  devices: [],
  deviceGenreNums: {},
});
let deviceStatusType = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};
let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
const devicestatistic = ref([]);
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
const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];

const pieData = ref([]);
const statisticValueStyle = computed(() => (index) => {
  return {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: colors[index % colors.length],
  };
});
const statisticStyle = computed(() => {
  return {
    fontSize: "16px",
    color: "#FFFFFF",
    paddingLeft: "16px",
  };
});
const { getEquipmentNumber } = useCommon();

// 动环设备
const getEquipmentInfo = async () => {
  pieData.value.length = 0;
  devicestatistic.value.length = 0;
  let res: any = await getEquipmentNumber();
  if (!res.deviceNum) {
    return;
  }
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
  getEquipmentInfo();
  timer = setInterval(
    () => {
      init();
    },
    (window as any).config.pageLoopRequestTime,
  );
});
onBeforeUnmount(() => {
  clearInterval(timer);
});

/** 电气设备弹窗 */
const deviceModalShow = ref<boolean>(false);
const deviceParameter = ref({});
const handelClickDeviceNum = (item?: any) => {
  deviceModalShow.value = true;
  deviceParameter.value = {
    applicationCode: "ELECTRICMANAGE",
    status: item?.status,
  };
};
const closeModal = () => {
  deviceModalShow.value = false;
};
</script>

<style lang="less" scoped>
.header {
  margin-bottom: 10px;
}

.body {
  .chart {
    width: 100%;
    height: 140px;
  }

  &-num {
    margin-bottom: 10px;
  }
}

.statistic {
  display: grid;
  grid-column-gap: 10px;
  grid-template-columns: 1fr 1fr 1fr 1fr;

  .statistic-item {
    background: rgba(0, 0, 0, 0.5);
    padding: 8px;

    .title {
      font-size: 12px;
      color: #d0deee;

      .box {
        margin-right: 8px;
      }
    }
  }
}
</style>
