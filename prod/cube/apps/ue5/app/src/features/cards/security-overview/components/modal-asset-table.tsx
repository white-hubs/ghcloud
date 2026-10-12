import { computed, defineComponent, reactive, ref, watch } from "vue";

import RiskDetailPanel from "@/features/equipment/equipmentdetails/risk-model/risk-model";
import Modal from "@/features/equipment/modal-table/modal";
import { withPopoverColumns } from "@/features/equipment/modal-table/render-popover-text";
import { getCascadeDictionaryItem } from "@/infrastructure/api/dictionary";
import { sourceLedgerPage } from "@/infrastructure/api/property";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";

import styles from "./modal-asset-table.module.less";

const DROPDOWN_CLASS = "visual-data-modal-dropdown";
const getPopupContainer = (): HTMLElement => document.body;

type RiskRow = {
  id?: string;
  name?: string;
  serialNumber?: string;
  typeName?: string;
  areaName?: string;
  number?: number | string;
  status?: string;
};

type RiskTypeOption = {
  label: string;
  value: string;
};

type RiskTypeNode = {
  name?: string;
  code?: string;
  nextList?: RiskTypeNode[];
};

const flattenRiskTypes = (nodes: RiskTypeNode[] = [], prefix = ""): RiskTypeOption[] => {
  const options: RiskTypeOption[] = [];
  nodes.forEach((node) => {
    if (!node.code) return;
    const label = prefix ? `${prefix}/${node.name ?? ""}` : (node.name ?? node.code);
    options.push({ label, value: node.code });
    if (node.nextList?.length) {
      options.push(...flattenRiskTypes(node.nextList, label));
    }
  });
  return options;
};

