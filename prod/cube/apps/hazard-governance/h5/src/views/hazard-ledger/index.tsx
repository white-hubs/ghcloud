import { ActionSheet, Cell, CellGroup, Empty, List, PullRefresh, Tab, Tabs, showToast, type ActionSheetAction } from "vant";
import { defineComponent, onMounted, shallowRef, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { HazardMisreportReason, HazardSourceType } from "@ghcloud/cube-service-interface/hazard-governance";
import type { HazardLedgerRecordVO } from "@ghcloud/cube-service-interface/hazard-governance";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { markHazardMisreport } from "@ghcloud/cube-services-client/hazard-governance.client";

import { ConfirmHazardPopup } from "./confirm-hazard-popup";
import { renderHazardActions } from "./hazard-actions";
import { HazardDetailPopup } from "./hazard-detail-popup";
import { useHazardLedger } from "./use-hazard-ledger";
import { formatServiceDate, formatServiceSource, renderServiceLevelTag, renderServiceStatusTag } from "@/views/hazard-service-utils";

import styles from "./index.module.less";

type LedgerTab = "all" | "ai" | "manual";

const sourceTypeByTab: Record<LedgerTab, HazardSourceType | undefined> = {
  all: undefined,
  ai: HazardSourceType.AI_WARNING,
  manual: HazardSourceType.MANUAL,
};

type MisreportReasonAction = ActionSheetAction & {
  value: HazardMisreportReason;
};

const misreportReasonActions: MisreportReasonAction[] = [
  { name: "现场不存在隐患", value: HazardMisreportReason.NOT_HAZARD },
  { name: "重复上报", value: HazardMisreportReason.DUPLICATE_REPORT },
  { name: "风险对象错误", value: HazardMisreportReason.WRONG_OBJECT },
  { name: "测试数据", value: HazardMisreportReason.TEST_DATA },
  { name: "其他原因", value: HazardMisreportReason.OTHER },
];

export const HazardLedgerPage = defineComponent({
  name: "HazardLedgerPage",
  setup: () => {
    document.title = "隐患台账";
    const router = useRouter();
    const route = useRoute();
    const tab = shallowRef<LedgerTab>("all");
    const detail = shallowRef<HazardLedgerRecordVO | null>(null);
    const confirmTarget = shallowRef<HazardLedgerRecordVO | null>(null);
    const misreportTarget = shallowRef<HazardLedgerRecordVO | null>(null);
    const showConfirm = shallowRef(false);
    const showMisreport = shallowRef(false);
    const misreportSubmitting = shallowRef(false);
    const list = useHazardLedger(() => sourceTypeByTab[tab.value]);

    const handleTabChange = (value: string | number): void => {
      tab.value = String(value) as LedgerTab;
      list.reset();
      list.onLoad();
    };

    onMounted(() => {
      list.onLoad();
      const hazardId = route.query.hazardId;
      if (typeof hazardId === "string" && hazardId.trim()) {
        detail.value = { id: hazardId } as HazardLedgerRecordVO;
      }
    });

    const openDetail = (record: HazardLedgerRecordVO): void => {
      detail.value = record;
    };

    const openConfirm = (record: HazardLedgerRecordVO): void => {
      confirmTarget.value = record;
      showConfirm.value = true;
    };

    const openMisreport = (record: HazardLedgerRecordVO): void => {
      misreportTarget.value = record;
      showMisreport.value = true;
    };

    const submitMisreport = async (reason: HazardMisreportReason): Promise<void> => {
      const record = misreportTarget.value;
      if (!record || misreportSubmitting.value) {
        return;
      }
      misreportSubmitting.value = true;
      try {
        await useAuthRequest(() =>
          markHazardMisreport({
            hazardId: record.id,
            misreportReason: reason,
          }),
        );
        showToast("已标记为误报");
        showMisreport.value = false;
        misreportTarget.value = null;
        list.onRefresh();
      } catch (error) {
        showToast(error instanceof Error ? error.message : "误报提交失败，请稍后重试");
      } finally {
        misreportSubmitting.value = false;
      }
    };

    return (): VNode => (
      <>
        <CubeNavBar showBack title="隐患台账" />
        <div class={styles.container}>
          <Tabs v-model:active={tab.value} onChange={handleTabChange}>
            <Tab title="全部" name="all" />
            <Tab title="AI自动转入" name="ai" />
            <Tab title="人工排查转入" name="manual" />
          </Tabs>
          <div class={styles.summary}>共 {list.total.value} 条隐患</div>
          <PullRefresh v-model={list.refreshing.value} onRefresh={list.onRefresh} class={styles.listScroller}>
            <List
              v-model:loading={list.loading.value}
              v-model:error={list.error.value}
              finished={list.finished.value}
              error-text="请求失败，点击重新加载"
              finishedText={list.rows.value.length > 0 ? "暂无更多数据" : ""}
              immediateCheck={false}
              onLoad={list.onLoad}
            >
              {list.rows.value.map((item) => {
                const actionButtons = renderHazardActions(item, { router, openConfirm, openMisreport });
                const overdueText = item.overdue ? `已逾期${item.overdueHours ? ` ${item.overdueHours} 小时` : ""}` : "";
                return (
                  <CellGroup inset class={styles.card} key={item.id}>
                    <Cell class={styles.cardCell} clickable onClick={() => openDetail(item)}>
                      <div class={styles.titleRow}>
                        <span class={styles.id}>{item.code || item.id}</span>
                        <div class={styles.actions}>
                          {renderServiceStatusTag(item.governanceStatus)}
                          <span class={styles.source}>{formatServiceSource(item.sourceType)}</span>
                        </div>
                      </div>
                      <div class={styles.title}>{item.description || "暂无隐患描述"}</div>
                      <div class={styles.meta}>
                        {renderServiceLevelTag(item.level)}
                        <span>{formatServiceDate(item.reportedTime)}</span>
                      </div>
                      {overdueText || actionButtons ? (
                        <div class={styles.footerRow}>
                          {overdueText ? <span class={styles.overdue}>{overdueText}</span> : <span></span>}
                          {actionButtons ? <div class={styles.actionButtons}>{actionButtons}</div> : <div></div>}
                        </div>
                      ) : null}
                    </Cell>
                  </CellGroup>
                );
              })}
              {list.rows.value.length === 0 && list.finished.value ? <Empty description="暂无数据" /> : null}
            </List>
          </PullRefresh>
        </div>
        <HazardDetailPopup
          show={detail.value != null}
          record={detail.value}
          onUpdate:show={(show: boolean) => {
            if (!show) {
              detail.value = null;
            }
          }}
          onConfirm={(record: HazardLedgerRecordVO) => {
            detail.value = null;
            openConfirm(record);
          }}
          onMisreport={(record: HazardLedgerRecordVO) => {
            detail.value = null;
            openMisreport(record);
          }}
        />
        <ActionSheet
          show={showMisreport.value}
          actions={misreportReasonActions}
          title={`选择误报原因${misreportTarget.value?.code ? ` - ${misreportTarget.value.code}` : ""}`}
          cancelText="取消"
          closeOnClickAction={false}
          closeOnClickOverlay={!misreportSubmitting.value}
          onUpdate:show={(show: boolean) => {
            if (!show && !misreportSubmitting.value) {
              showMisreport.value = false;
              misreportTarget.value = null;
            }
          }}
          onCancel={() => {
            if (!misreportSubmitting.value) {
              showMisreport.value = false;
              misreportTarget.value = null;
            }
          }}
          onSelect={(action: MisreportReasonAction) => {
            void submitMisreport(action.value);
          }}
        />
        <ConfirmHazardPopup
          v-model:show={showConfirm.value}
          record={confirmTarget.value}
          onConfirmed={() => {
            confirmTarget.value = null;
            list.onRefresh();
          }}
        />
      </>
    );
  },
});
