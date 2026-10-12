import dayjs from "dayjs";
import { List, Empty, PullRefresh, Cell, CellGroup, Search } from "vant";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { cubeAppService } from "@ghcloud/cube-app-js-sdk";

import { Bar } from "../../../component/bar/bar";
import { FaultType, WorkOrderType, WorkReportService } from "../../../service/work-report/work-report";
import { usePageTitle } from "../use-page-title";
import { FilterDom } from "./filter/filter-dom";
import { BusinessApi, BusinessType } from "./order";
import { FaultColorStatus, FaultStatus } from "./types";

import styles from "./order-list.module.less";

/** 个人工单列表页 */
export const PersonalOrderList = defineComponent({
  setup: () => {
    cubeAppService.onVisibilityNativeAppBar(false);
    const router = useRouter();
    const route = useRoute();
    const dataSource = ref<WorkOrderType[]>([]);
    const loading = ref(false);
    const finished = ref(false);
    const refreshing = ref(false);
    const faultTypeList = ref<FaultType[]>([]);
    const businessType = (route.query.businessType as string) ?? "";
    const applicationCode = (route.query.applicationCode as string) ?? "";
    const type = (route.query.type as string) ?? "";
    const period = (route.query.period as string) ?? "";
    const [startTime = "", endTime = ""] = period ? period.split(",") : [];
    const workReportService = new WorkReportService();
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      type: type && type !== "personal" ? type : "ALL",
      applicationCode,
      businessType,
      status: "",
      keyword: "",
      faultTypeId: "",
      submitTime: period,
      startTime,
      endTime,
    });
    const orderType = computed(() => {
      if (type === "personal" && businessType === "FAULT") {
        return "FAULT_PERSONAL";
      }
      if (type === "personal" && businessType === "HIDDENDANGER") {
        return "HIDDENDANGER_PERSONAL";
      }
      return businessType;
    });
    // 获取工单列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true;
        search.pageNumber++;
        // 仅在路由显式传入 applicationCode 时才携带，避免默认用 businessType 兜底
        const { applicationCode: appCode, ...restSearch } = search;
        const res = await workReportService.getReportList(
          BusinessApi.get(orderType.value) ?? "/flow/process/instance/historical/page",
          appCode ? { ...restSearch, applicationCode: appCode } : restSearch,
        );
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
    const getFaultTypeList = async (): Promise<void> => {
      if (businessType !== "FAULT") {
        faultTypeList.value = [];
        return;
      }
      faultTypeList.value = await workReportService.getFaultTypeList({ applicationCode: businessType });
    };
    // 进入详情
    const toDetail = (item: WorkOrderType): void => {
      sessionStorage.setItem("query", JSON.stringify(route.query));
      router.push({
        path: "/initiating-work-order",
        query: { businessType: item.businessType || businessType, processType: "HANDLING", processId: item.processInstanceId },
      });
    };
    const showRight = ref(false);
    const submit = (): void => {
      search.submitTime = search.startTime && search.endTime ? `${search.startTime},${search.endTime}` : "";
      onSearch();
      showRight.value = false;
    };
    const reset = (): void => {
      search.status = "";
      search.faultTypeId = "";
      search.submitTime = "";
      search.startTime = "";
      search.endTime = "";
    };
    onMounted(() => {
      getFaultTypeList();
    });

    // 从共享的 pageTitle 获取标题值，如果没有则使用默认值
    const { pageTitle: sharedPageTitle } = usePageTitle();
    const pageTitle = businessType ? sharedPageTitle.value || (BusinessType.get(businessType) ?? "工单") : " ";

    return () => (
      <div style={{ height: "100vh", background: "#f3f7fa", overflowY: "scroll" }}>
        <Bar onReset={reset} title={pageTitle} showRight={showRight.value} onSubmit={submit}>
          <FilterDom v-model:searchForm={search} faultTypeList={faultTypeList.value} />
        </Bar>
        <Search v-model={search.keyword} placeholder="根据编号或名称进行搜索" onSearch={onSearch} onClear={onSearch} />
        <div style={{ height: "calc(100vh - 100px)", width: "100%" }}>
          <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: "100%", overflow: "auto" }}>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text={dataSource.value.length === 0 ? "" : "暂无更多数据"}
              onLoad={onLoad}
            >
              {dataSource.value &&
                dataSource.value.length > 0 &&
                dataSource.value.map((item) => {
                  return (
                    <CellGroup inset class={styles["hidden-danger-cell-group"]} key={item.formInstanceId}>
                      <Cell>
                        <div class={styles["hidden-danger-cell-title"]}>
                          <div class={styles["name-status"]}>
                            <span class={[styles["hidden-danger-status"]]} style={{ background: FaultColorStatus.get(item.status) }}>
                              {FaultStatus.get(item?.status)}
                            </span>
                            <span class={styles.name}>{item.instanceName}</span>
                          </div>
                        </div>
                      </Cell>
                      <Cell
                        class={styles["hidden-danger-cell"]}
                        onClick={() => {
                          toDetail(item);
                        }}
                      >
                        <div class={styles["hidden-danger-cell-item"]} v-show={["FAULT", "HIDDENDANGER"].includes(businessType)}>
                          <label>{businessType === "FAULT" ? "故障对象" : "隐患对象"}：</label>
                          <span>{item.hiddenObjName || item.objName || "--"}</span>
                        </div>
                        <div class={styles["hidden-danger-cell-item"]} v-show={["FAULT", "HIDDENDANGER"].includes(businessType)}>
                          <label>解决结果：</label>
                          <span>{item.result || "--"}</span>
                        </div>
                        <div class={styles["hidden-danger-cell-item"]}>
                          <label>发起时间：</label>
                          <span>{dayjs(item.submitedTime).format("YYYY-MM-DD HH:mm")}</span>
                        </div>
                        <div class={styles["hidden-danger-cell-item"]}>
                          <label>发起部门：</label>
                          <span>{item?.startUserInfo.organizationName}</span>
                        </div>
                      </Cell>
                    </CellGroup>
                  );
                })}
              {dataSource.value.length === 0 && search.pageNumber === 1 && <Empty description="暂无数据" />}
            </List>
          </PullRefresh>
        </div>
      </div>
    );
  },
});
