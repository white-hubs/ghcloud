import { getAssetStatus, getAssetStatusColor } from "../entry/type";
import styles from "./asset-list.module.less";
import { FilterDom } from "./filter/filter-dom";
import { cubeAssetManagementService, cubeMdataService } from "@/api/server";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { AssetType, PropertyDetailed } from "@ghcloud/cube-asset-management-service";
import type { AreaTree } from "@ghcloud/cube-ouaa-service";
import dayjs from "dayjs";
import { List, Empty, PullRefresh, Cell, CellGroup, Search, Field, Picker, Popup, Cascader, type CascaderOption, Icon, Image } from "vant";
import { defineComponent, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

/** 资产清单列表页 */
export const AssetList = defineComponent({
  setup: () => {
    const router = useRouter();
    const dataSource = ref<AssetType[]>([]);
    const loading = ref(false);
    const finished = ref(false);
    const refreshing = ref(false);
    const route = useRoute();
    const gridAreaId = route.query.gridAreaId as string;
    const assetNumber = reactive({
      moneyTotal: 0,
      numberTotal: 0,
    });
    const search = reactive({
      keyword: "",
      status: "",
      statusName: "全部",
      areaId: gridAreaId ?? "",
      areaName: "全部",
      sourceName: "",
      sourceId: "",
      typeId: "",
      typeName: "",
      receiveDepId: "",
      receiveDepName: "",
      purchaseStartDate: "",
      purchaseEndDate: "",
      usageDate: route.query.usageDate as string,
      pageNumber: 0,
      total: 1,
      pageSize: 10,
    });
    // 获取资产清单列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true;
        search.pageNumber += 1;
        const res = await cubeAssetManagementService.getPropertyDetailedPage({ ...search });
        search.total = res.total;

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
      } catch {
        finished.value = true;
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };
    const getPropertyStatistics = async (): Promise<void> => {
      const { numberTotal, moneyTotal } = await cubeAssetManagementService.getPropertyStatistics({ ...search });
      assetNumber.moneyTotal = moneyTotal;
      assetNumber.numberTotal = numberTotal;
    };
    getPropertyStatistics();
    const onSearch = (): void => {
      search.pageNumber = 0;
      finished.value = false;
      onLoad();
      getPropertyStatistics();
    };
    // 进入详情
    const toDetail = (item: AssetType): void => {
      router.push({ path: "/assetList/detail", query: { id: item.id } });
    };
    const statusPicker = ref(false);
    const statusColumns = ref([
      { text: "全部", value: "" },
      { text: "闲置", value: "LEAVE_UNUSED" },
      { text: "在用", value: "MAKE_USE_OF" },
      { text: "报废", value: "WEED_OUT" },
      { text: "报修", value: "REPAIR_REPORT" },
    ]);
    const areaPicker = ref(false);
    const showFilter = ref(false);
    const areaOptions = ref<AreaTree[]>([]);
    const removeNullChild = (option: CascaderOption): void => {
      if (option.children) {
        if (option.children.length === 0) {
          delete option.children;
        } else {
          for (const iterator of option.children) {
            removeNullChild(iterator);
          }
        }
      }
    };
    const getArea = async (): Promise<void> => {
      const res = await cubeMdataService.getAreaTree();
      const list = [{ id: "", name: "全部" }, ...res];
      for (const iterator of list) {
        removeNullChild(iterator);
      }
      areaOptions.value = list as AreaTree[];
    };
    getArea();
    // 选择区域查询
    const handleArea = (options: { selectedOptions: []; value: string }): void => {
      search.areaName = options.selectedOptions.map((item: { name: string }) => item.name).join("/");
      search.areaId = options.value;
      onSearch();
    };
    const handleFilter = (filter: PropertyDetailed): void => {
      search.sourceName = filter.sourceName;
      search.sourceId = filter.sourceId;
      search.typeId = filter.typeId;
      search.typeName = filter.typeName;
      search.receiveDepId = filter.receiveDepId;
      search.receiveDepName = filter.receiveDepName;
      search.purchaseStartDate = filter.purchaseStartDate;
      search.purchaseEndDate = filter.purchaseEndDate;
      search.usageDate = filter.usageDate;
      showFilter.value = false;
      onSearch();
    };
    return (): JSX.Element => (
      <div>
        <CubeNavBar showBack title="资产清单" />
        <Search v-model={search.keyword} placeholder="根据资产名称或编码进行搜索" onSearch={onSearch} />
        <div class={styles.search}>
          <Field
            style="padding:0"
            input-align="center"
            v-model={search.statusName}
            right-icon="arrow-down"
            border={false}
            readonly
            onClick={() => {
              statusPicker.value = true;
            }}
          />
          <Field
            center
            style="padding:0;"
            input-align="center"
            v-model={search.areaName}
            right-icon="arrow-down"
            border={false}
            readonly
            onClick={() => {
              areaPicker.value = true;
            }}
          />
          <div
            style="color:#646566;flex:0 0 100px"
            onClick={() => {
              showFilter.value = true;
            }}
          >
            筛选
            <Icon style="margin-left:2px" name="list-switch" size="18" />
          </div>
        </div>
        <div class={styles.statistics}>
          <p>
            <span>资产金额：</span>
            <span>¥{assetNumber.moneyTotal}</span>
          </p>
          <p>
            <span>资产数量：</span>
            <span>{assetNumber.numberTotal}</span>
          </p>
        </div>
        <div style={{ height: "79vh", background: "#f3f7fa" }}>
          <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: "79vh", overflow: "auto" }}>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text={dataSource.value.length === 0 ? "" : "暂无更多数据"}
              onLoad={onLoad}
            >
              {dataSource.value &&
                dataSource.value.length > 0 &&
                dataSource.value.map((item) => (
                  <CellGroup inset class={styles["cell-group"]} key={item.id}>
                    <Cell>
                      <div class={styles["cell-title"]}>
                        <div class={styles["name-status"]}>
                          <span class={styles.status} style={{ background: `${getAssetStatusColor.get(item?.status ?? "")}` }}>
                            {getAssetStatus.get(item.status ?? "")}
                          </span>
                          <span class={styles.name}>{item.name}</span>
                        </div>
                      </div>
                    </Cell>
                    <Cell
                      class={styles.cell}
                      onClick={() => {
                        toDetail(item);
                      }}
                    >
                      <div class={styles["cell-item"]}>
                        <label style="color:#666666">财务编码：</label>
                        <span>{item?.financeNumber || "--"}</span>
                      </div>
                      <div class={styles["cell-item"]}>
                        <label>资产类别：</label>
                        <span>{item.typeName || "--"}</span>
                      </div>
                      <div class={styles["cell-item"]}>
                        <label>购入日期：</label>
                        <span>{item.purchaseDate ? dayjs(item.purchaseDate).format("YYYY-MM-DD") : "--"}</span>
                      </div>
                      <div class={styles["cell-item"]}>
                        <label>使用部门：</label>
                        <span>{item.receiveDepName || "--"}</span>
                      </div>
                      <div class={styles["cell-item"]}>
                        <label>使用人员：</label>
                        <span>{item.receiveUserName || "--"}</span>
                      </div>
                      <Image class={styles.img} src={item.imgs?.[0]?.path} width="70" height="70" alt="" />
                    </Cell>
                  </CellGroup>
                ))}
              {dataSource.value.length === 0 && search.pageNumber === 1 && <Empty description="暂无数据" />}
            </List>
          </PullRefresh>
        </div>
        <Popup v-model:show={statusPicker.value} round position="bottom">
          <Picker
            columns={statusColumns.value}
            onConfirm={({ selectedOptions }: { selectedOptions: { text: string; value: string }[] }) => {
              search.status = selectedOptions[0].value;
              search.statusName = selectedOptions[0].text;
              statusPicker.value = false;
              onSearch();
            }}
            onCancel={() => {
              statusPicker.value = false;
            }}
          />
        </Popup>
        <Popup v-model:show={areaPicker.value} round position="bottom">
          <Cascader
            v-model={search.areaId}
            onChange={handleArea}
            field-names={{ text: "name", value: "id", children: "children" }}
            options={areaOptions.value}
            onClose={() => {
              areaPicker.value = false;
            }}
          />
        </Popup>
        <Popup v-model:show={showFilter.value} position="right" style={{ width: "100%", height: "100%" }}>
          <FilterDom
            v-model:searchForm={search}
            onSubmit={(filter: PropertyDetailed) => {
              handleFilter(filter);
            }}
          />
        </Popup>
      </div>
    );
  },
});
