import { CubeAlarmCenterService } from "@ghcloud/cube-alarm-center-service";
import { CubeAlarmModal } from "@ghcloud/cube-alarm-modal/src/register";
import { CubeMessageCenterService } from "@ghcloud/cube-message-center-service";
import { GHMessage } from "@ghcloud/cube-message-sdk";
import type { CubeAuth } from "@ghcloud/cube-protocol";
import { Constants, RTCCore } from "@ghcloud/cube-rtc";

import { MFRootEventNameEnum, subscriber } from "../../../event";
import { useMfRootStore } from "../core";
import { privateEventMap } from "../event";

let wsMsg: GHMessage;
let initStatus = false;
export let cubeAlarmModal: CubeAlarmModal;

const LIANGCANG_TEMPERATURE_ALERT_POPUP = "LIANGCANG_TEMPERATURE_ALERT_POPUP";
const LIANGCANG_POPUP_CONTAINER_ID = "liangcang-temperature-alert-popup-container";
const LIANGCANG_POPUP_STYLE_ID = "liangcang-temperature-alert-popup-style";

interface LiangcangTemperatureAlertPopupMessage {
  alertRecordId?: number | string;
  warehouseId?: number | string;
  warehouseName?: string;
  grainType?: string;
  currentAvgTemperature?: number | string | null;
  warningThreshold?: number | string | null;
  distanceToThreshold?: number | string | null;
  triggeredAt?: string | number | null;
  message?: string;
}

interface NormalizedSocketData {
  msgType: string;
  data: Record<string, unknown> | null;
}

export const closeWebSocket = (): void => {
  wsMsg && wsMsg.dispose();
};

const formatNumberText = (value: unknown, suffix = ""): string => {
  if (value == null || value === "") {
    return "--";
  }
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return String(value);
  }
  return `${numericValue.toFixed(1)}${suffix}`;
};

const padTime = (value: number): string => String(value).padStart(2, "0");

const formatDateTimeText = (value: unknown): string => {
  if (value == null || value === "") {
    return "--";
  }
  const rawText = String(value).trim();
  const date = /^\d+$/.test(rawText)
    ? new Date(rawText.length === 10 ? Number(rawText) * 1000 : Number(rawText))
    : new Date(rawText.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) {
    return rawText;
  }
  return `${date.getFullYear()}-${padTime(date.getMonth() + 1)}-${padTime(date.getDate())} ${padTime(date.getHours())}:${padTime(date.getMinutes())}:${padTime(date.getSeconds())}`;
};

const parseBusinessPrincipal = (raw: unknown): LiangcangTemperatureAlertPopupMessage | null => {
  if (raw != null && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as LiangcangTemperatureAlertPopupMessage;
  }
  if (typeof raw !== "string" || raw.trim() === "") {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed != null && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as LiangcangTemperatureAlertPopupMessage;
    }
  } catch {
    return null;
  }
  return null;
};

