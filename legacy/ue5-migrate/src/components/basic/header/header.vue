<template>
  <div class="header">
    <div class="left-container flex-start">
      <DateTime />
      <SwitchModelTime ref="SwitchModelTimeRef" />
      <template v-if="renderType !== '2D'">
        <SwitchModelWeather />
        <SwitchModelGlobalCameraView />
        <SwitchModelQuality v-if="renderType === 'UE5' && runtime !== 'ue-mode'" />
        <!--漫游-->
        <div class="model-roaming-option" v-if="roamingRoute.length > 0" v-show="tourStatus === '进入导览'">
          <a-dropdown :getPopupContainer="(triggerNode) => triggerNode.parentNode">
            <template #overlay>
              <div class="list">
                <div class="list-item flex-center" v-for="(item, index) in roamingRoute" :key="index" @click="changeRoaming(item)">
                  <span>{{ item.name }}</span>
                </div>
              </div>
            </template>
            <div class="btn flex-center">
              <span>{{ roamingSelect }}</span>
            </div>
          </a-dropdown>
        </div>
      </template>
    </div>

    <div class="center-container">
      <div class="center-container-box">
        <span>{{ state.systemName }}</span>
      </div>
    </div>

    <div class="right-container flex-end">
      <SwitchModelAlarm />
      <SwitchModelTourAround v-if="renderType !== '2D'" />
      <div class="business-name" @click="handleChangeDriverMode" v-if="renderType !== '2D' && tourStatus === '进入导览'">
        {{ globalState.driveMode ? "退出" : "进入" }}驾驶模式
      </div>
      <div class="business-name" @click="displayLabel" v-show="!globalState.driveMode">
        {{ LabelSelect === "开" ? "隐藏" : "显示" }}标签
      </div>
      <div class="business-name" @click="enterTourGuide" v-if="guideData?.guideList.length && !globalState.driveMode">{{ tourStatus }}</div>
      <!--UE CS 模式切换窗口-->
      <div class="model-camera-option" v-if="runtime === 'ue-mode'">
        <a-dropdown :getPopupContainer="(triggerNode) => triggerNode.parentNode">
          <template #overlay>
            <div class="list">
              <div class="list-item flex-center" v-for="(item, index) in resolvingPower" :key="index" @click="changeResolving(item)">
                <span>{{ item.label }}</span>
              </div>
            </div>
          </template>
          <div class="btn flex-center">
            <span>{{ resolvingSelect }}</span>
          </div>
        </a-dropdown>
      </div>
      <div class="business-name" @click="reload" v-if="renderType === 'UE5' && ['ue-mode', 'cube-app'].includes(runtime)">刷新</div>
      <SwitchFullscreen ref="SwitchFullscreenRef" v-else v-show="tourStatus === '进入导览'" />
      <SwitchMenuVisible v-show="tourStatus === '进入导览' && !globalState.driveMode" />
      <ChatAssistant v-if="aiAbilty" />
      <AlarmEntry />
    </div>
  </div>
  <UeModalControl v-if="globalState.driveMode" />
</template>
<script lang="ts" setup>
import { message } from "ant-design-vue";
import { onMounted, reactive, ref, computed, onBeforeUnmount } from "vue";
import { PropType } from "vue";

import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";
import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";
import { UeClient } from "@ghcloud/cube-visual-sdk";

