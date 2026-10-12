import { CameraOutlined, FullscreenExitOutlined, FullscreenOutlined, PauseOutlined, PlayCircleOutlined } from "@ant-design/icons-vue";
import { computed, defineComponent, onBeforeUnmount, onMounted, shallowRef, watch, type PropType } from "vue";

import { CubePlayer } from "@ghcloud/cube-player";
import { Button, Modal, message } from "@ghcloud/cube-ui";

import type { DeviceInspectionMode, DeviceInspectionTask } from "./device-inspection-data";
import { DroneHazardReportModal } from "./drone-hazard-report-modal";
import type { DeviceInspectionTaskData } from "@/api/dashboard-service";

interface DroneHazardReportModalExpose {
  openSnapshot: (options: { file: File; previewUrl: string; task: DeviceLiveTask | null }) => Promise<void>;
}

type DeviceLiveTask = DeviceInspectionTask | DeviceInspectionTaskData;
type OverlayContainerResolver = () => HTMLElement;
type HazardDefaultLocation = NonNullable<DeviceLiveTask["hazardDefaultLocation"]>;

const POINT_SEEK_INTERVAL_SECONDS = 15;

interface DeviceDetailExpandInfo {
  lntAndLat?: string;
  locationDes?: string;
}

interface DeviceDetailLike {
  expandInfo?: DeviceDetailExpandInfo;
}

const parseLntAndLat = (value: string | undefined): Pick<HazardDefaultLocation, "longitude" | "latitude"> => {
  const [lngText, latText] = String(value || "").split(",");
  const longitude = Number(lngText);
  const latitude = Number(latText);
  return {
    longitude: Number.isFinite(longitude) ? longitude : null,
    latitude: Number.isFinite(latitude) ? latitude : null,
  };
};

const readDeviceHazardLocation = (detail: unknown): HazardDefaultLocation | null => {
  const expandInfo = (detail as DeviceDetailLike | null | undefined)?.expandInfo;
  if (!expandInfo?.locationDes && !expandInfo?.lntAndLat) {
    return null;
  }
  return {
    locationName: String(expandInfo.locationDes || "").trim(),
    ...parseLntAndLat(expandInfo.lntAndLat),
  };
};

const waitForVideoFrame = async (video: HTMLVideoElement): Promise<void> => {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("视频画面加载中，请稍后再拍照"));
    }, 2000);
    const cleanup = (): void => {
      window.clearTimeout(timeout);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("timeupdate", onReady);
    };
    const onReady = (): void => {
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth <= 0 || video.videoHeight <= 0) {
        return;
      }
      cleanup();
      resolve();
    };
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("timeupdate", onReady);
  });
};

const createSnapshotFile = async (stage: HTMLElement, preferredVideo?: HTMLVideoElement | null): Promise<File> => {
  const video = preferredVideo
    ? preferredVideo
    : [...stage.querySelectorAll("video")].find((item) => item.videoWidth > 0 && item.videoHeight > 0);
  const sourceCanvas = [...stage.querySelectorAll("canvas")].find((item) => item.width > 0 && item.height > 0);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("当前浏览器不支持视频截帧");
  }
  if (video) {
    await waitForVideoFrame(video);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  } else if (sourceCanvas) {
    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
    context.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);
  } else {
    throw new Error("未找到可截取的实时视频画面");
  }
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => {
        if (value) {
          resolve(value);
          return;
        }
        reject(new Error("视频截帧失败，请稍后重试"));
      },
      "image/jpeg",
      0.92,
    );
  });
  return new File([blob], `drone-hazard-${Date.now()}.jpg`, { type: "image/jpeg" });
};

