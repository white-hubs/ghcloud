import {
  Button,
  DropdownItem,
  DropdownMenu,
  Field,
  List,
  Loading,
  Popup,
  PullRefresh,
  Search,
  Tag,
  showSuccessToast,
  showToast,
} from "vant";
import { computed, defineComponent, onMounted, ref, watch } from "vue";

import { createReviews, getReviewTask, pageReviewTasks } from "@ghcloud/cube-services-client/risk-graded-control.client";

import { Bar } from "@/components/bar/bar";
import { useAuthRequest } from "@/hooks/use-auth-request";
import type { ReviewItemVO } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { readCurrentUserId } from "@/utils/read-current-user";
import { mapReviewFromApi } from "@/utils/risk-control-mapper";

import styles from "./review-pending.module.less";

type ReviewStatusFilter = "" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
type ReviewAction = "APPROVED" | "REJECTED";

const STATUS_OPTIONS: Array<{ label: string; value: ReviewStatusFilter }> = [
  { label: "全部", value: "" },
  { label: "待审核", value: "PENDING_REVIEW" },
  { label: "已通过", value: "APPROVED" },
  { label: "已退回", value: "REJECTED" },
];

const STATUS_LABEL: Record<ReviewItemVO["status"], string> = {
  PENDING: "待审核",
  APPROVED: "已通过",
  REJECTED: "已退回",
};

const STATUS_TAG: Record<ReviewItemVO["status"], "primary" | "success" | "danger"> = {
  PENDING: "primary",
  APPROVED: "success",
  REJECTED: "danger",
};

const PAGE_SIZE = 10;

