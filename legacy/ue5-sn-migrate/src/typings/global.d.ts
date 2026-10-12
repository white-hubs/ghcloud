declare interface ReturnFileType {
  businessKey: string | null;
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
}
/**
 * 面板位置参数
 */
declare type PanelPosition = "LEFT_PANEL" | "RIGHT_PANEL" | "CENTER";
/**
 * 后端返回分页接口类型
 */
declare interface ReturnPageType<T = any> {
  page: number;
  total: number;
  records: T[];
}

interface Perspective {
  location: { x: number | null; y: number | null; z: number | null };
  rotation: { x: number | null; y: number | null; z: number | null };
}

interface RoamingRoute {
  perspective: string;
  pointName: string;
  id: string;
}

interface RootObject {
  name: string;
  id: string;
  route: Route[];
}
declare interface Window {
  ueWebSocket: WebSocket;
  protocol: string;
  config: {
    panelTemplate: string;
    panelLoop: {
      loop: boolean;
      interval: number;
    };
    webglConfig: {
      modelPerspective: {
        id: string;
        label: string;
        isDefault?: string;
        value: string;
      }[];
      modelServer: {
        area: string[];
        name: string;
        url: string;
      }[];
      perspective: {
        id: string;
        area?: string;
        areaId?: string;
        camera?: string;
        isDefault?: string;
        value?: string;
        label?: string;
      }[];
      areaLabelList: {
        aliasName: string;
        areaId: string;
        areaName: string;
        labelConfig: {
          detail: string;
          interactive: string;
          image: string;
          labelColor: string;
          location: string;
          infoType: "default" | "custom";
          title: string;
          type: "textLabel" | "cardLabel";
        };
      }[];
      roamingRoute: {
        id: string;
        name: string;
        route: {
          area: string;
          id: string;
          name: string;
          perspective: string;
          pointName: string;
          sort: number;
          speed: number;
        }[];
      }[];
      scene: {
        background: {
          images: {
            area: { id: string; name: string; aliasName: string }[];
            id: string;
            url: string;
          }[];
          scale: number;
        };
      };
    };
    configuration2D: any;
    systemNameConfig: { tenant: number; value: string }[];
    systemName: string;
    ueClientWebSocket: string;
    connectLines: {
      /**
       * 启用状态，(false停用,true启用)
       */
      enabled: boolean;
      id: string;
      /**
       * 内网地址
       */
      intranetAddress: string;
      /**
       * 外网ip地址
       */
      ipAddress: string;
      /**
       * 线路名称
       */
      name: string;
      /**
       * 占用状态，(false空闲,true占用)
       */
      occupied: boolean;
      tenant: number;
    }[];
    pageLoopRequestTime: number;
    terminal: string;
    otherConfig: {
      iconScale: number;
      isFilterArea: string;
    };
    webSocketUrl: string;
    perspective: { area: string; camera: Perspective; hideActors: string[]; tenant: number }[];
    modelPerspective: { label: string; value: Perspective; tenant: number }[];
    csMode: boolean;
    entry: string;
    bgImgData: { parkDay: string; parkNight: string; buildingDay: string; buildingNight: string };
    tenantConfig: { csMode: boolean; tenant: number; entry: string; configuration2D: any; name?: string }[];
    roamingRoute: RoamingRoute;
    ueLabelList: any;
    systemStartTime: string;
    feature: any;
    guideData: any;
  };
}

// 区分页面来源
declare type FromPageType = "PARK" | "BUILD" | "FLOOR";

// 日期选择类型
declare type TimeType = "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR" | "PAST_YEAR";

export enum ApplicationCode {
  ELECTRICMANAGE = "ELECTRICMANAGE",
  FIRECONTROL = "FIRECONTROL",
  GAS_MANAGEMENT = "GAS_MANAGEMENT",
  SMALLENFINEERING = "SMALLENFINEERING",
}
