import styles from "./device-product.module.less";
import { cubeDeviceCenterService } from "@/api/server";
import { SkeletonBody } from "@/components/skeleton-body/skeleton-body";
import { useMetaTitle } from "@/hooks/use-meta-title-hook";
import { useScanCode } from "@/hooks/use-scan-code";
import { storeKill } from "@/store/kill";
import { useTaskStore } from "@/store/task";
import { getAssetsFile } from "@/utils/index";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import type { ProductCategoryTree, Product } from "@ghcloud/cube-iot-center-service";
import { Search, Empty, Popup, Button, Toast, List } from "vant";
import { computed, defineComponent, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

/**
 * 设备添加页面组件
 */
export const DeviceProduct = defineComponent({
  setup: () => {
    cubeAppService.onVisibilityNativeAppBar(false);
    useMetaTitle();
    const router = useRouter();
    const route = useRoute();
    const showDevicePicker = ref(false);
    const loading = ref(true);

    const store = storeKill();
    const taskStore = useTaskStore();
    const { scanCodeResult, handleScanResult } = useScanCode();

    // 设备类型选项卡
    const tabActive = ref("");
    const tabChildrenActive = ref("");
    const tabLastActive = ref("");
    const tabs = ref<ProductCategoryTree[]>([]);
    const tabsChildren = ref<ProductCategoryTree[]>([]);
    const tabsLast = ref<ProductCategoryTree[]>([]);
    const allTabs = ref<ProductCategoryTree[]>([]);
    const currentTabLevel = ref(0); // 当前标签级别

    // 设备列表数据
    const deviceList = ref<any[]>([]);
    const deviceListFinished = ref(false); // 设备列表是否加载完成
    const deviceListLoading = ref(false); // 设备列表加载状态

    // 设备列表分页参数
    const tableSearch = reactive({
      pageNumber: 1,
      pageSize: 20,
      prodCategoryId: undefined as string | undefined,
      prodName: undefined as string | undefined,
      total: 0,
    });

    // 加载状态
    const modalLoading = ref(false);

    // 处理返回按钮点击
    const handleBack = (): void => {
      router.back();
    };

    // 处理搜索
    const onSearch = (val: string): void => {
      tableSearch.pageNumber = 1;
      deviceList.value = [];
      deviceListFinished.value = false;

      getContactProduct();
    };

    /**
     * 处理设备类型切换
     * 如果选中的分类有子节点，则展开子节点
     * 如果没有子节点，则加载该分类下的产品列表
     */
    const onTabChange = (tab: ProductCategoryTree): void => {
      // 如果有子节点，则展开子节点
      if (tab.children && tab.children.length > 0) {
        tabsChildren.value = tab.children;
        onChildrenTabChange(tab.children[0]);
        tabActive.value = tab.id;
      } else {
        // 没有子节点，直接切换
        tabActive.value = tab.id;
        tabsChildren.value = [];
        tabsLast.value = [];
        tabChildrenActive.value = "";
        tabLastActive.value = "";
        resetDeviceList();
        getContactProduct();
      }
    };
    const onChildrenTabChange = (tab: ProductCategoryTree): void => {
      // 如果有子节点，则展开子节点
      if (tab.children && tab.children.length > 0) {
        tabsLast.value = tab.children;
        onTabLastChange(tab.children[0]);
        tabChildrenActive.value = tab.id;
      } else {
        tabChildrenActive.value = tab.id;
        tabsLast.value = [];
        tabLastActive.value = "";
        resetDeviceList();
        getContactProduct();
      }
    };
    const onTabLastChange = (tab: ProductCategoryTree): void => {
      tabLastActive.value = tab.id;
      resetDeviceList();
      getContactProduct();
    };

    /**
     * 根据ID在分类树中查找节点
     */
    const findCategoryById = (categories: ProductCategoryTree[], id: string): ProductCategoryTree | undefined => {
      for (const category of categories) {
        if (category.id === id) {
          return category;
        }
        if (category.children && category.children.length > 0) {
          const found = findCategoryById(category.children, id);
          if (found) {
            return found;
          }
        }
      }
      return undefined;
    };

    // 重置设备列表
    const resetDeviceList = (): void => {
      deviceList.value = [];
      tableSearch.pageNumber = 1;
      deviceListFinished.value = false;
    };

    // 处理设备选择
    const handleSelectDevice = (product: Product): void => {
      store.selectProduct = product;

      const { type } = route.query;

      if (type === "task") {
        taskStore.setProduct({
          id: String(product.id),
          name: product.prodName,
        });
        router.push({ path: "/device-select", query: { type: "task", productId: product.id } });
        return;
      }

      if (["hand", "scan"].includes(type as string)) {
        handleDeviceAdd(type as "hand" | "scan");
      } else {
        showDevicePicker.value = true;
      }
    };

    /**
     * 获取产品分类数据
     * 使用getProductCategoryTree获取完整的分类树结构
     */
    const getTableData = async (isLoadMore = false): Promise<void> => {
      try {
        if (!isLoadMore) {
          loading.value = true;
        }
        modalLoading.value = true;

        // 使用getProductCategoryTree获取完整的分类树
        const treeData = await cubeDeviceCenterService.getProductCategoryTree();

        if (treeData && treeData.length > 0) {
          allTabs.value = treeData; // 保存完整的分类树

          // 如果是在顶级，显示顶级分类
          if (currentTabLevel.value === 0) {
            tabs.value = treeData;
            if (treeData.length > 0) {
              onTabChange(treeData[0]);
            }
          }
        }
      } catch (error) {
        Toast.fail("获取产品分类失败");
      } finally {
        modalLoading.value = false;
        loading.value = false;
      }
    };

    // 获取品类关联产品
    const getContactProduct = async (concat: boolean = false): Promise<void> => {
      if (!concat) {
        tableSearch.pageNumber = 1;
      }
      try {
        if (tableSearch.pageNumber === 1) {
          deviceListLoading.value = true;
        }

        tableSearch.prodCategoryId = activeId.value;

        const params = {
          pageNumber: tableSearch.pageNumber,
          pageSize: tableSearch.pageSize,
          prodName: tableSearch.prodName || undefined,
          prodCategoryId: activeId.value,
        };

        const { records, total } = (await cubeDeviceCenterService.getProductPage(params)) as {
          records: any[];
          total: number;
        };

        if (tableSearch.pageNumber === 1) {
          deviceList.value = records || [];
        } else {
          // 追加数据
          deviceList.value = [...deviceList.value, ...(records || [])];
        }

        tableSearch.total = total;
        deviceListFinished.value = deviceList.value.length >= total;
      } catch (error) {
        Toast.fail("获取产品列表失败");
        if (tableSearch.pageNumber === 1) {
          deviceList.value = [];
        }
      } finally {
        deviceListLoading.value = false;
      }
    };

    // 加载更多设备
    const loadMoreDevices = async (): Promise<void> => {
      if (!deviceListFinished.value && !deviceListLoading.value) {
        tableSearch.pageNumber++;
        await getContactProduct(true);
      }
    };

    const onCancel = () => {
      showDevicePicker.value = false;
    };

    const handleDeviceAdd = async (type: "scan" | "hand"): Promise<void> => {
      if (type === "scan") {
        scanCodeResult.value = {};
        await handleScanResult();
      }
      if (type === "hand") {
        router.push({ path: "/device-manual-add" });
      }
      showDevicePicker.value = false;
    };

    // 监听搜索关键字变化
    watch(
      () => tableSearch.prodName,
      (newVal) => {
        if (newVal === "") {
          // 清空搜索时重新加载
          resetDeviceList();
          if (activeId.value) {
            getContactProduct();
          }
        }
      },
    );

    const activeId = computed(() => tabLastActive.value || tabChildrenActive.value || tabActive.value || "");
    const showFilter = ref(false);
    const filterSearch = ref("");
    const filterTabsList = computed(() => allTabs.value.filter((item: ProductCategoryTree) => item.itemLabel.includes(filterSearch.value)));
    const filterTabs = () => {
      showFilter.value = true;
      filterSearch.value = "";
    };
    const bodyClick = () => {
      showFilter.value = false;
    };
    const navbarFilterMainClick = (e: Event) => {
      e.stopPropagation();
    };
    const onFilterSearch = (val: string): void => {
      filterSearch.value = val;
    };
    onMounted(() => {
      // 获取设备类型和设备列表
      getTableData();
      // getContactProduct()
    });

    return (): JSX.Element => (
      <div class={styles.container}>
        <div class={styles.searchBox}>
          <Search v-model={tableSearch.prodName} placeholder="产品名称" onSearch={onSearch} shape="round" />
        </div>
        {loading.value ? (
          <SkeletonBody />
        ) : (
          <div class={styles.content}>
            {/* 标签导航栏 */}
            <div class={styles.navbarBox}>
              <div class={styles.navbar}>
                <div class={styles.tabList}>
                  {tabs.value.map((tab) => (
                    <div
                      class={[styles.tab, tabActive.value === tab.id ? styles.active : ""]}
                      onClick={() => onTabChange(tab)}
                      key={tab.id}
                    >
                      <span class={tab.children && tab.children.length > 0 ? styles.hasChildrenTab : ""}>{tab.itemLabel}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div class={styles.tabListFilter} onClick={filterTabs}>
                <img src={getAssetsFile("filter.png")} alt="" />
              </div>
              {showFilter.value && (
                <div class={styles.navbarFilterBody} onClick={bodyClick}>
                  <div
                    class={styles.navbarFilterMain}
                    onClick={(e) => {
                      navbarFilterMainClick(e);
                    }}
                  >
                    <div class={styles.searchBox}>
                      <Search v-model={filterSearch.value} placeholder="产品品类名称" onSearch={onFilterSearch} shape="round" />
                    </div>
                    <div class={styles.filterTitle}>
                      <span>产品品类</span>
                    </div>

                    <div class={styles.navbarFilter}>
                      {filterTabsList.value.length > 0 ? (
                        filterTabsList.value.map((tab) => (
                          <div
                            class={[styles.navbarFilterTab, tabActive.value === tab.id ? styles.filterActive : ""]}
                            onClick={() => {
                              showFilter.value = false;
                              onTabChange(tab);
                            }}
                            key={tab.id}
                          >
                            {tab.itemLabel}
                          </div>
                        ))
                      ) : (
                        <Empty style={{ width: "100%", height: "100%" }} description="暂无产品品类" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* 设备列表 */}
            <div class={styles.main}>
              {tabsChildren.value.length > 0 && (
                <div class={styles.childrenTabList}>
                  <List loading={modalLoading.value}>
                    {tabsChildren.value.map((tab) => (
                      <div
                        class={[styles.childrenTab, tabChildrenActive.value === tab.id ? styles.active : ""]}
                        onClick={() => onChildrenTabChange(tab)}
                        key={tab.id}
                      >
                        <span class={tab.children && tab.children.length > 0 ? styles.hasChildrenTab : ""}>{tab.itemLabel}</span>
                      </div>
                    ))}
                  </List>
                </div>
              )}
              <div class={styles.deviceBody} style={{ width: tabsChildren.value.length > 0 ? "calc(100% - 110px)" : "100%" }}>
                {tabsLast.value.length > 0 && (
                  <div class={styles.backTabBody}>
                    <div class={styles.backTabList}>
                      {tabsLast.value.map((tab) => (
                        <div
                          class={[styles.backTab, tabLastActive.value === tab.id ? styles.active : ""]}
                          onClick={() => onTabLastChange(tab)}
                          key={tab.id}
                        >
                          <span class={tab.children && tab.children.length > 0 ? styles.hasChildrenTab : ""}>{tab.itemLabel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div class={styles.deviceList} style={{ height: tabsLast.value.length > 0 ? "calc(100% - 50px)" : "100%" }}>
                  <List
                    loading={deviceListLoading.value}
                    finished={deviceListFinished.value}
                    onLoad={loadMoreDevices}
                    immediateCheck={false}
                    loadingText="加载中..."
                    finishedText={deviceList.value.length ? "没有更多了" : ""}
                  >
                    {deviceList.value.length > 0 ? (
                      <div class={styles.grid}>
                        {deviceList.value.map((device) => (
                          <div class={styles.deviceItem} key={device.id} onClick={() => handleSelectDevice(device)}>
                            <div class={styles.deviceIcon}>
                              <img src={getAssetsFile("device-default.png")} alt="设备图标" />
                            </div>
                            <div class={styles.deviceInfo}>
                              <div class={styles.deviceName}>{device.prodName}</div>
                              <div class={styles.deviceCode}>{device.prodBrandName}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty description="暂无产品" />
                    )}
                  </List>
                </div>
              </div>
            </div>
          </div>
        )}

        <Popup
          v-model:show={showDevicePicker.value}
          position="bottom"
          round
          closeOnClickOverlay={true}
          onClickOverlay={onCancel}
          teleport="body"
        >
          <div class={styles["add-device"]}>
            <div class={styles["add-title"]}>选择添加方式</div>
            <div class={styles["add-flex"]}>
              <div class={styles["add-item"]} onClick={() => handleDeviceAdd("scan")}>
                <img class={styles["add-item-icon"]} src={getAssetsFile("scan-add.png")} alt="扫码添加" />
                <div class={styles["add-item-text"]}>扫码添加</div>
              </div>
              <div class={styles["add-item"]} onClick={() => handleDeviceAdd("hand")}>
                <img class={styles["add-item-icon"]} src={getAssetsFile("handle-add.png")} alt="手动添加" />
                <div class={styles["add-item-text"]}>手动添加</div>
              </div>
            </div>
            <Button class={styles["bottom-button"]} onClick={onCancel}>
              取消
            </Button>
          </div>
        </Popup>
      </div>
    );
  },
});
