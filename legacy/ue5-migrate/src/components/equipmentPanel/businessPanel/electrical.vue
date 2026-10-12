<!-- 电气安全 设备数据 -->
<template>
  <div >
    <SubPanelTemplate title="设备信息">
      <!-- <template #bar>
                <div class="right-bar">查看更多》</div>
            </template> -->
      <equipmentInfo :equipment-info="equipmentInfoData"></equipmentInfo>
      <div class="attributeList">
        <div class="attributeBox" v-for="item in attributeData">
          <div class="attributeBox-left">{{ item.name }}</div>
          <div class="attributeBox-right">{{ item.value }}</div>
        </div>
      </div>
      <OperateDays :value="eventNum" title="设备事件" :unit="'个'" class="fatalism" />
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
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "./public/subPanelTemplate.vue";
import equipmentInfo from "./public/equipmentInfo.vue";
import OperateDays from "../../businessPanel/public/operateDays.vue";
import RoundPie from "../../businessPanel/public/charts/roundPie/roundPie.vue";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { statisticsStatus } from "@/api/alarm";
import { getDeviceInfo, deviceNewSubscribe } from "@/api/equipment";
import { useSubscribeStore } from "@/piniaStore/socketSubscribe";
import { EquipmentInfoType } from "@/api/models/equipment";
import { useStateStore } from "@/pages/state/use-state-store";
import { storeArea } from "@/piniaStore/area";
const piniaStoreArea = storeArea();
const { globalState } = useStateStore()

let timer: any = ref(null);

const typeList = {
  0: "maintain.png",
  1: "Troubleshooting.png",
  2: "Inspection.png",
  3: "hitch.png",
  4: "equipmentAlarm.png",
};
const piniaUseSubscribeStore = useSubscribeStore();

const roundPieData = ref([]);
const colorList = ["#FFC700", "#74AEE7", "#29C2FF", "#00F27B"];

const eventNum = ref<number>(0);
const attributeData = ref([]);
const equipmentInfoData = ref<EquipmentInfoType>({
  id: "",
  name: "",
  modelName: "",
  modelId: "",
  areaName: "",
  areaIdList: [],
  areaId: "",
  deviceStatus: "",
  communicationStatus: "",
  images: [],
  genreName: "",
  genreId: "",
  code:'', 
  deviceNumber:0, 
  status:'', 
  identify:""
});
watch(
  () => piniaUseSubscribeStore.subscribeData,
  (nreValue: any) => {
    let obj = {};
    nreValue.subscribedDevices.forEach((item) => {
      // obj[item.attributeCode]=item.attributeValue
      attributeData.value.forEach((data) => {
        if (item.attributeCode === data.attributeCode) {
          data.value = item.attributeValue;
        }
      });
    });
  }
);
watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer.value);
    timer.value = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
    init();
  }
);
// 获取设备报警状态
const getEquipmentStatus = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: "2023-01-01 00:00:00,2023-12-31 23:59:59",
    type: "THIS_YEAR",
    pageSize: 50,
    pageNumber: 1,
  };
  let status = await statisticsStatus(params);
  roundPieData.value = status.alarmStatusStatistics.map((item, index) => {
    return {
      label: item.alarmStatusName,
      color: colorList[index],
      value: item.alarmNum,
    };
  });
  eventNum.value = status.alarmNum;
};
const getEquipmentInfo = async () => {
  let res = await getDeviceInfo(piniaStoreArea.equipmentId as any);
  equipmentInfoData.value = res.detail;
  attributeData.value.length = 0;
  let param = {
    subscribeId: "electrical_rightPlate",
    subscribedDevices: res.deviceAttributes.map((item) => {
      attributeData.value.push({
        name: item.attributeName,
        value: "未知",
        attributeCode: item.attributeCode,
      });
      return {
        deviceInstanceId: res.detail.id,
        attributeCode: item.attributeCode,
      };
    }),
  };
  let data = await deviceNewSubscribe(param);
};
const init = () => {
  getEquipmentStatus();
  getEquipmentInfo();
};
onMounted(() => {
  init();
  timer.value = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(() => {
  clearInterval(timer.value);
});
</script>
<style lang="less" scoped>
.panel {
  .fatalism {
    margin-left: 6px;
    margin-top: 30px;
  }

  .equipmentAlarm {
    margin-top: 20px;
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
}

.attributeList {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;

  .attributeBox {
    margin: 10px 0 0 8px;
    display: flex;
    align-items: center;
    text-align: center;
    line-height: 40px;
    color: #fff;

    .attributeBox-left {
      width: 85px;
      height: 40px;
      background: rgba(86, 142, 255, 0.3);
    }

    .attributeBox-right {
      width: 77px;
      height: 40px;
      background: #1e3053;
    }
  }
}
</style>
