<template>
  <div>
    <SubPanelTemplate title="消防管网监测" zoomable zoom-title="消防管网监测详情">
      <DeviceStatistics imgPath="93-icon.png" :statistic="equipmentStatistics" data-no-zoom></DeviceStatistics>
      <div class="monitorCard" data-no-zoom>
        <div class="cardItem" @click="handlecurrentUps(item)" v-for="item in twoCardList[carousel]" :key="item.id">
          <img :src="getAssetsImage('92-icon.png')" alt="" />
          <div>
            <div class="label">{{ item.label }}</div>
            <div class="value">
              <span>{{ item.value }}</span
              ><span class="unit">{{ item.unit }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #zoom-content>
        <div class="zoom-monitor-panel">
          <DeviceStatistics imgPath="93-icon.png" :statistic="equipmentStatistics" data-no-zoom></DeviceStatistics>
          <div class="zoom-monitorCard" data-no-zoom>
            <div class="zoom-cardItem" @click="handlecurrentUps(item)" v-for="item in cardList" :key="item.id">
              <img :src="getAssetsImage('92-icon.png')" alt="" />
              <div>
                <div class="label">{{ item.label }}</div>
                <div class="value">
                  <span>{{ item.value }}</span
                  ><span class="unit">{{ item.unit }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </SubPanelTemplate>

    <div class="alarm-event">
      <SubPanelTemplate title="消防设备分布情况" zoomable zoom-title="消防设备分布情况详情" :zoom-width="600">
        <DeviceStatistics
          @handelClickItemize="handelClickItemize"
          imgPath="business-icon/triage-queue/12.png"
          :statistic="deviceStatusData"
          data-no-zoom
        >
        </DeviceStatistics>
        <div class="chart" data-no-zoom>
          <elevator-analysis-pie @clickbar="handleClickPie" style="width: 50%" :pieData="pieData" :radius="'75'">
            <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale) * 0.072rem)">
              {{ deviceStatusData.total }}
            </div>
            <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale) * 0.0625rem)">设备总数</div>
          </elevator-analysis-pie>
          <elevatorAnalysisList @handlecurrent="handleClickPie" :contentList="pieData" style="width: 50%"> </elevatorAnalysisList>
        </div>
        <template #zoom-content>
          <div class="zoom-device-content">
            <DeviceStatistics
              @handelClickItemize="handelClickItemize"
              imgPath="business-icon/triage-queue/12.png"
              :statistic="deviceStatusData"
              data-no-zoom
            >
            </DeviceStatistics>
            <div class="zoom-device-chart" data-no-zoom>
              <div class="zoom-chart">
                <elevator-analysis-pie @clickbar="handleClickPie" class="zoom-elevator-analysis" :radius="'120'" :pieData="pieData">
                  <div style="color: #fff; text-align: center; font-size: 18px">{{ deviceStatusData.total }}</div>
                  <div style="color: #fff; text-align: center; font-size: 16px">设备总数</div>
                </elevator-analysis-pie>
              </div>
              <elevatorAnalysisList
                class="zoom-analysis-list"
                :contentList="pieData"
                style="margin-left: 20px; flex: 1"
                @handlecurrent="handleClickPie"
              >
              </elevatorAnalysisList>
            </div>
          </div>
        </template>
      </SubPanelTemplate>
    </div>

    <div class="alarm-event">
      <SubPanelTemplate title="报警列表" zoomable zoom-title="报警列表详情">
        <template #extra>
          <DateInlineForm v-model:modelValue="alarmRecordTime" @search="changeAlarmRecordDate" data-no-zoom></DateInlineForm>
        </template>
        <div v-show="listData.length > 0" data-no-zoom>
          <DeviceStatistics
            @handelClickItemize="alarmClickItemize"
            imgPath="business-icon/triage-queue/10.png"
            :statistic="deviceStatisticsData"
          >
          </DeviceStatistics>
          <div class="footer">
            <RollTable :column="column" :data="listData" @click-row="handelClickRow">
              <template #alarmStatus="{ record }">
                <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
                <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
                <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
              </template>
            </RollTable>
          </div>
        </div>
        <div v-show="listData.length === 0" data-no-zoom>
          <noData></noData>
        </div>
        <template #zoom-content>
          <div class="zoom-alarm-list">
            <div v-show="listData.length > 0" data-no-zoom>
              <DeviceStatistics
                @handelClickItemize="alarmClickItemize"
                imgPath="business-icon/triage-queue/10.png"
                :statistic="deviceStatisticsData"
              >
              </DeviceStatistics>
              <div class="zoom-footer">
                <RollTable :column="column" :data="listData" @click-row="handelClickRow" class="zoom-roll-table">
                  <template #alarmStatus="{ record }">
                    <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
                    <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
                    <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
                  </template>
                </RollTable>
              </div>
            </div>
            <div v-show="listData.length === 0" data-no-zoom>
              <noData></noData>
            </div>
          </div>
        </template>
      </SubPanelTemplate>
    </div>

    <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="parameter"></modal-alarm-table>
    <modal-equipmentAll-table
      :show-modal="deviceModalShow"
      @close="deviceModalShow = false"
      :parameter="deviceParameter"
    ></modal-equipmentAll-table>
  </div>
