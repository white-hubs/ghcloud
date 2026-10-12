const chengPng = "/resource/v1/alarm-center/cheng.png";
const emptyPng = "/resource/v1/alarm-center/empty.png";
const hongPng = "/resource/v1/alarm-center/hong.png";
const huangPng = "/resource/v1/alarm-center/huang.png";
const lanPng = "/resource/v1/alarm-center/lan.png";
import { CloseOutlined, FullscreenOutlined, FullscreenExitOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, reactive, watch } from "vue";

import { CubeAlarmCenterService } from "@ghcloud/cube-alarm-center-service";
import type { AlarmLevelPlayConfigVO } from "@ghcloud/cube-alarm-center-service/src/types/alarm-center";
import { CubeLinkageService } from "@ghcloud/cube-linkage-service";
import { CubePlayer } from "@ghcloud/cube-player";
import { themeManager, antd3LegacyThemeManager } from "@ghcloud/cube-theme";
import { Tag, Tooltip, Tabs, Button, Space, TabPane } from "@ghcloud/cube-ui";

import { authStore } from "@/api/auth-store";

import styles from "./alarm-modal.module.less";

/** 告警提示音（MinIO） */
const AlarmAudio = "/resource/v1/alarm-center/alarm-audio.mp3";
import { CubeDeviceCenterService } from "@ghcloud/cube-iot-center-service";
import { CubeMessageEvent } from "@ghcloud/cube-protocol";

import { AlarmChartComponent } from "./components/alarm-chart-components";
import { LazyVideoPlayer, resetLazyVideoStreamSlots } from "./components/lazy-video-player";

interface AlarmModalItem {
  id?: string | number;
  alarmRecordId?: string | number;
  alarmTargetKey?: string;
  alarmSnapshot?: string | Record<string, unknown>;
  businessKey: string;
  alarmTypeName: string;
  alarmLevelName: string;
  alarmLevelCode: string;
  applicationName: string;
  alarmTypeCode: string;
  applicationCode: string;
  alarmEventTypeName: string;
  alarmEventName: string;
  alarmTime: string;
  alarmTargetName: string;
  areaName: string;
  marketTenant: string;
  marketName: string;
  alarmStatus?: string;
  businessStatus?: string;
  videoList: {
    deviceId: string;
    deviceName: string;
    token: string;
  }[];
  msgContent?: string;
  turnWarningSound?: boolean;
}

const COMMAND_DISPATCH_PATH_PREFIXES = [
  "/command-dispatch-changsha",
  "/command-dispatch-huawei",
  "/command-dispatch-pt",
  "/command-dispatch-putian",
  "/command-dispatch",
] as const;

function normalizePathname(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, "");
  return normalized || "/";
}

function isCommandDispatchHost(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return COMMAND_DISPATCH_PATH_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
}

function shouldEnableDetailButtonByHost(): boolean {
  try {
    const { pathname, hostname } = window.parent.location;
    if (isCommandDispatchHost(pathname)) {
      return false;
    }
    if (hostname === "sn-hq.guhecloud.cn") {
      return false;
    }
  } catch {
    return true;
  }
  return true;
}

const MAX_ALARM_QUEUE = 50;
const MAX_GRID_VIDEOS = 9;

