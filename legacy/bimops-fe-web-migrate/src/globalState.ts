import { Button, message, notification } from "ant-design-vue";
import { h } from "vue";

import { CubeAuthService } from "@ghcloud/cube-auth-service";
import { initAliasManagePluginAuth, getAliasConfigForTerminal } from "@ghcloud/cube-business-alias-manage-plugin";
import { CubeMfRootGlobalState, MFRootEventNameEnum, publisher } from "@ghcloud/cube-mf-root";
import type { UserInfo } from "@ghcloud/cube-ouaa-service";
import { CubeTerminalEnum } from "@ghcloud/cube-protocol";
import { CallManager } from "@ghcloud/cube-rtc";
import { CallState } from "@ghcloud/cube-rtc/src/call/call-state";
import { unMountCallInterfaceForApp } from "@ghcloud/desktop-client-ui/src/components/calling-interface-for-web/create-calling-interface";
import {
  createCallNotifyForWebApp,
  unMountCallNotifyForApp,
} from "@ghcloud/desktop-client-ui/src/components/calling-notify-for-web/create-call-notify";

import { useCommunication } from "./hooks/use-communication";
import request from "./utils/request";

const { createCallInterface } = useCommunication();

const DRONE_TERMINAL_CODE = "three-party-twinning-dron";
const DRONE_MESSAGE_KEYWORDS = ["无人机", "dron", "空地联动"];
const DRONE_NOTIFICATION_CLASS = "drone-terminal-notification";
const DRONE_NOTIFICATION_PREFIX_CLS = "drone-terminal-ant-notification";
const DRONE_NOTIFICATION_ROOT_ID = "drone-terminal-notification-root";

type AliasParams = Record<string, unknown>;

type TerminalAlias = {
  path?: unknown;
  url?: unknown;
  params?: unknown;
};

type TerminalAliasConfig = {
  code?: string;
  alias?: TerminalAlias;
};

let droneTerminalAliasCache: TerminalAlias | null = null;

const normalizeAliasParams = (rawParams: unknown): AliasParams => {
  if (rawParams === null || rawParams === undefined || rawParams === "" || rawParams === "null") {
    return {};
  }
  if (typeof rawParams === "object" && !Array.isArray(rawParams)) {
    return rawParams as AliasParams;
  }
  if (typeof rawParams !== "string") {
    return {};
  }
  try {
    const parsed = JSON.parse(rawParams) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as AliasParams;
    }
    return {};
  } catch (_ignore) {
    return {};
  }
};

const normalizeText = (value: unknown): string => {
  return typeof value === "string" ? value.trim() : "";
};

const resolveAliasPath = async (alias: TerminalAlias = {}): Promise<string> => {
  const path = normalizeText(alias.path);
  if (path) {
    return path;
  }
  const url = normalizeText(alias.url);
  if (!url) {
    message.warning("未配置可跳转地址");
    return "";
  }
  try {
    const resolvedPath = (await request({
      url,
      method: "get",
      params: normalizeAliasParams(alias.params),
    })) as unknown;
    if (typeof resolvedPath === "string" && resolvedPath.trim()) {
      return resolvedPath.trim();
    }
    message.error("获取跳转地址失败");
    return "";
  } catch (_ignore) {
    message.error("获取跳转地址失败");
    return "";
  }
};

const getShortSecret = async (cubeMfRootGlobalState: CubeMfRootGlobalState, code = "bimops-manage-web"): Promise<string> => {
  message.loading("正在获取授权");
  const authService = new CubeAuthService(
    code,
    cubeMfRootGlobalState.mfRootState.authInfo.tenant,
    cubeMfRootGlobalState.mfRootState.authInfo.token,
  );
  message.destroy();
  return await authService.getSecretByToken();
};

const openUrlInNewWindow = (url: string, params: Record<string, string> = {}): void => {
  const urlObj = new URL(url, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });
  window.open(urlObj.toString());
};

const getDroneTerminalAlias = async (cubeMfRootGlobalState: CubeMfRootGlobalState): Promise<TerminalAlias | null> => {
  if (droneTerminalAliasCache) {
    return droneTerminalAliasCache;
  }
  initAliasManagePluginAuth({
    token: cubeMfRootGlobalState.mfRootState.authInfo.token,
    tenant: cubeMfRootGlobalState.mfRootState.authInfo.tenant,
  });
  const aliasOrigin = (await getAliasConfigForTerminal()) as unknown;
  if (!Array.isArray(aliasOrigin)) {
    message.error("获取无人机平台配置失败");
    return null;
  }
  droneTerminalAliasCache = aliasOrigin.find((item) => item.code === DRONE_TERMINAL_CODE)?.alias ?? null;
  if (!droneTerminalAliasCache) {
    message.warning("未配置无人机平台跳转地址");
  }
  return droneTerminalAliasCache;
};

const openDroneTerminal = async (cubeMfRootGlobalState: CubeMfRootGlobalState): Promise<boolean> => {
  const alias = await getDroneTerminalAlias(cubeMfRootGlobalState);
  if (!alias) {
    return false;
  }
  const finalPath = await resolveAliasPath(alias);
  if (!finalPath) {
    return false;
  }
  if (finalPath.startsWith("/apps/@ghcloud") || finalPath.startsWith("/apps-legacy")) {
    const cubeSecret = await getShortSecret(cubeMfRootGlobalState);
    openUrlInNewWindow(finalPath, { "cube-secret": cubeSecret });
    return true;
  }
  openUrlInNewWindow(finalPath);
  return true;
};

