import { Empty, List, PullRefresh, Tab, Tabs, showConfirmDialog, showNotify } from "vant";
import { defineComponent, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { GridHandoverListParams, handoverRecordDTO } from "@ghcloud/cube-grid-management-service";

import { HandoverRecordCard } from "./components/record-card";
import "vant/es/dialog/style";
import "vant/es/notify/style";

import { cubeGridManagementService, cubeOuaaService } from "@/api/server";

import styles from "./index.module.less";

const tabOptions = [
  { value: "all", label: "全部" },
  { value: "pending", label: "待接班" },
  { value: "created", label: "我发起的" },
] as const;

export const GridHandoverRecord = defineComponent({
  name: "GridHandoverRecord",
  setup: () => {
    const router = useRouter();
    const route = useRoute();
    const state = reactive({
      active: Number(route.query.active || 0),
      loading: false,
      finished: false,
      refreshing: false,
      currentUserId: "",
      list: [] as handoverRecordDTO[],
      params: {
        pageNumber: 0,
        pageSize: 20,
      },
    });

    const getQueryParams = (): GridHandoverListParams => {
      const currentTab = tabOptions[state.active] ?? tabOptions[0];
      const params: GridHandoverListParams = {
        pageNumber: state.params.pageNumber,
        pageSize: state.params.pageSize,
      };
      if (currentTab.value === "all") {
        params.permission = true;
      }
      if (currentTab.value === "pending") {
        params.permission = true;
        params.status = "WAIT_HANDOVER";
        if (state.currentUserId) {
          params.takeOverUser = state.currentUserId;
        }
      }
      if (currentTab.value === "created" && state.currentUserId) {
        params.shiftOverUser = state.currentUserId;
      }
      return params;
    };

    const getDataSource = async (): Promise<{ total: number; records: handoverRecordDTO[] }> => {
      try {
        const res = await cubeGridManagementService.getGridHandoverList(getQueryParams());
        return { total: res.total, records: res.records };
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
        return { total: 0, records: [] };
      }
    };

    const onLoad = async (): Promise<void> => {
      try {
        state.loading = true;
        state.params.pageNumber += 1;
        const res = await getDataSource();
        if (state.params.pageNumber === 1) {
          state.list = [];
        }
        state.list = [...state.list, ...res.records];
        if (res.total <= state.list.length || res.records.length < state.params.pageSize) {
          state.finished = true;
        }
      } finally {
        state.loading = false;
        state.refreshing = false;
      }
    };

    const onRefresh = async (): Promise<void> => {
      state.params.pageNumber = 0;
      state.finished = false;
      await onLoad();
    };

    const getData = (): void => {
      state.list = [];
      onRefresh();
    };

    const getCurrentUser = async (): Promise<void> => {
      try {
        const user = await cubeOuaaService.getUserMine();
        state.currentUserId = user.id;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "获取当前用户失败" });
      }
    };

    onMounted(async () => {
      await getCurrentUser();
      getData();
    });

    const toDetail = (record: handoverRecordDTO, isDetailPage = true): void => {
      router.push({
        path: "/grid-list/takeover",
        query: {
          id: record.id,
          isDetailPage: isDetailPage ? "true" : "false",
          redirect: "/grid-handover-record",
          active: String(state.active),
        },
      });
    };

    const handleTakeover = (record: handoverRecordDTO): void => {
      toDetail(record, false);
    };

    const handleCancel = (record: handoverRecordDTO): void => {
      showConfirmDialog({
        title: "提示",
        message: `确定要撤销【${record.recordName || "网格交接"}】吗？`,
      })
        .then(async () => {
          try {
            await cubeGridManagementService.cancelGridHandover({ id: record.id });
            showNotify({ type: "success", message: "撤销成功" });
            getData();
          } catch (error) {
            const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
            showNotify({ type: "danger", message: errorMessage || "撤销失败" });
          }
        })
        .catch(() => {
          // on cancel
        });
    };

    const handleTabChange = (): void => {
      router.replace({ path: "/grid-handover-record", query: { active: String(state.active) } });
      getData();
    };

    return (): JSX.Element => (
      <div class={styles["container"]}>
        <CubeNavBar
          title="网格交接班"
          rightSlot={() => (
            <span
              class={styles["right-action"]}
              onClick={() => {
                router.push({ path: "/my-grid/handover" });
              }}
            >
              交班
            </span>
          )}
        />
        <Tabs v-model:active={state.active} sticky onChange={handleTabChange}>
          {tabOptions.map((item) => (
            <Tab key={item.value} title={item.label} />
          ))}
        </Tabs>
        <PullRefresh v-model={state.refreshing} onRefresh={onRefresh} class={styles["pull-refresh"]}>
          <List
            v-model:loading={state.loading}
            finished={state.finished}
            finished-text={state.list.length === 0 ? "" : "暂无更多数据"}
            onLoad={onLoad}
          >
            {state.list.map((item) => (
              <HandoverRecordCard
                key={item.id}
                record={item}
                tabType={tabOptions[state.active]?.value ?? "all"}
                onDetail={(record) => toDetail(record, true)}
                onTakeover={handleTakeover}
                onCancel={handleCancel}
              />
            ))}
            {state.list.length === 0 && state.params.pageNumber === 1 && !state.loading && <Empty description="暂无数据" />}
          </List>
        </PullRefresh>
      </div>
    );
  },
});