</template>

<script setup lang="ts">
import moment from "moment";
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";

import RollTable from "../public/rollTable/index.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import { ModelValueItf } from "../public/types";
import DeviceStatistics from "../security-monitoring-safty/device-statistics.vue";
import { alarmrecords, recordStatus } from "@/api/alarm";
import { byTagProperties, getDeviceBuyArea, getDeviceNumber } from "@/api/device";
import { cubeDeviceCenterService } from "@/api/service";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import { useStateStore } from "@/pages/state/use-state-store";
import bus from "@/utils/bus";
import { setDeviceData } from "@/utils/common";
import { getAssetsImage } from "@/utils/getImage";
import { setSpecialCamera } from "@/views";

const { globalState } = useStateStore();
const cardList = ref([]);
const twoCardList = ref([]);
const carousel = ref(0);
const alarmRecordTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [],
});
const equipmentStatistics = reactive({
  title: "监测数",
  total: 0,
});
const listData = ref([]);
const pieData = ref([]);
const alarmModalShow = ref<boolean>(false);
const deviceModalShow = ref<boolean>(false);
let timer: any = ref(null);
const parameter = reactive({
  areaIds: "",
  alarmStatus: "",
  dateRange: [],
});
const deviceParameter = reactive({
  anyAreaId: "",
  deviceState: undefined,
  filterAreaIds: [],
  tagCodes: [`custom.app::visual.${globalState.business.currentMenu}`],
  dateRange: [],
});
const deviceStatisticsData = reactive({
  title: "报警总数",
  total: 48,
  itemize: [
    {
      name: "已处理数",
      label: "未处理数",
      value: 23,
      offline: 15,
      key: "OFFLINE",
    },
  ],
});

