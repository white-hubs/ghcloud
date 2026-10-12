import dayjs from "dayjs";
import { computed, defineComponent, reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { withPopoverColumns } from "@/features/equipment/modal-table/render-popover-text";
import { projectScheduleList } from "@/infrastructure/api/maintain";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";

const DROPDOWN_CLASS = "visual-data-modal-dropdown";
const getPopupContainer = (): HTMLElement => document.body;

type ProjectRow = {
  projectNum?: string;
  projectName?: string;
  partyB?: string;
  completionTime?: string;
  broadcastTime?: string;
  depName?: string;
  superviseUserName?: string;
  status?: string;
  schedule?: string;
};

const toText = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "--";
  return String(value);
};

export const SmallEngineeringTable = defineComponent({
  name: "SmallEngineeringTable",
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
    const datainfo = reactive({
      keyword: "",
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const dataSource = ref<ProjectRow[]>([]);

    const columns = withPopoverColumns([
      { title: "工程编号", dataIndex: "projectNum", key: "projectNum", width: 120, ellipsis: true },
      { title: "工程名称", dataIndex: "projectName", key: "projectName", ellipsis: true },
      { title: "乙方", dataIndex: "partyB", key: "partyB", width: 120, ellipsis: true },
      {
        title: "完成时限",
        dataIndex: "completionTime",
        key: "completionTime",
        width: 120,
        customRender: ({ record }: { record: ProjectRow }) =>
          record.completionTime || record.broadcastTime ? dayjs(record.completionTime || record.broadcastTime).format("YYYY-MM-DD") : "--",
      },
      { title: "监管部门", dataIndex: "depName", key: "depName", width: 120, ellipsis: true },
      { title: "监管负责人", dataIndex: "superviseUserName", key: "superviseUserName", width: 110, ellipsis: true },
      {
        title: "工程状态",
        dataIndex: "status",
        key: "status",
        width: 100,
        customRender: ({ text }: { text: string }) => toText(text),
      },
      {
        title: "进度情况",
        dataIndex: "schedule",
        key: "schedule",
        width: 100,
        customRender: ({ text }: { text: string }) => toText(text),
      },
    ]);

    const getData = async (): Promise<void> => {
      loading.value = true;
      try {
        const res = await projectScheduleList({ ...datainfo, ...(props.parameter || {}) });
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
      datainfo.keyword = "";
      datainfo.pageNumber = 1;
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
      Object.assign(datainfo, { keyword: "", pageSize: 10, pageNumber: 1, total: 0 });
      dataSource.value = [];
      emit("close");
    };

    watch(
      () => props.showModal,
      (visible) => {
        if (visible) {
          dataSource.value = [];
          datainfo.pageNumber = 1;
          void getData();
        }
      },
    );

    return (): JSX.Element => (
      <Modal title="小散工程" width="1250px" show={props.showModal} onClose={closeModal} wrapClassName={modalWrapClassName.value}>
        <div class="device-records-content">
          <form class="filter-toolbar filter-form" onSubmit={handleFilterSubmit}>
            <div class="filter-fields">
              <div class="filter-item filter-item-keyword">
                <span class="filter-label">工程名称</span>
                <a-input
                  value={datainfo.keyword}
                  onUpdate:value={(v: string) => {
                    datainfo.keyword = v;
                  }}
                  class="filter-keyword filter-control-input"
                  placeholder="请输入工程名称/编号"
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
                rowKey={(row: ProjectRow) => row.projectNum || row.projectName || Math.random().toString(36)}
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

export default SmallEngineeringTable;
