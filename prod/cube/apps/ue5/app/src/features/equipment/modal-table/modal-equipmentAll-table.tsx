import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, Teleport, watch } from "vue";

import type { ProductIotCategoryTree } from "@ghcloud/cube-iot-center-service";

import Modal from "./modal";
import Equ from "@/features/equipment/equipmentdetails/index";
import { getPopupContainer, POPOVER_CLASS, renderPopoverText } from "@/features/equipment/modal-table/render-popover-text";
import { beginPanelZoomNestedHandoff, endPanelZoomNestedHandoff } from "@/features/panel-shell/charts/panel-zoom-session";
import { cubeDeviceCenterService } from "@/infrastructure/api/service";
import { debounce } from "@/infrastructure/utils/common";
import { buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./modal-equipmentAll-table.module.less";

const DROPDOWN_CLASS = "visual-data-modal-dropdown";

interface DeviceRecord {
  code: string;
  name: string;
  productName: string;
  departmentName?: string;
  areaName: string;
  deviceId: string;
  onlineState: boolean;
}

const normalizeDeviceState = (...values: unknown[]): boolean | undefined => {
  for (const value of values) {
    if (typeof value === "boolean") {
      return value;
    }
    if (value === 1 || value === "1") {
      return true;
    }
    if (value === 0 || value === "0") {
      return false;
    }
    if (typeof value === "string") {
      const normalizedValue = value.trim().toUpperCase();
      if (["ONLINE", "NORMAL", "TRUE", "在线", "正常"].includes(normalizedValue)) {
        return true;
      }
      if (["OFFLINE", "FALSE", "离线"].includes(normalizedValue)) {
        return false;
      }
    }
  }
  return undefined;
};

export const ModalEquipmentAllTable = defineComponent({
  name: "ModalEquipmentAllTable",
  props: {
    parameter: { type: null, required: false, default: {} },
    showModal: { type: Boolean, required: true, default: false },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const { globalState } = useStateStore();
    const { currentTheme } = useVisualTheme();
    const themeClassName = computed(() => `device-records-theme-${currentTheme.value}`);
    const modalWrapClassName = computed(() => `modal-table-alarm modal-table-device equipment-data-list-modal ${themeClassName.value}`);
    const dropdownClassName = computed(() => `${DROPDOWN_CLASS} ${themeClassName.value}`);

    const loading = ref(false);
    const productCategoryOptions = ref<ProductIotCategoryTree[]>([]);

    const getExternalDeviceState = (): boolean | undefined =>
      normalizeDeviceState(props.parameter?.deviceState, props.parameter?.onlineState, props.parameter?.status);

    const getExternalRequestParameter = (): Record<string, unknown> => {
      const externalParameter = { ...(props.parameter || {}) } as Record<string, unknown>;
      delete externalParameter.deviceState;
      delete externalParameter.onlineState;
      delete externalParameter.status;
      return externalParameter;
    };

    const datainfo = reactive({
      keyword: "",
      productCategoryPath: [] as string[],
      deviceState: getExternalDeviceState() as boolean | undefined,
      pageSize: 10,
      pageNumber: 1,
      total: 0,
      sceneType: globalState.business.currentMenu,
      areaId: globalState.business.currentAreaId,
      deviceSort: {
        sortField: "ONLINE_STATUS",
        sort: "DESC",
      },
    });

    const dataSource = ref<DeviceRecord[]>([]);
    const equid = ref("");
    const show = ref(false);
    let requestSequence = 0;
    let detailHandoffHeld = false;

    const detail = (item: DeviceRecord): void => {
      equid.value = item.deviceId;
      if (!detailHandoffHeld) {
        beginPanelZoomNestedHandoff();
        detailHandoffHeld = true;
      }
      show.value = true;
    };

    const closeEquDetail = (): void => {
      show.value = false;
      if (!detailHandoffHeld) return;
      detailHandoffHeld = false;
      endPanelZoomNestedHandoff();
    };

    /** 设备列表「定位」：打开左侧设备信息面板（模型定位在面板内操作） */
    const position = (item: DeviceRecord): void => {
      closeModal();

      globalState.panel.visible = true;
      globalState.panel.rightPanelName = "";
      globalState.panel.leftPanelName = "deviceDetailsPanel";
      globalState.panel.universalPanelVo.left = null;
      globalState.panel.universalPanelVo.right = null;
      globalState.business.panelCurrentDeviceId = item.deviceId;
    };

    const columns = [
      {
        title: "设备编码",
        dataIndex: "code",
        key: "code",
        ellipsis: true,
        width: 140,
        align: "center" as const,
        customRender: ({ text }: { text?: string }) => renderPopoverText(text),
      },
      {
        title: "设备名称",
        dataIndex: "name",
        key: "name",
        ellipsis: true,
        width: 160,
        align: "center" as const,
        customRender: ({ text }: { text?: string }) => renderPopoverText(text),
      },
      {
        title: "产品品类",
        dataIndex: "productName",
        key: "productName",
        ellipsis: true,
        width: 120,
        align: "center" as const,
        customRender: ({ text }: { text?: string }) => renderPopoverText(text),
      },
      {
        title: "所属区域",
        dataIndex: "areaName",
        key: "areaName",
        ellipsis: true,
        width: 120,
        align: "center" as const,
        customRender: ({ text }: { text?: string }) => renderPopoverText(text),
      },
      {
        title: "状态",
        dataIndex: "onlineState",
        key: "onlineState",
        width: 72,
        align: "center" as const,
        customRender: ({ record }: { record: DeviceRecord }) => {
          const online = Boolean(record.onlineState);
          const statusText = online ? "在线" : "离线";
          return (
            <a-popover content={statusText} placement="top" overlayClassName={POPOVER_CLASS} getPopupContainer={getPopupContainer}>
              <span class={["device-status", online ? "online" : "offline"]}>
                <span class="status-dot" />
                <span class="device-record-cell-text">{statusText}</span>
              </span>
            </a-popover>
          );
        },
      },
      {
        title: "操作",
        key: "action",
        width: 100,
        align: "center" as const,
        customRender: ({ record }: { record: DeviceRecord }) => (
          <div class="row-actions">
            <a
              onClick={(e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                detail(record);
              }}
            >
              详情
            </a>
            <a
              onClick={(e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                position(record);
              }}
            >
              定位
            </a>
          </div>
        ),
      },
    ];

    const filterProductCategory = (inputValue: string, path: Array<{ categoryName?: string }>): boolean =>
      path.some((option) => option.categoryName?.toLowerCase().includes(inputValue.trim().toLowerCase()));

    const getProductCategoryOptions = async (): Promise<void> => {
      try {
        productCategoryOptions.value = await cubeDeviceCenterService.getIotProductCategoryTree();
      } catch {
        productCategoryOptions.value = [];
      }
    };

    const onShowSizeChange = (current: number, size: number): void => {
      datainfo.pageNumber = current;
      datainfo.pageSize = size;
      void getData();
    };

    const resolveVisualTagCodes = (): string[] | undefined => {
      const externalParameter = getExternalRequestParameter();
      const tagCodes = externalParameter.tagCodes;
      if (Array.isArray(tagCodes) && tagCodes.length > 0) {
        return tagCodes.map(String);
      }
      if (externalParameter.applicationCode || externalParameter.filterTagCodes) {
        return undefined;
      }
      return buildVisualMenuTagCodes(globalState.business.currentMenu);
    };

    const getData = async (): Promise<void> => {
      const currentRequest = ++requestSequence;
      try {
        loading.value = true;
        const categoryCode = datainfo.productCategoryPath[datainfo.productCategoryPath.length - 1];
        const tagCodes = resolveVisualTagCodes();
        const payload = {
          ...getExternalRequestParameter(),
          keyword: datainfo.keyword || undefined,
          pageSize: datainfo.pageSize,
          pageNumber: datainfo.pageNumber,
          sceneType: datainfo.sceneType,
          areaId: datainfo.areaId,
          deviceSort: datainfo.deviceSort as any,
          ...(categoryCode ? { categoryCode } : {}),
          ...(typeof datainfo.deviceState === "boolean" ? { deviceState: datainfo.deviceState } : {}),
          ...(tagCodes ? { tagCodes } : {}),
        };
        const data = await cubeDeviceCenterService.getDeviceInstancePageAll(payload as any);
        if (currentRequest !== requestSequence) return;
        dataSource.value = data.records.map((d: any) => ({
          code: d.code ?? "",
          name: d.name ?? "",
          productName: d.productInfo?.productCategory?.name ?? "",
          departmentName: d.department?.name,
          areaName: d.area?.pathName ?? "",
          deviceId: d.id ?? "",
          onlineState: Boolean(d.status?.onlineState),
        }));
        datainfo.total = data.total;
      } catch {
        // ignore
      } finally {
        if (currentRequest === requestSequence) {
          loading.value = false;
        }
      }
    };

    const query = (): void => {
      datainfo.pageNumber = 1;
      void getData();
    };

    const debouncedQuery = debounce(query, 300);

    const queryImmediately = (): void => {
      debouncedQuery.cancel();
      query();
    };

    const handleFilterSubmit = (event: Event): void => {
      event.preventDefault();
      queryImmediately();
    };

    const resetFilterState = (): void => {
      const externalParameter = getExternalRequestParameter();
      Object.assign(datainfo, {
        ...externalParameter,
        tagCodes: resolveVisualTagCodes(),
        keyword: "",
        productCategoryPath: [],
        deviceState: getExternalDeviceState(),
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        sceneType: globalState.business.currentMenu,
        areaId: externalParameter.areaId ?? externalParameter.anyAreaId ?? globalState.business.currentAreaId,
        deviceSort: {
          sortField: "ONLINE_STATUS",
          sort: "DESC",
        },
      });
    };

    const reset = (): void => {
      debouncedQuery.cancel();
      resetFilterState();
      void getData();
    };

    const closeModal = (): void => {
      debouncedQuery.cancel();
      emit("close");
    };

    watch(
      () => props.showModal,
      () => {
        if (props.showModal) {
          resetFilterState();
          void getData();
        } else {
          debouncedQuery.cancel();
          if (detailHandoffHeld) {
            show.value = false;
            detailHandoffHeld = false;
            endPanelZoomNestedHandoff();
          }
        }
      },
    );

    onMounted(() => {
      resetFilterState();
      void getProductCategoryOptions();
      void getData();
    });

    onBeforeUnmount(() => {
      debouncedQuery.cancel();
      if (detailHandoffHeld) {
        detailHandoffHeld = false;
        endPanelZoomNestedHandoff();
      }
    });

    return () => (
      <>
        <Teleport to="body">
          <Modal
            title="设备列表"
            width="1250px"
            show={props.showModal && !show.value}
            onClose={closeModal}
            wrapClassName={modalWrapClassName.value}
          >
            <div class="device-records-content">
              <form class="filter-toolbar filter-form" onSubmit={handleFilterSubmit}>
                <div class="filter-fields">
                  <div class="filter-item filter-item-category">
                    <span class="filter-label">产品品类</span>
                    <a-cascader
                      value={datainfo.productCategoryPath}
                      onUpdate:value={(v: string[]) => {
                        datainfo.productCategoryPath = v || [];
                        queryImmediately();
                      }}
                      options={productCategoryOptions.value}
                      fieldNames={{ label: "categoryName", value: "categoryCode", children: "children" }}
                      showSearch={{ filter: filterProductCategory }}
                      allowClear
                      changeOnSelect
                      class="filter-category filter-control-cascader"
                      placeholder="请选择产品品类"
                      popupClassName={dropdownClassName.value}
                      getPopupContainer={getPopupContainer}
                    />
                  </div>
                  <div class="filter-item filter-item-status">
                    <span class="filter-label">状态</span>
                    <a-select
                      value={datainfo.deviceState}
                      onUpdate:value={(v: boolean | undefined) => {
                        datainfo.deviceState = v;
                        queryImmediately();
                      }}
                      allowClear
                      class="filter-status filter-control-select"
                      placeholder="请选择状态"
                      getPopupContainer={getPopupContainer}
                      popupClassName={dropdownClassName.value}
                      dropdownClassName={dropdownClassName.value}
                    >
                      <a-select-option value={true}>在线</a-select-option>
                      <a-select-option value={false}>离线</a-select-option>
                    </a-select>
                  </div>
                  <div class="filter-item filter-item-keyword">
                    <span class="filter-label">设备名称</span>
                    <a-input
                      value={datainfo.keyword}
                      onUpdate:value={(v: string) => {
                        datainfo.keyword = v;
                        debouncedQuery();
                      }}
                      class="filter-keyword filter-control-input"
                      placeholder="请输入设备名称/设备编码"
                      allowClear
                    />
                  </div>
                  <div class="filter-item filter-item-actions">
                    <div class="filter-actions">
                      <a-button type="primary" size="small" html-type="submit" loading={loading.value}>
                        查询
                      </a-button>
                      <a-button size="small" html-type="button" class="reset-btn" onClick={reset}>
                        重置
                      </a-button>
                    </div>
                  </div>
                </div>
              </form>

              <div class="table-panel">
                <div class="table-wrapper">
                  <a-table
                    class="device-records-table"
                    columns={columns}
                    dataSource={dataSource.value}
                    loading={loading.value}
                    pagination={false}
                    rowKey="deviceId"
                    scroll={{ y: 420 }}
                    locale={{ emptyText: <NoData /> }}
                  />
                </div>
                <a-pagination
                  class="table-pagination"
                  current={datainfo.pageNumber}
                  onUpdate:current={(v: number) => {
                    datainfo.pageNumber = v;
                  }}
                  pageSize={datainfo.pageSize}
                  onUpdate:pageSize={(v: number) => {
                    datainfo.pageSize = v;
                  }}
                  showSizeChanger
                  show-total={(total: number) => `总数 ${total}`}
                  onChange={onShowSizeChange}
                  total={datainfo.total}
                  selectProps={{
                    getPopupContainer,
                    popupClassName: dropdownClassName.value,
                    dropdownClassName: dropdownClassName.value,
                  }}
                />
              </div>
            </div>
          </Modal>
          {show.value && (
            <Equ
              id={equid.value}
              onClose={() => {
                closeEquDetail();
              }}
            />
          )}
        </Teleport>
      </>
    );
  },
});

export default ModalEquipmentAllTable;