export const ReviewPendingPage = defineComponent({
  name: "ReviewPendingPage",
  setup() {
    const records = ref<ReviewItemVO[]>([]);
    const refreshing = ref(false);
    const loading = ref(false);
    const finished = ref(false);
    const pageNumber = ref(1);
    const total = ref(0);
    const keyword = ref("");
    const statusFilter = ref<ReviewStatusFilter>("");
    const reviewVisible = ref(false);
    const reviewAction = ref<ReviewAction>("APPROVED");
    const reviewReason = ref("");
    const reviewComment = ref("");
    const activeRecord = ref<ReviewItemVO | null>(null);
    const detailRecord = ref<ReviewItemVO | null>(null);
    const detailLoading = ref(false);
    const batchMode = ref(false);
    const selectedObjectIds = ref<string[]>([]);
    let requestSeq = 0;

    const loadList = async (reset = false): Promise<void> => {
      if (loading.value && !reset) return;
      const seq = ++requestSeq;
      if (reset) {
        pageNumber.value = 1;
        total.value = 0;
        records.value = [];
        finished.value = false;
      }
      loading.value = true;
      try {
        const currentPage = pageNumber.value;
        const page = await useAuthRequest(() =>
          pageReviewTasks({
            pageNumber: currentPage,
            pageSize: PAGE_SIZE,
            keyword: keyword.value.trim() || undefined,
            status: statusFilter.value || undefined,
          }),
        );
        if (seq !== requestSeq) return;
        const mapped = page.records.map(mapReviewFromApi);
        total.value = page.total ?? 0;
        records.value = reset ? mapped : [...records.value, ...mapped];
        pageNumber.value = currentPage + 1;
        finished.value = (total.value > 0 && records.value.length >= total.value) || mapped.length < PAGE_SIZE;
        const pendingIds = new Set(
          records.value.filter((record) => record.status === "PENDING").map((record) => record.objectId || record.id),
        );
        selectedObjectIds.value = selectedObjectIds.value.filter((id) => pendingIds.has(id));
      } catch (e) {
        if (seq === requestSeq) {
          showApiError(e);
          records.value = [];
          selectedObjectIds.value = [];
          finished.value = true;
        }
      } finally {
        if (seq === requestSeq) {
          loading.value = false;
          refreshing.value = false;
        }
      }
    };

    onMounted(() => {
      document.title = "风险辨识审核";
      void loadList(true);
    });

    watch(statusFilter, () => {
      void loadList(true);
    });

    const filteredRecords = computed(() => {
      return records.value;
    });

    const selectedCount = computed(() => selectedObjectIds.value.length);
    const statusFilterLabel = computed(() => STATUS_OPTIONS.find((item) => item.value === statusFilter.value)?.label ?? "全部");

    const onRefresh = async (): Promise<void> => {
      refreshing.value = true;
      await loadList(true);
    };

    const openReview = (record: ReviewItemVO, action: ReviewAction): void => {
      activeRecord.value = record;
      batchMode.value = false;
      reviewAction.value = action;
      reviewReason.value = "";
      reviewComment.value = "";
      reviewVisible.value = true;
    };

    const openDetail = async (record: ReviewItemVO): Promise<void> => {
      detailRecord.value = record;
      detailLoading.value = true;
      try {
        const vo = await useAuthRequest(() => getReviewTask(record.objectId || record.id));
        detailRecord.value = mapReviewFromApi(vo);
      } catch (e) {
        showApiError(e);
      } finally {
        detailLoading.value = false;
      }
    };

    const closeDetail = (): void => {
      detailRecord.value = null;
      detailLoading.value = false;
    };

    const openBatchReview = (action: ReviewAction): void => {
      if (!selectedObjectIds.value.length) {
        showToast("请先选择待审核项");
        return;
      }
      activeRecord.value = null;
      batchMode.value = true;
      reviewAction.value = action;
      reviewReason.value = "";
      reviewComment.value = "";
      reviewVisible.value = true;
    };

    const toggleSelect = (record: ReviewItemVO): void => {
      if (record.status !== "PENDING") return;
      const objectId = record.objectId || record.id;
      selectedObjectIds.value = selectedObjectIds.value.includes(objectId)
        ? selectedObjectIds.value.filter((id) => id !== objectId)
        : [...selectedObjectIds.value, objectId];
    };

    const submitReview = async (): Promise<void> => {
      const record = activeRecord.value;
      if (reviewAction.value === "REJECTED" && !reviewReason.value.trim()) {
        showToast("退回时请填写原因");
        return;
      }
      try {
        if (batchMode.value) {
          if (!selectedObjectIds.value.length) {
            showToast("请先选择待审核项");
            return;
          }
          await useAuthRequest(() =>
            createReviews({
              objectIds: selectedObjectIds.value,
              reviewResult: reviewAction.value,
              rejectReason: reviewAction.value === "REJECTED" ? reviewReason.value.trim() : undefined,
              reviewComment: reviewComment.value.trim() || undefined,
              userId: readCurrentUserId(),
            }),
          );
          showSuccessToast(`已批量${reviewAction.value === "APPROVED" ? "通过" : "退回"} ${selectedObjectIds.value.length} 条`);
          selectedObjectIds.value = [];
        } else {
          if (!record) return;
          await useAuthRequest(() =>
            createReviews({
              objectId: record.objectId || record.id,
              reviewResult: reviewAction.value,
              rejectReason: reviewAction.value === "REJECTED" ? reviewReason.value.trim() : undefined,
              reviewComment: reviewComment.value.trim() || undefined,
              userId: readCurrentUserId(),
            }),
          );
          showSuccessToast(reviewAction.value === "APPROVED" ? "审核通过" : "已退回修改");
        }
        reviewVisible.value = false;
        batchMode.value = false;
        if (detailRecord.value) {
          closeDetail();
        }
        await loadList(true);
      } catch (e) {
        showApiError(e);
      }
    };

    const renderDetailItem = (label: string, value?: string, full = false): JSX.Element => (
      <div class={full ? styles.detailItemFull : styles.detailItem}>
        <span>{label}</span>
        <strong>{value || "--"}</strong>
      </div>
    );

    const renderReviewPopup = (): JSX.Element => (
      <Popup
        show={reviewVisible.value}
        round
        position="bottom"
        onUpdate:show={(value: boolean) => {
          reviewVisible.value = value;
        }}
      >
        <div class={styles.popupBody}>
          <div class={styles.popupTitle}>
            {batchMode.value ? "批量" : ""}
            {reviewAction.value === "APPROVED" ? "审核通过" : "退回修改"}
          </div>
          {batchMode.value && <div class={styles.batchHint}>将处理 {selectedCount.value} 条待审核记录</div>}
          {reviewAction.value === "REJECTED" && (
            <Field
              label="退回原因"
              required
              rows={3}
              autosize
              type="textarea"
              maxlength={200}
              placeholder="请填写退回原因"
              modelValue={reviewReason.value}
              onUpdate:modelValue={(value: string) => {
                reviewReason.value = value;
              }}
            />
          )}
          <Field
            label="审核意见"
            rows={3}
            autosize
            type="textarea"
            maxlength={500}
            placeholder="输入审核意见（可选）"
            modelValue={reviewComment.value}
            onUpdate:modelValue={(value: string) => {
              reviewComment.value = value;
            }}
          />
          <div class={styles.popupActions}>
            <Button block onClick={() => (reviewVisible.value = false)}>
              取消
            </Button>
            <Button block type="primary" onClick={() => void submitReview()}>
              确认
            </Button>
          </div>
        </div>
      </Popup>
    );

    return (): JSX.Element => {
      const detail = detailRecord.value;
      if (detail) {
        const pending = detail.status === "PENDING";
        return (
          <div class={[styles.page, styles.detailPage].join(" ")}>
            <div class={styles.detailNav}>
              <button type="button" onClick={closeDetail}>
                返回
              </button>
              <strong>审核详情</strong>
              <span />
            </div>
            {detailLoading.value && (
              <div class={styles.detailLoading}>
                <Loading size="20px">加载中...</Loading>
              </div>
            )}
            <div class={styles.detailContent}>
              <div class={styles.detailCard}>
                <div class={styles.detailTitleRow}>
                  <div class={styles.detailTitle}>{detail.objectName || "--"}</div>
                  <Tag type={STATUS_TAG[detail.status]} plain>
                    {STATUS_LABEL[detail.status]}
                  </Tag>
                </div>
                <div class={styles.detailSummaryGrid}>
                  {renderDetailItem("风险对象", detail.objectName)}
                  {renderDetailItem("所属单元", detail.unitName)}
                  {renderDetailItem("辨识人", detail.identifyUser)}
                  {renderDetailItem("提交时间", detail.submitTime)}
                </div>
              </div>
              <div class={styles.detailCard}>
                <div class={styles.detailSectionTitle}>辨识信息</div>
                <div class={styles.detailInfoGrid}>
                  {renderDetailItem("危险源", detail.hazardDesc, true)}
                  {renderDetailItem("事故类型", detail.accidentTypes.join("、"))}
                  {renderDetailItem("事故原因", detail.cause)}
                  {renderDetailItem("触发因素", detail.triggerFactors)}
                  {renderDetailItem("应急措施", detail.emergencyMeasures, true)}
                  {renderDetailItem("责任人员", detail.responsibleUser)}
                </div>
              </div>
              <div class={styles.detailCard}>
                <div class={styles.detailSectionTitle}>审核信息</div>
                <div class={styles.detailInfoGrid}>
                  {renderDetailItem("审核人", detail.reviewerUser)}
                  {renderDetailItem("审核时间", detail.reviewTime)}
                  {renderDetailItem("审核结果", STATUS_LABEL[detail.status])}
                  {detail.rejectReason && renderDetailItem("退回原因", detail.rejectReason, true)}
                  {detail.reviewComment && renderDetailItem("审核意见", detail.reviewComment, true)}
                </div>
              </div>
            </div>
            {pending && (
              <div class={styles.detailFooter}>
                <Button type="primary" plain onClick={() => openReview(detail, "REJECTED")}>
                  退回
                </Button>
                <Button type="primary" onClick={() => openReview(detail, "APPROVED")}>
                  通过
                </Button>
              </div>
            )}
            {renderReviewPopup()}
          </div>
        );
      }

      return (
        <div class={styles.page}>
          <Bar name="风险辨识审核" isShowRight={false} />

          <div class={styles.searchBar}>
            <Search
              v-model={keyword.value}
              placeholder="搜索对象/单元/辨识人"
              shape="round"
              class={styles.search}
              onSearch={() => void loadList(true)}
              onClear={() => void loadList(true)}
            />
          </div>

          <div class={styles.filterBar}>
            <DropdownMenu overlay={false} class={styles.dropdownMenu}>
              <DropdownItem v-model={statusFilter.value} title={`状态：${statusFilterLabel.value}`} options={STATUS_OPTIONS} />
            </DropdownMenu>
          </div>

          {selectedCount.value > 0 && (
            <div class={styles.batchBar}>
              <span>已选 {selectedCount.value} 项</span>
              <div class={styles.batchActions}>
                <Button size="small" type="primary" plain onClick={() => openBatchReview("REJECTED")}>
                  批量退回
                </Button>
                <Button size="small" type="primary" onClick={() => openBatchReview("APPROVED")}>
                  批量通过
                </Button>
              </div>
            </div>
          )}

          <PullRefresh modelValue={refreshing.value || loading.value} onRefresh={onRefresh}>
            <List
              class={styles.list}
              v-model:loading={loading.value}
              finished={finished.value}
              finishedText={filteredRecords.value.length ? "— 没有更多了 —" : "暂无审核任务"}
              onLoad={() => void loadList()}
            >
              {filteredRecords.value.map((record) => {
                const objectId = record.objectId || record.id;
                const selectable = record.status === "PENDING";
                const selected = selectedObjectIds.value.includes(objectId);
                return (
                  <div
                    key={record.id}
                    class={[styles.card, selected ? styles.cardSelected : ""].join(" ")}
                    onClick={() => void openDetail(record)}
                  >
                    <div class={styles.cardHeader}>
                      <div class={styles.titleRow}>
                        {selectable && (
                          <button
                            type="button"
                            class={[styles.selectButton, selected ? styles.selectButtonActive : ""].join(" ")}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleSelect(record);
                            }}
                          >
                            {selected ? "已选" : "选择"}
                          </button>
                        )}
                        <div class={styles.title}>{record.objectName || "--"}</div>
                      </div>
                      <Tag type={STATUS_TAG[record.status]} plain>
                        {STATUS_LABEL[record.status]}
                      </Tag>
                    </div>
                    <div class={styles.meta}>
                      <div>
                        <span class={styles.metaLabel}>所属单元：</span>
                        {record.unitName || "--"}
                      </div>
                      <div>
                        <span class={styles.metaLabel}>辨识人：</span>
                        {record.identifyUser || "--"}
                      </div>
                      <div>
                        <span class={styles.metaLabel}>危险源：</span>
                        {record.hazardDesc || "--"}
                      </div>
                      <div>
                        <span class={styles.metaLabel}>事故类型：</span>
                        {record.accidentTypes.join("、") || "--"}
                      </div>
                      <div>
                        <span class={styles.metaLabel}>提交时间：</span>
                        {record.submitTime || "--"}
                      </div>
                      {record.rejectReason && (
                        <div>
                          <span class={styles.metaLabel}>退回原因：</span>
                          {record.rejectReason}
                        </div>
                      )}
                    </div>
                    <div class={styles.footer}>
                      {record.status === "PENDING" && (
                        <>
                          <Button
                            size="small"
                            type="primary"
                            plain
                            onClick={(event) => {
                              event.stopPropagation();
                              openReview(record, "REJECTED");
                            }}
                          >
                            退回
                          </Button>
                          <Button
                            size="small"
                            type="primary"
                            onClick={(event) => {
                              event.stopPropagation();
                              openReview(record, "APPROVED");
                            }}
                          >
                            通过
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {!loading.value && !filteredRecords.value.length && <div class={styles.empty}>暂无审核任务</div>}
            </List>
          </PullRefresh>

          {renderReviewPopup()}
        </div>
      );
    };
  },
});
