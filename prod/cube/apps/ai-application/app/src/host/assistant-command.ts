/** UE5 / 旧版 iframe 助手返回的 command JSON 信封（兼容 langflow COMMAND 模式）。 */
export interface LegacyAssistantCommand {
  action: string;
  callbackId?: string;
  params?: Record<string, unknown>;
}

interface LegacyAnswerEnvelope {
  type?: string;
  value?: string;
  action?: string;
  callbackId?: string;
  params?: LegacyAssistantCommand["params"];
}

/** 非孪生端命中模型指令时的固定提示。 */
export const COPY_MODEL_COMMAND_NON_TWIN = "请在可视化端操作模型";

/** 孪生端已识别指令、等待/配合宿主执行时的占位文案。 */
export const COPY_MODEL_COMMAND_RECOGNIZED = "已识别模型指令";

/** 孪生端指令执行回执。 */
export const COPY_MODEL_COMMAND_SUCCESS = "指令下发成功";
export const COPY_MODEL_COMMAND_FAIL = "指令下发失败";

const TWIN_HOST_SOURCES = new Set(["ue5", "ue5-voice", "twin"]);

/** 是否为数字孪生 / 可视化宿主（可下发模型指令）。 */
export function isTwinAssistantHost(context: unknown): boolean {
  if (context == null || typeof context !== "object") {
    return false;
  }
  const { source } = context as { source?: unknown };
  return typeof source === "string" && TWIN_HOST_SOURCES.has(source);
}

/**
 * 模型偶发自造 action（如 set_weather）→ SDK 正式名。
 * 仅做别名归一，不发明新能力。
 */
const ACTION_ALIASES: Record<string, string> = {
  set_weather: "changeModelWeather",
  setweather: "changeModelWeather",
  change_weather: "changeModelWeather",
  changeweather: "changeModelWeather",
  set_time: "changeModelTime",
  settime: "changeModelTime",
  change_time: "changeModelTime",
  changetime: "changeModelTime",
  set_model_time: "changeModelTime",
  set_model_weather: "changeModelWeather",
  // 环游（绕场）≠ 漫游路线
  startroundtour: "toggleRevolve",
  start_round_tour: "toggleRevolve",
  starttour: "toggleRevolve",
  start_tour: "toggleRevolve",
  opentour: "toggleRevolve",
  open_tour: "toggleRevolve",
  beginrevolve: "toggleRevolve",
  begin_revolve: "toggleRevolve",
  startrevolve: "toggleRevolve",
  start_revolve: "toggleRevolve",
  openrevolve: "toggleRevolve",
  open_revolve: "toggleRevolve",
  enablerevolve: "toggleRevolve",
  enable_revolve: "toggleRevolve",
  roundtour: "toggleRevolve",
  round_tour: "toggleRevolve",
  touraround: "toggleRevolve",
  tour_around: "toggleRevolve",
  closerevolve: "toggleRevolve",
  close_revolve: "toggleRevolve",
  stoprevolve: "toggleRevolve",
  stop_revolve: "toggleRevolve",
  exitrevolve: "toggleRevolve",
  exit_revolve: "toggleRevolve",
  closeroundtour: "toggleRevolve",
  close_round_tour: "toggleRevolve",
  stoproundtour: "toggleRevolve",
  stop_round_tour: "toggleRevolve",
  closetour: "toggleRevolve",
  close_tour: "toggleRevolve",
  stoptour: "toggleRevolve",
  stop_tour: "toggleRevolve",
  enterroamroute: "toggleStartRoam",
  enter_roam_route: "toggleStartRoam",
  enterroam: "toggleStartRoam",
  enter_roam: "toggleStartRoam",
  startroam: "toggleStartRoam",
  start_roam: "toggleStartRoam",
  openroam: "toggleStartRoam",
  open_roam: "toggleStartRoam",
  beginroam: "toggleStartRoam",
  begin_roam: "toggleStartRoam",
  closeroam: "toggleCloseRoam",
  close_roam: "toggleCloseRoam",
  exitroam: "toggleCloseRoam",
  exit_roam: "toggleCloseRoam",
  stoproam: "toggleCloseRoam",
  stop_roam: "toggleCloseRoam",
};

/** 自造 action 里的英文片段 → 路线关键词（供缺 params 时回填） */
const ROUTE_TOKEN_ALIASES: Record<string, string> = {
  office: "办公区",
  officearea: "办公区",
  officezone: "办公区",
  test: "测试",
};

function compactActionKey(action: string): string {
  return action.toLowerCase().replaceAll(/[\s_-]+/g, "");
}

