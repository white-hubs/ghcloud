import { defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef, Teleport } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm } from "@ghcloud/cube-app-design";
import {
  objectStatusColor,
  objectStatusMap,
  objectStatusOptions,
  targetCategoryOptions,
  type InspectTaskRatePayload,
  type TaskObjCountResult,
} from "@ghcloud/cube-daily-inspection-service";
import { Space, Button, message, Table, PopOver, Page } from "@ghcloud/cube-ui";

import { BasicInfo } from "./components/basic-info";
import { cubeDailyInspectionService } from "@/api/server";

import styles from "./inspect-task-edit.module.less";

export const InspectTaskInfo = defineComponent({
  setup: () => {
    const route = useRoute();
    const currentTaskId = route.query.id as string;
    const queryResult = Array.isArray(route.query.result) ? route.query.result[0] : route.query.result;
    const state = reactive<{
      formState: Record<string, unknown>;
      loading: boolean;
      exportLoading: boolean;
      details: TaskObjCountResult;
      dataSource: unknown[];
    }>({
      formState: {},
      loading: false,
      exportLoading: false,
      details: {
        targetAllNum: 0,
        waitTargetNum: 0,
        repairNum: 0,
        repairCount: 0,
        completedTargetNum: 0,
        errTargetNum: 0,
      },
      dataSource: [],
    });
    const basicInfoRef = ref<{ handleSubmit: () => Promise<Record<string, unknown>> }>();
    const inspectObjectFilterRef = shallowRef<HTMLDivElement | null>(null);
    const formActionsTarget = shallowRef<HTMLElement | null>(null);
    const exportButtonWrapped = shallowRef(false);
    const exportGridStyle = shallowRef<Record<string, string>>({});
    let formResizeObserver: ResizeObserver | undefined;
    const bindExportButtonTarget = async (): Promise<void> => {
      await nextTick();
      const formContainer = inspectObjectFilterRef.value?.querySelector<HTMLElement>("#cube-query-form-container");
      if (!formContainer) {
        formActionsTarget.value = null;
        return;
      }

      const gridTemplateColumns = window.getComputedStyle(formContainer).gridTemplateColumns;
      const columnCount = gridTemplateColumns === "none" ? 1 : gridTemplateColumns.split(/\s+/).filter(Boolean).length;
      const formItemCount = Array.from(formContainer.children).filter(
        (element) => !element.classList.contains(styles["export-action"]),
      ).length;
      const isInitialOrWrapped = !formActionsTarget.value || formActionsTarget.value === formContainer;
      const shouldWrap = isInitialOrWrapped ? formItemCount >= columnCount : formItemCount > columnCount;
      const exportRow = Math.ceil((formItemCount + 1) / columnCount);

      exportButtonWrapped.value = shouldWrap;
      exportGridStyle.value = shouldWrap
        ? {
            gridColumn: String(columnCount),
            gridRow: String(exportRow),
          }
        : {};
      formActionsTarget.value = shouldWrap ? formContainer : formContainer.parentElement;
    };
    const getDetailInfo = async (): Promise<void> => {
      const result = await cubeDailyInspectionService.getInspectTaskObjCount({
        taskId: route.query.id as string,
      });

      state.details = result;
    };
    const buildInspectTaskRatePayload = (): InspectTaskRatePayload => ({
      id: currentTaskId,
      taskId: currentTaskId,
      targetCategory: searchParams.targetCategory,
      status: searchParams.status,
      keyword: searchParams.keyword,
      result: searchParams.result,
      pageNumber: pagination.value.pageNumber,
      pageSize: pagination.value.pageSize,
    });
    const getDetailTable = async (): Promise<void> => {
      try {
        state.loading = true;
        state.dataSource = [];
        const res = await cubeDailyInspectionService.getInspectTaskRate(buildInspectTaskRatePayload());
        state.dataSource = res.recordTaskResultList;
        pagination.value.total = ((res?.total || res?.targetNum) as number) ?? 0;
      } catch {
      } finally {
        state.loading = false;
      }
    };
    const getDetails = async (): Promise<void> => {
      const id = route.query.id as string;
      if (!id) return;
      try {
        const res = await cubeDailyInspectionService.getInspectTaskDetail({ id, notTarget: true });
        state.formState = res;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };
    const columns = [
      {
        dataIndex: "targetName",
        title: "巡检对象名称",
        align: "center",
        slots: {
          customRender: "targetName",
        },
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "targetCategory",
        title: "巡检对象类型",
        align: "center",
        slots: {
          customRender: "targetCategory",
        },
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const obj: Record<string, string> = {
            DEVICE: "设备",
            STALL: "档位",
            PROPERTY: " 资产",
            SITE_POINT: "现场点",
            RISK_SOURCE: "风险源",
            SMALL_ENGINEERING: "小散工程",
          };
          return <PopOver content={obj[text] ? obj[text] : "--"}>{obj[text] ? obj[text] : "--"}</PopOver>;
        },
      },
      {
        dataIndex: "status",
        title: "状态",
        align: "center",
        slots: {
          customRender: "status",
        },
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const textVal = text ? objectStatusMap.get(text) : "";
          return (
            <PopOver content={textVal || ""}>
              <span style={{ color: objectStatusColor.get(text || "") }}>{textVal || "--"}</span>
            </PopOver>
          );
        },
      },
      {
        dataIndex: "itemName",
        title: "巡检项",
        align: "center",
        slots: {
          customRender: "itemName",
        },
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },

      {
        dataIndex: "result",
        title: "巡检结果",
        align: "center",
        slots: {
          customRender: "result",
        },
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return (
            <PopOver content={text ? (text === "NORMAL" ? "正常" : "异常") : ""}>
              <span class={text?.toLocaleLowerCase()}>
                {text ? text === "NORMAL" ? <span>正常</span> : <span style={{ color: "#ff4158" }}>异常</span> : "--"}
              </span>
            </PopOver>
          );
        },
      },
      {
        dataIndex: "nickname",
        title: "执行人",
        align: "center",
        slots: {
          customRender: "nickname",
        },
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        align: "center",
        slots: {
          customRender: "action",
        },
        ellipsis: true,
        customRender: ({ record }: { record: Record<string, string> }): JSX.Element => {
          return (
            <Button
              type="link"
              size="small"
              onClick={() => {
                history.pushState({}, "", `/portal/daily-inspection/inspect-record-info?id=${record.id}`);
              }}
            >
              查看巡检记录
            </Button>
          );
        },
      },
    ];
    const searchParams = reactive({
      taskId: currentTaskId,
      targetCategory: "",
      status: "",
      keyword: "",
      result: queryResult ? String(queryResult) : "",
    });
    const pagination = ref<{
      pageSize: number;
      pageNumber: number;
      total?: number;
    }>({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const objectStatusSelectOptions = Object.entries(objectStatusOptions).map(([value, label]) => {
      return {
        value,
        label,
      };
    });
    const formSchema = [
      {
        component: "Select",
        label: "对象类型",
        fieldName: "targetCategory",
        defaultValue: null,
        componentProps: {
          placeholder: "对象类型",
          options: targetCategoryOptions,
        },
      },
      {
        component: "Select",
        label: "状态",
        fieldName: "status",
        defaultValue: null,
        componentProps: {
          placeholder: "状态",
          options: objectStatusSelectOptions,
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "巡检对象名称",
        },
      },
      {
        component: "Select",
        label: "巡检结果",
        fieldName: "result",
        defaultValue: null,
        componentProps: {
          placeholder: "巡检结果",
          allowClear: true,
          options: [
            { label: "正常", value: "NORMAL" },
            { label: "异常", value: "ABNORMAL" },
          ],
        },
      },
    ];
    const [CubeForm, formApi] = useCubeForm({
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        if (searchParams.result) {
          formApi.formValues.result = searchParams.result;
        }
        getDetailTable();
      },
      layout: "horizontal",
      handleSubmit: (data) => {
        searchParams.keyword = data.keyword ? (data.keyword as string) : "";
        searchParams.targetCategory = data.targetCategory ? (data.targetCategory as string) : "";
        pagination.value.pageNumber = 1;
        searchParams.status = data.status ? (data.status as string) : "";
        searchParams.result = data.result ? (data.result as string) : "";
        getDetailTable();
      },
      handleReset: () => {
        searchParams.keyword = "";
        searchParams.targetCategory = "";
        pagination.value.pageNumber = 1;
        searchParams.status = "";
        searchParams.result = "";
        getDetailTable();
      },
      schema: formSchema,
      showCollapseButton: true,
    });
    searchParams.keyword = formApi.formValues.keyword ? (formApi.formValues.keyword as string) : "";
    searchParams.targetCategory = formApi.formValues.targetCategory ? (formApi.formValues.targetCategory as string) : "";
    searchParams.result = formApi.formValues.result ? (formApi.formValues.result as string) : searchParams.result;
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getDetailTable();
    };
    const handleExport = async (): Promise<void> => {
      if (state.exportLoading) return;

      let href: string | undefined;
      try {
        state.exportLoading = true;
        const blob = await cubeDailyInspectionService.getInspectTaskRateExport(buildInspectTaskRatePayload());
        href = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = href;
        link.download = `${String(state.formState.name || "巡检任务详情")}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        message.error((error as { errorMessage?: string } | undefined)?.errorMessage || "导出失败");
      } finally {
        if (href) {
          URL.revokeObjectURL(href);
        }
        state.exportLoading = false;
      }
    };
    const scorllY = ref(300);
    const getTableScrollY = (): void => {
      const formDom = document.querySelector(".info-top");
      if (formDom) {
        const formOuterHeight =
          formDom.clientHeight +
          parseFloat(window.getComputedStyle(formDom).marginTop) +
          parseFloat(window.getComputedStyle(formDom).marginBottom);
        const layoutContent = formDom?.parentElement?.parentElement?.clientHeight ?? 0;
        const tableHeaderHeight = document.querySelector("thead")?.clientHeight ?? 0;
        scorllY.value = layoutContent - formOuterHeight - tableHeaderHeight - 1 - 60;
      }
      void bindExportButtonTarget();
    };
    onMounted(() => {
      getDetails();
      getDetailInfo();
      getDetailTable();
      getTableScrollY();
      window.addEventListener("resize", getTableScrollY);
      void bindExportButtonTarget().then(() => {
        const formContainer = inspectObjectFilterRef.value?.querySelector<HTMLElement>("#cube-query-form-container");
        if (!formContainer || typeof ResizeObserver === "undefined") return;

        formResizeObserver = new ResizeObserver(() => {
          void bindExportButtonTarget();
        });
        formResizeObserver.observe(formContainer);
      });
    });
    onBeforeUnmount(() => {
      window.removeEventListener("resize", getTableScrollY);
      formResizeObserver?.disconnect();
    });
    const layoutSlots = {
      "layout-content": (): JSX.Element => {
        return (
          <>
            <div class={styles["edit-content"]}>
              <div class="info-top">
                <div class={styles.title}>基础信息</div>
                <BasicInfo initFormState={state.formState} ref={basicInfoRef} />
                <div class={styles.title} style={"margin-top: 32px;"}>
                  巡检对象
                </div>
                <div class={styles.titleTips}>
                  <div>对象总数：{state.details?.targetAllNum ?? 0}次</div>
                  <div>待巡检对象数：{state.details?.waitTargetNum ?? 0}项</div>
                  <div>已巡检对象数：{state.details?.completedTargetNum ?? 0}项</div>
                  <div>结果异常对象数：{state.details?.errTargetNum ?? 0}项</div>
                  <div>异常对象修复数：{state.details?.repairCount ?? state.details?.repairNum ?? 0}项</div>
                </div>
                <div ref={inspectObjectFilterRef}>
                  <CubeForm />
                  {formActionsTarget.value && (
                    <Teleport to={formActionsTarget.value}>
                      <div
                        class={[styles["export-action"], exportButtonWrapped.value && styles["export-action-wrapped"]]}
                        style={exportGridStyle.value}
                      >
                        <Button type="primary" loading={state.exportLoading} onClick={handleExport}>
                          导出
                        </Button>
                      </div>
                    </Teleport>
                  )}
                </div>
              </div>
              <Table columns={columns} loading={state.loading} dataSource={state.dataSource} pagination={false} scrollY={scorllY.value} />
              <Page
                style={{ textAlign: "right", marginTop: "10px" }}
                v-model:current={pagination.value.pageNumber}
                v-model:pageSize={pagination.value.pageSize}
                v-model:total={pagination.value.total}
                onPageChange={pageChange}
              />
            </div>
          </>
        );
      },

      "footer-page": (): JSX.Element => {
        return (
          <Space>
            <Button
              onClick={() => {
                history.back();
              }}
            >
              返回
            </Button>
          </Space>
        );
      },
    };
    return (): JSX.Element => <CubeLayout title={"巡检任务详情"} v-slots={layoutSlots} />;
  },
});
