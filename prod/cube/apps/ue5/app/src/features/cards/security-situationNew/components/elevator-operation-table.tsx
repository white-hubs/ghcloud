import dayjs, { type Dayjs } from "dayjs";
import { computed, defineComponent, reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { withPopoverColumns } from "@/features/equipment/modal-table/render-popover-text";
import { operationsAnalysisData } from "@/infrastructure/api/securitymanagement";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";

const DROPDOWN_CLASS = "visual-data-modal-dropdown";
const getPopupContainer = (): HTMLElement => document.body;

type OperationRow = {
  timeFlag: string;
  dataValue: number;
};

const parsePeriod = (period?: string): Dayjs[] | undefined => {
  if (!period) return undefined;
  const parts = period
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (parts.length < 2) return undefined;
  const start = dayjs(parts[0]);
  const end = dayjs(parts[1]);
  if (!start.isValid() || !end.isValid()) return undefined;
  return [start, end];
};

export const ElevatorOperationTable = defineComponent({
  name: "ElevatorOperationTable",
  props: {
    parameter: { type: null, required: false, default: () => ({}) },
    showModal: { type: Boolean, required: true, default: false },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const { currentTheme } = useVisualTheme();
    const themeClassName = computed(() => `device-records-theme-${currentTheme.value}`);
    const modalWrapClassName = computed(() => `modal-table-alarm modal-table-device equipment-data-list-modal ${themeClassName.value}`);
    const dropdownClassName = computed(() => DROPDOWN_CLASS);

    const loading = ref(false);
    const timeRange = ref<Dayjs[] | undefined>();
    const allRows = ref<OperationRow[]>([]);
    const datainfo = reactive({
      keyword: "",
      pageSize: 10,
      pageNumber: 1,
      total: 0,
      type: "THIS_YEAR",
    });

    const columns = withPopoverColumns([
      { title: "时段", dataIndex: "timeFlag", key: "timeFlag", ellipsis: true },
      {
        title: "运行次数",
        dataIndex: "dataValue",
        key: "dataValue",
        width: 140,
        customRender: ({ text }: { text: number }) => (Number.isFinite(Number(text)) ? Number(text) : 0),
      },
    ]);

    const filteredRows = computed(() => {
      const keyword = datainfo.keyword.trim();
      if (!keyword) return allRows.value;
      return allRows.value.filter((row) => row.timeFlag.includes(keyword) || String(row.dataValue).includes(keyword));
    });

    const dataSource = computed(() => {
      const filtered = filteredRows.value;
      const start = (datainfo.pageNumber - 1) * datainfo.pageSize;
      return filtered.slice(start, start + datainfo.pageSize);
    });

    const totalCount = computed(() => filteredRows.value.length);

    const getData = async (): Promise<void> => {
      loading.value = true;
      try {
        const incoming = (props.parameter || {}) as { period?: string; type?: string };
        const period =
          timeRange.value?.length === 2
            ? `${dayjs(timeRange.value[0]).format("YYYY-MM-DD 00:00:00")},${dayjs(timeRange.value[1]).format("YYYY-MM-DD 23:59:59")}`
            : incoming.period || "";
        const res = await operationsAnalysisData({
          type: datainfo.type || incoming.type || "THIS_YEAR",
          period,
        });
        const titles = Array.isArray(res?.xtitle) ? res.xtitle : [];
        const rows = Array.isArray(res?.operationsAnalysis) ? res.operationsAnalysis : [];
        allRows.value = titles.map((xItem: string) => {
          const hit = rows.find((item: { timeFlag?: string; dataValue?: number }) => item.timeFlag === xItem);
          return {
            timeFlag: xItem,
            dataValue: Number(hit?.dataValue) || 0,
          };
        });
        if (!allRows.value.length && rows.length) {
          allRows.value = rows.map((item: { timeFlag?: string; dataValue?: number }) => ({
            timeFlag: item.timeFlag || "--",
            dataValue: Number(item.dataValue) || 0,
          }));
        }
      } catch {
        allRows.value = [];
      } finally {
        loading.value = false;
      }
    };

    const reset = (): void => {
      const incoming = (props.parameter || {}) as { period?: string; type?: string };
      datainfo.keyword = "";
      datainfo.pageNumber = 1;
      datainfo.type = incoming.type || "THIS_YEAR";
      timeRange.value = parsePeriod(incoming.period);
      void getData();
    };

    const handleFilterSubmit = (event?: Event): void => {
      event?.preventDefault();
      datainfo.pageNumber = 1;
      void getData();
    };

    const onShowSizeChange = (current: number, size: number): void => {
      datainfo.pageNumber = current;
      datainfo.pageSize = size;
    };

    const closeModal = (): void => {
      Object.assign(datainfo, { keyword: "", pageSize: 10, pageNumber: 1, total: 0, type: "THIS_YEAR" });
      timeRange.value = undefined;
      allRows.value = [];
      emit("close");
    };

    watch(
      () => props.showModal,
      (visible) => {
        if (!visible) return;
        const incoming = (props.parameter || {}) as { period?: string; type?: string };
        allRows.value = [];
        datainfo.pageNumber = 1;
        datainfo.keyword = "";
        datainfo.type = incoming.type || "THIS_YEAR";
        timeRange.value = parsePeriod(incoming.period);
        void getData();
      },
    );

    return (): JSX.Element => (
      <Modal title="电梯运行明细" width="960px" show={props.showModal} onClose={closeModal} wrapClassName={modalWrapClassName.value}>
        <div class="device-records-content">
          <form class="filter-toolbar filter-form" onSubmit={handleFilterSubmit}>
            <div class="filter-fields">
              <div class="filter-item filter-item-time">
                <span class="filter-label">时间</span>
                <a-range-picker
                  class="alarm-time-picker filter-control-picker"
                  value={timeRange.value}
                  onUpdate:value={(v: Dayjs[] | undefined) => {
                    timeRange.value = v;
                  }}
                  format="YYYY-MM-DD"
                  allowClear
                  getPopupContainer={getPopupContainer}
                  popupClassName={dropdownClassName.value}
                  dropdownClassName={dropdownClassName.value}
                />
              </div>
              <div class="filter-item filter-item-keyword">
                <span class="filter-label">关键字</span>
                <a-input
                  value={datainfo.keyword}
                  onUpdate:value={(v: string) => {
                    datainfo.keyword = v;
                    datainfo.pageNumber = 1;
                  }}
                  class="filter-keyword filter-control-input"
                  placeholder="时段/次数"
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
                rowKey={(row: OperationRow) => row.timeFlag}
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
              total={totalCount.value}
              selectProps={{
                getPopupContainer,
                popupClassName: dropdownClassName.value,
                dropdownClassName: dropdownClassName.value,
              }}
            />
          </div>
        </div>
      </Modal>
    );
  },
});

export default ElevatorOperationTable;
