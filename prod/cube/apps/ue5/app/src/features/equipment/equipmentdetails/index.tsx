import { CloseOutlined } from "@ant-design/icons-vue";
import { defineComponent, onMounted, ref, Teleport, type PropType } from "vue";

import BroadcastPlay from "./broadcastPlay";
import DeviceControl from "./control";
import DeviceBaseInfo from "./info";
import DeviceErrorRecord from "./record";
import { associatedVideos } from "@/infrastructure/api/device";
import { mediaConfig } from "@/infrastructure/api/mdata";
import { getSecurityDevicePage } from "@/infrastructure/api/securitymanagement";
import { cubeDeviceCenterService } from "@/infrastructure/api/service";
import { DeviceTypeIcon } from "@/infrastructure/utils/enumeratie";
import H5Video from "@/shared-ui/panel/H5Video";
import NoData from "@/shared-ui/panel/noData";
import { useDragPosition } from "@/visualization-core/hooks/use-drag-position";
import { storeMarket } from "@/visualization-core/stores/other";

import "./index.module.less";

export const Index = defineComponent({
  name: "EquipmentDetails",
  props: {
    id: { type: String as PropType<string>, default: "" },
    activeData: { type: String as PropType<string>, default: "基本信息" },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const piniaStoreMarket = storeMarket();

    const tabsList = ref<string[]>(["基本信息", "实时数据", "监控画面", "异常记录"]);
    const activeTabs = ref("基本信息");
    const infoData = ref<Record<string, any>>({ name: "", code: "" });
    const deviceDetail = ref<any>();
    const readData = ref<any[]>([]);
    const readAndWritData = ref<any[]>([]);
    const cameraList = ref<any[]>([]);
    const deviceType = ref(0);
    const modalRef = ref<HTMLElement | null>(null);

    const { startDrag } = useDragPosition(modalRef);

    const closeModal = (): void => {
      emit("close", true, deviceDetail.value);
    };

    const resolveTypeIcon = (name?: string): number => {
      if (!name) return Number.POSITIVE_INFINITY;
      return DeviceTypeIcon[name as keyof typeof DeviceTypeIcon] ?? Number.POSITIVE_INFINITY;
    };

    const getData = async (): Promise<void> => {
      if (!props.id) return;
      const data = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: props.id });
      infoData.value = data.baseArchivesInfo || { name: "", code: "" };
      deviceDetail.value = data;
      deviceType.value = resolveTypeIcon(data.productInfo?.name);
      const type = resolveTypeIcon(data.productInfo?.productCategory?.name);

      if (deviceType.value <= 3 || type <= 3 || data.productInfo?.name === "监控") {
        const item = await mediaConfig();
        cameraList.value = [
          {
            steamMediaIpAddress: item?.ipAddress,
            steamMediaIntranetAddress: item?.ipAddress,
            token: data.baseArchivesInfo?.thirdPartyId,
            deviceId: props.id,
          },
        ];
      } else {
        try {
          const res = await associatedVideos(props.id);
          if (!res?.length) {
            tabsList.value = ["基本信息", "实时数据", "异常记录"];
          }
          cameraList.value = (res || []).map((item: any) => ({
            ...item,
            token: item.thirdPartyId,
          }));
        } catch {
          tabsList.value = ["基本信息", "实时数据", "异常记录"];
        }
      }
    };

    const getSecurityDevicePagData = async (): Promise<void> => {
      try {
        const res = await getSecurityDevicePage("BROADCAST_CENTER", {
          pageNumber: 1,
          pageSize: 999,
        });
        const ids = (res?.records || []).map((e: any) => e.deviceId);
        if (ids.includes(props.id)) {
          tabsList.value.push("广播播放");
        }
      } catch {
        // ignore
      }
    };

    onMounted(async () => {
      await getData();
      await getSecurityDevicePagData();
      activeTabs.value = piniaStoreMarket.deviceDetailsPanelActive || props.activeData || "基本信息";
    });

    return (): JSX.Element => (
      <Teleport to="body">
        <div class="device-detail-overlay">
          <div class="device-detail-panel alarmDetail-modal" ref={modalRef}>
            <div class="alarmDetail-modal-header" onMousedown={startDrag}>
              <div class="header-title">{infoData.value.name || "设备详情"}</div>
              <div class="flex-between">
                <div
                  class="header-close"
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    closeModal();
                  }}
                >
                  <CloseOutlined />
                </div>
              </div>
            </div>
            <div class="alarmDetail-modal-content flex-column">
              <div class="content-tabs">
                {tabsList.value.map((item) => (
                  <div
                    key={item}
                    class={item === activeTabs.value ? "active" : ""}
                    onClick={() => {
                      activeTabs.value = item;
                    }}
                  >
                    <div>{item}</div>
                  </div>
                ))}
              </div>
              <div class="conent-body">
                {activeTabs.value === "基本信息" && <DeviceBaseInfo id={props.id} />}
                {activeTabs.value === "实时数据" && (
                  <DeviceControl
                    readAndWritData={readAndWritData.value}
                    readData={readData.value}
                    id={props.id}
                    code={infoData.value.code}
                  />
                )}
                {activeTabs.value === "监控画面" &&
                  (cameraList.value.length > 0 ? (
                    <div class="group">
                      {cameraList.value.map((item, index) => (
                        <div class="camera" key={item.token || item.deviceId || index}>
                          <H5Video control={true} cameraItem={item} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <NoData />
                  ))}
                {activeTabs.value === "异常记录" && <DeviceErrorRecord code={infoData.value.code} id={props.id} />}
                {activeTabs.value === "广播播放" && <BroadcastPlay deviceDetail={deviceDetail.value} />}
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    );
  },
});

export default Index;
