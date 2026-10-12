<template>
  <div class="panel flex-column">
    <SubPanelTemplate title="监控画面" class="device-camera">
      <div class="content flex-between">
        <H5Video
          class="camera"
          v-for="item in cameraData"
          :key="item.token"
          :cameraItem="item"
          :idStr="item.id"
          @click="clickCamera(item)"
        ></H5Video>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备信息" class="device-info">
      <div
        class="device-status flex-between"
        :style="
          equipmentData?.detail.deviceStatus
            ? boxColor(equipmentData?.detail.deviceStatus)
            : boxColor('NORMAL')
        "
      >
        <span>设备状态</span>
        <span
          class="value"
          :style="{
            color: equipmentData?.detail.deviceStatus
              ? StatusColor[equipmentData?.detail.deviceStatus]
              : StatusColor['NORMAL'],
          }"
          >{{
            equipmentData?.detail.deviceStatus
              ? StatusName[equipmentData?.detail.deviceStatus]
              : "正常"
          }}</span
        >
      </div>
      <div class="basic-info flex-between">
        <a-image :src="getAssetsImage('equipment.jpg')" :width="80"></a-image>
        <div class="info">
          <div class="item">
            <span class="name">设备名称：</span>
            <span>{{ equipmentData?.detail.name ?? "--" }}</span>
          </div>
          <div class="item">
            <span class="name">设备型号：</span>
            <span>{{ equipmentData?.detail.genreName ?? "--" }}</span>
          </div>
          <div class="item">
            <span class="name">设备地址：</span>
            <span>{{ equipmentData?.detail.areaName ?? "--" }}</span>
          </div>
        </div>
      </div>
      <div class="attribute-info">
        <div class="attribute-item" v-for="item in equipmentData?.deviceAttributes ?? []">
          <div class="title">{{ item.attributeName }}</div>
          <div class="content">
            <Enumerate
              v-if="item.dataType === 'ENUM'"
              :deviceId="equipmentData.detail.id"
              :attributeItem="item"
              :initValue="equipmentAttributeVlaue[item.attributeCode]"
            ></Enumerate>
            <Switch
              v-else-if="item.dataType === 'BOOLEAN'"
              :deviceId="equipmentData.detail.id"
              :attributeItem="item"
              :initValue="equipmentAttributeVlaue[item.attributeCode]"
            ></Switch>
            <SetValue
              v-else-if="item.dataType === 'FLOAT'"
              :deviceId="equipmentData.detail.id"
              :attributeItem="item"
              :initValue="equipmentAttributeVlaue[item.attributeCode]"
            >
            </SetValue>
            <span v-else>{{ equipmentAttributeVlaue[item.attributeCode] }}</span>
          </div>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备状态" class="device-status">
      <Radar :deviceId="'1645334831321661441'"></Radar>
    </SubPanelTemplate>
  </div>
