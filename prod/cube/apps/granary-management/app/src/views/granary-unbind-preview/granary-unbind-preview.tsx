import { computed, defineComponent, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type { LiangcangBoundWarehouseDevicePageItem, LiangcangRadarBindingDetailVO } from "@ghcloud/cube-granary-management-service";
import { Button, Page, message, Table } from "@ghcloud/cube-ui";

import { cubeGranaryManagementService } from "@/api/service";

import "./granary-unbind-preview.less";

const formatHeightDisplay = (v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v)) {
    return "--";
  }
  return `${v} m`;
};

const formatVolumeDisplay = (v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v)) {
    return "--";
  }
  return `${v} m³`;
};

interface ListWarehouseFallback {
  name: string;
  category: string;
  level: string;
  maxHeight: string;
  volume: string;
}

type DeviceTableRow = LiangcangBoundWarehouseDevicePageItem & { areaDisplayName: string; rowUid: string };

const getQueryString = (route: ReturnType<typeof useRoute>, key: string): string => {
  const raw = route.query[key];
  const s = Array.isArray(raw) ? raw[0] : raw;
  return typeof s === "string" && s.length > 0 ? s : "";
};

const hasListWarehouseFallbackQuery = (route: ReturnType<typeof useRoute>): boolean => {
  return (
    getQueryString(route, "listName") !== "" ||
    getQueryString(route, "listCategory") !== "" ||
    getQueryString(route, "listLevel") !== "" ||
    getQueryString(route, "listMaxHeight") !== "" ||
    getQueryString(route, "listVolume") !== ""
  );
};

const getDetailErrorText = (error: unknown): string => {
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
  return "加载失败，请稍后重试";
};

