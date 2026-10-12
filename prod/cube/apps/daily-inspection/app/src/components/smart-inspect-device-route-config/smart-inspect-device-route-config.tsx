import { computed, defineComponent, h, nextTick, onMounted, reactive, ref, shallowRef, watch, type PropType } from "vue";

import { InspectItemTable, InspectStandardTable, useCubeModal } from "@ghcloud/cube-app-design";
import { InspectBusinessType, type StandardItemType, type StandardVOS } from "@ghcloud/cube-daily-inspection-service";
import { Button, PopOver, Select, Space, TabPane, Table, Tabs, message } from "@ghcloud/cube-ui";
import { DeviceModalTable } from "@ghcloud/generic-component";

import { cubeMaintainDroneService } from "@/api/server";
import type { StandardItemsVo, StandardVo } from "@/types/inspect";
import {
  buildDroneDetailRecordFromPoint,
  formatDroneDateTime,
  isDroneWaypointCompleted,
  type DroneInspectRecordDetail,
} from "@/views/inspect-records/drone-inspect-record-detail";
import { DroneInspectRecordDetailModal } from "@/views/inspect-records/drone-inspect-record-detail-modal";
import {
  createSmartInspectPointFromDroneWaypoint,
  type SmartInspectDeviceRouteConfigValue,
  type SmartInspectPoint,
  type SmartInspectSpecialTargetCategory,
} from "@/views/smart-inspect-common/types";

import styles from "./smart-inspect-device-route-config.module.less";

const cloneStandards = (standards: StandardVo[] = []): StandardVo[] => {
  return standards.map((item) => ({
    ...item,
    standardItems: item.standardItems.map((standardItem) => ({ ...standardItem })),
  }));
};

const clonePoints = (points: SmartInspectPoint[] = []): SmartInspectPoint[] => {
  return points.map((item) => ({
    ...item,
    standardDTOList: cloneStandards(item.standardDTOList),
  }));
};

interface DeviceOptionSource {
  id: string;
  name: string;
  status?: string;
}

interface RouteOptionSource {
  id: string;
  name: string;
  distance?: string;
  deviceId?: string;
  deviceName?: string;
  waypointCount?: number;
}

const getRecords = (value: Record<string, unknown>): Record<string, unknown>[] => {
  const records = value.records;
  return Array.isArray(records) ? (records as Record<string, unknown>[]) : [];
};

const toStringId = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  return String(value);
};

const normalizeDroneRoute = (row: Record<string, unknown>): RouteOptionSource => {
  const waypointCount = Number(row.waypointCount || 0);
  return {
    id: toStringId(row.id),
    name: String(row.routeName || row.name || row.routeCode || row.id || ""),
    distance: row.routeCode ? String(row.routeCode) : waypointCount ? `${waypointCount}个航点` : undefined,
    deviceId: row.deviceId === 0 || row.deviceId === "0" ? "" : toStringId(row.deviceId),
    deviceName: String(row.deviceName || ""),
    waypointCount: Number.isFinite(waypointCount) ? waypointCount : undefined,
  };
};

const getInspectionTimeValue = (record: SmartInspectPoint): unknown => {
  return record.inspectionTime || record.flyFinishAt;
};

const AUTO_INSPECTION_DEVICE_APPLICATION_CODE = "DRONE";

const normalizeStandardRows = (rows: StandardVo[]): StandardVo[] => {
  const standardRows: StandardVo[] = [];
  rows.forEach((row) => {
    if (row?.id && !standardRows.some((item) => item.id === row.id)) {
      standardRows.push({
        ...row,
        standardItems: row.standardItems.map((item) => ({
          ...item,
          isRawItem: 1,
        })),
      });
    }
  });
  return standardRows;
};

