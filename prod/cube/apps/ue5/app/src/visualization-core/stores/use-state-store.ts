import { defineStore } from "pinia";
import { reactive, ref } from "vue";

import { CubeOuaaService, type UserInfo } from "@ghcloud/cube-ouaa-service";
import { type CubeAuth, CubeTerminalEnum } from "@ghcloud/cube-protocol";

import { ConfigLoader } from "@/application/config/config-loader";
import type { AreaType, SceneDataType } from "@/infrastructure/api/models/mdata";

/** 存放一些具有共性的状态 */
export const useStateStore = defineStore("storeState", () => {
  const runtime = ref<"cube-app" | "browser" | "ue-mode">("browser");
  const renderType = ref<"2D" | "WEBGL" | "UE5" | "GIS">("UE5");
  const globalState = reactive<{
    /** 环游状态 */
    tourAround: boolean;
    /** 是否全屏 */
    fullscreen: boolean;
    /** 驾驶模式 */
    driveMode: boolean;
    /** 标签是否可见 */
    tagVisible: boolean;
    /** 菜单是否可见 */
    menuVisible: boolean;
    /** 面板相关 */
    panel: {
      /** 是否显示 */
      visible: boolean;
      /** 显示的组件 */
      component: string;
      leftPanelName: string; // 左面板内容
      rightPanelName: string; // 右面板内容
      switchScene: string; // 当前场景（楼栋/管线）
      universalPanelVo: {
        // 通用面板数据
        left: {
          items: string;
        };
        right: {
          items: string;
        };
      };
    };
    /** 业务相关相关 */
    business: {
      /** 区域数据 */
      area: AreaType[];
      /** 楼层数据 */
      floor: AreaType[];
      /** 房间数据集 */
      room: AreaType[];
      /** 当前区域层级 */
      currentAreaLeave: number;
      /** 当前菜单 */
      currentMenu: string;
      /** 当前区域id */
      currentAreaId: string;
      /** 给面板用的当前设备 ID */
      panelCurrentDeviceId: string;
      /** 业务菜单数据 */
      menu: SceneDataType[];
      /** 报警数据 */
      alarmDetail: Record<string, unknown>;
      /** 预案设备返回 */
      emergencyDeviceBack: Record<string, unknown>;
    };
  }>({
    /** 环游状态 */
    tourAround: false,
    /** 是否全屏 */
    fullscreen: false,
    /** 驾驶模式 */
    driveMode: false,
    /** 标签是否可见 */
    tagVisible: true,
    /** 菜单是否可见 */
    menuVisible: true,
    /** 面板相关 */
    panel: {
      /** 是否显示 */
      visible: true,
      /** 显示的组件 */
      component: "",
      leftPanelName: "", // 左面板内容
      rightPanelName: "", // 右面板内容
      switchScene: "BUILD", // 当前场景（楼栋/管线）
      universalPanelVo: {
        // 通用面板数据
        left: {
          items: "",
        },
        right: {
          items: "",
        },
      },
    },
    /** 业务相关相关 */
    business: {
      /** 区域数据 */
      area: [],
      floor: [],
      room: [],
      currentAreaLeave: 1,
      currentMenu: "",
      currentAreaId: "",
      panelCurrentDeviceId: "",
      menu: [],
      alarmDetail: {},
      emergencyDeviceBack: {},
    },
  });
  const authInfo = reactive<CubeAuth>({
    token: "",
    tenant: "",
    terminal: CubeTerminalEnum.BUSINESS,
  });
  const userInfo = ref<UserInfo>();

  async function initState(): Promise<void> {
    if (navigator.userAgent.toLocaleLowerCase().includes("cube-app")) {
      runtime.value = "cube-app";
    } else if (navigator.userAgent.includes("UnrealEngine")) {
      runtime.value = "ue-mode";
    } else {
      runtime.value = "browser";
    }

    const entry = ConfigLoader.config.entry;
    if (["views", "views-old-area"].includes(entry)) {
      renderType.value = "UE5";
    } else if (["views-2d", "views-2d-old-area"].includes(entry)) {
      renderType.value = "2D";
    } else if (["views-gis"].includes(entry)) {
      renderType.value = "GIS";
    } else if (["views-three", "views-3d"].includes(entry)) {
      renderType.value = "WEBGL";
    } else {
      renderType.value = "UE5";
    }
    // @ts-ignore
    window.getGlobalState = (): void => {};
    await initUserInfo();
  }
  /** 获取用户信息 */
  async function initUserInfo(): Promise<void> {
    const cubeOuaaService = new CubeOuaaService(authInfo);
    const res = await cubeOuaaService.getUserInfo();
    if (res) {
      userInfo.value = res;
    }
  }

  /** 通过 ID 查找区域业务数据 */
  function getAreaById(id: string, sourceData = globalState.business.area): AreaType {
    for (let i = 0; i < sourceData.length; i++) {
      if (sourceData[i].id === id) {
        return sourceData[i];
      }
    }
    for (let i = 0; i < sourceData.length; i++) {
      if (sourceData[i].children?.length) {
        const res = getAreaById(id, sourceData[i].children);
        if (res) {
          return res;
        }
      }
    }
  }
  /** 通过 ID 获取带层级的名称 */
  function getAreaNameWithLevelById(id: string): string[] {
    const area = getAreaById(id);
    let names = [area.name];
    if (area.parentId) {
      names = [...getAreaNameWithLevelById(area.parentId), ...names];
    }
    return names;
  }

  /** 通过ID 获取层级 */
  function getAreaLevelById(id: string): number {
    const area = getAreaById(id);
    let level = 1;
    if (area.parentId) {
      level = getAreaLevelById(area.parentId) + 1;
    }
    // 园区级别为1级，顶层加1
    return area.parentId ? level : level + 1;
  }

  return {
    initState,
    runtime,
    renderType,
    globalState,
    authInfo,
    userInfo,
    getAreaById,
    getAreaNameWithLevelById,
    getAreaLevelById,
  };
});
