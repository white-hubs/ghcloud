import { message } from "ant-design-vue";
import { ref, type Ref } from "vue";

import { ParkingInfoVisualVO } from "@ghcloud/cube-parking-lot-service/src/type";

import { parkingStore } from "../store/parking";
import { cubeParkingLotService } from "@/infrastructure/api/service";
import { eventInstance } from "@/visualization-core/event/event";
import { modelSDK } from "@/visualization-core/model-sdk/sdk";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

export interface UseParkArea {
  showParkArea: () => void;
  goBack: () => void;
}
export const useParkArea = (): UseParkArea => {
  const { globalState, getAreaById } = useStateStore();
  const store = parkingStore();
  const viewConfig: Ref<ParkingInfoVisualVO> = ref();

  const getViewConfig = async (): Promise<void> => {
    try {
      const res = await cubeParkingLotService.getParkingViewConfig(store.currentParking?.id);
      viewConfig.value = res;
    } catch {}
  };
  const showParkBackground = (): void => {
    // 通过store.currentParking?.name匹配（模糊+精准）出下面四个区域的id,传入modelSDK.showActor
    // 前广场东西的色块tag是ID:Parking_QGCD_BJ      ID:Parking_QGCX_BJ   后广场东西的色块tag是ID:Parking_HGCD_BJ       ID:Parking_HGCX_BJ
    const parkingName = store.currentParking?.name || "";
    let actorId = "";
    const areaMap: Record<string, Record<string, string>> = {
      前广场: {
        东: "Parking_QGCD_BJ",
        西: "Parking_QGCX_BJ",
      },
      后广场: {
        东: "Parking_HGCD_BJ",
        西: "Parking_HGCX_BJ",
      },
    };
    const matchedArea = Object.keys(areaMap).find((area) => parkingName.includes(area));
    if (matchedArea) {
      const directionMap = areaMap[matchedArea];
      const matchedDirection = Object.keys(directionMap).find((dir) => parkingName.includes(dir));
      if (matchedDirection) {
        actorId = directionMap[matchedDirection];
      }
    }
    if (actorId) {
      modelSDK.showActor({
        id: actorId,
      });
    }
  };

  const showParkArea = async (): Promise<void> => {
    // 切换区域面板
    globalState.business.currentAreaLeave = 2;
    eventInstance.emitEvent("switchBusinessPanel", {
      type: "parking",
      name: "停车监测",
      visible: true,
    });

    await getViewConfig();

    let camera = viewConfig.value?.visualConfig;
    if (camera) {
      // 切换视角
      const cameraObj = typeof camera === "string" && camera ? JSON.parse(camera) : camera;
      modelSDK.changeCameraView(cameraObj);

      // 显示停车场车辆
      modelSDK.updateParkingVehicles({
        parkingLot: store.currentParking?.modelArea || "ParkingLot_A2",
        vehicles: store.currentParking?.totalInNum || 0,
      });

      // 显示停车场区域色块
      showParkBackground();
    } else {
      message.error("未获取到视角参数");
    }
  };
  const goBack = (): void => {};
  return {
    showParkArea,
    goBack,
  };
};
