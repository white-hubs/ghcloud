import { Checkbox, Modal } from "ant-design-vue";
import { computed, defineComponent, onMounted, reactive, ref, watch } from "vue";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type {
  LiangcangApplicationDevicePageItem,
  LiangcangAreaTreeItem,
  LiangcangBoundWarehouseDevicePageItem,
  LiangcangDeviceProductOption,
  LiangcangRadarBindingDetailVO,
  LiangcangWarehouseRadarBindPayload,
} from "@ghcloud/cube-granary-management-service";
import { Button, Form, FormItem, Input, Page, message, PopOver, Select, Table } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeGranaryManagementService } from "@/api/service";

import "./associate-devices.less";

type BoundDeviceTableRow = LiangcangBoundWarehouseDevicePageItem & { areaDisplayName: string; rowUid: string };

interface DeviceBindRecord {
  id: string;
  deviceId: string;
  sn: string;
  type: string;
  deviceName: string;
  productName: string;
  areaName: string;
}

type DeviceTableRow = DeviceBindRecord & { rowUid: string };
type SelectOption = { label: string; value: string };

const deviceRowUid = (id: string): string => `device:${id}`;
const parseDeviceIdFromRowUid = (rowUid: string): string => rowUid.replace(/^device:/, "");

const getRouteQueryString = (route: RouteLocationNormalizedLoaded, key: string): string => {
  const raw = route.query[key];
  const s = Array.isArray(raw) ? raw[0] : raw;
  return typeof s === "string" && s.trim() !== "" ? s.trim() : "";
};

const resolveApplicationDeviceBindId = (item: LiangcangApplicationDevicePageItem): string => {
  if (item.deviceId != null && String(item.deviceId).trim() !== "") {
    return String(item.deviceId).trim();
  }
  if (item.id != null && String(item.id).trim() !== "") {
    return String(item.id).trim();
  }
  if (item.code != null && String(item.code).trim() !== "") {
    return String(item.code).trim();
  }
  return "";
};

/** 对齐 OpenAPI ApplicationRelatedDeviceVO 与旧列表字段 */
const mapApplicationDeviceToTableRow = (item: LiangcangApplicationDevicePageItem): DeviceTableRow => {
  const bindId = resolveApplicationDeviceBindId(item);
  const displayId = item.code != null && String(item.code).trim() !== "" ? String(item.code).trim() : bindId !== "" ? bindId : "--";
  const displayName = item.deviceName ?? item.name ?? "--";
  const typeStr = item.deviceType ?? item.typeName ?? item.productInfo?.productCategory?.name ?? "";
  const productStr = item.productName ?? item.productInfo?.name ?? "";
  const areaStr =
    item.areaName ??
    item.area?.pathName ??
    item.area?.name ??
    (item.areaId != null && String(item.areaId).trim() !== "" ? String(item.areaId) : "");
  const snStr = item.thirdPartyId != null && String(item.thirdPartyId).trim() !== "" ? String(item.thirdPartyId) : "--";
  return {
    id: bindId !== "" ? bindId : displayId,
    rowUid: deviceRowUid(bindId !== "" ? bindId : displayId),
    deviceId: displayId,
    sn: snStr,
    type: typeStr !== "" ? typeStr : "--",
    deviceName: displayName,
    productName: productStr !== "" ? productStr : "--",
    areaName: areaStr !== "" ? areaStr : "--",
  };
};

const mapProductOptions = (items: LiangcangDeviceProductOption[]): SelectOption[] =>
  items.map((item) => ({
    label: item.name,
    value: item.id,
  }));

const flattenAreaOptions = (items: LiangcangAreaTreeItem[], parentName = ""): SelectOption[] => {
  const result: SelectOption[] = [];
  for (const item of items) {
    const name = parentName === "" ? item.name : `${parentName}/${item.name}`;
    result.push({
      label: name,
      value: item.id,
    });
    if (Array.isArray(item.children) && item.children.length > 0) {
      result.push(...flattenAreaOptions(item.children, name));
    }
  }
  return result;
};

const getBindErrorText = (error: unknown): string => {
  if (error != null && typeof error === "object" && "response" in error) {
    const data = (error as { response?: { data?: { message?: string } } }).response?.data;
    const m = data?.message;
    if (typeof m === "string" && m.length > 0) {
      return m;
    }
  }
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  return "绑定失败，请稍后重试";
};

