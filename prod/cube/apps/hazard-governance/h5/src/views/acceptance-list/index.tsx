import { Button, Cell, CellGroup, Empty, List, PullRefresh, Tag } from "vant";
import { defineComponent, onMounted, type VNode } from "vue";
import { useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { HazardActionCode } from "@ghcloud/cube-service-interface/hazard-governance";
import type { HazardAcceptanceTaskPageVO } from "@ghcloud/cube-service-interface/hazard-governance";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { pageHazardAcceptanceTasks } from "@ghcloud/cube-services-client/hazard-governance.client";

import { usePagedList } from "@/hooks/use-paged-list";
import { normalizeHazardAction } from "@/views/hazard-ledger/hazard-actions";
import { formatDeadlineHint, formatServiceDate, renderServiceLevelTag } from "@/views/hazard-service-utils";

import styles from "./index.module.less";

export const AcceptanceListPage = defineComponent({
  name: "AcceptanceListPage",
  setup: () => {
    document.title = "验收列表";
    const router = useRouter();
    const list = usePagedList<HazardAcceptanceTaskPageVO>((pageNumber, pageSize) =>
      useAuthRequest(() => pageHazardAcceptanceTasks({ pageNumber, pageSize, ownOnly: false })),
    );

    const canAccept = (item: HazardAcceptanceTaskPageVO): boolean =>
      (item.actions ?? []).some((action) => normalizeHazardAction(action) === HazardActionCode.ACCEPTANCE);

    onMounted(list.onLoad);

    const openDetail = (item: HazardAcceptanceTaskPageVO): void => {
      void router.push({
        name: "acceptance-detail",
        query: {
          id: item.id,
          code: item.code,
          description: item.description,
          level: item.level,
          responsibleUserId: item.responsibleUserId,
          responsibleUserName: item.responsibleUserName,
          acceptanceUserId: item.acceptanceUserId,
          acceptanceUserName: item.acceptanceUserName,
          submittedTime: item.submittedTime,
          deadline: item.deadline,
        },
      });
    };

    return (): VNode => (
      <>
        <CubeNavBar showBack title="验收列表" />
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
              <div class={styles.summary}>共 {list.total.value} 条待验收隐患</div>
              {list.rows.value.map((item) => (
                <CellGroup inset class={styles.card} key={item.id}>
                  <Cell class={styles.cardCell} clickable onClick={() => openDetail(item)}>
                    <div class={styles.titleRow}>
                      <span class={styles.id}>{item.code ?? item.id}</span>
                      {item.overdue ? <Tag type="danger">{formatDeadlineHint(true, item.overdueHours)}</Tag> : null}
                    </div>
                    <div class={styles.title}>{item.description || "暂无隐患描述"}</div>
                    <div class={styles.meta}>
                      {renderServiceLevelTag(item.level)}
                      <span class={styles.metaText}>整改责任人：{item.responsibleUserName || item.responsibleUserId || "-"}</span>
                    </div>
                    <div class={styles.timeMeta}>
                      <span class={styles.submittedTime}>提交：{formatServiceDate(item.submittedTime)}</span>
                      <span class={styles.metaText}>验收人：{item.acceptanceUserName || item.acceptanceUserId || "-"}</span>
                    </div>
                    {canAccept(item) ? (
                      <div class={styles.actions}>
                        <Button
                          class={styles.acceptButton}
                          size="small"
                          type="primary"
                          onClick={(event: MouseEvent) => {
                            event.stopPropagation();
                            openDetail(item);
                          }}
                        >
                          验收
                        </Button>
                      </div>
                    ) : null}
                  </Cell>
                </CellGroup>
              ))}
              {list.rows.value.length === 0 && list.finished.value ? <Empty description="暂无验收任务" /> : null}
            </List>
          </PullRefresh>
        </div>
      </>
    );
  },
});
