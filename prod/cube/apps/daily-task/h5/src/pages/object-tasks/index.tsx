import { useMetaTitle } from "../hooks/use-meta-title-hook";
import styles from "../task/list.module.less";
import { status } from "../task/type";
import { cubeDailyTaskService } from "@/api/server";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { TaskListItem, TaskUrgencyItem } from "@ghcloud/cube-daily-task-service";
import dayjs from "dayjs";
import { List, PullRefresh, Empty, Tag } from "vant";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

export const ObjectTasks = defineComponent({
  name: "ObjectTasks",
  setup: () => {
    useMetaTitle();
    const route = useRoute();
    const router = useRouter();
    const loading = ref(false);
    const finished = ref(false);
    const dataSource = ref<TaskListItem[]>([]);
    const refreshing = ref(false);

    const objectId = (route.query.objectId as string) ?? "";
    const objectType = (route.query.objectType as string) ?? "";
    const dailyType = (route.query.dailyType as string) ?? "";

    const search = reactive({
      pageNumber: 0,
      pageSize: 10,
      status: "WAIT",
      keyword: "",
    });
    const tagType = ["danger", "warning", "primary", "success", "default"];
    const projectLevelColumns = ref<TaskUrgencyItem[]>([]);

    const onLoad = async (): Promise<void> => {
      if (objectId.length === 0) {
        finished.value = true;
        return;
      }
      try {
        loading.value = true;
        search.pageNumber += 1;
        const res = await cubeDailyTaskService.getDailyTaskPage({
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          taskCategoryId: "",
          dailyType,
          objectId,
          status: search.status || "",
          keyword: search.keyword || "",
        });
        if (search.pageNumber === 1) {
          dataSource.value = [];
        }
        dataSource.value = [...dataSource.value, ...(res.records ?? [])];
        const total = res.total ?? 0;
        if (total <= search.pageNumber * search.pageSize || (res.records ?? []).length < search.pageSize) {
          finished.value = true;
        }
      } catch {
        finished.value = true;
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };

    const onRefresh = (): void => {
      search.pageNumber = 0;
      finished.value = false;
      onLoad();
    };

    const toDetail = async (id: string, name: string): Promise<void> => {
      // todo: 跳转任务-对象执行页面
      const res = await cubeDailyTaskService.getDailyTaskObject({ id: objectId, taskId: id });
      router.push({
        path: "/task-execute",
        query: {
          dailyType: dailyType,
          taskId: id,
          taskName: name,
          targetObj: JSON.stringify(res),
        },
      });
    };

    const getTagType = (urgency: string): string => {
      const item = projectLevelColumns.value?.filter((i) => i.name === urgency)[0];
      let index = item?.level;
      if (index && index > 5) {
        index = 5;
      }
      return index ? (tagType[index - 1] ?? "default") : "default";
    };

    const getDailyUrgencyPage = async (): Promise<void> => {
      if (!dailyType) {
        return;
      }
      const data = await cubeDailyTaskService.getDailyUrgencyPage({
        pageNumber: "1",
        pageSize: "1000",
        dailyType,
      });
      projectLevelColumns.value = data.records ?? [];
    };

    onMounted(() => {
      getDailyUrgencyPage();
    });

    return (): VNode => (
      <div>
        <CubeNavBar showBack title="任务列表" />
        <div class={styles.pull}>
          {objectId.length === 0 ? (
            <Empty description="缺少对象ID参数" />
          ) : (
            <>
              <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} style={{ height: "calc(100vh - 60px)" }}>
                <List
                  v-model:loading={loading.value}
                  finished={finished.value}
                  finished-text={dataSource.value.length === 0 ? "" : "暂无更多数据"}
                  onLoad={onLoad}
                >
                  {dataSource.value &&
                    dataSource.value.length > 0 &&
                    dataSource.value.map((item: TaskListItem) => (
                      <div
                        class={styles["cell-group"]}
                        key={item.id}
                        onClick={() => {
                          toDetail(item.id, item.taskName);
                        }}
                      >
                        <div class={styles.title}>
                          <span class={styles["title-name"]}>{item.taskName}</span>
                          <div class={styles.tagsList}>
                            <div
                              class={styles.tags}
                              style={{
                                backgroundColor: item.master ? "#00CC001A" : "#f6d4a233",
                                color: item.master ? "#00CC00" : "#f19307ff",
                              }}
                            >
                              {item.master ? "主" : "子"}
                            </div>
                            <div
                              class={styles.tags}
                              style={{
                                backgroundColor: status[item.status as keyof typeof status]?.background,
                                color: status[item.status as keyof typeof status]?.color,
                              }}
                            >
                              {" "}
                              {status[item.status as keyof typeof status]?.name ?? ""}{" "}
                            </div>
                            <Tag type={getTagType(item.urgencyName)}>{item.urgencyName}</Tag>
                          </div>
                        </div>
                        <div></div>
                        <div class={styles.content}>
                          <div style={{ color: "#8f8f8f" }}>
                            <span style={{ color: "#8f8f8f" }}>任务时限：</span>
                            <span>{dayjs(new Date(item.deadline)).format("YYYY-MM-DD HH:mm:ss")}</span>
                          </div>
                          <div style={{ color: "#8f8f8f" }}>
                            <span style={{ color: "#8f8f8f" }}>负责人：</span>
                            <span>{item.taskUserName}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  {dataSource.value.length === 0 && search.pageNumber >= 1 && <Empty description="暂无数据" />}
                </List>
              </PullRefresh>
            </>
          )}
        </div>
      </div>
    );
  },
});
