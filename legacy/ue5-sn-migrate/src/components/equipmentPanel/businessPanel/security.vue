<!-- 调度指挥 设备数据 -->
<template>
  <div class="panel">
    <SubPanelTemplate title="监控画面">
      <div class="videoBox">
        <H5Video
          class="camera"
          v-for="item in cameraData"
          :key="item.token"
          :cameraItem="item"
          :idStr="item.token"
          @click="clickCamera(item)"
        >
        </H5Video>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备信息">
      <equipmentInfo :equipment-info="equipmentInfoData"></equipmentInfo>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警">
      <div class="body">
        <div class="chart">
          <Pie3D
            style="width: 140px"
            :dataValue="dataValue"
            :internalDiameterRatio="0"
            :autoRotate="true"
          />
          <pieList :roundPieData="roundPieData"></pieList>
        </div>
        <div class="footer">
          <RollTable
            :key="falg"
            :column="column"
            :data="data"
            @click-row="handelClickRow"
          >
            <template #alarmStatus="{ record }">
              <span
                v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'"
                style="color: #f14545"
                >待处理</span
              >
              <span
                v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'"
                style="color: #ffab10"
                >处理中</span
              >
              <span
                v-else="record.alarmStatus === 'ALARM_CONFIRMED'"
                style="color: #00f27b"
                >已处理</span
              >
            </template>
          </RollTable>
        </div>
      </div>
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "./public/subPanelTemplate.vue";
import H5Video from "../../businessPanel/public/H5Video.vue";
import equipmentInfo from "./public/equipmentInfo.vue";
import Pie3D from "../../businessPanel/public/charts/pie3D/pie3D.vue";
import pieList from "../../businessPanel/public/pieList.vue";
import RollTable from "../../businessPanel/public/rollTable/index.vue";
import { AlarmLevelType } from "@/api/models/alarm";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import moment from "moment";
import bus from "@/utils/bus";
import { statisticsStatus, alarmStatisticsList } from "@/api/alarm";
import { getDeviceInfo } from "@/api/equipment";
import { VideoType } from "@/api/models/vmonitor";
import useCommon from "../../hooks/useCommon";
import { storeMenu } from "@/piniaStore/menu";
const piniaStoreMenu = storeMenu();
const roundPieData = ref([]);
let timer: any = reactive(null);

const equipmentInfoData: any = ref({
  id: "0",
  name: "",
  modelName: "",
  areaName: "",
  deviceStatus: "",
  communicationStatus: "",
  images: [],
});
const { piniaStoreArea, getAssociatedVideo } = useCommon();
const cameraData = ref<VideoType[]>([]);
const colorList = ["#FFC700", "#74AEE7", "#29C2FF", "#00F27B"];
const dataValue = ref();
const column = reactive([
  {
    title: "报警时间",
    dataIndex: "alarmTime",
    width: 120,
  },
  {
    title: "报警设备",
    dataIndex: "alarmTargetTypeName",
  },
  {
    title: "设备事件",
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
const data = ref();
let falg = ref<number>(0);
watch(
  () => piniaStoreArea.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
    init();
  }
);
// 获取设备报警状态
const getEquipmentStatus = async () => {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    pageSize: 50,
    pageNumber: 1,
  };
  let status = await statisticsStatus(params);
  let res = await alarmStatisticsList(params);
  roundPieData.value = status.alarmStatusStatistics.map((item, index) => {
    return {
      label: item.alarmStatusName,
      color: colorList[index],
      value: item.alarmNum,
    };
  });
  dataValue.value = status.alarmStatusStatistics.map((item, index) => {
    return {
      name: item.alarmStatusName,
      value: item.alarmNum,
    };
  });
  data.value = res.records.map((item) => {
    item.alarmTime = moment(item.alarmTime).format("YYYY-MM-DD");
    return item;
  });
  falg.value++;
};
const getEquipmentInfo = async () => {
  let res = await getDeviceInfo(piniaStoreArea.equipmentId as any);
  equipmentInfoData.value = res.detail;
};
const clickCamera = (item) => {
  bus.emit("switchCamera", item);
};
async function getVideo() {
  cameraData.value = await getAssociatedVideo(piniaStoreArea.equipmentId);
}
const handelClickRow = (record) => {
  if (record.alarmTargetCode) {
    bus.emit("equipmentPosition", record);
  }
};
const init = () => {
  getEquipmentStatus();
  getEquipmentInfo();
  getVideo();
};
onMounted(() => {
  init();
  timer = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>
<style lang="less" scoped>
.videoBox {
  width: 332px;
  height: 187px;
  border-radius: 0px 0px 0px 0px;
  opacity: 1;
  margin: auto;
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  .camera {
    width: 160px;
    // height: 90px;
    margin-top: 10px;
  }
}

.body {
  .chart {
    width: 100%;
    height: 140px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &-num {
    margin-bottom: 10px;
  }
}
</style>
