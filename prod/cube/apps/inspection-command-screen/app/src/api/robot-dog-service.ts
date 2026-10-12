export const ROBOT_DOG_API_BASE_URL = "http://192.168.2.95:7020";

export interface RobotDogCommandResponse {
  success: boolean;
  command: string;
  trace_id: string;
  detail?: string;
  timestamp?: string;
}

export interface RobotDogStateResponse {
  timestamp: number;
  battery_voltage: number;
  battery_percent: number;
  motor_temperatures: number[];
  imu_angular: [number, number, number];
  imu_accel: [number, number, number];
  position: [number, number, number];
  velocity: [number, number, number];
  foot_force: number[];
  control_mode: string;
  is_connected: boolean;
  errors: string[];
  connection_state?: string;
  last_heartbeat_ago?: number;
  imu_quaternion?: [number, number, number, number];
  imu_rpy?: [number, number, number];
  foot_force_est?: number[];
  fan_frequency?: number[];
  wireless_remote?: number[];
  remote_controller?: Record<string, unknown>;
  bit_flag?: number;
  battery_current?: number;
  battery_cycle?: number;
  bms_cell_voltages?: number[];
  bms_ntc_temps?: number[];
  bms_mcu_ntc_temps?: number[];
  board_ntc_temps?: number[];
  motor_current?: number;
  imu_temperature?: number;
  lidar_range?: Record<string, unknown>;
  lidar_enabled?: boolean;
}

export interface RobotDogMovePayload {
  vx: number;
  vy: number;
  vyaw: number;
  timeout_ms?: number;
}

export interface RobotDogLevelPayload {
  level: number;
}

export interface RobotDogHealthResponse {
  connection_state?: string;
  driver_mode?: string;
  uptime_seconds?: number;
  emergency_stopped?: boolean;
}

export interface RobotDogRuntimeConfig {
  move_timeout_ms?: number;
  motor_temp_warning?: number;
  motor_temp_critical?: number;
  battery_warning_percent?: number;
}

export interface RobotDogSwitchState {
  enabled?: boolean;
}

export interface RobotDogLevelState {
  level?: number;
}

export interface RobotDogPhotoInfo {
  id: number;
  filename: string;
  saved_at: number;
  size_bytes: number;
  note: string;
}

export interface RobotDogPhotoListResponse {
  total: number;
  offset: number;
  limit: number;
  photos: RobotDogPhotoInfo[];
}

const getErrorMessage = async (response: Response): Promise<string> => {
  if (response.status === 423) {
    return "急停锁定，需解除急停";
  }

  try {
    const data = (await response.json()) as { detail?: string | Array<{ msg?: string }> };
    if (typeof data.detail === "string" && data.detail) {
      return data.detail;
    }
    if (Array.isArray(data.detail)) {
      const firstMessage = data.detail.find((item) => item.msg)?.msg;
      if (firstMessage) {
        return firstMessage;
      }
    }
  } catch {
    // Ignore malformed error bodies and fall back to the HTTP status text.
  }

  return response.statusText || `请求失败：${response.status}`;
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${ROBOT_DOG_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as T;
};

const postCommand = async (path: string, body?: unknown): Promise<RobotDogCommandResponse> => {
  return await requestJson<RobotDogCommandResponse>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
};

export const robotDogService = {
  baseUrl: ROBOT_DOG_API_BASE_URL,
  videoStreamUrl: `${ROBOT_DOG_API_BASE_URL}/api/v1/video/stream`,
  getState: async (): Promise<RobotDogStateResponse> => {
    return await requestJson<RobotDogStateResponse>("/api/v1/state");
  },
  getHealth: async (): Promise<RobotDogHealthResponse> => {
    return await requestJson<RobotDogHealthResponse>("/health");
  },
  getConfig: async (): Promise<RobotDogRuntimeConfig> => {
    return await requestJson<RobotDogRuntimeConfig>("/api/v1/config");
  },
  getObstacleAvoidance: async (): Promise<RobotDogSwitchState> => {
    return await requestJson<RobotDogSwitchState>("/api/v1/obstacle_avoidance");
  },
  getAutoRecovery: async (): Promise<RobotDogSwitchState> => {
    return await requestJson<RobotDogSwitchState>("/api/v1/auto_recovery");
  },
  getSilentMode: async (): Promise<RobotDogSwitchState> => {
    return await requestJson<RobotDogSwitchState>("/api/v1/silent_mode");
  },
  getVuiSwitch: async (): Promise<RobotDogSwitchState> => {
    return await requestJson<RobotDogSwitchState>("/api/v1/vui_switch");
  },
  getVolume: async (): Promise<RobotDogLevelState> => {
    return await requestJson<RobotDogLevelState>("/api/v1/volume");
  },
  getBrightness: async (): Promise<RobotDogLevelState> => {
    return await requestJson<RobotDogLevelState>("/api/v1/brightness");
  },
  getMotionMode: async (): Promise<{ mode?: string; name?: string }> => {
    return await requestJson<{ mode?: string; name?: string }>("/api/v1/motion_mode");
  },
  getPhotos: async (params?: { offset?: number; limit?: number }): Promise<RobotDogPhotoListResponse> => {
    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? 15;
    return await requestJson<RobotDogPhotoListResponse>(`/api/v1/photos?offset=${offset}&limit=${limit}`);
  },
  getPhotoUrl: (photoId: number): string => {
    return `${ROBOT_DOG_API_BASE_URL}/api/v1/photos/${photoId}`;
  },
  getPhotoInfo: async (photoId: number): Promise<RobotDogPhotoInfo> => {
    return await requestJson<RobotDogPhotoInfo>(`/api/v1/photos/${photoId}/info`);
  },
  deletePhoto: async (photoId: number): Promise<void> => {
    await requestJson<unknown>(`/api/v1/photos/${photoId}`, { method: "DELETE" });
  },
  move: async (payload: RobotDogMovePayload): Promise<RobotDogCommandResponse> => {
    return await postCommand("/api/v1/move", payload);
  },
  stop: async (): Promise<RobotDogCommandResponse> => {
    return await postCommand("/api/v1/stop");
  },
  command: postCommand,
  setSpeedLevel: async (level: -1 | 0 | 1): Promise<RobotDogCommandResponse> => {
    return await postCommand("/api/v1/speed", { level } satisfies RobotDogLevelPayload);
  },
  setVolume: async (level: number): Promise<RobotDogCommandResponse> => {
    return await postCommand("/api/v1/volume", { level } satisfies RobotDogLevelPayload);
  },
  setBrightness: async (level: number): Promise<RobotDogCommandResponse> => {
    return await postCommand("/api/v1/brightness", { level } satisfies RobotDogLevelPayload);
  },
  setSilentMode: async (enabled: boolean): Promise<RobotDogCommandResponse> => {
    return await postCommand(`/api/v1/silent_mode?enabled=${String(enabled)}`);
  },
  selectMotionMode: async (name = "mcf"): Promise<RobotDogCommandResponse> => {
    return await postCommand(`/api/v1/motion_mode/select?name=${encodeURIComponent(name)}`);
  },
};
