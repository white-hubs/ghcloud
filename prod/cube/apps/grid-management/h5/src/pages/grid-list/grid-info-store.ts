import type { GridDTO } from "@ghcloud/cube-grid-management-service";
import { reactive } from "vue";
const gridState = reactive<{
  gridInfo: GridDTO;
}>({
  gridInfo: {
    gridAreaId: "",
    gridName: "",
    childAreaName: "",
    gridDepartmentId: "",
    gridDepartmentName: "",
    gridManagers: [
      {
        gridManagerId: "",
        avatar: null,
        gridManagerName: "",
        workStatus: "",
        mobile: "",
      },
    ],
    gridMembers: [
      {
        name: "",
        mobile: "",
      },
      {
        name: "",
        mobile: "",
      },
    ],
    gridMemberNames: [],
  },
});
export const useGridState = (): {
  setGridInfo: (data: GridDTO) => void;
  getGridInfo: () => GridDTO;
} => {
  const setGridInfo = (data: GridDTO) => {
    gridState.gridInfo = data;
  };
  const getGridInfo = () => gridState.gridInfo;
  return {
    setGridInfo,
    getGridInfo,
  };
};