const deviceStatusData = reactive({
  title: "设备数",
  total: 48,
  itemize: [
    {
      name: "离线",
      label: "在线",
      value: 23,
      offline: 15,
      key: "OFFLINE",
    },
  ],
});
const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
const column = reactive([
  {
    title: "报警时间",
    dataIndex: "alarmTime",
    width: 120,
  },
  {
    title: "报警级别",
    dataIndex: "alarmLevelName",
  },
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
  },
  {
    title: "状态",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
  },
]);
const getAlarmRecords = async () => {
  const params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: alarmRecordTime.value.dateRange.join(","),
    type: alarmRecordTime.value.timeType,
    pageSize: 50,
    pageNumber: 1,
  };
  const data = await alarmrecords(params);
  listData.value = data.records.map((item) => {
    return {
      ...item,
      alarmTime: moment(item.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
    };
  });
};
const getAlarmStatus = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: alarmRecordTime.value.dateRange.join(","),
    type: alarmRecordTime.value.timeType,
    pageSize: 50,
    pageNumber: 1,
  };
  const res = await recordStatus(params);
  deviceStatisticsData.total = res.alarmNum;
  deviceStatisticsData.itemize[0].offline = res.alarmHandlerNum;
  deviceStatisticsData.itemize[0].value = res.alarmUnresolvedHandlerNum;
};
const changeAlarmRecordDate = () => {
  getAlarmRecords();
  getAlarmStatus();
};
const changeDate = async () => {
  const res1 = await byTagProperties({ tagCode: "builtin.usage::liquid.level.sensors", iotPropertyCodes: ["hydraulics"] });
  const res2 = await byTagProperties({ tagCode: "builtin.usage::fire.water_pressure.device", iotPropertyCodes: ["pressure"] });
  const res = [...res1, ...res2];
  equipmentStatistics.total = res.length ? res.length : 0;
  cardList.value = [];
  res.forEach((item) => {
    item.iotProperties.forEach((iot) => {
      cardList.value.push({ label: item.deviceName, value: iot.originalValue || 0, unit: "", id: item.id });
    });
  });
  twoCardList.value = [];
  const chunkSize = 4;
  for (let i = 0; i < cardList.value.length; i += chunkSize) {
    const chunk = cardList.value.slice(i, i + chunkSize);
    while (chunk.length < chunkSize) {
      const remaining = chunkSize - chunk.length;
      const additionalElements = cardList.value.slice(0, remaining);
      chunk.push(...additionalElements);
    }
    twoCardList.value.push(chunk);
  }
  timer.value = setInterval(() => {
    if (carousel.value == twoCardList.value.length - 1) {
      carousel.value = 0;
    } else {
      carousel.value++;
    }
  }, 1000 * 60);
};
const handlecurrentUps = async (value) => {
  const res = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: value.id });
  setSpecialCamera(res.productInfo.productCategory.name, res.baseArchivesInfo.code);
};
const alarmClickItemize = (value) => {
  if (value === "未处理数") {
    parameter.alarmStatus = "ALARM_UN_CONFIRMED";
  } else if (value === "已处理数") {
    parameter.alarmStatus = "ALARM_HANDLER";
  } else {
    parameter.alarmStatus = undefined;
  }
  parameter.dateRange = alarmRecordTime.value.dateRange;
  alarmModalShow.value = true;
};
const closeModal = () => {
  alarmModalShow.value = false;
};
const handelClickRow = (record) => {
  if (window.config.entry === "views") {
    bus.emit("setOpenAlarmModal", { ...record, hidePanel: true });
  } else {
    bus.emit("openAlarmModal", record);
  }
};
const getDeviceDistribution = async () => {
  const res = await getDeviceNumber({ tagCodes: `custom.app::visual.${globalState.business.currentMenu}` });
  deviceStatusData.total = res.totalNumber;
  deviceStatusData.itemize[0].value = res.normalNumber;
  deviceStatusData.itemize[0].offline = res.offlineNumber;
  const data = await getDeviceBuyArea({
    tagCodes: [`custom.app::visual.${globalState.business.currentMenu}`],
    areaLevel: globalState.business.currentAreaLeave,
  });
  pieData.value = setDeviceData(data, colors);
};
const handelClickItemize = (value) => {
  if (value === "离线") {
    deviceParameter.deviceState = false;
  } else if (value === "在线") {
    deviceParameter.deviceState = true;
  } else {
    deviceParameter.deviceState = undefined;
  }
  deviceParameter.anyAreaId = globalState.business.currentAreaId;
  deviceModalShow.value = true;
};
const handleClickPie = async (value) => {
  const { name } = value;
  if (value.name === "其他") {
    deviceParameter.anyAreaId = undefined;
    deviceParameter.filterAreaIds = pieData.value.map((e) => e.areaId);
    deviceModalShow.value = true;
  } else {
    deviceParameter.filterAreaIds = [];
    const findItem = pieData.value.find((res) => res.name === name);
    if (findItem) {
      deviceParameter.anyAreaId = findItem.areaId;
      deviceModalShow.value = true;
    }
  }
};
onMounted(() => {
  getDeviceDistribution();
  changeDate();
});
onBeforeUnmount(() => {
  clearInterval(timer.value);
});
</script>
<style lang="less" scoped>
.point_list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  .point_item {
    margin: 0 6px 16px 0;
    background: rgba(0, 0, 0, 0.05) linear-gradient(180deg, rgba(41, 137, 255, 0) 0%, rgba(41, 137, 255, 0.35) 100%);
    display: flex;
    width: 108px;
    height: 48px;
    justify-content: space-around;
    padding: 5px 0;

    img {
      width: 16px;
      height: 16px;
    }

    .point_item_right {
      .point_item_name {
        font-size: 12px;
        color: #cad9ee;
      }

      .point_item_conte {
        font-size: 14px;
        font-weight: 700;
        color: #ffffff;

        .unit {
          font-size: 12px;
          font-weight: 500;
          color: #cad9ee;
        }
      }
    }
  }
}

