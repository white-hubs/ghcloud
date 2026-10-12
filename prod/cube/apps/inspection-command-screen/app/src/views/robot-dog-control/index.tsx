import { ArrowLeftOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { computed, defineComponent, onMounted, onUnmounted, shallowRef } from "vue";
import { useRouter } from "vue-router";

import { Button, Checkbox, DateRangePicker, Drawer, Empty, Image, ImagePreviewGroup, PopConfirm, message } from "@ghcloud/cube-ui";

import { RobotControlPanel, type RobotSystemStatus, type RobotTabKey } from "./components/robot-control-panel";
import type { RobotMetric } from "./components/robot-status-cards";
import { RobotVideoFooter, RobotVideoStage } from "./components/robot-video-stage";
import {
  robotDogService,
  type RobotDogCommandResponse,
  type RobotDogMovePayload,
  type RobotDogPhotoInfo,
  type RobotDogStateResponse,
} from "@/api/robot-dog-service";
import liveViewUrl from "@/assets/robot-dog/live-view.png";

import "./robot-dog-control.less";

const fallbackMetrics: RobotMetric[] = [
  { label: "电池", value: "84%", accent: true },
  { label: "运动模式", value: "standing", accent: true },
  { label: "高度（Z）", value: "0.35", suffix: "M", accent: true },
  { label: "Roll", value: "0.01", suffix: "RAD", accent: true },
  { label: "Pitch", value: "0.00", suffix: "RAD", accent: true },
  { label: "Yaw", value: "0.00", suffix: "RAD", accent: true },
];

const defaultSystemStatus: RobotSystemStatus = {
  obstacleAvoidance: false,
  remoteCommand: false,
  joystick: true,
  autoRecovery: true,
  silentMode: false,
  vui: true,
  lidar: false,
  speedLevel: 0,
  volume: 5,
  brightness: 5,
  motionMode: "MCF",
};

const defaultPhotoDateRange = (): [string, string] => {
  const end = dayjs();
  return [end.subtract(29, "day").format("YYYY-MM-DD"), end.format("YYYY-MM-DD")];
};

const clampLevel = (value: number): number => {
  return Math.max(0, Math.min(10, value));
};

const formatNumber = (value: number | undefined, digits: number): string => {
  if (!Number.isFinite(value)) {
    return "--";
  }
  const precision = 10 ** -digits;
  const normalizedValue = Math.abs(Number(value)) < precision / 2 ? 0 : Number(value);
  return normalizedValue.toFixed(digits);
};

const readImuRpy = (state: RobotDogStateResponse): [number | undefined, number | undefined, number | undefined] => {
  if (state.imu_rpy?.every(Number.isFinite)) {
    return state.imu_rpy;
  }
  const quaternion = state.imu_quaternion;
  if (!quaternion?.every(Number.isFinite) || quaternion.every((value) => value === 0)) {
    return [undefined, undefined, undefined];
  }

  const [w, x, y, z] = quaternion;
  const roll = Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y));
  const pitchInput = Math.max(-1, Math.min(1, 2 * (w * y - z * x)));
  const pitch = Math.asin(pitchInput);
  const yaw = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
  return [roll, pitch, yaw];
};

type CommandRefreshMode = "none" | "state" | "runtime" | "both";

interface RunCommandOptions {
  onSuccess?: () => void;
  showSuccess?: boolean;
  refresh?: CommandRefreshMode;
}

