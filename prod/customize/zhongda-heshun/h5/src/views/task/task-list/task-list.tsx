import styles from "./task-list.module.less";
import { cubeZhongdaHeshunService } from "@/api/server";
import { SkeletonBody } from "@/components/skeleton-body/skeleton-body";
import { useMetaTitle } from "@/hooks/use-meta-title-hook";
import { storeKill } from "@/store/kill";
import { getAssetsFile } from "@/utils/index";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import type { ScheduledTaskPageResult } from "@ghcloud/cube-zhongda-heshun-service";
import { PullRefresh, List, Empty, Icon, showNotify, showConfirmDialog } from "vant";
import { defineComponent, onMounted, ref, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

export const TaskList = defineComponent({
  setup: () => {
    cubeAppService.onVisibilityNativeAppBar(true);
    useMetaTitle();
    const router = useRouter();
    const store = storeKill();
    const isAdmin = ref(store.isAdmin);

    const dataSource = ref<ScheduledTaskPageResult[]>([]);
    const loading = ref(false);
    const finished = ref(false);
    const refreshing = ref(false);
    const skeletonLoading = ref(true);
    const search = reactive({
      pageNumber: 0,
      pageSize: 10,
    });

    const getTaskList = async (): Promise<ScheduledTaskPageResult[]> => {
      try {
        const res = await cubeZhongdaHeshunService.getDeviceScheduledTaskList({
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          groupId: store.groupActive,
        });
        return res.records || [];
      } catch (error) {
        return [];
      }
    };

    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true;
        search.pageNumber++;

        const records = await getTaskList();

        if (records.length < search.pageSize) {
          finished.value = true;
        }

        if (search.pageNumber === 1) {
          dataSource.value = [];
        }

        dataSource.value = [...dataSource.value, ...records];
      } catch {
        finished.value = true;
        showNotify({ type: "danger", message: "加载失败" });
      } finally {
        loading.value = false;
        refreshing.value = false;
        skeletonLoading.value = false;
      }
    };

    const onRefresh = async (): Promise<void> => {
      search.pageNumber = 0;
      finished.value = false;
      skeletonLoading.value = true;
      await onLoad();
    };

    const handleAddTask = (): void => {
      router.push({ path: `/device-select`, query: { type: "task" } });
    };

    const handleTaskClick = (task: ScheduledTaskPageResult): void => {
      if (isEditMode.value) {
        return;
      }
      router.push({ path: "/device-select", query: { type: "task", taskId: task.id } });
    };

    const handleDeleteTask = (task: ScheduledTaskPageResult, event?: Event): void => {
      if (event) {
        event.stopPropagation();
      }
      showConfirmDialog({
        title: "提示",
        message: `确定删除【${task.name}】任务吗？`,
      })
        .then(async () => {
          try {
            await cubeZhongdaHeshunService.deleteDeviceScheduledTask(task.id!);
            showNotify({ type: "success", message: "删除成功" });
            onRefresh();
          } catch (error) {
            showNotify({ type: "danger", message: "删除失败" });
          } finally {
            setTimeout(() => {
              isEditMode.value = false;
            }, 1 * 1000);
          }
        })
        .catch(function(){});
    };

    const isEditMode = ref(false);
    const longPressTimer = ref<any>(null);

    const handleTouchStart = (task: ScheduledTaskPageResult) => {
      if (isEditMode.value) {
        return;
      }

      longPressTimer.value = setTimeout(() => {
        isEditMode.value = true;
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 800);
    };

    const handleTouchEnd = () => {
      if (longPressTimer.value) {
        clearTimeout(longPressTimer.value);
        longPressTimer.value = null;
      }
    };

    const handleTouchMove = () => {
      if (longPressTimer.value) {
        clearTimeout(longPressTimer.value);
        longPressTimer.value = null;
      }
    };

    const exitEditMode = () => {
      if (isEditMode.value) {
        isEditMode.value = false;
      }
    };

    onMounted(async () => {
      await store.updateGroupInfo();
      isAdmin.value = store.isAdmin;
      onRefresh();
    });

    const route = useRoute()
    
    watch(() => route.query, (newQuery, oldQuery) => {
      if (newQuery?.refresh === 'true' || newQuery?.timestamp !== oldQuery?.timestamp) {
        onRefresh()
      }
    }, { immediate: false })
    return (): JSX.Element => (
      <div class={styles.container} onClick={exitEditMode}>
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles["task-list-pull-refresh"]}>
          {skeletonLoading.value ? (
            <SkeletonBody />
          ) : (
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text={dataSource.value.length === 0 ? "" : "暂无更多数据"}
              onLoad={onLoad}
            >
              {dataSource.value.length === 0 && !isAdmin.value ? (
                <div class={styles.empty}>
                  <Empty description="暂无任务" image={getAssetsFile("device-nodata.png")} />
                </div>
              ) : (
                <div class={styles["list-wrap"]}>
                  {isAdmin.value && dataSource.value.length > 0 && (
                    <div class={styles.deleteTip}>长按任务卡片，可显示删除按钮</div>
                  )}
                  {isAdmin.value && (
                    <div
                      class={styles.addButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddTask();
                      }}
                    >
                      <Icon name="add-o" class={styles.addButtonIcon} />
                    </div>
                  )}
                  {dataSource.value.map((task) => (
                    <div class={styles.taskItemWrapper} key={task.id!} onClick={(e) => e.stopPropagation()}>
                      <div
                        class={`${styles.taskItem} ${isEditMode.value ? styles.shake : ""}`}
                        onClick={() => handleTaskClick(task)}
                        onTouchstart={() => handleTouchStart(task)}
                        onTouchend={handleTouchEnd}
                        onTouchmove={handleTouchMove}
                      >
                        <div class={styles.header}>
                          <span class={styles.name}>{task.name}</span>
                          {/* <span class={`${styles.status} ${task.status === 'active' ? styles.active : ''}`}>
                          {task.status === 'active' ? '启用' : '停用'}
                        </span> */}
                        </div>
                        <div class={styles.devices}>
                          {task.deviceNames?.slice(0, 4).map((device, idx) => (
                            <div key={idx} class={styles.deviceTag}>
                              {device}
                            </div>
                          ))}
                          {task.deviceNames && task.deviceNames.length > 4 && <div class={styles.deviceTag}>...</div>}
                        </div>

                        {isEditMode.value && (
                          <div class={styles.deleteBtn} onClick={(e) => handleDeleteTask(task, e)}>
                            <div class={styles.minus}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </List>
          )}
        </PullRefresh>
      </div>
    );
  },
});
