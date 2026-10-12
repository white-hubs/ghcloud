<template>
  <SubPanelTemplate title="设备分布统计">
    <div class="body">
      <OperateDays title="设备总数" :value="equipmentData.deviceNum" class="body-num"></OperateDays>
      <GridContainer :data="devicestatistic"></GridContainer>
      <div class="chart">
        <RingChart :pieData="pieData" seriesName="设备类型统计" :total="equipmentData.deviceNum"></RingChart>
      </div>
      <div class="roll-table">
        <RollTable :column="column" :data="data" @click-row="handelClickRow">
          <template #deviceStatus="{ record }">
            <span :class="record.deviceStatus">{{ deviceStatusType[record.deviceStatus] }}</span>
          </template>
        </RollTable>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import useCommon from "../../../hooks/useCommon";
import RingChart from "../../public/charts/ring/ring.vue";
import GridContainer from "../../public/gridContainer.vue";
import OperateDays from "../../public/operateDays.vue";
import RollTable from "../../public/rollTable/index.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { useStateStore } from "@/pages/state/use-state-store";
import bus from "@/utils/bus";

let deviceStatusType = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};
let timer: any = reactive(null);
const devicestatistic = ref([]);
let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
const pieData = ref([]);
const column = [
  {
    title: "设备名称",
    dataIndex: "deviceName",
  },
  {
    title: "设备类型",
    dataIndex: "genreName",
  },
  {
    title: "区域",
    dataIndex: "areaName",
  },
  {
    title: "状态",
    dataIndex: "deviceStatus",
    slots: {
      customRender: "deviceStatus",
    },
  },
];
const data = ref([]);

let equipmentData = reactive({
  deviceNum: 0,
  devices: [],
  deviceGenreNums: {},
});
const { getEquipmentNumber } = useCommon();
const { globalState } = useStateStore();

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
  res.deviceStatusNums.forEach((item) => {
    if (item.name === "NORMAL") {
      devicestatistic.value.push({
        alarmStatusName: "在线设备数",
        alarmNum: item.num,
        color: "#00F27B",
      });
    } else if (item.name === "TROUBLE") {
      devicestatistic.value.push({
        alarmStatusName: "故障设备数",
        alarmNum: item.num,
        color: "#FFC700",
      });
    }
  });
  res.deviceGenreNums.forEach((item, index) => {
    pieData.value.push({
      name: item.genreName,
      value: item.num,
      color: colorList[index],
    });
  });
  data.value = res.devices;
};

const handelClickRow = (record) => {
  if (record.alarmTargetCode) {
    bus.emit("equipmentPosition", record);
  }
};

const init = () => {
  getEquipmentInfo();
};

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
</script>

<style lang="less" scoped>
.body-num {
  margin: 10px 0;
}

.chart {
  height: 160px;
}

.roll-table {
  height: 140px;
}

.rank {
  margin-top: 10px;
}

.ALARM {
  color: rgb(241, 69, 69);
}

.TROUBLE {
  color: rgb(255, 199, 0);
}

.OFFLINE {
  color: rgb(116, 174, 231);
}

.NORMAL {
  color: rgb(0, 242, 123);
}
</style>
