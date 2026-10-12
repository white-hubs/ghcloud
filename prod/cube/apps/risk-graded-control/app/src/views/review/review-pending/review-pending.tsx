import type { Key } from "ant-design-vue/es/table/interface";
import { defineComponent, ref } from "vue";

import { createReviews, pageReviewTasks } from "@ghcloud/cube-services-client/risk-graded-control.client";
import {
  Button,
  Form,
  FormItem,
  Input,
  Modal,
  RadioGroup,
  Select,
  SelectOption,
  Space,
  Table,
  Tag,
  Textarea,
  message,
} from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { GPagination } from "@/components/common/pagination";
import { PageShell } from "@/components/page-shell/page-shell";
import { ReviewObjectModal } from "@/components/review-object-modal/review-object-modal";
import { FORM_INPUT_PROPS } from "@/constants";
import { LIST_ACTION_LINK_PROPS, LIST_FILTER_SELECT_WIDTH, LIST_SEARCH_INPUT_PROPS } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useListSearchClearReload } from "@/hooks/use-list-search-clear-reload";
import { useServerPagedList } from "@/hooks/use-server-paged-list";
import type { ReviewItemVO } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { readCurrentUserId } from "@/utils/read-current-user";
import { mapReviewFromApi } from "@/utils/risk-control-mapper";

type ReviewTaskStatusFilter = "" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";

const STATUS_LABEL = { PENDING: "待审核", APPROVED: "已通过", REJECTED: "已退回" } as const;
const STATUS_COLOR = { PENDING: "processing", APPROVED: "success", REJECTED: "error" } as const;
const REVIEW_STATUS_OPTIONS: Array<{ label: string; value: Exclude<ReviewTaskStatusFilter, ""> }> = [
  { label: "待审核", value: "PENDING_REVIEW" },
  { label: "已通过", value: "APPROVED" },
  { label: "已退回", value: "REJECTED" },
];

const TABLE_SCROLL_X = 1450;