import { commandMap } from "./chat-assistant/ai-command";
import ChatAssistant from "./chat-assistant/chat-assistant.vue";
import { getUserIP, modelWeather, weatherName, webGLWeather, keepModelLineAlive } from "./header";
import UeModalControl from "./ue-modal-control.vue";
import { getDynamicModelLine } from "@/api/dynamic-model-line";
import { getTenantDetails } from "@/api/ouaa";
import { eventInstance } from "@/pages/event/event";
import { useStateStore } from "@/pages/state/use-state-store";
import { AlarmEntry } from "@/pages/widget/title-bar/components/alarm-entry/alarm-entry";
import { DateTime } from "@/pages/widget/title-bar/components/date-time/date-time";
import { resolveRoamingRoute } from "@/pages/widget/title-bar/components/roaming-route/resolve-roaming-route";
import { SwitchDriveMode } from "@/pages/widget/title-bar/components/switch-drive-mode/switch-drive-mode";
import { SwitchFullscreen, toggleDocumentFullscreen } from "@/pages/widget/title-bar/components/switch-fullscreen/switch-fullscreen";
import { SwitchMenuVisible } from "@/pages/widget/title-bar/components/switch-menu-visible/switch-menu-visible";
import { SwitchModelAlarm } from "@/pages/widget/title-bar/components/switch-model-alarm/switch-model-alarm";
import { SwitchModelGlobalCameraView } from "@/pages/widget/title-bar/components/switch-model-global-camera-view/switch-model-global-camera-view";
import { resolveModelQualityOption } from "@/pages/widget/title-bar/components/switch-model-quality/model-quality";
import { SwitchModelQuality } from "@/pages/widget/title-bar/components/switch-model-quality/switch-model-quality";
import { modelTimeList } from "@/pages/widget/title-bar/components/switch-model-time/model-time";
import { SwitchModelTime } from "@/pages/widget/title-bar/components/switch-model-time/switch-model-time";
import { resolveTourAroundDesired } from "@/pages/widget/title-bar/components/switch-model-tour-around/resolve-tour-around";
import { SwitchModelTourAround } from "@/pages/widget/title-bar/components/switch-model-tour-around/switch-model-tour-around";
import { resolveModelWeatherOption } from "@/pages/widget/title-bar/components/switch-model-weather/model-weather";
import { SwitchModelWeather } from "@/pages/widget/title-bar/components/switch-model-weather/switch-model-weather";
import { storeMarket } from "@/piniaStore/other";
import bus from "@/utils/bus";
import { getAssetsImage } from "@/utils/getImage";
import { batchAddDeviceIcon } from "@/views/index";

const { globalState, renderType, runtime } = useStateStore();
const SwitchModelTimeRef = ref();
const SwitchFullscreenRef = ref();
const aiAbilty = ref(false);
const ueClient = UeClient.getInstance();
type Emit = {
  (e: "initCameraView", value: string): void;
  (e: "roamingEvent", value: { perspective: string; pointName: string } | boolean): void;
  (e: "displayLabel"): void;
  (e: "changWebGlRoam", value: { value: boolean; label: string }): void;
  (e: "tourStatus", value: boolean): void;
};
interface Option {
  label: string;
  value: string;
}

const piniaStoreMarket = storeMarket();
const cameraViews: Option[] = (window as any).config.modelPerspective;
const resolvingPower = [
  {
    label: "全屏",
    value: {
      width: "1920",
      height: "1080",
      mode: "f",
    },
  },
  {
    label: "窗口",
    value: {
      width: "1280",
      height: "720",
      mode: "w",
    },
  },
];

const emit = defineEmits<Emit>();
const props = defineProps({
  cameraOptions: {
    type: Array as PropType<Option[]>,
    default: () => [],
  },
});

const LabelSelect = ref("开");
const guideData = computed(() => {
  return window.config.guideData;
});

const displayLabel = () => {
  LabelSelect.value = LabelSelect.value === "开" ? "关" : "开";
  piniaStoreMarket.showLabel = LabelSelect.value;
  if (piniaStoreMarket.showLabel === "开") {
    batchAddDeviceIcon();
    emit("displayLabel");
  } else {
    ueClient.send("removePoiByType", { type: "all" });
  }
};

const state = reactive({
  systemName: (window as any).config.systemName,
});
document.title = state.systemName;

const roamingRoute = computed(() => {
  if (renderType === "WEBGL") {
    return window.config.webglConfig.roamingRoute || [];
  }
  return (window as any).config.roamingRoute || [];
});

const getAiAgent = async () => {
  const res = await new CubeDictionaryService().getSysDictionaryByCodeAndItemCode({
    itemCode: "AI_ABILTY",
    code: "AI_ABILTY",
  });
  if (res.variable === "true") {
    aiAbilty.value = true;
  }
};
onMounted(() => {
  getAiAgent();
});

onBeforeUnmount(() => {
  bus.off("cube-ai-command");
});

