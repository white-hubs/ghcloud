import { Button, Empty, Icon, List, Popup, PullRefresh, Search } from "vant";
import { computed, defineComponent, reactive, ref, watch, type PropType } from "vue";

import { cubeOuaaService } from "@/api/server";

import styles from "./index.module.less";

export type SelectionType = "USER" | "DEPT" | "ROLE" | "POST";
type UserFilterType = "dept" | "status" | "";

export const SelectionPopup = defineComponent({
  name: "SelectionPopup",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String as PropType<SelectionType>,
      default: "USER",
    },
    selectedIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    single: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:show", "confirm"],
  setup: (props, { emit }) => {
    const search = reactive({
      pageNumber: 0,
      pageSize: 10,
      keyword: "",
      deptId: "",
      workStatus: "",
    });

    const deptOptions = ref<{ text: string; value: string }[]>([]);
    const statusOptions = [
      { text: "全部", value: "" },
      { text: "在岗", value: "WORKING" },
      { text: "休息", value: "REST" },
    ];

    const dataSource = ref<any[]>([]);
    const loading = ref(false);
    const finished = ref(false);
    const refreshing = ref(false);
    const localSelectedIds = ref<string[]>([]);
    const allData = ref<any[]>([]); // For non-paginated data (Dept/Role/Post)
    const selectedPanelVisible = ref(false);
    const selectedItemMap = ref<Record<string, any>>({});
    const activeFilter = ref<UserFilterType>("");

    const getItemId = (item: any): string => String(item.id || item.value || "");
    const getItemName = (item: any): string => item.name || item.label || item.username || getItemId(item);
    const cacheItems = (items: any[]): void => {
      const next = { ...selectedItemMap.value };
      items.forEach((item) => {
        const id = getItemId(item);
        if (id) {
          next[id] = item;
        }
      });
      selectedItemMap.value = next;
    };
    const selectedItems = computed(() => localSelectedIds.value.map((id) => selectedItemMap.value[id] || { id, name: id, label: id }));
    const getOptionText = (options: { text: string; value: string }[], value: string): string =>
      options.find((item) => item.value === value)?.text || "";

    const loadDeptList = async (): Promise<void> => {
      const list = await cubeOuaaService.getDeptList({ enabled: true });
      deptOptions.value = [
        { text: "全部部门", value: "" },
        ...list.map((x: { name: string; id: string }) => ({ text: x.name, value: x.id })),
      ];
    };

    const getOtherData = async () => {
      let data: any[] = [];
      if (props.type === "DEPT") {
        const list = await cubeOuaaService.getDeptList({ enabled: true });
        data = list.map((item) => ({ label: item.name, value: item.id }));
      } else if (props.type === "ROLE") {
        const list = await cubeOuaaService.getRole({ enabled: true });
        data = list.map((item) => ({ label: item.name, value: item.id }));
      } else if (props.type === "POST") {
        const list = await cubeOuaaService.getPositionList({ enabled: true });
        data = list.map((item) => ({ label: item.name, value: item.id }));
      }
      allData.value = data;
      cacheItems(data);
      filterData();
    };

    const filterData = () => {
      if (!search.keyword) {
        dataSource.value = allData.value;
      } else {
        const keyword = search.keyword.toLowerCase();
        dataSource.value = allData.value.filter((item) => item.label.toLowerCase().includes(keyword));
      }
      finished.value = true;
    };

    const onLoad = async () => {
      if (props.type !== "USER") {
        return;
      }
      try {
        loading.value = true;
        search.pageNumber++;
        const res = await cubeOuaaService.getStaffPage({
          keyword: search.keyword,
          enabled: true,
          pageSize: search.pageSize,
          pageNumber: search.pageNumber,
          organizationId: search.deptId,
          workStatus: search.workStatus,
        });

        if (res.total <= search.pageSize * search.pageNumber) {
          finished.value = true;
        }
        if (res.records.length < search.pageSize) {
          finished.value = true;
        }
        if (search.pageNumber === 1) {
          dataSource.value = res.records;
        } else {
          dataSource.value = [...dataSource.value, ...res.records];
        }
        cacheItems(res.records);
      } catch {
        finished.value = true;
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };

    const onRefresh = () => {
      if (props.type === "USER") {
        search.pageNumber = 0;
        finished.value = false;
        onLoad();
      } else {
        refreshing.value = false;
      }
    };

    const onSearch = () => {
      if (props.type === "USER") {
        if (search.keyword) {
          search.deptId = "";
          search.workStatus = "";
        }
        activeFilter.value = "";
        search.pageNumber = 0;
        finished.value = false;
        onLoad();
      } else {
        filterData();
      }
    };

    const itemClick = (id: string) => {
      const item = dataSource.value.find((x) => getItemId(x) === id);
      if (item) {
        cacheItems([item]);
      }
      const idx = localSelectedIds.value.indexOf(id);
      if (idx === -1) {
        if (props.single) {
          localSelectedIds.value = [id];
          return;
        }
        localSelectedIds.value.push(id);
      } else {
        localSelectedIds.value.splice(idx, 1);
      }
    };

    const removeSelected = (id: string): void => {
      const idx = localSelectedIds.value.indexOf(id);
      if (idx > -1) {
        localSelectedIds.value.splice(idx, 1);
      }
      if (localSelectedIds.value.length === 0) {
        selectedPanelVisible.value = false;
      }
    };

    const selectFilterOption = (type: Exclude<UserFilterType, "">, value: string): void => {
      if (type === "dept") {
        search.deptId = value;
      } else {
        search.workStatus = value;
      }
      activeFilter.value = "";
      onSearch();
    };

    watch(
      () => search.keyword,
      (keyword) => {
        if (props.type === "USER" && keyword) {
          search.deptId = "";
          search.workStatus = "";
        }
      },
    );

    watch(
      () => props.show,
      async (val) => {
        if (val) {
          localSelectedIds.value = [...props.selectedIds];
          selectedPanelVisible.value = false;
          activeFilter.value = "";
          search.keyword = "";
          search.deptId = "";
          search.workStatus = "";
          search.pageNumber = 0;
          finished.value = false;
          dataSource.value = [];
          if (props.type === "USER") {
            await loadDeptList();
            onLoad();
          } else {
            getOtherData();
          }
        }
      },
    );

    const onConfirm = () => {
      emit("confirm", localSelectedIds.value);
      emit("update:show", false);
    };

    const onCancel = () => {
      emit("update:show", false);
    };

    return () => (
      <Popup v-model:show={props.show} position="right" style={{ width: "100%", height: "100%" }}>
        <div class={styles.selectionPopup}>
          <Search v-model={search.keyword} placeholder="请输入名称" onSearch={onSearch} onClear={onSearch} />
          {props.type === "USER" && (
            <div class={styles.filterWrap}>
              <div class={styles.filterBar}>
                <div
                  class={[styles.filterItem, activeFilter.value === "dept" && styles.active]}
                  onClick={() => {
                    activeFilter.value = activeFilter.value === "dept" ? "" : "dept";
                  }}
                >
                  <span>{getOptionText(deptOptions.value, search.deptId) || "全部部门"}</span>
                  <Icon name={activeFilter.value === "dept" ? "arrow-up" : "arrow-down"} />
                </div>
                <div
                  class={[styles.filterItem, activeFilter.value === "status" && styles.active]}
                  onClick={() => {
                    activeFilter.value = activeFilter.value === "status" ? "" : "status";
                  }}
                >
                  <span>{getOptionText(statusOptions, search.workStatus) || "全部"}</span>
                  <Icon name={activeFilter.value === "status" ? "arrow-up" : "arrow-down"} />
                </div>
              </div>
              {activeFilter.value && (
                <div class={styles.filterPanel}>
                  {(activeFilter.value === "dept" ? deptOptions.value : statusOptions).map((item) => (
                    <div
                      class={[
                        styles.filterOption,
                        (activeFilter.value === "dept" ? search.deptId : search.workStatus) === item.value && styles.selected,
                      ]}
                      key={item.value}
                      onClick={() => {
                        selectFilterOption(activeFilter.value as Exclude<UserFilterType, "">, item.value);
                      }}
                    >
                      <span>{item.text}</span>
                      {(activeFilter.value === "dept" ? search.deptId : search.workStatus) === item.value && <Icon name="success" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div class={styles.listContainer}>
            <PullRefresh v-model={refreshing.value} onRefresh={onRefresh}>
              <List
                v-model:loading={loading.value}
                finished={finished.value}
                finished-text={dataSource.value.length === 0 ? "" : "暂无更多数据"}
                onLoad={onLoad}
              >
                {dataSource.value.map((item) => (
                  <div
                    class={styles.cellGroup}
                    key={item.id || item.value}
                    onClick={() => {
                      itemClick(getItemId(item));
                    }}
                  >
                    {props.type === "USER" && (
                      <div class={styles.userIcon}>
                        {item.fileVO?.path ? (
                          <img src={item.fileVO?.path} alt="" />
                        ) : (
                          <Icon name="user" size="30px" class={styles.iconfont} />
                        )}
                      </div>
                    )}
                    <div class={styles.info}>
                      <div class={styles.cellTitle}>{item.name || item.label}</div>
                      {props.type === "USER" && (
                        <>
                          <div class={styles.cell}>部门：{item.organizations?.map((org: any) => org.name).join("/")}</div>
                          <div class={styles.cell}>岗位：{item.positions?.map((pos: any) => pos.name).join("/")}</div>
                        </>
                      )}
                    </div>
                    <div class={styles.check}>
                      {localSelectedIds.value.includes(item.id || item.value) && <Icon name="success" class={styles.iconfont} />}
                    </div>
                  </div>
                ))}
                {dataSource.value.length === 0 && <Empty description="暂无数据" />}
              </List>
            </PullRefresh>
          </div>
          {selectedPanelVisible.value && localSelectedIds.value.length > 0 && (
            <div class={styles.selectedPanel}>
              {selectedItems.value.map((item) => {
                const id = getItemId(item);
                return (
                  <div class={styles.selectedItem} key={id}>
                    <span>{getItemName(item)}</span>
                    <Icon
                      name="cross"
                      class={styles.selectedRemove}
                      onClick={() => {
                        removeSelected(id);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
          <div class={styles.footerButtonGroup}>
            <div
              class={[styles.footerButtonTitle, localSelectedIds.value.length > 0 && styles.clickable]}
              onClick={() => {
                if (localSelectedIds.value.length > 0) {
                  selectedPanelVisible.value = !selectedPanelVisible.value;
                }
              }}
            >
              已选：{localSelectedIds.value.length} 条
              {localSelectedIds.value.length > 0 && (
                <Icon name={selectedPanelVisible.value ? "arrow-down" : "arrow-up"} class={styles.footerArrow} />
              )}
            </div>
            <Button block onClick={onCancel}>
              取消
            </Button>
            <Button block type="primary" onClick={onConfirm}>
              确定
            </Button>
          </div>
        </div>
      </Popup>
    );
  },
});