export const DeviceLiveModal = defineComponent({
  name: "DeviceLiveModal",
  props: {
    open: { type: Boolean, required: true },
    mode: { type: String as PropType<DeviceInspectionMode>, required: true },
    task: { type: Object as PropType<DeviceLiveTask | null>, required: false, default: null },
    streamDeviceId: { type: String, required: false, default: "" },
    localVideoUrl: { type: String, required: false, default: "" },
    preferLocalVideo: { type: Boolean, required: false, default: true },
    activePointIndex: { type: Number, required: false, default: undefined },
    paused: { type: Boolean, required: false, default: false },
    onSnapshot: { type: Function as PropType<() => void>, required: true },
    onTogglePaused: { type: Function as PropType<() => void>, required: true },
    onSelectPoint: { type: Function as PropType<(index: number) => void>, required: false, default: undefined },
  },
  setup(props) {
    const localActivePointIndex = shallowRef(0);
    const livePanelRef = shallowRef<HTMLElement | null>(null);
    const liveStageRef = shallowRef<HTMLElement | null>(null);
    const localVideoRef = shallowRef<HTMLVideoElement | null>(null);
    const fullscreenTargetRef = shallowRef<HTMLElement | null>(null);
    const hazardReportModalRef = shallowRef<DroneHazardReportModalExpose | null>(null);
    const hazardDefaultLocation = shallowRef<HazardDefaultLocation | null>(null);
    const isFullscreen = shallowRef(false);
    const playerError = shallowRef("");
    const localVideoSeekKey = shallowRef("");

    const resolvedActivePointIndex = computed(() => {
      const points = props.task?.routePoints || [];
      const rawIndex = props.activePointIndex ?? localActivePointIndex.value;
      if (points.length === 0) {
        return 0;
      }
      return Math.max(0, Math.min(rawIndex, points.length - 1));
    });

    const activePoint = computed(() => props.task?.routePoints[resolvedActivePointIndex.value]);

    const shouldUseLocalVideo = computed(() => Boolean(props.preferLocalVideo && props.localVideoUrl));

    const isPointPlayable = computed(() => {
      const { task } = props;
      const point = activePoint.value;
      if (!task || task.status === "待巡检") {
        return false;
      }
      if (!point) {
        return true;
      }
      if (task.status === "已巡检") {
        return point.status !== "pending";
      }
      return point.status === "done" || point.status === "abnormal";
    });

    const getPointSeekTime = (): number => Math.max(0, resolvedActivePointIndex.value * POINT_SEEK_INTERVAL_SECONDS);

    const getLocalVideoSeekKey = (): string =>
      `${props.task?.id || "no-task"}:${props.localVideoUrl}:${resolvedActivePointIndex.value}:${activePoint.value?.status || "no-point"}`;

    const syncLocalVideoPlayback = (options: { seek?: boolean } = {}): void => {
      const video = localVideoRef.value;
      if (!video || !shouldUseLocalVideo.value) {
        return;
      }
      if (!isPointPlayable.value || props.paused) {
        video.pause();
        return;
      }
      const seekKey = getLocalVideoSeekKey();
      if (options.seek || localVideoSeekKey.value !== seekKey) {
        const targetTime = getPointSeekTime();
        const maxTime = Number.isFinite(video.duration) && video.duration > 0 ? Math.max(0, video.duration - 0.2) : targetTime;
        video.currentTime = Math.min(targetTime, maxTime);
        localVideoSeekKey.value = seekKey;
      }
      video.play().catch(() => {});
    };

    const selectPoint = (index: number): void => {
      localActivePointIndex.value = index;
      props.onSelectPoint?.(index);
    };

    const resolveFullscreenTarget = (): HTMLElement | null => {
      if (fullscreenTargetRef.value) {
        return fullscreenTargetRef.value;
      }
      const target = livePanelRef.value?.closest(".inspection-command-screen-modal-content, .ant-modal-content") as HTMLElement | null;
      fullscreenTargetRef.value = target;
      return target;
    };

    const syncFullscreenState = (): void => {
      const target = resolveFullscreenTarget();
      isFullscreen.value = Boolean(target && document.fullscreenElement === target);
    };

    const toggleFullscreen = (): void => {
      const target = resolveFullscreenTarget();
      if (!target) {
        return;
      }
      if (document.fullscreenElement === target) {
        document.exitFullscreen().catch(() => message.error("退出全屏失败"));
        return;
      }
      const requestFullscreen = (): Promise<void> => target.requestFullscreen();
      const pending = document.fullscreenElement ? document.exitFullscreen().then(requestFullscreen) : requestFullscreen();
      pending.catch(() => message.error("实时画面全屏失败"));
    };

    watch(
      () => props.task?.id,
      () => {
        localActivePointIndex.value = props.activePointIndex ?? 0;
        playerError.value = "";
        localVideoSeekKey.value = "";
        syncLocalVideoPlayback({ seek: true });
      },
    );

    watch(
      () => props.streamDeviceId,
      () => {
        playerError.value = "";
        hazardDefaultLocation.value = null;
      },
    );

    watch(
      () => [props.localVideoUrl, resolvedActivePointIndex.value, props.task?.id, props.task?.status, activePoint.value?.status] as const,
      () => {
        syncLocalVideoPlayback({ seek: true });
      },
    );

    watch(
      () => props.paused,
      () => {
        syncLocalVideoPlayback();
      },
    );

    watch(
      () => props.open,
      (open) => {
        const target = resolveFullscreenTarget();
        if (!open && target && document.fullscreenElement === target) {
          document.exitFullscreen().catch(() => {});
        }
      },
    );

    onMounted(() => {
      document.addEventListener("fullscreenchange", syncFullscreenState);
      syncFullscreenState();
    });

    onBeforeUnmount(() => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
      const target = resolveFullscreenTarget();
      if (target && document.fullscreenElement === target) {
        document.exitFullscreen().catch(() => {});
      }
    });

    const getTitle = (): string => (props.mode === "drone" ? "无人机实时画面" : "机器狗实时画面");

    const resolveOverlayContainer: OverlayContainerResolver = () => document.body;

    const buildSnapshotTask = (): DeviceLiveTask | null => {
      if (!props.task) {
        return null;
      }
      return {
        ...props.task,
        ...(hazardDefaultLocation.value ? { hazardDefaultLocation: hazardDefaultLocation.value } : {}),
      };
    };

    const snapshotLiveFrame = async (): Promise<void> => {
      props.onSnapshot();
      if (props.paused) {
        message.warning("视频已暂停，无法截取实时画面");
        return;
      }
      if (shouldUseLocalVideo.value && !isPointPlayable.value) {
        message.warning("当前点位待巡检，无法截取实时画面");
        return;
      }
      if (playerError.value) {
        message.error(playerError.value);
        return;
      }
      if (!liveStageRef.value) {
        message.error("实时画面尚未加载");
        return;
      }
      try {
        if (shouldUseLocalVideo.value) {
          syncLocalVideoPlayback();
        }
        const file = await createSnapshotFile(liveStageRef.value, shouldUseLocalVideo.value ? localVideoRef.value : null);
        if (document.fullscreenElement) {
          await document.exitFullscreen().catch(() => {});
        }
        await hazardReportModalRef.value?.openSnapshot({
          file,
          previewUrl: URL.createObjectURL(file),
          task: buildSnapshotTask(),
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "视频截帧失败";
        message.error(errorMessage.includes("tainted") ? "当前视频流不允许浏览器截帧，请检查流媒体跨域配置" : errorMessage);
      }
    };

    const renderHeader = () => (
      <div class="device-live-header">
        <span>{getTitle()}</span>
        <div class="device-live-actions" onMousedown={(event: MouseEvent) => event.stopPropagation()}>
          <Button size="small" onClick={snapshotLiveFrame}>
            <CameraOutlined />
            拍照
          </Button>
          <Button size="small" onClick={props.onTogglePaused}>
            {props.paused ? <PlayCircleOutlined /> : <PauseOutlined />}
            {props.paused ? "播放" : "暂停"}
          </Button>
          <Button size="small" onClick={toggleFullscreen}>
            {isFullscreen.value ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            {isFullscreen.value ? "退出全屏" : "全屏"}
          </Button>
        </div>
      </div>
    );

    return () => {
      const { task } = props;
      const progress = task && task.totalPointCount > 0 ? Math.round((task.donePointCount / task.totalPointCount) * 100) : 0;
      const deviceId = props.streamDeviceId.trim();
      const localVideoUrl = props.localVideoUrl.trim();
      const playerKey = `${props.task?.id || "no-task"}:${deviceId}`;
      const shouldRenderLocalVideo = Boolean(shouldUseLocalVideo.value && localVideoUrl);
      const shouldRenderPlayer = Boolean(!shouldRenderLocalVideo && deviceId && !props.paused && !playerError.value);
      const emptyStreamText = props.mode === "drone" ? "当前任务缺少设备ID，无法拉取视频流" : "等待实时画面";
      const point = activePoint.value;
      const waitingPoint = shouldRenderLocalVideo && !isPointPlayable.value;

      return (
        <Modal
          open={props.open}
          title={renderHeader()}
          width={380}
          footer={null}
          closable={false}
          mask={false}
          maskClosable={false}
          keyboard={false}
          wrapClassName="screen-modal-wrap draggable-modal-wrap device-live-modal-wrap"
          class={["screen-modal", "device-live-modal", isFullscreen.value ? "fullscreen" : ""]}
        >
          <div
            class={["device-live-panel", isFullscreen.value ? "fullscreen" : ""]}
            ref={(el) => {
              const panel = el as HTMLElement | null;
              livePanelRef.value = panel;
              fullscreenTargetRef.value = panel?.closest(
                ".inspection-command-screen-modal-content, .ant-modal-content",
              ) as HTMLElement | null;
            }}
          >
            <div
              class={["device-live-stage", props.mode === "robotDog" ? "dog" : "drone"]}
              ref={(el) => {
                liveStageRef.value = el as HTMLElement | null;
              }}
            >
              <div class="device-live-badge">{props.paused ? "PAUSED" : "LIVE"}</div>
              {shouldRenderLocalVideo ? (
                <video
                  key={`${props.task?.id || "no-task"}:${localVideoUrl}`}
                  class="device-local-video"
                  ref={(el) => {
                    localVideoRef.value = el as HTMLVideoElement | null;
                  }}
                  crossorigin="anonymous"
                  src={localVideoUrl}
                  muted
                  playsinline
                  loop
                  controls={false}
                  onLoadedmetadata={() => syncLocalVideoPlayback({ seek: true })}
                  onCanplay={() => syncLocalVideoPlayback()}
                />
              ) : null}
              {shouldRenderPlayer ? (
                <CubePlayer
                  key={playerKey}
                  deviceId={deviceId}
                  isReconnect={true}
                  isShowDeviceDetails={false}
                  onError={(msg: string) => {
                    playerError.value = msg || "实时视频加载失败";
                  }}
                  onDeviceDetailChange={(detail: unknown) => {
                    hazardDefaultLocation.value = readDeviceHazardLocation(detail);
                  }}
                />
              ) : null}
              {waitingPoint || (!shouldRenderPlayer && !shouldRenderLocalVideo) ? (
                <div class="device-live-core">
                  <strong>{point ? point.name : "请选择任务"}</strong>
                  <span>
                    {waitingPoint
                      ? "待巡检"
                      : props.paused
                        ? "视频已暂停"
                        : playerError.value || (deviceId ? "正在准备实时画面" : emptyStreamText)}
                  </span>
                  <em>{point ? `结果：${point.result}` : "--"}</em>
                </div>
              ) : null}
            </div>

            <div class="device-live-point-row">
              {(task?.routePoints || []).map((point, index) => (
                <button
                  class={[
                    "device-live-point",
                    resolvedActivePointIndex.value === index ? "active" : "",
                    point.status,
                    shouldUseLocalVideo.value && point.status === "pending" ? "waiting" : "",
                  ]}
                  type="button"
                  key={point.id}
                  onClick={() => selectPoint(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div class="device-live-progress">
              <div>
                <span>执行进度</span>
                <strong>{progress}%</strong>
              </div>
              <i style={{ width: `${progress}%` }} />
            </div>
          </div>
          <DroneHazardReportModal
            getContainer={resolveOverlayContainer}
            ref={(instance) => {
              hazardReportModalRef.value = instance as DroneHazardReportModalExpose | null;
            }}
          />
        </Modal>
      );
    };
  },
});
