import { defineStore } from "pinia";

import { TrafficDetectionAreaListStatVO } from "@ghcloud/cube-traffic-detection-service";

interface TrafficState {
  currentTraffic: TrafficDetectionAreaListStatVO | null;
}

export const trafficStore = defineStore("traffic", {
  state: (): TrafficState => {
    return {
      currentTraffic: null,
    };
  },
  getters: {},
  actions: {
    updateCurrentTraffic(traffic: TrafficDetectionAreaListStatVO) {
      this.currentTraffic = traffic;
    },
    clearCurrentTraffic() {
      this.currentTraffic = null;
    },
  },
});
