import { List, Empty, PullRefresh, Cell, CellGroup, Search, Tabs, Tab, Tag, DropdownMenu, DropdownItem, Cascader } from "vant";
import { computed, defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { DeviceInstancePage, ProductIotCategoryTree } from "@ghcloud/cube-iot-center-service";

import { cubeDeviceCenterService } from "@/api/server";
import { OssPicture } from "@/components/oss-picture/oss-picture";

import styles from "./device-list.module.less";

type DeviceInstancePageAllParams = Parameters<typeof cubeDeviceCenterService.getDeviceInstancePageAll>[0];
type ProductCategoryOption = ProductIotCategoryTree & { children?: ProductCategoryOption[] };

/** 设备列表页 */
export const DeviceList = defineComponent({
  setup: () => {
    const route = useRoute();
    const gridAreaId = route.query.gridAreaId as string;
    const deviceStatus = route.query.deviceStatus as string;
    const activeTab = ref("");
    const dataSource = ref<DeviceInstancePage[]>([]);
    const loading = ref(false);
    const finished = ref(false);
    const refreshing = ref(false);
    const dropdownMenuRef = ref<{ close: () => void }>();
    const categoryOptions = ref<ProductCategoryOption[]>([]);
    const statusOptions = [
      { text: "全部状态", value: "" },
      { text: "在线", value: true },
      { text: "离线", value: false },
    ];
    const parseDeviceStatus = (status?: string): boolean | "" => {
      if (status === "true") {
        return true;
      }
      if (status === "false") {
        return false;
      }
      return "";
    };
    const search = reactive<{
      tagCodes?: string[];
      categoryCode?: string;
      deviceState?: boolean | "";
      anyAreaId?: string;
      pageSize: number;
      pageNumber: number;
      appAreaId?: string;
      areaName?: string;
      categoryName?: string;
      keyword?: string;
      total: number;
    }>({
      anyAreaId: gridAreaId,
      deviceState: parseDeviceStatus(deviceStatus),
      categoryCode: "",
      pageNumber: 0,
      total: 0,
      pageSize: 20,
    });
    const tabsList = ref([{ title: "全部", value: "ALL" }]);
    const statusTitle = computed(() => {
      if (typeof search.deviceState === "boolean") {
        return search.deviceState ? "在线" : "离线";
      }
      return "设备状态";
    });
    const genreTitle = computed(() => {
      return search.categoryName || "设备品类";
    });
    const removeEmptyChildren = (options: ProductCategoryOption[]): ProductCategoryOption[] => {
      options.forEach((option) => {
        if (option.children?.length) {
          removeEmptyChildren(option.children);
          return;
        }
        delete option.children;
      });
      return options;
    };
    const getProductCategoryTree = async (): Promise<void> => {
      const res = await cubeDeviceCenterService.getIotProductCategoryTree();
      categoryOptions.value = [
        {
          categoryName: "全部品类",
          categoryCode: "",
          categoryCodeConcat: "",
        },
        ...removeEmptyChildren(res as ProductCategoryOption[]),
      ];
    };
    const handleCategoryFinish = (selected: { selectedOptions: ProductCategoryOption[]; tabIndex: number }): void => {
      const category = selected.selectedOptions[selected.tabIndex];
      search.categoryCode = category?.categoryCodeConcat || "";
      search.categoryName = category?.categoryName || "";
      dropdownMenuRef.value?.close();
      onSearch();
    };
    // 获取设备列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true;
        search.pageNumber += 1;
        const payload: DeviceInstancePageAllParams = {
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
        };
        if (search.anyAreaId) {
          payload.anyAreaId = search.anyAreaId;
        }
        if (search.categoryCode) {
          payload.categoryCode = search.categoryCode;
        }
        if (typeof search.deviceState === "boolean") {
          payload.deviceState = search.deviceState;
        }
        if (search.keyword) {
          payload.keyword = search.keyword;
        }
        if (search.tagCodes) {
          payload.tagCodes = search.tagCodes;
        }
        const res = await cubeDeviceCenterService.getDeviceInstancePageAll(payload);
        search.total = res.total;
        if (res.total <= search.pageSize || res.records.length < search.pageSize) {
          finished.value = true;
        }
        if (!dataSource.value || search.pageNumber === 1) {
          dataSource.value = [];
        }
        dataSource.value = [...dataSource.value, ...res.records];
      } catch {
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

    // const handleCollect = async (id: string, isCollect: boolean): Promise<void> => {
    //   const msg = isCollect ? "取消收藏成功" : "收藏成功";
    //   await cubeSecurityManagementService.addDeviceCollection({ deviceId: id, applicationCode });
    //   showToast(msg);
    //   onSearch();
    // };
    onMounted(async () => {
      await getProductCategoryTree();
    });

    return (): VNode => (
      <div>
        <CubeNavBar showBack title={"设备列表"}></CubeNavBar>
        <Search v-model={search.keyword} placeholder="根据设备名称进行搜索" onSearch={onSearch} />
        <DropdownMenu ref={dropdownMenuRef} class={styles["dropdown-menu"]}>
          <DropdownItem v-model={search.deviceState} title={statusTitle.value} options={statusOptions} onChange={onSearch} />
          <DropdownItem title={genreTitle.value}>
            <Cascader
              title="请选择设备品类"
              field-names={{ text: "categoryName", value: "categoryCodeConcat", children: "children" }}
              options={categoryOptions.value}
              onClose={() => {
                dropdownMenuRef.value?.close();
              }}
              onFinish={handleCategoryFinish}
            />
          </DropdownItem>
        </DropdownMenu>
        <Tabs v-model:active={activeTab.value} style={{ border: "none" }} shrink onChange={onSearch}>
          {tabsList.value.map((item) => (
            <Tab key={item.value} name={item.value} title={`共计${search.total}条`}>
              <div style={{ height: "calc(100vh - 190px)", background: "#f3f7fa" }}>
                <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: "100%", overflow: "auto" }}>
                  <List
                    v-model:loading={loading.value}
                    finished={finished.value}
                    finished-text={dataSource.value.length === 0 ? "" : "暂无更多数据"}
                    onLoad={onLoad}
                  >
                    {dataSource.value &&
                      dataSource.value.length > 0 &&
                      dataSource.value.map((item, index) => (
                        <CellGroup inset class={styles["cell-group"]} key={item.id ?? item.code ?? String(index)}>
                          <Cell class={styles.cell}>
                            <div class={styles["cell-item"]}>
                              <OssPicture id={item.picture ? String(item.picture) : ""} />
                              <div>
                                <div class={styles["cell-title"]}>
                                  <Tag text-color="#ffffff" color={item?.status?.onlineState ? "#58bd6b" : "#858585"}>
                                    {item?.status?.onlineState ? "在线" : "离线"}
                                  </Tag>
                                  <span>{item?.name || "--"}</span>
                                </div>
                                <div class={styles["cell-content"]}>
                                  <label>所在区域：</label>
                                  <span>{item.area?.pathName || "--"}</span>
                                </div>
                              </div>
                              {/* <Icon
                                size="16"
                                name="star"
                                color={item.collection ? "var(--van-primary-color)" : "#858585"}
                                onClick={(e: MouseEvent) => {
                                  e.stopPropagation();
                                  handleCollect(item.deviceId, item.collection);
                                }}
                              /> */}
                            </div>
                          </Cell>
                        </CellGroup>
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
