import { computed, onBeforeUnmount, onMounted, shallowRef, type ComputedRef, type ShallowRef } from "vue";

import {
  robotDogService,
  type RobotDogCommandResponse,
  type RobotDogMovePayload,
  type RobotDogPhotoInfo,
  type RobotDogStateResponse,
} from "@/api/robot-dog-service";

export interface RobotDogMetric {
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
}

export interface RobotDogSystemStatus {
  obstacleAvoidance: boolean;
  remoteCommand: boolean;
  joystick: boolean;
  autoRecovery: boolean;
  silentMode: boolean;
  vui: boolean;
  lidar: boolean;
  speedLevel: -1 | 0 | 1;
  volume: number;
  brightness: number;
  motionMode: string;
}

export interface RobotDogControllerOptions {
  autoStart?: boolean;
  stateIntervalMs?: number;
  runtimeIntervalMs?: number;
  onSuccess?: (message: string) => void;
  onWarning?: (message: string) => void;
  onError?: (message: string) => void;
  onInfo?: (message: string) => void;
}

export interface RobotDogController {
  currentState: ShallowRef<RobotDogStateResponse | null>;
  stateLoadFailed: ShallowRef<boolean>;
  emergencyStopped: ShallowRef<boolean>;
  videoPaused: ShallowRef<boolean>;
  lastCommand: ShallowRef<string>;
  uptimeSeconds: ShallowRef<number>;
  driverMode: ShallowRef<string>;
  speed: ShallowRef<number>;
  photos: ShallowRef<RobotDogPhotoInfo[]>;
  photoTotal: ShallowRef<number>;
  systemStatus: ShallowRef<RobotDogSystemStatus>;
  metrics: ComputedRef<RobotDogMetric[]>;
  connectionText: ComputedRef<string>;
  activeQuickMode: ComputedRef<string>;
  videoStreamUrl: string;
  /** 手动刷新一次机器狗状态、运行配置和照片列表。 */
  refresh: () => Promise<void>;
  /** 刷新机器狗实时状态，例如电量、姿态、高度、连接状态。 */
  refreshState: () => Promise<void>;
  /** 刷新机器狗运行配置，例如避障、静音、音量、亮度、运动模式。 */
  refreshRuntimeInfo: () => Promise<void>;
  /** 拉取最新照片列表，用于拍照后刷新相册和实时画面缩略图。 */
  refreshPhotos: () => Promise<void>;
  /** 按当前照片数量继续分页加载相册。 */
  loadMorePhotos: () => Promise<void>;
  /** 设置移动速度系数，影响前进、后退、平移、转向命令的速度 payload。 */
  setSpeed: (value: number) => void;
  /** 只切换前端视频暂停状态，不向机器狗硬件下发命令。 */
  toggleVideoPaused: () => void;
  /** 按中文操作名执行机器狗命令，内部会路由到移动、姿态、安全或系统配置命令。 */
  runCommand: (command: string) => Promise<void>;
  /** 下发底盘移动命令，包含 3 秒自动停止超时时间。 */
  runMoveCommand: (command: string) => Promise<void>;
  /** 触发机器狗抓拍并保存照片，成功后刷新照片列表。 */
  snapshot: () => Promise<void>;
  /** 下载指定照片到本地浏览器下载目录。 */
  downloadPhoto: (photoId: number) => Promise<void>;
  /** 删除指定照片，逐张删除并在结束后刷新照片列表。 */
  deletePhotos: (photoIds: number[]) => Promise<void>;
  getPhotoUrl: (photoId: number) => string;
  /** 启动状态和运行配置轮询；重复调用不会创建重复定时器。 */
  startPolling: () => void;
  /** 停止轮询，页面切换或卸载时必须调用，避免后台继续请求机器狗服务。 */
  stopPolling: () => void;
}

type CommandRefreshMode = "none" | "state" | "runtime" | "both";

interface RunCommandOptions {
  onSuccess?: () => void;
  showSuccess?: boolean;
  refresh?: CommandRefreshMode;
}

const fallbackMetrics: RobotDogMetric[] = [
  { label: "电池", value: "84%", accent: true },
  { label: "运动模式", value: "standing", accent: true },
  { label: "高度（Z）", value: "0.35", suffix: "M", accent: true },
  { label: "Roll", value: "0.01", suffix: "RAD", accent: true },
  { label: "Pitch", value: "0.00", suffix: "RAD", accent: true },
  { label: "Yaw", value: "0.00", suffix: "RAD", accent: true },
];

