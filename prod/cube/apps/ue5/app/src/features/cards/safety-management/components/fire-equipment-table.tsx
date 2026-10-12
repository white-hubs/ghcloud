import dayjs from "dayjs";
import { computed, defineComponent, reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { withPopoverColumns } from "@/features/equipment/modal-table/render-popover-text";
import { sourceLedgerPage } from "@/infrastructure/api/property";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";

const DROPDOWN_CLASS = "visual-data-modal-dropdown";
const getPopupContainer = (): HTMLElement => document.body;

type FireRow = {
  id?: string;
  name?: string;
  typeName?: string;
  usageDate?: string;
  status?: string;
};

export const FireEquipmentTable = defineComponent({
  name: "FireEquipmentTable",
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
      status: "EXPIRE" as string | undefined,
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const dataSource = ref<FireRow[]>([]);

    const columns = withPopoverColumns([
      { title: "设备名称", dataIndex: "name", key: "name", ellipsis: true },
      { title: "设备类型", dataIndex: "typeName", key: "typeName", width: 140, ellipsis: true },
      {
        title: "使用年限",
        dataIndex: "usageDate",
        key: "usageDate",
        width: 130,
        customRender: ({ text }: { text: string }) => (text ? dayjs(text).format("YYYY-MM-DD") : "--"),
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: 100,
        customRender: ({ text }: { text: string }) =>
          text === "EXPIRE" || text === "已过期" ? "已过期" : text === "正常" ? "正常" : text || "--",
      },
    ]);

    const getData = async (): Promise<void> => {
      loading.value = true;
      try {
        const params = {
          ...datainfo,
          ...(props.parameter || {}),
          typeCode: "FIRE_FIGHTING_EQUIPMENT",
          status: datainfo.status,
        };
        const res = await sourceLedgerPage(params);
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
      datainfo.status = undefined;
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
      Object.assign(datainfo, { keyword: "", status: undefined, pageSize: 10, pageNumber: 1, total: 0 });
      dataSource.value = [];
      emit("close");
    };

    watch(
      () => props.showModal,
      (visible) => {
        if (visible) {
          dataSource.value = [];
          datainfo.pageNumber = 1;
          const incoming = (props.parameter as { status?: string })?.status;
          datainfo.status = incoming === undefined || incoming === "" ? undefined : incoming;
          void getData();
        }
      },
    );

    return (): JSX.Element => (
      <Modal title="消防设备" width="1250px" show={props.showModal} onClose={closeModal} wrapClassName={modalWrapClassName.value}>
        <div class="device-records-content">
          <form class="filter-toolbar filter-form" onSubmit={handleFilterSubmit}>
            <div class="filter-fields">
              <div class="filter-item filter-item-status">
                <span class="filter-label">状态</span>
                <a-select
                  value={datainfo.status}
                  onUpdate:value={(v: string | undefined) => {
                    datainfo.status = v;
                    datainfo.pageNumber = 1;
                    void getData();
                  }}
                  allowClear
                  class="filter-status filter-control-select"
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
                <span class="filter-label">设备名称</span>
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
                rowKey={(row: FireRow) => row.id || row.name || Math.random().toString(36)}
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

export default FireEquipmentTable;
