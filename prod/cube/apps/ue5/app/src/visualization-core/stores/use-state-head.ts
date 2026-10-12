import { defineStore } from "pinia";

import { ConfigLoader } from "@/application/config/config-loader";

export const storeHead = defineStore("useStoreHead", {
  state: () => {
    return {
      timeSelected: {
        label: "自动",
        value: "auto",
        img: "time1.png",
      },
      weatherSelected: {
        label: "晴",
        value: "Sunny",
        weatherCode: ["00"],
        img: "tianqi/00.png",
      },
      perspectiveSelected: ConfigLoader.config.modelPerspective.length
        ? ConfigLoader.config.modelPerspective[0]
        : { label: "默认", value: "default" },
      qualitySelected: { value: "medium", label: "中" },
      // 漫游相关数据
      roamingDevicesArr: [],
      isRoaming: true,
      cameraViewSuccess: 0,
      roamShow: true,
      roamingPointData: null as Array<{
        perspective: string;
        pointName: string;
        speed: string;
      }> | null,
      roamingCloseHandler: null as (() => void) | null,
    };
  },
  getters: {},
  actions: {
    requestCloseRoaming(): void {
      this.roamingCloseHandler?.();
    },
    registerRoamingCloseHandler(handler: (() => void) | null): void {
      this.roamingCloseHandler = handler;
    },
  },
});
