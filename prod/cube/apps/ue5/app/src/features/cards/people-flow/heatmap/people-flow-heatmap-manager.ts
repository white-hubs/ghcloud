export type PeopleFlowHeatmapStatus = "idle" | "queued" | "sending" | "ready" | "failed";

export interface PeopleFlowHeatmapAreaStat {
  id?: string | number;
  modelArea?: string;
  totalPersonNumber?: number;
}

export interface PeopleFlowHeatmapDevice {
  trafficDetectionAreaConfig?: {
    deviceConfig?: unknown;
  };
}

export interface PeopleFlowHeatmapPoint {
  value: number;
  coord: {
    x: number;
    y: number;
  };
}

export interface PeopleFlowHeatmapRenderParams {
  id: string;
  radiusMax: number;
  enlargeScale: number;
  data: PeopleFlowHeatmapPoint[];
}

export interface PeopleFlowHeatmapTarget {
  areaId?: string | number;
  modelArea?: string;
}

interface PeopleFlowHeatmapDataSource {
  getAreaStats: () => Promise<PeopleFlowHeatmapAreaStat[]>;
  getDevices: (areaId: string | number) => Promise<PeopleFlowHeatmapDevice[]>;
}

interface PeopleFlowHeatmapModel {
  render: (params: PeopleFlowHeatmapRenderParams) => void;
  clearDynamic: () => void;
  showFixedActor: (id: string) => void;
  hideFixedActor: (id: string) => void;
}

interface PeopleFlowHeatmapLogger {
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, context?: Record<string, unknown>) => void;
}

export interface PeopleFlowHeatmapManagerOptions {
  dataSource: PeopleFlowHeatmapDataSource;
  model: PeopleFlowHeatmapModel;
  fixedActorIds?: readonly string[];
  interTaskDelayMs?: number;
  renderSettleMs?: number;
  deviceRequestConcurrency?: number;
  maxRequestAttempts?: number;
  logger?: PeopleFlowHeatmapLogger;
}

interface InterruptibleDelay {
  kind: "spacing" | "settle";
  timerId: ReturnType<typeof setTimeout>;
  resolve: () => void;
}

type AreaReadyResolver = (ready: boolean) => void;

const DEFAULT_RADIUS = 300;
const DEFAULT_ENLARGE_SCALE = 30;
const LOG_PREFIX = "[people-flow-heatmap]";

const defaultLogger: PeopleFlowHeatmapLogger = {
  info: (message, context) => console.info(`${LOG_PREFIX} ${message}`, context ?? ""),
  warn: (message, context) => console.warn(`${LOG_PREFIX} ${message}`, context ?? ""),
  error: (message, context) => console.error(`${LOG_PREFIX} ${message}`, context ?? ""),
};

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  }
  return typeof value === "object" ? (value as Record<string, unknown>) : null;
};

const toFiniteNumber = (value: unknown): number | null => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

export class PeopleFlowHeatmapManager {
  private readonly dataSource: PeopleFlowHeatmapDataSource;
  private readonly model: PeopleFlowHeatmapModel;
  private readonly fixedActorIds: readonly string[];
  private readonly interTaskDelayMs: number;
  private readonly renderSettleMs: number;
  private readonly deviceRequestConcurrency: number;
  private readonly maxRequestAttempts: number;
  private readonly logger: PeopleFlowHeatmapLogger;

  private enabled = false;
  private connected = false;
  private generation = 0;
  private prepared = false;
  private fixedActorsVisible: boolean | null = null;

  private paramsById = new Map<string, PeopleFlowHeatmapRenderParams>();
  private taskIdsByAreaId = new Map<string, Set<string>>();
  private statusById = new Map<string, PeopleFlowHeatmapStatus>();
  private queue: string[] = [];

  private preparationPromise: Promise<void> | null = null;
  private preloadPromise: Promise<void> | null = null;
  private preloadGeneration: number | null = null;
  private processingPromise: Promise<void> | null = null;
  private activeDelay: InterruptibleDelay | null = null;
  private readonly readyResolvers = new Map<string, AreaReadyResolver[]>();
  private readonly idleResolvers: Array<() => void> = [];

