import dayjs from "dayjs";
import {
  Icon,
  Search,
  Popup,
  Button,
  Field,
  Tabs,
  Tab,
  PullRefresh,
  List,
  Empty,
  Picker,
  showNotify,
  type PickerConfirmEventParams,
} from "vant";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { RecordStatusColor, RecordStatusMap, type DailyTaskRecordModel } from "@ghcloud/cube-daily-task-service";

import { useMetaTitle } from "../hooks/use-meta-title-hook";
import { cubeDailyTaskService } from "@/api/server";

import styles from "./redord.module.less";

export const TaskRecord = defineComponent({
  name: "TaskRecord",
  setup: () => {
    useMetaTitle();
    const route = useRoute();
    const router = useRouter();
    const routeDailyType = typeof route.query.dailyType === "string" && route.query.dailyType ? route.query.dailyType : "DAILY_TASK";
    const showPopUp = ref(false);
    const loading = ref(false);
    const finished = ref(false);
    const dataSource = ref<DailyTaskRecordModel[]>([]);
    const refreshing = ref(false);
    const search = reactive({
      pageNumber: 0,
      pageSize: 10,
      keyword: "",
      status: "DONE",
      taskCategoryId: "",
      taskName: "",
      executionResult: "",
      recordStatus: "",
      dailyType: routeDailyType,
    });
    const showEndPicker = ref(false);
    const tagList = ref<{ text: string; value: string }[]>([]);
    const activeRecordStatusTab = ref("ALL");
    const recordStatusTabs = [
      { title: "全部", name: "ALL" },
      { title: "待修复", name: "ABNORMAL_WAIT_REPAIR" },
      { title: "修复中", name: "ABNORMAL_REPAIRING" },
      { title: "已修复", name: "ABNORMAL_REPAIRED" },
    ];
    const onRefresh = (): void => {
      search.pageNumber = 0;
      finished.value = false;
      onLoad();
    };
    const onSearch = (): void => {
      search.pageNumber = 0;
      onLoad();
    };
    const onRecordStatusTabChange = (): void => {
      search.recordStatus = activeRecordStatusTab.value === "ALL" ? "" : activeRecordStatusTab.value;
      onRefresh();
    };
    const getRecordStatus = (item: DailyTaskRecordModel): string => {
      return item.recordStatus || (item.executionResult === "NORMAL" ? "NORMAL" : "ABNORMAL_WAIT_REPAIR");
    };
    const getRecordStatusText = (item: DailyTaskRecordModel): string => {
      return RecordStatusMap.get(getRecordStatus(item)) || "--";
    };
    const getRecordStatusStyle = (item: DailyTaskRecordModel): Record<string, string> => {
      const color = RecordStatusColor.get(getRecordStatus(item)) || "#969799";
      return {
        color,
        borderColor: color,
        background: `${color}14`,
      };
    };

    const handleScreen = (): void => {
      search.pageNumber = 0;
      showPopUp.value = false;

      onLoad();
    };
    onMounted(() => {
      onLoad();
      getType();
    });
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true;
        search.pageNumber++;
        const res = await cubeDailyTaskService.getDailyTaskRecordPage(search);
        if (res.total <= search.pageSize) {
          finished.value = true;
        }
        if (res.records.length < search.pageSize) {
          finished.value = true;
        }
        if (!dataSource.value) {
          dataSource.value = [];
        }
        if (search.pageNumber === 1) {
          dataSource.value = [];
        }
        dataSource.value = [...dataSource.value, ...res.records];
      } catch (error) {
        finished.value = true;
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };
    const searchDom = {
      action: (): VNode => (
        <Icon
          name="filter-o"
          onClick={() => {
            showPopUp.value = true;
          }}
          size="20"
        />
      ),
    };
    const toDetail = (item: DailyTaskRecordModel): void => {
      router.push({
        path: "/record-detail",
        query: {
          taskId: item.taskId,
          id: item.id,
        },
      });
    };
    const handleRepairAction = async (event: Event, item: DailyTaskRecordModel, action: "repair" | "transfer"): Promise<void> => {
      event.stopPropagation();
      try {
        const detail = await cubeDailyTaskService.getDailyTaskRecordDetail({ id: item.id, taskId: item.taskId });
        const exceptionList = (detail.exceptionList ?? []).filter((exception) => exception.allowRepair);
        if (exceptionList.length !== 1) {
          if (exceptionList.length > 1) {
            showNotify({ type: "warning", message: "该记录包含多条待处理异常，请在详情中选择" });
            toDetail(item);
          } else {
            showNotify({ type: "warning", message: "当前异常已处理或已移交" });
            onRefresh();
          }
          return;
        }
        const exceptionId = exceptionList[0].id;
        router.push({
          path: action === "repair" ? "/record-repair" : "/task-handOver",
          query: action === "repair" ? { exceptionId } : { id: exceptionId, action: "record-repair" },
        });
      } catch {
        showNotify({ type: "danger", message: "获取异常信息失败" });
      }
    };
    const getType = async (): Promise<void> => {
      const param = {
        pageNumber: "1",
        pageSize: "1000",
        dailyType: search.dailyType,
      };
      const data = await cubeDailyTaskService.getDailyTaskCategoryPage(param);
      tagList.value = data.records.map((item: { id: string; name: string }) => {
        return {
          text: item.name,
          value: item.id,
        };
      });
    };
    const onConfirm = (value: string | PickerConfirmEventParams): void => {
      const v = (value as PickerConfirmEventParams).selectedOptions;
      if (v) {
        search.taskCategoryId = String(v[0]?.value ?? "");
        search.taskName = String(v[0]?.text ?? "");
      }
      showEndPicker.value = false;
    };
    return (): VNode => (
      <>
        <CubeNavBar title="处理记录" />
        <div class={styles.container}>
          <div class={styles.filterPanel}>
            <Search
              v-model={search.keyword}
              placeholder="根据任务名称进行搜索"
              onSearch={onSearch}
              onClear={onSearch}
              v-slots={searchDom}
            />
            <Tabs v-model:active={activeRecordStatusTab.value} onClickTab={onRecordStatusTabChange}>
              {recordStatusTabs.map((item) => (
                <Tab key={item.name} title={item.title} name={item.name} />
              ))}
            </Tabs>
          </div>
          <PullRefresh class={styles.pull} v-model={refreshing.value} onRefresh={onRefresh}>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text={dataSource.value.length === 0 ? "" : "暂无更多数据"}
              onLoad={onLoad}
            >
              {dataSource.value &&
                dataSource.value.length > 0 &&
                dataSource.value.map((item: DailyTaskRecordModel) => (
                  <div
                    class={styles["cell-group"]}
                    key={item.id}
                    onClick={() => {
                      toDetail(item);
                    }}
                  >
                    <div class={styles.title}>
                      <span class={styles["title-name"]}>{item.taskName}</span>
                      <span class={styles.resultTag} style={getRecordStatusStyle(item)}>
                        {getRecordStatusText(item)}
                      </span>
                    </div>
                    <div class={styles.body}>
                      <div class={styles.content}>
                        <div>
                          <span>处理时间：</span>
                          <span>{dayjs(new Date(item.executionTime)).format("YYYY-MM-DD HH:mm:ss")}</span>
                        </div>
                        <div>
                          <span>处理人：</span>
                          <span>{item.executorName}</span>
                        </div>
                      </div>
                      {item.allowRepair && (
                        <div class={styles.footer}>
                          <Button size="small" onClick={(event: Event) => handleRepairAction(event, item, "transfer")}>
                            移交
                          </Button>
                          <Button size="small" type="primary" onClick={(event: Event) => handleRepairAction(event, item, "repair")}>
                            处理
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              {dataSource.value.length === 0 && search.pageNumber === 1 && <Empty description="暂无数据" />}
            </List>
          </PullRefresh>

          <Popup v-model:show={showPopUp.value} position="right" style={{ width: "90vw", height: "100vh" }}>
            <div style={{ margin: "10px" }}>任务类型</div>
            <div class={styles.screen}>
              <Field
                v-model={search.taskName}
                is-link
                readonly
                name="startTime"
                placeholder="任务类型"
                onClick={() => {
                  showEndPicker.value = true;
                }}
              />
            </div>
            <Popup v-model:show={showEndPicker.value} position="bottom">
              <Picker columns={tagList.value} onConfirm={onConfirm} onCancel={() => (showEndPicker.value = false)} />
            </Popup>
            <div class={styles.footer_button_group}>
              <Button
                size="small"
                block
                onClick={() => {
                  search.taskName = "";
                  search.taskCategoryId = "";
                }}
              >
                重置
              </Button>
              <Button size="small" block type="primary" onClick={handleScreen}>
                确定
              </Button>
            </div>
          </Popup>
        </div>
      </>
    );
  },
});