function resolveCanonicalAction(rawAction: string): string {
  const aliasKey = rawAction.toLowerCase().replaceAll(/[\s-]+/g, "_");
  if (ACTION_ALIASES[aliasKey]) {
    return ACTION_ALIASES[aliasKey]!;
  }
  const compact = compactActionKey(rawAction);
  // 环游：startRoundTour / closeRoundTour / openRevolve …（须先于 roam，避免误伤）
  if (/(revolve|roundtour|touraround)/.test(compact) || /^(start|open|begin|enable|toggle|close|stop|exit)tour$/.test(compact)) {
    return "toggleRevolve";
  }
  // enterOfficeRoamingRoute / startXxxRoam / openXxxRoaming …
  if (/^(enter|start|open|begin).*(roam)/.test(compact)) {
    return "toggleStartRoam";
  }
  if (/^(close|exit|stop).*(roam)/.test(compact)) {
    return "toggleCloseRoam";
  }
  if (/^(set|change).*(weather)/.test(compact)) {
    return "changeModelWeather";
  }
  if (/^(set|change).*(time)/.test(compact) && !compact.includes("weather")) {
    return "changeModelTime";
  }
  if (/^(set|change).*(quality|picturequality)/.test(compact)) {
    return "changeModelQuality";
  }
  if (/^(enter|start|open|toggle).*(fullscreen|full_screen)/.test(compact) || compact === "fullscreen") {
    return "toggleFullScreen";
  }
  return rawAction;
}

/** enterOfficeRoamingRoute → 「办公区」；无可用片段则 undefined */
export function extractRoamHintFromAction(rawAction: string): string | undefined {
  const tokens = rawAction
    .replaceAll(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll(/[_-]+/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => !/^(enter|start|open|begin|close|exit|stop|roam|roaming|route)$/i.test(t));
  if (tokens.length === 0) {
    return undefined;
  }
  const joined = tokens.join("").toLowerCase();
  if (ROUTE_TOKEN_ALIASES[joined]) {
    return ROUTE_TOKEN_ALIASES[joined];
  }
  for (const token of tokens) {
    const mapped = ROUTE_TOKEN_ALIASES[token.toLowerCase()];
    if (mapped) {
      return mapped;
    }
  }
  return tokens.join("");
}

/** 天气枚举大小写/中文 → UE5 modelWeatherList.value */
const WEATHER_VALUE_ALIASES: Record<string, string> = {
  sunny: "Sunny",
  cloudy: "Cloudy",
  foggy: "Foggy",
  overcast: "Overcast",
  // UE5 modelWeatherList 实际 value（大雨=Rain，非 BIG_RAINY）
  rain: "Rain",
  big_rainy: "Rain",
  bigrainy: "Rain",
  bigrain: "Rain",
  rainlight: "RainLight",
  rain_light: "RainLight",
  rainthunderstorm: "RainThunderStorm",
  thunderstorm: "RainThunderStorm",
  large_rainy: "RainThunderStorm",
  largerainy: "RainThunderStorm",
  heavyrain: "RainThunderStorm",
  heavy_rain: "RainThunderStorm",
  snow: "Snow",
  snowlight: "SnowLight",
  snow_light: "SnowLight",
  snowblizzard: "SnowBlizzard",
  sanddustcalm: "SandDustCalm",
  sandduststorm: "SandDustStorm",
  晴: "Sunny",
  多云: "Cloudy",
  雾: "Foggy",
  阴: "Overcast",
  大雨: "Rain",
  小雨: "RainLight",
  暴雨: "RainThunderStorm",
  大暴雨: "RainThunderStorm",
  特大暴雨: "RainThunderStorm",
  大雪: "Snow",
  小雪: "SnowLight",
  暴雪: "SnowBlizzard",
  沙尘: "SandDustCalm",
  沙暴: "SandDustStorm",
};

const TIME_VALUE_ALIASES: Record<string, string> = {
  // 与 UE5 标题栏一致：自动 / 上午 / 下午 / 晚上
  auto: "auto",
  自动: "auto",
  morning: "9:00:00",
  上午: "9:00:00",
  afternoon: "15:00:00",
  下午: "15:00:00",
  evening: "22:00:00",
  晚上: "22:00:00",
  // 兼容旧枚举与口语
  day: "9:00:00",
  白天: "9:00:00",
  dusk: "18:00:00",
  黄昏: "18:00:00",
  night: "22:00:00",
  夜晚: "22:00:00",
};

const QUALITY_VALUE_ALIASES: Record<string, string> = {
  high: "high",
  medium: "medium",
  low: "low",
  高: "high",
  中: "medium",
  低: "low",
  高清: "high",
  中等: "medium",
  低清: "low",
};

function coerceCommandParams(raw: unknown): Record<string, unknown> {
  if (raw == null) {
    return {};
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) {
      return {};
    }
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed != null && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { ...(parsed as Record<string, unknown>) };
      }
    } catch {
      // 模型偶发把天气值直接塞进 params 字符串
      return { value: trimmed };
    }
    return { value: trimmed };
  }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return { ...(raw as Record<string, unknown>) };
  }
  if (typeof raw === "number" || typeof raw === "boolean") {
    return { value: raw };
  }
  return {};
}

