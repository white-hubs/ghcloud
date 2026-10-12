import { PeopleFlowHeatmapManager } from "./people-flow-heatmap-manager";
import { cubeTrafficStatisticsService } from "@/infrastructure/api/service";
import { modelSDK } from "@/visualization-core/model-sdk/sdk";

/** UE 场景中的固定人流热力图，用作动态热力图预热完成前的稳定兜底。 */
export const UE_PEOPLE_FLOW_HEATMAP_ACTOR_IDS: readonly string[] = [
  "heatmap_3_1F_1",
  "heatmap_3_1F_2",
  "heatmap_3_1F_3",
  "heatmap_3_1F_4",
  "heatmap_2_1F_1",
  "heatmap_2_1F_2",
  "heatmap_2_1F_3",
  "heatmap_2_1F_4",
  "heatmap_1_2F",
  "heatmap_1_1F_1",
  "heatmap_1_1F_2",
  "heatmap_1_1F_3",
  "heatmap_1_1F_4_1",
  "heatmap_1_1F_4_2",
  "heatmap_1_1F_5_1",
  "heatmap_1_1F_5_2",
];

export const peopleFlowHeatmapManager = new PeopleFlowHeatmapManager({
  dataSource: {
    getAreaStats: () => cubeTrafficStatisticsService.getTrafficAreaListStat(),
    getDevices: async (areaId) => {
      const result = await cubeTrafficStatisticsService.getTrafficDevicesById(areaId, {
        pageNumber: 1,
        pageSize: 999,
        deviceState: true,
      });
      return result?.records ?? [];
    },
  },
  model: {
    render: (params) => modelSDK.coordPointsHeatMap(params),
    clearDynamic: () => modelSDK.clearAllCoordPointsHeatMap(),
    showFixedActor: (id) => modelSDK.showActor({ id }),
    hideFixedActor: (id) => modelSDK.hideActor({ id }),
  },
  fixedActorIds: UE_PEOPLE_FLOW_HEATMAP_ACTOR_IDS,
  interTaskDelayMs: 15_000,
  renderSettleMs: 800,
  deviceRequestConcurrency: 4,
  maxRequestAttempts: 2,
});
