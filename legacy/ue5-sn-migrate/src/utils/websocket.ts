import { useSubscribeStore } from "@/piniaStore/socketSubscribe";
import { getNowEnterprise, getToken } from "./auth";
import { onMounted, ref } from "vue";
import bus from "./bus";
import { GHMessage } from '@ghcloud/cube-message-sdk'
import { CubeAlarmModal } from '@ghcloud/cube-alarm-modal/src/register'
export const useWebSocket = (webSocketUrl?:string,subscribeType?:string) => {
  let cubeAlarmModal = null
  if (window.config.entry !== 'views-shengNong') {
     cubeAlarmModal = new CubeAlarmModal({
      entry: import.meta.env.MODE!=='prod' ? 'http://localhost:8888':null,  //调式的时候使用
    })
  }
  const lockReconnect = ref(false)
  let healthInterval;
  let ws;
  let wsMsg;
  const initWebSocket = (): void => {
    if(webSocketUrl){
      let url = `${webSocketUrl}?terminal=${(window as any).config.terminal}&token=${getToken().access_token}&tenant=${getNowEnterprise().code}`;
      if(document.location.protocol.includes('https')){
        url = url.replace('ws://','wss://')
      }
      ws = new WebSocket(url);
      ws.onopen = open;
      ws.onerror = error;
      ws.onclose = close;
      ws.onmessage = message;
    }
    // 消息2.0
    wsMsg && wsMsg.dispose()
    wsMsg = new GHMessage({
      accessToken: getToken().access_token,
      tenant: getNowEnterprise().code,
      terminal: (window as any).config.terminal,
      subscribeType
    })
    wsMsg.onmessage(messageMsg)
  };
  const open = (e: Event) => {
    clearInterval(healthInterval);
    // 定时器判断连接状态
    healthInterval = setInterval(() => {
      // 未连接
      if (ws.readyState === 3) {
        return;
      }
      const health = {
        msgType: "health",
        eventDataDTO: "ping",
      };
      ws.send(JSON.stringify(health));
    }, 1000 * 10);
  };
  const error = () => {
   };
  const close = (e) => {
    const CLOSE_NORMAL = 1000;
    if (e.code !== CLOSE_NORMAL) {
      reconnect();
    }
  };
  const piniaUseSubscribeStore = useSubscribeStore();

  const message = (e: MessageEvent) => {
    
    const message = JSON.parse(e.data);
    switch (message.msgType) {
      case "welcome":
        break
      case "DEVICE_ATTRIBUTE_CHANGE":
        piniaUseSubscribeStore.subscribeData = message.eventDataDTO.data;
        break;
      case "NOTICE_MESSAGE":
        if (message.eventDataDTO && message.eventDataDTO.data.msgType === "ALARM_NOTICE") {
          let bjMessage = JSON.parse(message.eventDataDTO.data.businessPrincipal);
          bus.emit("getEventVideoList", bjMessage);
        }
        break;
      default:
        return false;
    }
  };
  const messageMsg = (message) => {
    switch (message.msgType) {
      case "welcome":
        break
      case "DEVICE_ATTRIBUTE_CHANGE":
        piniaUseSubscribeStore.subscribeData = message.eventDataDTO.data;
        break;
      case "NOTICE_MESSAGE":
        if (message.eventDataDTO && message.eventDataDTO.data.msgType === "ALARM_NOTICE") {
          let bjMessage = JSON.parse(message.eventDataDTO.data.businessPrincipal);
          if (window.config.entry !== 'views-shengNong') {
            cubeAlarmModal.handelAlarmMessage(bjMessage)
          }
          bus.emit("getEventVideoList", bjMessage);
        }
        break;
      default:
        return false;
    }
  };
  /** 断线重连 */
  const reconnect = () => {
    if (lockReconnect.value) return;
    lockReconnect.value = true;
    setTimeout(function () {
      //没连接上会一直重连，设置延迟避免请求过多
      if (sessionStorage.getItem("GH-Token")) {
        initWebSocket();
      }
      lockReconnect.value = false;
    }, 5000);
  };
  onMounted(() => {    
    initWebSocket()
})
}