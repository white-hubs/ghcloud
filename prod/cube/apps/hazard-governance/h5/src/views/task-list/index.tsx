import { Button, Cell, CellGroup, Empty, List, PullRefresh, Tab, Tabs } from "vant";
import { defineComponent, onMounted, shallowRef, type VNode } from "vue";
import { useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { HazardActionCode, HazardGovernanceStatus } from "@ghcloud/cube-service-interface/hazard-governance";
import type { HazardLedgerRecordVO, HazardRectificationTaskVO } from "@ghcloud/cube-service-interface/hazard-governance";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { pageHazardRectificationTasks } from "@ghcloud/cube-services-client/hazard-governance.client";

import { usePagedList } from "@/hooks/use-paged-list";
import { normalizeHazardAction } from "@/views/hazard-ledger/hazard-actions";
import { HazardDetailPopup } from "@/views/hazard-ledger/hazard-detail-popup";
import { formatDeadlineHint, formatServiceDate, renderServiceLevelTag, renderServiceStatusTag } from "@/views/hazard-service-utils";

import styles from "./index.module.less";

type TaskTab = "all" | HazardGovernanceStatus;

const tabs: Array<{ name: TaskTab; title: string }> = [
  { name: "all", title: "全部" },
  { name: HazardGovernanceStatus.PENDING_PLAN, title: "待填写" },
  { name: HazardGovernanceStatus.PENDING_APPROVAL, title: "待审批" },
  { name: HazardGovernanceStatus.RECTIFYING, title: "整改中" },
  { name: HazardGovernanceStatus.PENDING_ACCEPTANCE, title: "待验收" },
  { name: HazardGovernanceStatus.ACCEPTANCE_COMPLETED, title: "已闭环" },
];

export const TaskListPage = defineComponent({
  name: "TaskListPage",
  setup: () => {
    document.title = "任务列表";
    const router = useRouter();
    const tab = shallowRef<TaskTab>("all");
    const detail = shallowRef<HazardLedgerRecordVO | null>(null);
    const list = usePagedList<HazardRectificationTaskVO>((pageNumber, pageSize) =>
      useAuthRequest(() =>
        pageHazardRectificationTasks({
          pageNumber,
          pageSize,
          ownOnly: true,
          overdueFirst: true,
          ...(tab.value === "all" ? {} : { governanceStatus: tab.value }),
        }),
      ),
    );

    const openForm = (mode: "plan" | "execute", item: HazardRectificationTaskVO): void => {
      void router.push({
        name: "rectification-form",
        query: {
          mode,
          id: String(item.id),
          code: item.code,
          description: item.description,
          level: item.level,
          locationName: item.locationName,
          deadline: item.deadline,
          governanceStatus: item.governanceStatus,
        },
      });
    };

    const openAcceptance = (item: HazardRectificationTaskVO): void => {
      void router.push({
        name: "acceptance-detail",
        query: {
          id: String(item.id),
          code: item.code,
          description: item.description,
          level: item.level,
          locationName: item.locationName,
          deadline: item.deadline,
          governanceStatus: item.governanceStatus,
        },
      });
    };

    const openDetail = (item: HazardRectificationTaskVO): void => {
      detail.value = {
        ...item,
        id: String(item.id),
      };
    };

    const renderActions = (item: HazardRectificationTaskVO): JSX.Element | null => {
      const actions = new Set((item.actions ?? []).map(normalizeHazardAction));
      if (
        !actions.has(HazardActionCode.FILL_PLAN) &&
        !actions.has(HazardActionCode.UPDATE_PROGRESS) &&
        !actions.has(HazardActionCode.ACCEPTANCE)
      )
        return null;
      return (
        <div class={styles.actions}>
          {actions.has(HazardActionCode.FILL_PLAN) ? (
            <Button
              size="small"
              type="primary"
              onClick={(event: MouseEvent) => {
                event.stopPropagation();
                openForm("plan", item);
              }}
            >
              填写方案
            </Button>
          ) : null}
          {actions.has(HazardActionCode.UPDATE_PROGRESS) ? (
            <Button
              size="small"
              type="primary"
              onClick={(event: MouseEvent) => {
                event.stopPropagation();
                openForm("execute", item);
              }}
            >
              更新进度
            </Button>
          ) : null}
          {actions.has(HazardActionCode.ACCEPTANCE) ? (
            <Button
              size="small"
              type="primary"
              onClick={(event: MouseEvent) => {
                event.stopPropagation();
                openAcceptance(item);
              }}
            >
              验收
            </Button>
          ) : null}
        </div>
      );
    };

    const handleTabChange = (value: string | number): void => {
      tab.value = String(value) as TaskTab;
      list.reset();
      list.onLoad();
    };

    onMounted(list.onLoad);

    return (): VNode => (
      <>
        <CubeNavBar showBack title="任务列表" />
        <div class={styles.container}>
          <Tabs v-model:active={tab.value} shrink onChange={handleTabChange}>
            {tabs.map((item) => (
              <Tab key={item.name} title={item.title} name={item.name} />
            ))}
          </Tabs>
          <PullRefresh v-model={list.refreshing.value} onRefresh={list.onRefresh} class={styles.listScroller}>
            <List
              v-model:loading={list.loading.value}
              v-model:error={list.error.value}
              error-text="加载失败，点击重试"
              finished={list.finished.value}
              finishedText={list.rows.value.length > 0 ? "暂无更多数据" : ""}
              immediateCheck={false}
              onLoad={list.onLoad}
            >
              <div class={styles.summary}>共 {list.total.value} 条任务</div>
              {list.rows.value.map((item) => (
                <CellGroup inset class={styles.card} key={String(item.id)}>
                  <Cell class={styles.cardCell} clickable onClick={() => openDetail(item)}>
                    <div class={styles.titleRow}>
                      <span class={styles.id}>{item.code ?? item.id}</span>
                      {renderServiceLevelTag(item.level)}
                    </div>
                    <div class={styles.title}>{item.description || "暂无隐患描述"}</div>
                    <div class={styles.meta}>
                      {renderServiceStatusTag(item.governanceStatus)}
                      <span class={item.overdue ? styles.overdue : ""}>
                        {formatDeadlineHint(item.overdue, undefined, item.remainingHours) || `截止 ${formatServiceDate(item.deadline)}`}
                      </span>
                    </div>
                    <div class={styles.footer}>
                      <span>
                        {item.latestProgressPercent != null ? `整改进度 ${item.latestProgressPercent}%` : item.locationName || "-"}
                      </span>
                      {renderActions(item)}
                    </div>
                  </Cell>
                </CellGroup>
              ))}
              {list.rows.value.length === 0 && list.finished.value ? <Empty description="暂无任务" /> : null}
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
        />
      </>
    );
  },
});