export const GranaryUnbindPreview = defineComponent({
  name: "GranaryUnbindPreview",
  setup: () => {
    const route = useRoute();
    const router = useRouter();

    const granaryId = computed((): string => {
      const raw = route.query.granaryId;
      return Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
    });

    const readonlyPreview = computed((): boolean => getQueryString(route, "readonly") === "1");

    const hasValidGranaryIdQuery = computed((): boolean => {
      const idStr = granaryId.value.trim();
      if (idStr === "") {
        return false;
      }
      const n = Number(idStr);
      return Number.isFinite(n);
    });

    const listWarehouseFallback = computed((): ListWarehouseFallback | null => {
      const name = getQueryString(route, "listName");
      const category = getQueryString(route, "listCategory");
      const level = getQueryString(route, "listLevel");
      const maxHeight = getQueryString(route, "listMaxHeight");
      const volume = getQueryString(route, "listVolume");
      if (name === "" && category === "" && level === "" && maxHeight === "" && volume === "") {
        return null;
      }
      return { name, category, level, maxHeight, volume };
    });

    const detail = ref<LiangcangRadarBindingDetailVO | null>(null);

    const pickDetailOrListStr = (detailVal: string | null | undefined, listVal: string | undefined): string => {
      const t = detailVal?.trim() ?? "";
      if (t !== "") {
        return detailVal as string;
      }
      const f = (listVal ?? "").trim();
      return f !== "" ? f : "--";
    };

    const displayGranaryName = computed((): string => pickDetailOrListStr(detail.value?.granaryName, listWarehouseFallback.value?.name));

    const displayCategory = computed((): string => pickDetailOrListStr(detail.value?.category, listWarehouseFallback.value?.category));

    const displayLevel = computed((): string => pickDetailOrListStr(detail.value?.level, listWarehouseFallback.value?.level));

    const displayMaxHeight = computed((): string => {
      const d = detail.value;
      const fb = listWarehouseFallback.value;
      if (d != null && d.maxHeight != null && Number.isFinite(d.maxHeight)) {
        return formatHeightDisplay(d.maxHeight);
      }
      const f = fb?.maxHeight.trim() ?? "";
      return f !== "" ? fb!.maxHeight : "--";
    });

    const displayVolume = computed((): string => {
      const d = detail.value;
      const fb = listWarehouseFallback.value;
      if (d != null && d.granaryVolume != null && Number.isFinite(d.granaryVolume)) {
        return formatVolumeDisplay(d.granaryVolume);
      }
      const f = fb?.volume.trim() ?? "";
      return f !== "" ? fb!.volume : "--";
    });

    const warehouseIdForUnbind = computed((): number => {
      const d = detail.value?.warehouseId;
      if (d != null && Number.isFinite(d)) {
        return d;
      }
      const idStr = granaryId.value.trim();
      const n = Number(idStr);
      return Number.isFinite(n) ? n : Number.NaN;
    });

    const canShowUnbindBody = computed(
      (): boolean => detail.value != null || (listWarehouseFallback.value != null && hasValidGranaryIdQuery.value),
    );

    const loading = ref(false);
    const loadMessage = ref<string | null>(null);
    const unbindSubmitting = ref(false);
    const deviceTableData = ref<DeviceTableRow[]>([]);
    const deviceTableLoading = ref(false);
    const deviceTotal = ref(0);
    const devicePagination = reactive({
      pageNumber: 1,
      pageSize: 10,
    });

    const mapDeviceRows = (records: LiangcangBoundWarehouseDevicePageItem[]): DeviceTableRow[] =>
      records.map((item, index) => ({
        ...item,
        areaDisplayName: item.areaName ?? item.area?.pathName ?? item.area?.name ?? "",
        rowUid: `${item.deviceId || "device"}:${devicePagination.pageNumber}:${index}`,
      }));

    const loadBoundDevicesPage = async (): Promise<void> => {
      const idStr = granaryId.value.trim();
      const wid = Number(idStr);
      if (!Number.isFinite(wid)) {
        deviceTableData.value = [];
        deviceTotal.value = 0;
        return;
      }
      deviceTableLoading.value = true;
      try {
        const page = await cubeGranaryManagementService.getBoundWarehouseDevicesPage({
          warehouseId: wid,
          pageNumber: devicePagination.pageNumber,
          pageSize: devicePagination.pageSize,
        });
        deviceTotal.value = page.total;
        deviceTableData.value = mapDeviceRows(page.records);
      } catch {
        deviceTableData.value = [];
        deviceTotal.value = 0;
      } finally {
        deviceTableLoading.value = false;
      }
    };

    const loadDetail = async (): Promise<void> => {
      const idStr = granaryId.value.trim();
      if (idStr === "") {
        detail.value = null;
        loadMessage.value = "缺少粮仓参数，请从列表重新进入。";
        return;
      }
      const wid = Number(idStr);
      if (!Number.isFinite(wid)) {
        detail.value = null;
        loadMessage.value = "无效的粮仓 ID";
        return;
      }
      loading.value = true;
      loadMessage.value = null;
      try {
        const res = await cubeGranaryManagementService.getRadarBindingDetail(wid);
        detail.value = res;
        if (res == null) {
          loadMessage.value = hasListWarehouseFallbackQuery(route) ? null : "未获取到详情数据";
        }
      } catch (error) {
        detail.value = null;
        loadMessage.value = getDetailErrorText(error);
      } finally {
        loading.value = false;
      }
    };

    watch(
      granaryId,
      () => {
        devicePagination.pageNumber = 1;
        void loadDetail();
        void loadBoundDevicesPage();
      },
      { immediate: true },
    );

    const handleDeviceTablePageChange = (page: number, pageSize: number): void => {
      devicePagination.pageNumber = page || 1;
      devicePagination.pageSize = pageSize;
      void loadBoundDevicesPage();
    };

    const deviceColumns = [
      {
        title: "设备id",
        dataIndex: "deviceId",
        align: "center" as const,
        ellipsis: true,
      },
      {
        title: "设备名称",
        dataIndex: "deviceName",
        align: "center" as const,
        ellipsis: true,
      },
      {
        title: "设备类型",
        dataIndex: "deviceType",
        align: "center" as const,
        ellipsis: true,
      },
      {
        title: "区域",
        dataIndex: "areaDisplayName",
        align: "center" as const,
        ellipsis: true,
      },
    ];

    const goBackToList = (): void => {
      void router.push({ path: "/main-management" });
    };

    const handleUnbind = async (): Promise<void> => {
      const wid = warehouseIdForUnbind.value;
      if (!Number.isFinite(wid)) {
        return;
      }
      unbindSubmitting.value = true;
      try {
        const ok = await cubeGranaryManagementService.unbindWarehouse({
          warehouseId: wid,
          selectAllDevices: true,
        });
        if (ok) {
          message.success("解绑成功");
          void router.push({ path: "/main-management" });
        } else {
          message.warning("解绑未成功");
        }
      } catch (error) {
        message.error(getDetailErrorText(error));
      } finally {
        unbindSubmitting.value = false;
      }
    };

    const pageTitle = computed((): string => (readonlyPreview.value ? "粮仓查看" : "待解绑信息预览"));

    return (): JSX.Element => (
      <div class="granary-unbind-root">
        <CubeLayout
          title={pageTitle.value}
          showFooter={false}
          v-slots={{
            "layout-content": () => (
              <div class="granary-unbind-preview">
                {loadMessage.value != null && detail.value == null && listWarehouseFallback.value == null && !loading.value ? (
                  <div class="granary-unbind-preview__empty">{loadMessage.value}</div>
                ) : null}
                {loading.value ? <div class="granary-unbind-preview__empty">加载中…</div> : null}
                {!loading.value && canShowUnbindBody.value ? (
                  <div class="granary-unbind-preview__body">
                    <section class="granary-unbind-preview__col">
                      <h3 class="granary-unbind-preview__block-title">
                        <span class="granary-unbind-preview__block-title-bar" />
                        雷达系统信息
                      </h3>
                      <p class="granary-unbind-preview__sub">
                        数据来源 雷达设备ID: {detail.value?.radarDeviceId != null ? String(detail.value.radarDeviceId) : "--"}
                      </p>
                      <div class="granary-unbind-preview__dl">
                        <div class="granary-unbind-preview__row">
                          <span class="granary-unbind-preview__label">仓库名称</span>
                          <span class="granary-unbind-preview__value">{displayGranaryName.value}</span>
                        </div>
                        <div class="granary-unbind-preview__row">
                          <span class="granary-unbind-preview__label">仓库类别</span>
                          <span class="granary-unbind-preview__value">{displayCategory.value}</span>
                        </div>
                        <div class="granary-unbind-preview__row">
                          <span class="granary-unbind-preview__label">仓库等级</span>
                          <span class="granary-unbind-preview__value">{displayLevel.value}</span>
                        </div>
                        <div class="granary-unbind-preview__row">
                          <span class="granary-unbind-preview__label">最大高度</span>
                          <span class="granary-unbind-preview__value">{displayMaxHeight.value}</span>
                        </div>
                        <div class="granary-unbind-preview__row">
                          <span class="granary-unbind-preview__label">仓内容积</span>
                          <span class="granary-unbind-preview__value">{displayVolume.value}</span>
                        </div>
                      </div>
                    </section>
                    <div class="granary-unbind-preview__divider" aria-hidden />
                    <section class="granary-unbind-preview__col granary-unbind-preview__col--right">
                      <h3 class="granary-unbind-preview__block-title">
                        <span class="granary-unbind-preview__block-title-bar" />
                        设备信息
                      </h3>
                      <div class="granary-unbind-preview__table">
                        <Table
                          rowKey="rowUid"
                          columns={deviceColumns}
                          dataSource={deviceTableData.value}
                          loading={deviceTableLoading.value}
                          pagination={false}
                        />
                        <div class="granary-unbind-preview__table-page">
                          <Page
                            current={devicePagination.pageNumber}
                            pageSize={devicePagination.pageSize}
                            total={deviceTotal.value}
                            onPageChange={handleDeviceTablePageChange}
                          />
                        </div>
                      </div>
                    </section>
                  </div>
                ) : null}
                <div class="granary-unbind-preview__footer">
                  <Button onClick={goBackToList}>返回</Button>
                  {!readonlyPreview.value ? (
                    <Button
                      type="primary"
                      loading={unbindSubmitting.value}
                      disabled={unbindSubmitting.value || loading.value || !Number.isFinite(warehouseIdForUnbind.value)}
                      onClick={() => void handleUnbind()}
                    >
                      解除绑定
                    </Button>
                  ) : null}
                </div>
              </div>
            ),
          }}
        />
      </div>
    );
  },
});