const isDroneTerminalMessage = (data: Record<string, unknown>): boolean => {
  const fields = [data.applicationCode, data.applicationName, data.code, data.terminalCode, data.appCode, data.msgContent];
  return fields.some((value) => {
    const text = normalizeText(value).toLowerCase();
    return DRONE_MESSAGE_KEYWORDS.some((keyword) => text.includes(keyword));
  });
};

const getDroneNotificationContainer = (): HTMLElement => {
  const existContainer = document.getElementById(DRONE_NOTIFICATION_ROOT_ID);
  if (existContainer) {
    return existContainer;
  }
  const container = document.createElement("div");
  container.id = DRONE_NOTIFICATION_ROOT_ID;
  document.body.appendChild(container);
  return container;
};

export const initGlobalState = async (): Promise<void> => {
  const cubeMfRootGlobalState = CubeMfRootGlobalState.getInstance({
    terminal: CubeTerminalEnum.BUSINESS,
  });
  cubeMfRootGlobalState.onError((errorMsg) => {
    message.error(errorMsg);
  });
  cubeMfRootGlobalState.onLogout(() => {
    sessionStorage.clear();
    window.location.href = "/login";
  });
  cubeMfRootGlobalState.onReload(() => {
    window.location.href = "/";
  });
  cubeMfRootGlobalState.onTerminalMessage((data: any) => {
    const key = `open${Date.now()}`;
    const msgContent = `${data.msgContent}`;
    const isDroneMessage = isDroneTerminalMessage(data);
    const linkageNoticeStyle = msgContent.includes("空地联动成功")
      ? { backgroundColor: "#23c993", color: "#fff" }
      : msgContent.includes("空地联动失败")
        ? { backgroundColor: "#ff493f", color: "#fff" }
        : undefined;
    const titleStyle = linkageNoticeStyle ? { color: "#fff", fontSize: "16px", fontWeight: 500 } : undefined;
    const descriptionStyle = linkageNoticeStyle ? { color: "#fff", fontSize: "34px", fontWeight: 600, lineHeight: "42px" } : undefined;
    const markRead = (): void => {
      cubeMfRootGlobalState.checkedMessageRead(data.id);
      notification.close(key);
    };
    const descriptionNode = isDroneMessage
      ? h(
          "div",
          {
            style: {
              ...(descriptionStyle ?? {}),
              cursor: "pointer",
            },
            title: "点击跳转无人机平台",
            onClick: async (event: MouseEvent) => {
              event.stopPropagation();
              if (await openDroneTerminal(cubeMfRootGlobalState)) {
                markRead();
              }
            },
          },
          msgContent,
        )
      : linkageNoticeStyle
        ? h("div", { style: descriptionStyle }, msgContent)
        : msgContent;
    notification.open({
      message: linkageNoticeStyle ? h("span", { style: titleStyle }, data.applicationName) : data.applicationName,
      description: descriptionNode,
      btn: h("div", { style: { display: "flex", gap: "8px", justifyContent: "flex-end" } }, [
        h(
          Button,
          {
            type: "primary",
            size: "small",
            onClick: (event: MouseEvent) => {
              event.stopPropagation();
              markRead();
            },
          },
          "已读",
        ),
      ]),
      key,
      class: isDroneMessage ? DRONE_NOTIFICATION_CLASS : undefined,
      prefixCls: isDroneMessage ? DRONE_NOTIFICATION_PREFIX_CLS : undefined,
      getContainer: isDroneMessage ? getDroneNotificationContainer : undefined,
      duration: linkageNoticeStyle ? 8 : 4.5,
      placement: "bottomRight",
      style: linkageNoticeStyle,
    });
  });
  cubeMfRootGlobalState.onRtcCallReceived((callUser: UserInfo) => {
    const callState = CallState.getInstance();
    const callManager = CallManager.getInstance();
    createCallNotifyForWebApp({
      avatar: callUser.fileVO?.path ?? "",
      name: callUser.name,
      type: callState.mediaType,
      onHangup() {
        callManager.reject();
      },
      onPickup() {
        createCallInterface(callUser);
        callManager.accept();
      },
    });
  });
  cubeMfRootGlobalState.onRtcCallEnd(() => {
    unMountCallNotifyForApp();
    unMountCallInterfaceForApp();
  });
  cubeMfRootGlobalState.onAlarmModalReady((cubeAlarmModal) => {
    cubeAlarmModal.onClickDetail((data) => {
      cubeAlarmModal.close();
      const { applicationCode, alarmTargetKey, businessKey, id } = data as {
        applicationCode: string;
        alarmTargetKey: string;
        businessKey: string;
        id: string;
      };

      const getPathParamsStr = (params: Record<string, string>): string => {
        return Object.keys(params)
          .reduce((pre, key) => {
            return pre + `${key}=${params[key]}&`;
          }, "?")
          .slice(0, -1);
      };
      const query = {
        businessKey,
        type: "detail",
        deviceId: alarmTargetKey,
        id,
      };
      const params = getPathParamsStr(query);
      const target = `/portal/genericEquipmentMonitor/alarmDetail${params} `;
      publisher.publish(MFRootEventNameEnum.MF_ROOT_TO_APPLICATION, { code: applicationCode, path: target });
    });
  });

  await cubeMfRootGlobalState.initGlobalState();
};