function readScalarParam(params: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const nested = params[key];
    if (typeof nested === "string" || typeof nested === "number") {
      const text = String(nested).trim();
      if (text) {
        return text;
      }
    }
    // { value: { weather: "暴雨" } } / { value: { value: "Sunny" } }
    if (nested != null && typeof nested === "object" && !Array.isArray(nested)) {
      const obj = nested as Record<string, unknown>;
      for (const innerKey of ["value", "weather", "weatherType", "weather_type", "name", "label", "type"]) {
        const inner = obj[innerKey];
        if (typeof inner === "string" || typeof inner === "number") {
          const text = String(inner).trim();
          if (text) {
            return text;
          }
        }
      }
    }
  }
  return "";
}

/** 环游开/关布尔归一；无法识别时返回 undefined */
export function coerceTourAroundBoolean(raw: unknown): boolean | undefined {
  if (typeof raw === "boolean") {
    return raw;
  }
  if (typeof raw === "number") {
    return raw !== 0;
  }
  if (typeof raw !== "string") {
    return undefined;
  }
  const text = raw.trim().toLowerCase();
  if (!text) {
    return undefined;
  }
  if (["false", "0", "off", "close", "关闭", "退出", "停止", "停"].includes(text)) {
    return false;
  }
  if (["true", "1", "on", "open", "开启", "打开", "开始", "启动"].includes(text)) {
    return true;
  }
  return undefined;
}

function inferTourAroundDesiredFromAction(rawAction: string): boolean {
  const compact = compactActionKey(rawAction);
  if (/^(close|stop|exit|disable)/.test(compact)) {
    return false;
  }
  // startRoundTour / openRevolve / toggleRevolve 缺省按开启
  return true;
}

export function normalizeLegacyAssistantCommand(command: LegacyAssistantCommand): LegacyAssistantCommand {
  const rawAction = typeof command.action === "string" ? command.action.trim() : "";
  const action = resolveCanonicalAction(rawAction);
  const params = coerceCommandParams(command.params);

  // 模型偶发把 value/weather/buildingName 放在顶层而非 params 内
  const topLevel = command as LegacyAssistantCommand & Record<string, unknown>;
  for (const key of [
    "value",
    "weather",
    "weatherType",
    "weather_type",
    "buildingName",
    "building_name",
    "building",
    "area",
    "areaName",
    "name",
    "label",
  ] as const) {
    if (!(key in params) && (typeof topLevel[key] === "string" || typeof topLevel[key] === "number")) {
      params[key] = topLevel[key];
    }
  }

  // 天气：兼容 value / weather / weatherType 等键，统一写回 params.value
  if (action === "changeModelWeather") {
    const weatherRaw = readScalarParam(params, "value", "weather", "weatherType", "weather_type", "name", "label", "type");
    if (weatherRaw) {
      const mapped = WEATHER_VALUE_ALIASES[weatherRaw] ?? WEATHER_VALUE_ALIASES[weatherRaw.toLowerCase()];
      params.value = mapped ?? weatherRaw;
      delete params.weather;
      delete params.weatherType;
      delete params.weather_type;
      delete params.name;
      delete params.label;
      delete params.type;
    }
  }

  if ("value" in params && (typeof params.value === "string" || typeof params.value === "number")) {
    const raw = String(params.value).trim();
    if (action === "changeModelTime") {
      const mapped = TIME_VALUE_ALIASES[raw] ?? TIME_VALUE_ALIASES[raw.toLowerCase()];
      if (mapped) {
        params.value = mapped;
      }
    }
    if (action === "changeModelQuality") {
      const mapped = QUALITY_VALUE_ALIASES[raw] ?? QUALITY_VALUE_ALIASES[raw.toLowerCase()];
      if (mapped) {
        params.value = mapped;
      }
    }
  }

  // 环游：统一 params.value 为 boolean；缺省按 action 名推断（开启类默认 true）
  if (action === "toggleRevolve") {
    const fromValue = coerceTourAroundBoolean(params.value);
    const fromEnabled = coerceTourAroundBoolean(params.enabled ?? params.open ?? params.status);
    params.value = fromValue ?? fromEnabled ?? inferTourAroundDesiredFromAction(rawAction);
    delete params.enabled;
    delete params.open;
    delete params.status;
  }

  // 楼栋/区域视角：模型常写 buildingName，统一到 params.value
  if (action === "changePerspectiveBuilding") {
    const buildingRaw = readScalarParam(params, "value", "buildingName", "building_name", "building", "area", "areaName", "name", "label");
    if (buildingRaw) {
      params.value = buildingRaw;
      delete params.buildingName;
      delete params.building_name;
      delete params.building;
      delete params.area;
      delete params.areaName;
      delete params.name;
      delete params.label;
    }
  }

  // 楼层视角：buildingName → building；保留 floor
  if (action === "changePerspectiveFloor") {
    const buildingRaw = readScalarParam(params, "building", "buildingName", "building_name", "area", "areaName", "value");
    const floorRaw = readScalarParam(params, "floor", "floorName", "floor_name", "level", "levelName", "storey");
    if (buildingRaw) {
      params.building = buildingRaw;
      delete params.buildingName;
      delete params.building_name;
      delete params.area;
      delete params.areaName;
      if (params.value === buildingRaw) {
        delete params.value;
      }
    }
    if (floorRaw) {
      params.floor = floorRaw;
      delete params.floorName;
      delete params.floor_name;
      delete params.level;
      delete params.levelName;
      delete params.storey;
    }
  }

  // 自造 enterOfficeRoamingRoute 且未带 params.value 时，从 action 名回填路线关键词
  if (action === "toggleStartRoam") {
    const current = typeof params.value === "string" ? params.value.trim() : "";
    if (!current) {
      const hint = extractRoamHintFromAction(rawAction);
      if (hint) {
        params.value = hint;
      }
    }
  }

  const hasParams = Object.keys(params).length > 0;
  // 去掉已提升进 params 的顶层杂项，避免下游再读到重复字段
  const { value: _v, weather: _w, name: _n, label: _l, ...rest } = command as LegacyAssistantCommand & Record<string, unknown>;
  return {
    ...rest,
    action,
    ...(hasParams ? { params } : {}),
  };
}