export const SmartInspectDeviceRouteConfig = defineComponent({
  props: {
    method: {
      type: String as PropType<SmartInspectSpecialTargetCategory>,
      default: "DRONE",
    },
    value: {
      type: Object as PropType<SmartInspectDeviceRouteConfigValue | undefined>,
      default: undefined,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    showExecutionColumns: {
      type: Boolean,
      default: true,
    },
  },
  setup: (props, { expose }) => {
    const state = reactive<{
      deviceId: string;
      deviceName: string;
      routeId: string;
      points: SmartInspectPoint[];
      routeLoading: boolean;
    }>({
      deviceId: "",
      deviceName: "",
      routeId: "",
      points: [],
      routeLoading: false,
    });
    const droneRoutes = ref<RouteOptionSource[]>([]);
    const droneDeviceModalRef = ref<{ openModal: () => void }>();
    const selectedPointIds = ref<string[]>([]);
    const editingPointIds = ref<string[]>([]);
    const standardTableRef = ref<{
      getStandardSelectedRows: () => StandardVOS[];
      setStandardSelectedRows: (rows: StandardVOS[]) => void;
    }>();
    const inspectItemTableRef = ref<{
      getInspectItemSelectedRows: () => StandardItemType[];
      setInspectItemSelectedRows: (rows: StandardItemType[]) => void;
    }>();
    const droneDetailVisible = shallowRef(false);
    const selectedDroneDetailRecord = shallowRef<DroneInspectRecordDetail | null>(null);

    const openDroneDetail = (point: SmartInspectPoint): void => {
      selectedDroneDetailRecord.value = buildDroneDetailRecordFromPoint(point, {
        routeName: routeName.value,
        deviceName: deviceName.value,
        inspectMethod: props.method === "DRONE" ? "无人机巡检" : "机器狗巡检",
      });
      droneDetailVisible.value = true;
    };

    const closeDroneDetail = (): void => {
      droneDetailVisible.value = false;
    };

    const deviceSource = computed<DeviceOptionSource[]>(() => {
      if (props.method !== "DRONE" && props.method !== "ROBOT_DOG") return [];
      if (!state.deviceId) return [];
      return [{ id: state.deviceId, name: state.deviceName || state.deviceId, status: "" }];
    });
    const routeSource = computed<RouteOptionSource[]>(() => droneRoutes.value);
    const deviceOptions = computed(() =>
      deviceSource.value.map((item) => ({ label: item.status ? `${item.name}（${item.status}）` : item.name, value: item.id })),
    );
    const routeOptions = computed(() =>
      routeSource.value.map((item) => ({
        label: item.distance ? `${item.name}（${item.distance}）` : item.name,
        value: item.id,
      })),
    );
    const deviceName = computed(
      () => state.deviceName || props.value?.deviceName || deviceSource.value.find((item) => item.id === state.deviceId)?.name || "",
    );
    const routeName = computed(() => routeSource.value.find((item) => item.id === state.routeId)?.name || props.value?.routeName || "");

    const upsertDroneRoute = (route: RouteOptionSource): void => {
      if (!route.id) return;
      const index = droneRoutes.value.findIndex((item) => item.id === route.id);
      if (index >= 0) {
        droneRoutes.value.splice(index, 1, { ...droneRoutes.value[index], ...route });
        return;
      }
      droneRoutes.value.push(route);
    };

    const loadRouteOptions = async (): Promise<void> => {
      if (props.method !== "DRONE" && props.method !== "ROBOT_DOG") return;
      try {
        state.routeLoading = true;
        const payload = {
          pageNumber: 1,
          pageSize: 200,
          ...(state.deviceId ? { deviceId: state.deviceId } : {}),
        };
        const res =
          props.method === "DRONE"
            ? await cubeMaintainDroneService.pageDroneRoutes(payload)
            : await cubeMaintainDroneService.pageRobotDogRoutes(payload);
        droneRoutes.value = getRecords(res).map(normalizeDroneRoute);
      } finally {
        state.routeLoading = false;
      }
    };

    const handleDroneDeviceSelected = (
      values: Array<{ id: string; name?: string; deviceId?: string | number; deviceName?: string }>,
    ): void => {
      const selected = values[0];
      state.deviceId = selected ? toStringId(selected.deviceId || selected.id) : "";
      state.deviceName = selected ? String(selected.deviceName || selected.name || state.deviceId) : "";
      state.routeId = "";
      state.points = [];
      selectedPointIds.value = [];
      void loadRouteOptions();
    };

    const loadRouteDetail = async (routeId: string): Promise<void> => {
      if (!routeId) {
        state.points = [];
        return;
      }
      state.routeLoading = true;
      try {
        const detail =
          props.method === "DRONE"
            ? await cubeMaintainDroneService.getDroneRoute(routeId)
            : await cubeMaintainDroneService.getRobotDogRoute(routeId);
        upsertDroneRoute(normalizeDroneRoute(detail));
        if (!state.deviceId && detail.deviceId) {
          state.deviceId = toStringId(detail.deviceId);
          state.deviceName = String(detail.deviceName || detail.deviceId);
        }
        const waypoints = Array.isArray(detail.waypoints) ? (detail.waypoints as Record<string, unknown>[]) : [];
        state.points = waypoints.map(createSmartInspectPointFromDroneWaypoint);
        selectedPointIds.value = [];
      } finally {
        state.routeLoading = false;
      }
    };

    const [InspectContentModal, inspectContentModalApi] = useCubeModal({
      title: "配置点位巡检内容",
      width: "800px",
      destroyOnClose: false,
      onConfirm() {
        const selectedStandardRows = ((standardTableRef.value?.getStandardSelectedRows() || []) as unknown as StandardVo[]).filter(
          (row): row is StandardVo => Boolean(row && row.id),
        );
        const standardRows = normalizeStandardRows(selectedStandardRows);
        if (!standardRows.length) {
          message.warning("请选择巡检标准");
          return;
        }
        const selectedStandardItems = ((inspectItemTableRef.value?.getInspectItemSelectedRows() || []) as unknown as StandardItemsVo[]).map(
          (item) => ({
            ...item,
            isRawItem: 0,
          }),
        );
        standardRows[0].standardItems = [...standardRows[0].standardItems, ...selectedStandardItems];
        state.points = state.points.map((item) => {
          if (editingPointIds.value.includes(item.id)) {
            return {
              ...item,
              standardDTOList: cloneStandards(standardRows),
            };
          }
          return item;
        });
        inspectContentModalApi.close();
      },
    });

    const openConfigModal = (pointIds: string[]): void => {
      editingPointIds.value = pointIds;
      inspectContentModalApi.open();
      if (pointIds.length === 1) {
        const row = state.points.find((item) => item.id === pointIds[0]);
        nextTick(() => {
          standardTableRef.value?.setStandardSelectedRows(cloneStandards(row?.standardDTOList || []) as unknown as StandardVOS[]);
          const standard = row?.standardDTOList.find((item) => item.standardItems.length);
          if (standard) {
            inspectItemTableRef.value?.setInspectItemSelectedRows(standard.standardItems as unknown as StandardItemType[]);
          }
        });
      }
    };

    const hasPointStandard = (point: SmartInspectPoint): boolean => {
      return point.standardDTOList.some((standard) => standard.id && standard.standardItems.length);
    };

    const getConfig = (): SmartInspectDeviceRouteConfigValue | undefined => {
      if (props.method !== "DRONE" && props.method !== "ROBOT_DOG") return undefined;
      return {
        method: props.method,
        deviceId: state.deviceId,
        deviceName: deviceName.value,
        routeId: state.routeId,
        routeName: routeName.value,
        points: clonePoints(state.points),
      };
    };

    const validate = async (): Promise<SmartInspectDeviceRouteConfigValue | undefined> => {
      if (props.method !== "DRONE" && props.method !== "ROBOT_DOG") return undefined;
      if (!state.deviceId) {
        message.error(props.method === "DRONE" ? "请选择无人机设备" : "请选择机器狗设备");
        return Promise.reject(new Error("device required"));
      }
      if (!state.routeId) {
        message.error(props.method === "DRONE" ? "请选择无人机航线" : "请选择机器狗路线");
        return Promise.reject(new Error("route required"));
      }
      if (!state.points.length) {
        message.error("路线点不能为空");
        return Promise.reject(new Error("points required"));
      }
      if (state.points.some((point) => !hasPointStandard(point))) {
        message.error(props.method === "DRONE" ? "请配置航点巡检内容" : "请配置路线点巡检内容");
        return Promise.reject(new Error("point standards required"));
      }
      return getConfig();
    };

    const columns = computed(() => {
      const baseColumns = [
        {
          title: "序号",
          dataIndex: "order",
          width: 80,
          align: "center",
        },
        {
          title: props.method === "DRONE" ? "航点名称" : "路线点名称",
          dataIndex: "name",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
        },
        {
          title: "点位编码",
          dataIndex: "code",
          ellipsis: true,
        },
        {
          title: "位置",
          dataIndex: "address",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
        },
        {
          title: "执行坐标",
          dataIndex: "actualPosition",
          ellipsis: true,
          customRender: ({ record }: { record: SmartInspectPoint }): JSX.Element => {
            const text = [record.actualLng, record.actualLat, record.actualHeight].filter(Boolean).join(" / ") || "--";
            return <PopOver content={text}>{text}</PopOver>;
          },
        },
        {
          title: "动作",
          dataIndex: "actions",
          width: 120,
          customRender: ({ record }: { record: SmartInspectPoint }): string => {
            return [record.photoEnabled ? "拍照" : "", record.recordEnabled ? "录像" : ""].filter(Boolean).join("、") || "--";
          },
        },
        {
          title: "巡检内容",
          dataIndex: "standardDTOList",
          ellipsis: true,
          customRender: ({ record }: { record: SmartInspectPoint }): JSX.Element | string => {
            const text = record.standardDTOList
              .map((item) => item.name)
              .filter(Boolean)
              .join(",");
            if (!text) return "--";
            return (
              <PopOver content={text}>
                <div class={styles["content-text"]}>{text}</div>
              </PopOver>
            );
          },
        },
      ];
      if (props.readonly) {
        if (!props.showExecutionColumns) return baseColumns;
        return [
          ...baseColumns,
          {
            title: "执行状态",
            dataIndex: "status",
            customRender: ({ text }: { text: string }): string => {
              const map: Record<string, string> = {
                EXECUTING: "待巡检",
                OVER: "已巡检",
                WAIT_REPAIR: "待修复",
                WAITING: "等待执行",
                SENT: "已下发",
                FLYING: "飞行中",
                WAITING_ACTION: "等待动作",
                WAITING_MEDIA: "等待媒体",
                WAITING_RECORD: "等待录像",
                COMPLETED: "已完成",
                FAILED: "失败",
              };
              return map[text] || "--";
            },
          },
          {
            title: "巡检结果",
            dataIndex: "result",
            customRender: ({ text }: { text: string }): JSX.Element | string => {
              if (!text || text === "PENDING") return "待巡检";
              if (text === "ABNORMAL") return <span style={{ color: "#ff4158" }}>异常</span>;
              return <span style={{ color: "#6ab539" }}>正常</span>;
            },
          },
          {
            title: "执行时间",
            dataIndex: "inspectionTime",
            width: 170,
            customRender: ({ record }: { record: SmartInspectPoint }): JSX.Element => {
              const text = formatDroneDateTime(getInspectionTimeValue(record));
              return <PopOver content={text}>{text}</PopOver>;
            },
          },
          {
            title: "操作",
            dataIndex: "detailAction",
            width: 90,
            align: "center",
            customRender: ({ record }: { record: SmartInspectPoint }): JSX.Element | string => {
              if (!isDroneWaypointCompleted(record)) return "--";
              return (
                <Button type="link" size="small" onClick={() => openDroneDetail(record)}>
                  详情
                </Button>
              );
            },
          },
        ];
      }
      return [
        ...baseColumns,
        {
          title: "操作",
          dataIndex: "action",
          width: 140,
          fixed: "right",
          customRender: ({ record }: { record: SmartInspectPoint }): JSX.Element => (
            <Button type="link" size="small" onClick={() => openConfigModal([record.id])}>
              配置巡检内容
            </Button>
          ),
        },
      ];
    });

    const handleTabChange = (key: string): void => {
      if (editingPointIds.value.length > 1) return;
      const row = state.points.find((item) => editingPointIds.value.includes(item.id));
      if (!row) return;
      if (key === "1") {
        const selectRows = ((standardTableRef.value?.getStandardSelectedRows() || []) as unknown as StandardVOS[]).filter(
          (item) => item?.id,
        );
        standardTableRef.value?.setStandardSelectedRows([...selectRows, ...(row.standardDTOList as unknown as StandardVOS[])]);
        return;
      }
      const standard = row.standardDTOList.find((item) => item.standardItems.length);
      if (!standard) return;
      nextTick(() => {
        inspectItemTableRef.value?.setInspectItemSelectedRows(standard.standardItems as unknown as StandardItemType[]);
      });
    };

    watch(
      () => props.value,
      () => {
        if (!props.value) return;
        state.deviceId = props.value.deviceId || "";
        state.deviceName = props.value.deviceName || "";
        state.routeId = props.value.routeId || "";
        state.points = clonePoints(props.value.points || []);
      },
      { immediate: true, deep: true },
    );

    watch(
      () => props.method,
      () => {
        droneRoutes.value = [];
        if (props.method !== "DRONE" && props.method !== "ROBOT_DOG") {
          state.deviceId = "";
          state.deviceName = "";
          state.routeId = "";
          state.points = [];
          return;
        }
        if (state.deviceId && !deviceSource.value.some((item) => item.id === state.deviceId)) {
          state.deviceId = "";
        }
        void loadRouteOptions();
      },
      { immediate: true },
    );

    watch(
      () => state.deviceId,
      () => {
        if ((props.method !== "DRONE" && props.method !== "ROBOT_DOG") || !state.routeId || !state.deviceId) return;
        const route = routeSource.value.find((item) => item.id === state.routeId);
        if (route?.deviceId && route.deviceId !== state.deviceId) {
          state.routeId = "";
          state.points = [];
        }
      },
    );

    onMounted(() => {
      void loadRouteOptions();
    });

    expose({
      getConfig,
      validate,
    });

    return (): JSX.Element | null => {
      if (props.method !== "DRONE" && props.method !== "ROBOT_DOG") return null;

      return (
        <div class={styles.container}>
          {props.readonly ? (
            <div class={styles["readonly-card"]}>
              <div class={styles["readonly-item"]}>
                <span>{props.method === "DRONE" ? "无人机设备：" : "机器狗设备："}</span>
                {deviceName.value || state.deviceId || "--"}
              </div>
              <div class={styles["readonly-item"]}>
                <span>{props.method === "DRONE" ? "航线：" : "路线："}</span>
                {routeName.value || state.routeId || "--"}
              </div>
              <div class={styles["readonly-item"]}>
                <span>点位数：</span>
                {state.points.length}
              </div>
            </div>
          ) : (
            <>
              <div class={styles["selector-row"]}>
                <div class={styles["selector-item"]}>
                  <span class={styles["selector-label"]}>{props.method === "DRONE" ? "无人机设备：" : "机器狗设备："}</span>
                  <div class={styles["selector-value"]} style={{ display: "flex", gap: "8px" }}>
                    <Select
                      style={{ flex: 1 }}
                      open={false}
                      showArrow
                      options={deviceOptions.value}
                      value={state.deviceId || undefined}
                      placeholder={props.method === "DRONE" ? "请选择无人机设备" : "请选择机器狗设备"}
                    />
                    <Button type="primary" onClick={() => droneDeviceModalRef.value?.openModal()}>
                      选择设备
                    </Button>
                  </div>
                </div>
                <div class={styles["selector-item"]}>
                  <span class={styles["selector-label"]}>{props.method === "DRONE" ? "航线：" : "路线："}</span>
                  <Select
                    class={styles["selector-value"]}
                    v-model:value={state.routeId}
                    placeholder={props.method === "DRONE" ? "请选择航线" : "请选择路线"}
                    options={routeOptions.value}
                    loading={state.routeLoading}
                    disabled={!state.deviceId}
                    onChange={(value: string) => {
                      state.routeId = value;
                      void loadRouteDetail(value);
                    }}
                  />
                </div>
                <div class={styles["selector-item"]}>
                  <span class={styles["selector-label"]}>点位数：</span>
                  <span>{state.points.length}</span>
                </div>
              </div>
              <div class={styles.toolbar}>
                <Space>
                  <Button
                    type="primary"
                    disabled={!selectedPointIds.value.length}
                    onClick={() => {
                      openConfigModal(selectedPointIds.value);
                    }}
                  >
                    批量配置
                  </Button>
                </Space>
              </div>
            </>
          )}
          {h(Table as never, {
            columns: columns.value,
            dataSource: state.points,
            rowKey: "id",
            pagination: false,
            loading: false,
            ...(!props.readonly
              ? {
                  rowSelection: {
                    selectedRowKeys: selectedPointIds.value,
                    onChange: (keys: string[]) => {
                      selectedPointIds.value = keys;
                    },
                  },
                }
              : {}),
          })}
          <InspectContentModal>
            {inspectContentModalApi.state.isOpen && (
              <Tabs defaultActiveKey="1" onTabChange={handleTabChange} forceRender>
                <TabPane tab="巡检标准" key="1">
                  <InspectStandardTable businessType={InspectBusinessType.DAILY_INSPECTION} ref={standardTableRef} />
                </TabPane>
                <TabPane tab="巡检项" key="2">
                  <InspectItemTable businessType={InspectBusinessType.DAILY_INSPECTION} ref={inspectItemTableRef} />
                </TabPane>
              </Tabs>
            )}
          </InspectContentModal>
          {!props.readonly && (
            <DeviceModalTable
              ref={droneDeviceModalRef}
              title={props.method === "DRONE" ? "选择无人机设备" : "选择机器狗设备"}
              value={state.deviceId ? [{ id: state.deviceId, name: state.deviceName || state.deviceId }] : []}
              searchParams={{}}
              applicationCode={AUTO_INSPECTION_DEVICE_APPLICATION_CODE}
              securityDevice
              multiple={false}
              onOk={handleDroneDeviceSelected}
            />
          )}
          <DroneInspectRecordDetailModal
            visible={droneDetailVisible.value}
            record={selectedDroneDetailRecord.value}
            onClose={closeDroneDetail}
          />
        </div>
      );
    };
  },
});
