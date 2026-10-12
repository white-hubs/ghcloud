import { useRouter } from "vue-router";

export const useSubPagesRouter = () => {
  const router = useRouter();
  return {
    toDeviceList: (gridAreaId: string): void => {
      router.push({ path: "/device-list", query: { gridAreaId } });
    },
    toAlarmRecords: (gridAreaId: string): void => {
      // router.push({ path: "/alarm-records", query: { gridAreaId } });
      window.location.href = `/apps/alarm-center/h5#/alarm-records?gridAreaId=${gridAreaId}`;
    },
    toAlarmDetail: (id: string): void => {
      // router.push({ path: "/alarm-details", query: { id } });
      window.location.href = `/apps/alarm-center/h5#/alarm-details?id=${id}`;
    },
    toAssetList: (gridAreaId: string): void => {
      // router.push({ path: "/asset-list", query: { gridAreaId } });
      window.location.href = `/apps/@ghcloud/cube-asset-management-h5#/assetList?gridAreaId=${gridAreaId}`;
    },
    toTodoCenter: (): void => {
      window.location.href = "/apps/@ghcloud/cube-todo-center-h5/#/todo-center";
      // router.push({ path: "/todo-center" });
    },
    toStallList: (gridAreaId: string): void => {
      router.push({ path: "/stall-list", query: { gridAreaId } });
    },
    toSitePointList: (gridAreaId: string): void => {
      router.push({ path: "/site-point-list", query: { gridAreaId } });
    },
    toPatrolPointList: (gridAreaId: string): void => {
      router.push({ path: "/patrol-point-list", query: { gridAreaId } });
    },
  };
};
