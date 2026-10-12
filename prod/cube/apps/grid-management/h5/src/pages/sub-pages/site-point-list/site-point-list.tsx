import styles from "./site-point-list.module.less";
import { cubeMaintainService } from "@/api/server";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { RootObject } from "@ghcloud/cube-maintain-service";
import { List, Empty, PullRefresh, Search, Tabs, Tab, Tag, Icon, TextEllipsis } from "vant";
import { defineComponent, reactive, ref } from "vue";
import { useRoute } from "vue-router";

/** 现场点列表页 */
export const SitePointList = defineComponent({
  setup: () => {
    const route = useRoute();
    const gridAreaId = route.query.gridAreaId as string;
    const activeTab = ref("");
    const dataSource = ref<RootObject[]>([]);
    const loading = ref(false);
    const finished = ref(false);
    const refreshing = ref(false);
    const search = reactive<{
      areaId: string;
      pageSize: number;
      pageNumber: number;
      pointName?: string;
      total: number;
    }>({
      areaId: gridAreaId,
      pageNumber: 0,
      total: 0,
      pageSize: 20,
    });
    const tabsList = ref([{ title: "全部", value: "ALL" }]);

    // 获取现场点列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true;
        search.pageNumber += 1;
        const res = await cubeMaintainService.inspectPointList({ ...search });
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
      onLoad();
    };

    return (): JSX.Element => (
      <div>
        <CubeNavBar showBack title={"现场点列表"}></CubeNavBar>
        <Search v-model={search.pointName} placeholder="根据现场点名称进行搜索" onSearch={onSearch} />
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
                        <div class={styles["card"]} key={item.id}>
                          <div class={styles["card-header"]}>
                            <div class={styles["card-title"]}>
                              <span class={styles["card-name"]}>{item.name || "--"}</span>
                              <Tag type="primary" plain size="medium" style={{ whiteSpace: "nowrap" }}>
                                {item.typeName || "暂无类型"}
                              </Tag>
                              {item.id?.toString() ?? ""}
                            </div>
                          </div>
                          <div class={styles["card-body"]}>
                            <div class={styles["info-row"]}>
                              <span class={styles["label"]}>编号：</span>
                              <span class={styles["value"]}>{item.codeNum || "--"}</span>
                            </div>
                            <div class={styles["info-row"]}>
                              <span class={styles["label"]}>区域：</span>
                              <span class={styles["value"]}>{item.areaName || "--"}</span>
                            </div>
                            <div class={styles["info-row"]}>
                              <span class={styles["label"]}>位置：</span>
                              <TextEllipsis content={item.location || "--"} expand-text="展开" collapse-text="收起" />
                            </div>
                            <div class={styles["info-row"]}>
                              <span class={styles["label"]}>部门：</span>
                              <span class={styles["value"]}>{item.depName || "--"}</span>
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
