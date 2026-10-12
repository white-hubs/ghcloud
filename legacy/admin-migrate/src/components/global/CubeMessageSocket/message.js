import { getToken } from "@/services/AccountService";
import { socketEmitter } from './socket-mitt'
import { GHMessage } from '@ghcloud/cube-message-sdk'

let wsMsg;

const messageMsg = (message) => {
  socketEmitter.emit('socket-message', message);
};
export const initWebSocket = async () => {
  const token = await getToken();
  const code = JSON.parse(sessionStorage.getItem("tenant")).code
  if (code === undefined) return;
  wsMsg && wsMsg.dispose()
  wsMsg = new GHMessage({
    accessToken: token.access_token,
    tenant: code,
    terminal: window.config.terminal
  })
  wsMsg.onmessage(messageMsg)
};

export const closeWebSocket = () => {
  wsMsg && wsMsg.dispose()
};
