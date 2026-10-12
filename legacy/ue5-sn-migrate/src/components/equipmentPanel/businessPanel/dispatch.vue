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
    <SubPanelTemplate title="设备状态">
      <div class="equipmentStatus">
        <div class="left-radar">
          <scanningChart :result="equipmentHealthData.healthValue"></scanningChart>
          <div class="checkQuery" @click="equipmentHealth">重新检测</div>
        </div>
        <div class="status-list">
          <equipmentStatusList
            :check="equipmentHealthData.testItemNumber"
            :question="equipmentHealthData.problemItemNumber"
            :detectionTime="equipmentHealthData.createTime"
            :statusList="equipmentHealthData.problems"
          >
          </equipmentStatusList>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警">
      <div class="equipmentAlarm">
        <RoundPie :eventNum="eventNum" :data="roundPieData">
          <div class="content">
            <span>{{ eventNum }}</span> <br />报警事件
          </div>
        </RoundPie>
        <div class="policeList">
          <div class="thePolice" v-for="item in roundPieData" :key="item.color">
            <div><span :style="{ background: item.color }"></span> {{ item.label }}</div>
            <span>{{ item.value }}</span>
          </div>
        </div>
      </div>
    </SubPanelTemplate>
    <RollTable
      :column="column"
      :data="data"
      style="margin-top: 10px"
      class="roll-table"
      @click-row="handelClickRow"
    >
      <template #alarmStatus="{ record }">
        <span :style="{ color: statusStyle(record.alarmStatus).color }">{{
          statusStyle(record.alarmStatus).label
        }}</span>
      </template>
    </RollTable>
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "./public/subPanelTemplate.vue";
import H5Video from "../../businessPanel/public/H5Video.vue";
import equipmentStatusList from "./public/equipmentStatusList.vue";
import RoundPie from "../../businessPanel/public/charts/roundPie/roundPie.vue";
import RollTable from "../../businessPanel/public/rollTable/index.vue";
import scanningChart from "./public/scanningChart.vue";
import moment from "moment";
import { statisticsStatus, alarmStatisticsList } from "@/api/alarm";
import enumeratie from "@/utils/enumeratie";
import useCommon from "../../hooks/useCommon";
import bus from "@/utils/bus";
import { VideoType } from "@/api/models/vmonitor";
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { healthProblemsLatest } from "@/api/equipment";
import { storeMenu } from "@/piniaStore/menu";
const piniaStoreMenu = storeMenu();
const cameraData = ref<VideoType[]>([]);
const { alarmStatusOptions, alarmLeaveOptions } = enumeratie();
const { piniaStoreArea, getAssociatedVideo } = useCommon();

let timer: any = reactive(null);
interface info {
  testItemNumber: number;
  createTime: string;
  healthValue: number;
  problemItemNumber: number;
  problems: any;
}
const equipmentHealthData = ref<info>({
  testItemNumber: 0,
  createTime: "",
  healthValue: 0,
  problemItemNumber: 0,
  problems: [],
});
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
const detectionTime: string = "2022-12-12 12:12:12";
const statusList: string[] = [
  "近3日内，发生了离线问题1",
  "近3日内，发生了离线问题2",
  "近3日内，发生了离线问题3",
  "近3日内，发生了离线问题4",
  "近3日内，发生了离线问题5",
];
const roundPieData = ref([]);
const colorList = ["#FFC700", "#74AEE7", "#29C2FF", "#00F27B"];
const eventNum = ref<number>(0);
const column = ref([
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
const data = ref();
// 获取设备报警状态
const getEquipmentStatus = async () => {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: "2023-01-01 00:00:00,2023-12-31 23:59:59",
    type: "THIS_YEAR",
    pageSize: 50,
    pageNumber: 1,
  };
  let status = await statisticsStatus(params);
  let res: any = await alarmStatisticsList(params);
  roundPieData.value = status.alarmStatusStatistics.map((item, index) => {
    return {
      label: item.alarmStatusName,
      color: colorList[index],
      value: item.alarmNum,
    };
  });
  eventNum.value = status.alarmNum;
  data.value = res.records.map((item) => {
    item.alarmTime = moment(item.alarmTime).format("YYYY-MM-DD");
    return item;
  });
};
const clickCamera = (item) => {
  bus.emit("switchCamera", item);
};
const statusStyle = computed(() => (key: string) => {
  let option = alarmStatusOptions.value.find((item) => {
    return item.value === key;
  });
  return option;
});
const leaveStyle = computed(() => (key: string) => {
  let option = alarmLeaveOptions.value.find((item) => {
    return item.value === key;
  });
  return option;
});
async function getVideo() {
  cameraData.value = await getAssociatedVideo(piniaStoreArea.equipmentId);
}
const equipmentHealth = async () => {
  equipmentHealthData.value = await healthProblemsLatest(
    piniaStoreArea.equipmentId as any
  );
  equipmentHealthData.value.createTime = equipmentHealthData.value.createTime
    ? moment(equipmentHealthData.value.createTime).format("YYYY-MM-DD")
    : "";
};
const handelClickRow = (record) => {
  if (record.alarmTargetCode) {
    bus.emit("equipmentPosition", record);
  }
};
const init = () => {
  getEquipmentStatus();
  getVideo();
  equipmentHealth();
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
  margin: auto;
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.equipmentStatus {
  margin-top: 10px;
  display: flex;
  justify-content: space-around;

  .left-radar {
    width: 118px;
    height: 118px;

    .checkQuery {
      width: 59px;
      height: 21px;
      background: linear-gradient(
        180deg,
        rgba(0, 85, 254, 0) 0%,
        rgba(0, 85, 254, 0.47) 77%,
        #0055fe 100%
      );
      border-radius: 13px;
      border: 1px solid;
      color: #ffffff;
      font-size: 12px;
      text-align: center;
      line-height: 21px;
      margin: 10px auto;
      cursor: pointer;
      user-select: none;
    }
  }

  .status-list {
    width: 210px;
  }
}

.camera {
  width: 164px;
  // height: 90px;
  margin-top: 10px;
}

.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;
  .content {
    font-size: 16px;
  }
  .thePolice {
    width: 155px;
    height: 24px;
    background: rgba(108, 128, 151, 0.5);
    border-radius: 0px 0px 0px 0px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    padding: 0 16px 0 8px;
    margin-bottom: 18px;

    div {
      span {
        display: inline-block;
        width: 8px;
        height: 8px;
        background: #328bf7;
        border-radius: 50%;
      }
    }

    span {
      font-weight: bold;
    }
  }

  .policeList .thePolice:last-child {
    margin-bottom: 0;
  }
}
</style>
