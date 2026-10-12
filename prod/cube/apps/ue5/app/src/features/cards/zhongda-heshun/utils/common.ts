import type { UserInfo } from "@ghcloud/cube-ouaa-service";

import { createKeyPlaceMarker, createProjectMarker, createUserMarker } from "./gis-helper";
import { useOuaaUserList } from "@/features/cards/zhongda-heshun/components/person/use-ouaa-user-list";
import { cubeZDDataVizService } from "@/infrastructure/api/service";

export const showProjectMarker = async (): Promise<void> => {
  try {
    const res = await cubeZDDataVizService.getProjectsListAll();
    if (res) {
      (res ?? [])?.forEach((data) => {
        const location = data.disinfectionLocation?.split(",").map(parseFloat);
        createProjectMarker(data, { lat: location[1], lng: location[0] });
      });
    }
  } catch {}
};
export const showPersonMarker = async (): Promise<void> => {
  try {
    const res = await cubeZDDataVizService.getPersonnelDistribution();
    if (res) {
      const list = (res.disinfectionUserList ?? [])?.map((e) => {
        return {
          ...e,
          id: e.userId,
          fileVO: e.photo?.[0],
        };
      });
      list?.forEach((item) => {
        createUserMarker(item as unknown as UserInfo, undefined);
      });
    }
  } catch {}
};
export const showKeyPlaceMarker = async (payload?: {
  keyword?: string;
  dataTypeId?: string;
  projectId?: string;
  area?: string;
}): Promise<void> => {
  try {
    const res = await cubeZDDataVizService.getKeyPlacesListAll(payload);
    if (res) {
      (res ?? [])?.forEach((data) => {
        createKeyPlaceMarker(data, { lat: data.latitude, lng: data.longitude }, false, true, false);
      });
    }
  } catch {}
};
