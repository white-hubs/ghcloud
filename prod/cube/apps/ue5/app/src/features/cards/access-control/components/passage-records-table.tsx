import dayjs, { type Dayjs } from "dayjs";
import { computed, defineComponent, reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { withPopoverColumns } from "@/features/equipment/modal-table/render-popover-text";
import { getDoorEventRecord, passedNumByDay } from "@/infrastructure/api/door";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";

const DROPDOWN_CLASS = "visual-data-modal-dropdown";
const getPopupContainer = (): HTMLElement => document.body;

type PassageRow = {
  id?: string;
  eventTime?: string;
  doorName?: string;
  personName?: string;
  eventWay?: string;
  eventName?: string;
  eventResult?: string;
};

const parseDateRange = (date?: string[]): Dayjs[] | undefined => {
  if (!Array.isArray(date) || date.length < 2) return undefined;
  const start = dayjs(date[0]);
  const end = dayjs(date[1]);
  if (!start.isValid() || !end.isValid()) return undefined;
  return [start, end];
};

export const PassageRecordsTable = defineComponent({
  name: "PassageRecordsTable",
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
    const passingPersonnel = ref(0);
    const timeRange = ref<Dayjs[] | undefined>();
    const datainfo = reactive({
      keyword: "",
      eventResult: "" as string,
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const dataSource = ref<PassageRow[]>([]);

    const columns = withPopoverColumns([
      {
        title: "时间",
        dataIndex: "eventTime",
        key: "eventTime",
        width: 168,
        customRender: ({ text }: { text: string }) => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--"),
      },
      { title: "门禁名称", dataIndex: "doorName", key: "doorName", width: 180, ellipsis: true },
      { title: "通行人员", dataIndex: "personName", key: "personName", width: 120, ellipsis: true },
      { title: "通行方式", dataIndex: "eventWay", key: "eventWay", width: 160, ellipsis: true },
      { title: "通行事件", dataIndex: "eventName", key: "eventName", width: 200, ellipsis: true },
      {
        title: "通行结果",
        dataIndex: "eventResult",
        key: "eventResult",
        width: 100,
        customRender: ({ text }: { text: string }) => (text === "DO_PASS" ? "通过" : text === "DO_REFUSE" ? "拒绝" : text || "--"),
      },
    ]);

    const periodText = (): string => {
      if (timeRange.value?.length === 2) {
        return `${dayjs(timeRange.value[0]).format("YYYY-MM-DD 00:00:00")},${dayjs(timeRange.value[1]).format("YYYY-MM-DD 23:59:59")}`;
      }
      return "";
    };

    const getData = async (): Promise<void> => {
      loading.value = true;
      try {
        const period = periodText();
        const params = {
          keyword: datainfo.keyword,
          period,
          pageNumber: datainfo.pageNumber,
          pageSize: datainfo.pageSize,
          eventResult: datainfo.eventResult,
        };
        const [res, passCount] = await Promise.all([
          getDoorEventRecord(params),
          passedNumByDay({ period, keyword: datainfo.keyword, eventResult: datainfo.eventResult }),
        ]);
        dataSource.value = Array.isArray(res?.records) ? res.records : [];
        datainfo.total = Number(res?.total) || 0;
        passingPersonnel.value = Number(passCount) || 0;
      } catch {
        dataSource.value = [];
        datainfo.total = 0;
        passingPersonnel.value = 0;
      } finally {
        loading.value = false;
      }
    };

    const reset = (): void => {
      const incoming = (props.parameter || {}) as { date?: string[]; eventResult?: string };
      datainfo.keyword = "";
      datainfo.eventResult = incoming.eventResult || "";
      datainfo.pageNumber = 1;
      timeRange.value = parseDateRange(incoming.date);
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
      void getData();
    };

    const closeModal = (): void => {
      Object.assign(datainfo, { keyword: "", eventResult: "", pageSize: 10, pageNumber: 1, total: 0 });
      timeRange.value = undefined;
      dataSource.value = [];
      passingPersonnel.value = 0;
      emit("close");
    };

    watch(
      () => props.showModal,
      (visible) => {
        if (!visible) return;
        const incoming = (props.parameter || {}) as { date?: string[]; eventResult?: string };
        dataSource.value = [];
        datainfo.pageNumber = 1;
        datainfo.keyword = "";
        datainfo.eventResult = incoming.eventResult || "";
        timeRange.value = parseDateRange(incoming.date);
        void getData();
      },
    );

    return (): JSX.Element => (
      <Modal title="通行记录" width="1250px" show={props.showModal} onClose={closeModal} wrapClassName={modalWrapClassName.value}>
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
              <div class="filter-item filter-item-status">
                <span class="filter-label">通行结果</span>
                <a-select
                  value={datainfo.eventResult || undefined}
                  onUpdate:value={(v: string | undefined) => {
                    datainfo.eventResult = v || "";
                    datainfo.pageNumber = 1;
                    void getData();
                  }}
                  allowClear
                  class="filter-status filter-control-select"
                  placeholder="请选择"
                  getPopupContainer={getPopupContainer}
                  popupClassName={dropdownClassName.value}
                  dropdownClassName={dropdownClassName.value}
                >
                  <a-select-option value="DO_PASS">通过</a-select-option>
                  <a-select-option value="DO_REFUSE">拒绝</a-select-option>
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
                  placeholder="门禁名称/通行人员"
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
            <div style={{ marginBottom: "8px", color: "var(--visual-muted-color, rgba(217, 231, 255, 0.78))", fontSize: "12px" }}>
              通行人员：{passingPersonnel.value} 名
            </div>
            <div class="table-wrapper">
              <a-table
                class="device-records-table"
                columns={columns}
                dataSource={dataSource.value}
                loading={loading.value}
                pagination={false}
                rowKey={(row: PassageRow) => row.id || `${row.eventTime}-${row.doorName}-${row.personName}` || Math.random().toString(36)}
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
    );
  },
});

export default PassageRecordsTable;
