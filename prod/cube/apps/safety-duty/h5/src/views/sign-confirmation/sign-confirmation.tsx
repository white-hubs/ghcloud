import { Button, Checkbox, Empty, Popup, showNotify } from "vant";
import { computed, defineComponent, onMounted, ref, type VNode } from "vue";
import { useRouter } from "vue-router";

import type { DutyId, DutySignaturePreviewAssignmentVO, DutySignaturePreviewVO } from "@ghcloud/cube-service-interface/safety-personnel";
import { getDutySignPreview, signDutyAssignment } from "@ghcloud/cube-services-client/safety-personnel.client";

import { Bar } from "@/components/bar/bar";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { formatText, periodLabel } from "@/utils";

import styles from "./sign-confirmation.module.less";

const periodShortLabel = (periodType?: string): string => {
  const map: Record<string, string> = { MONTH: "月", QUARTER: "季", YEAR: "年", WEEK: "周", DAY: "日" };
  return periodType ? (map[periodType] ?? periodType) : "--";
};

const assignmentItemCount = (assignment: DutySignaturePreviewAssignmentVO): number =>
  (assignment.groups ?? []).reduce((sum, group) => sum + (group.itemCount ?? group.items?.length ?? 0), 0);

const isValidDutyId = (id: unknown): id is DutyId =>
  (typeof id === "number" && Number.isFinite(id)) || (typeof id === "string" && id.trim().length > 0);

export const SignConfirmationPage = defineComponent({
  name: "SignConfirmationPage",
  setup: () => {
    const router = useRouter();
    const preview = ref<DutySignaturePreviewVO>();
    const loading = ref(false);
    const submitting = ref(false);
    const checked = ref(false);
    const confirmOpen = ref(false);

    const assignments = computed(() => preview.value?.assignments ?? []);
    const assignmentIds = computed<DutyId[]>(() => {
      const ids = preview.value?.assignmentIds?.filter(isValidDutyId) ?? [];
      return ids.length > 0 ? ids : assignments.value.map((item) => item.assignmentId).filter(isValidDutyId);
    });
    const totalItemCount = computed(() => assignments.value.reduce((sum, item) => sum + assignmentItemCount(item), 0));
    const canSign = computed(() => checked.value && assignmentIds.value.length > 0 && !preview.value?.alreadySigned);

    const loadPreview = async (): Promise<void> => {
      loading.value = true;
      try {
        preview.value = await useAuthRequest(() => getDutySignPreview());
        checked.value = Boolean(preview.value.alreadySigned);
      } catch (e) {
        const error = e as { message?: string; errorMessage?: string };
        showNotify({ type: "danger", message: error.errorMessage || error.message || "查询签收确认失败" });
        preview.value = undefined;
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      void loadPreview();
    });

    const submitSign = async (): Promise<void> => {
      if (!canSign.value) {
        return;
      }
      submitting.value = true;
      try {
        await useAuthRequest(() => signDutyAssignment({ assignmentIds: assignmentIds.value, confirmed: true }));
        showNotify({ type: "success", message: "签收成功，记录已生成" });
        confirmOpen.value = false;
        void router.push({ name: "myAssignment" });
      } catch (e) {
        const error = e as { message?: string; errorMessage?: string };
        showNotify({ type: "danger", message: error.errorMessage || error.message || "签收失败" });
      } finally {
        submitting.value = false;
      }
    };

    const renderAssignment = (assignment: DutySignaturePreviewAssignmentVO): VNode => (
      <section class={styles.assignment} key={assignment.assignmentId ?? `${assignment.roleName}-${assignment.periodType}`}>
        <div class={styles.assignmentTitle}>
          <span>
            {formatText(assignment.roleName)} · 责任清单（{assignmentItemCount(assignment)}项）
          </span>
          {assignment.signPromptTime ? <span>{formatText(assignment.signPromptTime)}</span> : null}
        </div>
        {(assignment.groups ?? []).map((group) => (
          <div class={styles.periodGroup} key={`${assignment.assignmentId}-${group.periodType}`}>
            <div class={[styles.periodTitle, styles[`periodTitle${group.periodType || "Default"}`]]}>
              <span>
                {periodLabel(group.periodType)}任务（{group.itemCount ?? group.items?.length ?? 0}项）
              </span>
            </div>
            <div class={styles.taskList}>
              {(group.items ?? []).map((item) => (
                <div class={[styles.taskItem, item.mandatory ? styles.mandatory : ""]} key={`${item.clauseNo}-${item.taskDescription}`}>
                  <div class={styles.taskName}>
                    <span>{formatText(item.taskDescription)}</span>
                    {item.mandatory ? <span class={styles.mandatoryTag}>强制</span> : null}
                  </div>
                  <div class={styles.periodMark}>{periodShortLabel(item.periodType || group.periodType)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    );

    return (): VNode => (
      <div class={styles.page}>
        <Bar name="签收确认" isShowRight={false} />
        <main class={styles.content}>
          {assignments.value.length === 0 && !loading.value ? (
            <Empty description={preview.value?.alreadySigned ? "当前清单已签收" : "暂无待签收责任清单"} />
          ) : null}
          {assignments.value.map(renderAssignment)}
          <label class={styles.statement}>
            <Checkbox v-model={checked.value} disabled={preview.value?.alreadySigned || assignments.value.length === 0} iconSize="18px" />
            <span>我已详细阅读并理解以上责任清单的全部内容，确认本人将按照法规要求和执行周期履行职责。</span>
          </label>
        </main>
        <footer class={styles.footer}>
          <Button
            type="primary"
            block
            disabled={!canSign.value}
            loading={submitting.value}
            onClick={() => {
              confirmOpen.value = true;
            }}
          >
            {preview.value?.alreadySigned ? "已签收" : `确认签收${totalItemCount.value ? `（${totalItemCount.value}项）` : ""}`}
          </Button>
        </footer>
        <Popup v-model:show={confirmOpen.value} position="bottom" round>
          <div class={styles.confirmPanel}>
            <div class={styles.confirmHandle} />
            <div class={styles.confirmTitle}>确认签收</div>
            <div class={styles.confirmText}>签收后将生成不可删除的签收记录（含时间戳和操作人信息），确认签收？</div>
            <div class={styles.confirmActions}>
              <Button
                block
                onClick={() => {
                  confirmOpen.value = false;
                }}
              >
                取消
              </Button>
              <Button type="primary" block loading={submitting.value} onClick={() => void submitSign()}>
                确认签收
              </Button>
            </div>
          </div>
        </Popup>
      </div>
    );
  },
});