export const ModalAssetTable = defineComponent({
  name: "ModalAssetTable",
  props: {
    parameter: { type: null, required: false, default: () => ({}) },
    showModal: { type: Boolean, required: true, default: false },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const { currentTheme } = useVisualTheme();
    const modalWrapClassName = computed(
      () =>
        `modal-table-alarm modal-table-device equipment-data-list-modal risk-source-list-modal device-records-theme-${currentTheme.value}`,
    );
    const dropdownClassName = computed(() => DROPDOWN_CLASS);

    const loading = ref(false);
    const riskId = ref("");
    const riskShow = ref(false);
    const riskTypeOptions = ref<RiskTypeOption[]>([]);

    const resolveStatus = (status?: string): { label: string; tone: "expire" | "normal" | "default" } => {
      const raw = String(status ?? "").trim();
      const normalized = raw.toUpperCase();
      if (raw === "已过期" || normalized === "EXPIRE") {
        return { label: "已过期", tone: "expire" };
      }
      if (raw === "正常" || normalized === "NOT_EXPIRED" || normalized === "NORMAL") {
        return { label: "正常", tone: "normal" };
      }
      return { label: raw || "--", tone: "default" };
    };

    const renderStatusCell = (status?: string): JSX.Element => {
      const { label, tone } = resolveStatus(status);
      if (tone === "expire") {
        return <span class={[styles.statusTag, styles.isExpire]}>{label}</span>;
      }
      if (tone === "normal") {
        return <span class={[styles.statusTag, styles.isNormal]}>{label}</span>;
      }
      return <span>{label}</span>;
    };

    const datainfo = reactive({
      keyword: "",
      typeCode: undefined as string | undefined,
      status: undefined as string | undefined,
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const dataSource = ref<RiskRow[]>([]);

    const columns = withPopoverColumns([
      { title: "风险源名称", dataIndex: "name", key: "name", width: 130, ellipsis: true },
      { title: "风险源编码", dataIndex: "serialNumber", key: "serialNumber", width: 120, ellipsis: true },
      { title: "风险源分类", dataIndex: "typeName", key: "typeName", width: 110, ellipsis: true },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: 72,
        align: "center" as const,
        customRender: ({ text }: { text?: string }) => renderStatusCell(text),
      },
      { title: "所在区域", dataIndex: "areaName", key: "areaName", width: 110, ellipsis: true },
      { title: "数量", dataIndex: "number", key: "number", width: 56, align: "center" as const },
      {
        title: "操作",
        key: "action",
        width: 72,
        align: "center" as const,
        customRender: ({ record }: { record: RiskRow }) => (
          <div class="row-actions">
            <a
              onClick={(event: MouseEvent) => {
                event.preventDefault();
                event.stopPropagation();
                openRiskModal(record);
              }}
            >
              详情
            </a>
          </div>
        ),
      },
    ]);

    const loadRiskTypes = async (): Promise<void> => {
      if (riskTypeOptions.value.length) return;
      try {
        const res = await getCascadeDictionaryItem("risk-source-type");
        riskTypeOptions.value = flattenRiskTypes(Array.isArray(res) ? res : []);
      } catch {
        riskTypeOptions.value = [];
      }
    };

    const applyParameter = (): void => {
      const parameter = (props.parameter ?? {}) as { typeCode?: string; status?: string };
      datainfo.typeCode = parameter.typeCode || undefined;
      datainfo.status = parameter.status || undefined;
      datainfo.keyword = "";
      datainfo.pageNumber = 1;
    };

    const getData = async (): Promise<void> => {
      loading.value = true;
      try {
        const res = await sourceLedgerPage({
          pageNumber: datainfo.pageNumber,
          pageSize: datainfo.pageSize,
          keyword: datainfo.keyword || undefined,
          typeCode: datainfo.typeCode || undefined,
          status: datainfo.status || undefined,
        });
        dataSource.value = Array.isArray(res?.records) ? res.records : [];
        datainfo.total = Number(res?.total) || 0;
      } catch {
        dataSource.value = [];
        datainfo.total = 0;
      } finally {
        loading.value = false;
      }
    };

    const onShowSizeChange = (current: number, size: number): void => {
      datainfo.pageNumber = current;
      datainfo.pageSize = size;
      void getData();
    };

    const openRiskModal = (value: RiskRow): void => {
      if (!value.id) return;
      riskId.value = value.id;
      riskShow.value = true;
    };

    const handleFilterSubmit = (event?: Event): void => {
      event?.preventDefault();
      datainfo.pageNumber = 1;
      void getData();
    };

    const reset = (): void => {
      datainfo.keyword = "";
      datainfo.typeCode = undefined;
      datainfo.status = undefined;
      datainfo.pageNumber = 1;
      void getData();
    };

    const closeModal = (): void => {
      Object.assign(datainfo, {
        keyword: "",
        typeCode: undefined,
        status: undefined,
        pageSize: 10,
        pageNumber: 1,
        total: 0,
      });
      dataSource.value = [];
      emit("close");
    };

    watch(
      () => props.showModal,
      (visible) => {
        if (visible) {
          applyParameter();
          void loadRiskTypes();
          void getData();
        }
      },
      { immediate: true },
    );

    watch(
      () => props.parameter,
      () => {
        if (props.showModal) {
          applyParameter();
          void getData();
        }
      },
      { deep: true },
    );

    return (): JSX.Element => (
      <>
        {!riskShow.value && (
          <Modal title="风险源列表" width="1250px" show={props.showModal} onClose={closeModal} wrapClassName={modalWrapClassName.value}>
            <div class="device-records-content">
              <form class="filter-toolbar filter-form" onSubmit={handleFilterSubmit}>
                <div class="filter-fields">
                  <div class="filter-item filter-item-type">
                    <span class="filter-label">风险源分类</span>
                    <a-select
                      value={datainfo.typeCode}
                      onUpdate:value={(v: string | undefined) => {
                        datainfo.typeCode = v;
                      }}
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      class="filter-control-select"
                      placeholder="请选择风险源分类"
                      getPopupContainer={getPopupContainer}
                      popupClassName={dropdownClassName.value}
                      dropdownClassName={dropdownClassName.value}
                    >
                      {riskTypeOptions.value.map((item) => (
                        <a-select-option key={item.value} value={item.value} label={item.label}>
                          {item.label}
                        </a-select-option>
                      ))}
                    </a-select>
                  </div>
                  <div class="filter-item filter-item-status">
                    <span class="filter-label">状态</span>
                    <a-select
                      value={datainfo.status}
                      onUpdate:value={(v: string | undefined) => {
                        datainfo.status = v;
                      }}
                      allowClear
                      class="filter-control-select"
                      placeholder="请选择状态"
                      getPopupContainer={getPopupContainer}
                      popupClassName={dropdownClassName.value}
                      dropdownClassName={dropdownClassName.value}
                    >
                      <a-select-option value="EXPIRE">已过期</a-select-option>
                      <a-select-option value="NOT_EXPIRED">正常</a-select-option>
                    </a-select>
                  </div>
                  <div class="filter-item filter-item-keyword">
                    <span class="filter-label">关键字</span>
                    <a-input
                      value={datainfo.keyword}
                      onUpdate:value={(v: string) => {
                        datainfo.keyword = v;
                      }}
                      class="filter-keyword filter-control-input"
                      placeholder="编码、名称"
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
                    rowKey={(row: RiskRow) => row.id || row.serialNumber || row.name || Math.random().toString(36)}
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
        )}
        <Teleport to="body">
          {riskShow.value && (
            <RiskDetailPanel
              id={riskId.value}
              onClose={() => {
                riskShow.value = false;
              }}
            />
          )}
        </Teleport>
      </>
    );
  },
});

export default ModalAssetTable;
