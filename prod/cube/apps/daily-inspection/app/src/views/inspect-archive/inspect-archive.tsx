import dayjs from "dayjs";
import { defineComponent, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { AreaCascaderSelect, CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import {
  inspectRecordResultSourceMap,
  inspectRecordResultSourceOptions,
  targetCategoryOptions,
  type InspectRecordResultSource,
  type RecordPage,
} from "@ghcloud/cube-daily-inspection-service";
import { PopOver, Page, Button } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeDailyInspectionService } from "@/api/server";
import { useLoopExportExcel } from "@/hook/use-loop-export-excel";

import styles from "./inspect-archive.module.less";

export const InspectArchive = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      targetCategory: "",
      resultSource: "",
      period: "",
      areaId: "",
      keyword: "",
    });
    /**
     * 表单配置
     */
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
        component: AreaCascaderSelect,
        label: "区域",
        fieldName: "areaId",
        defaultValue: null,
        componentProps: {
          placeholder: "区域",
        },
      },
      {
        component: "RangePicker",
        label: "巡检时间",
        fieldName: "period",
        componentProps: {
          valueFormat: "YYYY-MM-DD HH:mm:ss",
        },
      },
      {
        component: "Select",
        label: "结果来源",
        fieldName: "resultSource",
        defaultValue: null,
        componentProps: {
          placeholder: "结果来源",
          allowClear: true,
          options: inspectRecordResultSourceOptions,
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
        tableApi.query();
      },
      layout: "horizontal",
      handleSubmit: (data) => {
        searchParams.keyword = data.keyword ? (data.keyword as string) : "";
        searchParams.period = data.period ? (data.period as string[]).join(",") : "";
        searchParams.targetCategory = data.targetCategory ? (data.targetCategory as string) : "";
        searchParams.resultSource = data.resultSource ? (data.resultSource as string) : "";
        searchParams.areaId = data.areaId ? (data.areaId as string) : "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.keyword = "";
        searchParams.period = "";
        searchParams.targetCategory = "";
        searchParams.resultSource = "";
        searchParams.areaId = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      schema: formSchema,
      showCollapseButton: true,
    });

    /**
     * 表格
     */
    const columns = [
      {
        dataIndex: "targetName",
        title: "对象名称",
        slots: {
          customRender: "targetName",
        },
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "targetCategory",
        title: "对象类型",
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
        dataIndex: "areaName",
        title: "所在区域",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "organizationName",
        title: "部门",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "nickname",
        title: "巡检人员",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "time",
        title: "最近一次巡检时间",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = dayjs(text).format("YYYY-MM-DD HH:mm:ss");
          return <PopOver content={time || ""}>{time || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "result",
        title: "最近一次巡检结果",
        ellipsis: true,
        align: "center",
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
        title: "最近一次结果来源",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: InspectRecordResultSource }): JSX.Element => {
          const source = text || "MANUAL";
          const label = inspectRecordResultSourceMap.get(source) || source;
          return <PopOver content={label}>{label}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        fixed: "right",
        customRender: ({ record }: { record: RecordPage }): JSX.Element => {
          return (
            <>
              <Button
                type="link"
                onClick={() => {
                  history.pushState({}, "", `/portal/daily-inspection/inspect-archive-info?id=${record.targetId}`);
                }}
              >
                详情
              </Button>
            </>
          );
        },
      },
    ];
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: async () => {
        return cubeDailyInspectionService.targetRecordPage({
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          keyword: searchParams.keyword,
          areaId: searchParams.areaId,
          targetCategory: searchParams.targetCategory,
          resultSource: searchParams.resultSource as InspectRecordResultSource,
          period: searchParams.period,
        });
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total;
      },
    });
    const handleChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };
    const { exportLoading, exportData } = useLoopExportExcel();
    const getExportData = async (pageNumber: number, pageSize: number): Promise<{ records: unknown[] }> => {
      try {
        const res = await cubeDailyInspectionService.targetRecordPage({
          pageNumber,
          pageSize,
          keyword: searchParams.keyword,
          areaId: searchParams.areaId,
          targetCategory: searchParams.targetCategory,
          resultSource: searchParams.resultSource as InspectRecordResultSource,
          period: searchParams.period,
        });
        return res;
      } catch {
        return { records: [] };
      }
    };
    const handleExport = async (): Promise<void> => {
      await exportData({
        fileName: pageTitle ?? "巡检档案",
        exportTotal: searchParams.total,
        pageSize: 999,
        columns,
        getExportDataFunc: async (pageNumber: number, pageSize: number) => getExportData(pageNumber, pageSize),
      });
    };
    const slots = {
      "layout-header": (): JSX.Element => {
        return (
          <>
            <div>
              <Button type="primary" loading={exportLoading.value} onClick={handleExport}>
                导出
              </Button>
            </div>
          </>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <div>
            <CubeForm />
            <CubeTable />
          </div>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <Page current={searchParams.pageNumber} pageSize={searchParams.pageSize} total={searchParams.total} onPageChange={handleChange} />
        );
      },
    };
    return (): JSX.Element => <CubeLayout class={styles.container} title={pageTitle} v-slots={slots} showTableXScroll />;
  },
});
