import dayjs, { type Dayjs } from "dayjs";
import { computed, defineComponent, reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { withPopoverColumns } from "@/features/equipment/modal-table/render-popover-text";
import { hiddenApplyPersonal } from "@/infrastructure/api/maintain";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";

const DROPDOWN_CLASS = "visual-data-modal-dropdown";
const getPopupContainer = (): HTMLElement => document.body;

type HiddenRow = {
  id?: string;
  instanceName?: string;
  hiddenObjName?: string;
  hiddenType?: string;
  source?: string;
  urgencyLevel?: string;
  submitedTime?: string;
  status?: string;
  activeNodeName?: string;
};

const statusText = (str?: string): string => {
  const statusMap = new Map([
    ["SUBMIT", "提交"],
    ["UNDO", "撤销"],
    ["REPEAT", "重新提交"],
    ["APPROVAL", "审批"],
    ["BACK", "撤回"],
    ["COPY", "抄送"],
    ["REJECT", "驳回"],
    ["FINISHED", "完成"],
    ["ACTIVE", "处理中"],
  ]);
  return statusMap.get(str || "") || (str ? String(str) : "处理中");
};

const parsePeriodToRange = (period?: string): Dayjs[] | undefined => {
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

export const HiddenDangerTable = defineComponent({
  name: "HiddenDangerTable",
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
    const datainfo = reactive({
      keyword: "",
      status: "" as string,
      pageSize: 10,
      pageNumber: 1,
      businessType: "HIDDENDANGER",
      total: 0,
      submitTime: "",
    });
    const dataSource = ref<HiddenRow[]>([]);

    const columns = withPopoverColumns([
      { title: "隐患单名称", dataIndex: "instanceName", key: "instanceName", width: 220, ellipsis: true },
      { title: "隐患对象", dataIndex: "hiddenObjName", key: "hiddenObjName", width: 120, ellipsis: true },
      { title: "隐患类型", dataIndex: "hiddenType", key: "hiddenType", width: 110, ellipsis: true },
      { title: "隐患来源", dataIndex: "source", key: "source", width: 100, ellipsis: true },
      { title: "紧急程度", dataIndex: "urgencyLevel", key: "urgencyLevel", width: 90 },
      {
        title: "发起时间",
        dataIndex: "submitedTime",
        key: "submitedTime",
        width: 120,
        customRender: ({ text }: { text: string }) => (text ? dayjs(text).format("YYYY-MM-DD") : "--"),
      },
      { title: "处理状态", dataIndex: "status", key: "status", width: 90 },
      { title: "处理进度", dataIndex: "activeNodeName", key: "activeNodeName", width: 110, ellipsis: true },
    ]);

    const syncSubmitTime = (): void => {
      if (timeRange.value?.length === 2) {
        datainfo.submitTime = `${dayjs(timeRange.value[0]).format("YYYY-MM-DD 00:00:00")},${dayjs(timeRange.value[1]).format("YYYY-MM-DD 23:59:59")}`;
        return;
      }
      datainfo.submitTime = "";
    };

    const getData = async (): Promise<void> => {
      loading.value = true;
      try {
        syncSubmitTime();
        const parameter = (props.parameter || {}) as Record<string, unknown>;
        const params = {
          ...datainfo,
          ...parameter,
          keyword: datainfo.keyword,
          status: datainfo.status || parameter.status || "",
          submitTime: datainfo.submitTime || parameter.submitTime || "",
          businessType: "HIDDENDANGER",
        };
        const res = await hiddenApplyPersonal(params);
        const records = Array.isArray(res?.records) ? res.records : [];
        dataSource.value = records.map((item: HiddenRow & { status?: string }) => ({
          ...item,
          status: statusText(item.status),
        }));
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
      datainfo.status = "";
      datainfo.pageNumber = 1;
      const incoming = (props.parameter as { submitTime?: string; status?: string }) || {};
      timeRange.value = parsePeriodToRange(incoming.submitTime);
      datainfo.status = incoming.status || "";
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
      Object.assign(datainfo, {
        keyword: "",
        status: "",
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        submitTime: "",
      });
      timeRange.value = undefined;
      dataSource.value = [];
      emit("close");
    };

    watch(
      () => props.showModal,
      (visible) => {
        if (!visible) return;
        dataSource.value = [];
        datainfo.pageNumber = 1;
        datainfo.keyword = "";
        const incoming = (props.parameter as { submitTime?: string; status?: string }) || {};
        datainfo.status = incoming.status || "";
        timeRange.value = parsePeriodToRange(incoming.submitTime);
        void getData();
      },
    );

    return (): JSX.Element => (
      <Modal title="隐患排查" width="1250px" show={props.showModal} onClose={closeModal} wrapClassName={modalWrapClassName.value}>
        <div class="device-records-content">
          <form class="filter-toolbar filter-form" onSubmit={handleFilterSubmit}>
            <div class="filter-fields">
              <div class="filter-item filter-item-status">
                <span class="filter-label">处理状态</span>
                <a-select
                  value={datainfo.status || undefined}
                  onUpdate:value={(v: string | undefined) => {
                    datainfo.status = v || "";
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
                  <a-select-option value="ACTIVE">处理中</a-select-option>
                  <a-select-option value="FINISHED">已完成</a-select-option>
                </a-select>
              </div>
              <div class="filter-item filter-item-time">
                <span class="filter-label">发起时间</span>
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
                  placeholder="请输入隐患单名称/对象"
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
                rowKey={(row: HiddenRow) => row.id || row.instanceName || Math.random().toString(36)}
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

export default HiddenDangerTable;
