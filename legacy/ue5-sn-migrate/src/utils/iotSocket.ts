import { GHIotSocket } from '@ghcloud/cube-iot-socket'
import { getNowEnterprise, getToken } from './auth'
import { onMounted, onUnmounted } from 'vue'
import { iotSocketStore } from "@/piniaStore/iotSocketStore";
import { useSubscribeStore } from '@/piniaStore/socketSubscribe'

const piniaUseSubscribeStore = useSubscribeStore();
const piniaIot =  iotSocketStore()
export const useIotSocket = () => {
  const initWebSoket = (): void => {
    piniaIot.iotSocket = new GHIotSocket({
    accessToken: getToken().access_token,
    tenant: getNowEnterprise().code,
    terminal: (window as any).config.terminal
  })
  piniaIot.iotSocket.onmessage(messageMsg)
  }
  const messageMsg = (message) => {
    switch (message.msgType) {
      case "WELCOME":
        break
      case "SUBSCRIBE_PUSH":
        piniaUseSubscribeStore.subscribeData = JSON.parse(message.content).msg;
        break;
      default:
        return false;
    }
  };
  onMounted(() => {
    initWebSoket()
  })
}