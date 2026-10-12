import { ConfigLoader } from "@/application/config/config-loader";
import { resolveRoamingRoute } from "@/features/widgets/title-bar/components/roaming-route/resolve-roaming-route";
import { toggleDocumentFullscreen } from "@/features/widgets/title-bar/components/switch-fullscreen/switch-fullscreen";
import { resolveModelQualityOption } from "@/features/widgets/title-bar/components/switch-model-quality/model-quality";
import { modelTimeList } from "@/features/widgets/title-bar/components/switch-model-time/model-time";
import { resolveTourAroundDesired } from "@/features/widgets/title-bar/components/switch-model-tour-around/resolve-tour-around";
import { resolveModelWeatherOption } from "@/features/widgets/title-bar/components/switch-model-weather/model-weather";
import { commandMap } from "@/visualization-core/ai/ai-command";
import { eventInstance } from "@/visualization-core/event/event";
import { storeHead } from "@/visualization-core/stores/use-state-head";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

let registered = false;

function getRoamingRoutes() {
  if (useStateStore().renderType === "WEBGL") {
    return window.config.webglConfig?.roamingRoute ?? [];
  }
  return window.config.roamingRoute ?? [];
}

/**
 * 标题栏相关 AI 指令（同步注册，避免 HMR 后 handler 丢失）
 */
export function registerTitleBarAiCommands(): void {
  if (registered) {
    return;
  }
  registered = true;

  const { globalState } = useStateStore();

  commandMap.set("toggleRevolve", (data) => {
    const desired = resolveTourAroundDesired(data);
    eventInstance.emitEvent("changeModelTourAroundStatus", desired);
    return true;
  });

  commandMap.set("changeModelTime", (data) => {
    const raw = data?.value;
    const find = modelTimeList.find((e) => e.value === raw || e.commandValue === raw);
    if (!find) {
      return false;
    }
    eventInstance.emitEvent("changeModelTime", find);
    return true;
  });

  commandMap.set("changeModelWeather", (data) => {
    const find = resolveModelWeatherOption(data);
    if (!find) {
      console.warn("[cube-ai-command] changeModelWeather unresolved", data);
      return false;
    }
    eventInstance.emitEvent("changeModelWeather", find);
    return true;
  });

  commandMap.set("changePerspectiveDefault", () => {
    eventInstance.emitEvent("setFirstPerspective", 0);
    return true;
  });

  commandMap.set("changePerspectiveOverlook", () => {
    eventInstance.emitEvent("setBirdViewPerspective");
    return true;
  });

  commandMap.set("changeModelQuality", (data) => {
    const option = resolveModelQualityOption(data?.value ?? data);
    if (!option) {
      return false;
    }
    eventInstance.emitEvent("changeModelQuality", option);
    return true;
  });

  commandMap.set("toggleDriveMode", () => {
    globalState.driveMode = !globalState.driveMode;
    if (!globalState.driveMode) {
      eventInstance.emitEvent("setFirstPerspective", 0);
    }
    globalState.menuVisible = !globalState.menuVisible;
    eventInstance.emitEvent("changeTouchInterface", globalState.driveMode);
    return true;
  });

  commandMap.set("toggleFullScreen", async () => {
    return toggleDocumentFullscreen({ allowPrompt: true });
  });

  commandMap.set("toggleBusinessMenu", () => {
    globalState.menuVisible = !globalState.menuVisible;
    return true;
  });

  commandMap.set("toggleStartRoam", (value) => {
    const route = resolveRoamingRoute(getRoamingRoutes(), value?.value ?? value);
    if (!route) {
      return false;
    }
    eventInstance.emitEvent("startRoaming", route.route ?? route);
    return true;
  });

  commandMap.set("toggleCloseRoam", () => {
    storeHead().requestCloseRoaming();
    return true;
  });
}

registerTitleBarAiCommands();
