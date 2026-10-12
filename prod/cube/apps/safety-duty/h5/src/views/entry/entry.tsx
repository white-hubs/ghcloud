import { showNotify } from "vant";
import { computed, defineComponent, onMounted, ref, type VNode } from "vue";

import { CubeNavBar, EntryMenu } from "@ghcloud/cube-app-generic-component";
import type { DutyAssignmentDetailVO } from "@ghcloud/cube-service-interface/safety-personnel";
import { getCurrentDutyAssignment } from "@ghcloud/cube-services-client/safety-personnel.client";

import { useAuthRequest } from "@/hooks/use-auth-request";
import { routes } from "@/router";
import { formatPercent, formatText, toPercentNumber } from "@/utils";

import styles from "./entry.module.less";

export const Entry = defineComponent({
  name: "Entry",
  setup: () => {
    const detail = ref<DutyAssignmentDetailVO>();
    document.title = "安全履职";

    const completionRate = computed(() => Math.max(0, Math.min(100, toPercentNumber(detail.value?.completionRate) ?? 0)));

    const loadSummary = async (): Promise<void> => {
      try {
        detail.value = await useAuthRequest(() => getCurrentDutyAssignment({ periodType: "MONTH" }));
      } catch (e) {
        const error = e as { message?: string; errorMessage?: string };
        showNotify({ type: "danger", message: error.errorMessage || error.message || "查询履职概况失败" });
        detail.value = undefined;
      }
    };

    onMounted(() => {
      void loadSummary();
    });

    return (): VNode => (
      <>
        <CubeNavBar showBack title="安全履职" />
        <main class={styles.page}>
          <EntryMenu applicationCode={__ENV__.applicationCode} routes={routes} title="业务操作" />
          <section class={styles.summary}>
            <div class={styles.summaryHeader}>
              <div>
                <div class={styles.summaryTitle}>本人本月履职概况</div>
                <div class={styles.summarySubTitle}>
                  {formatText(detail.value?.responsibleUserName)} · {formatText(detail.value?.roleName)}
                </div>
              </div>
              <strong>{formatPercent(detail.value?.completionRate)}</strong>
            </div>
            <div class={styles.progress}>
              <i style={{ width: `${completionRate.value}%` }} />
            </div>
            <div class={styles.stats}>
              <div class={styles.statCard}>
                <strong>{detail.value?.totalItemCount ?? 0}</strong>
                <span>本月清单项</span>
              </div>
              <div class={styles.statCard}>
                <strong class={styles.successText}>{detail.value?.completedItemCount ?? 0}</strong>
                <span>已完成</span>
              </div>
              <div class={styles.statCard}>
                <strong class={styles.warningText}>{detail.value?.pendingItemCount ?? 0}</strong>
                <span>待执行</span>
              </div>
              <div class={styles.statCard}>
                <strong class={styles.dangerText}>{detail.value?.overdueItemCount ?? 0}</strong>
                <span>已超期</span>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  },
});
