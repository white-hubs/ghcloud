import { defineComponent, onMounted, reactive, ref } from "vue";

import { BaseModal } from "../base-modal/base-modal";
import { DeviceBaseInfo } from "./components/device-base-info/device-base-info";
import { associatedVideos } from "@/infrastructure/api/device";
import { mediaConfig } from "@/infrastructure/api/mdata";
import { cubeDeviceCenterService } from "@/infrastructure/api/service";
import { DeviceTypeIcon } from "@/infrastructure/utils/enumeratie";

import styles from "./device-modal-component.module.less";
// TODO tsx 重构
import { Empty } from "ant-design-vue";

import BroadcastPlay from "@/features/equipment/equipmentdetails/broadcastPlay";
import DeviceControl from "@/features/equipment/equipmentdetails/control";
import DeviceErrorRecord from "@/features/equipment/equipmentdetails/record";
import H5Video from "@/shared-ui/panel/H5Video";

interface Props {
  title: string;
  deviceId: string;
  visible: boolean;
  activeTab?: string;
}

export const DeviceModalComponent = defineComponent({
  props: ["title", "deviceId", "visible", "activeTab"],
  emits: ["close"],
  setup: (props: Props, { emit }) => {
    const tabsList = ref(["基本信息", "实时数据", "监控画面", "异常记录"]);
    const activeTabs = ref(props.activeTab ?? "基本信息");
    const modalData = reactive({ ...props });
    const infoData = ref({ name: "", code: "" });
    const deviceDetail = ref();
    const readData = ref([]);
    const readAndWritData = ref([]);
    const cameraList = ref<Record<string, unknown>[]>([]);
    const deviceType = ref(0);

    const getData = async (): Promise<void> => {
      const data = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: modalData.deviceId });
      infoData.value = data.baseArchivesInfo;
      deviceDetail.value = data;
      deviceType.value = DeviceTypeIcon[data.productInfo.name as keyof typeof DeviceTypeIcon];
      const type = DeviceTypeIcon[data.productInfo.productCategory.name as keyof typeof DeviceTypeIcon];

      if (deviceType.value <= 3 || (type as number) <= 3 || data.productInfo.name === "监控") {
        mediaConfig().then((item) => {
          cameraList.value = [
            {
              steamMediaIpAddress: item?.ipAddress,
              steamMediaIntranetAddress: item?.ipAddress,
              token: data.baseArchivesInfo.thirdPartyId,
              deviceId: modalData.deviceId,
            },
          ];
        });
      } else {
        associatedVideos(modalData.deviceId)
          .then((res) => {
            if (res.length === 0) {
              tabsList.value = ["基本信息", "实时数据", "异常记录"];
            }
            cameraList.value = (res as Record<string, unknown>[]).map((item) => ({
              ...item,
              token: item.thirdPartyId,
            }));
          })
          .catch(() => {
            tabsList.value = ["基本信息", "实时数据", "异常记录"];
          });
      }
    };

    onMounted(() => {
      getData();
    });

    return (): JSX.Element => (
      <BaseModal
        title={props.title}
        skin="BUSINESS"
        size="small"
        visible={props.visible}
        wrapClassName={styles.deviceModal}
        onClose={() => {
          emit("close");
        }}
      >
        <div class={styles.alarmDetailModalContent}>
          <div class={styles.contentTabs}>
            {tabsList.value.map((item) => (
              <div key={item} class={item === activeTabs.value ? styles.active : ""} onClick={() => (activeTabs.value = item)}>
                <div>{item}</div>
              </div>
            ))}
          </div>
          <div class={styles.contentBody}>
            {activeTabs.value === "基本信息" && <DeviceBaseInfo id={modalData.deviceId} />}

            {activeTabs.value === "实时数据" && (
              <DeviceControl
                readAndWritData={readAndWritData.value}
                readData={readData.value}
                id={modalData.deviceId}
                code={infoData.value.code}
              />
            )}

            {activeTabs.value === "监控画面" && (
              <div class={styles.group}>
                {cameraList.value.length > 0 ? (
                  cameraList.value.map((item, index) => (
                    <div class={styles.camera} key={index}>
                      <H5Video control cameraItem={item} />
                    </div>
                  ))
                ) : (
                  <Empty description="暂无监控画面" />
                )}
              </div>
            )}

            {activeTabs.value === "异常记录" && <DeviceErrorRecord code={infoData.value.code} id={modalData.deviceId} />}
            {activeTabs.value === "广播播放" && <BroadcastPlay deviceDetail={deviceDetail.value} />}
          </div>
        </div>
      </BaseModal>
    );
  },
});
