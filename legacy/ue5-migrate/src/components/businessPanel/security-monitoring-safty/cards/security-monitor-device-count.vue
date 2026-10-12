<template>
  <div>
    <SubPanelTemplate :title="props.title" class="alarm-event" zoomable :zoom-title="`${props.title}详情`" :zoom-width="600">
      <DeviceStatistics
        @handelClickItemize="deviceClickItemize"
        imgPath="business-icon/triage-queue/6.png"
        :statistic="deviceStatisticsData"
        data-no-zoom
      ></DeviceStatistics>
      <div class="chart" data-no-zoom>
        <elevator-analysis-pie @clickbar="alarmOpen" style="width: 50%; height: 100%" :pieData="pieData" :radius="'75'" data-no-zoom>
          <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale) * 0.072rem)">
            {{ getallNumber(pieData, "value") }}
          </div>
          <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale) * 0.0625rem)">设备总数</div>
        </elevator-analysis-pie>
        <elevatorAnalysisList
          @handlecurrent="alarmOpen"
          :showRatio="false"
          :contentList="pieData"
          style="width: 50%"
          data-no-zoom
        ></elevatorAnalysisList>
      </div>
      <template #zoom-content>
        <div class="zoom-device-content">
          <DeviceStatistics
            @handelClickItemize="deviceClickItemizeZoom"
            imgPath="business-icon/triage-queue/6.png"
            :statistic="deviceStatisticsData"
            data-no-zoom
          ></DeviceStatistics>
          <div class="zoom-device-chart" data-no-zoom>
            <div class="zoom-chart">
              <elevator-analysis-pie
                @clickbar="alarmOpenZoom"
                class="zoom-elevator-analysis"
                :radius="'120'"
                :pieData="pieData"
                data-no-zoom
              >
                <div style="color: #fff; text-align: center; font-size: 18px">{{ getallNumber(pieData, "value") }}</div>
                <div style="color: #fff; text-align: center; font-size: 16px">设备总数</div>
              </elevator-analysis-pie>
            </div>
            <elevatorAnalysisList
              class="zoom-analysis-list"
              :showRatio="false"
              :contentList="pieData"
              style="margin-left: 20px; flex: 1"
              @handlecurrent="alarmOpenZoom"
              data-no-zoom
            >
            </elevatorAnalysisList>
          </div>
        </div>
      </template>
    </SubPanelTemplate>
    <modal-equipment-table
      :show-modal="deviceModalShow"
      @close="deviceModalShow = false"
      :parameter="deviceParameter"
    ></modal-equipment-table>
    <modal-equipment-all-table
      :show-modal="deviceAllModalShow"
      @close="deviceAllModalShow = false"
      :parameter="deviceAllParameter"
    ></modal-equipment-all-table>
  </div>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import DeviceStatistics from "../device-statistics.vue";
import { getDeviceBuyArea, getDeviceNumber } from "@/api/device";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import modalEquipmentTable from "@/components/modal-table/modal-equipment-table.vue";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import { useStateStore } from "@/pages/state/use-state-store";
import { getallNumber, setDeviceData } from "@/utils/common";

const props = withDefaults(
  defineProps<{
    title?: string;
  }>(),
  {
    title: "监控设备统计",
  },
);
const pieData = ref([]);
let timer: any = reactive(null);
const deviceModalShow = ref<boolean>(false);
const deviceAllModalShow = ref<boolean>(false);
const deviceParameter = reactive({
  areaId: "",
  tagCodes: [],
  deviceState: undefined,
  dateRange: [],
});
const deviceAllParameter = reactive({
  anyAreaId: "",
  areaId: undefined,
  tagCodes: [],
  filterAreaIds: [],
  deviceState: undefined,
  dateRange: [],
});

