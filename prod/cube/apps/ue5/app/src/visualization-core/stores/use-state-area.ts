import { defineStore } from "pinia";
export interface CurBuild {
  actorId: string;
  iconType: string;
  name: string;
  id: string;
  modalNames: string;
  buildTagLocation: unknown;
  visualizationAreaType: string;
}
export const storeArea = defineStore("useStoreArea", {
  state: () => {
    return {
      currentAreaLeave: 1 /**当前区域级别 */,
      currentAreaId: "",
      modalNames: {
        name: "",
        area: "",
      },
      areaList: [], //全部区域数据
      areaModelList: [], //处理后的模型一级区域，因为一级区域经常打标签，把数据存储起来，减少后续调用
      shellCode: "", //楼栋外壳ID
      curBuild: <CurBuild>(<unknown>[]), //当前选择楼栋数据
      functionalAreaList: [], //当前选中楼层后功能区数据
      functionalCurBuild: {
        id: "",
        name: "",
      }, //当前选中功能区数据
      floorList: [], //当前选中楼栋数据
      currentSequence: "",
      currentContainerId: "", //当前ue5查询范围 在打标签的时候用到 可以是楼栋或者楼层的 actorId
      equipmentId: "",
      currentModalNames: "", //当前视角
      currentBuild: null, //当前楼栋
      currentFloor: null, // 当前楼层
    };
  },
  getters: {},
  actions: {},
});
