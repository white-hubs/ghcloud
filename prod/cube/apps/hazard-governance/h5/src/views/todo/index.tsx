import { Button, Cell, CellGroup, Empty, PullRefresh, showToast } from "vant";
import { defineComponent, onMounted, shallowRef, type VNode } from "vue";
import { useRouter, type RouteRecordName } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { HazardGovernanceStatus } from "@ghcloud/cube-service-interface/hazard-governance";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import {
  pageHazardAcceptanceTasks,
  pageHazardApprovalTasks,
  pageHazardLedger,
  pageHazardRectificationTasks,
} from "@ghcloud/cube-services-client/hazard-governance.client";

import { renderServiceLevelTag, renderServiceStatusTag } from "@/views/hazard-service-utils";

import styles from "./index.module.less";

type TodoGroupKey = "confirm" | "approval" | "rectify" | "acceptance";

interface TodoItem {
  id: string;
  code: string;
  description: string;
  level?: string;
  status?: string;
}

interface TodoGroup {
  key: TodoGroupKey;
  title: string;
  action: string;
  routeName: RouteRecordName;
  total: number;
  items: TodoItem[];
}

const groupMeta: Array<Omit<TodoGroup, "total" | "items">> = [
  { key: "confirm", title: "待确认", action: "去确认", routeName: "hazards" },
  { key: "approval", title: "待审批", action: "去审批", routeName: "approvals" },
  { key: "rectify", title: "待整改", action: "去处理", routeName: "tasks" },
  { key: "acceptance", title: "待验收", action: "去验收", routeName: "acceptances" },
];

const todoToneClass: Record<TodoGroupKey, string> = {
  confirm: styles.orange,
  approval: styles.purple,
  rectify: styles.blue,
  acceptance: styles.green,
};

export const TodoPage = defineComponent({
  name: "TodoPage",
  setup: () => {
    document.title = "我的待办";
    const router = useRouter();
    const refreshing = shallowRef(false);
    const loading = shallowRef(false);
    const groups = shallowRef<TodoGroup[]>(groupMeta.map((group) => ({ ...group, total: 0, items: [] })));

    const loadTodos = async (): Promise<void> => {
      if (loading.value) return;
      loading.value = true;
      try {
        const [confirmResult, approvalResult, rectifyResult, acceptanceResult] = await Promise.all([
          useAuthRequest(() =>
            pageHazardLedger({
              pageNumber: 1,
              pageSize: 3,
              governanceStatus: HazardGovernanceStatus.PENDING_CONFIRM,
            }),
          ),
          useAuthRequest(() => pageHazardApprovalTasks({ pageNumber: 1, pageSize: 3, ownOnly: true })),
          useAuthRequest(() =>
            pageHazardRectificationTasks({
              pageNumber: 1,
              pageSize: 3,
              ownOnly: true,
              overdueFirst: true,
            }),
          ),
          useAuthRequest(() => pageHazardAcceptanceTasks({ pageNumber: 1, pageSize: 3, ownOnly: true })),
        ]);

        const source: Record<TodoGroupKey, { total: number; items: TodoItem[] }> = {
          confirm: {
            total: confirmResult.total,
            items: confirmResult.records.map((item) => ({
              id: String(item.id),
              code: item.code ?? String(item.id),
              description: item.description ?? "暂无隐患描述",
              level: item.level,
              status: item.governanceStatus,
            })),
          },
          approval: {
            total: approvalResult.total,
            items: approvalResult.records.map((item) => ({
              id: item.approvalTaskId,
              code: item.code ?? item.hazardId ?? item.approvalTaskId,
              description: item.description ?? "暂无隐患描述",
              level: item.level,
              status: HazardGovernanceStatus.PENDING_APPROVAL,
            })),
          },
          rectify: {
            total: rectifyResult.total,
            items: rectifyResult.records.map((item) => ({
              id: String(item.id),
              code: item.code ?? String(item.id),
              description: item.description ?? "暂无隐患描述",
              level: item.level,
              status: item.governanceStatus,
            })),
          },
          acceptance: {
            total: acceptanceResult.total,
            items: acceptanceResult.records.map((item) => ({
              id: item.id,
              code: item.code ?? item.id,
              description: item.description ?? "暂无隐患描述",
              level: item.level,
              status: HazardGovernanceStatus.PENDING_ACCEPTANCE,
            })),
          },
        };

        groups.value = groupMeta.map((group) => ({ ...group, ...source[group.key] }));
      } catch (error) {
        showToast(error instanceof Error ? error.message : "待办加载失败，请下拉重试");
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };

    const onRefresh = (): void => {
      refreshing.value = true;
      void loadTodos();
    };

    onMounted(() => {
      void loadTodos();
    });

    return (): VNode => (
      <>
        <CubeNavBar showBack title="我的待办" />
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles.container}>
          <div class={styles.statsGrid}>
            {groups.value.map((group) => (
              <button
                type="button"
                class={[styles.statCard, todoToneClass[group.key]]}
                key={group.key}
                onClick={() => void router.push({ name: group.routeName })}
              >
                <div class={styles.statValue}>{group.total}</div>
                <div class={styles.statLabel}>{group.title}</div>
              </button>
            ))}
          </div>
          {groups.value.map((group) => (
            <section class={styles.section} key={group.key}>
              <div class={[styles.sectionHeader, todoToneClass[group.key]]}>
                <div class={styles.sectionTitle}>
                  <span class={styles.sectionBar} />
                  <span>{group.title}</span>
                </div>
                <span class={styles.sectionCount}>({group.total})</span>
              </div>
              {group.items.map((item) => (
                <CellGroup inset class={styles.card} key={item.id}>
                  <Cell class={styles.cardCell}>
                    <div class={styles.titleRow}>
                      <span class={styles.id}>{item.code}</span>
                      {renderServiceStatusTag(item.status)}
                    </div>
                    <div class={styles.title}>{item.description}</div>
                    <div class={styles.meta}>
                      {renderServiceLevelTag(item.level)}
                      <Button size="small" type="primary" onClick={() => void router.push({ name: group.routeName })}>
                        {group.action}
                      </Button>
                    </div>
                  </Cell>
                </CellGroup>
              ))}
              {group.items.length === 0 && !loading.value ? <Empty image-size={48} description={`暂无${group.title}事项`} /> : null}
            </section>
          ))}
        </PullRefresh>
      </>
    );
  },
});
