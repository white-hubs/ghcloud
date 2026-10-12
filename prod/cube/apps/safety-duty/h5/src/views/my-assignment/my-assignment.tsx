import { Button, Empty, Field, Popup, Tab, Tabs, showNotify } from "vant";
import { computed, defineComponent, onMounted, ref, type VNode } from "vue";

import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import type {
  DutyAssignmentDetailVO,
  DutyAssignmentItemGroupVO,
  DutyAssignmentItemVO,
  DutyId,
  DutyRecordSummaryVO,
} from "@ghcloud/cube-service-interface/safety-personnel";
import {
  createDutyManualRecord,
  getCurrentDutyAssignment,
  listCurrentDutyAssignmentItemRecords,
} from "@ghcloud/cube-services-client/safety-personnel.client";

import { Bar } from "@/components/bar/bar";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { formatPercent, formatText, periodLabel, statusTag } from "@/utils";

import styles from "./my-assignment.module.less";

const periodOptions = [
  { value: "MONTH", label: "月度" },
  { value: "QUARTER", label: "季度" },
  { value: "YEAR", label: "年度" },
];

const statusOptions = [
  { value: "", label: "全部" },
  { value: "PENDING", label: "待执行" },
  { value: "COMPLETED", label: "已完成" },
  { value: "OVERDUE", label: "超期" },
];

const DUTY_RECORD_ATTACHMENT_SCENE_CODE = "SAFETY_PERSONNEL::DUTY_RECORD_ATTACHMENT";

type ManualFileItem = {
  id?: DutyId;
  name?: string;
  path?: string;
};

const groupKey = (group: DutyAssignmentItemGroupVO): string =>
  `${group.periodType ?? ""}-${group.periodStartTime ?? ""}-${group.periodEndTime ?? ""}`;

const groupTitle = (group: DutyAssignmentItemGroupVO): string => {
  const start = String(group.periodStartTime ?? "");
  const match = start.match(/^(\d{4})-(\d{2})-/);
  if (group.periodType === "MONTH" && match) {
    return `月度任务（${Number(match[2])}月）`;
  }
  if (group.periodType === "QUARTER" && match) {
    return `季度任务（Q${Math.floor((Number(match[2]) - 1) / 3) + 1}）`;
  }
  if (group.periodType === "YEAR" && match) {
    return `年度任务（${match[1]}）`;
  }
  return `${periodLabel(group.periodType)}任务`;
};

