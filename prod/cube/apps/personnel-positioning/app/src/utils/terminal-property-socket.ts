import { getPositioningSocketAuth } from "@/bootstrap/socket-auth";
import { IOT_PROPERTIES, POSITION_PROPERTY_CODES } from "@/constants/iot-properties";

export interface DevicePropertyUpdate {
  deviceId: string;
  code: string;
  value: unknown;
  timestamp?: number;
}

const HEARTBEAT_MS = 10_000;
const RECONNECT_MS = 5_000;
const REFRESH_MS = 5 * 60_000;
const SUBSCRIPTION_SECONDS = 500 * 60;

function object(value: unknown): Record<string, unknown> | null {
  if (typeof value === "string") {
    try {
      return object(JSON.parse(value));
    } catch {
      return null;
    }
  }
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

/** 物联 SUBSCRIBE_PUSH 的属性更新；仅接受当前已订阅的设备属性。 */
export function parseDevicePropertyPush(raw: unknown, targets: ReadonlySet<string>): DevicePropertyUpdate[] {
  const message = object(raw);
  if (message?.msgType !== "SUBSCRIBE_PUSH") return [];
  const content = object(message.content);
  const payload = object(content?.msg);
  const updates = Array.isArray(payload?.updates) ? payload.updates : [];
  const messageDeviceId = payload?.deviceId == null ? "" : String(payload.deviceId);
  return updates.flatMap((rawUpdate) => {
    const update = object(rawUpdate);
    if (!update || update.key == null) return [];
    const rawKey = String(update.key);
    const deviceId = update.deviceId == null ? messageDeviceId : String(update.deviceId);
    const key = deviceId && !rawKey.startsWith(`${deviceId}.`) ? `${deviceId}.${rawKey}` : rawKey;
    if (!targets.has(key)) return [];
    const dot = key.indexOf(".");
    if (dot < 1) return [];
    const time = update.collectTime ?? update.timestamp;
    const numericTime = time == null ? NaN : Number(time);
    const parsed = Number.isFinite(numericTime) ? numericTime : typeof time === "string" ? Date.parse(time) : NaN;
    return [
      {
        deviceId: key.slice(0, dot),
        code: key.slice(dot + 1),
        value: update.value,
        ...(Number.isFinite(parsed) ? { timestamp: parsed < 1_000_000_000_000 ? parsed * 1000 : parsed } : {}),
      },
    ];
  });
}

/** 页面级定位设备属性连接：全部设备订阅楼层，当前楼层设备额外订阅坐标。 */
export class DevicePropertySocket {
  private socket: WebSocket | undefined;
  private subscriptionId = "";
  private pending = false;
  private welcomed = false;
  private sentKey = "";
  private targets: string[] = [];
  private readonly lastPropertyTimes = new Map<string, number>();
  private heartbeat: ReturnType<typeof setInterval> | undefined;
  private refresh: ReturnType<typeof setInterval> | undefined;
  private reconnect: ReturnType<typeof setTimeout> | undefined;
  private stopped = false;
  private connectedOnce = false;

  constructor(
    private readonly onUpdates: (updates: DevicePropertyUpdate[]) => void,
    private readonly onReconnect: () => void,
  ) {}

  setTargets(deviceIds: string[], currentFloorDeviceIds: string[]): void {
    if (this.stopped) return;
    const all = new Set(deviceIds.filter(Boolean));
    const next = [
      ...[...all].map((id) => `${id}.${IOT_PROPERTIES.floorId}`),
      ...currentFloorDeviceIds.filter((id) => all.has(id)).flatMap((id) => POSITION_PROPERTY_CODES.map((code) => `${id}.${code}`)),
    ];
    const key = [...new Set(next)].sort().join(",");
    if (key === this.targets.join(",")) return;
    this.targets = key ? key.split(",") : [];
    if (!this.targets.length) {
      this.disposeSocket();
    } else if (!this.socket || this.socket.readyState >= WebSocket.CLOSING) {
      this.connect();
    } else {
      this.subscribe();
    }
  }

  stop(): void {
    this.stopped = true;
    this.targets = [];
    this.lastPropertyTimes.clear();
    this.disposeSocket();
  }

  private connect(): void {
    const auth = getPositioningSocketAuth();
    if (this.stopped || !auth?.token || this.socket?.readyState === WebSocket.CONNECTING) return;
    this.clearReconnect();
    const protocol = location.protocol === "http:" ? "ws:" : "wss:";
    const url = new URL(`${protocol}//${location.host}/api/iot/websocket/subscribe`);
    url.searchParams.set("terminal", String(auth.terminal));
    url.searchParams.set("token", auth.token);
    url.searchParams.set("tenant", String(auth.tenant));
    const socket = new WebSocket(url);
    this.socket = socket;
    this.welcomed = false;
    socket.onopen = () => {
      this.heartbeat = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ msgType: "HEART_BEAT", content: Date.now() }));
        }
      }, HEARTBEAT_MS);
    };
    socket.onmessage = (event) => {
      const message = object(event.data);
      if (message?.msgType === "WELCOME") {
        if (this.welcomed) return;
        this.welcomed = true;
        this.subscribe();
        this.refresh = setInterval(() => this.subscribe(true), REFRESH_MS);
        if (this.connectedOnce) this.onReconnect();
        this.connectedOnce = true;
      } else if (message?.msgType === "SUBSCRIBE") {
        this.subscriptionId = message.content == null ? "" : String(message.content);
        this.pending = false;
        if (this.sentKey !== this.targets.join(",")) this.subscribe();
      } else {
        const updates = parseDevicePropertyPush(message, new Set(this.targets)).filter((update) => {
          if (update.timestamp === undefined) return true;
          const key = `${update.deviceId}.${update.code}`;
          if (update.timestamp <= (this.lastPropertyTimes.get(key) ?? -Infinity)) return false;
          this.lastPropertyTimes.set(key, update.timestamp);
          return true;
        });
        if (updates.length) this.onUpdates(updates);
      }
    };
    socket.onerror = () => socket.close();
    socket.onclose = () => {
      if (this.socket === socket) this.socket = undefined;
      this.clearTimers();
      this.subscriptionId = "";
      this.pending = false;
      this.sentKey = "";
      this.welcomed = false;
      if (!this.stopped && this.targets.length) this.reconnect = setTimeout(() => this.connect(), RECONNECT_MS);
    };
  }

  private subscribe(force = false): void {
    const socket = this.socket;
    if (!this.welcomed || socket?.readyState !== WebSocket.OPEN || !this.targets.length) return;
    const key = this.targets.join(",");
    if (this.pending || (!force && this.sentKey === key)) return;
    if (this.subscriptionId) {
      socket.send(JSON.stringify({ msgType: "UNSUBSCRIBE", content: this.subscriptionId }));
      this.subscriptionId = "";
    }
    this.pending = true;
    this.sentKey = key;
    socket.send(
      JSON.stringify({
        msgType: "SUBSCRIBE",
        content: {
          subscribeTTSWithSecond: SUBSCRIPTION_SECONDS,
          subscribeMsgTypes: [
            {
              key: "DEVICE_PROP",
              val: { changeNotify: false, deviceIdAndPropCode: this.targets },
            },
          ],
        },
      }),
    );
  }

  private clearTimers(): void {
    if (this.heartbeat) clearInterval(this.heartbeat);
    if (this.refresh) clearInterval(this.refresh);
    this.heartbeat = undefined;
    this.refresh = undefined;
  }

  private clearReconnect(): void {
    if (this.reconnect) clearTimeout(this.reconnect);
    this.reconnect = undefined;
  }

  private disposeSocket(): void {
    this.clearReconnect();
    this.clearTimers();
    const socket = this.socket;
    if (socket?.readyState === WebSocket.OPEN && this.subscriptionId) {
      socket.send(JSON.stringify({ msgType: "UNSUBSCRIBE", content: this.subscriptionId }));
    }
    this.socket = undefined;
    this.subscriptionId = "";
    this.pending = false;
    this.sentKey = "";
    this.welcomed = false;
    if (socket && socket.readyState !== WebSocket.CLOSED) {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      socket.close(1000);
    }
  }
}
