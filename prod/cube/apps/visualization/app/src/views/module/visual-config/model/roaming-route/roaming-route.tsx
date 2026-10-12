import { Input as AntInput } from "ant-design-vue";
import { computed, defineComponent, inject, onMounted, onUnmounted, reactive, ref, shallowRef, Teleport, watch } from "vue";

import { Button, Empty, Form, FormItem, Input, Modal, Page, PopConfirm, Select, Space, Spin, Table, message } from "@ghcloud/cube-ui";

import { CONFIG_SHELL_TITLE_EXTRA_ID, CONFIG_SHELL_TITLE_META_ID } from "../../config-shell";
import { MODEL_CONFIGURATION_KEY, type ModelConfigurationApi } from "../composables/use-model-configuration";
import type { ModelConfig } from "../types";
import { createConfigId, isGisEntry, isScadaEntry, isThreeEntry, isUe5Entry } from "../utils/entry";
import { RoamingPerspectivePicker, type RoamingPerspectivePickerExpose } from "./roaming-perspective-picker";

import styles from "./roaming-route.module.less";

const { TextArea } = AntInput;
const DEFAULT_PAGE_SIZE = 10;
const SMALL_TABLE_HEADER_HEIGHT = 40;
const MIN_TABLE_BODY_HEIGHT = 120;

type RouteItem = ModelConfig["ue5"]["roamingRoute"][number];
type PointItem = RouteItem["route"][number];

type FlatPoint = PointItem & {
  routeId: string;
  routeName: string;
  routeIndex: number;
  pointIndex: number;
  area?: string;
};

/**
 * 漫游路线：路线 + 点位（视角参数文本录入）。
 */