export const MyAssignmentPage = defineComponent({
  name: "MyAssignmentPage",
  setup: () => {
    const periodType = ref("MONTH");
    const statusFilter = ref("");
    const detail = ref<DutyAssignmentDetailVO>();
    const loading = ref(false);
    const recordsOpen = ref(false);
    const records = ref<DutyRecordSummaryVO[]>([]);
    const manualOpen = ref(false);
    const manualItemId = ref<DutyId>();
    const manualText = ref("");
    const manualFiles = ref<ManualFileItem[]>([]);
    const manualUploading = ref(false);
    const manualSubmitting = ref(false);

    const loadDetail = async (): Promise<void> => {
      loading.value = true;
      try {
        detail.value = await useAuthRequest(() => getCurrentDutyAssignment({ periodType: periodType.value }));
      } catch (e) {
        const error = e as { message?: string; errorMessage?: string };
        showNotify({ type: "danger", message: error.errorMessage || error.message || "查询责任清单失败" });
        detail.value = undefined;
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      void loadDetail();
    });

    const filteredGroups = computed(() =>
      (detail.value?.groups ?? [])
        .map((group) => {
          const items = (group.items ?? []).filter((item) => !statusFilter.value || item.status === statusFilter.value);
          return {
            ...group,
            items,
            itemCount: items.length,
            completedItemCount: items.filter((item) => item.status === "COMPLETED").length,
          };
        })
        .filter((group) => (group.items ?? []).length > 0),
    );

    const filteredItemCount = computed(() => filteredGroups.value.reduce((sum, group) => sum + (group.items ?? []).length, 0));

    const openRecords = async (item: DutyAssignmentItemVO): Promise<void> => {
      if (!item.assignmentItemId) {
        showNotify({ type: "warning", message: "清单项信息缺失，无法查看记录" });
        return;
      }
      try {
        records.value = await useAuthRequest(() => listCurrentDutyAssignmentItemRecords(item.assignmentItemId));
        recordsOpen.value = true;
      } catch (e) {
        const error = e as { message?: string; errorMessage?: string };
        showNotify({ type: "danger", message: error.errorMessage || error.message || "查询记录失败" });
      }
    };

    const openManual = (item: DutyAssignmentItemVO): void => {
      if (!item.assignmentItemId) {
        showNotify({ type: "warning", message: "清单项信息缺失，无法填报" });
        return;
      }
      if (item.manualFillAllowed === false || item.status === "OVERDUE") {
        showNotify({ type: "warning", message: "清单项已超期，不允许补充填报" });
        return;
      }
      manualItemId.value = item.assignmentItemId;
      manualText.value = "";
      manualFiles.value = [];
      manualOpen.value = true;
    };

    const uploadManualAttachments = async (): Promise<void> => {
      const remainingCount = 9 - manualFiles.value.length;
      if (remainingCount <= 0) {
        showNotify({ type: "warning", message: "最多上传 9 个附件" });
        return;
      }
      manualUploading.value = true;
      try {
        const result = await cubeAppService.uploadFile(String(remainingCount), {
          sceneCode: DUTY_RECORD_ATTACHMENT_SCENE_CODE,
        });
        const nextFiles = result.map((file) => ({
          id: file.id,
          name: file.name || file.path || "附件",
          path: file.path,
        }));
        manualFiles.value = [...manualFiles.value, ...nextFiles];
      } catch (e) {
        const error = e as { message?: string; errorMessage?: string };
        showNotify({ type: "danger", message: error.errorMessage || error.message || "附件上传失败" });
      } finally {
        manualUploading.value = false;
      }
    };

    const removeManualFile = (id?: DutyId): void => {
      manualFiles.value = manualFiles.value.filter((file) => file.id !== id);
    };

    const submitManual = async (): Promise<void> => {
      if (!manualItemId.value) {
        showNotify({ type: "warning", message: "清单项信息缺失，无法提交" });
        return;
      }
      if (!manualText.value.trim()) {
        showNotify({ type: "warning", message: "请填写履职说明" });
        return;
      }
      if (manualUploading.value) {
        showNotify({ type: "warning", message: "附件上传中，请稍后提交" });
        return;
      }
      manualSubmitting.value = true;
      try {
        await useAuthRequest(() =>
          createDutyManualRecord({
            assignmentItemId: manualItemId.value,
            executionDescription: manualText.value.trim(),
            fileIds: manualFiles.value.map((file) => file.id).filter((id): id is DutyId => Boolean(id)),
          }),
        );
        showNotify({ type: "success", message: "已提交" });
        manualOpen.value = false;
        void loadDetail();
      } catch (e) {
        const error = e as { message?: string; errorMessage?: string };
        showNotify({ type: "danger", message: error.errorMessage || error.message || "提交失败" });
      } finally {
        manualSubmitting.value = false;
      }
    };

    return (): VNode => (
      <div class={styles.page}>
        <Bar name="我的责任清单" isShowRight={false} />
        <Tabs v-model:active={periodType.value} onChange={() => void loadDetail()}>
          {periodOptions.map((item) => (
            <Tab title={item.label} name={item.value} key={item.value} />
          ))}
        </Tabs>
        <div class={styles.content}>
          {!detail.value && !loading.value ? <Empty description="暂无责任清单" /> : null}
          {detail.value ? (
            <>
              <div class={styles.summary}>
                <div class={styles.card}>
                  <div class={styles.label}>责任人</div>
                  <div class={styles.value}>{formatText(detail.value.responsibleUserName)}</div>
                </div>
                <div class={styles.card}>
                  <div class={styles.label}>完成率</div>
                  <div class={styles.value}>{formatPercent(detail.value.completionRate)}</div>
                </div>
                <div class={styles.card}>
                  <div class={styles.label}>完成项</div>
                  <div class={styles.value}>
                    {detail.value.completedItemCount ?? 0}/{detail.value.totalItemCount ?? 0}
                  </div>
                </div>
                <div class={styles.card}>
                  <div class={styles.label}>超期项</div>
                  <div class={styles.value}>{detail.value.overdueItemCount ?? 0}</div>
                </div>
              </div>
              <div class={styles.statusFilters}>
                {statusOptions.map((item) => (
                  <button
                    type="button"
                    key={item.value || "ALL"}
                    class={[styles.statusChip, statusFilter.value === item.value ? styles.statusChipActive : ""]}
                    onClick={() => (statusFilter.value = item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {filteredItemCount.value === 0 ? <Empty description="暂无匹配任务" /> : null}
              {filteredGroups.value.map((group) => (
                <div class={styles.group} key={groupKey(group)}>
                  <div class={styles.groupTitle}>
                    <span>{groupTitle(group)}</span>
                    <span>
                      {group.itemCount ?? (group.items ?? []).length} 项 · 完成 {group.completedItemCount ?? 0} 项
                    </span>
                  </div>
                  {(group.items ?? []).map((item) => (
                    <div class={styles.item} key={item.assignmentItemId}>
                      <div class={styles.itemTitle}>
                        <span>{formatText(item.taskDescription)}</span>
                        {statusTag(item.status)}
                      </div>
                      <div class={styles.meta}>
                        {formatText(item.lawNameLabel)} · {formatText(item.clauseNo)}
                      </div>
                      <div class={styles.meta}>
                        截止时间：{formatText(item.deadlineTime)} · 记录 {item.recordCount ?? 0} 条
                      </div>
                      <div class={styles.actions}>
                        <Button size="small" onClick={() => void openRecords(item)}>
                          查看记录
                        </Button>
                        <Button
                          size="small"
                          type="primary"
                          disabled={item.manualFillAllowed === false || item.status === "OVERDUE"}
                          onClick={() => openManual(item)}
                        >
                          补充填报
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          ) : null}
        </div>
        <Popup v-model:show={recordsOpen.value} position="bottom" round style={{ maxHeight: "80%" }}>
          <div class={styles.popupBody}>
            {records.value.length === 0 ? (
              <Empty description="暂无记录" />
            ) : (
              records.value.map((record) => (
                <div class={styles.record} key={record.recordId}>
                  <div class={styles.itemTitle}>
                    <span>{formatText(record.title)}</span>
                    <span>{formatText(record.sourceTypeLabel || record.sourceType)}</span>
                  </div>
                  <div class={styles.meta}>{formatText(record.summary)}</div>
                  <div class={styles.meta}>
                    {formatText(record.sourceApplicationName)} · {formatText(record.occurredTime)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Popup>
        <Popup v-model:show={manualOpen.value} position="bottom" round style={{ height: "70%" }}>
          <div class={styles.popupBody}>
            <Field
              v-model={manualText.value}
              rows={5}
              autosize
              type="textarea"
              maxlength={500}
              placeholder="请输入履职说明"
              show-word-limit
            />
            <div class={styles.manualUpload}>
              <div class={styles.manualUploadHeader}>
                <span class={styles.manualUploadTitle}>附件</span>
                <Button size="small" type="primary" plain loading={manualUploading.value} onClick={() => void uploadManualAttachments()}>
                  上传附件
                </Button>
              </div>
              {manualFiles.value.length > 0 ? (
                <div class={styles.manualFileList}>
                  {manualFiles.value.map((file) => (
                    <div class={styles.manualFileItem} key={String(file.id ?? file.path)}>
                      <span>{formatText(file.name || file.path)}</span>
                      <button type="button" onClick={() => removeManualFile(file.id)}>
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              <div class={styles.manualUploadHint}>支持上传图片或文件，提交后作为履职佐证</div>
            </div>
            <Button type="primary" block loading={manualSubmitting.value} style={{ marginTop: "12px" }} onClick={() => void submitManual()}>
              提交
            </Button>
          </div>
        </Popup>
      </div>
    );
  },
});
