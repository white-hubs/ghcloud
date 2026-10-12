import { Button, Cell, CellGroup, Empty, List, PullRefresh, Tag } from "vant";
import { defineComponent, onMounted, type VNode } from "vue";
import { useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { HazardActionCode } from "@ghcloud/cube-service-interface/hazard-governance";
import type { HazardApprovalTaskPageVO } from "@ghcloud/cube-service-interface/hazard-governance";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { pageHazardApprovalTasks } from "@ghcloud/cube-services-client/hazard-governance.client";

import { usePagedList } from "@/hooks/use-paged-list";
import { normalizeHazardAction } from "@/views/hazard-ledger/hazard-actions";
import { formatDeadlineHint, formatServiceDate, renderServiceLevelTag } from "@/views/hazard-service-utils";

import styles from "./index.module.less";

export const ApprovalListPage = defineComponent({
  name: "ApprovalListPage",
  setup: () => {
    document.title = "审批列表";
    const router = useRouter();
    const list = usePagedList<HazardApprovalTaskPageVO>((pageNumber, pageSize) =>
      useAuthRequest(() => pageHazardApprovalTasks({ pageNumber, pageSize, ownOnly: true })),
    );

    const canApprove = (item: HazardApprovalTaskPageVO): boolean =>
      (item.actions ?? []).some((action) => normalizeHazardAction(action) === HazardActionCode.APPROVAL);

    onMounted(list.onLoad);

    const openDetail = (item: HazardApprovalTaskPageVO): void => {
      void router.push({
        name: "approval-detail",
        query: {
          id: item.hazardId,
          hazardId: item.hazardId,
          approvalTaskId: item.approvalTaskId,
          code: item.code,
          description: item.description,
          level: item.level,
          submittedName: item.submittedByName ?? item.submittedName ?? item.submittedBy,
          submittedTime: item.submittedTime,
          deadline: item.deadline,
        },
      });
    };

    return (): VNode => (
      <>
        <CubeNavBar showBack title="审批列表" />
        <div class={styles.container}>
          <PullRefresh v-model={list.refreshing.value} onRefresh={list.onRefresh}>
            <List
              v-model:loading={list.loading.value}
              v-model:error={list.error.value}
              error-text="加载失败，点击重试"
              finished={list.finished.value}
              finishedText={list.rows.value.length > 0 ? "暂无更多数据" : ""}
              immediateCheck={false}
              onLoad={list.onLoad}
            >
              <div class={styles.summary}>共 {list.total.value} 条待审批任务</div>
              {list.rows.value.map((item) => (
                <CellGroup inset class={styles.card} key={item.approvalTaskId}>
                  <Cell class={styles.cardCell} clickable onClick={() => openDetail(item)}>
                    <div class={styles.titleRow}>
                      <span class={styles.id}>{item.code ?? item.hazardId ?? item.approvalTaskId}</span>
                      {renderServiceLevelTag(item.level)}
                    </div>
                    <div class={styles.title}>{item.description || "暂无隐患描述"}</div>
                    <div class={styles.desc}>提交人：{item.submittedByName || item.submittedName || item.submittedBy || "-"}</div>
                    <div class={styles.desc}>提交时间：{formatServiceDate(item.submittedTime)}</div>
                    <div class={styles.meta}>
                      {item.overdue ? (
                        <Tag type="danger">{formatDeadlineHint(true, item.overdueHours)}</Tag>
                      ) : (
                        <span>截止：{formatServiceDate(item.deadline)}</span>
                      )}
                      {canApprove(item) ? (
                        <Button
                          size="small"
                          type="primary"
                          onClick={(event: MouseEvent) => {
                            event.stopPropagation();
                            openDetail(item);
                          }}
                        >
                          审批
                        </Button>
                      ) : null}
                    </div>
                  </Cell>
                </CellGroup>
              ))}
              {list.rows.value.length === 0 && list.finished.value ? <Empty description="暂无审批任务" /> : null}
            </List>
          </PullRefresh>
        </div>
      </>
    );
  },
});
