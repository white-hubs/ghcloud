import styles from "./stock-detail.module.less";
import { cubeAssetManagementService } from "@/api/server";
import { useMetaTitle } from "@/hooks/use-meta-title-hook";
import { getAssetStatus, getAssetStatusColor } from "@/views/entry/type";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { CubeAppBusinessBridge } from "@ghcloud/cube-app-js-sdk";
import type { AssetType, CheckAsset } from "@ghcloud/cube-asset-management-service";
import dayjs from "dayjs";
import qs from "qs";
import { CellGroup, Cell, Tabs, Tab, List, Button, Image, PullRefresh, showToast, showDialog, showNotify, Icon, Empty } from "vant";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
/** 盘点详情页面 */

export const StockDetail = defineComponent({
  setup: () => {
    const route = useRoute();
    const loading = ref(false);
    const finished = ref(false);
    const refreshing = ref(false);
    const detail = ref<CheckAsset>();
    const dataSource = ref<AssetType[]>();
    const activeTab = ref("");
    const router = useRouter();
    onMounted(async () => {
      useMetaTitle();
      getTaskDetail();
    });
    const tabList = ref([
      { title: "待盘", value: "INCOMPLETE", num: 0 },
      { title: "已盘", value: "COMPLETED", num: 0 },
      { title: "盘赢", value: "WIN", num: 0 },
      { title: "盘亏", value: "LOSS", num: 0 },
      { title: "异常", value: "ABNORMAL", num: 0 },
    ]);
    // 详细信息
    const getTaskDetail = async (): Promise<void> => {
      const { records } = await cubeAssetManagementService.getTaskByUserIdPage({
        taskId: (route.query.id as string) ?? "",
        pageNumber: 1,
        pageSize: 1,
      });
      detail.value = records[0];
      tabList.value.forEach((x) => {
        switch (x.value) {
          case "INCOMPLETE":
            x.num = detail.value?.checkWaitNumber ?? 0;
            break;
          case "COMPLETED":
            x.num = detail.value?.checkCompleteNumber ?? 0;
            break;
          case "WIN":
            x.num = detail.value?.checkWinNumber ?? 0;
            break;
          case "LOSS":
            x.num = detail.value?.checkLossNumber ?? 0;
            break;
          case "ABNORMAL":
            x.num = detail.value?.abnormalNumber ?? 0;
            break;
        }
      });
    };
    const search = reactive({
      taskStatus: "INCOMPLETE",
      taskId: (route.query.id as string) ?? "",
      pageNumber: 0,
      total: 1,
      pageSize: 20,
    });
    // 获取盘点任务列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true;
        search.pageNumber += 1;
        const res = await cubeAssetManagementService.getCheckTaskByTaskIdPage({ ...search });
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
    const onSearch = (): void => {
      dataSource.value = [];
      search.pageNumber = 0;
      finished.value = false;
      onLoad();
    };
    // 编辑
    const edit = (): void => {
      router.push({
        path: "/take-stock/add-win",
        query: {
          id: route.query.id,
        },
      });
    };
    // 扫码盘点
    const handleStock = async (): Promise<void> => {
      try {
        const code = await CubeAppBusinessBridge.handleBusinessScanCode();
        const scanCode = code.includes("https") ? (qs.parse(code)?.code?.toString() ?? code.toString()) : code.toString();
        const data = await cubeAssetManagementService.getEntityByCode(encodeURIComponent(scanCode.toString()));
        if (!data?.entityId) {
          return;
        }
        if (data?.entityType === "PROPERTY") {
          router.push({ path: "/take-stock/stocktaking", query: { taskId: (route.query.id as string) ?? "", id: data?.entityId } });
        } else {
          showNotify({ type: "danger", message: "目前仅支持资产类型" });
        }
      } catch (err) {
        showNotify({ type: "danger", message: (err as { errorMessage: string }).errorMessage });
      }
    };
    return (): JSX.Element => (
      <div style={{ background: "#f3f7fa", height: "100vh", position: "relative" }}>
        <CubeNavBar
          showBack
          title="盘点详情"
          rightSlot={() => (
            <>
              <Icon name="scan" size="20" onClick={handleStock} />
            </>
          )}
        />
        <CellGroup class={styles["cell-group"]}>
          <Cell>
            <div class={styles["cell-title"]}>
              <span
                class={styles.status}
                style={{ background: `${detail.value?.status === "UNDONE" ? "var(--van-orange)" : "var(--van-primary-color)"}` }}
              >
                {detail.value?.status === "UNDONE" ? "未完成" : "已完成"}
              </span>
              <span>{detail.value?.taskName}</span>
            </div>
          </Cell>
          <Cell class={styles.cell}>
            <div class={styles["cell-item-head"]}>
              <label>盘点负责人：</label>
              <span>{detail.value?.checkUserName || "--"}</span>
            </div>
            <div class={styles["cell-item-head"]}>
              <label>盘点资产数：</label>
              <span>{detail.value?.checkTotalNumber || "--"}</span>
            </div>
            <div class={styles["cell-item-head"]}>
              <label>预计完成时间：</label>
              <span>{detail.value?.estimateEndTime ? dayjs(detail.value?.estimateEndTime).format("YYYY-MM-DD hh:mm:ss") : "--"}</span>
            </div>
            <div class={styles["cell-item-head"]}>
              <label>实际完成时间：</label>
              <span>{detail.value?.realityEndTime ? dayjs(detail.value?.realityEndTime).format("YYYY-MM-DD hh:mm:ss") : "--"}</span>
            </div>
          </Cell>
        </CellGroup>
        <Tabs
          class={styles["detail-tabs"]}
          v-model:active={activeTab.value}
          title-active-color="var(--van-primary-color)"
          line-width="24px"
          shrink
          onChange={() => {
            search.taskStatus = activeTab.value;
            onSearch();
          }}
        >
          {tabList.value.map((x) => (
            <Tab title={`${x.title}(${x.num})`} name={x.value} key={x.value}>
              <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: "61vh", overflow: "auto" }}>
                <List
                  v-model:loading={loading.value}
                  finished={finished.value}
                  finished-text={dataSource.value?.length === 0 ? "" : "暂无更多数据"}
                  onLoad={onLoad}
                  class={styles.list}
                >
                  {dataSource.value?.map((item) => (
                    <CellGroup class={styles["cell-group"]} key={item.name}>
                      <Cell>
                        <div class={styles["cell-title"]}>
                          <span class={styles.status} style={{ background: `${getAssetStatusColor.get(item.status ?? "")}` }}>
                            {getAssetStatus.get(item.status ?? "")}
                          </span>
                          <span>{item.name}</span>
                        </div>
                      </Cell>
                      <Cell
                        class={styles.cell}
                        onClick={() => {
                          if (item.chooseType) {
                            if (x.value === "INCOMPLETE") {
                              router.push({
                                path: "/take-stock/stocktaking",
                                query: { taskId: (route.query.id as string) ?? "", id: item.id },
                              });
                            }
                          } else {
                            showToast("请扫码盘点");
                          }
                        }}
                      >
                        <div class={styles["cell-item"]}>
                          <label style="color:#666666">财务编码：</label>
                          <span>{item?.financeNumber || "--"}</span>
                        </div>
                        <div class={styles["cell-item"]}>
                          <label>资产类别：</label>
                          <span>{item?.typeName || "--"}</span>
                        </div>
                        <div class={styles["cell-item"]}>
                          <label>购入日期：</label>
                          <span>{item.purchaseDate ? dayjs(item.purchaseDate).format("YYYY-MM-DD") : "--"}</span>
                        </div>
                        <div class={styles["cell-item"]}>
                          <label>使用部门：</label>
                          <span> {item.receiveDepName || "--"} </span>
                        </div>
                        <div class={styles["cell-item"]}>
                          <label>使用人员：</label>
                          <span>{item.receiveUserName || "--"}</span>
                        </div>
                        <Image class={styles.img} src={item?.imgs?.[0]?.path} width="70" height="70" alt="" />
                      </Cell>
                      <Cell v-show={x.value === "INCOMPLETE"}>
                        <div class={styles.operate}>
                          <div
                            onClick={() => {
                              router.push({
                                path: "/take-stock/abnormal",
                                query: { id: item.id, taskId: (route.query.id as string) ?? "" },
                              });
                            }}
                          >
                            转异常
                          </div>
                          <div
                            onClick={() => {
                              showDialog({
                                title: "资产盘亏",
                                showCancelButton: true,
                                message: () => (
                                  <div>
                                    请确认资产<span style="color:var(--van-primary-color)">{item.name}</span>为
                                    <span style="color:red">盘亏</span>状态
                                  </div>
                                ),
                              }).then(async () => {
                                try {
                                  await cubeAssetManagementService.submitProperty({
                                    taskId: (route.query.id as string) ?? "",
                                    propertyId: item.id ?? "",
                                    checkStatus: "LOSS",
                                  });
                                  onSearch();
                                  getTaskDetail();
                                  showNotify({ type: "success", message: "提交成功" });
                                } catch (err) {
                                  showNotify({ type: "danger", message: (err as { errorMessage: string }).errorMessage });
                                }
                              });
                            }}
                          >
                            盘亏
                          </div>
                        </div>
                      </Cell>
                    </CellGroup>
                  ))}
                  {dataSource.value?.length === 0 && search.pageNumber === 1 && <Empty description="暂无数据" />}
                </List>
              </PullRefresh>
            </Tab>
          ))}
        </Tabs>
        <div class={styles.button}>
          <Button block size="small" type="primary" onClick={edit}>
            新增盘赢
          </Button>
        </div>
      </div>
    );
  },
});