export const RobotDogControlView = defineComponent({
  name: "RobotDogControlView",
  setup() {
    const router = useRouter();
    const activeTab = shallowRef<RobotTabKey>("quick");
    const speed = shallowRef(1.2);
    const currentState = shallowRef<RobotDogStateResponse | null>(null);
    const stateLoadFailed = shallowRef(false);
    const emergencyStopped = shallowRef(false);
    const videoPaused = shallowRef(true);
    const lastCommand = shallowRef("--");
    const uptimeSeconds = shallowRef(0);
    const driverMode = shallowRef("mock");
    const photos = shallowRef<RobotDogPhotoInfo[]>([]);
    const photoTotal = shallowRef(0);
    const photoDrawerOpen = shallowRef(false);
    const photoBatchMode = shallowRef(false);
    const selectedPhotoIds = shallowRef<number[]>([]);
    const photoPreviewVisible = shallowRef(false);
    const photoPreviewIndex = shallowRef(0);
    const photoDateRange = shallowRef<[string, string]>(defaultPhotoDateRange());
    const systemStatus = shallowRef<RobotSystemStatus>({ ...defaultSystemStatus });
    let stateTimer: number | null = null;
    let settingsTimer: number | null = null;

    const metrics = computed<RobotMetric[]>(() => {
      const state = currentState.value;
      if (!state) {
        return fallbackMetrics;
      }
      const positionZ = state.position?.[2];
      const [roll, pitch, yaw] = readImuRpy(state);

      return [
        { label: "电池", value: `${state.battery_percent}%`, accent: true },
        { label: "运动模式", value: state.control_mode || "--", accent: true },
        { label: "高度（Z）", value: formatNumber(positionZ, 2), suffix: "M", accent: true },
        { label: "Roll", value: formatNumber(roll, 2), suffix: "RAD", accent: true },
        { label: "Pitch", value: formatNumber(pitch, 2), suffix: "RAD", accent: true },
        { label: "Yaw", value: formatNumber(yaw, 2), suffix: "RAD", accent: true },
      ];
    });

    const connectionText = computed(() => {
      const state = currentState.value;
      if (!state) {
        return stateLoadFailed.value ? "离线" : "检测中";
      }
      if (state.connection_state) {
        const labels: Record<string, string> = {
          connected: "已连接",
          connecting: "检测中",
          disconnected: "已断开",
          error: "错误",
        };
        return labels[state.connection_state] || state.connection_state;
      }
      return state.is_connected ? "已连接" : "已断开";
    });

    const activeQuickMode = computed(() => {
      return currentState.value?.control_mode || systemStatus.value.motionMode || "";
    });

    const filteredPhotos = computed(() => {
      const [dateFrom, dateTo] = photoDateRange.value;
      const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() / 1000 : null;
      const toTime = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() / 1000 : null;
      return photos.value.filter((photo) => {
        if (fromTime !== null && photo.saved_at < fromTime) {
          return false;
        }
        if (toTime !== null && photo.saved_at > toTime) {
          return false;
        }
        return true;
      });
    });

    const selectedPhotoSet = computed(() => new Set(selectedPhotoIds.value));
    const previewPhotos = computed(() => (photoDrawerOpen.value ? filteredPhotos.value : photos.value));

    const updateSystemStatus = (patch: Partial<RobotSystemStatus>): void => {
      systemStatus.value = {
        ...systemStatus.value,
        ...patch,
      };
    };

    const readBooleanState = (value: unknown, fallback: boolean): boolean => {
      if (typeof value === "object" && value !== null && "enabled" in value) {
        return Boolean((value as { enabled?: boolean }).enabled);
      }
      return fallback;
    };

    const readLevelState = (value: unknown, fallback: number): number => {
      if (typeof value === "object" && value !== null && "level" in value) {
        const level = Number((value as { level?: number }).level);
        return Number.isFinite(level) ? clampLevel(level) : fallback;
      }
      return fallback;
    };

    const refreshState = async (): Promise<void> => {
      try {
        const state = await robotDogService.getState();
        currentState.value = state;
        stateLoadFailed.value = false;
        emergencyStopped.value = Boolean((state as RobotDogStateResponse & { emergency_stopped?: boolean }).emergency_stopped);
        updateSystemStatus({
          lidar: Boolean(state.lidar_enabled),
          motionMode: state.control_mode || systemStatus.value.motionMode,
        });
      } catch {
        stateLoadFailed.value = true;
      }
    };

    const refreshRuntimeInfo = async (): Promise<void> => {
      const healthResult = await robotDogService.getHealth().catch(() => null);
      if (healthResult) {
        emergencyStopped.value = Boolean(healthResult.emergency_stopped);
        uptimeSeconds.value = Number(healthResult.uptime_seconds || 0);
        driverMode.value = healthResult.driver_mode || driverMode.value;
      }

      const [obstacleResult, autoRecoveryResult, silentModeResult, vuiResult, volumeResult, brightnessResult, motionModeResult] =
        await Promise.allSettled([
          robotDogService.getObstacleAvoidance(),
          robotDogService.getAutoRecovery(),
          robotDogService.getSilentMode(),
          robotDogService.getVuiSwitch(),
          robotDogService.getVolume(),
          robotDogService.getBrightness(),
          robotDogService.getMotionMode(),
        ]);

      updateSystemStatus({
        obstacleAvoidance:
          obstacleResult.status === "fulfilled"
            ? readBooleanState(obstacleResult.value, systemStatus.value.obstacleAvoidance)
            : systemStatus.value.obstacleAvoidance,
        autoRecovery:
          autoRecoveryResult.status === "fulfilled"
            ? readBooleanState(autoRecoveryResult.value, systemStatus.value.autoRecovery)
            : systemStatus.value.autoRecovery,
        silentMode:
          silentModeResult.status === "fulfilled"
            ? readBooleanState(silentModeResult.value, systemStatus.value.silentMode)
            : systemStatus.value.silentMode,
        vui: vuiResult.status === "fulfilled" ? readBooleanState(vuiResult.value, systemStatus.value.vui) : systemStatus.value.vui,
        volume:
          volumeResult.status === "fulfilled" ? readLevelState(volumeResult.value, systemStatus.value.volume) : systemStatus.value.volume,
        brightness:
          brightnessResult.status === "fulfilled"
            ? readLevelState(brightnessResult.value, systemStatus.value.brightness)
            : systemStatus.value.brightness,
        motionMode:
          motionModeResult.status === "fulfilled"
            ? motionModeResult.value.mode || motionModeResult.value.name || systemStatus.value.motionMode
            : systemStatus.value.motionMode,
      });
    };

    const refreshPhotos = async (): Promise<void> => {
      try {
        const result = await robotDogService.getPhotos({ offset: 0, limit: 15 });
        photos.value = result.photos;
        photoTotal.value = result.total;
      } catch {
        photos.value = [];
        photoTotal.value = 0;
      }
    };

    const loadMorePhotos = async (): Promise<void> => {
      try {
        const result = await robotDogService.getPhotos({ offset: photos.value.length, limit: 30 });
        photos.value = [...photos.value, ...result.photos];
        photoTotal.value = result.total;
      } catch {
        message.error("加载更多照片失败");
      }
    };

    const formatPhotoTime = (savedAt: number): string => {
      return new Date(savedAt * 1000).toLocaleString("zh-CN");
    };

    const openPhotoDrawer = (): void => {
      photoDrawerOpen.value = true;
      refreshPhotos().catch(() => undefined);
    };

    const closePhotoDrawer = (): void => {
      photoDrawerOpen.value = false;
      photoBatchMode.value = false;
      selectedPhotoIds.value = [];
    };

    const openPhotoPreview = (photoId: number): void => {
      const index = previewPhotos.value.findIndex((item) => item.id === photoId);
      if (index < 0) {
        return;
      }
      photoPreviewIndex.value = index;
      photoPreviewVisible.value = true;
    };

    const switchPhotoPreview = (step: -1 | 1): void => {
      if (!photoPreviewVisible.value) {
        return;
      }
      const nextIndex = photoPreviewIndex.value + step;
      if (nextIndex >= 0 && nextIndex < previewPhotos.value.length) {
        photoPreviewIndex.value = nextIndex;
      }
    };

    const toggleBatchMode = (): void => {
      photoBatchMode.value = !photoBatchMode.value;
      selectedPhotoIds.value = [];
    };

    const togglePhotoSelect = (photoId: number): void => {
      const next = new Set(selectedPhotoIds.value);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      selectedPhotoIds.value = Array.from(next);
    };

    const selectAllVisiblePhotos = (): void => {
      selectedPhotoIds.value = filteredPhotos.value.map((item) => item.id);
    };

    const downloadPhoto = async (photoId: number): Promise<void> => {
      try {
        const response = await fetch(robotDogService.getPhotoUrl(photoId));
        if (!response.ok) {
          throw new Error(response.statusText || "下载失败");
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = `go2_${photoId}.jpg`;
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "下载失败";
        message.error(errorMessage);
      }
    };

    const downloadSelectedPhotos = (): void => {
      if (selectedPhotoIds.value.length === 0) {
        message.warning("未选择照片");
        return;
      }
      selectedPhotoIds.value.forEach((photoId) => {
        downloadPhoto(photoId).catch(() => undefined);
      });
      message.info(`正在下载 ${selectedPhotoIds.value.length} 张照片`);
    };

    const deletePhotos = async (photoIds: number[]): Promise<void> => {
      if (photoIds.length === 0) {
        message.warning("未选择照片");
        return;
      }
      let successCount = 0;
      for (const photoId of photoIds) {
        try {
          await robotDogService.deletePhoto(photoId);
          successCount += 1;
        } catch {
          // Keep deleting the remaining selected photos.
        }
      }
      if (successCount < photoIds.length) {
        message.warning(`删除失败 ${photoIds.length - successCount}/${photoIds.length} 张`);
      }
      selectedPhotoIds.value = [];
      photoPreviewVisible.value = false;
      await refreshPhotos();
    };

    const showCommandFailure = (response: RobotDogCommandResponse, fallback: string): void => {
      if (!response.success) {
        message.warning(response.detail || fallback);
      }
    };

    const runCommand = async (
      command: string,
      action: () => Promise<RobotDogCommandResponse>,
      options: RunCommandOptions = {},
    ): Promise<void> => {
      try {
        const response = await action();
        showCommandFailure(response, `${command}失败`);
        lastCommand.value = command;
        options.onSuccess?.();
        if (options.showSuccess && response.success) {
          message.success(response.detail || `${command}成功`);
        }
        if (options.refresh === "state" || options.refresh === "both") {
          await refreshState();
        }
        if (options.refresh === "runtime" || options.refresh === "both") {
          refreshRuntimeInfo().catch(() => undefined);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `${command}失败`;
        message.error(errorMessage);
      }
    };

    const move = async (payload: RobotDogMovePayload): Promise<RobotDogCommandResponse> => {
      return await robotDogService.move(payload);
    };

    const runMoveCommand = (command: string): void => {
      const moveSpeed = speed.value;
      const halfSpeed = Number((moveSpeed * 0.55).toFixed(2));
      const turnSpeed = Number(Math.min(moveSpeed, 1).toFixed(2));
      const timeoutMs = 3000;
      const movePayloads: Record<string, RobotDogMovePayload> = {
        左前: { vx: halfSpeed, vy: halfSpeed, vyaw: 0, timeout_ms: timeoutMs },
        前进: { vx: moveSpeed, vy: 0, vyaw: 0, timeout_ms: timeoutMs },
        右前: { vx: halfSpeed, vy: -halfSpeed, vyaw: 0, timeout_ms: timeoutMs },
        左移: { vx: 0, vy: halfSpeed, vyaw: 0, timeout_ms: timeoutMs },
        右移: { vx: 0, vy: -halfSpeed, vyaw: 0, timeout_ms: timeoutMs },
        左后: { vx: -halfSpeed, vy: halfSpeed, vyaw: 0, timeout_ms: timeoutMs },
        后退: { vx: -moveSpeed, vy: 0, vyaw: 0, timeout_ms: timeoutMs },
        右后: { vx: -halfSpeed, vy: -halfSpeed, vyaw: 0, timeout_ms: timeoutMs },
        左转: { vx: 0, vy: 0, vyaw: turnSpeed, timeout_ms: timeoutMs },
        右转: { vx: 0, vy: 0, vyaw: -turnSpeed, timeout_ms: timeoutMs },
      };

      if (command === "停止") {
        runCommand(command, robotDogService.stop, { refresh: "none" }).catch(() => undefined);
        return;
      }

      const payload = movePayloads[command];
      if (payload) {
        runCommand(command, async () => await move(payload), { refresh: "none" }).catch(() => undefined);
      }
    };

    const handleCommand = (command: string): void => {
      const handlers: Record<string, () => void> = {
        停止: () => runMoveCommand(command),
        左前: () => runMoveCommand(command),
        前进: () => runMoveCommand(command),
        右前: () => runMoveCommand(command),
        左移: () => runMoveCommand(command),
        右移: () => runMoveCommand(command),
        左后: () => runMoveCommand(command),
        后退: () => runMoveCommand(command),
        右后: () => runMoveCommand(command),
        左转: () => runMoveCommand(command),
        右转: () => runMoveCommand(command),
        站立: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/stand_up"), { showSuccess: true, refresh: "state" }).catch(
            () => undefined,
          ),
        卧倒: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/stand_down"), {
            showSuccess: true,
            refresh: "state",
          }).catch(() => undefined),
        坐下: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/sit"), { showSuccess: true, refresh: "state" }).catch(
            () => undefined,
          ),
        起立: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/rise_sit"), { showSuccess: true, refresh: "state" }).catch(
            () => undefined,
          ),
        平衡: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/balance_stand"), {
            showSuccess: true,
            refresh: "state",
          }).catch(() => undefined),
        开启避障: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/obstacle_avoidance/on"), {
            onSuccess: () => updateSystemStatus({ obstacleAvoidance: true }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined),
        关闭避障: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/obstacle_avoidance/off"), {
            onSuccess: () => updateSystemStatus({ obstacleAvoidance: false }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined),
        接管速度控制: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/remote_command/on"), {
            onSuccess: () => updateSystemStatus({ remoteCommand: true }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined),
        释放速度控制: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/remote_command/off"), {
            onSuccess: () => updateSystemStatus({ remoteCommand: false }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined),
        开启摇杆: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/joystick/on"), {
            onSuccess: () => updateSystemStatus({ joystick: true }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined),
        关闭摇杆: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/joystick/off"), {
            onSuccess: () => updateSystemStatus({ joystick: false }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined),
        开启自动恢复: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/auto_recovery/on"), {
            onSuccess: () => updateSystemStatus({ autoRecovery: true }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined),
        关闭自动恢复: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/auto_recovery/off"), {
            onSuccess: () => updateSystemStatus({ autoRecovery: false }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined),
        开启静音: () =>
          runCommand(command, async () => await robotDogService.setSilentMode(true), {
            onSuccess: () => updateSystemStatus({ silentMode: true }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined),
        关闭静音: () =>
          runCommand(command, async () => await robotDogService.setSilentMode(false), {
            onSuccess: () => updateSystemStatus({ silentMode: false }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined),
        开启VUI: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/vui_switch/on"), {
            onSuccess: () => updateSystemStatus({ vui: true }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined),
        关闭VUI: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/vui_switch/off"), {
            onSuccess: () => updateSystemStatus({ vui: false }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined),
        开启LiDAR: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/lidar/on"), {
            onSuccess: () => updateSystemStatus({ lidar: true }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined),
        关闭LiDAR: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/lidar/off"), {
            onSuccess: () => updateSystemStatus({ lidar: false }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined),
        速度低: () =>
          runCommand(command, async () => await robotDogService.setSpeedLevel(-1), {
            onSuccess: () => updateSystemStatus({ speedLevel: -1 }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined),
        速度正常: () =>
          runCommand(command, async () => await robotDogService.setSpeedLevel(0), {
            onSuccess: () => updateSystemStatus({ speedLevel: 0 }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined),
        速度高: () =>
          runCommand(command, async () => await robotDogService.setSpeedLevel(1), {
            onSuccess: () => updateSystemStatus({ speedLevel: 1 }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined),
        音量减: () => {
          const nextLevel = clampLevel(systemStatus.value.volume - 1);
          runCommand(command, async () => await robotDogService.setVolume(nextLevel), {
            onSuccess: () => updateSystemStatus({ volume: nextLevel }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined);
        },
        音量加: () => {
          const nextLevel = clampLevel(systemStatus.value.volume + 1);
          runCommand(command, async () => await robotDogService.setVolume(nextLevel), {
            onSuccess: () => updateSystemStatus({ volume: nextLevel }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined);
        },
        亮度减: () => {
          const nextLevel = clampLevel(systemStatus.value.brightness - 1);
          runCommand(command, async () => await robotDogService.setBrightness(nextLevel), {
            onSuccess: () => updateSystemStatus({ brightness: nextLevel }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined);
        },
        亮度加: () => {
          const nextLevel = clampLevel(systemStatus.value.brightness + 1);
          runCommand(command, async () => await robotDogService.setBrightness(nextLevel), {
            onSuccess: () => updateSystemStatus({ brightness: nextLevel }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined);
        },
        切MCF: () =>
          runCommand(command, async () => await robotDogService.selectMotionMode("mcf"), {
            onSuccess: () => updateSystemStatus({ motionMode: "MCF" }),
            showSuccess: true,
            refresh: "none",
          }).catch(() => undefined),
        释放运控: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/motion_mode/release"), {
            showSuccess: true,
            refresh: "state",
          }).catch(() => undefined),
        紧急停止: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/emergency_stop"), {
            onSuccess: () => {
              emergencyStopped.value = true;
            },
            showSuccess: true,
            refresh: "state",
          }).catch(() => undefined),
        解除急停: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/reset_emergency"), {
            onSuccess: () => {
              emergencyStopped.value = false;
            },
            showSuccess: true,
            refresh: "state",
          }).catch(() => undefined),
        泄力: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/damp"), { showSuccess: true, refresh: "state" }).catch(
            () => undefined,
          ),
        恢复站立: () =>
          runCommand(command, async () => await robotDogService.command("/api/v1/recovery_stand"), {
            showSuccess: true,
            refresh: "state",
          }).catch(() => undefined),
      };

      const handler = handlers[command];
      if (handler) {
        handler();
        return;
      }
      message.info(`${command}：暂未接入`);
    };

    const onVideoAction = (action: string): void => {
      if (action === "拍照并保存") {
        runCommand(action, async () => await robotDogService.command("/api/v1/snapshot"), {
          onSuccess: () => {
            refreshPhotos().catch(() => undefined);
          },
          refresh: "none",
        }).catch(() => undefined);
        return;
      }
      if (action.startsWith("打开照片:")) {
        const photoId = Number(action.split(":")[1]);
        if (photos.value.some((item) => item.id === photoId)) {
          openPhotoPreview(photoId);
        }
        return;
      }
      if (action === "复制地址") {
        navigator.clipboard
          .writeText(robotDogService.videoStreamUrl)
          .then(() => message.success("视频流地址已复制"))
          .catch(() => message.error("复制失败，请手动复制地址"));
        return;
      }
      if (action === "暂停视频" || action === "恢复视频") {
        videoPaused.value = !videoPaused.value;
        message.info(videoPaused.value ? "已暂停视频画面" : "已开始播放视频画面");
        return;
      }
      if (action === "查看全部截图") {
        openPhotoDrawer();
        return;
      }
      message.info(`${action}：当前版本暂未接入`);
    };

    const handleKeydown = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
        return;
      }
      if (event.key === "Escape") {
        if (photoPreviewVisible.value) {
          event.preventDefault();
          photoPreviewVisible.value = false;
          return;
        }
        if (photoDrawerOpen.value) {
          event.preventDefault();
          closePhotoDrawer();
          return;
        }
      }
      if (photoPreviewVisible.value) {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          switchPhotoPreview(-1);
          return;
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          switchPhotoPreview(1);
          return;
        }
      }
      const keyCommandMap: Record<string, string> = {
        w: "前进",
        a: "左移",
        s: "后退",
        d: "右移",
        q: "左转",
        e: "右转",
        " ": "停止",
        escape: "紧急停止",
        "1": "站立",
        "2": "卧倒",
        "3": "坐下",
        "4": "起立",
        "5": "平衡",
        "6": "恢复站立",
      };
      const command = keyCommandMap[event.key.toLowerCase()];
      if (command) {
        event.preventDefault();
        handleCommand(command);
      }
    };

    onMounted(() => {
      refreshState().catch(() => undefined);
      refreshRuntimeInfo().catch(() => undefined);
      refreshPhotos().catch(() => undefined);
      stateTimer = window.setInterval(() => {
        refreshState().catch(() => undefined);
      }, 1000);
      settingsTimer = window.setInterval(() => {
        refreshRuntimeInfo().catch(() => undefined);
      }, 10000);
      window.addEventListener("keydown", handleKeydown);
    });

    onUnmounted(() => {
      if (stateTimer !== null) {
        window.clearInterval(stateTimer);
      }
      if (settingsTimer !== null) {
        window.clearInterval(settingsTimer);
      }
      window.removeEventListener("keydown", handleKeydown);
    });

    return () => (
      <main class="robot-dog-control">
        <header class="robot-topbar">
          <button
            class="robot-topbar-back"
            onClick={() => {
              router.push({ name: "dashboard" }).catch(() => undefined);
            }}
          >
            <ArrowLeftOutlined />
            返回
          </button>
          <div class="robot-system-title">
            <strong>机器狗操控中心</strong>
          </div>
          <div class="robot-top-status">
            <span>
              连接 <strong class={{ connected: connectionText.value === "已连接" }}>{connectionText.value}</strong>
            </span>
            <span>电量 {currentState.value ? `${currentState.value.battery_percent}%` : "--"}</span>
            <span>急停 {emergencyStopped.value ? "是" : "否"}</span>
            <span>模式 {currentState.value?.control_mode || systemStatus.value.motionMode}</span>
            <Button danger type="primary" onClick={() => handleCommand("紧急停止")}>
              紧急停止
            </Button>
          </div>
        </header>

        <div class="robot-content">
          <div class="robot-video-area">
            <RobotVideoStage
              imageUrl={liveViewUrl}
              streamUrl={robotDogService.videoStreamUrl}
              paused={videoPaused.value}
              fpsText={videoPaused.value ? "0 FPS" : "0 FPS"}
              onAction={onVideoAction}
            />
            <RobotVideoFooter
              streamUrl={robotDogService.videoStreamUrl}
              paused={videoPaused.value}
              latencyText={stateLoadFailed.value ? "--" : "在线"}
              fpsText={videoPaused.value ? "0 FPS" : "0 FPS"}
              lastCommand={lastCommand.value}
              uptimeText={`${Math.floor(uptimeSeconds.value)}s`}
              driverMode={driverMode.value}
              photos={photos.value}
              photoTotal={photoTotal.value}
              getPhotoUrl={robotDogService.getPhotoUrl}
              onAction={onVideoAction}
            />
          </div>
          <RobotControlPanel
            activeTab={activeTab.value}
            metrics={metrics.value}
            speed={speed.value}
            systemStatus={systemStatus.value}
            activeQuickMode={activeQuickMode.value}
            onCommand={handleCommand}
            onUpdate:activeTab={(tab: RobotTabKey) => {
              activeTab.value = tab;
            }}
            onUpdate:speed={(value: number) => {
              speed.value = value;
            }}
          />
        </div>
        <Drawer
          open={photoDrawerOpen.value}
          title="照片相册"
          width="min(880px, 92vw)"
          wrapClassName="robot-photo-drawer"
          rootClassName="robot-photo-drawer"
          destroyOnClose
          headerStyle={{ background: "rgba(8, 18, 32, 0.98)", borderBottom: "1px solid rgba(91, 130, 184, 0.18)" }}
          bodyStyle={{ padding: 0, overflow: "hidden", background: "#061226" }}
          drawerStyle={{ background: "rgba(8, 18, 32, 0.98)" }}
          styles={{ body: { padding: 0, overflow: "hidden", background: "#061226" } }}
          onClose={closePhotoDrawer}
        >
          <div class="robot-photo-drawer-body">
            <div class="robot-photo-toolbar">
              <DateRangePicker
                value={photoDateRange.value}
                onUpdate:value={(value: [string, string]) => {
                  photoDateRange.value = value;
                }}
              />
              <Button type="primary" onClick={() => onVideoAction("拍照并保存")}>
                拍照
              </Button>
              <Button type="primary" onClick={() => refreshPhotos().catch(() => undefined)}>
                查询
              </Button>
              <Button type="primary" onClick={toggleBatchMode}>
                {photoBatchMode.value ? "退出多选" : "多选"}
              </Button>
              {photoBatchMode.value ? (
                <>
                  <Button type="primary" onClick={selectAllVisiblePhotos}>
                    全选
                  </Button>
                  <PopConfirm
                    title={`确定删除 ${selectedPhotoIds.value.length} 张照片？`}
                    okText="删除"
                    cancelText="取消"
                    disabled={selectedPhotoIds.value.length === 0}
                    onConfirm={() => {
                      deletePhotos(selectedPhotoIds.value).catch(() => undefined);
                    }}
                  >
                    <Button danger disabled={selectedPhotoIds.value.length === 0}>
                      删除已选{selectedPhotoIds.value.length ? `(${selectedPhotoIds.value.length})` : ""}
                    </Button>
                  </PopConfirm>
                  <Button type="primary" onClick={downloadSelectedPhotos}>
                    下载已选{selectedPhotoIds.value.length ? `(${selectedPhotoIds.value.length})` : ""}
                  </Button>
                </>
              ) : null}
            </div>
            <div class="robot-photo-stats">
              共 {photoTotal.value} 张 · 当前显示 {filteredPhotos.value.length} 张
            </div>
            {filteredPhotos.value.length > 0 ? (
              <div class="robot-photo-grid">
                {filteredPhotos.value.map((photo) => (
                  <div
                    class={{ "robot-photo-card": true, selected: selectedPhotoSet.value.has(photo.id), batch: photoBatchMode.value }}
                    key={photo.id}
                    onClick={() => (photoBatchMode.value ? togglePhotoSelect(photo.id) : openPhotoPreview(photo.id))}
                  >
                    {photoBatchMode.value ? (
                      <Checkbox
                        class="robot-photo-check"
                        checked={selectedPhotoSet.value.has(photo.id)}
                        onClick={(event: Event) => event.stopPropagation()}
                        onChange={() => togglePhotoSelect(photo.id)}
                      />
                    ) : null}
                    <Image src={robotDogService.getPhotoUrl(photo.id)} alt={photo.filename} preview={false} />
                    <div class="robot-photo-card-meta">
                      <strong>#{photo.id}</strong>
                      <span>{formatPhotoTime(photo.saved_at)}</span>
                      <span>{Math.round(photo.size_bytes / 1024)} KB</span>
                    </div>
                    <div class="robot-photo-card-actions" onClick={(event) => event.stopPropagation()}>
                      <Button
                        type="link"
                        onClick={() => {
                          downloadPhoto(photo.id).catch(() => undefined);
                        }}
                      >
                        下载
                      </Button>
                      <PopConfirm
                        title="确定删除该照片？"
                        okText="删除"
                        cancelText="取消"
                        onConfirm={() => {
                          deletePhotos([photo.id]).catch(() => undefined);
                        }}
                      >
                        <Button type="link" danger>
                          删除
                        </Button>
                      </PopConfirm>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div class="robot-photo-empty">
                <Empty description="暂无照片" />
              </div>
            )}
            {photos.value.length < photoTotal.value ? (
              <div class="robot-photo-load-more">
                <Button onClick={() => loadMorePhotos().catch(() => undefined)}>加载更多</Button>
              </div>
            ) : null}
          </div>
        </Drawer>
        <ImagePreviewGroup
          preview={{
            visible: photoPreviewVisible.value,
            current: photoPreviewIndex.value,
            onVisibleChange: (visible: boolean) => {
              photoPreviewVisible.value = visible;
            },
            onChange: (currentIndex: number) => {
              photoPreviewIndex.value = currentIndex;
            },
          }}
        >
          {previewPhotos.value.map((photo) => (
            <Image src={robotDogService.getPhotoUrl(photo.id)} style={{ display: "none" }} key={photo.id} />
          ))}
        </ImagePreviewGroup>
      </main>
    );
  },
});