.chart {
  height: calc(150px / var(--font-size-scale));
  display: flex;
  align-items: center;
}

.monitorCard {
  display: flex;
  flex-wrap: wrap;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 4px;

  .cardItem {
    display: flex;
    padding: 6px;
    min-width: 158px;
    background: rgba(0, 0, 0, 0.05) linear-gradient(180deg, rgba(41, 137, 255, 0) 0%, rgba(41, 137, 255, 0.35) 100%);

    img {
      margin-right: 5px;
      width: 32px;
      height: 32px;
    }

    .label {
      width: calc(var(--font-size-scale) * 88px);
      height: 20px;
      font-size: calc(var(--font-size-scale) * 12px);
      font-weight: 500;
      color: #cad9ee;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .value {
      font-size: calc(var(--font-size-scale) * 14px);
      font-family:
        DIN Alternate,
        DIN Alternate;
      font-weight: 500;
      color: #ffffff;
    }

    .unit {
      font-size: 12px;
      font-family:
        DIN Alternate,
        DIN Alternate;
      font-weight: 500;
      color: #cad9ee;
    }
  }
}
.alarm-analysis {
  height: 150px;
}

.zoom-monitor-panel {
  padding: 20px;
}

.zoom-monitorCard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 12px;
  margin-top: 20px;
  max-height: 500px;
  overflow-y: auto;

  .zoom-cardItem {
    display: flex;
    padding: 12px;
    background: rgba(0, 0, 0, 0.05) linear-gradient(180deg, rgba(41, 137, 255, 0) 0%, rgba(41, 137, 255, 0.35) 100%);
    cursor: pointer;

    img {
      margin-right: 8px;
      width: 40px;
      height: 40px;
    }

    .label {
      font-size: 14px;
      color: #cad9ee;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .value {
      font-size: 18px;
      color: #ffffff;
    }

    .unit {
      font-size: 12px;
      color: #cad9ee;
    }
  }
}

.zoom-device-content {
  padding: 20px;

  .zoom-device-chart {
    display: flex;
    align-items: center;
    margin-top: 20px;
    height: 280px;

    .zoom-chart {
      width: 50%;
      height: 100%;
    }

    .zoom-elevator-analysis {
      width: 220px;
      height: 220px;
      margin: 0 auto;
    }

    .zoom-analysis-list {
      font-size: 16px;
    }
  }
}

.zoom-alarm-list {
  padding: 20px;
  min-height: 400px;

  .zoom-footer {
    margin-top: 20px;

    .zoom-roll-table {
      font-size: 16px;
    }
  }
}
</style>
