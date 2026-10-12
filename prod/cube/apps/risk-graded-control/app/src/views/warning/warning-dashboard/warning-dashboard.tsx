import dayjs from "dayjs";
import { defineComponent, reactive, ref } from "vue";

import { pageWarningRecords, patchWarningRecord } from "@ghcloud/cube-services-client/risk-graded-control.client";
import {
  Button,
  DateRangePicker,
  Form,
  FormItem,
  Modal,
  Select,
  SelectOption,
  Space,
  Table,
  Tag,
  Textarea,
  message,
  type FormExpose,
} from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { GPagination } from "@/components/common/pagination";
import { PageShell } from "@/components/page-shell/page-shell";
import { FORM_INPUT_PROPS, LIST_ACTION_LINK_PROPS } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useServerPagedList } from "@/hooks/use-server-paged-list";
import { useTableScroll } from "@/hooks/use-table-scroll";
import type { WarningEventVO } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { mapWarningEventFromApi } from "@/utils/risk-control-mapper";

const WARNING_TYPE_LABEL: Record<string, string> = {
  LEVEL_UPGRADE: "等级升级预警",
  ASSESSMENT_OVERDUE: "评估超期预警",
  INDICATOR_EXCEED: "指标超标预警",
};

const SEVERITY_LABEL: Record<WarningEventVO["severity"], string> = {
  RED: "红色",
  ORANGE: "橙色",
  YELLOW: "黄色",
};

const SEVERITY_COLOR: Record<WarningEventVO["severity"], string> = {
  RED: "red",
  ORANGE: "orange",
  YELLOW: "gold",
};

const STATUS_LABEL = {
  ACTIVE: "待处置",
  DISPOSED: "已处置",
} as const;

const DISPOSE_RESULT_OPTIONS = ["已确认", "需补充管控措施", "误报"] as const;

