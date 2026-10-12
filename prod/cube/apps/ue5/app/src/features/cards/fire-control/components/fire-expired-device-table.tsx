import dayjs, { type Dayjs } from "dayjs";
import { computed, defineComponent, reactive, ref, watch } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import Modal from "@/features/equipment/modal-table/modal";
import { withPopoverColumns } from "@/features/equipment/modal-table/render-popover-text";
import { expiredPage } from "@/infrastructure/api/device";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";

const DROPDOWN_CLASS = "visual-data-modal-dropdown";
const getPopupContainer = (): HTMLElement => document.body;

const expireStatusMap: Record<string, string> = {
  SPLIT: "待拆解",
  ACCEPT: "待接收",
  EXECUTING: "进行中",
  OVER: "已完成",
  EXPIRE: "已过期",
};

type ExpiredRow = {
  code?: string;
  name?: string;
  genreName?: string;
  usefulLifeYear?: string | number;
  expireStatus?: string;
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

export const FireExpiredDeviceTable = defineComponent({
  name: "FireExpiredDeviceTable",
  props: {
    parameter: { type: null, required: false, default: () => ({}) },
    showModal: { type: Boolean, required: true, default: false },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const ueClient = UeClient.getInstance();
    const { globalState } = useStateStore();
    const { currentTheme } = useVisualTheme();
    const themeClassName = computed(() => `device-records-theme-${currentTheme.value}`);
    const modalWrapClassName = computed(() => `modal-table-alarm modal-table-device equipment-data-list-modal ${themeClassName.value}`);
    const dropdownClassName = computed(() => DROPDOWN_CLASS);

    const loading = ref(false);
    const timeRange = ref<Dayjs[] | undefined>();
    const datainfo = reactive({
      keyword: "",
      pageSize: 10,
      pageNumber: 1,
      total: 0,
      type: "THIS_YEAR",
    });
    const dataSource = ref<ExpiredRow[]>([]);

    const locate = (record: ExpiredRow): void => {
      if (!record?.code) return;
      ueClient.send("focusActor", { id: record.code });
    };

    const columns = withPopoverColumns([
      { title: "设备名称", dataIndex: "name", key: "name", width: 140, ellipsis: true },
      { title: "设备类型", dataIndex: "genreName", key: "genreName", width: 140, ellipsis: true },
      { title: "使用年限", dataIndex: "usefulLifeYear", key: "usefulLifeYear", width: 100 },
      {
        title: "状态",
        dataIndex: "expireStatus",
        key: "expireStatus",
        width: 100,
        customRender: ({ text }: { text: string }) => expireStatusMap[text] || text || "--",
      },
      {
        title: "操作",
        key: "action",
        width: 72,
        align: "center" as const,
        customRender: ({ record }: { record: ExpiredRow }) => (
          <div class="row-actions">
            <a
              onClick={(event: MouseEvent) => {
                event.preventDefault();
                event.stopPropagation();
                locate(record);
              }}
            >
              定位
            </a>
          </div>
        ),
      },
    ]);

    const getData = async (): Promise<void> => {
      loading.value = true;
      try {
        const incoming = (props.parameter || {}) as { period?: string; type?: string };
        const period =
          timeRange.value?.length === 2
            ? `${dayjs(timeRange.value[0]).format("YYYY-MM-DD 00:00:00")},${dayjs(timeRange.value[1]).format("YYYY-MM-DD 23:59:59")}`
            : incoming.period || "";
        const params = {
          sceneType: globalState.business.currentMenu,
          areaId: globalState.business.currentAreaId,
          period,
          type: datainfo.type || incoming.type || "THIS_YEAR",
          keyword: datainfo.keyword,
          pageNumber: datainfo.pageNumber,
          pageSize: datainfo.pageSize,
        };
        const res = await expiredPage(params);
        dataSource.value = Array.isArray(res?.records) ? res.records : [];
        datainfo.total = Number(res?.total) || 0;
      } catch {
        dataSource.value = [];
        datainfo.total = 0;
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
      void getData();
    };

    const closeModal = (): void => {
      Object.assign(datainfo, { keyword: "", pageSize: 10, pageNumber: 1, total: 0, type: "THIS_YEAR" });
      timeRange.value = undefined;
      dataSource.value = [];
      emit("close");
    };

    watch(
      () => props.showModal,
      (visible) => {
        if (!visible) return;
        const incoming = (props.parameter || {}) as { period?: string; type?: string };
        dataSource.value = [];
        datainfo.pageNumber = 1;
        datainfo.keyword = "";
        datainfo.type = incoming.type || "THIS_YEAR";
        timeRange.value = parsePeriod(incoming.period);
        void getData();
      },
    );

    return (): JSX.Element => (
      <Modal title="消防到期设备" width="1250px" show={props.showModal} onClose={closeModal} wrapClassName={modalWrapClassName.value}>
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
                  }}
                  class="filter-keyword filter-control-input"
                  placeholder="请输入设备名称"
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
                rowKey={(row: ExpiredRow) => row.code || row.name || Math.random().toString(36)}
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

export default FireExpiredDeviceTable;
