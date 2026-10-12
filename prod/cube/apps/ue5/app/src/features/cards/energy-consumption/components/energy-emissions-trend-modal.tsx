import { computed, defineComponent, onBeforeUnmount, reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { withPopoverColumns } from "@/features/equipment/modal-table/render-popover-text";
import { energyDailySummarySummaryPage, energyDailyUsageProjectPage, energyDailyUsageTypePage } from "@/infrastructure/api/energy";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "./energy-data-modal.module.less";

type TabType = "汇总" | "分类" | "分项" | "区域";

const TABLE_SCROLL_Y = 420;
const DROPDOWN_CLASS = "visual-data-modal-dropdown";
const getPopupContainer = (): HTMLElement => document.body;

const TYPE_OPTIONS: { label: string; value: TabType }[] = [
  { label: "汇总", value: "汇总" },
  { label: "分类", value: "分类" },
  { label: "分项", value: "分项" },
  { label: "区域", value: "区域" },
];

export const EnergyEmissionsTrendModal = defineComponent({
  name: "EnergyEmissionsTrendModal",
  props: {
    showModal: { type: Boolean, required: true, default: false },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const { currentTheme } = useVisualTheme();
    const themeClassName = computed(() => `device-records-theme-${currentTheme.value}`);
    const modalWrapClassName = computed(
      () => `modal-table-device equipment-data-list-modal energy-data-list-modal ${themeClassName.value}`,
    );
    const themeDropdownClass = computed(() => `${DROPDOWN_CLASS} ${themeClassName.value}`);

    const energyParams = reactive({
      type: "汇总" as TabType,
      period: [] as string[],
    });
    const total = ref(0);
    const current = ref(1);
    const pageSize = ref(10);
    const dataSource = ref<Record<string, unknown>[]>([]);
    const columns = ref<Record<string, unknown>[]>([]);
    const loading = ref(false);
    let requestSequence = 0;

    const closeModal = (): void => {
      emit("close");
    };

    const buildColumns = (type: TabType): Record<string, unknown>[] => {
      if (type === "汇总") {
        return [
          { title: "日期", align: "center", dataIndex: "time" },
          { title: "碳排量 tCO2e", align: "center", dataIndex: "value" },
        ];
      }
      if (type === "分类") {
        return [
          { title: "日期", align: "center", dataIndex: "time" },
          { title: "分类", align: "center", dataIndex: "name" },
          { title: "碳排量 tCO2e", align: "center", dataIndex: "value" },
        ];
      }
      if (type === "分项") {
        return [
          { title: "日期", align: "center", dataIndex: "time" },
          { title: "分类", align: "center", dataIndex: "instrumentTypeName" },
          { title: "分项", align: "center", dataIndex: "name" },
          { title: "碳排量 tCO2e", align: "center", dataIndex: "value" },
        ];
      }
      return [
        { title: "日期", align: "center", dataIndex: "time" },
        { title: "分类", align: "center", dataIndex: "instrumentTypeName" },
        { title: "区域", align: "center", dataIndex: "name" },
        { title: "碳排量 tCO2e", align: "center", dataIndex: "value" },
      ];
    };

    const fetchData = async (resetPage = false): Promise<void> => {
      if (resetPage) {
        current.value = 1;
      }
      requestSequence += 1;
      const seq = requestSequence;
      loading.value = true;
      columns.value = withPopoverColumns(buildColumns(energyParams.type));
      const params = {
        pageSize: pageSize.value,
        pageNumber: current.value,
        period: energyParams.period?.length ? energyParams.period.join(",") : "",
      };

      try {
        if (energyParams.type === "汇总") {
          const res = await energyDailySummarySummaryPage(params);
          if (seq !== requestSequence) {
            return;
          }
          total.value = res.total;
          dataSource.value = (res.records ?? []).map((item: { dateStr: string; dcValue: number }) => ({
            time: item.dateStr,
            value: item.dcValue,
          }));
          return;
        }
        if (energyParams.type === "分类") {
          const res = await energyDailyUsageTypePage(params);
          if (seq !== requestSequence) {
            return;
          }
          total.value = res.total;
          dataSource.value = (res.records ?? []).map((item: { time: string; dcValue: number; instrumentTypeName: string }) => ({
            time: item.time,
            value: item.dcValue,
            name: item.instrumentTypeName,
          }));
          return;
        }
        if (energyParams.type === "分项") {
          const res = await energyDailyUsageProjectPage({ ...params, projectCategory: "ITEM" });
          if (seq !== requestSequence) {
            return;
          }
          total.value = res.total;
          dataSource.value = (res.records ?? []).map(
            (item: { time: string; dcValue: number; instrumentTypeName: string; projectName: string }) => ({
              time: item.time,
              value: item.dcValue,
              instrumentTypeName: item.instrumentTypeName,
              name: item.projectName,
            }),
          );
          return;
        }
        const res = await energyDailyUsageProjectPage({ ...params, projectCategory: "AREA" });
        if (seq !== requestSequence) {
          return;
        }
        total.value = res.total ?? 0;
        dataSource.value = (res.records ?? []).map(
          (item: { time: string; dcValue: number; instrumentTypeName: string; projectName: string }) => ({
            time: item.time,
            value: item.dcValue,
            instrumentTypeName: item.instrumentTypeName,
            name: item.projectName,
          }),
        );
      } catch {
        if (seq !== requestSequence) {
          return;
        }
        total.value = 0;
        dataSource.value = [];
      } finally {
        if (seq === requestSequence) {
          loading.value = false;
        }
      }
    };

    const onShowSizeChange = (page: number, size: number): void => {
      current.value = page;
      pageSize.value = size;
      void fetchData(false);
    };

    const resetFilters = (): void => {
      energyParams.type = "汇总";
      energyParams.period = [];
      pageSize.value = 10;
      void fetchData(true);
    };

    watch(
      () => props.showModal,
      (open) => {
        if (open) {
          void fetchData(true);
        } else {
          requestSequence += 1;
          loading.value = false;
        }
      },
    );

    onBeforeUnmount(() => {
      requestSequence += 1;
    });

    return (): JSX.Element => (
      <Modal title="碳排量" show={props.showModal} onClose={closeModal} wrapClassName={modalWrapClassName.value} destroyOnClose>
        <div class="device-records-content">
          <div class="filter-toolbar">
            <div class="filter-fields">
              <div class="filter-item filter-item-type">
                <span class="filter-label">维度</span>
                <a-select
                  value={energyParams.type}
                  onUpdate:value={(value: TabType) => {
                    energyParams.type = value;
                    void fetchData(true);
                  }}
                  class="filter-control-select"
                  getPopupContainer={getPopupContainer}
                  popupClassName={themeDropdownClass.value}
                  dropdownClassName={themeDropdownClass.value}
                >
                  {TYPE_OPTIONS.map((item) => (
                    <a-select-option key={item.value} value={item.value}>
                      {item.label}
                    </a-select-option>
                  ))}
                </a-select>
              </div>
              <div class="filter-item filter-item-period">
                <span class="filter-label">日期</span>
                <a-range-picker
                  value={energyParams.period}
                  onUpdate:value={(value: string[]) => {
                    energyParams.period = value || [];
                  }}
                  value-format="YYYY-MM-DD"
                  format="YYYY-MM-DD"
                  allowClear
                  placeholder={["开始日期", "结束日期"]}
                  class="filter-control-picker"
                  getPopupContainer={getPopupContainer}
                  popupClassName={themeDropdownClass.value}
                  dropdownClassName={themeDropdownClass.value}
                />
              </div>
              <div class="filter-item filter-item-actions">
                <div class="filter-actions">
                  <a-button
                    type="primary"
                    size="small"
                    loading={loading.value}
                    onClick={() => {
                      void fetchData(true);
                    }}
                  >
                    查询
                  </a-button>
                  <a-button size="small" class="reset-btn" onClick={resetFilters}>
                    重置
                  </a-button>
                </div>
              </div>
            </div>
          </div>
          <div class="table-panel">
            <div class="table-wrapper">
              <a-table
                class="device-records-table"
                rowKey={(record: Record<string, unknown>, index: number) => `${String(record.time ?? "")}-${index}`}
                loading={loading.value}
                scroll={{ y: TABLE_SCROLL_Y }}
                dataSource={dataSource.value}
                columns={columns.value}
                pagination={false}
                locale={{ emptyText: <NoData /> }}
              />
            </div>
            <a-pagination
              class="table-pagination"
              current={current.value}
              onUpdate:current={(v: number) => {
                current.value = v;
              }}
              pageSize={pageSize.value}
              onUpdate:pageSize={(v: number) => {
                pageSize.value = v;
              }}
              showSizeChanger
              show-total={(count: number) => `总数 ${count}`}
              onChange={onShowSizeChange}
              total={total.value}
              selectProps={{
                getPopupContainer,
                popupClassName: themeDropdownClass.value,
                dropdownClassName: themeDropdownClass.value,
              }}
            />
          </div>
        </div>
      </Modal>
    );
  },
});

export default EnergyEmissionsTrendModal;
