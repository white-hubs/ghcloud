import { initAuthStore as initSafetyAuthStore } from "@ghcloud/cube-safety-supervision-app/src/api/auth-store";
import { CubeVisualizationService } from "@ghcloud/cube-visualization-service";

import { getSessionAuth } from "@/application/auth/session";
import { applySystemTitle } from "@/application/bootstrap/system-title";
/** 暂定做一些配置加载的工作 */
import { getModelConfig } from "@/infrastructure/api/mdata";
import { statusInitialization } from "@/visualization-core/stores/state-init";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

const resolveAuth = () => {
  const auth = getSessionAuth();
  if (!auth.token) {
    throw new Error("无鉴权信息");
  }
  return auth;
};

/** 初始化config */
const initConfig = async (): Promise<void> => {
  window.config.entry = "pages";
  const sessionAuth = resolveAuth();

  initSafetyAuthStore(sessionAuth);
  const { authInfo } = useStateStore();
  authInfo.tenant = sessionAuth.tenant;
  authInfo.token = sessionAuth.token;
  authInfo.terminal = sessionAuth.terminal;

  try {
    const tenantId = sessionAuth.tenant;
    window.config.modelPerspective = window.config.modelPerspective.filter((e) => e.tenant === tenantId);
    window.config.perspective = window.config.perspective.filter((e) => e.tenant === tenantId);
    window.config.connectLines = window.config.connectLines.filter((e) => e.tenant === tenantId);
    window.config.systemName = window.config.systemNameConfig.find((e) => e.tenant === tenantId)?.value ?? "数字孪生可视化平台";
    if (window.config.tenantConfig) {
      window.config.entry = window.config.tenantConfig.find((e) => e.tenant === tenantId)?.entry;
      window.config.configuration2D = window.config.tenantConfig.find((e) => e.tenant === tenantId)?.configuration2D;
    }
  } catch {}
};
export const PROJECT_ID_SESSION_KEY = "ue5-project-id";

/** 从 URL 读取 projectId 并写入 session，供登录后跳转 home 时复用 */
export const persistProjectIdFromQuery = (projectId?: string | null): string => {
  const normalized = projectId?.trim() ?? "";
  if (normalized) {
    sessionStorage.setItem(PROJECT_ID_SESSION_KEY, normalized);
    return normalized;
  }
  return "";
};