const parseMaybeObject = (raw: unknown): Record<string, unknown> | null => {
  if (raw != null && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw !== "string" || raw.trim() === "") {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed != null && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
};

const normalizeSocketData = (message: { msgType?: string; eventDataDTO?: unknown }): NormalizedSocketData => {
  const eventData = parseMaybeObject(message.eventDataDTO);
  const rawData = parseMaybeObject(eventData?.data) ?? parseMaybeObject(eventData);
  const nestedEventData = parseMaybeObject(rawData?.eventDataDTO);
  const nestedData = parseMaybeObject(nestedEventData?.data) ?? rawData;
  const nestedEvent = typeof nestedEventData?.event === "string" ? nestedEventData.event : "";
  const event = typeof eventData?.event === "string" ? eventData.event : nestedEvent;
  const dataMsgType = typeof nestedData?.msgType === "string" ? nestedData.msgType : "";
  const messageMsgType = typeof message.msgType === "string" ? message.msgType : "";

  return {
    msgType: dataMsgType || event || messageMsgType,
    data: nestedData,
  };
};

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replaceAll(/&/g, "&amp;")
    .replaceAll(/</g, "&lt;")
    .replaceAll(/>/g, "&gt;")
    .replaceAll(/"/g, "&quot;")
    .replaceAll(/'/g, "&#39;");

const ensureLiangcangPopupAssets = (): HTMLElement => {
  let style = document.querySelector(`#${LIANGCANG_POPUP_STYLE_ID}`);
  if (style == null) {
    style = document.createElement("style");
    style.id = LIANGCANG_POPUP_STYLE_ID;
    style.textContent = `
      #${LIANGCANG_POPUP_CONTAINER_ID} {
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 10000;
        display: flex;
        flex-direction: column-reverse;
        gap: 10px;
        width: 360px;
        pointer-events: none;
      }
      .liangcang-temperature-alert-popup {
        overflow: hidden;
        border: 1px solid #ffccc7;
        border-radius: 6px;
        background: #fff;
        box-shadow: 0 8px 24px rgba(29, 33, 41, 0.16);
        color: #1d2129;
        font-size: 13px;
        pointer-events: auto;
      }
      .liangcang-temperature-alert-popup__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border-bottom: 1px solid #fff1f0;
        background: #fff7f6;
        color: #cf1322;
      }
      .liangcang-temperature-alert-popup__head strong {
        font-size: 14px;
      }
      .liangcang-temperature-alert-popup__close {
        border: 0;
        background: transparent;
        color: #86909c;
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
      }
      .liangcang-temperature-alert-popup__body {
        padding: 10px 12px 8px;
        line-height: 1.65;
      }
      .liangcang-temperature-alert-popup__message {
        margin-bottom: 8px;
      }
      .liangcang-temperature-alert-popup__grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px 12px;
        color: #4e5969;
      }
      .liangcang-temperature-alert-popup__grid span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .liangcang-temperature-alert-popup__grid-time {
        grid-column: 1 / -1;
        overflow: visible !important;
        text-overflow: clip !important;
      }
      .liangcang-temperature-alert-popup__footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 0 12px 12px;
      }
      .liangcang-temperature-alert-popup__button {
        height: 28px;
        padding: 0 12px;
        border: 1px solid #d9e2ef;
        border-radius: 4px;
        background: #fff;
        color: #1d2129;
        cursor: pointer;
      }
      .liangcang-temperature-alert-popup__button--primary {
        border-color: #1677ff;
        background: #1677ff;
        color: #fff;
      }
    `;
    document.head.append(style);
  }
  let container = document.querySelector(`#${LIANGCANG_POPUP_CONTAINER_ID}`);
  if (container == null) {
    container = document.createElement("div");
    container.id = LIANGCANG_POPUP_CONTAINER_ID;
    document.body.append(container);
  }
  return container;
};

const showLiangcangTemperatureAlertPopup = (popup: LiangcangTemperatureAlertPopupMessage): void => {
  const container = ensureLiangcangPopupAssets();
  const popupElement = document.createElement("div");
  popupElement.className = "liangcang-temperature-alert-popup";

  const close = (): void => {
    popupElement.remove();
  };
  const messageText = popup.message || `温度持续上升，距阈值 ${formatNumberText(popup.distanceToThreshold, "℃")}，请及时处置`;
  const warehouseNameText = popup.warehouseName || "--";
  const grainTypeText = popup.grainType || "--";

  popupElement.innerHTML = `
    <div class="liangcang-temperature-alert-popup__head">
      <strong>温度趋势预警</strong>
      <button class="liangcang-temperature-alert-popup__close" type="button">×</button>
    </div>
    <div class="liangcang-temperature-alert-popup__body">
      <div class="liangcang-temperature-alert-popup__message">${escapeHtml(messageText)}</div>
      <div class="liangcang-temperature-alert-popup__grid">
        <span title="${escapeHtml(warehouseNameText)}">仓房：${escapeHtml(warehouseNameText)}</span>
        <span title="${escapeHtml(grainTypeText)}">品种：${escapeHtml(grainTypeText)}</span>
        <span>当前温度：${escapeHtml(formatNumberText(popup.currentAvgTemperature, "℃"))}</span>
        <span>预警阈值：${escapeHtml(formatNumberText(popup.warningThreshold, "℃"))}</span>
        <span>距离阈值：${escapeHtml(formatNumberText(popup.distanceToThreshold, "℃"))}</span>
        <span class="liangcang-temperature-alert-popup__grid-time">触发时间：${escapeHtml(formatDateTimeText(popup.triggeredAt))}</span>
      </div>
    </div>
    <div class="liangcang-temperature-alert-popup__footer">
      <button class="liangcang-temperature-alert-popup__button" type="button" data-action="close">知道了</button>
    </div>
  `;
  popupElement.querySelector(".liangcang-temperature-alert-popup__close")?.addEventListener("click", close);
  popupElement.querySelector('[data-action="close"]')?.addEventListener("click", close);
  container.append(popupElement);
  window.setTimeout(() => {
    if (popupElement.parentElement != null) {
      popupElement.remove();
    }
  }, 30_000);
};

const handleSocketMessage = async (message: { msgType: string; eventDataDTO: { data: any } }): Promise<void> => {
  const store = useMfRootStore();

  const { msgType } = message;
  ["welcome", "health"].includes(msgType) && getMsgUnReadNum();
  if (!message.eventDataDTO) {
    return;
  }
  const normalizedMessage = normalizeSocketData(message);
  const msgData = normalizedMessage.data ?? message.eventDataDTO.data;
  if (normalizedMessage.msgType === LIANGCANG_TEMPERATURE_ALERT_POPUP) {
    const popupMessage = parseBusinessPrincipal(normalizedMessage.data?.businessPrincipal ?? normalizedMessage.data);
    if (popupMessage != null) {
      showLiangcangTemperatureAlertPopup(popupMessage);
      return;
    }
  }
  if (msgType === "NOTICE_MESSAGE" || normalizedMessage.msgType === "ALARM_NOTICE") {
    if (msgData.msgType === "ALARM_NOTICE" && msgData.businessPrincipal) {
      const alarmMessage = JSON.parse(msgData.businessPrincipal);
      privateEventMap.get("alarmNotice")?.(alarmMessage);
      if (alarmMessage.marketTenant) {
        privateEventMap.get("headquartersAlarm")?.(msgData);
        return;
      }

      const authInfo = store.authInfo as CubeAuth;
      if (localStorage.getItem("modelAlarmStatus") && authInfo.terminal === "three-dimensional-visualization") {
        return;
      }
      if (!cubeAlarmModal) {
        return;
      }
      cubeAlarmModal.handelAlarmMessage(alarmMessage);
      new CubeAlarmCenterService(store.authInfo as CubeAuth)
        .getAlarmDetails(alarmMessage.businessKey || alarmMessage.id)
        .then((result) => {
          Object.assign(alarmMessage, result);
          alarmMessage.alarmSnapshot = result.alarmSnapshot ? result.alarmSnapshot : (alarmMessage.alarmSnapshot ?? "");
        })
        .catch(() => {
          alarmMessage.alarmSnapshot = alarmMessage.alarmSnapshot ?? "";
        });
    } else if (msgData.msgType === LIANGCANG_TEMPERATURE_ALERT_POPUP && msgData.businessPrincipal) {
      const popupMessage = parseBusinessPrincipal(msgData.businessPrincipal);
      if (popupMessage != null) {
        showLiangcangTemperatureAlertPopup(popupMessage);
      }
    } else if (["ACCOUNT_DISABLE_MESSAGE", "ACCOUNT_PASSWORD_UPDATE"].includes(msgData)) {
      privateEventMap.get("notifyError")?.(msgData === "ACCOUNT_DISABLE_MESSAGE" ? "账号已禁用，即将退出" : "账号密码已修改，即将退出");
      setTimeout(() => {
        privateEventMap.get("logout")?.();
      }, 1800);
    } else {
      privateEventMap.get("notifyTerminalMessage")?.(msgData);
    }
  } else if (msgType === "AUTHORITY_REFRESH_MESSAGE") {
    privateEventMap.get("notifyError")?.("当前账号权限变更，即将刷新");
    privateEventMap.get("reload")?.();
  } else if (msgType === "REMOTE_LOGIN_MESSAGE") {
    // @ts-expect-error
    window.fetch = async (): Promise<void> => {};
    // @ts-expect-error
    window.XMLHttpRequest = function XMLHttpRequest(): void {};

    if (store.jti && msgData.includes(store.jti)) {
      privateEventMap.get("notifyError")?.("当前账号已在其他设备登录，请重新登录");
      setTimeout(() => {
        privateEventMap.get("logout")?.();
      }, 1800);
    }
  } else if (msgType === "COMMUNICATE_MESSAGE") {
    RTCCore.getInstance().notifyEvent(Constants.SOCKET_EVENT.SOCKET_COMMUNICATE_MESSAGE, message.eventDataDTO);
  }
};

/** 消息 socket 初始化 */
export async function initMessageSocket(options: { subscribeType: string | undefined }): Promise<void> {
  const store = useMfRootStore();

  if (initStatus || !store.authInfo) {
    return;
  }

  // 初始化报警弹窗
  cubeAlarmModal = new CubeAlarmModal({
    // entry: 'http://localhost:8888/apps/@ghcloud/cube-alarm-modal'
  });
  cubeAlarmModal.onModalReady(() => {
    privateEventMap.get("alarmModalReady")?.(cubeAlarmModal);
  });

  wsMsg && wsMsg.dispose();
  wsMsg = new GHMessage({
    accessToken: store.authInfo.token,
    // @ts-expect-error
    tenant: store.authInfo.tenant,
    terminal: store.authInfo.terminal,
    subscribeType: options.subscribeType ?? "broadcast",
  });
  // @ts-expect-error
  wsMsg.onmessage(handleSocketMessage);
  initStatus = true;
  getMsgUnReadNum();
  subscriber.subscribe(MFRootEventNameEnum.MF_ROOT_MESSAGE_COUNT, getMsgUnReadNum);
}

export async function getMsgUnReadNum(): Promise<void> {
  const store = useMfRootStore();
  if (!store.authInfo) {
    return;
  }
  store.unReadMessageNum = await new CubeMessageCenterService(store.authInfo).getUnReadMsgNum();
}

export async function messageRead(id: string): Promise<void> {
  const store = useMfRootStore();
  if (!store.authInfo) {
    return;
  }
  await new CubeMessageCenterService(store.authInfo).readBatchMessage([id]);
}