const renderCell = (text?: string): JSX.Element => {
  const v = text || "--";
  return <PopOver content={v}>{v}</PopOver>;
};

const BOUND_DEVICE_TABLE_SCROLL_X = 960;

/** 关联设备弹窗筛选：略窄于已关联区，便于单行排布 */
const MODAL_DEVICE_FILTER_FIELD_WIDTH_PX = 168;

export const AssociateDevices = defineComponent({
  name: "AssociateDevices",
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const router = useRouter();

    const detail = ref<LiangcangRadarBindingDetailVO | null>(null);
    const detailLoading = ref(false);
    const displayRadarSn = ref<string>("--");
    const resolvedWarehouseId = ref<number>(Number.NaN);
    const resolvedRadarDeviceId = ref<number>(Number.NaN);

    const boundDeviceRows = ref<BoundDeviceTableRow[]>([]);
    const boundDeviceLoading = ref(false);
    const boundDeviceTotal = ref(0);
    const boundPagination = reactive({
      pageNumber: 1,
      pageSize: 10,
    });
    const boundDeviceFilters = reactive({
      productIds: [] as string[],
      areaIds: [] as string[],
      deviceName: "",
    });
    const unbindSelectAllMatchingBound = ref(false);
    const unbindBatchSubmitting = ref(false);
    const selectedBoundRowKeys = ref<string[]>([]);

    const associateModalOpen = ref(false);
    const modalBindSubmitting = ref(false);
    const modalDeviceTableData = ref<DeviceTableRow[]>([]);
    const modalSelectedDeviceRowKeys = ref<string[]>([]);
    const bindSelectAllMatchingApplication = ref(false);
    const modalDeviceLoading = ref(false);
    const modalDeviceTotal = ref(0);
    const modalDevicePagination = reactive({
      pageNumber: 1,
      pageSize: 10,
    });
    const modalDeviceFilters = reactive({
      productIds: [] as string[],
      areaIds: [] as string[],
      deviceName: "",
    });
    const productOptions = ref<SelectOption[]>([]);
    const areaOptions = ref<SelectOption[]>([]);

    const warehouseIdFromRoute = computed((): string => getRouteQueryString(route, "warehouseId"));

    const granaryNameDisplay = computed((): string => detail.value?.granaryName ?? "--");
    const granaryCategoryDisplay = computed((): string => detail.value?.category ?? "--");
    const radarDeviceIdDisplay = computed((): string =>
      Number.isFinite(resolvedRadarDeviceId.value) ? String(resolvedRadarDeviceId.value) : "--",
    );

    const mapBoundDeviceRows = (records: LiangcangBoundWarehouseDevicePageItem[]): BoundDeviceTableRow[] =>
      records.map((item, index) => ({
        ...item,
        areaDisplayName: item.areaName ?? item.area?.pathName ?? item.area?.name ?? "",
        rowUid: String(item.deviceId ?? "").trim() !== "" ? String(item.deviceId).trim() : `d:${boundPagination.pageNumber}:${index}`,
      }));

    const loadBoundDevicesPage = async (): Promise<void> => {
      const wid = resolvedWarehouseId.value;
      if (!Number.isFinite(wid)) {
        boundDeviceRows.value = [];
        boundDeviceTotal.value = 0;
        return;
      }
      boundDeviceLoading.value = true;
      try {
        const page = await cubeGranaryManagementService.getBoundWarehouseDevicesPage({
          warehouseId: wid,
          pageNumber: boundPagination.pageNumber,
          pageSize: boundPagination.pageSize,
          ...(boundDeviceFilters.productIds.length > 0 ? { productIds: boundDeviceFilters.productIds } : {}),
          ...(boundDeviceFilters.areaIds.length > 0 ? { areaIds: boundDeviceFilters.areaIds } : {}),
          ...(boundDeviceFilters.deviceName.trim() !== "" ? { deviceName: boundDeviceFilters.deviceName.trim() } : {}),
        });
        boundDeviceTotal.value = page.total;
        boundDeviceRows.value = mapBoundDeviceRows(page.records);
      } catch {
        boundDeviceRows.value = [];
        boundDeviceTotal.value = 0;
      } finally {
        boundDeviceLoading.value = false;
      }
    };

    const resolveRadarSn = async (warehouseId: number, radarDeviceId: number): Promise<void> => {
      try {
        const list = await cubeGranaryManagementService.getWarehouseRadarList();
        const hit = list.find((r) => r.warehouseId === warehouseId && Number(r.radarDeviceId) === radarDeviceId);
        displayRadarSn.value = hit?.sn != null && String(hit.sn).trim() !== "" ? String(hit.sn) : "--";
      } catch {
        displayRadarSn.value = "--";
      }
    };

    const loadDetailAndContext = async (): Promise<void> => {
      const idStr = warehouseIdFromRoute.value;
      if (idStr === "") {
        return;
      }
      const wid = Number(idStr);
      if (!Number.isFinite(wid)) {
        message.error("无效的粮仓 ID");
        return;
      }
      detailLoading.value = true;
      try {
        const res = await cubeGranaryManagementService.getRadarBindingDetail(wid);
        detail.value = res;
        const fromQuery = Number(getRouteQueryString(route, "radarDeviceId"));
        const fromDetail = res?.radarDeviceId != null ? Number(res.radarDeviceId) : Number.NaN;
        const rid = Number.isFinite(fromDetail) ? fromDetail : fromQuery;
        if (!Number.isFinite(rid)) {
          message.error("缺少有效的雷达设备 ID，请从列表重新进入");
          resolvedWarehouseId.value = Number.NaN;
          resolvedRadarDeviceId.value = Number.NaN;
          return;
        }
        resolvedWarehouseId.value = wid;
        resolvedRadarDeviceId.value = rid;
        await resolveRadarSn(wid, rid);
        boundDeviceFilters.productIds = [];
        boundDeviceFilters.areaIds = [];
        boundDeviceFilters.deviceName = "";
        unbindSelectAllMatchingBound.value = false;
        boundPagination.pageNumber = 1;
        selectedBoundRowKeys.value = [];
        await loadBoundDevicesPage();
      } catch (error) {
        message.error(getBindErrorText(error));
      } finally {
        detailLoading.value = false;
      }
    };

    const loadDeviceFilterOptions = async (): Promise<void> => {
      const [products, areas] = await Promise.all([
        cubeGranaryManagementService.getDeviceProductOptions(),
        cubeGranaryManagementService.getAreaTree(),
      ]);
      productOptions.value = mapProductOptions(products);
      areaOptions.value = flattenAreaOptions(areas);
    };

    const loadModalDevicePage = async (): Promise<void> => {
      modalDeviceLoading.value = true;
      try {
        const page = await cubeGranaryManagementService.getApplicationDevicesPage({
          pageNumber: modalDevicePagination.pageNumber,
          pageSize: modalDevicePagination.pageSize,
          productIds: modalDeviceFilters.productIds,
          areaIds: modalDeviceFilters.areaIds,
          deviceName: modalDeviceFilters.deviceName.trim(),
        });
        modalDeviceTotal.value = page.total;
        modalDeviceTableData.value = page.records.map(mapApplicationDeviceToTableRow);
      } finally {
        modalDeviceLoading.value = false;
      }
    };

    const fetchModalDeviceList = async (): Promise<void> => {
      modalDevicePagination.pageNumber = 1;
      await loadModalDevicePage();
    };

    const resetModalDeviceFilters = async (): Promise<void> => {
      modalDeviceFilters.productIds = [];
      modalDeviceFilters.areaIds = [];
      modalDeviceFilters.deviceName = "";
      bindSelectAllMatchingApplication.value = false;
      await fetchModalDeviceList();
    };

    const handleModalDeviceTablePageChange = (page: number, pageSize: number): void => {
      modalDevicePagination.pageNumber = page || 1;
      modalDevicePagination.pageSize = pageSize;
      void loadModalDevicePage();
    };

    const toggleModalDeviceRowSelection = (record: DeviceTableRow): void => {
      if (bindSelectAllMatchingApplication.value) {
        return;
      }
      const key = record.rowUid;
      const next = new Set(modalSelectedDeviceRowKeys.value);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      modalSelectedDeviceRowKeys.value = Array.from(next);
    };

    const openAssociateModal = (): void => {
      associateModalOpen.value = true;
      bindSelectAllMatchingApplication.value = false;
      modalSelectedDeviceRowKeys.value = [];
      modalDeviceFilters.productIds = [];
      modalDeviceFilters.areaIds = [];
      modalDeviceFilters.deviceName = "";
      modalDevicePagination.pageNumber = 1;
      void loadModalDevicePage();
    };

    const closeAssociateModal = (): void => {
      associateModalOpen.value = false;
    };

    const handleModalBind = async (): Promise<void> => {
      const warehouseId = resolvedWarehouseId.value;
      const radarDeviceId = resolvedRadarDeviceId.value;
      if (!Number.isFinite(warehouseId) || !Number.isFinite(radarDeviceId)) {
        message.warning("粮仓或雷达信息不完整");
        return;
      }
      if (!bindSelectAllMatchingApplication.value && modalSelectedDeviceRowKeys.value.length === 0) {
        message.warning("请选择需要绑定的设备");
        return;
      }
      const deviceIds: string[] = [];
      for (const k of modalSelectedDeviceRowKeys.value) {
        const id = parseDeviceIdFromRowUid(k).trim();
        if (id === "") {
          message.warning("存在无效的设备 ID");
          return;
        }
        deviceIds.push(id);
      }
      if (!bindSelectAllMatchingApplication.value && deviceIds.length === 0) {
        message.warning("请选择有效的设备");
        return;
      }
      modalBindSubmitting.value = true;
      try {
        const bindPayload: LiangcangWarehouseRadarBindPayload = {
          warehouseId,
          radarDeviceId,
          deviceIds,
          selectAllDevices: bindSelectAllMatchingApplication.value,
        };
        if (bindSelectAllMatchingApplication.value && modalDeviceFilters.productIds.length > 0) {
          bindPayload.productIds = modalDeviceFilters.productIds;
        }
        if (bindSelectAllMatchingApplication.value && modalDeviceFilters.areaIds.length > 0) {
          bindPayload.areaIds = modalDeviceFilters.areaIds;
        }
        if (bindSelectAllMatchingApplication.value && modalDeviceFilters.deviceName.trim() !== "") {
          bindPayload.deviceName = modalDeviceFilters.deviceName.trim();
        }
        const ok = await cubeGranaryManagementService.bindWarehouseRadar(bindPayload);
        if (ok) {
          message.success("绑定成功");
          closeAssociateModal();
          boundPagination.pageNumber = 1;
          await loadBoundDevicesPage();
        } else {
          message.warning("绑定未成功");
        }
      } catch (error) {
        message.error(getBindErrorText(error));
      } finally {
        modalBindSubmitting.value = false;
      }
    };

    const fetchBoundDeviceList = async (): Promise<void> => {
      boundPagination.pageNumber = 1;
      selectedBoundRowKeys.value = [];
      unbindSelectAllMatchingBound.value = false;
      await loadBoundDevicesPage();
    };

    const resetBoundDeviceFilters = async (): Promise<void> => {
      boundDeviceFilters.productIds = [];
      boundDeviceFilters.areaIds = [];
      boundDeviceFilters.deviceName = "";
      unbindSelectAllMatchingBound.value = false;
      await fetchBoundDeviceList();
    };

    const handleBoundTablePageChange = (page: number, pageSize: number): void => {
      boundPagination.pageNumber = page || 1;
      boundPagination.pageSize = pageSize;
      selectedBoundRowKeys.value = [];
      unbindSelectAllMatchingBound.value = false;
      void loadBoundDevicesPage();
    };

    const handleBatchUnbind = async (): Promise<void> => {
      const wid = resolvedWarehouseId.value;
      if (!Number.isFinite(wid)) {
        return;
      }
      if (!unbindSelectAllMatchingBound.value && selectedBoundRowKeys.value.length === 0) {
        message.warning("请先勾选设备，或勾选「解绑全部符合条件已关联设备」");
        return;
      }
      const deviceIds = unbindSelectAllMatchingBound.value
        ? []
        : selectedBoundRowKeys.value.map((k) => String(k).trim()).filter((id) => id !== "");
      if (!unbindSelectAllMatchingBound.value && deviceIds.length === 0) {
        message.warning("没有有效的设备 ID");
        return;
      }
      unbindBatchSubmitting.value = true;
      try {
        const ok = await cubeGranaryManagementService.unbindWarehouse(
          unbindSelectAllMatchingBound.value
            ? {
                warehouseId: wid,
                selectAllDevices: true,
                ...(boundDeviceFilters.productIds.length > 0 ? { productIds: boundDeviceFilters.productIds } : {}),
                ...(boundDeviceFilters.areaIds.length > 0 ? { areaIds: boundDeviceFilters.areaIds } : {}),
                ...(boundDeviceFilters.deviceName.trim() !== "" ? { deviceName: boundDeviceFilters.deviceName.trim() } : {}),
              }
            : { warehouseId: wid, deviceIds },
        );
        if (ok) {
          message.success("解绑成功");
          selectedBoundRowKeys.value = [];
          unbindSelectAllMatchingBound.value = false;
          boundPagination.pageNumber = 1;
          await loadBoundDevicesPage();
        } else {
          message.warning("解绑未成功");
        }
      } catch (error) {
        message.error(getBindErrorText(error));
      } finally {
        unbindBatchSubmitting.value = false;
      }
    };

    const goBack = (): void => {
      void router.push({ path: "/main-management" });
    };

    onMounted(() => {
      if (warehouseIdFromRoute.value === "") {
        void router.replace({ path: "/main-management" });
        return;
      }
      void loadDeviceFilterOptions();
      void loadDetailAndContext();
    });

    watch(
      () => [getRouteQueryString(route, "warehouseId"), getRouteQueryString(route, "radarDeviceId")],
      () => {
        if (getRouteQueryString(route, "warehouseId") === "") {
          void router.replace({ path: "/main-management" });
          return;
        }
        void loadDetailAndContext();
      },
    );

    const boundColumns = [
      {
        title: "产品类型",
        dataIndex: "deviceType",
        align: "center" as const,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => renderCell(text),
      },
      {
        title: "产品名称",
        dataIndex: "productName",
        align: "center" as const,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => renderCell(text),
      },
      {
        title: "设备ID",
        dataIndex: "deviceId",
        align: "center" as const,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => renderCell(text),
      },
      {
        title: "设备名称",
        dataIndex: "deviceName",
        align: "center" as const,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => renderCell(text),
      },
      {
        title: "区域",
        dataIndex: "areaDisplayName",
        align: "center" as const,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => renderCell(text),
      },
    ];

    const modalDeviceColumns = [
      {
        title: "设备ID",
        dataIndex: "deviceId",
        align: "center" as const,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => renderCell(text),
      },
      {
        title: "设备名称",
        dataIndex: "deviceName",
        align: "center" as const,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => renderCell(text),
      },
      {
        title: "类型",
        dataIndex: "type",
        align: "center" as const,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => renderCell(text),
      },
      {
        title: "产品",
        dataIndex: "productName",
        align: "center" as const,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => renderCell(text),
      },
      {
        title: "区域",
        dataIndex: "areaName",
        align: "center" as const,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => renderCell(text),
      },
    ];

    return (): JSX.Element => (
      <div class="associate-devices-root">
        <CubeLayout
          title={pageTitle ?? "粮仓编辑"}
          v-slots={{
            "layout-header": () => <Button onClick={() => goBack()}>返回</Button>,
            "layout-content": () => (
              <div class="associate-devices-page">
                <div class="associate-devices-granary-strip">
                  <div class="associate-devices-granary-strip__item">
                    <span class="associate-devices-granary-strip__label">粮仓名称</span>
                    <span class="associate-devices-granary-strip__value">{granaryNameDisplay.value}</span>
                  </div>
                  <div class="associate-devices-granary-strip__item">
                    <span class="associate-devices-granary-strip__label">粮仓类型</span>
                    <span class="associate-devices-granary-strip__value">{granaryCategoryDisplay.value}</span>
                  </div>
                  <div class="associate-devices-granary-strip__item">
                    <span class="associate-devices-granary-strip__label">雷达设备 ID</span>
                    <span class="associate-devices-granary-strip__value">{radarDeviceIdDisplay.value}</span>
                  </div>
                  <div class="associate-devices-granary-strip__item">
                    <span class="associate-devices-granary-strip__label">雷达设备 SN</span>
                    <span class="associate-devices-granary-strip__value">{displayRadarSn.value}</span>
                  </div>
                </div>

                <section class="associate-devices-associated">
                  <div class="associate-devices-associated__head">
                    <div class="associate-devices-associated__title-wrap">
                      <h3 class="associate-devices-associated__title">已关联设备</h3>
                      <span class="associate-devices-associated__hint">
                        在表格上方操作：勾选行后点「批量解绑」；「解绑全部…」按上方筛选解绑全部已关联设备，与弹窗内「绑定全部…」含义不同
                      </span>
                    </div>
                  </div>
                  <Form class="associate-devices-filter associate-devices-bound-filter" layout="inline">
                    <FormItem label="产品">
                      <Select
                        v-model:value={boundDeviceFilters.productIds}
                        placeholder="请选择"
                        mode="multiple"
                        options={productOptions.value}
                        showSearch
                        showArrow={false}
                        allowClear
                        maxTagCount={1}
                        optionFilterProp="label"
                        style={{ width: "220px" }}
                      />
                    </FormItem>
                    <FormItem label="区域">
                      <Select
                        v-model:value={boundDeviceFilters.areaIds}
                        placeholder="请选择"
                        mode="multiple"
                        options={areaOptions.value}
                        showSearch
                        showArrow={false}
                        allowClear
                        maxTagCount={1}
                        optionFilterProp="label"
                        style={{ width: "220px" }}
                      />
                    </FormItem>
                    <FormItem label="名称">
                      <Input
                        v-model:value={boundDeviceFilters.deviceName}
                        placeholder="请输入"
                        allowClear
                        maxlength={20}
                        showCount
                        style={{ width: "220px" }}
                        onPressEnter={() => void fetchBoundDeviceList()}
                      />
                    </FormItem>
                    <FormItem>
                      <Button type="primary" onClick={() => void fetchBoundDeviceList()}>
                        查询
                      </Button>
                      <Button style={{ marginLeft: "8px" }} onClick={() => void resetBoundDeviceFilters()}>
                        重置
                      </Button>
                    </FormItem>
                  </Form>
                  <div class="associate-devices-bound-toolbar">
                    <Checkbox
                      class="associate-devices-select-all-checkbox"
                      checked={unbindSelectAllMatchingBound.value}
                      onChange={(event: { target?: { checked?: boolean } }) => {
                        unbindSelectAllMatchingBound.value = Boolean(event.target?.checked);
                        if (unbindSelectAllMatchingBound.value) {
                          selectedBoundRowKeys.value = [];
                        }
                      }}
                    >
                      解绑全部符合条件已关联设备
                    </Checkbox>
                    <div class="associate-devices-bound-toolbar__actions">
                      <Button
                        loading={unbindBatchSubmitting.value}
                        disabled={unbindBatchSubmitting.value}
                        onClick={() => void handleBatchUnbind()}
                      >
                        批量解绑
                      </Button>
                      <Button type="primary" onClick={openAssociateModal}>
                        关联设备
                      </Button>
                    </div>
                  </div>
                  <div class="associate-devices-bound-table-wrap">
                    <Table
                      class="associate-devices-bound-table"
                      rowKey="rowUid"
                      columns={boundColumns}
                      dataSource={boundDeviceRows.value}
                      loading={boundDeviceLoading.value || detailLoading.value}
                      scrollX={BOUND_DEVICE_TABLE_SCROLL_X}
                      pagination={false}
                      rowSelection={{
                        selectedRowKeys: unbindSelectAllMatchingBound.value ? [] : selectedBoundRowKeys.value,
                        onChange: (keys: string[]) => {
                          if (unbindSelectAllMatchingBound.value) {
                            return;
                          }
                          selectedBoundRowKeys.value = keys;
                        },
                        getCheckboxProps: () => ({
                          disabled: unbindSelectAllMatchingBound.value,
                        }),
                      }}
                    />
                  </div>
                </section>

                <Modal
                  title="关联设备"
                  open={associateModalOpen.value}
                  width={1200}
                  wrapClassName="associate-devices-associate-modal-wrap"
                  destroyOnClose={false}
                  onCancel={closeAssociateModal}
                  v-slots={{
                    footer: () => (
                      <div class="associate-devices-modal-footer">
                        <Button onClick={closeAssociateModal}>取消</Button>
                      </div>
                    ),
                  }}
                >
                  <div class="associate-devices-modal-body">
                    <p class="associate-devices-modal-hint">
                      「绑定全部…」按下方筛选关联全部可关联设备；与已关联列表「解绑全部…」含义不同。绑定操作请点表格上方的「批量绑定」。
                    </p>
                    <div class="associate-devices-modal-query">
                      <Form class="associate-devices-filter associate-devices-modal-filter" layout="inline">
                        <FormItem label="产品">
                          <Select
                            v-model:value={modalDeviceFilters.productIds}
                            placeholder="请选择"
                            mode="multiple"
                            options={productOptions.value}
                            showSearch
                            showArrow={false}
                            allowClear
                            maxTagCount={1}
                            optionFilterProp="label"
                            style={{ width: `${MODAL_DEVICE_FILTER_FIELD_WIDTH_PX}px` }}
                          />
                        </FormItem>
                        <FormItem label="区域">
                          <Select
                            v-model:value={modalDeviceFilters.areaIds}
                            placeholder="请选择"
                            mode="multiple"
                            options={areaOptions.value}
                            showSearch
                            showArrow={false}
                            allowClear
                            maxTagCount={1}
                            optionFilterProp="label"
                            style={{ width: `${MODAL_DEVICE_FILTER_FIELD_WIDTH_PX}px` }}
                          />
                        </FormItem>
                        <FormItem label="名称">
                          <Input
                            v-model:value={modalDeviceFilters.deviceName}
                            placeholder="请输入"
                            allowClear
                            maxlength={20}
                            showCount
                            style={{ width: `${MODAL_DEVICE_FILTER_FIELD_WIDTH_PX}px` }}
                            onPressEnter={() => void fetchModalDeviceList()}
                          />
                        </FormItem>
                        <div class="associate-devices-modal-filter__actions">
                          <FormItem>
                            <Button type="primary" onClick={() => void fetchModalDeviceList()}>
                              查询
                            </Button>
                            <Button style={{ marginLeft: "8px" }} onClick={() => void resetModalDeviceFilters()}>
                              重置
                            </Button>
                          </FormItem>
                        </div>
                      </Form>
                    </div>
                    <div class="associate-devices-modal-toolbar">
                      <Checkbox
                        class="associate-devices-select-all-checkbox"
                        checked={bindSelectAllMatchingApplication.value}
                        onChange={(event: { target?: { checked?: boolean } }) => {
                          bindSelectAllMatchingApplication.value = Boolean(event.target?.checked);
                          if (bindSelectAllMatchingApplication.value) {
                            modalSelectedDeviceRowKeys.value = [];
                          }
                        }}
                      >
                        绑定全部符合条件可关联设备
                      </Checkbox>
                      <div class="associate-devices-modal-toolbar__actions">
                        <Button
                          type="primary"
                          loading={modalBindSubmitting.value}
                          disabled={
                            modalBindSubmitting.value ||
                            (!bindSelectAllMatchingApplication.value && modalSelectedDeviceRowKeys.value.length === 0)
                          }
                          onClick={() => void handleModalBind()}
                        >
                          批量绑定
                        </Button>
                      </div>
                    </div>
                    <div class="associate-devices-modal-device-table-wrap">
                      <Table
                        rowKey="rowUid"
                        columns={modalDeviceColumns}
                        dataSource={modalDeviceTableData.value}
                        loading={modalDeviceLoading.value}
                        pagination={false}
                        rowSelection={{
                          preserveSelectedRowKeys: true,
                          selectedRowKeys: bindSelectAllMatchingApplication.value ? [] : modalSelectedDeviceRowKeys.value,
                          onChange: (keys: string[]) => {
                            if (bindSelectAllMatchingApplication.value) {
                              return;
                            }
                            modalSelectedDeviceRowKeys.value = keys;
                          },
                          getCheckboxProps: () => ({
                            disabled: bindSelectAllMatchingApplication.value,
                          }),
                        }}
                        customRow={(record: DeviceTableRow) => ({
                          onClick: (e: MouseEvent) => {
                            const el = e.target as HTMLElement | null;
                            if (el?.closest?.(".cube-granary-management-app-table-selection-column")) {
                              return;
                            }
                            e.stopPropagation();
                            toggleModalDeviceRowSelection(record);
                          },
                        })}
                      />
                      <div class="associate-devices-table-page">
                        <Page
                          current={modalDevicePagination.pageNumber}
                          pageSize={modalDevicePagination.pageSize}
                          total={modalDeviceTotal.value}
                          onPageChange={handleModalDeviceTablePageChange}
                        />
                      </div>
                    </div>
                  </div>
                </Modal>
              </div>
            ),
            "footer-page": () => (
              <Page
                current={boundPagination.pageNumber}
                pageSize={boundPagination.pageSize}
                total={boundDeviceTotal.value}
                onPageChange={handleBoundTablePageChange}
              />
            ),
          }}
        />
      </div>
    );
  },
});
