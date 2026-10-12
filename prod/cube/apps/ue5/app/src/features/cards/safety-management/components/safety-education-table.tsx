import dayjs from "dayjs";
import { computed, defineComponent, reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { withPopoverColumns } from "@/features/equipment/modal-table/render-popover-text";
import { cultivateTaskPage, examTaskPage } from "@/infrastructure/api/safety-education";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";

const DROPDOWN_CLASS = "visual-data-modal-dropdown";
const getPopupContainer = (): HTMLElement => document.body;
const ALL_SOURCE_PAGE_SIZE = 500;

const TraningStatusOptions = [
  { label: "已发布", value: "PUBLISHED" },
  { label: "待发布", value: "WAIT_PUBLISH" },
  { label: "进行中", value: "TRAINING" },
  { label: "已完成", value: "OVER" },
];

const ExamTaskStatusOptions = [
  { label: "待发布", value: "UNPUBLISHED" },
  { label: "待考试", value: "STAY_EXAM" },
  { label: "进行中", value: "IN_PROGRESS" },
  { label: "已结束", value: "ENDED" },
];

type TaskKind = "全部" | "培训任务" | "考试任务";
type EduRow = Record<string, any>;

type DrillParameter = {
  period?: string;
  themeId?: string;
};

const formatDate = (value?: string): string => (value ? dayjs(value).format("YYYY-MM-DD") : "--");

const mapTrainStatus = (status?: string): string => TraningStatusOptions.find((item) => item.value === status)?.label || status || "--";

const mapExamStatus = (status?: string): string => ExamTaskStatusOptions.find((item) => item.value === status)?.label || status || "--";

const toTrainRow = (item: EduRow): EduRow => ({
  ...item,
  taskKind: "培训任务",
  themeName: item.themeName || "--",
  chargeUserName: item.chargeUserName || "--",
  timeText: formatDate(item.cultivateStartTime || item.cultivateEndTime),
  cultivateTaskStatus: mapTrainStatus(item.cultivateTaskStatus),
  statusText: mapTrainStatus(item.cultivateTaskStatus),
});

const toExamRow = (item: EduRow): EduRow => ({
  ...item,
  taskKind: "考试任务",
  themeName: item.themeName || "--",
  chargeUserName: item.chargeUserName || "--",
  timeText: formatDate(item.examStartTime || item.examEndTime),
  examTaskStatus: mapExamStatus(item.examTaskStatus),
  statusText: mapExamStatus(item.examTaskStatus),
  text: item.text || "--",
});

const rowTimeValue = (row: EduRow): number => {
  const raw = row.cultivateStartTime || row.examStartTime || row.cultivateEndTime || row.examEndTime;
  const time = raw ? dayjs(raw).valueOf() : 0;
  return Number.isFinite(time) ? time : 0;
};

export const SafetyEducationTable = defineComponent({
  name: "SafetyEducationTable",
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
    const dataType = ref<TaskKind>("全部");
    const trainTotal = ref(0);
    const examTotal = ref(0);
    const datainfo = reactive({
      keyword: "",
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const dataSource = ref<EduRow[]>([]);

    const trainColumns = [
      { title: "任务名称", dataIndex: "name", key: "name", width: 220, ellipsis: true },
      { title: "培训主题", dataIndex: "themeName", key: "themeName", width: 140, ellipsis: true },
      {
        title: "培训类型",
        dataIndex: "cultivateTarget",
        key: "cultivateTarget",
        width: 110,
        customRender: ({ text }: { text: string }) => (text === "STAFF" ? "员工培训" : "商户培训"),
      },
      {
        title: "培训形式",
        dataIndex: "cultivateMode",
        key: "cultivateMode",
        width: 100,
        customRender: ({ text }: { text: string }) => (text === "ONLINE" ? "线上培训" : "线下培训"),
      },
      { title: "负责人", dataIndex: "chargeUserName", key: "chargeUserName", width: 100, ellipsis: true },
      {
        title: "截至时间",
        dataIndex: "cultivateEndTime",
        key: "cultivateEndTime",
        width: 120,
        customRender: ({ text }: { text: string }) => formatDate(text),
      },
      { title: "培训地点", dataIndex: "cultivateAddress", key: "cultivateAddress", width: 120, ellipsis: true },
      { title: "状态", dataIndex: "cultivateTaskStatus", key: "cultivateTaskStatus", width: 100 },
    ];

    const examColumns = [
      { title: "任务名称", dataIndex: "name", key: "name", width: 220, ellipsis: true },
      { title: "考试主题", dataIndex: "themeName", key: "themeName", width: 140, ellipsis: true },
      {
        title: "考试类型",
        dataIndex: "examTaskType",
        key: "examTaskType",
        width: 110,
        customRender: ({ text }: { text: string }) => (text === "STAFF_EXAM" ? "员工考核" : "商户考核"),
      },
      { title: "负责人", dataIndex: "chargeUserName", key: "chargeUserName", width: 100, ellipsis: true },
      {
        title: "开始时间",
        dataIndex: "examStartTime",
        key: "examStartTime",
        width: 120,
        customRender: ({ text }: { text: string }) => formatDate(text),
      },
      {
        title: "结束时间",
        dataIndex: "examEndTime",
        key: "examEndTime",
        width: 120,
        customRender: ({ text }: { text: string }) => formatDate(text),
      },
      { title: "试卷", dataIndex: "text", key: "text", width: 120, ellipsis: true },
      { title: "状态", dataIndex: "examTaskStatus", key: "examTaskStatus", width: 100 },
    ];

    const allColumns = [
      { title: "任务名称", dataIndex: "name", key: "name", width: 220, ellipsis: true },
      { title: "任务类型", dataIndex: "taskKind", key: "taskKind", width: 100 },
      { title: "主题", dataIndex: "themeName", key: "themeName", width: 140, ellipsis: true },
      { title: "负责人", dataIndex: "chargeUserName", key: "chargeUserName", width: 110, ellipsis: true },
      { title: "时间", dataIndex: "timeText", key: "timeText", width: 120 },
      { title: "状态", dataIndex: "statusText", key: "statusText", width: 100 },
    ];

    const columns = computed(() => {
      if (dataType.value === "培训任务") return withPopoverColumns(trainColumns);
      if (dataType.value === "考试任务") return withPopoverColumns(examColumns);
      return withPopoverColumns(allColumns);
    });

    const buildQuery = (pageNumber: number, pageSize: number): Record<string, unknown> => {
      const parameter = (props.parameter || {}) as DrillParameter;
      const query: Record<string, unknown> = {
        keyword: datainfo.keyword || undefined,
        pageNumber,
        pageSize,
      };
      const period = String(parameter.period || "").trim();
      if (period && period !== ",") query.period = period;
      const themeId = String(parameter.themeId || "").trim();
      if (themeId && themeId !== "undefined" && themeId !== "null") query.themeId = themeId;
      return query;
    };

    const applyPage = (rows: EduRow[], total: number): void => {
      const start = (datainfo.pageNumber - 1) * datainfo.pageSize;
      dataSource.value = rows.slice(start, start + datainfo.pageSize);
      datainfo.total = total;
    };

    const getData = async (): Promise<void> => {
      loading.value = true;
      try {
        if (dataType.value === "培训任务") {
          const res = await cultivateTaskPage(buildQuery(datainfo.pageNumber, datainfo.pageSize));
          const records = Array.isArray(res?.records) ? res.records : [];
          dataSource.value = records.map(toTrainRow);
          datainfo.total = Number(res?.total) || 0;
          trainTotal.value = datainfo.total;
          return;
        }
        if (dataType.value === "考试任务") {
          const res = await examTaskPage(buildQuery(datainfo.pageNumber, datainfo.pageSize));
          const records = Array.isArray(res?.records) ? res.records : [];
          dataSource.value = records.map(toExamRow);
          datainfo.total = Number(res?.total) || 0;
          examTotal.value = datainfo.total;
          return;
        }

        const query = buildQuery(1, ALL_SOURCE_PAGE_SIZE);
        const [trainRes, examRes] = await Promise.all([cultivateTaskPage(query), examTaskPage(query)]);
        const trainRows = (Array.isArray(trainRes?.records) ? trainRes.records : []).map(toTrainRow);
        const examRows = (Array.isArray(examRes?.records) ? examRes.records : []).map(toExamRow);
        trainTotal.value = Number(trainRes?.total) || trainRows.length;
        examTotal.value = Number(examRes?.total) || examRows.length;
        const merged = [...trainRows, ...examRows].sort((a, b) => rowTimeValue(b) - rowTimeValue(a));
        applyPage(merged, trainTotal.value + examTotal.value);
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
      dataType.value = "全部";
      trainTotal.value = 0;
      examTotal.value = 0;
      dataSource.value = [];
      emit("close");
    };

    watch(
      () => props.showModal,
      (visible) => {
        if (visible) {
          dataSource.value = [];
          datainfo.pageNumber = 1;
          dataType.value = "全部";
          void getData();
        }
      },
    );

    return (): JSX.Element => (
      <Modal title="安全教育" width="1250px" show={props.showModal} onClose={closeModal} wrapClassName={modalWrapClassName.value}>
        <div class="device-records-content">
          <form class="filter-toolbar filter-form" onSubmit={handleFilterSubmit}>
            <div class="filter-fields">
              <div class="filter-item filter-item-status">
                <span class="filter-label">任务类型</span>
                <a-select
                  value={dataType.value}
                  onUpdate:value={(v: TaskKind) => {
                    dataType.value = v;
                    datainfo.pageNumber = 1;
                    void getData();
                  }}
                  class="filter-status filter-control-select"
                  getPopupContainer={getPopupContainer}
                  popupClassName={dropdownClassName.value}
                  dropdownClassName={dropdownClassName.value}
                >
                  <a-select-option value="全部">
                    全部{trainTotal.value + examTotal.value ? ` (${trainTotal.value + examTotal.value})` : ""}
                  </a-select-option>
                  <a-select-option value="培训任务">培训任务{trainTotal.value ? ` (${trainTotal.value})` : ""}</a-select-option>
                  <a-select-option value="考试任务">考试任务{examTotal.value ? ` (${examTotal.value})` : ""}</a-select-option>
                </a-select>
              </div>
              <div class="filter-item filter-item-keyword">
                <span class="filter-label">任务名称</span>
                <a-input
                  value={datainfo.keyword}
                  onUpdate:value={(v: string) => {
                    datainfo.keyword = v;
                  }}
                  class="filter-keyword filter-control-input"
                  placeholder="请输入任务名称"
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
                columns={columns.value}
                dataSource={dataSource.value}
                loading={loading.value}
                pagination={false}
                rowKey={(row: EduRow) => `${row.taskKind || ""}-${row.id || row.name}`}
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

export default SafetyEducationTable;