export const ReviewPendingPage = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const records = ref<ReviewItemVO[]>([]);
    const { pageNumber, pageSize, total, onPageChange: bindPageChange, scheduleInitialLoad, rewindIfEmpty } = useServerPagedList();
    const keyword = ref("");
    const statusFilter = ref<ReviewTaskStatusFilter>("");
    const loading = ref(false);
    const selectedRowKeys = ref<Key[]>([]);
    const batchVisible = ref(false);
    const batchAction = ref<"APPROVED" | "REJECTED">("APPROVED");
    const batchReason = ref("");
    const batchComment = ref("");
    const reviewVisible = ref(false);
    const reviewObjectId = ref("");
    const reviewPreview = ref<ReviewItemVO | null>(null);

    const loadList = async (): Promise<void> => {
      loading.value = true;
      try {
        const page = await useAuthRequest(() =>
          pageReviewTasks({
            pageNumber: pageNumber.value,
            pageSize: pageSize.value,
            keyword: keyword.value.trim() || undefined,
            status: statusFilter.value || undefined,
          }),
        );
        records.value = page.records.map(mapReviewFromApi);
        const pendingIds = new Set(records.value.filter((record) => record.status === "PENDING").map((record) => record.id));
        selectedRowKeys.value = selectedRowKeys.value.filter((key) => pendingIds.has(String(key)));
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

    const openReview = (record: ReviewItemVO): void => {
      reviewObjectId.value = record.objectId || record.id;
      reviewPreview.value = record;
      reviewVisible.value = true;
    };

    const onReviewSuccess = (result: "APPROVED" | "REJECTED"): void => {
      message.success(result === "APPROVED" ? "审核通过" : "已退回修改");
      void loadList();
    };

    const openBatchReview = (): void => {
      if (selectedRowKeys.value.length === 0) {
        message.warning("请先选择待审核项");
        return;
      }
      batchAction.value = "APPROVED";
      batchReason.value = "";
      batchComment.value = "";
      batchVisible.value = true;
    };

    const confirmBatch = async (): Promise<void> => {
      if (batchAction.value === "REJECTED" && !batchReason.value.trim()) {
        message.error("退回时请填写原因");
        return;
      }
      const selectedKeys = new Set(selectedRowKeys.value.map(String));
      const objectIds = records.value
        .filter((record) => record.status === "PENDING" && selectedKeys.has(record.id))
        .map((record) => record.objectId || record.id);
      if (!objectIds.length) {
        message.warning("请选择待审核项");
        return;
      }
      try {
        await useAuthRequest(() =>
          createReviews({
            objectIds,
            reviewResult: batchAction.value,
            rejectReason: batchAction.value === "REJECTED" ? batchReason.value.trim() : undefined,
            reviewComment: batchComment.value.trim() || undefined,
            userId: readCurrentUserId(),
          }),
        );
        message.success(`已批量${batchAction.value === "APPROVED" ? "通过" : "退回修改"} ${objectIds.length} 条`);
        selectedRowKeys.value = [];
        batchVisible.value = false;
        await loadList();
      } catch (e) {
        showApiError(e);
      }
    };

    const onSearch = (): void => {
      pageNumber.value = 1;
      selectedRowKeys.value = [];
      void loadList();
    };

    useListSearchClearReload(keyword, onSearch);

    const onReset = (): void => {
      keyword.value = "";
      statusFilter.value = "";
      selectedRowKeys.value = [];
      pageNumber.value = 1;
      void loadList();
    };

    const onPageChange = bindPageChange(loadList);

    const columns = [
      { title: "风险对象", dataIndex: "objectName", width: 160, ellipsis: true },
      { title: "所属单元", dataIndex: "unitName", width: 160, ellipsis: true },
      { title: "辨识人", dataIndex: "identifyUser", width: 90 },
      { title: "危险源描述", dataIndex: "hazardDesc", ellipsis: true },
      {
        title: "事故类型",
        dataIndex: "accidentTypes",
        width: 140,
        customRender: ({ text }: { text: string[] }) => text.join("、"),
      },
      { title: "提交时间", dataIndex: "submitTime", width: 160 },
      { title: "审核人", dataIndex: "reviewerUser", width: 90, customRender: ({ text }: { text?: string }) => text || "--" },
      { title: "审核时间", dataIndex: "reviewTime", width: 160, customRender: ({ text }: { text?: string }) => text || "--" },
      {
        title: "退回原因/审核意见",
        dataIndex: "rejectReason",
        width: 180,
        ellipsis: true,
        customRender: ({ record }: { record: ReviewItemVO }) => record.rejectReason || record.reviewComment || "--",
      },
      {
        title: "状态",
        dataIndex: "status",
        width: 90,
        customRender: ({ text }: { text: ReviewItemVO["status"] }) => <Tag color={STATUS_COLOR[text]}>{STATUS_LABEL[text]}</Tag>,
      },
      {
        title: "操作",
        width: 100,
        customRender: ({ record }: { record: ReviewItemVO }) => (
          <Button {...LIST_ACTION_LINK_PROPS} disabled={record.status !== "PENDING"} onClick={() => openReview(record)}>
            审核
          </Button>
        ),
      },
    ];

    return (): JSX.Element => (
      <PageShell
        title={pageTitle}
        v-slots={{
          "layout-header": () => (
            <Button type="primary" onClick={openBatchReview}>
              批量审核（已选 {selectedRowKeys.value.length} 条）
            </Button>
          ),
          "layout-content": () => (
            <>
              <Form layout="inline" data-layout-toolbar>
                <FormItem label="关键词">
                  <Input
                    {...LIST_SEARCH_INPUT_PROPS}
                    v-model:value={keyword.value}
                    placeholder="对象/单元/辨识人"
                    allowClear
                    style={{ width: 200 }}
                    onPressEnter={onSearch}
                  />
                </FormItem>
                <FormItem label="审核状态">
                  <Select
                    v-model:value={statusFilter.value}
                    allowClear
                    placeholder="全部状态"
                    style={{ width: LIST_FILTER_SELECT_WIDTH }}
                    onChange={(value: string | undefined) => {
                      statusFilter.value = (value ?? "") as ReviewTaskStatusFilter;
                      onSearch();
                    }}
                  >
                    <SelectOption value="">全部状态</SelectOption>
                    {REVIEW_STATUS_OPTIONS.map((s) => (
                      <SelectOption key={s.value} value={s.value}>
                        {s.label}
                      </SelectOption>
                    ))}
                  </Select>
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
                  rowSelection={{
                    selectedRowKeys: selectedRowKeys.value,
                    onChange: (keys: Key[]) => {
                      selectedRowKeys.value = keys;
                    },
                    getCheckboxProps: (record: ReviewItemVO) => ({ disabled: record.status !== "PENDING" }),
                  }}
                />
              </div>
              <ReviewObjectModal
                open={reviewVisible.value}
                objectId={reviewObjectId.value}
                preview={reviewPreview.value}
                onUpdate:open={(v: boolean) => {
                  reviewVisible.value = v;
                }}
                onSuccess={onReviewSuccess}
              />
              <Modal
                title="批量审核"
                open={batchVisible.value}
                onOk={() => {
                  void confirmBatch();
                }}
                onCancel={() => {
                  batchVisible.value = false;
                }}
              >
                <p style={{ marginBottom: 12 }}>已选 {selectedRowKeys.value.length} 条待审核记录</p>
                <Form layout="vertical">
                  <FormItem label="审核结果" required>
                    <RadioGroup
                      v-model:value={batchAction.value}
                      optionType="default"
                      options={[
                        { label: "通过", value: "APPROVED" },
                        { label: "退回修改", value: "REJECTED" },
                      ]}
                    />
                  </FormItem>
                  {batchAction.value === "REJECTED" && (
                    <FormItem label="退回原因" required>
                      <Textarea
                        {...FORM_INPUT_PROPS}
                        v-model:value={batchReason.value}
                        rows={3}
                        maxlength={200}
                        placeholder="请填写退回原因"
                      />
                    </FormItem>
                  )}
                  <FormItem label="审核意见">
                    <Textarea
                      {...FORM_INPUT_PROPS}
                      v-model:value={batchComment.value}
                      rows={3}
                      maxlength={500}
                      placeholder="输入审核意见（可选）"
                    />
                  </FormItem>
                </Form>
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
