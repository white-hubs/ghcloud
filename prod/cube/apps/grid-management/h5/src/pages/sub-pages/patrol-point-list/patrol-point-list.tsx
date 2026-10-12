import styles from "./patrol-point-list.module.less";
import { cubeMaintainService } from "@/api/server";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { PatrolLocationVO } from "@ghcloud/cube-maintain-service";
import { List, Empty, PullRefresh, Search, Tabs, Tab, Tag, TextEllipsis } from "vant";
import { defineComponent, reactive, ref } from "vue";
import { useRoute } from "vue-router";

/** 巡更点列表页 */
export const PatrolPointList = defineComponent({
  setup: () => {
    const route = useRoute();
    const gridAreaId = route.query.gridAreaId as string;
    const activeTab = ref("");
    const dataSource = ref<PatrolLocationVO[]>([]);
    const loading = ref(false);
    const finished = ref(false);
    const refreshing = ref(false);
    const search = reactive<{
      areaId: string;
      pageSize: number;
      pageNumber: number;
      name?: string;
      total: number;
    }>({
      areaId: gridAreaId,
      pageNumber: 0,
      total: 0,
      pageSize: 20,
    });
    const tabsList = ref([{ title: "全部", value: "ALL" }]);

    // 获取巡更点列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true;
        search.pageNumber += 1;
        const res = await cubeMaintainService.patrolPage({
          areaId: search.areaId,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          keyword: search.name || "",
        });
        search.total = res.total;
        if (res.total <= search.pageSize || res.records.length < search.pageSize) {
          finished.value = true;
        }
        if (!dataSource.value || search.pageNumber === 1) {
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
    const onSearch = (): void => {
      search.pageNumber = 0;
      finished.value = false;
      dataSource.value.length = 0;
      onLoad();
    };

    return (): JSX.Element => (
      <div>
        <CubeNavBar showBack title={"巡更点列表"}></CubeNavBar>
        <Search v-model={search.name} placeholder="根据巡更点名称进行搜索" onSearch={onSearch} />
        <Tabs v-model:active={activeTab.value} style={{ border: "none" }} shrink onChange={onSearch}>
          {tabsList.value.map((item) => (
            <Tab key={item.value} name={item.value} title={`共计${search.total}条`}>
              <div style={{ height: "82vh", background: "#f3f7fa" }}>
                <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: "78vh", overflow: "auto" }}>
                  <List
                    v-model:loading={loading.value}
                    finished={finished.value}
                    finished-text={dataSource.value.length === 0 ? "" : "暂无更多数据"}
                    onLoad={onLoad}
                  >
                    {dataSource.value &&
                      dataSource.value.length > 0 &&
                      dataSource.value.map((item) => (
                        <div class={styles["card"]} key={item.id as unknown as string}>
                          <div class={styles["card-header"]}>
                            <div class={styles["card-title"]}>
                              <span class={styles["card-name"]}>{item.patrolLocationName || "--"}</span>
                            </div>
                          </div>
                          <div class={styles["card-body"]}>
                            <div class={styles["info-row"]}>
                              <span class={styles["label"]}>关联巡更点设备：</span>
                              <span class={styles["value"]}>{item.deviceCode || "--"}</span>
                            </div>
                            <div class={styles["info-row"]}>
                              <span class={styles["label"]}>区域：</span>
                              <span class={styles["value"]}>{(item?.area ?? []).map((e) => e.name).join("/")}</span>
                            </div>
                            <div class={styles["info-row"]}>
                              <span class={styles["label"]}>经纬度：</span>
                              <TextEllipsis
                                content={item.patrolDimension || "--" + "," + item.patrolLongitude || "--"}
                                expand-text="展开"
                                collapse-text="收起"
                              />
                            </div>
                            <div class={styles["info-row"]}>
                              <span class={styles["label"]}>巡更NFC芯片：</span>
                              <span class={styles["value"]}>{item.nfcCode || "--"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    {dataSource.value.length === 0 && search.pageNumber === 1 && <Empty description="暂无数据" />}
                  </List>
                </PullRefresh>
              </div>
            </Tab>
          ))}
        </Tabs>
      </div>
    );
  },
});