const getProjectId = (): string => {
  const fromUrl = persistProjectIdFromQuery(new URLSearchParams(window.location.search).get("projectId"));
  if (fromUrl) {
    return fromUrl;
  }
  return sessionStorage.getItem(PROJECT_ID_SESSION_KEY) ?? "";
};
/** 获取模型配置 */
const setModelConfig = async (): Promise<void> => {
  window.config.projectId = getProjectId();

  // 查询项目配置
  if (!window.config.projectId) {
    const projectList = await new CubeVisualizationService(resolveAuth()).getVisualProjectList();
    if (projectList.length) {
      window.config.projectId = projectList[0].id;
    } else {
      throw new Error("项目列表为空");
    }
  }
  await getModelConfig(window.config.projectId).then((res) => {
    if (res) {
      const modelConfiguration = JSON.parse(res.modelConfiguration);
      window.config.entry = modelConfiguration.entry || "views";
      window.config.systemName = modelConfiguration.title || "孪生可视化平台";
      // 二维背景图
      if (modelConfiguration?.scada?.background.length > 0) {
        window.config.bgImgData = {
          parkDay: modelConfiguration.scada.background.find((e) => e.area === "一级区域(白天图片)" || e.area[0] === "一级区域(白天图片)")
            ?.url as string,
          parkNight: modelConfiguration.scada.background.find((e) => e.area === "一级区域(夜晚图片)" || e.area[0] === "一级区域(夜晚图片)")
            ?.url as string,
          buildingDay: modelConfiguration.scada.background.find(
            (e) => e.area === "二级区域(白天图片)" || e.area[0] === "二级区域(白天图片)",
          )?.url as string,
          buildingNight: modelConfiguration.scada.background.find(
            (e) => e.area === "二级区域(夜晚图片)" || e.area[0] === "二级区域(夜晚图片)",
          )?.url as string,
        };
      }
      // 二维组态地址
      if (modelConfiguration?.scada?.url.length > 0) {
        window.config.configuration2D = {};
        modelConfiguration.scada.url.forEach((item) => {
          item.area = item.area.split("-");
          if (Array.isArray(item.area) && item.area[1]) {
            if (window.config.configuration2D[item.area[0]]) {
              if (window.config.configuration2D[item.area[0]][item.menu]) {
                window.config.configuration2D[item.area[0]][item.menu][item.area[1]] = item.url;
              } else {
                window.config.configuration2D[item.area[0]][item.menu] = {
                  [item.area[1]]: item.url,
                };
              }
            } else {
              window.config.configuration2D[item.area[0]] = {
                [item.menu]: {
                  [item.area[1]]: item.url,
                },
              };
            }
          }
        });
      }
      // 模型地址
      if (modelConfiguration?.ue5?.modelServer.length > 0) {
        window.config.modelPath = modelConfiguration.ue5.modelServer[0].url;
      }
      // 模型视角
      if (modelConfiguration?.ue5?.modelPerspective.length > 0) {
        window.config.modelPerspective = modelConfiguration.ue5.modelPerspective.map((item) => {
          return {
            ...item,
          };
        });
      }

      // 应用视角
      if (modelConfiguration?.ue5?.applicationPerspective && modelConfiguration?.ue5?.applicationPerspective.length > 0) {
        window.config.applicationPerspective = modelConfiguration.ue5.applicationPerspective.map((item) => {
          return {
            ...item,
          };
        });
      }
      // 建筑视角
      if (modelConfiguration?.ue5?.perspective.length > 0) {
        window.config.perspective = modelConfiguration.ue5.perspective.map((item) => {
          if (item?.buildTagLocation && typeof item.buildTagLocation === "string") {
            try {
              item.buildTagLocation = JSON.parse(item.buildTagLocation);
            } catch (error) {}
          }
          return {
            ...item,
          };
        });
      }
      // 漫游路线
      if (modelConfiguration?.ue5?.roamingRoute.length > 0) {
        window.config.roamingRoute = modelConfiguration.ue5.roamingRoute;
      }
      // 模型标签
      if (modelConfiguration?.ue5?.labelList && modelConfiguration?.ue5?.labelList.length > 0) {
        window.config.ueLabelList = modelConfiguration.ue5.labelList;
      }
      // 模型导览
      if (modelConfiguration?.ue5?.guideData) {
        window.config.guideData = modelConfiguration?.ue5?.guideData;
      }
      const defaultConfig = {
        iconScale: 1,
        isFilterArea: "hide",
        cardType: "classicsCard",
        navType: "classicsNav",
        deviceStyle: "pop",
      };
      const { ue5 = {} } = modelConfiguration || {};
      window.config.otherConfig = {
        iconScale: ue5.iconScale || defaultConfig.iconScale,
        isFilterArea: ue5.isFilterArea || defaultConfig.isFilterArea,
        cardType: ue5.cardType || defaultConfig.cardType,
        navType: ue5.navType || defaultConfig.navType,
        deviceStyle: ue5.deviceStyle || defaultConfig.deviceStyle,
        autoWeather: ue5.autoWeather || false,
        modelLocation: ue5.modelLocation || {},
      };

      ["views-three", "views-3d"].includes(window.config.entry) && handleWebGlConfig(modelConfiguration);
    }
  });
};
const handleWebGlConfig = (modelConfiguration): void => {
  const { three } = modelConfiguration;
  if (three) {
    const initThree = {
      scene: {
        background: {
          images: [],
          scale: 1,
        },
      },
    };
    window.config.perspective = three.perspective.map((item) => {
      return {
        area: item.area.replaceAll("/", "-"),
        camera: item.camera,
        hideActors: [],
        id: item.areaId,
      };
    });
    window.config.modelPath = three.modelServer[0].url;

    window.config.modelPerspective = three.modelPerspective;
    window.config.webglConfig = {
      ...three,
      scene: three.scene ? three.scene : initThree.scene,
    };
    // window.config.entry === 'views-3d' && (window.config.entry = 'views')
  }
};

export class ConfigLoader {
  public static config: any;
  public static async loadConfig(): Promise<void> {
    await initConfig();
    await setModelConfig();
    this.config = window.config;
    applySystemTitle(this.config.systemName);
    await statusInitialization();
  }

  public static getPerspectiveByName(name: string): any {
    return this.config.perspective.find((item) => item.area === name);
  }
}