export const WarningDashboardPage = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const { y } = useTableScroll({ reservedHeight: 300 });
    const records = ref<WarningEventVO[]>([]);
    const loading = ref(false);
    const disposeVisible = ref(false);
    const disposing = ref<WarningEventVO | null>(null);
    const disposeFormRef = ref<FormExpose>();
    const submitting = ref(false);

    const {
      pageNumber,
      pageSize,
      total,
      resetPage,
      onPageChange: bindPageChange,
      scheduleInitialLoad,
      rewindIfEmpty,
    } = useServerPagedList();

    const filters = reactive({
      severity: "" as "" | WarningEventVO["severity"],
      status: "" as "" | "ACTIVE" | "DISPOSED",
      timeRange: undefined as string[] | undefined,
    });

    const disposeForm = reactive({
      disposeDesc: "",
      disposeResult: "已确认",
    });

    const disposeRules = {
      disposeDesc: [
        { required: true, message: "请输入处置说明", trigger: "blur" },
        { max: 500, message: "处置说明不能超过500个字符", trigger: "blur" },
      ],
      disposeResult: [
        { required: true, message: "请选择处置结果", trigger: "change" },
        { max: 50, message: "处置结果不能超过50个字符", trigger: "change" },
      ],
    };

    const loadList = async (): Promise<void> => {
      loading.value = true;
      try {
        const [start, end] = filters.timeRange ?? [];
        const page = await useAuthRequest(() =>
          pageWarningRecords({
            pageNumber: pageNumber.value,
            pageSize: pageSize.value,
            warningType: "LEVEL_UPGRADE",
            severity: filters.severity || undefined,
            status: filters.status || undefined,
            startTime: start ? dayjs(start).startOf("day").format("YYYY-MM-DD HH:mm:ss") : undefined,
            endTime: end ? dayjs(end).endOf("day").format("YYYY-MM-DD HH:mm:ss") : undefined,
          }),
        );
        records.value = page.records.map(mapWarningEventFromApi);
        total.value = page.total ?? 0;
        await rewindIfEmpty(records.value.length, loadList);
      } catch (e) {
        showApiError(e);
        records.value = [];
        total.value = 0;
      } finally {
        loading.value = false;
      }
    };

    scheduleInitialLoad(loadList);

    const onSearch = (): void => {
      resetPage();
      void loadList();
    };

    const onReset = (): void => {
      filters.severity = "";
      filters.status = "";
      filters.timeRange = undefined;
      resetPage();
      void loadList();
    };

    const onPageChange = bindPageChange(loadList);

    const openDispose = (record: WarningEventVO): void => {
      disposing.value = record;
      disposeForm.disposeDesc = record.disposeDesc ?? "";
      disposeForm.disposeResult = record.disposeResult ?? "已确认";
      disposeVisible.value = true;
    };

    const closeDispose = (): void => {
      disposeVisible.value = false;
      disposing.value = null;
      disposeForm.disposeDesc = "";
      disposeForm.disposeResult = "已确认";
    };

    const confirmDispose = async (): Promise<void> => {
      if (!disposing.value || disposing.value.status !== "ACTIVE") return;
      try {
        await disposeFormRef.value?.validate();
      } catch {
        return;
      }
      submitting.value = true;
      try {
        await useAuthRequest(() =>
          patchWarningRecord(disposing.value!.id, {
            disposeDesc: disposeForm.disposeDesc.trim(),
            disposeResult: disposeForm.disposeResult,
          }),
        );
        message.success("预警处置已提交");
        closeDispose();
        await loadList();
      } catch (e) {
        showApiError(e);
      } finally {
        submitting.value = false;
      }
    };

    const renderWarningType = (type?: string): JSX.Element => <Tag color="blue">{WARNING_TYPE_LABEL[type ?? ""] ?? type ?? "--"}</Tag>;

    const columns = [
      {
        dataIndex: "warningType",
        title: "预警类型",
        width: 130,
        customRender: ({ text }: { text?: string }): JSX.Element => renderWarningType(text),
      },
      {
        dataIndex: "severity",
        title: "等级",
        width: 90,
        customRender: ({ text }: { text: WarningEventVO["severity"] }): JSX.Element => (
          <Tag color={SEVERITY_COLOR[text]}>{SEVERITY_LABEL[text]}</Tag>
        ),
      },
      { dataIndex: "unitName", title: "风险单元", width: 180, ellipsis: true },
      {
        dataIndex: "objectName",
        title: "风险对象",
        width: 220,
        ellipsis: true,
        customRender: ({ record }: { record: WarningEventVO }): JSX.Element => (
          <span>{record.objectName || record.objectCode || "--"}</span>
        ),
      },
      { dataIndex: "description", title: "预警内容", width: 260, ellipsis: true },
      {
        dataIndex: "triggerTime",
        title: "触发时间",
        width: 170,
        customRender: ({ text }: { text?: string }): JSX.Element => <span style={{ whiteSpace: "nowrap" }}>{text || "-"}</span>,
      },
      {
        dataIndex: "status",
        title: "状态",
        width: 90,
        customRender: ({ text }: { text: WarningEventVO["status"] }): JSX.Element => (
          <Tag color={text === "ACTIVE" ? "red" : "green"}>{STATUS_LABEL[text]}</Tag>
        ),
      },
      {
        dataIndex: "disposeResult",
        title: "处置结果",
        width: 130,
        ellipsis: true,
        customRender: ({ text }: { text?: string }): string => text || "--",
      },
      {
        dataIndex: "disposeTime",
        title: "处置时间",
        width: 170,
        customRender: ({ text }: { text?: string }): JSX.Element => <span style={{ whiteSpace: "nowrap" }}>{text || "-"}</span>,
      },
      {
        dataIndex: "action",
        title: "操作",
        width: 90,
        align: "center",
        customRender: ({ record }: { record: WarningEventVO }): JSX.Element => (
          <Button {...LIST_ACTION_LINK_PROPS} onClick={() => openDispose(record)}>
            {record.status === "ACTIVE" ? "处置" : "查看"}
          </Button>
        ),
      },
    ];

    return (): JSX.Element => (
      <PageShell
        title={pageTitle || "预警看板"}
        v-slots={{
          "layout-content": (): JSX.Element => (
            <div class="listPageBody">
              <Form layout="inline" data-layout-toolbar>
                <FormItem label="预警等级">
                  <Select v-model:value={filters.severity} allowClear placeholder="全部" style={{ width: "120px" }}>
                    <SelectOption value="">全部</SelectOption>
                    <SelectOption value="RED">红色</SelectOption>
                    <SelectOption value="ORANGE">橙色</SelectOption>
                    <SelectOption value="YELLOW">黄色</SelectOption>
                  </Select>
                </FormItem>
                <FormItem label="状态">
                  <Select v-model:value={filters.status} allowClear placeholder="全部" style={{ width: "120px" }}>
                    <SelectOption value="">全部</SelectOption>
                    <SelectOption value="ACTIVE">待处置</SelectOption>
                    <SelectOption value="DISPOSED">已处置</SelectOption>
                  </Select>
                </FormItem>
                <FormItem label="触发时间">
                  <DateRangePicker v-model:value={filters.timeRange} valueFormat="YYYY-MM-DD" />
                </FormItem>
                <FormItem>
                  <Space>
                    <Button type="primary" onClick={onSearch}>
                      查询
                    </Button>
                    <Button onClick={onReset}>重置</Button>
                  </Space>
                </FormItem>
              </Form>
              <div class="tableWrap">
                <Table
                  rowKey="id"
                  columns={columns}
                  dataSource={records.value}
                  pagination={false}
                  loading={loading.value}
                  scroll={{ y: y.value, x: 1460 }}
                />
              </div>
              <Modal
                open={disposeVisible.value}
                title="预警处置"
                width={560}
                destroyOnClose
                onCancel={closeDispose}
                footer={
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <Button onClick={closeDispose}>取消</Button>
                    {disposing.value?.status === "ACTIVE" && (
                      <Button
                        type="primary"
                        loading={submitting.value}
                        onClick={() => {
                          void confirmDispose();
                        }}
                      >
                        确认处置
                      </Button>
                    )}
                  </div>
                }
              >
                {disposing.value && (
                  <>
                    <div style={{ marginBottom: 16, padding: 12, background: "#fff7e6", borderRadius: 4 }}>
                      <div style={{ marginBottom: 4 }}>
                        <strong>{disposing.value.unitName || "--"}</strong>
                        {" - "}
                        {renderWarningType(disposing.value.warningType)}
                      </div>
                      <div style={{ color: "#666", fontSize: 13 }}>{disposing.value.description || disposing.value.objectName || "--"}</div>
                    </div>
                    <Form model={disposeForm} ref={disposeFormRef} rules={disposeRules} labelCol={{ style: { width: "88px" } }}>
                      <FormItem label="处置说明" name="disposeDesc">
                        <Textarea
                          {...FORM_INPUT_PROPS}
                          v-model:value={disposeForm.disposeDesc}
                          rows={3}
                          maxlength={500}
                          disabled={disposing.value.status !== "ACTIVE"}
                          placeholder="请说明处置措施和结果"
                        />
                      </FormItem>
                      <FormItem label="处置结果" name="disposeResult">
                        <Select
                          v-model:value={disposeForm.disposeResult}
                          disabled={disposing.value.status !== "ACTIVE"}
                          style={{ width: "100%" }}
                        >
                          {DISPOSE_RESULT_OPTIONS.map((option) => (
                            <SelectOption key={option} value={option}>
                              {option}
                            </SelectOption>
                          ))}
                        </Select>
                      </FormItem>
                    </Form>
                  </>
                )}
              </Modal>
            </div>
          ),
          "footer-page": (): JSX.Element => (
            <GPagination total={total.value} current={pageNumber.value} pageSize={pageSize.value} onChange={onPageChange} />
          ),
        }}
      />
    );
  },
});
