import { defineComponent, ref } from "vue";

import { createMeasureExecutionRecord, pageMeasureExecutions } from "@ghcloud/cube-services-client/risk-graded-control.client";
import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Form,
  FormItem,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Textarea,
  Upload,
  message,
  type UploadChangeParam,
  type UploadFile,
  type UploadRequestOption,
} from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { uploadRiskControlFile } from "@/api/upload-risk-file";
import { GPagination } from "@/components/common/pagination";
import { PageShell } from "@/components/page-shell/page-shell";
import { RiskLevelTag } from "@/components/risk-level-tag/risk-level-tag";
import { FILE_SCENE_CODE, LIST_ACTION_LINK_PROPS, LIST_SEARCH_INPUT_PROPS, MAX_MEASURE_EXECUTION_ATTACHMENTS } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useListSearchClearReload } from "@/hooks/use-list-search-clear-reload";
import { useServerPagedList } from "@/hooks/use-server-paged-list";
import type { ControlMeasureVO, RiskLevel } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { mapMeasureFromApi, mapRiskLevelFromApi, type RiskControlMeasureApiVO } from "@/utils/risk-control-mapper";

const LEVEL_ORDER: Record<RiskLevel, number> = {
  MAJOR: 4,
  SIGNIFICANT: 3,
  GENERAL: 2,
  LOW: 1,
};

const EXEC_STATUS = {
  PENDING: { label: "待执行", color: "default" },
  EXECUTING: { label: "执行中", color: "processing" },
  DONE: { label: "已执行", color: "success" },
  OVERDUE: { label: "超期", color: "error" },
} as const;

const DEFAULT_EXECUTION_RESULT = "COMPLETED";

interface PendingMeasureRow extends ControlMeasureVO {
  unitName: string;
  objectName: string;
  inherentRiskLevel?: RiskLevel;
  controlRiskLevel?: RiskLevel;
  levelOrder: number;
}

const TABLE_SCROLL_X = 1210;

