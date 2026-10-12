import { Empty, Tag, showToast } from "vant";
import { defineComponent, ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { SafetyCreditCheckExecutionVO, SafetyCreditChecklistVO } from "@ghcloud/cube-safety-credit-service";

import { CheckItemList } from "../components/check-item-list";
import { executionTitle, isSameChecklist, normalizeChecklistItem, normalizeExecutionItem, type CheckItemState } from "../shared";
import { cubeSafetyCreditService } from "@/api/server";
import {
  checkExecutionStatusLabel,
  checkExecutionStatusTone,
  qualityReviewResultLabel,
  qualityStatusLabel,
  qualityStatusTone,
} from "@/constants/safety-credit-enums";
import { displayText, formatDateTime } from "@/utils/format";
import { readQueryText } from "@/utils/route-query";

import "../check-execution.less";

export const CheckExecutionDetail = defineComponent({
  name: "CheckExecutionDetail",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const detailLoading = shallowRef(false);
    const selectedChecklist = ref<SafetyCreditChecklistVO | null>(null);
    const selectedExecution = ref<SafetyCreditCheckExecutionVO | null>(null);
    const items = ref<CheckItemState[]>([]);

    function showList(): void {
      void router.replace({ name: "CheckExecutionList" });
    }

    function applyChecklistDetail(detail: SafetyCreditChecklistVO): void {
      selectedChecklist.value = detail;
      selectedExecution.value = null;
      items.value = (detail.items ?? []).map(normalizeChecklistItem);
    }

    function applyExecutionDetail(detail: SafetyCreditCheckExecutionVO | null): void {
      selectedExecution.value = detail;
      items.value = (detail?.items ?? []).map(normalizeExecutionItem);
    }

    async function loadDetail(): Promise<void> {
      const executionIdValue = readQueryText(route.query.executionId, "executionId");
      const checklistIdValue = readQueryText(route.query.checklistId, "checklistId");
      detailLoading.value = true;
      selectedChecklist.value = null;
      applyExecutionDetail(null);
      try {
        if (executionIdValue !== undefined) {
          const detail = await cubeSafetyCreditService.getCheckExecution(executionIdValue);
          applyExecutionDetail(detail);
          return;
        }
        if (checklistIdValue === undefined) {
          showToast("缺少自查清单参数");
          return;
        }
        const checklist = await cubeSafetyCreditService.getChecklist(checklistIdValue);
        applyChecklistDetail(checklist);
        if (checklist.executionId !== undefined) {
          const detail = await cubeSafetyCreditService.getCheckExecution(checklist.executionId);
          applyExecutionDetail(detail);
          return;
        }
        if (checklist.merchantId !== undefined) {
          try {
            const current = await cubeSafetyCreditService.getCurrentCheckExecution(checklist.merchantId);
            if (isSameChecklist(current, checklist)) {
              applyExecutionDetail(current);
            }
          } catch {
            // 只读详情可以降级展示清单内容。
          }
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "自查详情加载失败");
      } finally {
        detailLoading.value = false;
      }
    }

    watch(
      () => [route.query.checklistId, route.query.executionId],
      () => {
        void loadDetail();
      },
      { immediate: true },
    );

    function renderBasicInfo(execution: SafetyCreditCheckExecutionVO): JSX.Element {
      const cells = [
        { label: "商户", value: displayText(execution.merchantName) },
        { label: "清单", value: displayText(execution.checkName) },
        { label: "周期开始", value: formatDateTime(execution.cycleBegin) },
        { label: "周期结束", value: formatDateTime(execution.cycleEnd) },
        { label: "执行状态", value: checkExecutionStatusLabel(execution.status), tone: checkExecutionStatusTone(execution.status) },
        { label: "提交时间", value: formatDateTime(execution.submitTime) },
        { label: "最终质检", value: qualityStatusLabel(execution.qualityStatus), tone: qualityStatusTone(execution.qualityStatus) },
        { label: "复核结果", value: qualityReviewResultLabel(execution.reviewResult) },
        { label: "复核时间", value: formatDateTime(execution.reviewTime) },
        { label: "复核意见", value: displayText(execution.reviewOpinion) },
      ];
      return (
        <section class="check-detail-info">
          <h3>基本信息</h3>
          <div class="check-detail-info-grid">
            {cells.map((cell) => (
              <div class="check-detail-info-item" key={cell.label}>
                <span>{cell.label}</span>
                {cell.tone === undefined ? <strong>{cell.value}</strong> : <Tag type={cell.tone}>{cell.value}</Tag>}
              </div>
            ))}
          </div>
        </section>
      );
    }

    return (): JSX.Element => {
      const execution = selectedExecution.value;
      const checklist = selectedChecklist.value;
      const hasDetail = execution !== null || checklist !== null;
      return (
        <main class="check-execution-page">
          <CubeNavBar showBack onlyBack title={executionTitle(execution ?? checklist)} onClickLeft={showList} />
          {detailLoading.value ? <section class="check-empty">正在加载...</section> : null}
          {execution !== null && !detailLoading.value ? (
            <>
              {renderBasicInfo(execution)}
              <section class="check-detail-section-title">
                <h3>检查项</h3>
                <span>共 {items.value.length} 项</span>
              </section>
              <CheckItemList
                items={items.value}
                readonly
                editingReady={false}
                showEditControls={false}
                photoUploading={false}
                onUpdateChecked={() => {}}
                onUpdateRemark={() => {}}
                onUploadPhotos={() => {}}
                onRemovePhoto={() => {}}
              />
            </>
          ) : null}
          {execution === null && checklist !== null && !detailLoading.value ? (
            <section class="check-empty">
              <Empty description="暂无执行详情" />
            </section>
          ) : null}
          {!hasDetail && !detailLoading.value ? (
            <section class="check-empty">
              <Empty description="暂无自查详情" />
            </section>
          ) : null}
        </main>
      );
    };
  },
});
