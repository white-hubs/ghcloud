import { computed, defineComponent, shallowRef, type PropType } from "vue";

import type { FireHostIndicatorLightConfigRecord } from "@ghcloud/cube-service-interface/fire-management";
import { Button, Input, Select, SelectOption } from "@ghcloud/cube-ui";

import type { ControlDevice, ControlDevicePanel } from "../models";
import { RecordsEmptyState } from "./records-empty-state";

import styles from "../fire-host-control.module.less";

const statusClass = (status: ControlDevice["status"]): string[] => [
  styles.deviceStatus,
  status === "run"
    ? styles.deviceRun
    : status === "processing"
      ? styles.deviceStarting
      : status === "flt"
        ? styles.deviceFault
        : styles.deviceStop,
];

const activeIndicatorIndex = (device: ControlDevice, indicatorCount: 2 | 3): number => {
  if (device.status === "flt") return 1;
  if (device.status === "processing") return 0;
  if (device.status === "run") return indicatorCount === 3 ? 2 : 0;
  return -1;
};

export const ControlledDevicePanel = defineComponent({
  name: "ControlledDevicePanel",
  props: {
    devices: { type: Array as PropType<ControlDevice[]>, required: true },
    activePanel: { type: String as PropType<ControlDevicePanel>, required: true },
    total: { type: Number, required: true },
    loading: { type: Boolean, required: true },
    loadingMore: { type: Boolean, required: true },
    hasMore: { type: Boolean, required: true },
    indicatorConfig: { type: Object as PropType<FireHostIndicatorLightConfigRecord>, required: true },
    indicatorConfigLoading: { type: Boolean, default: false },
  },
  emits: {
    control: (_deviceId: string, _action: "start" | "stop") => true,
    loadMore: () => true,
    panelChange: (_panel: ControlDevicePanel) => true,
  },
  setup(props, { emit }) {
    const typeFilter = shallowRef("all");
    const statusFilter = shallowRef("all");
    const keyword = shallowRef("");
    const visibleDevices = computed(() =>
      props.devices.filter(
        (device) =>
          device.panel === props.activePanel &&
          (typeFilter.value === "all" || device.type === typeFilter.value) &&
          (statusFilter.value === "all" || device.status === statusFilter.value) &&
          (!keyword.value.trim() || `${device.name}${device.location}`.toLowerCase().includes(keyword.value.trim().toLowerCase())),
      ),
    );
    const types = computed(() => [
      ...new Set(props.devices.filter((device) => device.panel === props.activePanel).map((device) => device.type)),
    ]);
    const controlButtonLabels = computed(() => ({
      start: props.indicatorConfig.indicatorButtons[0]?.name?.trim() || "启动",
      stop: props.indicatorConfig.indicatorButtons[1]?.name?.trim() || "停止",
    }));
    const handleScroll = (event: Event): void => {
      const target = event.currentTarget as HTMLElement;
      if (props.hasMore && !props.loadingMore && target.scrollTop + target.clientHeight >= target.scrollHeight - 32) {
        emit("loadMore");
      }
    };
    return () => (
      <section class={styles.devicePanel}>
        <div class={styles.sectionHeader}>
          <div>
            <strong>控制设备</strong>
            <span>
              当前显示 {visibleDevices.value.length} / 共 {props.total} 台
            </span>
          </div>
          <div class={styles.segmentedButtons}>
            <Button size="small" type={props.activePanel === "bus" ? "primary" : "default"} onClick={() => emit("panelChange", "bus")}>
              总线盘
            </Button>
            <Button size="small" type={props.activePanel === "multi" ? "primary" : "default"} onClick={() => emit("panelChange", "multi")}>
              多线盘
            </Button>
          </div>
        </div>
        <div class={styles.deviceFilters}>
          <Select value={typeFilter.value} style={{ width: "130px" }} onChange={(value: unknown) => (typeFilter.value = String(value))}>
            <SelectOption value="all">全部类型</SelectOption>
            {types.value.map((type) => (
              <SelectOption key={type} value={type}>
                {type}
              </SelectOption>
            ))}
          </Select>
          <Select value={statusFilter.value} style={{ width: "120px" }} onChange={(value: unknown) => (statusFilter.value = String(value))}>
            <SelectOption value="all">全部状态</SelectOption>
            <SelectOption value="run">运行中</SelectOption>
            <SelectOption value="stop">已停止</SelectOption>
            <SelectOption value="flt">故障</SelectOption>
          </Select>
          <Input
            value={keyword.value}
            allowClear
            placeholder="搜索设备名称/位置"
            style={{ width: "220px" }}
            onInput={(event: Event) => (keyword.value = (event.target as HTMLInputElement).value)}
          />
        </div>
        <div class={styles.deviceGrid} onScroll={handleScroll}>
          {visibleDevices.value.map((device) => (
            <article key={device.id} class={styles.deviceItem}>
              <div class={styles.deviceInfo}>
                <div class={styles.deviceName}>{device.name}</div>
                <div class={styles.deviceLocation}>{device.location}</div>
                {device.panel === "multi" ? (
                  <div class={styles.multiLineIndicators}>
                    {props.indicatorConfigLoading ? (
                      <span class={styles.indicatorLoading}>配置加载中...</span>
                    ) : (
                      props.indicatorConfig.indicatorButtons.slice(0, props.indicatorConfig.indicatorCount).map((button, index) => (
                        <span
                          key={button.code || `${index}-${button.name}`}
                          class={[
                            styles.multiLineIndicator,
                            activeIndicatorIndex(device, props.indicatorConfig.indicatorCount) === index && styles.multiLineIndicatorActive,
                          ]}
                          title={button.name}
                        >
                          <i />
                          {button.name}
                        </span>
                      ))
                    )}
                  </div>
                ) : null}
                <div class={statusClass(device.status)}>● {device.statusText}</div>
              </div>
              <div class={styles.deviceActions}>
                <Button
                  size="small"
                  type="primary"
                  loading={Boolean(device.commandPending)}
                  disabled={!device.online || !device.controlReady || device.status === "run" || Boolean(device.commandPending)}
                  onClick={() => emit("control", device.id, "start")}
                >
                  {controlButtonLabels.value.start}
                </Button>
                <Button
                  size="small"
                  danger
                  disabled={!device.online || !device.controlReady || device.status === "stop" || Boolean(device.commandPending)}
                  onClick={() => emit("control", device.id, "stop")}
                >
                  {controlButtonLabels.value.stop}
                </Button>
              </div>
            </article>
          ))}
          {props.loading ? <div class={styles.emptyState}>正在加载控制设备...</div> : null}
          {!props.loading && !visibleDevices.value.length ? (
            <RecordsEmptyState
              compact
              description={props.devices.length ? "暂无符合条件的控制设备" : "暂无控制设备"}
              detail={props.devices.length ? "请调整筛选条件后重试" : "当前主机暂未关联可控制设备"}
            />
          ) : null}
          {props.loadingMore ? <div class={styles.deviceLoadMore}>正在加载更多控制设备...</div> : null}
        </div>
      </section>
    );
  },
});