const defaultSystemStatus: RobotDogSystemStatus = {
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

export const useRobotDogController = (options: RobotDogControllerOptions = {}): RobotDogController => {
  const currentState = shallowRef<RobotDogStateResponse | null>(null);
  const stateLoadFailed = shallowRef(false);
  const emergencyStopped = shallowRef(false);
  const videoPaused = shallowRef(false);
  const lastCommand = shallowRef("--");
  const uptimeSeconds = shallowRef(0);
  const driverMode = shallowRef("mock");
  const speed = shallowRef(1.2);
  const photos = shallowRef<RobotDogPhotoInfo[]>([]);
  const photoTotal = shallowRef(0);
  const systemStatus = shallowRef<RobotDogSystemStatus>({ ...defaultSystemStatus });
  let stateTimer: number | null = null;
  let runtimeTimer: number | null = null;

  const notifySuccess = (text: string): void => options.onSuccess?.(text);
  const notifyWarning = (text: string): void => options.onWarning?.(text);
  const notifyError = (text: string): void => options.onError?.(text);
  const notifyInfo = (text: string): void => options.onInfo?.(text);

  const updateSystemStatus = (patch: Partial<RobotDogSystemStatus>): void => {
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

  const metrics = computed<RobotDogMetric[]>(() => {
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

  /** 刷新机器狗实时状态：电量、姿态、位置、连接状态和当前运动模式都从这里同步。 */
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

  /** 读取运行时开关配置。该刷新频率低于实时状态，避免高频打到硬件控制服务。 */
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

  /** 重新拉取首屏照片列表；拍照成功、删除照片后都调用它同步相册。 */
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

  /** 按当前照片数量继续分页加载，供相册滚动加载更多历史抓拍。 */
  const loadMorePhotos = async (): Promise<void> => {
    try {
      const result = await robotDogService.getPhotos({ offset: photos.value.length, limit: 30 });
      photos.value = [...photos.value, ...result.photos];
      photoTotal.value = result.total;
    } catch {
      notifyError("加载更多照片失败");
    }
  };

  /** 一次性刷新机器狗页面所需的状态、运行配置和照片列表。 */
  const refresh = async (): Promise<void> => {
    await Promise.all([refreshState(), refreshRuntimeInfo(), refreshPhotos()]);
  };

  const showCommandFailure = (response: RobotDogCommandResponse, fallback: string): void => {
    if (!response.success) {
      notifyWarning(response.detail || fallback);
    }
  };

  /**
   * 统一执行机器狗硬件命令。
   *
   * 这里负责记录最后指令、展示成功/失败提示，并根据 refresh 配置决定是否刷新实时状态或运行配置。
   * 移动、急停、姿态切换等真实控制命令最终都会经过这里，硬件急停锁定时接口可能抛出 423。
   */
  const runHardwareCommand = async (
    command: string,
    action: () => Promise<RobotDogCommandResponse>,
    commandOptions: RunCommandOptions = {},
  ): Promise<void> => {
    try {
      const response = await action();
      showCommandFailure(response, `${command}失败`);
      lastCommand.value = command;
      commandOptions.onSuccess?.();
      if (commandOptions.showSuccess && response.success) {
        notifySuccess(response.detail || `${command}成功`);
      }
      if (commandOptions.refresh === "state" || commandOptions.refresh === "both") {
        await refreshState();
      }
      if (commandOptions.refresh === "runtime" || commandOptions.refresh === "both") {
        refreshRuntimeInfo().catch(() => undefined);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `${command}失败`;
      notifyError(errorMessage);
    }
  };

  /**
   * 执行机器狗底盘移动。
   *
   * - 前进/后退：设置 vx，控制机身前后移动。
   * - 左移/右移：设置 vy，控制机身横向平移。
   * - 左前/右前/左后/右后：组合 vx + vy，控制斜向移动。
   * - 左转/右转：设置 vyaw，控制原地转向。
   * - 停止：调用 stop 接口立即停止当前移动。
   *
   * 这些命令会直接下发到底盘；如果机器狗处于急停锁定，硬件服务可能返回 HTTP 423。
   */
  const runMoveCommand = async (command: string): Promise<void> => {
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
      await runHardwareCommand(command, robotDogService.stop, { refresh: "none" });
      return;
    }

    const payload = movePayloads[command];
    if (payload) {
      await runHardwareCommand(command, async () => await robotDogService.move(payload), { refresh: "none" });
    }
  };

  /**
   * 根据页面按钮文案派发机器狗操作。
   *
   * 移动类命令会交给 runMoveCommand 计算速度 payload；其他命令在 commandHandlers 中逐项映射到硬件接口。
   * 每个 commandHandlers 注释都说明该按钮对机器狗的实际影响，方便后续对照原型或硬件文档调整。
   */
  const runCommand = async (command: string): Promise<void> => {
    if (["停止", "左前", "前进", "右前", "左移", "右移", "左后", "后退", "右后", "左转", "右转"].includes(command)) {
      await runMoveCommand(command);
      return;
    }

    const commandHandlers: Record<string, () => Promise<void>> = {
      // 站立：让机器狗从当前姿态进入标准站立姿态，适合开始移动前调用。
      站立: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/stand_up"), {
          showSuccess: true,
          refresh: "state",
        }),
      // 卧倒：让机器狗趴下，通常用于结束任务或降低机身重心。
      卧倒: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/stand_down"), {
          showSuccess: true,
          refresh: "state",
        }),
      // 坐下：让机器狗进入坐姿，属于低风险姿态切换。
      坐下: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/sit"), {
          showSuccess: true,
          refresh: "state",
        }),
      // 起立：让机器狗从坐姿起立，成功后刷新姿态状态。
      起立: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/rise_sit"), {
          showSuccess: true,
          refresh: "state",
        }),
      // 平衡：进入平衡站立模式，用于恢复稳定站姿。
      平衡: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/balance_stand"), {
          showSuccess: true,
          refresh: "state",
        }),
      // 恢复站立：从异常姿态或跌倒恢复到站立，调用前应确认周围安全。
      恢复站立: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/recovery_stand"), {
          showSuccess: true,
          refresh: "state",
        }),
      // 开启避障：打开机器狗避障能力，SDK 同步更新本地开关状态。
      开启避障: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/obstacle_avoidance/on"), {
          onSuccess: () => updateSystemStatus({ obstacleAvoidance: true }),
          showSuccess: true,
          refresh: "none",
        }),
      // 关闭避障：关闭机器狗避障能力，仅用于需要人工精细接管的场景。
      关闭避障: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/obstacle_avoidance/off"), {
          onSuccess: () => updateSystemStatus({ obstacleAvoidance: false }),
          showSuccess: true,
          refresh: "none",
        }),
      // 接管速度控制：允许前端速度指令接管机器狗底盘移动。
      接管速度控制: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/remote_command/on"), {
          onSuccess: () => updateSystemStatus({ remoteCommand: true }),
          showSuccess: true,
          refresh: "none",
        }),
      // 释放速度控制：释放前端速度接管，避免页面离开后仍保持远程控制。
      释放速度控制: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/remote_command/off"), {
          onSuccess: () => updateSystemStatus({ remoteCommand: false }),
          showSuccess: true,
          refresh: "none",
        }),
      // 开启摇杆：启用摇杆输入通道。
      开启摇杆: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/joystick/on"), {
          onSuccess: () => updateSystemStatus({ joystick: true }),
          showSuccess: true,
          refresh: "none",
        }),
      // 关闭摇杆：停用摇杆输入通道，避免和前端控制同时抢控制权。
      关闭摇杆: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/joystick/off"), {
          onSuccess: () => updateSystemStatus({ joystick: false }),
          showSuccess: true,
          refresh: "none",
        }),
      // 开启自动恢复：允许机器狗在异常姿态后自动尝试恢复。
      开启自动恢复: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/auto_recovery/on"), {
          onSuccess: () => updateSystemStatus({ autoRecovery: true }),
          showSuccess: true,
          refresh: "none",
        }),
      // 关闭自动恢复：关闭姿态自动恢复，便于人工安全处置。
      关闭自动恢复: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/auto_recovery/off"), {
          onSuccess: () => updateSystemStatus({ autoRecovery: false }),
          showSuccess: true,
          refresh: "none",
        }),
      // 开启静音：让机器狗进入静音模式。
      开启静音: async () =>
        await runHardwareCommand(command, async () => await robotDogService.setSilentMode(true), {
          onSuccess: () => updateSystemStatus({ silentMode: true }),
          showSuccess: true,
          refresh: "none",
        }),
      // 关闭静音：恢复机器狗声音输出。
      关闭静音: async () =>
        await runHardwareCommand(command, async () => await robotDogService.setSilentMode(false), {
          onSuccess: () => updateSystemStatus({ silentMode: false }),
          showSuccess: true,
          refresh: "none",
        }),
      // 开启VUI：开启语音交互输入输出。
      开启VUI: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/vui_switch/on"), {
          onSuccess: () => updateSystemStatus({ vui: true }),
          showSuccess: true,
          refresh: "none",
        }),
      // 关闭VUI：关闭语音交互，适合安静巡检场景。
      关闭VUI: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/vui_switch/off"), {
          onSuccess: () => updateSystemStatus({ vui: false }),
          showSuccess: true,
          refresh: "none",
        }),
      // 开启LiDAR：开启雷达能力，供避障或环境感知使用。
      开启LiDAR: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/lidar/on"), {
          onSuccess: () => updateSystemStatus({ lidar: true }),
          showSuccess: true,
          refresh: "none",
        }),
      // 关闭LiDAR：关闭雷达能力，降低设备负载。
      关闭LiDAR: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/lidar/off"), {
          onSuccess: () => updateSystemStatus({ lidar: false }),
          showSuccess: true,
          refresh: "none",
        }),
      // 速度低：切换机器狗硬件速度档为低速。
      速度低: async () =>
        await runHardwareCommand(command, async () => await robotDogService.setSpeedLevel(-1), {
          onSuccess: () => updateSystemStatus({ speedLevel: -1 }),
          showSuccess: true,
          refresh: "none",
        }),
      // 速度正常：切换机器狗硬件速度档为正常档。
      速度正常: async () =>
        await runHardwareCommand(command, async () => await robotDogService.setSpeedLevel(0), {
          onSuccess: () => updateSystemStatus({ speedLevel: 0 }),
          showSuccess: true,
          refresh: "none",
        }),
      // 速度高：切换机器狗硬件速度档为高速，需确认现场空间安全。
      速度高: async () =>
        await runHardwareCommand(command, async () => await robotDogService.setSpeedLevel(1), {
          onSuccess: () => updateSystemStatus({ speedLevel: 1 }),
          showSuccess: true,
          refresh: "none",
        }),
      // 音量减：将 VUI/提示音音量降低 1 档。
      音量减: async () => {
        const nextLevel = clampLevel(systemStatus.value.volume - 1);
        await runHardwareCommand(command, async () => await robotDogService.setVolume(nextLevel), {
          onSuccess: () => updateSystemStatus({ volume: nextLevel }),
          showSuccess: true,
          refresh: "none",
        });
      },
      // 音量加：将 VUI/提示音音量提高 1 档。
      音量加: async () => {
        const nextLevel = clampLevel(systemStatus.value.volume + 1);
        await runHardwareCommand(command, async () => await robotDogService.setVolume(nextLevel), {
          onSuccess: () => updateSystemStatus({ volume: nextLevel }),
          showSuccess: true,
          refresh: "none",
        });
      },
      // 亮度减：降低机器狗灯光或屏幕亮度 1 档。
      亮度减: async () => {
        const nextLevel = clampLevel(systemStatus.value.brightness - 1);
        await runHardwareCommand(command, async () => await robotDogService.setBrightness(nextLevel), {
          onSuccess: () => updateSystemStatus({ brightness: nextLevel }),
          showSuccess: true,
          refresh: "none",
        });
      },
      // 亮度加：提高机器狗灯光或屏幕亮度 1 档。
      亮度加: async () => {
        const nextLevel = clampLevel(systemStatus.value.brightness + 1);
        await runHardwareCommand(command, async () => await robotDogService.setBrightness(nextLevel), {
          onSuccess: () => updateSystemStatus({ brightness: nextLevel }),
          showSuccess: true,
          refresh: "none",
        });
      },
      // 切MCF：切换到 MCF 运动控制模式，便于前端移动控制。
      切MCF: async () =>
        await runHardwareCommand(command, async () => await robotDogService.selectMotionMode("mcf"), {
          onSuccess: () => updateSystemStatus({ motionMode: "MCF" }),
          showSuccess: true,
          refresh: "none",
        }),
      // 释放运控：释放当前运动控制模式，并刷新机器狗状态。
      释放运控: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/motion_mode/release"), {
          showSuccess: true,
          refresh: "state",
        }),
      // 紧急停止：立即触发硬件急停，后续移动命令会被锁定，通常返回 HTTP 423。
      紧急停止: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/emergency_stop"), {
          onSuccess: () => {
            emergencyStopped.value = true;
          },
          showSuccess: true,
          refresh: "state",
        }),
      // 解除急停：解除硬件急停锁定，调用前应确认现场安全。
      解除急停: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/reset_emergency"), {
          onSuccess: () => {
            emergencyStopped.value = false;
          },
          showSuccess: true,
          refresh: "state",
        }),
      // 泄力：让机器狗进入电机泄力/瘫软状态，属于高风险安全操作。
      泄力: async () =>
        await runHardwareCommand(command, async () => await robotDogService.command("/api/v1/damp"), {
          showSuccess: true,
          refresh: "state",
        }),
      // 拍照并保存：触发机身摄像头抓拍，成功后刷新照片列表。
      拍照并保存: async () => await snapshot(),
    };

    const handler = commandHandlers[command];
    if (handler) {
      await handler();
      return;
    }
    notifyInfo(`${command}：暂未接入`);
  };

  /** 触发机器狗摄像头抓拍；成功后会刷新照片列表，供实时画面和相册使用。 */
  const snapshot = async (): Promise<void> => {
    await runHardwareCommand("拍照并保存", async () => await robotDogService.command("/api/v1/snapshot"), {
      onSuccess: () => {
        refreshPhotos().catch(() => undefined);
      },
      showSuccess: true,
      refresh: "none",
    });
  };

  /** 设置前端移动速度系数；它不会直接下发硬件命令，只影响下一次移动 payload。 */
  const setSpeed = (value: number): void => {
    speed.value = Math.max(0.2, Math.min(1.2, Number(value.toFixed(1))));
  };

  /** 暂停/恢复前端视频显示；该动作只影响 UI，不停止机器狗视频流服务。 */
  const toggleVideoPaused = (): void => {
    videoPaused.value = !videoPaused.value;
  };

  /** 下载指定抓拍照片：通过照片接口取回 blob，再触发浏览器本地下载。 */
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
      notifyError(errorMessage);
    }
  };

  /** 删除指定抓拍照片：逐张调用删除接口，单张失败不会中断后续删除。 */
  const deletePhotos = async (photoIds: number[]): Promise<void> => {
    if (photoIds.length === 0) {
      notifyWarning("未选择照片");
      return;
    }
    let successCount = 0;
    for (const photoId of photoIds) {
      try {
        await robotDogService.deletePhoto(photoId);
        successCount += 1;
      } catch {
        // 单张删除失败不阻断后续照片删除，结束后统一提示失败数量。
      }
    }
    if (successCount < photoIds.length) {
      notifyWarning(`删除失败 ${photoIds.length - successCount}/${photoIds.length} 张`);
    }
    await refreshPhotos();
  };

  /** 启动轮询：实时状态 1 秒刷新一次，运行配置默认 10 秒刷新一次。 */
  const startPolling = (): void => {
    if (stateTimer !== null || runtimeTimer !== null) {
      return;
    }
    refresh().catch(() => undefined);
    stateTimer = window.setInterval(() => {
      refreshState().catch(() => undefined);
    }, options.stateIntervalMs ?? 1000);
    runtimeTimer = window.setInterval(() => {
      refreshRuntimeInfo().catch(() => undefined);
    }, options.runtimeIntervalMs ?? 10000);
  };

  /** 停止轮询：机器狗页面卸载或切换到其他巡检模式时调用，避免后台持续请求硬件服务。 */
  const stopPolling = (): void => {
    if (stateTimer !== null) {
      window.clearInterval(stateTimer);
      stateTimer = null;
    }
    if (runtimeTimer !== null) {
      window.clearInterval(runtimeTimer);
      runtimeTimer = null;
    }
  };

  if (options.autoStart ?? true) {
    onMounted(startPolling);
  }

  onBeforeUnmount(stopPolling);

  return {
    currentState,
    stateLoadFailed,
    emergencyStopped,
    videoPaused,
    lastCommand,
    uptimeSeconds,
    driverMode,
    speed,
    photos,
    photoTotal,
    systemStatus,
    metrics,
    connectionText,
    activeQuickMode,
    videoStreamUrl: robotDogService.videoStreamUrl,
    refresh,
    refreshState,
    refreshRuntimeInfo,
    refreshPhotos,
    loadMorePhotos,
    setSpeed,
    toggleVideoPaused,
    runCommand,
    runMoveCommand,
    snapshot,
    downloadPhoto,
    deletePhotos,
    getPhotoUrl: robotDogService.getPhotoUrl,
    startPolling,
    stopPolling,
  };
};

export const createRobotDogController = useRobotDogController;