  public constructor(options: PeopleFlowHeatmapManagerOptions) {
    this.dataSource = options.dataSource;
    this.model = options.model;
    this.fixedActorIds = options.fixedActorIds ?? [];
    this.interTaskDelayMs = Math.max(0, options.interTaskDelayMs ?? 15_000);
    this.renderSettleMs = Math.max(0, options.renderSettleMs ?? 800);
    this.deviceRequestConcurrency = Math.max(1, options.deviceRequestConcurrency ?? 4);
    this.maxRequestAttempts = Math.max(1, options.maxRequestAttempts ?? 2);
    this.logger = options.logger ?? defaultLogger;
  }

  public setEnabled(enabled: boolean): void {
    if (this.enabled === enabled) {
      return;
    }

    this.enabled = enabled;
    this.invalidateActiveWork();
    this.resetStatuses();

    if (!enabled) {
      if (this.connected) {
        this.model.clearDynamic();
        this.applyFixedActorsVisibility(false);
      } else {
        this.fixedActorsVisible = null;
      }
      this.logger.info("disabled");
      return;
    }

    this.logger.info("enabled");
    if (this.connected) {
      void this.startPreload();
    }
  }

  public handleConnected(): void {
    this.connected = true;
    this.invalidateActiveWork();
    this.resetStatuses();
    this.fixedActorsVisible = null;
    this.logger.info("model connected", { generation: this.generation });

    if (this.enabled) {
      void this.startPreload();
    }
  }

  public handleDisconnected(): void {
    this.connected = false;
    this.invalidateActiveWork();
    this.resetStatuses();
    this.fixedActorsVisible = null;
    this.logger.warn("model disconnected", { generation: this.generation });
  }

  public async prepareData(options?: { force?: boolean }): Promise<void> {
    if (options?.force) {
      this.prepared = false;
      this.paramsById.clear();
      this.taskIdsByAreaId.clear();
      this.statusById.clear();
    }
    if (this.prepared) {
      return;
    }
    if (this.preparationPromise) {
      return this.preparationPromise;
    }

    const preparation = this.buildRenderParams();
    this.preparationPromise = preparation;
    try {
      await preparation;
    } finally {
      if (this.preparationPromise === preparation) {
        this.preparationPromise = null;
      }
      this.notifyIdleIfNeeded();
    }
  }

  public startPreload(): Promise<void> {
    if (!this.enabled || !this.connected) {
      return Promise.resolve();
    }
    if (this.preloadPromise && this.preloadGeneration === this.generation) {
      return this.preloadPromise;
    }

    const generation = this.generation;
    const preload = this.prepareData()
      .then(() => {
        if (!this.isGenerationActive(generation)) {
          return;
        }
        if (this.paramsById.size === 0) {
          this.logger.warn("no valid heatmap tasks prepared");
          this.applyFixedActorsVisibility(true);
          return;
        }

        this.applyFixedActorsVisibility(true);
        this.paramsById.forEach((_params, id) => this.enqueue(id));
        this.startProcessing();
      })
      .catch((error) => {
        this.logger.error("preload preparation failed", { error });
        if (this.isGenerationActive(generation)) {
          this.applyFixedActorsVisibility(true);
        }
      })
      .finally(() => {
        if (this.preloadPromise === preload) {
          this.preloadPromise = null;
          this.preloadGeneration = null;
        }
        this.notifyIdleIfNeeded();
      });

    this.preloadPromise = preload;
    this.preloadGeneration = generation;
    return preload;
  }

