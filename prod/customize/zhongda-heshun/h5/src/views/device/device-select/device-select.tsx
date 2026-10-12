import styles from "./device-select.module.less";
import { cubeZhongdaHeshunService } from "@/api/server";
import { useMetaTitle } from "@/hooks/use-meta-title-hook";
import { storeKill } from "@/store/kill";
import { useTaskStore } from "@/store/task";
import { getAssetsFile } from "@/utils/index";
import type { DeviceVO } from "@ghcloud/cube-zhongda-heshun-service";
import { Search, List, PullRefresh, Empty, Icon, Button, Image as VanImage, Popup, Tag, showNotify } from "vant";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";

export const DeviceSelect = defineComponent({
  name: "DeviceSelect",
  setup() {
    useMetaTitle();
    const router = useRouter();
    const route = useRoute();
    const store = storeKill();
    const taskStore = useTaskStore();

    const groupActive = ref(store.groupActive);

    const keyword = ref("");

    const showFilter = ref(false);
    const filterStatus = ref<string | null>(null);
    const tempFilterStatus = ref<string | null>(null);

    const loading = ref(false);
    const finished = ref(false);
    const refreshing = ref(false);
    const dataSource = ref<DeviceVO[]>([]);
    const page = reactive({
      pageNumber: 0,
      pageSize: 20,
    });

    const selectedIds = ref<string[]>([]);

    // const currentProductId = ref<string | null>(null);

    const getDeviceList = async () => {
      try {
        await initTaskData();
        // const { type, productId } = route.query;
        // const finalProductId = productId || currentProductId.value || null;
        return await cubeZhongdaHeshunService.getDevicePageList({
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          groupId: groupActive.value,
          keyword: keyword.value,
          // productId: (type === "task" ? finalProductId : null) as string,
        });
      } catch (error) {
        return { total: 0, records: [] };
      }
    };

    const initTaskData = async () => {
      const { taskId, type } = route.query;
      if (type === "task" && taskId) {
        try {
          const detail = await cubeZhongdaHeshunService.getDeviceScheduledTaskDetail(taskId as string);
          selectedIds.value = detail.deviceList?.map(e => e.id || '').filter(e => e) as string[] ?? [];
          // currentProductId.value = (detail?.deviceList?.[0]?.deviceIotProdId || "2029856058411438082") as string;
        } catch (e) {
        }
      }
    };

    const onLoad = async () => {
      if (refreshing.value) {
        dataSource.value = [];
        refreshing.value = false;
      }

      loading.value = true;
      page.pageNumber++;

      try {
        const res = await getDeviceList();

        if (res.records.length < page.pageSize) {
          finished.value = true;
        }

        if (page.pageNumber === 1) {
          dataSource.value = res.records;
        } else {
          const newRecords = res.records.filter((newItem) => !dataSource.value.some((existingItem) => existingItem.id === newItem.id));
          dataSource.value = [...dataSource.value, ...newRecords];
        }
      } catch (error) {
        finished.value = true;
      } finally {
        loading.value = false;
      }
    };

    const displayDataSource = computed(() => {
      if (!filterStatus.value) {
        return dataSource.value;
      }
      return dataSource.value.filter((device) => {
        if (filterStatus.value === "ONLINE") {
          return device.status?.onlineState;
        }
        if (filterStatus.value === "OFFLINE") {
          return !device.status?.onlineState;
        }
        return true;
      });
    });

    const onRefresh = async () => {
      finished.value = false;
      loading.value = true;
      page.pageNumber = 0;
      await onLoad();
    };

    const onSearch = () => {
      onRefresh();
    };

    const onFilterClick = () => {
      tempFilterStatus.value = filterStatus.value;
      showFilter.value = true;
    };

    const onFilterReset = () => {
      tempFilterStatus.value = null;
    };

    const onFilterConfirm = () => {
      filterStatus.value = tempFilterStatus.value;
      showFilter.value = false;
    };

    const toggleSelection = (id: string) => {
      const index = selectedIds.value.indexOf(id);
      if (index > -1) {
        selectedIds.value.splice(index, 1);
      } else {
        selectedIds.value.push(id);
      }
    };

    const handleConfirm = () => {
      const selectedDevices = dataSource.value.filter((d) => selectedIds.value.includes(d.id));
      if (selectedDevices.length === 0) {
        showNotify({ type: "warning", message: "请先选择设备" });
        return;
      }
      const { taskId, type } = route.query;
      if (type === "task") {
        taskStore.setDevices(selectedDevices);
        if (taskId) {
          router.push({ path: "/task-form", query: { id: taskId } });
        } else {
          router.push("/task-form");
        }
        return;
      }

      router.back();
    };
    onMounted(async () => {
      await store.updateGroupInfo();
      groupActive.value = store.groupActive;
    });

    return () => (
      <div class={styles["device-select"]}>
        <div class={styles["search-wrapper"]}>
          <Search v-model={keyword.value} placeholder="根据设备名称进行搜索" onSearch={onSearch} onClear={onSearch} />
          <div style="display: none" class={styles["filter-btn"]} onClick={onFilterClick}>
            <span>筛选</span>
            <Icon name="filter-o" />
          </div>
        </div>

        <div class={styles["list-container"]}>
          <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles["device-select-pull-refresh"]}>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text={dataSource.value.length === 0 ? "" : "没有更多了"}
              onLoad={onLoad}
            >
              {displayDataSource.value.length === 0 && !loading.value ? (
                <Empty description="暂无设备" image={getAssetsFile("device-nodata.png")} />
              ) : (
                displayDataSource.value.map((device) => {
                  const isSelected = selectedIds.value.includes(device.id);
                  const isOnline = device.status?.onlineState;

                  return (
                    <div key={device.id} class={styles["device-item"]} onClick={() => {
                      if (isOnline) {
                        toggleSelection(device.id)
                      }
                    }}>
                      <div class={styles["left-content"]}>
                        <VanImage src={(device as DeviceVO).picture} class={styles["device-image"]} fit="cover" />
                        <div class={styles.info}>
                          <div class={styles["name-row"]}>
                            <Tag
                              class={styles["status-tag"]}
                              text-color={isOnline ? "#6AB539" : "#95A1AC"}
                              color={isOnline ? "rgba(106,181,57,0.10)" : "rgba(50,50,50,0.10)"}
                              size="medium"
                            >
                              {isOnline ? "在线" : "离线"}
                            </Tag>
                            <span class={styles.name}>{device.name}</span>
                          </div>
                          <div class={styles.area}>所在区域：{device.area?.name || "--"}</div>
                        </div>
                      </div>
                      {
                        isOnline ? 
                        <Icon name={isSelected ? "checked" : "circle"} class={`${styles.checkbox} ${isSelected ? styles.checked : ""}`} />
                        : <Icon name="checked" class={`${styles.checkbox} ${styles.disabled} ${isSelected ? styles.checked : ""}`} />
                      }
                      
                    </div>
                  );
                })
              )}
            </List>
          </PullRefresh>
        </div>

        <div class={styles.footer}>
          <span class={styles["selected-count"]}>已选: {selectedIds.value.length} 个</span>
          <Button type="primary" class={styles["confirm-btn"]} onClick={handleConfirm} disabled={selectedIds.value.length === 0}>
            确定
          </Button>
        </div>

        <Popup v-model:show={showFilter.value} position="right" class={styles["filter-popup-content"]}>
          <div class={styles["filter-body"]}>
            <div class={styles["section-title"]}>设备状态</div>
            <div class={styles["status-options"]}>
              <div
                class={`${styles["status-option"]} ${tempFilterStatus.value === "ONLINE" ? styles.active : ""}`}
                onClick={() => (tempFilterStatus.value = tempFilterStatus.value === "ONLINE" ? null : "ONLINE")}
              >
                在线
              </div>
              <div
                class={`${styles["status-option"]} ${tempFilterStatus.value === "OFFLINE" ? styles.active : ""}`}
                onClick={() => (tempFilterStatus.value = tempFilterStatus.value === "OFFLINE" ? null : "OFFLINE")}
              >
                离线
              </div>
            </div>
          </div>
          <div class={styles["filter-footer"]}>
            <Button plain type="default" onClick={onFilterReset}>
              重置
            </Button>
            <Button type="primary" onClick={onFilterConfirm}>
              确定
            </Button>
          </div>
        </Popup>
      </div>
    );
  },
});
