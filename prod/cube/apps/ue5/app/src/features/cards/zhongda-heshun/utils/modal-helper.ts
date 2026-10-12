import type { UserInfo } from "@ghcloud/cube-ouaa-service";

import { createKeyPlaceMarker, createUserMarker, restoreTheInitialStateOfTheMap } from "./gis-helper";
import { closeKeyPlaceModal, openKeyPlaceModal } from "@/features/cards/zhongda-heshun/components/key-place-modal/key-place-modal";
import { closePersonModal, openPersonModal } from "@/features/cards/zhongda-heshun/components/person-modal/person-modal";
import { clearMap, setCenter } from "@/visualization-core/event/register/gis";

export const createKeyPlaceModal = async (title: string, data?: Record<string, unknown>, center?: boolean): Promise<void> => {
  let doCloseCallBack = true;
  const modalId = await openKeyPlaceModal({
    title: title,
    data: data ? data : {},
    onClose: () => {
      // doCloseCallBack && restoreTheInitialStateOfTheMap()
    },
    onLocate: (data) => {
      doCloseCallBack = false;
      closeKeyPlaceModal(modalId);
      // clearMap()
      if (center) {
        setCenter({ lat: data.latitude, lng: data.longitude }, 20);
        return;
      }
      createKeyPlaceMarker(data, { lat: data.latitude, lng: data.longitude }, true, false, false);
    },
  });
};

export const createPersonModal = async (title: string, type?: string): Promise<void> => {
  let doCloseCallBack = true;
  await openPersonModal({
    title: title,
    data: { type },
    onClose: () => {
      // doCloseCallBack && restoreTheInitialStateOfTheMap()
    },
    onLocate: (userInfo) => {
      doCloseCallBack = false;
      clearMap();
      createUserMarker(userInfo as unknown as UserInfo, undefined, true);
      closePersonModal();
    },
  });
};