</template>
<script setup lang="ts">
import SubPanelTemplate from "../businessPanel/public/subPanelTemplate.vue";
import H5Video from "../businessPanel/public/H5Video.vue";
import { computed, onMounted, ref, watch } from "vue";
import { getAssetsImage } from "../../utils/getImage";
import { hex2Rgba } from "../../utils/common";
import { getDeviceInfo, deviceNewSubscribe } from "@/api/equipment";
import { EquipmentDetails } from "@/api/models/equipment";
import Enumerate from "./attribute-display/enumerate.vue";
import Switch from "./attribute-display/switch.vue";
import SetValue from "./attribute-display/setValue.vue";
import Radar from "./scan-chart.vue";
import { associatedVideos } from "@/api/device";
import { VideoType } from "@/api/models/vmonitor";
import bus from "@/utils/bus";
import { useSubscribeStore } from "@/piniaStore/socketSubscribe";
enum StatusColor {
  "ALARM" = "#FF2500",
  "TROUBLE" = "#FF8100",
  "OFFLINE" = "#FF8100",
  "NORMAL" = "#35D93D",
}
enum StatusName {
  "ALARM" = "报警",
  "TROUBLE" = "故障",
  "OFFLINE" = "离线",
  "NORMAL" = "正常",
}
const props = defineProps({
  equipmentId: {
    type: [String],
    default: "",
  },
});
const piniaUseSubscribeStore = useSubscribeStore();
const equipmentData = ref<EquipmentDetails | null>(null);
const cameraData = ref<VideoType[]>([]);
const equipmentAttributeVlaue = ref();
onMounted(() => {
  requestDeviceInfo();
});
const boxColor = computed(() => (status) => {
  return `
        background: ${hex2Rgba(StatusColor[status], 0.1)};
        box-shadow: inset 0px 0px 10px 0px ${hex2Rgba(StatusColor[status], 0.8)};
        border: 1px solid ${hex2Rgba(StatusColor[status], 0.8)};
      `;
});
const requestDeviceInfo = async () => {
  const res = await getDeviceInfo(props.equipmentId);
  equipmentData.value = res;
  equipmentAttributeVlaue.value = Object.fromEntries(
    res.deviceAttributes.map((item) => [item.attributeCode, 0])
  );
  /**
   * 临时添加处理监控设备及其他设备视屏问题
   */
  if (
    res.detail.genreName === "枪机" ||
    res.detail.genreName === "球机A" ||
    res.detail.genreName === "球机B"
  ) {
    cameraData.value = [
      {
        code: res.detail.code,
        name: res.detail.name,
        token: res.detail.identify,
        id: res.detail.id,
        steamMediaIpAddress: "",
        steamMediaIntranetAddress: "",
      },
    ];
  } else {
    getBindCamera();
  }
  const params = {
    subscribeId: "businessPanel_" + res.detail.id,
    subscribedDevices: res.deviceAttributes.map((item) => {
      return {
        deviceInstanceId: res.detail.id,
        attributeCode: item.attributeCode,
      };
    }),
  };
  subscribeDeviceAttribute(params);
};
const subscribeDeviceAttribute = async (params) => {
  const res = await deviceNewSubscribe(params);
};
const getBindCamera = async () => {
  const res = await associatedVideos(props.equipmentId as any);
  cameraData.value = res;
};
const clickCamera = (item) => {
  bus.emit("switchCamera", item);
};
/**以设备id+前缀businessPanel_作为订阅id */
watch(
  () => piniaUseSubscribeStore.subscribeData,
  (newValue: any) => {
    if (newValue.subscribeId === "businessPanel_" + equipmentData.value.detail.id) {
      newValue.subscribedDevices.forEach((item) => {
        if (equipmentAttributeVlaue.value.hasOwnProperty(item.attributeCode)) {
          equipmentAttributeVlaue.value[item.attributeCode] = item.attributeValue;
        }
      });
    }
  }
);
</script>
<style lang="less" scoped>
.panel {
  height: 100%;
}
.device-camera {
  .content {
    height: auto;
    .camera {
      &:not(:first-child) {
        margin-left: 10px;
      }
    }
  }
}
.device-status {
  height: 40px;
  padding: 0 6px;
  border-radius: 4px 4px 4px 4px;
  font-size: 16px;
  color: #ffffff;
}
.basic-info {
  font-size: 14px;
  color: #ffffff;
  align-items: center;
  margin: 10px 4px;
  .info {
    margin-left: 6px;
    flex: 1;
    .name {
      color: #d0deee;
    }
  }
}
.device-status {
  flex: 1;
}
.attribute-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 10px;
  column-gap: 6px;
  .attribute-item {
    border: 1px solid rgba(86, 142, 255, 0.302);
    .title {
      width: 100%;
      height: 22px;
      background: rgba(86, 142, 255, 0.2);
      font-size: 12px;
      color: #d0deee;
      padding: 0 4px;
    }
    .content {
      height: 32px;
      padding: 0 4px;
      background: rgba(30, 48, 83, 0.4);
      font-size: 16px;
      span {
        line-height: 32px;
        color: #ffffff;
        font-size: 16px;
      }
    }
  }
}
</style>