  public async ensureAreaReady(target: PeopleFlowHeatmapTarget): Promise<boolean> {
    if (!this.enabled || !this.connected) {
      return false;
    }

    try {
      await this.prepareData();
    } catch (error) {
      this.logger.error("selected area preparation failed", { error, ...target });
      return false;
    }
    if (!this.enabled || !this.connected) {
      return false;
    }

    const ids = this.resolveTargetIds(target);
    if (ids.length === 0) {
      this.logger.warn("selected area has no valid heatmap task", { ...target });
      this.applyFixedActorsVisibility(true);
      return false;
    }

    this.applyFixedActorsVisibility(true);
    for (let index = ids.length - 1; index >= 0; index -= 1) {
      this.enqueue(ids[index], true);
    }
    this.wakeSpacingDelay();
    this.startProcessing();

    const readyResults = await Promise.all(ids.map((id) => this.waitForReady(id)));
    return readyResults.every(Boolean);
  }

  public async renderInteractive(params: PeopleFlowHeatmapRenderParams): Promise<boolean> {
    if (!this.enabled || !this.connected || !params.id || params.data.length === 0) {
      return false;
    }

    this.paramsById.set(params.id, params);
    if (this.statusById.get(params.id) !== "sending") {
      this.statusById.set(params.id, "idle");
      this.enqueue(params.id, true);
    }
    this.applyFixedActorsVisibility(true);
    this.wakeSpacingDelay();
    this.startProcessing();
    return this.waitForReady(params.id);
  }

  public getStatus(id: string): PeopleFlowHeatmapStatus {
    return this.statusById.get(id) ?? "idle";
  }

  public getProgress(): { ready: number; total: number } {
    const total = this.paramsById.size;
    let ready = 0;
    this.paramsById.forEach((_params, id) => {
      if (this.statusById.get(id) === "ready") {
        ready++;
      }
    });
    return { ready, total };
  }