export const AlarmModal = defineComponent({
  emits: ["close", "handleMore"],
  setup: () => {
    const showGridVideo = ref(true);
    const activeVideoTabKey = ref("");
    const showDetailButton = ref(false);
    const showDeviceLocateButton = ref(false);
    const alarmItems = ref<AlarmModalItem[]>([]);
    const currentAlarmIndex = ref(0);
    const videoErrorMap = reactive<Record<string, boolean>>({});
    const state = reactive<{ alarmSnapshotDetail: Record<string, string>[]; activeKey: string }>({
      alarmSnapshotDetail: [],
      activeKey: "",
    });
    const alarmLevelPlayConfig = ref<AlarmLevelPlayConfigVO>();
    const alarmLevelAudio = ref("");
    const playCount = ref(0);
    const getClass = (status: string): string => {
      if (status === "一级") {
        return "red";
      } else if (status === "二级") {
        return "yellow";
      } else if (status === "三级") {
        return "orange";
      }
      return "blue";
    };
    const getImg = (status: string): string => {
      if (status === "一级") {
        return hongPng;
      } else if (status === "二级") {
        return chengPng;
      } else if (status === "三级") {
        return huangPng;
      }
      return lanPng;
    };
    const isFull = ref(false);
    // 视频全屏
    const fullScreenVideo = (event: MouseEvent): void => {
      const target = event.currentTarget as HTMLElement;
      const element = target.closest(`.${styles["alarm-video-container-box"]}, .${styles["grid-item"]}`) as HTMLElement;
      if (element) {
        if (element.requestFullscreen) {
          element.requestFullscreen();
          isFull.value = true;
        }
      }
    };
    const exitFullScreen = (): void => {
      document.exitFullscreen();
      isFull.value = false;
    };

    const alarmStatusTimers = new Map<string, ReturnType<typeof setInterval>>();
    let snapshotRequestId = 0;
    const alarmMessageQueue: Record<string, unknown>[] = [];
    let drainingAlarmQueue = false;

    const clearAlarmStatusTimer = (businessKey: string): void => {
      const timer = alarmStatusTimers.get(businessKey);
      if (timer) {
        clearInterval(timer);
        alarmStatusTimers.delete(businessKey);
      }
    };

    const clearAllAlarmStatusTimers = (): void => {
      alarmStatusTimers.forEach((timer) => {
        clearInterval(timer);
      });
      alarmStatusTimers.clear();
    };

    const resetAlarmModalState = (): void => {
      alarmItems.value = [];
      currentAlarmIndex.value = 0;
      Object.keys(videoErrorMap).forEach((key) => delete videoErrorMap[key]);
      clearAllAlarmStatusTimers();
      resetLazyVideoStreamSlots();
      state.alarmSnapshotDetail = [];
      state.activeKey = "";
      activeVideoTabKey.value = "";
      alarmLevelPlayConfig.value = undefined;
      alarmLevelAudio.value = "";
      playCount.value = 0;
      snapshotRequestId++;
      const audioDom = document.querySelector("#alarmAudio") as HTMLAudioElement | null;
      if (audioDom) {
        audioDom.pause();
        audioDom.currentTime = 0;
        audioDom.loop = false;
      }
    };

    const close = (): void => {
      window.parent.postMessage({ type: "cube-alarm-modal-close" }, "*");
      resetAlarmModalState();
    };

    const removeAlarmByBusinessKey = (businessKey: string): void => {
      clearAlarmStatusTimer(businessKey);
      const index = alarmItems.value.findIndex((item) => item.businessKey === businessKey);
      if (index === -1) {
        return;
      }
      alarmItems.value.splice(index, 1);
      if (alarmItems.value.length === 0) {
        close();
        return;
      }
      if (currentAlarmIndex.value >= alarmItems.value.length) {
        currentAlarmIndex.value = alarmItems.value.length - 1;
      } else if (index < currentAlarmIndex.value) {
        currentAlarmIndex.value--;
      }
    };

    const getAlarmStatus = (data: { businessKey?: string }): void => {
      const { businessKey } = data;
      if (!businessKey) {
        return;
      }
      clearAlarmStatusTimer(businessKey);
      const timer = setInterval(async () => {
        const cubeLinkageService = new CubeLinkageService(authStore);
        const res = await cubeLinkageService.getAlarmRecordDetail(businessKey);
        if (res.alarmStatus === "ALARM_HANDLER") {
          removeAlarmByBusinessKey(businessKey);
        }
      }, 1000 * 60);
      alarmStatusTimers.set(businessKey, timer);
    };
    const getAlarmDetailId = (alarm: Partial<AlarmModalItem> | null | undefined): string => {
      for (const value of [alarm?.id, alarm?.alarmRecordId, alarm?.businessKey]) {
        const text = String(value ?? "").trim();
        if (text && text !== "undefined" && text !== "null") {
          return text;
        }
      }
      return "";
    };
    const normalizeAlarmForDetail = (alarm: AlarmModalItem): AlarmModalItem => {
      const detailId = getAlarmDetailId(alarm);
      return {
        ...alarm,
        ...(detailId ? { id: alarm.id ?? detailId } : {}),
        alarmStatus: alarm.alarmStatus ?? alarm.businessStatus ?? "",
      };
    };
    const handleDetail = (): void => {
      if (!currentAlarm.value) {
        return;
      }
      const detailAlarm = normalizeAlarmForDetail(currentAlarm.value);
      window.parent.postMessage({ type: "cube-alarm-modal-click-detail", data: JSON.stringify(detailAlarm) }, "*");
      // 兼容之前的事件
      window.parent.postMessage({ type: "cube-alarm-modal-click-more", data: JSON.stringify(detailAlarm) }, "*");
      alarmItems.value.length < 2 && close();
    };
    const currentAlarm = computed(() => {
      if (alarmItems.value.length > 0) {
        if (currentAlarmIndex.value >= alarmItems.value.length) {
          currentAlarmIndex.value = 0;
        }
        return alarmItems.value[currentAlarmIndex.value];
      }
      return null;
    });
    watch(
      () => currentAlarm.value,
      () => {
        activeVideoTabKey.value = "";
        handleAlarmSnapshot();
      },
    );
    const alarmDesc = computed(() => {
      if (currentAlarm.value) {
        return `
        【${currentAlarm.value.alarmTargetName}】 在
        【${currentAlarm.value.areaName || currentAlarm.value?.marketName || ""}】发生
        【${currentAlarm.value.alarmEventName}】报警事件
        `;
      }
      return "";
    });
    const handlePre = (): void => {
      if (currentAlarmIndex.value > 0) {
        currentAlarmIndex.value--;
      }
    };
    const handleNext = (): void => {
      if (currentAlarmIndex.value < alarmItems.value.length - 1) {
        currentAlarmIndex.value++;
      }
    };
    const getAlarmDetail = async (data: Record<string, unknown>, alarmIndex = currentAlarmIndex.value): Promise<void> => {
      const cubeAlarmCenterService = new CubeAlarmCenterService(authStore);
      const res = await cubeAlarmCenterService.getAlarmDetails((data.businessKey || data.id) as string);
      const existingAlarm = alarmItems.value[alarmIndex];
      if (!existingAlarm) {
        return;
      }
      alarmItems.value[alarmIndex] = normalizeAlarmForDetail({
        ...data,
        ...res,
        videoList: alarmItems.value[alarmIndex]?.videoList ?? existingAlarm.videoList,
      } as AlarmModalItem);
    };
    const shouldRefreshAlarmDetail = (data: any): boolean => !data.alarmSnapshot || !data.applicationCode;
    const addAlarmMessage = (data: Record<string, unknown>): number => {
      const businessKey = data.businessKey as string | undefined;
      if (businessKey) {
        const existingIndex = alarmItems.value.findIndex((item) => item.businessKey === businessKey);
        if (existingIndex !== -1) {
          const existingAlarm = alarmItems.value[existingIndex];
          alarmItems.value[existingIndex] = normalizeAlarmForDetail({
            ...existingAlarm,
            ...data,
            videoList: (data.videoList as AlarmModalItem["videoList"]) ?? existingAlarm.videoList ?? [],
          } as AlarmModalItem);
          return existingIndex;
        }
      }
      if (alarmItems.value.length >= MAX_ALARM_QUEUE) {
        const removed = alarmItems.value.shift();
        if (removed?.businessKey) {
          clearAlarmStatusTimer(removed.businessKey);
        }
        if (currentAlarmIndex.value > 0) {
          currentAlarmIndex.value--;
        }
      }
      if (alarmItems.value.length === 0) {
        currentAlarmIndex.value = 0;
      }
      alarmItems.value.push(
        normalizeAlarmForDetail({ ...data, videoList: (data.videoList as AlarmModalItem["videoList"]) ?? [] } as AlarmModalItem),
      );
      return alarmItems.value.length - 1;
    };
    const getAlarmEventVideo = async (data: any, alarmIndex: number): Promise<void> => {
      const cubeLinkageService = new CubeLinkageService(authStore);
      try {
        const res = await cubeLinkageService.getVideoListByEventId(data.businessKey);
        const existingAlarm = alarmItems.value[alarmIndex];
        if (existingAlarm) {
          alarmItems.value[alarmIndex] = { ...existingAlarm, videoList: res };
        }
      } catch {
        const existingAlarm = alarmItems.value[alarmIndex];
        if (existingAlarm) {
          alarmItems.value[alarmIndex] = { ...existingAlarm, videoList: [] };
        }
      }
    };

    const getAlarmKey = (alarm: AlarmModalItem): string => String(alarm.businessKey || alarm.id || alarm.alarmRecordId || "");

    const getVideoErrorKey = (alarm: AlarmModalItem, deviceId: string): string => `${getAlarmKey(alarm)}:${deviceId}`;

    const handlePlayerError = (alarm: AlarmModalItem, deviceId: string): void => {
      videoErrorMap[getVideoErrorKey(alarm, deviceId)] = true;
    };

    const renderVideoError = (): JSX.Element => (
      <div class={styles["video-fallback-empty"]}>
        <div>视频播放失败</div>
      </div>
    );

    const renderVideoPlayer = (alarm: AlarmModalItem, video: AlarmModalItem["videoList"][number]): JSX.Element | null => {
      if (!video.deviceId) {
        return null;
      }
      if (videoErrorMap[getVideoErrorKey(alarm, video.deviceId)]) {
        return renderVideoError();
      }
      return (
        <CubePlayer
          h5sControl={true}
          dom-id={video.deviceId}
          device-id={video.deviceId}
          onError={() => handlePlayerError(alarm, video.deviceId)}
        />
      );
    };

    // 迁移组件
    const numberDataType = new Set(["int", "long", "float", "double"]);

    const componentsChartDetail = computed(() => {
      const componentKeys = new Set(Object.keys(AlarmChartComponent));
      const snapshotKeys = new Set(state.alarmSnapshotDetail.map((item) => item.propCode));
      const intersectionKeys = [...componentKeys].filter((x) => snapshotKeys.has(x));

      return state.alarmSnapshotDetail.filter((item) => intersectionKeys.includes(item.propCode));
    });

    const defaultVideoTabKey = computed((): string => {
      const alarm = currentAlarm.value;
      if (!alarm) {
        return "";
      }
      if (["ELECTRICMANAGE", "FIRECONTROL", "ROTATINGMANAGE"].includes(alarm.alarmTypeCode) && componentsChartDetail.value.length) {
        return componentsChartDetail.value[0].propCode;
      }
      if (alarm.videoList?.length) {
        return showGridVideo.value ? "video-grid" : `${alarm.videoList[0].deviceId}0`;
      }
      return "";
    });
    const resolvedVideoTabKey = computed(() => activeVideoTabKey.value || defaultVideoTabKey.value);

    const handleAlarmSnapshot = async (): Promise<void> => {
      const requestId = ++snapshotRequestId;
      const { alarmSnapshot, alarmTargetKey } = currentAlarm.value || {};
      if (!alarmSnapshot) {
        state.alarmSnapshotDetail = [];
        return;
      }

      const parsedAlarmSnapshot = typeof alarmSnapshot === "string" ? JSON.parse(alarmSnapshot) : alarmSnapshot;
      const { matchSnapshot } = parsedAlarmSnapshot;
      if (!Array.isArray(matchSnapshot)) {
        state.alarmSnapshotDetail = [];
        return;
      }
      const cubeDeviceCenterService = new CubeDeviceCenterService(authStore);
      const params = { deviceId: alarmTargetKey ?? "", withPropertySpec: true, withSnapShot: true };
      const result = await cubeDeviceCenterService.getNorthDeviceDetail(params);
      if (requestId !== snapshotRequestId) {
        return;
      }
      const alarmSnapshotDetail = matchSnapshot.map((item) => {
        const valueReg = /(?<=\[)(.+?)(?=\])/g;
        let configAlarmValue = "";
        const matchValues = item.condition.match(valueReg);
        if (matchValues.length) {
          configAlarmValue = matchValues.at(-1);
        }
        let propValue = "";
        const deviceAttribute = result.productPropVoList.find((attr) => attr.propCode === item.propCode);
        if (deviceAttribute?.dataType === "enum") {
          const findValue = deviceAttribute?.dataConstraint?.find(
            (keyValue) => (typeof keyValue === "string" ? keyValue : keyValue.value) === item.propValue,
          );
          propValue = findValue && typeof findValue === "object" ? findValue.label : item.propValue;
        } else {
          propValue = item.propValue;
        }
        return {
          propName: deviceAttribute?.propName,
          propValue,
          propCode: item.propCode,
          configAlarmValue,
          minValue: numberDataType.has(deviceAttribute?.dataType || "")
            ? Math.min(
                ...(Array.isArray(deviceAttribute?.dataConstraint)
                  ? deviceAttribute.dataConstraint.map((item) => (typeof item === "object" ? Number(item.value) : Number(item)))
                  : []),
              )
            : 0,
          maxValue: numberDataType.has(deviceAttribute?.dataType || "")
            ? Math.max(
                ...(Array.isArray(deviceAttribute?.dataConstraint)
                  ? deviceAttribute.dataConstraint.map((item) => (typeof item === "object" ? Number(item.value) : Number(item)))
                  : []),
              )
            : 0,
          unit: deviceAttribute?.unitName || "",
          time: item.propValueTs,
        };
      });
      state.activeKey = alarmSnapshotDetail.length > 0 ? alarmSnapshotDetail[0].propCode : "";
      state.alarmSnapshotDetail = alarmSnapshotDetail;
    };

    const renderChart = (chartItem: {
      minValue: string;
      maxValue: string;
      propName: string;
      propValue: string;
      unit: string;
      propCode: string;
    }): JSX.Element | null => {
      const ChartComponent = AlarmChartComponent[chartItem.propCode];
      if (ChartComponent) {
        return (
          <ChartComponent
            min={chartItem.minValue}
            max={chartItem.maxValue}
            label={chartItem.propName}
            isAlarmModal={true}
            value={`${chartItem.propValue}`}
            unit={chartItem.unit}
          />
        );
      }
      return null;
    };
    const componentsChart = (): JSX.Element | null => {
      if (componentsChartDetail.value && componentsChartDetail.value.length > 0) {
        return (
          <>
            {componentsChartDetail.value.map((item) => (
              <TabPane tab={item.propName} key={item.propCode}>
                <div class={styles["content"]}>
                  <div class={styles["item"]}>
                    <div class={styles["label"]}>报警值：</div>
                    <div class={styles["value"]}>{renderChart(item)}</div>
                  </div>
                </div>
              </TabPane>
            ))}
          </>
        );
      }
      return null;
    };

    const ModalContent = (): JSX.Element => {
      if (
        currentAlarm.value?.videoList?.length ||
        (currentAlarm.value && ["ELECTRICMANAGE", "FIRECONTROL", "ROTATINGMANAGE"].includes(currentAlarm.value.alarmTypeCode))
      ) {
        return (
          <div>
            {componentsChartDetail.value.length > 0 || currentAlarm.value?.videoList?.length ? (
              <Tabs
                destroyInactiveTabPane={true}
                activeKey={resolvedVideoTabKey.value}
                onChange={(key: string) => {
                  activeVideoTabKey.value = key;
                }}
              >
                {currentAlarm.value &&
                  ["ELECTRICMANAGE", "FIRECONTROL", "ROTATINGMANAGE"].includes(currentAlarm.value.alarmTypeCode) &&
                  componentsChart()}
                {!showGridVideo.value
                  ? // 默认布局（单个视频标签页，destroyInactiveTabPane 仅挂载当前 tab）
                    currentAlarm.value.videoList.map((v, i) => {
                      const tabKey = `${v.deviceId}${i}`;
                      return (
                        <TabPane key={tabKey} tab={v.deviceName}>
                          <div class={styles["alarm-video-container-box"]} id="alarm-video-container-box">
                            <div class={styles["alarm-video-container-icon"]}>
                              <FullscreenOutlined v-show={!isFull.value} onClick={fullScreenVideo} />
                              <FullscreenExitOutlined v-show={isFull.value} onClick={exitFullScreen} />
                            </div>
                            <div class={styles["alarm-video-container"]}>{renderVideoPlayer(currentAlarm.value, v)}</div>
                          </div>
                        </TabPane>
                      );
                    })
                  : currentAlarm.value?.videoList?.length > 0 && (
                      // 九宫格布局：IntersectionObserver 懒挂载 + 全局最多 4 路并发
                      <TabPane key="video-grid" tab="监控视频">
                        <div class={`${styles.grid} ${styles[`grid-${Math.min(currentAlarm.value.videoList.length, MAX_GRID_VIDEOS)}`]}`}>
                          {currentAlarm.value.videoList.slice(0, MAX_GRID_VIDEOS).map((v, i) => {
                            const streamKey = `${getAlarmKey(currentAlarm.value)}:${v.deviceId}:${i}`;
                            return (
                              <div key={streamKey} class={styles["grid-item"]}>
                                <div class={styles["video-title"]} title={v.deviceName}>
                                  {v.deviceName}
                                </div>
                                <div class={styles["video-icon"]}>
                                  <FullscreenOutlined v-show={!isFull.value} onClick={fullScreenVideo} />
                                  <FullscreenExitOutlined v-show={isFull.value} onClick={exitFullScreen} />
                                </div>
                                {videoErrorMap[getVideoErrorKey(currentAlarm.value, v.deviceId)] ? (
                                  renderVideoError()
                                ) : (
                                  <LazyVideoPlayer
                                    streamKey={streamKey}
                                    deviceId={v.deviceId}
                                    onPlayerError={() => handlePlayerError(currentAlarm.value, v.deviceId)}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </TabPane>
                    )}
              </Tabs>
            ) : (
              <div class={styles["empty-data"]}>
                <img src={emptyPng} alt="" />
                <div>暂无数据快照</div>
              </div>
            )}
          </div>
        );
      }
      return (
        <div class={styles["empty-box"]}>
          <img src={emptyPng} alt="empty" />
        </div>
      );
    };

    const getAlarmLevelPlayConfig = async (alarmMessage: { turnWarningSound?: boolean | null; alarmLevelCode?: string }): Promise<void> => {
      if (!alarmMessage?.turnWarningSound) {
        return;
      }
      const cubeAlarmCenterService = new CubeAlarmCenterService(authStore);
      const res = await cubeAlarmCenterService.getAlarmLevelPlayConfig({ alarmLevelCode: alarmMessage.alarmLevelCode ?? "" });
      alarmLevelPlayConfig.value = res;
      let url = alarmLevelPlayConfig.value?.file?.path ?? "";
      if (url && !url?.includes("http")) {
        url = window.location.origin + url;
      }
      alarmLevelAudio.value = url;
    };
    const handleAlarmAudioEnd = (): void => {
      const audioDom = document.querySelector("#alarmAudio") as HTMLAudioElement;
      playCount.value++;
      if (alarmLevelPlayConfig.value?.looped) {
        audioDom.loop = true;
      } else {
        audioDom.loop = false;
        if (alarmLevelPlayConfig.value?.playNum && playCount.value < alarmLevelPlayConfig.value?.playNum) {
          audioDom.play();
        }
      }
    };

    const locateToDevice = (): void => {
      window.parent.postMessage({ type: CubeMessageEvent.CUBE_ALARM_MODAL_DEVICE_LOCATE, data: JSON.stringify(currentAlarm.value) }, "*");
      close();
    };

    const warmUpAudio = (): void => {
      const audioDom = document.querySelector("#alarmAudio") as HTMLAudioElement | null;
      if (audioDom) {
        audioDom.play();
        audioDom.pause();
      }
    };

    const processAlarmMessage = async (alarmMessage: Record<string, unknown>): Promise<void> => {
      const alarmIndex = addAlarmMessage(alarmMessage);
      await getAlarmEventVideo(alarmMessage, alarmIndex);
      getAlarmStatus(alarmMessage as { businessKey?: string });
      try {
        if (shouldRefreshAlarmDetail(alarmMessage)) {
          await getAlarmDetail(alarmMessage, alarmIndex);
        }
      } catch {
        // 弹窗消息本身已经入队，详情接口异常不能阻断弹窗展示。
      }
      await getAlarmLevelPlayConfig(alarmMessage as { turnWarningSound?: boolean | null; alarmLevelCode?: string });
      const audioDom = document.querySelector("#alarmAudio") as HTMLAudioElement | null;
      const isNull = alarmMessage.turnWarningSound === null || alarmMessage.turnWarningSound === undefined;
      if (audioDom && (alarmMessage.turnWarningSound || (isNull && alarmMessage.alarmLevelCode === "one_level"))) {
        audioDom.currentTime = 0;
        playCount.value = 0;
        void audioDom.play();
      }
    };

    const drainAlarmMessageQueue = async (): Promise<void> => {
      if (drainingAlarmQueue) {
        return;
      }
      drainingAlarmQueue = true;
      while (alarmMessageQueue.length > 0) {
        const alarmMessage = alarmMessageQueue.shift();
        if (alarmMessage) {
          await processAlarmMessage(alarmMessage);
        }
        window.parent.postMessage({ type: "cube-alarm-modal-completed" }, "*");
      }
      drainingAlarmQueue = false;
    };

    const handleWindowMessage = (event: MessageEvent): void => {
      const message = event.data;
      if (message.type === "cube-alarm-message") {
        alarmMessageQueue.push(JSON.parse(message.data) as Record<string, unknown>);
        void drainAlarmMessageQueue();
        return;
      }
      if (message.type === "showDetailButton") {
        if (shouldEnableDetailButtonByHost()) {
          showDetailButton.value = true;
        }
      } else if (message.type === "hideDetailButton") {
        showDetailButton.value = false;
      } else if (message.type === "showDeviceLocateButton") {
        showDeviceLocateButton.value = true;
      } else if (message.type === "close-modal") {
        close();
      }
      window.parent.postMessage({ type: "cube-alarm-modal-completed" }, "*");
    };

    onMounted(() => {
      themeManager.mount();
      antd3LegacyThemeManager.mount();

      document.addEventListener("click", warmUpAudio);

      window.addEventListener("message", handleWindowMessage);
      window.parent.postMessage({ type: "cube-alarm-modal-ready" }, "*");
      if (shouldEnableDetailButtonByHost()) {
        showDetailButton.value = true;
      }
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", warmUpAudio);
      window.removeEventListener("message", handleWindowMessage);
      resetAlarmModalState();
    });

    return (): JSX.Element => (
      <>
        {alarmLevelAudio.value ? (
          <audio
            src={alarmLevelAudio.value}
            preload="auto"
            loop={!!alarmLevelPlayConfig.value?.looped}
            id="alarmAudio"
            onEnded={handleAlarmAudioEnd}
          />
        ) : (
          <audio src={AlarmAudio} id="alarmAudio" preload="auto" />
        )}
        {currentAlarm.value && (
          <div class={styles.mask}>
            <div class={styles.modal}>
              <div
                class={styles[getClass(currentAlarm.value.alarmLevelName ?? "一级")]}
                style="height:100%;box-sizing: border-box;padding:0 10px;position: relative;"
              >
                <div class={styles["alarmDetail-modal-header"]}>
                  <div class={styles["header-title"]}>
                    <span>{currentAlarm.value.applicationName}</span>
                    {currentAlarm.value?.marketName && <span>【{currentAlarm.value?.marketName}】</span>}
                    <Tag color={getClass(currentAlarm.value.alarmLevelName ?? "一级")} style="margin-left: 10px">
                      {currentAlarm.value.alarmLevelName}
                    </Tag>
                  </div>
                  <div class={styles["header-close"]} onClick={close}>
                    <CloseOutlined />
                  </div>
                </div>
                <div class={styles["alarm-name"]} style={{ backgroundImage: `url(${getImg(currentAlarm.value.alarmLevelName)})` }}>
                  <div style="font-size: 18px">{currentAlarm.value.alarmEventName}</div>
                  <div style="font-size: 12px">
                    {currentAlarm.value.alarmTime ? dayjs(currentAlarm.value.alarmTime).format("YYYY-MM-DD HH:mm:ss") : ""}
                  </div>
                </div>
                <div class={styles["alarm-desc"]} v-show={alarmDesc.value}>
                  <Tooltip title={alarmDesc.value}>{alarmDesc.value}</Tooltip>
                </div>
                <ModalContent />
                <div class={styles["modal-footer"]}>
                  <span></span>
                  <div class={styles["modal-footer-right"]}>
                    <Space>
                      {alarmItems.value.length > 1 && (
                        <>
                          <span class={styles["modal-num"]} style="color: #fff">
                            {currentAlarmIndex.value + 1}/{alarmItems.value.length}
                          </span>
                          <Button class={styles["footer-button"]} disabled={currentAlarmIndex.value === 0} onClick={handlePre}>
                            上一条
                          </Button>
                          <Button
                            class={styles["footer-button"]}
                            disabled={currentAlarmIndex.value === alarmItems.value.length - 1}
                            onClick={handleNext}
                          >
                            下一条
                          </Button>
                        </>
                      )}
                      {/* <Button type='primary' onClick={locateToDevice} v-show={showDeviceLocateButton.value}>定位</Button> */}
                      <Button class={styles["footer-detail-button"]} type="primary" onClick={handleDetail} v-show={showDetailButton.value}>
                        详情
                      </Button>
                    </Space>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  },
});
