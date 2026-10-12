import { useMetaTitle } from "../hooks/use-meta-title-hook";
import styles from "./list.module.less";
import { status } from "./type";
import { cubeDailyTaskService, cubeOuaaService } from "@/api/server";
import { storeInspect } from "@/store/inspect";
import { EntryMenu, CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { TaskListItem, TaskUrgencyItem } from "@ghcloud/cube-daily-task-service";
import dayjs from "dayjs";
import {
  Cell,
  CellGroup,
  showNotify,
  Icon,
  Skeleton,
  Search,
  Popup,
  Button,
  DatePicker,
  Field,
  Tabs,
  Tab,
  PullRefresh,
  List,
  Divider,
  Empty,
  Tag,
  Picker,
  type PickerConfirmEventParams,
} from "vant";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

export const TaskList = defineComponent({
  name: "TaskList",
  props: {
    type: {
      type: String,
      default: "DAILY_TASK",
    },
  },
  setup: (props) => {
    useMetaTitle();
    const store = storeInspect();
    const route = useRoute();
    const router = useRouter();
    const showPopUp = ref(false);
    const loading = ref(false);
    const finished = ref(false);
    const dataSource = ref<TaskListItem[]>([]);
    const refreshing = ref(false);
    const activeTab = ref((route.query.status as string) ?? "");
    const projectLevelColumns = ref<TaskUrgencyItem[]>([]);
    const tagType = ["danger", "warning", "primary", "success", "default"];
    const search = reactive({
      pageNumber: 0,
      pageSize: 10,
      keyword: "",
      status: (route.query.status as string) ?? "",
      taskCategoryId: "",
      taskMasterId: "",
      taskName: "",
      taskMaster: "",
      dailyType: "DAILY_TASK",
    });
    const showEndPicker = ref(false);
    const showMasterPicker = ref(false);
    const tagList = ref<{ text: string; value: string }[]>([]);
    const tabs = ref([
      { title: "全部", status: "ALL" },
      { title: "待处理", status: "WAIT" },
      { title: "已完成", status: "DONE" },
    ]);
    const handleAdd = (): void => {
      store.resetCache();
      router.push({
        path: "/task-add",
      });
    };
    // 切换标签
    const onClickTab = (): void => {
      search.taskCategoryId = "";
      search.taskMasterId = "";
      search.status = activeTab.value;
      if (activeTab.value === "ALL") {
        search.status = "";
      }
      onRefresh();
    };
    // 下拉刷新
    const onRefresh = (): void => {
      search.pageNumber = 0;
      finished.value = false;
      onLoad();
    };
    const onSearch = (): void => {
      search.pageNumber = 0;
      onLoad();
    };

    const handleScreen = (): void => {
      search.pageNumber = 0;
      showPopUp.value = false;

      onLoad();
    };
    onMounted(() => {
      onLoad();
      getType();
      getDailyUrgencyPage();
    });
    // 获取数据
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true;
        search.pageNumber++;
        const querySearch = {
          ...search,
          queryType: search.taskMasterId,
          dailyType: props.type,
        };
        let res = null;
        if (props.type === "DAILY_TASK") {
          res = await cubeDailyTaskService.getDailyTaskPage(querySearch);
        } else {
          res = await cubeDailyTaskService.getDailySmallPage(querySearch);
        }
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
        //  finished.value = true
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
    const toDetail = (id: string): void => {
      router.push({
        path: "/task-detail",
        query: {
          id,
          // status
        },
      });
    };
    const getType = async (): Promise<void> => {
      const param = {
        pageNumber: "1",
        pageSize: "1000",
        dailyType: props.type,
      };
      const data = await cubeDailyTaskService.getDailyTaskCategoryPage(param);
      tagList.value = data.records.map((item: { id: string; name: string }) => ({
        text: item.name,
        value: item.id,
      }));
    };
    const getDailyUrgencyPage = async (): Promise<void> => {
      const data = await cubeDailyTaskService.getDailyUrgencyPage({
        pageNumber: "1",
        pageSize: "1000",
        dailyType: props.type,
      });
      projectLevelColumns.value = data.records;
    };
    // getDailyTaskCategoryPage
    const onConfirm = (value: string | PickerConfirmEventParams): void => {
      const v = (value as PickerConfirmEventParams).selectedOptions;
      if (v) {
        search.taskCategoryId = String(v[0]?.value ?? v[0]?.value ?? "");
        search.taskName = String(v[0]?.text ?? v[0]?.text ?? "");
      }
      showEndPicker.value = false;
    };
    // getDailyTaskCategoryPage
    const onConfirmMaster = (value: string | PickerConfirmEventParams): void => {
      const v = (value as PickerConfirmEventParams).selectedOptions;
      if (v) {
        search.taskMasterId = String(v[0]?.value ?? v[0]?.value ?? "");
        search.taskMaster = String(v[0]?.text ?? v[0]?.text ?? "");
      }
      showMasterPicker.value = false;
    };
    const getTagType = (urgency: string): string => {
      const item = projectLevelColumns.value?.filter((i) => i.name === urgency)[0];
      let index = item?.level;
      if (index > 5) {
        index = 5;
      }
      return tagType[index - 1];
    };
    return (): VNode => (
      <>
        <CubeNavBar
          showBack
          title="日常任务"
          rightSlot={() => (
            <>
              <Icon class={styles.add} name="add-o" size="20" onClick={handleAdd} />
            </>
          )}
        />
        <div class={styles.container}>
          <Search
            v-model={search.keyword}
            placeholder="根据任务名称进行搜索"
            show-action
            v-slots={searchDom}
            onSearch={onSearch}
            onClear={onSearch}
          />
          <Tabs v-model:active={activeTab.value} class={styles.tabs} shrink sticky onClickTab={onClickTab}>
            {tabs.value.map((item) => (
              <Tab title={item.title} name={item.status} key={item.title}>
                <PullRefresh
                  class={styles.pull}
                  v-model={refreshing.value}
                  onRefresh={onRefresh}
                  style={{ height: "calc(100vh - 160px)", marginTop: "5px", overflow: "auto" }}
                >
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
                            toDetail(item.id);
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
                            {/* <div><span style={{ color: '#8f8f8f' }}>开始时间：</span><span>{timeFormat(item.validBeginTime, true)}</span></div>
                          <div><span style={{ color: '#8f8f8f' }}>截至时间：</span><span>{timeFormat(item.validEndTime, true)}</span></div> */}
                          </div>
                          {/* <Divider style={{ margin: '5px' }} /> */}
                        </div>
                      ))}
                    {dataSource.value.length === 0 && search.pageNumber === 1 && <Empty description="暂无数据" />}
                  </List>
                </PullRefresh>
              </Tab>
            ))}
          </Tabs>

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
            <div style={{ margin: "10px" }}>任务层级</div>
            <div class={styles.screen}>
              <Field
                v-model={search.taskMaster}
                is-link
                readonly
                name="startTime"
                placeholder="任务层级"
                onClick={() => {
                  showMasterPicker.value = true;
                }}
              />
            </div>
            <Popup v-model:show={showEndPicker.value} position="bottom">
              <Picker columns={tagList.value} onConfirm={onConfirm} onCancel={() => (showEndPicker.value = false)} />
            </Popup>
            <Popup v-model:show={showMasterPicker.value} position="bottom">
              <Picker
                columns={[
                  { text: "主任务", value: "MAIN" },
                  { text: "子任务", value: "SUB" },
                ]}
                onConfirm={onConfirmMaster}
                onCancel={() => (showMasterPicker.value = false)}
              />
            </Popup>
            <div class={styles.footer_button_group}>
              <Button
                size="small"
                block
                onClick={() => {
                  search.taskName = "";
                  search.taskMaster = "";
                  search.taskCategoryId = "";
                  search.taskMasterId = "";
                  handleScreen();
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