  public waitUntilIdle(): Promise<void> {
    if (this.isIdle()) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.idleResolvers.push(resolve);
    });
  }

  private async buildRenderParams(): Promise<void> {
    const areaStats = await this.requestWithRetry("area statistics", () => this.dataSource.getAreaStats());
    const paramsById = new Map<string, PeopleFlowHeatmapRenderParams>();
    const taskIdsByAreaId = new Map<string, Set<string>>();

    await this.mapWithConcurrency(areaStats ?? [], async (area) => {
      if (area.id === undefined || area.id === null) {
        this.logger.warn("skipped heatmap area without id", { area });
        return;
      }

      let devices: PeopleFlowHeatmapDevice[] = [];
      try {
        devices = await this.requestWithRetry(`area devices ${area.id}`, () => this.dataSource.getDevices(area.id as string | number));
      } catch (error) {
        this.logger.error("area device request failed", { areaId: area.id, error });
        return;
      }

      const areaTaskIds = new Set<string>();
      devices.forEach((device, deviceIndex) => {
        const parsed = this.parseDevice(device, area, deviceIndex);
        if (!parsed) {
          return;
        }

        const current =
          paramsById.get(parsed.id) ??
          ({
            id: parsed.id,
            radiusMax: parsed.radiusMax,
            enlargeScale: DEFAULT_ENLARGE_SCALE,
            data: [],
          } satisfies PeopleFlowHeatmapRenderParams);
        if (!current.radiusMax && parsed.radiusMax) {
          current.radiusMax = parsed.radiusMax;
        }
        current.data.push(parsed.point);
        paramsById.set(parsed.id, current);
        areaTaskIds.add(parsed.id);
      });

      taskIdsByAreaId.set(String(area.id), areaTaskIds);
    });

    this.paramsById = paramsById;
    this.taskIdsByAreaId = taskIdsByAreaId;
    this.paramsById.forEach((_params, id) => {
      if (!this.statusById.has(id)) {
        this.statusById.set(id, "idle");
      }
    });
    this.prepared = true;
    this.logger.info("heatmap data prepared", {
      areaCount: areaStats?.length ?? 0,
      taskCount: paramsById.size,
    });
  }

  private parseDevice(
    device: PeopleFlowHeatmapDevice,
    area: PeopleFlowHeatmapAreaStat,
    deviceIndex: number,
  ): { id: string; radiusMax: number; point: PeopleFlowHeatmapPoint } | null {
    try {
      const deviceConfig = toRecord(device?.trafficDetectionAreaConfig?.deviceConfig);
      if (!deviceConfig) {
        this.logger.warn("skipped device without heatmap config", { areaId: area.id, deviceIndex });
        return null;
      }

      const centerAddress = toRecord(deviceConfig.centerAddress);
      const x = toFiniteNumber(centerAddress?.x);
      const y = toFiniteNumber(centerAddress?.y);
      if (x === null || y === null) {
        this.logger.warn("skipped device with invalid heatmap coordinates", { areaId: area.id, deviceIndex });
        return null;
      }

      const id = String(deviceConfig.parentModelArea || area.modelArea || "").trim();
      if (!id) {
        this.logger.warn("skipped device without model area", { areaId: area.id, deviceIndex });
        return null;
      }

      return {
        id,
        radiusMax: toFiniteNumber(deviceConfig.radius) ?? DEFAULT_RADIUS,
        point: {
          value: toFiniteNumber(area.totalPersonNumber) ?? 0,
          coord: { x, y },
        },
      };
    } catch (error) {
      this.logger.warn("skipped malformed device heatmap config", {
        areaId: area.id,
        deviceIndex,
        error,
      });
      return null;
    }
  }

  private enqueue(id: string, priority = false): void {
    if (!this.paramsById.has(id)) {
      return;
    }

    const status = this.statusById.get(id);
    if (status === "ready" || status === "sending") {
      return;
    }

    const currentIndex = this.queue.indexOf(id);
    if (currentIndex >= 0) {
      if (priority && currentIndex > 0) {
        this.queue.splice(currentIndex, 1);
        this.queue.unshift(id);
      }
      return;
    }

    if (priority) {
      this.queue.unshift(id);
    } else {
      this.queue.push(id);
    }
    this.statusById.set(id, "queued");
  }

  private startProcessing(): void {
    if (this.processingPromise || !this.enabled || !this.connected || this.queue.length === 0) {
      return;
    }

    const generation = this.generation;
    const processing = this.processQueue(generation).finally(() => {
      if (this.processingPromise === processing) {
        this.processingPromise = null;
      }
      this.notifyIdleIfNeeded();
      if (this.queue.length > 0 && this.enabled && this.connected) {
        this.startProcessing();
      }
    });
    this.processingPromise = processing;
  }

  private async processQueue(generation: number): Promise<void> {
    while (this.isGenerationActive(generation) && this.queue.length > 0) {
      const id = this.queue.shift();
      if (!id) {
        continue;
      }
      const params = this.paramsById.get(id);
      if (!params || this.statusById.get(id) === "ready") {
        continue;
      }

      this.statusById.set(id, "sending");
      try {
        this.model.render(params);
        this.logger.info("heatmap render sent", {
          generation,
          id,
          pointCount: params.data.length,
        });
      } catch (error) {
        this.statusById.set(id, "failed");
        this.resolveReady(id, false);
        this.logger.error("heatmap render command failed", { generation, id, error });
        continue;
      }

      await this.wait(this.renderSettleMs, "settle");
      if (!this.isGenerationActive(generation)) {
        return;
      }

      this.statusById.set(id, "ready");
      this.resolveReady(id, true);

      if (this.queue.length > 0) {
        await this.wait(this.interTaskDelayMs, "spacing");
      }
    }

    if (this.isGenerationActive(generation) && this.hasCompletedAllTasks()) {
      this.applyFixedActorsVisibility(false);
      this.logger.info("heatmap preload completed", this.getProgress());
    }
  }

  private waitForReady(id: string): Promise<boolean> {
    const status = this.statusById.get(id);
    if (status === "ready") {
      return Promise.resolve(true);
    }
    if (status === "failed") {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      const resolvers = this.readyResolvers.get(id) ?? [];
      resolvers.push(resolve);
      this.readyResolvers.set(id, resolvers);
    });
  }

  private resolveReady(id: string, ready: boolean): void {
    const resolvers = this.readyResolvers.get(id) ?? [];
    this.readyResolvers.delete(id);
    resolvers.forEach((resolve) => resolve(ready));
  }

  private resolveTargetIds(target: PeopleFlowHeatmapTarget): string[] {
    const ids = new Set<string>();
    if (target.areaId !== undefined && target.areaId !== null) {
      this.taskIdsByAreaId.get(String(target.areaId))?.forEach((id) => ids.add(id));
    }
    const modelArea = String(target.modelArea ?? "").trim();
    if (modelArea && this.paramsById.has(modelArea)) {
      ids.add(modelArea);
    }
    return [...ids];
  }

  private resetStatuses(): void {
    this.statusById.forEach((_status, id) => this.statusById.set(id, "idle"));
  }

  private invalidateActiveWork(): void {
    this.generation++;
    this.queue = [];
    this.cancelActiveDelay();
    this.readyResolvers.forEach((resolvers) => resolvers.forEach((resolve) => resolve(false)));
    this.readyResolvers.clear();
    this.notifyIdleIfNeeded();
  }

  private isGenerationActive(generation: number): boolean {
    return generation === this.generation && this.enabled && this.connected;
  }

  private hasCompletedAllTasks(): boolean {
    if (this.paramsById.size === 0) {
      return false;
    }
    return [...this.paramsById.keys()].every((id) => this.statusById.get(id) === "ready");
  }

  private applyFixedActorsVisibility(visible: boolean): void {
    if (!this.connected || this.fixedActorsVisible === visible) {
      return;
    }
    this.fixedActorIds.forEach((id) => {
      try {
        if (visible) {
          this.model.showFixedActor(id);
        } else {
          this.model.hideFixedActor(id);
        }
      } catch (error) {
        this.logger.error("fixed heatmap actor visibility failed", { id, visible, error });
      }
    });
    this.fixedActorsVisible = visible;
    this.logger.info("fixed heatmap actors updated", { visible });
  }

  private async requestWithRetry<T>(label: string, request: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= this.maxRequestAttempts; attempt++) {
      try {
        return await request();
      } catch (error) {
        lastError = error;
        this.logger.warn("heatmap data request failed", { label, attempt, error });
      }
    }
    throw lastError;
  }

  private async mapWithConcurrency<T>(items: T[], worker: (item: T) => Promise<void>): Promise<void> {
    let currentIndex = 0;
    const workers = Array.from({ length: Math.min(this.deviceRequestConcurrency, items.length) }, async () => {
      while (currentIndex < items.length) {
        const index = currentIndex;
        currentIndex++;
        await worker(items[index]);
      }
    });
    await Promise.all(workers);
  }

  private wait(ms: number, kind: InterruptibleDelay["kind"]): Promise<void> {
    if (ms <= 0) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      let completed = false;
      const complete = (): void => {
        if (completed) {
          return;
        }
        completed = true;
        if (this.activeDelay?.resolve === complete) {
          this.activeDelay = null;
        }
        resolve();
      };
      const timerId = setTimeout(complete, ms);
      this.activeDelay = { kind, timerId, resolve: complete };
    });
  }

  private wakeSpacingDelay(): void {
    if (this.activeDelay?.kind !== "spacing") {
      return;
    }
    const { timerId, resolve } = this.activeDelay;
    clearTimeout(timerId);
    resolve();
  }

  private cancelActiveDelay(): void {
    if (!this.activeDelay) {
      return;
    }
    const { timerId, resolve } = this.activeDelay;
    clearTimeout(timerId);
    resolve();
  }

  private isIdle(): boolean {
    return this.preparationPromise === null && this.preloadPromise === null && this.processingPromise === null && this.queue.length === 0;
  }

  private notifyIdleIfNeeded(): void {
    if (!this.isIdle()) {
      return;
    }
    this.idleResolvers.splice(0).forEach((resolve) => resolve());
  }
}