function tryParseCommandObject(text: string): LegacyAssistantCommand | null {
  try {
    const parsed = JSON.parse(text) as LegacyAnswerEnvelope;
    if (parsed.type === "command" && parsed.value) {
      const nested =
        typeof parsed.value === "string"
          ? (JSON.parse(parsed.value) as LegacyAssistantCommand)
          : (parsed.value as unknown as LegacyAssistantCommand);
      return nested?.action ? normalizeLegacyAssistantCommand(nested) : null;
    }
    if (parsed.action) {
      return normalizeLegacyAssistantCommand(parsed as LegacyAssistantCommand);
    }
  } catch {
    return null;
  }
  return null;
}

/** 从 assistant 消息 content 中解析可执行的 scene command。 */
export function parseAssistantCommandFromContent(content: string): LegacyAssistantCommand | null {
  const trimmed = content.trim();
  if (!trimmed) {
    return null;
  }

  const direct = tryParseCommandObject(trimmed);
  if (direct) {
    return direct;
  }

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch?.[1]) {
    const fromFence = tryParseCommandObject(fenceMatch[1].trim());
    if (fromFence) {
      return fromFence;
    }
  }

  // 围栏外夹杂说明文字时，抓取首个含 action 的 JSON 对象
  const objectMatch = trimmed.match(/\{[\s\S]*"action"\s*:\s*"[^"]+"[\s\S]*\}/);
  if (objectMatch?.[0]) {
    return tryParseCommandObject(objectMatch[0]);
  }

  return null;
}

/**
 * 若 content 为模型指令，返回应对用户展示的文案；否则返回 null（按原文渲染）。
 * 非孪生端固定提示；孪生端显示「已识别」，执行结果由宿主追加回执。
 */
export function resolveAssistantCommandDisplay(content: string, context: unknown): string | null {
  if (!parseAssistantCommandFromContent(content)) {
    return null;
  }
  if (!isTwinAssistantHost(context)) {
    return COPY_MODEL_COMMAND_NON_TWIN;
  }
  return COPY_MODEL_COMMAND_RECOGNIZED;
}

export function formatModelCommandAck(success: boolean, action?: string): string {
  const base = success ? COPY_MODEL_COMMAND_SUCCESS : COPY_MODEL_COMMAND_FAIL;
  const trimmed = typeof action === "string" ? action.trim() : "";
  return trimmed ? `${base}（${trimmed}）` : base;
}

export function readAssistantMessageContent(payload: { message?: unknown }): string {
  const { message } = payload;
  if (typeof message === "string") {
    return message;
  }
  if (message != null && typeof message === "object" && "content" in message) {
    const { content } = message as { content?: unknown };
    return typeof content === "string" ? content : "";
  }
  return "";
}

export function readAssistantMessageId(payload: { message?: unknown }): string | null {
  const { message } = payload;
  if (message != null && typeof message === "object" && "id" in message) {
    const { id } = message as { id?: unknown };
    return typeof id === "string" && id.trim() ? id : null;
  }
  return null;
}
