import { Button, DatePicker, Input, Table } from "ant-design-vue";
import dayjs, { type Dayjs } from "dayjs";
import { defineComponent, ref, computed, watch, onMounted } from "vue";

import { CubeLayout, useCubeQueryState } from "@ghcloud/cube-app-design";
import { message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeLineLossManagementService, cubeSecurityManagementService } from "@/api/server";

import styles from "./collection-record.module.less";

interface DeviceItem {
  id: string;
  name: string;
}

interface RecordRow {
  id: number;
  deviceCode: string;
  deviceName: string;
  lastTime: string;
  lastValue: string;
  currentTime: string;
  meterValue: string;
  usage: string;
}

function buildMockDevices(): DeviceItem[] {
  return Array.from({ length: 18 }).map((_, idx) => ({
    id: `dev-${idx + 1}`,
    name: "设备名称",
  }));
}

function buildMockRows(): RecordRow[] {
  return Array.from({ length: 10 }).map((_, idx) => ({
    id: idx + 1,
    deviceCode: "A01_10FM",
    deviceName: "1F-电表001",
    lastTime: idx === 9 ? "1F消控室" : formatMeterTime("2022-12-12 12:12:12"),
    lastValue: "345.32",
    currentTime: formatMeterTime("2022-12-12 12:12:12"),
    meterValue: idx === 0 ? "" : "345.32",
    usage: "87.56",
  }));
}

function getDefaultDateRange(): [Dayjs, Dayjs] {
  const end = dayjs();
  const start = end.subtract(1, "month");
  return [start, end];
}

/** 上期/本期抄表时间：统一为 YYYY-MM-DD HH:mm:ss，兼容时间戳(ms/s)、ISO 字符串 */
function formatMeterTime(value: unknown): string {
  if (value === null || value === undefined) {
    return "--";
  }
  const raw = String(value).trim();
  if (raw === "") {
    return "--";
  }
  const num = Number(raw);
  if (!Number.isNaN(num) && /^-?\d+(\.\d+)?$/.test(raw)) {
    const ms = Math.abs(num) < 1e12 ? Math.round(num * 1000) : num;
    const parsed = dayjs(ms);
    return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm:ss") : raw;
  }
  const parsed = dayjs(raw);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm:ss") : raw;
}

