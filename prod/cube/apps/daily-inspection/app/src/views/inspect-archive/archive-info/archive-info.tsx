import { defineComponent, onBeforeMount, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm } from "@ghcloud/cube-app-design";
import {
  inspectRecordResultSourceMap,
  objectStatusMap,
  objectStatusColor,
  resultOptions,
  targetCategoryOptions,
  type ArchivesDetail,
  type InspectRecordResultSource,
  type InspectTaskRate,
} from "@ghcloud/cube-daily-inspection-service";
import { Space, Button, Table, PopOver, Page } from "@ghcloud/cube-ui";

import { BasicInfo } from "./components/basic-info";
import { cubeDailyInspectionService } from "@/api/server";

import styles from "./archive-info.module.less";

export const ArchiveInfo = defineComponent({
  setup: () => {
    const route = useRoute();
    const currentTargetId = route.query.id as string;
    const state = reactive<{
      loading: boolean;
      details: ArchivesDetail;
      dataSource: unknown[];
    }>({
      loading: false,
      details: {
        id: "",
        targetId: "",
        targetName: "",
        targetCategory: "",
        areaName: "",
        organizationName: "",
        time: 0,
        result: "",
        dailyNum: 0,
        dailyErrNum: 0,
        dailyList: [],
        temporaryNum: 0,
        temporaryErrNum: 0,
        temporaryList: [],
      },
      dataSource: [],
    });
    const getDetailInfo = async (): Promise<void> => {
      const result = await cubeDailyInspectionService.getInspectArchivesDetail({
        targetId: route.query.id as string,
      });
      state.details = result;
    };
    const getDetailTable = async (): Promise<void> => {
      const result = await cubeDailyInspectionService.detailRecordPage({
        pageSize: pagination.value.pageSize,
        pageNumber: pagination.value.pageNumber,
        targetId: route.query.id as string,
        ...searchParams,
      });
      state.dataSource = result.records ?? [];
      pagination.value.total = result.total;
    };
    const getResultSourceLabel = (value?: InspectRecordResultSource): string => {
      const source = value || "MANUAL";
      return inspectRecordResultSourceMap.get(source) || source;
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
        dataIndex: "errNames",
        title: "巡检项",
        align: "center",
        slots: {
          customRender: "errNames",
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
        dataIndex: "resultSource",
        title: "结果来源",
        align: "center",
        slots: {
          customRender: "resultSource",
        },
        ellipsis: true,
        customRender: ({ text }: { text?: InspectRecordResultSource }): JSX.Element => {
          const label = getResultSourceLabel(text);
          return <PopOver content={label}>{label}</PopOver>;
        },
      },
      {
        dataIndex: "username",
        title: "执行人",
        align: "center",
        slots: {
          customRender: "username",
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
      targetId: currentTargetId,
      targetCategory: "",
      result: "",
      keyword: "",
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
        label: "巡检结果",
        fieldName: "result",
        defaultValue: null,
        componentProps: {
          placeholder: "巡检结果",
          options: resultOptions,
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
    ];
    const [CubeForm, formApi] = useCubeForm({
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        getDetailTable();
      },
      layout: "horizontal",
      handleSubmit: (data) => {
        searchParams.keyword = data.keyword ? (data.keyword as string) : "";
        searchParams.targetCategory = data.targetCategory ? (data.targetCategory as string) : "";
        searchParams.result = data.result ? (data.result as string) : "";
        pagination.value.pageNumber = 1;
        getDetailTable();
      },
      handleReset: () => {
        searchParams.keyword = "";
        searchParams.targetCategory = "";
        searchParams.result = "";
        pagination.value.pageNumber = 1;
        getDetailTable();
      },
      schema: formSchema,
      showCollapseButton: true,
    });
    searchParams.keyword = formApi.formValues.keyword ? (formApi.formValues.keyword as string) : "";
    searchParams.targetCategory = formApi.formValues.targetCategory ? (formApi.formValues.targetCategory as string) : "";
    searchParams.result = formApi.formValues.result ? (formApi.formValues.result as string) : "";
    const loading = ref(false);
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getDetailTable();
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
        scorllY.value = layoutContent - formOuterHeight - tableHeaderHeight - 1;
      }
    };
    onMounted(() => {
      getDetailInfo();
      getDetailTable();
      getTableScrollY();
      window.addEventListener("resize", getTableScrollY);
    });
    onBeforeMount(() => {
      window.removeEventListener("resize", getTableScrollY);
    });
    const layoutSlots = {
      "layout-content": (): JSX.Element => {
        return (
          <>
            <div class={styles["edit-content"]}>
              <div class="info-top">
                <div class={styles.title}>基础信息</div>
                <BasicInfo initFormState={state.details} />
                <div class={styles.title} style={"margin-top: 32px;"}>
                  巡检记录
                </div>
                <div class={styles.titleTips}>
                  <div>巡检总次数：{state.details?.dailyNum || 0}次</div>
                  <div>日常巡检：{state.details?.dailyNum || 0}次</div>
                  <div>临时巡检：{state.details?.temporaryNum || 0}次</div>
                  <div>巡检异常结果次数：{Number(state.details?.dailyErrNum ?? 0) + Number(state.details?.temporaryErrNum ?? 0)}次</div>
                </div>
                <CubeForm />
              </div>
              <Table columns={columns} dataSource={state.dataSource} loading={loading.value} pagination={false} scrollY={scorllY.value} />
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
    return (): JSX.Element => <CubeLayout title={"巡检档案详情"} v-slots={layoutSlots} />;
  },
});
