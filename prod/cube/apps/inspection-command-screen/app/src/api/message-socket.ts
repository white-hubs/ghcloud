import { GHMessage } from "@ghcloud/cube-message-sdk";
import { Constants, RTCCore } from "@ghcloud/cube-rtc";

import { authStore } from "./auth-store";

interface MessageContent {
  msgType: string;
  eventDataDTO?: unknown;
}

let wsMsg: GHMessage | null = null;
let initStatus = false;

const handleMessage = (message: MessageContent): void => {
  if (message.msgType !== "COMMUNICATE_MESSAGE" || !message.eventDataDTO) {
    return;
  }
  RTCCore.getInstance().notifyEvent(Constants.SOCKET_EVENT.SOCKET_COMMUNICATE_MESSAGE, message.eventDataDTO);
};

export const initCommunicationMessageSocket = (): void => {
  if (initStatus || !authStore.token || !authStore.tenant || !authStore.terminal) {
    return;
  }
  wsMsg?.dispose();
  wsMsg = new GHMessage({
    accessToken: authStore.token,
    tenant: authStore.tenant as unknown as number,
    terminal: authStore.terminal,
  });
  wsMsg.onmessage(handleMessage);
  initStatus = true;
};

export const closeCommunicationMessageSocket = (): void => {
  wsMsg?.dispose();
  wsMsg = null;
  initStatus = false;
};