export const RoamingRoute = defineComponent({
  name: "RoamingRoute",
  setup() {
    const modelApi = inject(MODEL_CONFIGURATION_KEY) as ModelConfigurationApi | undefined;
    const titleMountReady = ref(false);
    const selectedRouteId = ref("");
    const keywordInput = ref("");
    const keyword = ref("");
    const tableWrapRef = shallowRef<HTMLElement>();
    const perspectivePickerRef = shallowRef<RoamingPerspectivePickerExpose>();
    const tableScrollY = shallowRef(MIN_TABLE_BODY_HEIGHT);
    let tableResizeObserver: ResizeObserver | undefined;
    const pagination = reactive({
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    });
    const routeModal = reactive({
      open: false,
      mode: "create" as "create" | "edit",
      index: -1,
      submitting: false,
      name: "",
      id: "",
    });
    const pointModal = reactive({
      open: false,
      mode: "create" as "create" | "edit",
      routeId: "",
      routeIndex: -1,
      pointIndex: -1,
      submitting: false,
      pointName: "",
      perspective: "",
      area: "",
      speed: 0.3,
      id: "",
    });

    const entry = computed(() => modelApi?.modelConfig.value.entry ?? "views");
    const unsupported = computed(() => isGisEntry(entry.value) || isScadaEntry(entry.value));

    const routes = computed<RouteItem[]>(() => {
      if (!modelApi) {
        return [];
      }
      if (isUe5Entry(entry.value)) {
        return modelApi.modelConfig.value.ue5.roamingRoute;
      }
      if (isThreeEntry(entry.value)) {
        return modelApi.modelConfig.value.three.roamingRoute as unknown as RouteItem[];
      }
      return [];
    });

    const filteredPoints = computed<FlatPoint[]>(() => {
      const q = keyword.value.trim().toLowerCase();
      const rows: FlatPoint[] = [];
      routes.value.forEach((route, routeIndex) => {
        if (route.id !== selectedRouteId.value) {
          return;
        }
        route.route.forEach((point, pointIndex) => {
          if (q && !(point.pointName ?? "").toLowerCase().includes(q)) {
            return;
          }
          rows.push({
            ...point,
            routeId: route.id,
            routeName: route.name,
            routeIndex,
            pointIndex,
            area: "area" in point ? String((point as { area?: string }).area ?? "") : "",
          });
        });
      });
      return rows;
    });

    const pagedPoints = computed(() => {
      const start = (pagination.pageNumber - 1) * pagination.pageSize;
      return filteredPoints.value.slice(start, start + pagination.pageSize);
    });

    const routeOptions = computed(() => routes.value.map((route) => ({ label: route.name, value: route.id })));
    const threeAreaItems = computed(() => {
      if (!modelApi) {
        return [];
      }
      const result = new Map<string, { id: string; name: string; aliasName: string; modelUrl: string }>();
      for (const server of modelApi.modelConfig.value.three.modelServer) {
        for (const area of server.areaList ?? []) {
          result.set(area.id, { ...area, aliasName: area.aliasName || area.name, modelUrl: server.url });
        }
      }
      return [...result.values()];
    });
    const threeAreaOptions = computed(() => threeAreaItems.value.map((area) => ({ label: area.name, value: area.id })));
    const pointModelUrl = computed(() => {
      if (!modelApi) {
        return "";
      }
      if (isUe5Entry(entry.value)) {
        return modelApi.modelConfig.value.ue5.modelServer[0]?.url ?? "";
      }
      if (isThreeEntry(entry.value)) {
        return (
          threeAreaItems.value.find((area) => area.id === pointModal.area)?.modelUrl ??
          modelApi.modelConfig.value.three.modelServer[0]?.url ??
          ""
        );
      }
      return "";
    });

    const getStoredAreaId = (value: string): string => {
      if (!value) {
        return threeAreaItems.value[0]?.id ?? "";
      }
      try {
        const area = JSON.parse(value) as { id?: string; name?: string };
        return area.id ?? threeAreaItems.value.find((item) => item.name === area.name)?.id ?? "";
      } catch {
        return threeAreaItems.value.find((item) => item.id === value || item.name === value)?.id ?? value;
      }
    };

    const updateTableScrollY = (): void => {
      const containerHeight = tableWrapRef.value?.clientHeight ?? 0;
      if (containerHeight <= 0) {
        return;
      }
      tableScrollY.value = Math.max(Math.floor(containerHeight - SMALL_TABLE_HEADER_HEIGHT), MIN_TABLE_BODY_HEIGHT);
    };

    const handleQuery = (): void => {
      keyword.value = keywordInput.value.trim();
      pagination.pageNumber = 1;
    };

    const handleReset = (): void => {
      keywordInput.value = "";
      keyword.value = "";
      pagination.pageNumber = 1;
    };

    const handleRouteSelect = (routeId: string): void => {
      selectedRouteId.value = routeId;
      handleReset();
    };

    const persistRoutes = async (next: RouteItem[]): Promise<boolean> => {
      if (!modelApi) {
        return false;
      }
      if (isUe5Entry(entry.value)) {
        modelApi.modelConfig.value.ue5.roamingRoute = next;
      } else if (isThreeEntry(entry.value)) {
        modelApi.modelConfig.value.three.roamingRoute = next as ModelConfig["three"]["roamingRoute"];
      }
      modelApi.markDirty();
      return modelApi.save();
    };

    const openCreateRoute = (): void => {
      routeModal.mode = "create";
      routeModal.index = -1;
      routeModal.name = "";
      routeModal.id = createConfigId();
      routeModal.open = true;
    };

    const openEditRoute = (routeId: string): void => {
      const index = routes.value.findIndex((item) => item.id === routeId);
      const route = routes.value[index];
      if (!route) {
        return;
      }
      routeModal.mode = "edit";
      routeModal.index = index;
      routeModal.name = route.name;
      routeModal.id = route.id;
      routeModal.open = true;
    };

    const saveRoute = async (): Promise<void> => {
      const name = routeModal.name.trim();
      if (!name) {
        message.warning("请输入漫游路线名称");
        return;
      }
      routeModal.submitting = true;
      try {
        const list = routes.value.map((item) => ({
          ...item,
          route: item.route.map((point) => ({ ...point })),
        }));
        if (routeModal.mode === "edit" && routeModal.index >= 0) {
          list[routeModal.index] = {
            ...list[routeModal.index],
            name,
          };
        } else {
          list.push({
            name,
            id: routeModal.id || createConfigId(),
            route: [],
          });
        }
        const ok = await persistRoutes(list);
        if (ok) {
          selectedRouteId.value = routeModal.id;
          routeModal.open = false;
        }
      } finally {
        routeModal.submitting = false;
      }
    };

    const deleteRoute = async (routeId: string): Promise<void> => {
      const list = routes.value.filter((item) => item.id !== routeId);
      await persistRoutes(list);
    };

    const openCreatePoint = (): void => {
      const routeIndex = routes.value.findIndex((item) => item.id === selectedRouteId.value);
      const route = routes.value[routeIndex];
      if (!route) {
        message.warning("请先新增漫游路线");
        return;
      }
      pointModal.mode = "create";
      pointModal.routeId = route.id;
      pointModal.routeIndex = routeIndex;
      pointModal.pointIndex = -1;
      pointModal.pointName = "";
      pointModal.perspective = "";
      pointModal.area = threeAreaItems.value[0]?.id ?? "";
      pointModal.speed = 0.3;
      pointModal.id = createConfigId();
      pointModal.open = true;
    };

    const openEditPoint = (row: FlatPoint): void => {
      pointModal.mode = "edit";
      pointModal.routeId = row.routeId;
      pointModal.routeIndex = row.routeIndex;
      pointModal.pointIndex = row.pointIndex;
      pointModal.pointName = row.pointName;
      pointModal.perspective = row.perspective;
      pointModal.area = getStoredAreaId(row.area || "");
      pointModal.speed = row.speed ?? 0.3;
      pointModal.id = row.id;
      pointModal.open = true;
    };

    const savePoint = async (): Promise<void> => {
      const pointName = pointModal.pointName.trim();
      const perspective = pointModal.perspective.trim();
      if (!pointModal.routeId) {
        message.warning("请选择漫游路线");
        return;
      }
      if (!pointName) {
        message.warning("请输入点位名称");
        return;
      }
      if (!perspective) {
        message.warning("请输入视角参数");
        return;
      }
      pointModal.submitting = true;
      try {
        const list = routes.value.map((item) => ({
          ...item,
          route: item.route.map((point) => ({ ...point })),
        }));
        const routeIndex = list.findIndex((item) => item.id === pointModal.routeId);
        if (routeIndex === -1) {
          message.warning("漫游路线不存在");
          return;
        }
        const point: PointItem & { area?: string } = {
          id: pointModal.id || createConfigId(),
          name: pointName,
          pointName,
          perspective,
          sort:
            pointModal.mode === "edit" && pointModal.pointIndex >= 0
              ? (list[routeIndex].route[pointModal.pointIndex]?.sort ?? list[routeIndex].route.length)
              : list[routeIndex].route.length,
          speed: Number(pointModal.speed) || 0.3,
        };
        if (isThreeEntry(entry.value)) {
          const selectedArea = threeAreaItems.value.find((area) => area.id === pointModal.area);
          const areaName = selectedArea?.name ?? "未命名区域";
          point.area = JSON.stringify({
            id: selectedArea?.id ?? areaName,
            name: areaName,
            aliasName: selectedArea?.aliasName ?? areaName,
          });
        }
        if (pointModal.mode === "edit" && pointModal.pointIndex >= 0) {
          list[routeIndex].route[pointModal.pointIndex] = point;
        } else {
          list[routeIndex].route.push(point);
        }
        const ok = await persistRoutes(list);
        if (ok) {
          pointModal.open = false;
        }
      } finally {
        pointModal.submitting = false;
      }
    };

    const deletePoint = async (row: FlatPoint): Promise<void> => {
      const list = routes.value.map((item) => ({
        ...item,
        route: item.route.map((point) => ({ ...point })),
      }));
      if (!list[row.routeIndex]) {
        return;
      }
      list[row.routeIndex].route.splice(row.pointIndex, 1);
      await persistRoutes(list);
    };

    const columns = [
      { title: "漫游路线", dataIndex: "routeName", key: "routeName", width: 160, ellipsis: true },
      { title: "点位名称", dataIndex: "pointName", key: "pointName", width: 140, ellipsis: true },
      { title: "视角参数", dataIndex: "perspective", key: "perspective", ellipsis: true },
      {
        title: "操作",
        key: "action",
        width: 140,
        customRender: ({ record }: { record: FlatPoint }) => (
          <Space size={0}>
            <Button type="link" size="small" onClick={() => openEditPoint(record)}>
              编辑点位
            </Button>
            <PopConfirm title="确定删除该点位吗？" onConfirm={() => void deletePoint(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </Space>
        ),
      },
    ];

    watch(
      routes,
      (items) => {
        if (!items.some((item) => item.id === selectedRouteId.value)) {
          selectedRouteId.value = items[0]?.id ?? "";
        }
        pagination.pageNumber = 1;
      },
      { immediate: true },
    );

    watch([() => filteredPoints.value.length, () => pagination.pageSize], ([total]) => {
      const maxPage = Math.max(1, Math.ceil(total / pagination.pageSize));
      if (pagination.pageNumber > maxPage) {
        pagination.pageNumber = maxPage;
      }
    });

    onMounted(() => {
      titleMountReady.value = Boolean(
        document.querySelector(`#${CONFIG_SHELL_TITLE_META_ID}`) && document.querySelector(`#${CONFIG_SHELL_TITLE_EXTRA_ID}`),
      );
      if (tableWrapRef.value) {
        tableResizeObserver = new ResizeObserver(updateTableScrollY);
        tableResizeObserver.observe(tableWrapRef.value);
        updateTableScrollY();
      }
    });

    onUnmounted(() => {
      tableResizeObserver?.disconnect();
    });

    const renderTitlePortals = (): JSX.Element | undefined => {
      if (!titleMountReady.value || !modelApi) {
        return undefined;
      }

      return (
        <>
          <Teleport to={`#${CONFIG_SHELL_TITLE_META_ID}`}>
            <div class={styles.entryBadge} title={`当前渲染类型：${modelApi.entryLabel.value}`}>
              <span class={styles.entryDivider} aria-hidden="true" />
              <span class={styles.entryLabel}>当前渲染类型</span>
              <span class={styles.entryValue}>{modelApi.entryLabel.value}</span>
            </div>
          </Teleport>
          {!unsupported.value && (
            <Teleport to={`#${CONFIG_SHELL_TITLE_EXTRA_ID}`}>
              <Space size={8}>
                <Button type="primary" onClick={openCreateRoute}>
                  新增路线
                </Button>
                <Button disabled={!selectedRouteId.value} onClick={openCreatePoint}>
                  新增点位
                </Button>
              </Space>
            </Teleport>
          )}
        </>
      );
    };

    return () => {
      if (!modelApi) {
        return <div>模型配置上下文缺失</div>;
      }
      if (unsupported.value) {
        return (
          <div class={styles.root}>
            {renderTitlePortals()}
            <div class={styles.emptyState}>
              <Empty description={isGisEntry(entry.value) ? "WebGIS 漫游路线暂未开放" : "二维组态无需配置漫游路线"} />
              <div class={styles.emptyHint}>
                {isGisEntry(entry.value) ? "当前渲染类型暂不支持路线与点位设置" : "当前渲染类型可直接使用画面交互，无需维护漫游点位"}
              </div>
            </div>
          </div>
        );
      }

      return (
        <div class={styles.root}>
          {renderTitlePortals()}
          <Spin spinning={modelApi.loading.value || modelApi.saving.value}>
            <div class={styles.workspace}>
              <aside class={styles.routePane}>
                <div class={styles.routePaneHeader}>
                  <span>路线列表</span>
                  <span class={styles.routeCount}>{routes.value.length}</span>
                </div>
                <div class={styles.routeList}>
                  {routes.value.length > 0 ? (
                    routes.value.map((route) => (
                      <div
                        key={route.id}
                        class={[styles.routeItem, route.id === selectedRouteId.value ? styles.routeItemSelected : undefined]}
                      >
                        <button type="button" class={styles.routeSelect} title={route.name} onClick={() => handleRouteSelect(route.id)}>
                          <span class={styles.routeDot} aria-hidden="true" />
                          <span class={styles.routeName}>{route.name}</span>
                        </button>
                        <Space size={0} class={styles.routeItemActions}>
                          <Button type="link" size="small" onClick={() => openEditRoute(route.id)}>
                            编辑
                          </Button>
                          <PopConfirm title={`确定删除路线「${route.name}」及其点位吗？`} onConfirm={() => void deleteRoute(route.id)}>
                            <Button type="link" size="small" danger>
                              删除
                            </Button>
                          </PopConfirm>
                        </Space>
                      </div>
                    ))
                  ) : (
                    <Empty class={styles.routeEmpty} description="暂无漫游路线" />
                  )}
                </div>
              </aside>

              <main class={styles.listPane}>
                <div class={styles.listToolbar}>
                  <Form layout="inline" class={styles.filterForm}>
                    <FormItem label="点位名称">
                      <Input
                        value={keywordInput.value}
                        maxlength={50}
                        showCount
                        allowClear
                        placeholder="请输入点位名称"
                        class={styles.keywordInput}
                        onUpdate:value={(val: string) => {
                          keywordInput.value = val ?? "";
                        }}
                        onPressEnter={handleQuery}
                      />
                    </FormItem>
                    <FormItem>
                      <Space size={8}>
                        <Button type="primary" onClick={handleQuery}>
                          查询
                        </Button>
                        <Button onClick={handleReset}>重置</Button>
                      </Space>
                    </FormItem>
                  </Form>
                </div>

                <div ref={tableWrapRef} class={styles.tableWrap}>
                  <Table
                    columns={columns}
                    dataSource={pagedPoints.value}
                    locale={{
                      emptyText: (
                        <Empty
                          class={styles.pointEmpty}
                          description={selectedRouteId.value ? "当前路线暂无点位" : "请先新增并选择漫游路线"}
                        />
                      ),
                    }}
                    pagination={false}
                    rowKey={(row: FlatPoint) => `${row.routeId}-${row.id}-${row.pointIndex}`}
                    scrollY={tableScrollY.value}
                    size="middle"
                  />
                </div>

                <div class={styles.pagination}>
                  <Page
                    current={pagination.pageNumber}
                    pageSize={pagination.pageSize}
                    total={filteredPoints.value.length}
                    syncQuery={false}
                    onPageChange={(pageNumber: number, pageSize: number) => {
                      pagination.pageNumber = pageNumber;
                      pagination.pageSize = pageSize;
                    }}
                    onShowSizeChange={(pageNumber: number, pageSize: number) => {
                      pagination.pageNumber = pageNumber;
                      pagination.pageSize = pageSize;
                    }}
                  />
                </div>
              </main>
            </div>
          </Spin>

          <Modal
            visible={routeModal.open}
            title={routeModal.mode === "create" ? "新增漫游路线" : "编辑漫游路线"}
            confirmLoading={routeModal.submitting}
            destroyOnClose
            okText="保存"
            onOk={() => void saveRoute()}
            onCancel={() => {
              routeModal.open = false;
            }}
          >
            <Form layout="horizontal" labelCol={{ style: { width: "96px" } }}>
              <FormItem label="路线名称" required>
                <Input
                  value={routeModal.name}
                  maxlength={50}
                  placeholder="请输入漫游路线名称"
                  onUpdate:value={(val: string) => {
                    routeModal.name = val ?? "";
                  }}
                />
              </FormItem>
            </Form>
          </Modal>

          <Modal
            visible={pointModal.open}
            title={pointModal.mode === "create" ? "新增漫游点位" : "编辑漫游点位"}
            confirmLoading={pointModal.submitting}
            destroyOnClose
            okText="保存"
            width="min(1200px, calc(100vw - 48px))"
            onOk={() => void savePoint()}
            onCancel={() => {
              pointModal.open = false;
            }}
          >
            <Form layout="horizontal" class={styles.pointForm}>
              <div class={styles.pointFormGrid}>
                <FormItem label="所属路线" required>
                  <Select
                    value={pointModal.routeId}
                    options={routeOptions.value}
                    style={{ width: "100%" }}
                    placeholder="请选择漫游路线"
                    onUpdate:value={(val: string | number | string[]) => {
                      pointModal.routeId = String(val ?? "");
                    }}
                  />
                </FormItem>
                <FormItem label="点位名称" required>
                  <Input
                    value={pointModal.pointName}
                    maxlength={50}
                    placeholder="请输入点位名称"
                    onUpdate:value={(val: string) => {
                      pointModal.pointName = val ?? "";
                    }}
                  />
                </FormItem>
                {isThreeEntry(entry.value) && (
                  <FormItem label="关联区域" required>
                    <Select
                      value={pointModal.area}
                      options={threeAreaOptions.value}
                      placeholder="请选择模型区域"
                      onUpdate:value={(val: string | number | string[]) => {
                        pointModal.area = String(val ?? "");
                      }}
                    />
                  </FormItem>
                )}
              </div>
              <FormItem label="视角参数" required class={styles.perspectiveFormItem}>
                <div class={styles.perspectiveInputRow}>
                  <TextArea
                    value={pointModal.perspective}
                    rows={2}
                    placeholder="可手动输入，或在下方模型中调整视角后点击获取"
                    onUpdate:value={(val: string) => {
                      pointModal.perspective = val ?? "";
                    }}
                  />
                  <Button type="primary" onClick={() => perspectivePickerRef.value?.capturePerspective()}>
                    获取视角
                  </Button>
                </div>
              </FormItem>
            </Form>
            <RoamingPerspectivePicker
              key={`${entry.value}-${pointModelUrl.value}-${pointModal.id}`}
              ref={perspectivePickerRef}
              entry={entry.value}
              modelUrl={pointModelUrl.value}
              perspective={pointModal.perspective}
              onSelect={(value: string) => {
                pointModal.perspective = value;
              }}
            />
          </Modal>
        </div>
      );
    };
  },
});

export default RoamingRoute;