const reload = () => {
  window.location.reload();
};
/** 切换业务菜单显示隐藏 */
const toggleBusinessNav = () => {
  globalState.menuVisible = !globalState.menuVisible;
};

const resolvingSelect = ref("全屏");
const roamingSelect = ref("漫游路线");
const tourStatus = ref("进入导览");

const enterTourGuide = () => {
  if (tourStatus.value === "进入导览") {
    tourStatus.value = "退出导览";
    emit("tourStatus", true);
  } else {
    tourStatus.value = "进入导览";
    emit("tourStatus", false);
  }
};
const changeSelect = (option: Option) => {
  emit("initCameraView", option.value);
};
const changeResolving = (item) => {
  ueClient.send("changeResolution", {
    width: item.value.width,
    height: item.value.height,
    mode: item.value.mode,
  });
  resolvingSelect.value = item.label;
};
const changeRoaming = (item) => {
  if (item) {
    roamingSelect.value = item.name;
    emit("roamingEvent", item.route);
  } else {
    emit("roamingEvent", false);
  }
};
// 取消漫游
const resetRoaming = () => {
  roamingSelect.value = "漫游路线";
};
/** 设置第一个鸟瞰视角 */
const selectFirstCameraView = (): void => {
  changeSelect(cameraViews[0]);
};

// 切换驾驶模式
const handleChangeDriverMode = () => {
  globalState.driveMode = !globalState.driveMode;
  if (!globalState.driveMode) {
    selectFirstCameraView();
  }
  toggleBusinessNav();
  ueClient.send("changeTouchInterface", { active: globalState.driveMode });
};

/**
 * 在 setup 同步注册（不要只放 onMounted）：
 * Vite HMR 重载 ai-command / header 时 onMounted 不会重跑，会导致 handler 丢失。
 */
function registerAssistantCommands(): void {
  // params.value: true 开启 / false 关闭；缺省时按「开启」处理（避免已环游时再发开启被 flip 关掉）
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
  // 切换模型天气（Sunny 同时对应「自动」「晴」，须走 resolve，避免晴天误命中自动）
  commandMap.set("changeModelWeather", (data) => {
    const find = resolveModelWeatherOption(data);
    if (!find) {
      console.warn("[cube-ai-command] changeModelWeather unresolved", data);
      return false;
    }
    eventInstance.emitEvent("changeModelWeather", find);
    return true;
  });
  commandMap.set("changePerspectiveDefault", () => changeSelect(cameraViews[0])); // 切换到默认视角
  commandMap.set("changePerspectiveOverlook", () =>
    changeSelect(cameraViews.find((e) => e.label.includes("俯瞰") || e.label.includes("鸟瞰"))),
  ); // 切换到俯瞰视角
  commandMap.set("changeModelQuality", (data) => {
    const option = resolveModelQualityOption(data?.value ?? data);
    if (!option) {
      return false;
    }
    eventInstance.emitEvent("changeModelQuality", option);
    return true;
  });
  commandMap.set("toggleDriveMode", () => handleChangeDriverMode()); // 驾驶模式进入/退出
  // AI 异步回执无用户手势，requestFullscreen 会被浏览器拒绝；走带确认框的路径
  commandMap.set("toggleFullScreen", async () => {
    const api = SwitchFullscreenRef.value as
      | { handleFullScreenFromCommand?: () => Promise<boolean>; handleFullScreen?: () => Promise<boolean> }
      | undefined;
    if (api?.handleFullScreenFromCommand) {
      return api.handleFullScreenFromCommand();
    }
    if (api?.handleFullScreen) {
      return api.handleFullScreen();
    }
    // 组件未挂载（如 ue-mode 只显示刷新）时仍可走 document 全屏
    return toggleDocumentFullscreen({ allowPrompt: true });
  });
  commandMap.set("toggleBusinessMenu", () => toggleBusinessNav()); // 功能菜单显示、隐藏
  commandMap.set("toggleStartRoam", (value) => {
    const route = resolveRoamingRoute(roamingRoute.value, value?.value);
    if (!route) {
      return false;
    }
    changeRoaming(route);
    return true;
  });
  commandMap.set("toggleCloseRoam", () => {
    changeRoaming(false);
    return true;
  });
}
registerAssistantCommands();

