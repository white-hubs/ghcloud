import { onMounted } from "vue";

import { GHIotSocket } from "@ghcloud/cube-iot-socket";
import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";
import { CubeTerminalEnum } from "@ghcloud/cube-protocol";

import { iotSocketStore } from "@/visualization-core/stores/iotSocketStore";
import { useSubscribeStore } from "@/visualization-core/stores/socketSubscribe";

const piniaUseSubscribeStore = useSubscribeStore();
const piniaIot = iotSocketStore();
export const useIotSocket = () => {
  const authInfo = CubeMfRootGlobalState.getInstance().mfRootState.authInfo;
  const initWebSocket = (): void => {
    piniaIot.iotSocket = new GHIotSocket({
      accessToken: authInfo.token,
      tenant: authInfo.tenant,
      terminal: CubeTerminalEnum.VISUALIZATION,
    });
    piniaIot.iotSocket.onmessage(messageMsg);
  };
  const messageMsg = (message) => {
    switch (message.msgType) {
      case "WELCOME":
        break;
      case "SUBSCRIBE_PUSH":
        piniaUseSubscribeStore.subscribeData = JSON.parse(message.content).msg;
        break;
      default:
        return false;
    }
  };
  onMounted(() => {
    initWebSocket();
  });
};
