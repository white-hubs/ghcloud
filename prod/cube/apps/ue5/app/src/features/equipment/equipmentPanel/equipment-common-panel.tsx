import { defineComponent } from "vue";
import { computed, onMounted, ref, watch } from "vue";

import Enumerate from "./attribute-display/enumerate";
import SetValue from "./attribute-display/setValue";
import Switch from "./attribute-display/switch";
import Radar from "./scan-chart";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { associatedVideos } from "@/infrastructure/api/device";
import { getDeviceInfo, deviceNewSubscribe } from "@/infrastructure/api/equipment";
import { EquipmentDetails } from "@/infrastructure/api/models/equipment";
import { VideoType } from "@/infrastructure/api/models/vmonitor";
import bus from "@/infrastructure/utils/bus";
import { hex2Rgba } from "@/infrastructure/utils/common";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import H5Video from "@/shared-ui/panel/H5Video";
import { useSubscribeStore } from "@/visualization-core/stores/socketSubscribe";

import styles from "./equipment-common-panel.module.less";

export const EquipmentCommonPanel = defineComponent({
  name: "EquipmentCommonPanel",
  props: {
    equipmentId: {
      type: [String],
      default: "",
    },
  },
  setup(props, ctx) {
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
      equipmentAttributeVlaue.value = Object.fromEntries(res.deviceAttributes.map((item) => [item.attributeCode, 0]));
      /**
       * 临时添加处理监控设备及其他设备视屏问题
       */
      if (res.detail.genreName === "枪机" || res.detail.genreName === "球机A" || res.detail.genreName === "球机B") {
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
      },
    );

    return (): JSX.Element => (
      <>
        <div class="panel flex-column">
          <SubPanelTemplate title="监控画面" class="device-camera">
            <div class="content flex-between">
              {cameraData.map((item) => (
                <H5Video class="camera" key={item.token} cameraItem={item} idStr={item.id} onClick={clickCamera(item)}></H5Video>
              ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备信息" class="device-info">
            <div
              class="device-status flex-between"
              style={equipmentData?.detail.deviceStatus ? boxColor(equipmentData?.detail.deviceStatus) : boxColor("NORMAL")}
            >
              <span> 设备状态</span>
              <span
                class="value"
                style={{
                  color: equipmentData?.detail.deviceStatus ? StatusColor[equipmentData?.detail.deviceStatus] : StatusColor["NORMAL"],
                }}
              >
                {equipmentData?.detail.deviceStatus ? StatusName[equipmentData?.detail.deviceStatus] : "正常"}
              </span>
            </div>
            <div class="basic-info flex-between">
              <a-image src={getAssetsImage("equipment.jpg")} width={80}></a-image>
              <div class="info">
                <div class="item">
                  <span class="name"> 设备名称：</span>
                  <span> {equipmentData?.detail.name ?? "--"}</span>
                </div>
                <div class="item">
                  <span class="name"> 设备型号：</span>
                  <span> {equipmentData?.detail.genreName ?? "--"}</span>
                </div>
                <div class="item">
                  <span class="name"> 设备地址：</span>
                  <span> {equipmentData?.detail.areaName ?? "--"}</span>
                </div>
              </div>
            </div>
            <div class="attribute-info">
              {equipmentData?.deviceAttributes ??
                [].map((item) => (
                  <div class="attribute-item">
                    <div class="title"> {item.attributeName}</div>
                    <div class="content">
                      {item.dataType === "ENUM" && (
                        <Enumerate
                          deviceId={equipmentData.detail.id}
                          attributeItem={item}
                          initValue={equipmentAttributeVlaue[item.attributeCode]}
                        ></Enumerate>
                      )}
                      {item.dataType === "BOOLEAN" ? (
                        <Switch
                          deviceId={equipmentData.detail.id}
                          attributeItem={item}
                          initValue={equipmentAttributeVlaue[item.attributeCode]}
                        ></Switch>
                      ) : null}
                      {item.dataType === "FLOAT" ? (
                        <SetValue
                          deviceId={equipmentData.detail.id}
                          attributeItem={item}
                          initValue={equipmentAttributeVlaue[item.attributeCode]}
                        ></SetValue>
                      ) : null}
                      <span> {equipmentAttributeVlaue[item.attributeCode]}</span>
                    </div>
                  </div>
                ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备状态" class="device-status">
            {" "}
            <Radar deviceId={"1645334831321661441"}></Radar>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default EquipmentCommonPanel;
