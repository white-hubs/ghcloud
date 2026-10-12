import { DEVICE_TYPES, PERSON_SOURCES } from "../constants/positioning";
import type {
  AssociableDeviceKind,
  DeviceKind,
  GatewayDraft,
  PositioningDevice,
  PositioningState,
  ReplacementReason,
  SyncResult,
  UnbindReason,
} from "../models/positioning";
import { sourcePeople } from "./positioning.seed";

/** 业务写入集中在此处；校验完成后再修改，避免失败的换绑破坏旧关系。 */
export function createPositioningRepository(state: PositioningState) {
  const now = (): string => new Date().toISOString();
  const id = (): string => crypto.randomUUID();
  const currentBinding = (personId: string) => state.bindings.find((item) => item.personId === personId && item.endedAt === null);
  const history = (personId: string) =>
    state.bindings.filter((item) => item.personId === personId).toSorted((a, b) => b.startedAt.localeCompare(a.startedAt));

  function syncPeople(sourceIds: string[]) {
    let added = 0;
    let skipped = 0;
    for (const sourceId of new Set(sourceIds)) {
      const person = sourcePeople.find((item) => item.sourceId === sourceId);
      if (!person || !PERSON_SOURCES[person.source].available) throw new Error("人员来源尚未接入");
      if (state.persons.some((item) => item.source === person.source && item.sourceId === person.sourceId)) {
        skipped++;
        continue;
      }
      state.persons.unshift({ ...person, id: `P-${id().slice(0, 8).toUpperCase()}`, syncedAt: now() });
      added++;
    }
    return { added, skipped };
  }

  function bind(personId: string, terminalId: string, replacementReason?: ReplacementReason): void {
    if (!state.persons.some((item) => item.id === personId)) throw new Error("定位对象不存在");
    const device = state.devices.find((item) => item.id === terminalId && item.kind === "terminal");
    if (!device) throw new Error("请选择有效的定位终端");
    if (!device.enabled) throw new Error("该终端已停用，请先启用");
    if (state.bindings.some((item) => item.terminalId === terminalId && item.endedAt === null))
      throw new Error("该终端已被占用，请选择其他终端");
    const previous = currentBinding(personId);
    if (previous && !replacementReason) throw new Error("请选择更换原因");
    const at = now();
    if (previous) {
      previous.endedAt = at;
      previous.endAction = "replace";
      previous.endReason = replacementReason ?? null;
    }
    state.bindings.unshift({
      id: id(),
      personId,
      terminalId,
      startedAt: at,
      endedAt: null,
      action: previous ? "replace" : "bind",
      actionReason: previous ? (replacementReason ?? null) : null,
      endAction: null,
      endReason: null,
      operator: "当前用户（演示）",
    });
  }
  function unbind(personId: string, reason: UnbindReason): void {
    const binding = currentBinding(personId);
    if (!binding) throw new Error("该人员当前未绑定终端");
    if (!reason) throw new Error("请选择解绑原因");
    binding.endedAt = now();
    binding.endAction = "unbind";
    binding.endReason = reason;
  }
  function setDeviceEnabled(deviceId: string, enabled: boolean): void {
    const device = state.devices.find((item) => item.id === deviceId);
    if (!device) throw new Error("设备不存在");
    device.enabled = enabled;
    if (device.kind === "gateway") {
      device.gatewayState = enabled ? "undeployed" : "disabled";
      device.online = enabled ? "pending" : "offline";
    }
  }
  function saveGateway(draft: GatewayDraft, originalId?: string): PositioningDevice {
    const gatewayType = DEVICE_TYPES[draft.type];
    if (!draft.id.trim() || !draft.model.trim()) throw new Error("请填写网关编号和设备型号");
    if (gatewayType?.kind !== "gateway") throw new Error("请选择有效的网关类型");
    const duplicate = state.devices.some((item) => item.id === draft.id.trim() && item.id !== originalId);
    if (duplicate) throw new Error("设备编号已存在");
    const existing = originalId ? state.devices.find((item) => item.id === originalId && item.kind === "gateway") : undefined;
    if (originalId && !existing) throw new Error("定位网关不存在");
    const at = now();
    if (existing) {
      Object.assign(existing, { type: draft.type, model: draft.model.trim(), space: draft.space.trim(), syncedAt: at });
      state.syncRecords.unshift({ id: id(), deviceId: existing.id, kind: "gateway", at, status: "updated", message: "更新网关档案" });
      return existing;
    }
    const gateway: PositioningDevice = {
      id: draft.id.trim(),
      kind: "gateway",
      type: draft.type,
      model: draft.model.trim(),
      vendor: "本地维护",
      online: "pending",
      battery: null,
      enabled: true,
      syncedAt: at,
      lastSeenAt: null,
      space: draft.space.trim(),
      coordinate: "",
      gatewayState: "undeployed",
      linkedStationIds: [],
    };
    state.devices.unshift(gateway);
    state.syncRecords.unshift({ id: id(), deviceId: gateway.id, kind: "gateway", at, status: "added", message: "录入网关档案" });
    return gateway;
  }
  function setGatewayStations(gatewayId: string, stationIds: string[]): void {
    const gateway = state.devices.find((item) => item.id === gatewayId && item.kind === "gateway");
    if (!gateway) throw new Error("定位网关不存在");
    const uniqueIds = [...new Set(stationIds)];
    if (uniqueIds.some((stationId) => !state.devices.some((item) => item.id === stationId && item.kind === "station")))
      throw new Error("关联列表中存在无效基站");
    const occupied = state.devices.find(
      (item) =>
        item.kind === "gateway" && item.id !== gatewayId && item.linkedStationIds.some((stationId) => uniqueIds.includes(stationId)),
    );
    if (occupied) throw new Error(`部分基站已关联至 ${occupied.id}`);
    gateway.linkedStationIds = uniqueIds;
    if (gateway.enabled && uniqueIds.length > 0) gateway.gatewayState = "running";
    const at = now();
    gateway.syncedAt = at;
    state.syncRecords.unshift({
      id: id(),
      deviceId: gateway.id,
      kind: "gateway",
      at,
      status: "updated",
      message: uniqueIds.length > 0 ? `关联 ${uniqueIds.length} 台定位基站` : "清空关联基站",
    });
  }
  function syncDevices(kind: DeviceKind, incoming: PositioningDevice[]): SyncResult {
    const result: SyncResult = { total: 0, added: 0, updated: 0, failed: 0, at: now(), records: [] };
    const seen = new Set<string>();
    for (const item of incoming.filter((device) => device.kind === kind)) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      result.total++;
      const existing = state.devices.find((device) => device.id === item.id);
      const valid = item.id && item.model && DEVICE_TYPES[item.type]?.kind === kind && (!existing || existing.kind === kind);
      const status = !valid ? "failed" : existing ? "updated" : "added";
      if (valid) {
        const next = { ...item, enabled: existing?.enabled ?? true, syncedAt: result.at };
        if (existing) Object.assign(existing, next);
        else state.devices.unshift(next);
      }
      result[status]++;
      result.records.push({
        id: id(),
        deviceId: item.id || "未知设备",
        kind,
        at: result.at,
        status,
        message: valid ? "设备档案及运行状态同步成功" : "设备编号、型号或类型不完整，已保留原数据",
      });
    }
    state.syncRecords.unshift(...result.records);
    return result;
  }

  /** 关联只新增档案，重复提交不会覆盖已有启停状态、人员绑定或设备信息。 */
  function associateDevices(kind: AssociableDeviceKind, devices: PositioningDevice[]): { added: number; skipped: number } {
    if (kind !== "terminal" && kind !== "station") throw new Error("暂不支持关联该类设备");
    if (devices.length === 0) throw new Error("请至少选择一台设备");
    const incoming: PositioningDevice[] = [];
    const existingIds = new Map(state.devices.map((device) => [device.id, device.sourceDeviceId]));
    const sourceIds = new Set(state.devices.map((device) => device.sourceDeviceId).filter(Boolean));
    let skipped = 0;
    for (const device of devices) {
      if (!device.id.trim() || !device.sourceDeviceId || device.kind !== kind || DEVICE_TYPES[device.type]?.kind !== kind) {
        throw new Error("所选设备不存在或不属于当前设备类型，请重新选择");
      }
      if (sourceIds.has(device.sourceDeviceId)) {
        skipped += 1;
        continue;
      }
      if (existingIds.has(device.id)) {
        throw new Error(`设备编号 ${device.id} 已存在，请核对设备档案`);
      }
      incoming.push({ ...device, linkedStationIds: [...device.linkedStationIds] });
      existingIds.set(device.id, device.sourceDeviceId);
      sourceIds.add(device.sourceDeviceId);
    }
    state.devices.unshift(...incoming);
    return { added: incoming.length, skipped };
  }

  function positionsFor(personId: string) {
    const intervals = history(personId);
    return state.positions
      .filter((point) =>
        intervals.some(
          (binding) =>
            binding.terminalId === point.terminalId &&
            Date.parse(point.at) >= Date.parse(binding.startedAt) &&
            (!binding.endedAt || Date.parse(point.at) < Date.parse(binding.endedAt)),
        ),
      )
      .toSorted((a, b) => Date.parse(a.at) - Date.parse(b.at));
  }
  return {
    state,
    currentBinding,
    history,
    syncPeople,
    bind,
    unbind,
    setDeviceEnabled,
    saveGateway,
    setGatewayStations,
    syncDevices,
    associateDevices,
    positionsFor,
  };
}