const { globalState } = useStateStore();
const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
const changeEventTimeCount = async () => {
  const res = await getDeviceNumber({ tagCodes: `custom.app::visual.${globalState.business.currentMenu}` });
  deviceStatisticsData.total = res.totalNumber;
  deviceStatisticsData.itemize[0].offline = res.offlineNumber;
  deviceStatisticsData.itemize[0].value = res.normalNumber;
  let data = await getDeviceBuyArea({
    tagCodes: [`custom.app::visual.${globalState.business.currentMenu}`],
    areaLevel: globalState.business.currentAreaLeave,
  });
  pieData.value = setDeviceData(data, colors);
};
const deviceClickItemize = (value) => {
  if (value === "在线设备数") {
    deviceAllParameter.deviceState = true;
  } else if (value === "离线设备数") {
    deviceAllParameter.deviceState = false;
  } else {
    deviceAllParameter.deviceState = undefined;
  }
  deviceAllParameter.tagCodes = [`custom.app::visual.${globalState.business.currentMenu}`];
  deviceAllParameter.anyAreaId = undefined;
  deviceAllModalShow.value = true;
};

const alarmOpen = (value) => {
  if (value.name === "其他") {
    deviceAllParameter.anyAreaId = undefined;
    deviceAllParameter.filterAreaIds = pieData.value.map((e) => e.areaId).filter((e) => e);
  } else {
    deviceAllParameter.anyAreaId = pieData.value.find((e) => e.name === value.name).areaId;
    deviceAllParameter.filterAreaIds = [];
    deviceAllParameter.deviceState = undefined;
  }
  deviceAllParameter.tagCodes = [`custom.app::visual.${globalState.business.currentMenu}`];
  deviceAllModalShow.value = true;
};

// 放大模式下的点击处理（复用原有逻辑）
const deviceClickItemizeZoom = (value: any) => {
  deviceClickItemize(value);
};

const alarmOpenZoom = (value: any) => {
  alarmOpen(value);
};
// 切换视频
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
const deviceStatisticsData = reactive({
  title: "监控设备总数",
  total: 48,
  itemize: [
    {
      name: "离线设备数",
      label: "在线设备数",
      value: 23,
      offline: 15,
      key: "OFFLINE",
    },
  ],
});

function init() {
  changeEventTimeCount();
}
onMounted(() => {
  init();
});
onBeforeUnmount(() => {
  timer && clearInterval(timer);
});
</script>
<style lang="less" scoped>
.panel {
  padding: 0 8px;
  display: flex;
  flex-direction: column;
}

.chart {
  height: 160px;
  display: flex;
  align-items: center;
}

.monitor {
  .body {
    margin-top: 0;
  }

  .title {
    color: #fff;
    font-size: calc(var(--font-size-scale) * 16px);
  }

  .group {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .camera {
      margin: 0 6px;
      width: 160px;
      height: 90px;
      margin-top: 10px;
    }
  }
}

.alarm-event {
  .footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}

.extra {
  font-family: Roboto-Regular, Roboto;
  font-weight: 400;
  margin-left: 8px;

  span {
    color: #e7f0ff;
    font-size: 12px;
  }

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin-right: 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
  }

  .radio {
    font-size: 12px;
  }

  .up {
    color: #f14545;
  }

  .down {
    color: #2ae8bd;
  }
}

.right-bar {
  width: 56px;
  height: 24px;
  background: rgba(41, 137, 255, 0.102);
  border-radius: 2px;
  border: 1px solid #2989ff;
  color: #fff;
  text-align: center;
  line-height: 24px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-around;

  img {
    width: 14px;
    height: 14px;
  }
}

.forbidden {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}

// 放大弹窗内的样式
.zoom-device-content {
  .zoom-device-chart {
    display: flex;
    align-items: center;
    margin-top: 20px;
    min-height: 300px;

    .zoom-chart {
      flex-shrink: 0;
    }

    .zoom-elevator-analysis {
      width: 220px;
      height: 320px;
    }

    .zoom-analysis-list {
      :deep(.alarm-analysis) {
        font-size: 16px;

        .alarm-analysisBox {
          margin-bottom: 15px;
        }

        .alarm-analysis-name {
          font-size: 16px;
        }

        .alarm-analysis-right {
          font-size: 16px;
        }
      }
    }
  }
}
</style>