/** 模型连接 */
const loadUE5Model = async (dom?: HTMLElement) => {
  let modelLine = window.config.modelPath;
  if (runtime === "ue-mode") {
    modelLine = "ws://localhost:8080";
  }
  // 都江堰动态获取线路
  // modelLine = await getDynamicModelLine()
  // if (!modelLine) {
  //     message.error('当前无空闲线路')
  //     return
  // }
  // keepModelLineAlive()

  ueClient.loadUE5(dom, modelLine);
};
defineExpose({
  loadUE5Model,
  selectFirstCameraView,
  resetRoaming,
});
</script>
<style lang="less" scoped>
.header {
  width: 100%;
  height: 64px;
  position: relative;
  background: linear-gradient(180deg, rgba(0, 53, 134, 0.6) 0%, rgba(0, 53, 134, 0) 100%);

  .center-container {
    width: 1294px;
    height: 90px;
    margin: 0 auto;
    background: url("/resource/v1/ue5-migrate/assets/images/title.png");
    text-align: center;
    background-position: 50% 50%;
    background-size: 100%;
    background-repeat: no-repeat;
    font-size: 30px;
    color: #ffffff;
    font-family: YouSheBiaoTiHei;
    padding-top: 4px;
    pointer-events: none; /* 让背景不拦截点击事件 */

    .center-container-box {
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto; /* 只有文字部分可以点击 */

      img {
        margin-right: 10px;
      }
    }
  }

  .left-container {
    position: absolute;
    top: 0;
    left: 0;
    height: 64px;
    font-size: 14px;
    color: #ffffff;
    padding-left: 20px;

    .weather {
      img {
        width: 30px;
        height: 30px;
      }
    }

    .line {
      height: 12px;
      width: 1px;
      background: #ffffff;
      margin: 0 14px;
    }

    .model-time-option,
    .model-camera-option {
      margin: 0 20px;
    }

    .model-roaming-option {
      margin-right: 20px;
    }

    .model-time-type {
      margin-left: 20px;
    }

    .btn {
      background: rgba(0, 0, 0, 0.3);
      padding: 4px 8px;
      border-radius: 6px 6px 6px 6px;
      cursor: pointer;
      user-select: none;

      img {
        width: 24px;
        height: 24px;
        margin-right: 6px;
      }

      &.camera-view {
        margin-left: 20px;
      }
    }

    .list {
      background: rgba(0, 0, 0, 0.3);

      &-item {
        color: #ffffff;
        height: 36px;
        min-width: 68px;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        img {
          width: 24px;
          height: 24px;
          margin-right: 6px;
        }
      }
    }

    .model {
      margin: 0 20px;

      :deep(.ant-radio-button-wrapper) {
        background: transparent;
        color: #ffffff;
        font-size: 14px;
        border: none;
        padding: 0;
      }
    }
  }

  .right-container {
    position: absolute;
    top: 0;
    right: 0;
    height: 64px;
    font-size: 14px;
    color: #ffffff;
    padding-right: 20px;
    display: flex;

    .btn {
      padding: 4px 8px;
      border-radius: 6px 6px 6px 6px;
      cursor: pointer;

      img {
        width: 24px;
        height: 24px;
        margin-right: 6px;
      }

      &.camera-view {
        margin-left: 20px;
      }
    }

    .list {
      background: rgba(0, 0, 0, 0.6);

      &-item {
        color: #ffffff;
        height: 36px;
        min-width: 68px;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        img {
          width: 24px;
          height: 24px;
          margin-right: 6px;
        }
      }
    }

    .model {
      margin: 0 20px;

      :deep(.ant-radio-button-wrapper) {
        background: transparent;
        color: #ffffff;
        font-size: 14px;
        border: none;
        padding: 0;
      }
    }

    .business-name,
    .user {
      padding: 0 10px;
      cursor: pointer;
      user-select: none;
    }

    .user img {
      height: 28px;
      width: 28px;
    }
  }
  .list-item-camera {
    span {
      max-width: 120px;
      padding: 0 2px;
      white-space: nowrap; /* 禁止换行 */
      overflow: hidden; /* 隐藏溢出部分 */
      text-overflow: ellipsis;
    }
  }
}
</style>