export const CollectionRecord = defineComponent({
  name: "CollectionRecord",
  setup: () => {
    const { pageTitle } = usePageName();
    const deviceLoading = ref(false);
    const deviceList = ref<DeviceItem[]>([]);
    const deviceTotal = ref(0);
    const devicePageNumber = ref(1);
    const devicePageSize = ref(20);
    const deviceKeyword = ref("");
    const selectedDeviceIds = ref<string[]>([]);
    const deviceListLoaded = ref(false);
    const filteredDevices = computed(() => deviceList.value);
    const deviceHasMore = computed(() => deviceList.value.length < deviceTotal.value);

    watch(
      filteredDevices,
      (next) => {
        if (!deviceListLoaded.value) {
          return;
        }
        if (next.length === 0 && selectedDeviceIds.value.length > 0) {
          selectedDeviceIds.value = [];
          syncSelectedDevicesToCache();
        }
      },
      { immediate: true },
    );

    const fetchDevices = async (mode: "replace" | "append"): Promise<void> => {
      deviceLoading.value = true;
      try {
        const res = await cubeSecurityManagementService.getSecurityDevicePage({
          pageNumber: devicePageNumber.value,
          pageSize: devicePageSize.value,
          applicationCode: "ELECTRICMANAGE",
          keyword: deviceKeyword.value.trim(),
          areaId: "",
        });
        const records = ((
          res as unknown as {
            records?: { id?: string; name?: string; deviceName?: string; deviceId?: string }[];
          }
        ).records ?? []) as {
          id?: string;
          name?: string;
          deviceName?: string;
          deviceId?: string;
        }[];
        deviceTotal.value = Number((res as unknown as { total?: number }).total ?? 0);
        const mapped = records.map((r, idx) => ({
          id: String(r.deviceId ?? r.id ?? idx),
          name: String(r.deviceName ?? r.name ?? "--"),
        }));
        if (mode === "append") {
          const existing = new Set(deviceList.value.map((d) => d.id));
          const merged = [...deviceList.value, ...mapped.filter((d) => !existing.has(d.id))];
          deviceList.value = merged;
          if (mapped.length === 0) {
            deviceTotal.value = merged.length;
          }
        } else {
          deviceList.value = mapped;
        }
        deviceListLoaded.value = true;
      } catch {
        if (mode === "append") {
          devicePageNumber.value = Math.max(1, devicePageNumber.value - 1);
        }
        if (mode === "replace") {
          deviceList.value = buildMockDevices();
          deviceTotal.value = deviceList.value.length;
          deviceListLoaded.value = true;
        }
        message.error("设备列表加载失败");
      } finally {
        deviceLoading.value = false;
      }
    };

    let keywordTimer: number | undefined;
    watch(
      () => deviceKeyword.value,
      () => {
        if (keywordTimer) {
          window.clearTimeout(keywordTimer);
        }
        keywordTimer = window.setTimeout(() => {
          devicePageNumber.value = 1;
          deviceList.value = [];
          deviceTotal.value = 0;
          fetchDevices("replace");
        }, 300);
      },
    );

    // 首次加载
    fetchDevices("replace");

    const onDeviceScroll = (e: Event): void => {
      const el = e.target as HTMLElement | null;
      if (!el) {
        return;
      }
      if (deviceLoading.value) {
        return;
      }
      if (!deviceHasMore.value) {
        return;
      }
      const threshold = 48;
      const reachedBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
      if (!reachedBottom) {
        return;
      }
      devicePageNumber.value += 1;
      fetchDevices("append");
    };

    const defaultDateRange = getDefaultDateRange();
    const queryState = useCubeQueryState<{
      startTime: string;
      endTime: string;
      selectedDeviceIds: string[];
      pageNumber: number;
      pageSize: number;
      total: number;
    }>({
      storage: "url",
      initialState: {
        startTime: defaultDateRange[0].format("YYYY-MM-DD"),
        endTime: defaultDateRange[1].format("YYYY-MM-DD"),
        selectedDeviceIds: [],
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      cacheFields: ["startTime", "endTime", "selectedDeviceIds", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "selectedDeviceIds") {
          return raw ? String(raw).split(",").filter(Boolean) : [];
        }
        if (field === "pageNumber" || field === "pageSize") {
          return Number(raw);
        }
        return raw;
      },
    });

    selectedDeviceIds.value = queryState.state.selectedDeviceIds;

    const dateRange = ref<[Dayjs, Dayjs] | null>([dayjs(queryState.state.startTime), dayjs(queryState.state.endTime)]);
    const tableLoading = ref(false);
    const allRows = ref<RecordRow[]>([]);
    let autoQueryTimer: number | undefined;

    const syncSelectedDevicesToCache = (): void => {
      queryState.update({ selectedDeviceIds: selectedDeviceIds.value });
      queryState.writeCache();
    };

    const fetchTable = async (): Promise<void> => {
      if (selectedDeviceIds.value.length === 0) {
        message.warning("请选择设备");
        allRows.value = [];
        queryState.update({ total: 0 });
        queryState.writeCache();
        return;
      }
      if (!dateRange.value) {
        message.warning("请选择时间范围");
        allRows.value = [];
        queryState.update({ total: 0 });
        queryState.writeCache();
        return;
      }
      tableLoading.value = true;
      try {
        const res = await cubeLineLossManagementService.getSecurityDevicePage({
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          startTime: queryState.state.startTime,
          endTime: queryState.state.endTime,
          deviceIdSet: selectedDeviceIds.value,
        });
        allRows.value = (res.records ?? []).map((r, idx) => ({
          id: (queryState.state.pageNumber - 1) * queryState.state.pageSize + idx + 1,
          deviceCode: r.deviceCode,
          deviceName: r.deviceName,
          lastTime: formatMeterTime(r.lastCollectTime),
          lastValue: r.lastReadValue,
          currentTime: formatMeterTime(r.currentCollectTime),
          meterValue: r.readValue,
          usage: r.useValue,
        }));
        queryState.update({ total: Number(res.total ?? 0) });
        queryState.writeCache();
      } catch (error) {
        allRows.value = buildMockRows();
        queryState.update({ total: allRows.value.length });
        queryState.writeCache();
        message.error((error as { errorMessage?: string })?.errorMessage ?? "采集记录加载失败");
      } finally {
        tableLoading.value = false;
      }
    };

    const onQuery = (): void => {
      const [start, end] = dateRange.value ?? defaultDateRange;
      queryState.update({
        startTime: start.format("YYYY-MM-DD"),
        endTime: end.format("YYYY-MM-DD"),
      });
      queryState.resetPage();
      queryState.writeCache();
      fetchTable();
    };

    const onReset = (): void => {
      selectedDeviceIds.value = [];
      dateRange.value = getDefaultDateRange();
      allRows.value = [];
      queryState.update({
        startTime: defaultDateRange[0].format("YYYY-MM-DD"),
        endTime: defaultDateRange[1].format("YYYY-MM-DD"),
        selectedDeviceIds: [],
        total: 0,
      });
      queryState.resetPage();
      queryState.clearCache();
      fetchTable();
    };

    watch(
      dateRange,
      (val) => {
        if (!val) {
          return;
        }
        queryState.update({
          startTime: val[0].format("YYYY-MM-DD"),
          endTime: val[1].format("YYYY-MM-DD"),
        });
        queryState.writeCache();
      },
      { deep: true },
    );

    onMounted(() => {
      if (selectedDeviceIds.value.length > 0) {
        fetchTable();
      }
    });

    // 右侧数据由接口分页返回，不再本地 slice

    const columns = [
      {
        title: "序号",
        dataIndex: "id",
        key: "id",
        width: 70,
      },
      {
        title: "设备编码",
        dataIndex: "deviceCode",
        key: "deviceCode",
        width: 120,
      },
      {
        title: "设备名称",
        dataIndex: "deviceName",
        key: "deviceName",
        width: 140,
      },
      {
        title: "上期抄表时间",
        dataIndex: "lastTime",
        key: "lastTime",
        width: 160,
      },
      {
        title: "上次抄表数",
        dataIndex: "lastValue",
        key: "lastValue",
        width: 120,
      },
      {
        title: "本期抄表时间",
        dataIndex: "currentTime",
        key: "currentTime",
        width: 160,
      },
      {
        title: "抄表值",
        dataIndex: "meterValue",
        key: "meterValue",
        width: 120,
        customRender: ({ text }: { text: string }) => text || "--",
      },
      {
        title: "用量",
        dataIndex: "usage",
        key: "usage",
        width: 110,
        customRender: ({ text }: { text: string }) => <span class={styles.usageStrong}>{text}</span>,
      },
    ];

    return () => (
      <CubeLayout title={pageTitle} showFooter={false} showTableXScroll={false}>
        {{
          "layout-content": () => (
            <div class={styles.pageWrap}>
              <div class={styles.container}>
                <div class={styles.left}>
                  <div class={styles.deviceFilter}>
                    <Input
                      value={deviceKeyword.value}
                      placeholder="设备名称"
                      allowClear
                      onChange={(e: Event) => {
                        deviceKeyword.value = (e.target as HTMLInputElement | null)?.value ?? "";
                      }}
                    />
                  </div>
                  <div class={styles.deviceList} role="list" onScroll={onDeviceScroll}>
                    {filteredDevices.value.map((item) => (
                      <div
                        key={item.id}
                        role="listitem"
                        class={[styles.deviceItem, selectedDeviceIds.value.includes(item.id) && styles.deviceItemActive]}
                        onClick={() => {
                          const exists = selectedDeviceIds.value.includes(item.id);
                          selectedDeviceIds.value = exists
                            ? selectedDeviceIds.value.filter((id) => id !== item.id)
                            : [...selectedDeviceIds.value, item.id];
                          syncSelectedDevicesToCache();
                          if (autoQueryTimer) {
                            window.clearTimeout(autoQueryTimer);
                          }
                          autoQueryTimer = window.setTimeout(() => {
                            queryState.resetPage();
                            fetchTable();
                          }, 200);
                        }}
                      >
                        <input
                          class={styles.deviceCheckbox}
                          type="checkbox"
                          checked={selectedDeviceIds.value.includes(item.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => {
                            const exists = selectedDeviceIds.value.includes(item.id);
                            selectedDeviceIds.value = exists
                              ? selectedDeviceIds.value.filter((id) => id !== item.id)
                              : [...selectedDeviceIds.value, item.id];
                            syncSelectedDevicesToCache();
                            if (autoQueryTimer) {
                              window.clearTimeout(autoQueryTimer);
                            }
                            autoQueryTimer = window.setTimeout(() => {
                              queryState.resetPage();
                              fetchTable();
                            }, 200);
                          }}
                        />
                        <span>{item.name}</span>
                      </div>
                    ))}
                    {deviceLoading.value && <div class={styles.deviceLoading}>加载中...</div>}
                    {!deviceHasMore.value && filteredDevices.value.length > 0 && <div class={styles.deviceEnd}>没有更多了</div>}
                  </div>
                </div>
                <div class={styles.right}>
                  <div class={styles.filterRow}>
                    <div class={styles.filterLabel}>时间范围</div>
                    <DatePicker.RangePicker
                      class={styles.rangePicker}
                      value={dateRange.value}
                      onChange={(v: [Dayjs, Dayjs] | null) => {
                        dateRange.value = v;
                      }}
                    />
                    <Button type="primary" onClick={onQuery}>
                      查询
                    </Button>
                    <Button onClick={onReset}>重置</Button>
                  </div>
                  <Table
                    bordered
                    rowKey="id"
                    loading={tableLoading.value}
                    pagination={{
                      current: queryState.state.pageNumber,
                      pageSize: queryState.state.pageSize,
                      total: queryState.state.total,
                      showSizeChanger: true,
                      onChange: (p: number, ps: number) => {
                        queryState.setPage(p, ps);
                        fetchTable();
                      },
                    }}
                    dataSource={allRows.value}
                    columns={columns}
                    scroll={{ x: 940, y: 520 }}
                  />
                </div>
              </div>
            </div>
          ),
        }}
      </CubeLayout>
    );
  },
});
