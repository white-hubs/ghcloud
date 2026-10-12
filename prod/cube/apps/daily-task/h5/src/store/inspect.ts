import { update } from "lodash";
import { defineStore } from "pinia";
interface FileType {
  businessKey: string;
  ossId: string;
  id: string;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  type: string;
}
interface TaskCategory {
  id: string;
  name: string;
  ids: {
    id: string;
    typeId: string;
    tagIds: string[];
    old?: boolean;
    standardList?: {
      description: string;
      id: string;
      name: string;
      typeId: string;
    }[];
  }[];
  api: string;
  appAPI: string;
}
interface StoreInspect {
  infoForm: {
    name: string;
    taskCategoryId: string;
    urgencyId: string;
    taskDay: number;
    taskHour: number;
    taskMinute: number;

    description: string;
    taskType: string;
    files: FileType[];
    onlyOnDuty: boolean;
    mustScan: boolean;
    autoComplete: boolean;
    autoCompletePercent: number | null;
  };
  activeTabs: number;
  taskContent: string;
  bzSelectIds: number[];
  typeList: TaskCategory[];
  copyList: TaskCategory[];
  issuingData: {
    conditionType: string;
    userList: string[];
    deptList: string[];
    areaList: string[];
    roleList: string[];
    positionList: string[];
    errorUserList: string[];
  }[];
  formActive: number;
  extraForm: {
    onlyOnDuty: boolean;
    mustScan: boolean;
    autoComplete: boolean;
    autoCompletePercent: number;
  };
  distributeUser:
    | {
        userId: string;
        userName: string;
        progressNumber: string;
        unit: string;
      }[]
    | null;
}

export const storeInspect = defineStore("storeInspect", {
  state: (): StoreInspect => {
    return {
      infoForm: {
        name: "",
        taskCategoryId: "",
        urgencyId: "",
        taskDay: 0,
        taskHour: 0,
        taskMinute: 0,

        description: "",
        files: [],
        taskType: "NORMAL",
        onlyOnDuty: false,
        mustScan: false,
        autoComplete: false,
        autoCompletePercent: null,
      },
      activeTabs: 0,
      taskContent: "任务标准",
      bzSelectIds: [],
      typeList: [
        {
          name: "设备",
          id: "DEVICE",
          api: "getDevicePage",
          appAPI: "getDevicePageID",
          ids: [],
        },
        {
          name: "档位",
          id: "STALL",
          api: "getStallPage",
          appAPI: "getStallPageID",
          ids: [],
        },
        {
          name: "资产",
          id: "PROPERTY",
          api: "getPropertyPage",
          appAPI: "getPropertyPageID",
          ids: [],
        },
        {
          name: "现场点",
          id: "SITE_POINT",
          api: "getScenePointPage",
          appAPI: "getScenePointPageID",
          ids: [],
        },
        // {
        //   name: '巡更点',
        //   id: 'PATROL_POINT',
        //   api: 'getPatrolPointPage',
        //   appAPI: 'getPatrolPointPageID',
        //   ids:[]
        // },
        {
          name: "风险点",
          id: "RISK_SOURCE",
          api: "getRiskPage",
          appAPI: "getRiskPageID",
          ids: [],
        },
        {
          name: "小散工程",
          id: "SMALL_ENGINEERING",
          api: "getProjectPage",
          appAPI: "getProjectPageID",
          ids: [],
        },
      ],
      copyList: [],
      issuingData: [
        {
          conditionType: "USER",
          userList: [],
          deptList: [],
          roleList: [],
          areaList: [],
          positionList: [],
          errorUserList: [],
        },
      ],
      formActive: 0,
      extraForm: {
        onlyOnDuty: false,
        mustScan: false,
        autoComplete: false,
        autoCompletePercent: 0,
      },
      distributeUser: null,
    };
  },
  getters: {},
  actions: {
    resetCache() {
      this.infoForm.name = "";
      this.infoForm.taskCategoryId = "";
      this.infoForm.urgencyId = "";
      this.infoForm.taskDay = 0;
      this.infoForm.taskHour = 0;
      this.infoForm.taskMinute = 0;

      this.infoForm.description = "";
      this.infoForm.taskType = "NORMAL";
      this.infoForm.files = [];
      this.infoForm.onlyOnDuty = false;
      this.infoForm.mustScan = false;
      this.infoForm.autoComplete = false;
      this.infoForm.autoCompletePercent = null;
      this.activeTabs = 0;
      this.taskContent = "任务标准";
      this.bzSelectIds = [];
      this.typeList = [
        {
          name: "设备",
          id: "DEVICE",
          api: "getDevicePage",
          appAPI: "getDevicePageID",
          ids: [],
        },
        {
          name: "档位",
          id: "STALL",
          api: "getStallPage",
          appAPI: "getStallPageID",
          ids: [],
        },
        {
          name: "资产",
          id: "PROPERTY",
          api: "getPropertyPage",
          appAPI: "getPropertyPageID",
          ids: [],
        },
        {
          name: "现场点",
          id: "SITE_POINT",
          api: "getScenePointPage",
          appAPI: "getScenePointPageID",
          ids: [],
        },
        {
          name: "巡更点",
          id: "PATROL_POINT",
          api: "getPatrolPointPage",
          appAPI: "getPatrolPointPageID",
          ids: [],
        },
        {
          name: "风险点",
          id: "RISK_SOURCE",
          api: "getRiskPage",
          appAPI: "getRiskPageID",
          ids: [],
        },
        {
          name: "小散工程",
          id: "SMALL_ENGINEERING",
          api: "getProjectPage",
          appAPI: "getProjectPageID",
          ids: [],
        },
      ];
      this.copyList = [];
      ((this.issuingData = [
        {
          conditionType: "USER",
          userList: [],
          deptList: [],
          areaList: [],
          roleList: [],
          positionList: [],
          errorUserList: [],
        },
      ]),
        (this.formActive = 0),
        (this.extraForm = {
          onlyOnDuty: false,
          mustScan: false,
          autoComplete: false,
          autoCompletePercent: 0,
        }));
      this.distributeUser = null;
    },
    updateCache(payload: any) {
      this.infoForm = payload.infoForm;
      this.activeTabs = payload.activeTabs;
      this.taskContent = payload.taskContent;
    },
    updateTaskCategory(payload: TaskCategory[]) {
      this.typeList = payload;
    },
    copyTaskCategory() {
      this.copyList = JSON.parse(JSON.stringify(this.typeList));
    },

    updateSelectbzIds(payload: number[]) {
      this.bzSelectIds = payload;
    },
    updateIssuingData(payload: any) {
      Object.assign(this.issuingData, payload);
    },
    updateFormActive(payload: number) {
      this.formActive = payload;
    },
    updateSetting(payload: { onlyOnDuty: boolean; mustScan: boolean; autoComplete: boolean; autoCompletePercent: number }) {
      this.extraForm = payload;
    },
    deleteIssuingData(payload: number) {
      this.issuingData.splice(payload, 1);
    },
    updateDistributeUser(payload: { userId: string; userName: string; unit: string; progressNumber: string }[]) {
      this.distributeUser = payload;
    },
    updateDistributeUserKey(payload: { userId: string; userName: string }) {
      if (this.distributeUser) {
        this.distributeUser[this.formActive].userId = payload.userId;
        this.distributeUser[this.formActive].userName = payload.userName;
      }
    },
    getState() {
      return {
        infoForm: this.infoForm,
        activeTabs: this.activeTabs,
        taskContent: this.taskContent,
        issuingData: this.issuingData,
      };
    },
  },
  persist: true,
});