export const MeasureExecutionPage = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const records = ref<PendingMeasureRow[]>([]);
    const { pageNumber, pageSize, total, onPageChange: bindPageChange, scheduleInitialLoad, rewindIfEmpty } = useServerPagedList();
    const keyword = ref("");
    const loading = ref(false);
    const executeVisible = ref(false);
    const activeMeasure = ref<PendingMeasureRow | null>(null);
    const execRemark = ref("");
    const fileList = ref<UploadFile[]>([]);
    const fileIds = ref<string[]>([]);
    const submitting = ref(false);

    const stringValue = (value: unknown): string => {
      if (typeof value === "string" || typeof value === "number") return String(value).trim();
      return "";
    };

    const buildRows = (items: ControlMeasureVO[], rawRecords: RiskControlMeasureApiVO[]): PendingMeasureRow[] =>
      items
        .map((measure, idx) => {
          const raw = rawRecords[idx] ?? {};
          const inherentRiskLevel = mapRiskLevelFromApi(raw.inherentRiskLevel);
          const controlRiskLevel = mapRiskLevelFromApi(raw.controlRiskLevel ?? raw.riskLevel);
          const sortLevel = controlRiskLevel ?? inherentRiskLevel;
          return {
            ...measure,
            unitName: stringValue(raw.unitName) || stringValue(raw.unit?.name) || "未关联风险单元",
            objectName: stringValue(raw.objectName) || stringValue(raw.name) || measure.objectId || "--",
            deadline: measure.deadline || stringValue(raw.deadline),
            inherentRiskLevel,
            controlRiskLevel,
            levelOrder: sortLevel ? LEVEL_ORDER[sortLevel] : 0,
          };
        })
        .filter((measure) => measure.execStatus === "PENDING" || measure.execStatus === "EXECUTING" || measure.execStatus === "OVERDUE")
        .sort((a, b) => b.levelOrder - a.levelOrder);

    const loadList = async (): Promise<void> => {
      loading.value = true;
      try {
        const page = await useAuthRequest(() =>
          pageMeasureExecutions({
            pageNumber: pageNumber.value,
            pageSize: pageSize.value,
            keyword: keyword.value.trim() || undefined,
            status: "PENDING,EXECUTING,OVERDUE",
          }),
        );
        const rows = buildRows(page.records.map(mapMeasureFromApi), page.records);
        records.value = rows;
        total.value = page.total ?? rows.length;
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

    const resetExecuteForm = (): void => {
      execRemark.value = "";
      fileList.value = [];
      fileIds.value = [];
    };

    const openExecute = (record: PendingMeasureRow): void => {
      activeMeasure.value = record;
      resetExecuteForm();
      executeVisible.value = true;
    };

    const customRequest = async (options: UploadRequestOption): Promise<void> => {
      const { file, onSuccess, onError } = options;
      const blob = file as File;
      if (fileIds.value.length >= MAX_MEASURE_EXECUTION_ATTACHMENTS) {
        message.warning(`最多上传 ${MAX_MEASURE_EXECUTION_ATTACHMENTS} 个附件`);
        onError?.(new Error("attachment limit exceeded"));
        return;
      }
      try {
        const result = await useAuthRequest(() => uploadRiskControlFile(blob, FILE_SCENE_CODE.MEASURE_EXECUTION_ATTACHMENT));
        const id = stringValue(result.id);
        if (id) fileIds.value = [...fileIds.value, id];
        onSuccess?.({ url: result.path, fileId: id });
        message.success(`附件 ${blob.name ?? ""} 上传成功`);
      } catch (e) {
        showApiError(e);
        onError?.(e as Error);
      }
    };

    const onUploadChange = (info: UploadChangeParam): void => {
      fileList.value = info.fileList;
      const nextFileIds = info.fileList
        .map((file) => stringValue((file.response as { fileId?: string | number } | undefined)?.fileId))
        .filter(Boolean);
      if (nextFileIds.length > 0 || info.fileList.length === 0) fileIds.value = nextFileIds;
    };

    const confirmExecute = async (): Promise<void> => {
      if (!activeMeasure.value) return;
      if (!execRemark.value.trim()) {
        message.warning("请填写执行情况说明");
        return;
      }
      submitting.value = true;
      try {
        await useAuthRequest(() =>
          createMeasureExecutionRecord(activeMeasure.value!.id, {
            executionDesc: execRemark.value.trim(),
            executionResult: DEFAULT_EXECUTION_RESULT,
            executorUserId: activeMeasure.value!.executorId || undefined,
            fileIds: fileIds.value,
          }),
        );
        message.success("执行反馈已提交");
        executeVisible.value = false;
        activeMeasure.value = null;
        await loadList();
      } catch (e) {
        showApiError(e);
      } finally {
        submitting.value = false;
      }
    };

    const onSearch = (): void => {
      pageNumber.value = 1;
      void loadList();
    };

    useListSearchClearReload(keyword, onSearch);

    const onReset = (): void => {
      keyword.value = "";
      pageNumber.value = 1;
      void loadList();
    };

    const onPageChange = bindPageChange(loadList);

    const fieldLabel = (text: string, required = false): JSX.Element => (
      <div style={{ marginBottom: 8, color: "rgba(0,0,0,0.85)", lineHeight: "22px", whiteSpace: "nowrap" }}>
        {required && <span style={{ marginRight: 4, color: "#ff4d4f" }}>*</span>}
        {text}
      </div>
    );

    const columns = [
      { title: "风险单元", dataIndex: "unitName", width: 160, ellipsis: true },
      { title: "风险对象", dataIndex: "objectName", width: 150, ellipsis: true },
      {
        title: "固有风险",
        dataIndex: "inherentRiskLevel",
        width: 110,
        customRender: ({ text }: { text: RiskLevel | undefined }) => <RiskLevelTag level={text} />,
      },
      {
        title: "控制评估风险",
        dataIndex: "controlRiskLevel",
        width: 120,
        customRender: ({ text }: { text: RiskLevel | undefined }) => <RiskLevelTag level={text} />,
      },
      { title: "管控类型", dataIndex: "controlType", width: 100, customRender: ({ text }: { text?: string }) => text || "--" },
      { title: "措施内容", dataIndex: "content", width: 260, ellipsis: true, customRender: ({ text }: { text?: string }) => text || "--" },
      { title: "管控层级", dataIndex: "controlLevel", width: 90, customRender: ({ text }: { text?: string }) => text || "--" },
      { title: "执行人", dataIndex: "executor", width: 90, ellipsis: true, customRender: ({ text }: { text?: string }) => text || "--" },
      {
        title: "状态",
        dataIndex: "execStatus",
        width: 90,
        customRender: ({ text }: { text: ControlMeasureVO["execStatus"] }) => {
          const s = EXEC_STATUS[text] ?? EXEC_STATUS.PENDING;
          return <Tag color={s.color}>{s.label}</Tag>;
        },
      },
      {
        title: "操作",
        width: 80,
        customRender: ({ record }: { record: PendingMeasureRow }) => (
          <Button {...LIST_ACTION_LINK_PROPS} onClick={() => openExecute(record)}>
            执行
          </Button>
        ),
      },
    ];

    return (): JSX.Element => (
      <PageShell
        title={pageTitle}
        v-slots={{
          "layout-header": () => <span style={{ color: "#666" }}>按控制评估风险等级从高到低排序，共 {total.value} 条待执行措施</span>,
          "layout-content": () => (
            <>
              <Form layout="inline" data-layout-toolbar>
                <FormItem label="关键词">
                  <Input
                    {...LIST_SEARCH_INPUT_PROPS}
                    v-model:value={keyword.value}
                    placeholder="单元/对象/措施/执行人"
                    allowClear
                    style={{ width: 220 }}
                    onPressEnter={onSearch}
                  />
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
                  columns={columns}
                  dataSource={records.value}
                  rowKey="id"
                  pagination={false}
                  loading={loading.value}
                  scroll={{ x: TABLE_SCROLL_X }}
                  tableLayout="fixed"
                />
              </div>
              <Modal
                title="措施执行"
                open={executeVisible.value}
                width={720}
                confirmLoading={submitting.value}
                okText="提交执行反馈"
                cancelText="取消"
                onOk={() => {
                  void confirmExecute();
                }}
                onCancel={() => {
                  executeVisible.value = false;
                  activeMeasure.value = null;
                }}
              >
                {activeMeasure.value && (
                  <>
                    <Card size="small" style={{ marginBottom: 16 }}>
                      <Descriptions column={2} size="small">
                        <DescriptionsItem label="风险单元">{activeMeasure.value.unitName}</DescriptionsItem>
                        <DescriptionsItem label="风险对象">{activeMeasure.value.objectName}</DescriptionsItem>
                        <DescriptionsItem label="固有风险">
                          <RiskLevelTag level={activeMeasure.value.inherentRiskLevel} />
                        </DescriptionsItem>
                        <DescriptionsItem label="控制评估风险">
                          <RiskLevelTag level={activeMeasure.value.controlRiskLevel} />
                        </DescriptionsItem>
                        <DescriptionsItem label="管控类型">{activeMeasure.value.controlType || "--"}</DescriptionsItem>
                        <DescriptionsItem label="管控层级">{activeMeasure.value.controlLevel || "--"}</DescriptionsItem>
                        <DescriptionsItem label="执行人">{activeMeasure.value.executor || "--"}</DescriptionsItem>
                      </Descriptions>
                      <div style={{ marginTop: 12, color: "rgba(0,0,0,0.88)", lineHeight: "22px" }}>
                        <strong>措施内容：</strong>
                        {activeMeasure.value.content || "--"}
                      </div>
                    </Card>
                    <Form layout="vertical">
                      <FormItem>
                        {fieldLabel("执行情况说明", true)}
                        <Textarea v-model:value={execRemark.value} rows={3} maxlength={500} placeholder="填写执行情况说明" />
                      </FormItem>
                      <FormItem>
                        {fieldLabel(`执行附件（最多 ${MAX_MEASURE_EXECUTION_ATTACHMENTS} 个）`)}
                        <Upload
                          customRequest={customRequest}
                          fileList={fileList.value}
                          maxCount={MAX_MEASURE_EXECUTION_ATTACHMENTS}
                          onChange={onUploadChange}
                        >
                          <Button disabled={fileIds.value.length >= MAX_MEASURE_EXECUTION_ATTACHMENTS}>上传附件</Button>
                        </Upload>
                      </FormItem>
                    </Form>
                  </>
                )}
              </Modal>
            </>
          ),
          "footer-page": () => (
            <GPagination total={total.value} current={pageNumber.value} pageSize={pageSize.value} onChange={onPageChange} />
          ),
        }}
      />
    );
  },
});
