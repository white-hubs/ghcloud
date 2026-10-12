import { defineComponent, reactive } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, Page, PopOver } from "@ghcloud/cube-ui";

import { InspectionReport, inspectionReports } from "../data";

import styles from "../list-page.module.less";

const renderText = (text?: string | number): JSX.Element => {
  const content = text === 0 ? "0" : text || "--";
  return <PopOver content={content}>{content}</PopOver>;
};

export const DroneInspectionReports = defineComponent({
  name: "DroneInspectionReports",
  setup: () => {
    const route = useRoute();
    const search = reactive({ pageNumber: 1, pageSize: 10, total: 0, keyword: "", status: "" });
    const queryData = (): { pages: number; records: InspectionReport[]; total: number } => {
      const records = inspectionReports.filter(
        (item) =>
          (!search.keyword || item.name.includes(search.keyword) || item.routeName.includes(search.keyword)) &&
          (!search.status || item.status === search.status),
      );
      const start = (search.pageNumber - 1) * search.pageSize;
      return {
        pages: Math.ceil(records.length / search.pageSize),
        records: records.slice(start, start + search.pageSize),
        total: records.length,
      };
    };
    const [CubeTable, tableApi] = useCubeTable({
      tableCode: route.path.replaceAll("/", ""),
      rowKey: "id",
      columns: [
        {
          title: "报告名称",
          dataIndex: "name",
          width: 220,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "巡检航线",
          dataIndex: "routeName",
          width: 200,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "执行时间",
          dataIndex: "executeTime",
          width: 180,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "执行飞机",
          dataIndex: "droneName",
          width: 140,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "巡检对象数",
          dataIndex: "objectCount",
          width: 120,
          align: "center",
          customRender: ({ text }: { text: number }) => renderText(text),
        },
        {
          title: "告警数",
          dataIndex: "alertCount",
          width: 100,
          align: "center",
          customRender: ({ text }: { text: number }) => renderText(text),
        },
        {
          title: "结果",
          dataIndex: "status",
          width: 100,
          align: "center",
          customRender: ({ text }: { text: string }) => (
            <span class={[styles.status, styles[text]]}>{text === "normal" ? "正常" : "异常"}</span>
          ),
        },
        {
          title: "操作",
          dataIndex: "action",
          width: 160,
          align: "center",
          customRender: () => (
            <>
              <Button type="link" size="small" class={styles.detailButton}>
                查看
              </Button>
              <Button type="link" size="small" class={styles.detailButton}>
                导出
              </Button>
            </>
          ),
        },
      ],
      fetchApi: async () => queryData(),
      fetchLoaded: (data) => {
        search.total = data.total;
      },
    });
    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      schema: [
        { component: "Input", label: "报告名称", fieldName: "keyword", componentProps: { placeholder: "请输入报告/航线名称" } },
        {
          component: "Select",
          label: "结果",
          fieldName: "status",
          componentProps: {
            placeholder: "请选择结果",
            options: [
              { label: "全部", value: "" },
              { label: "正常", value: "normal" },
              { label: "异常", value: "abnormal" },
            ],
          },
        },
      ],
      syncStateRef: search,
      handleSubmit: (data: Record<string, unknown>) => {
        search.keyword = String(data.keyword ?? "");
        search.status = String(data.status ?? "");
        search.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        search.keyword = "";
        search.status = "";
        search.pageNumber = 1;
        tableApi.query();
      },
    });
    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      search.pageNumber = pageNumber;
      search.pageSize = pageSize;
      tableApi.query();
    };
    return (): JSX.Element => (
      <CubeLayout
        class={styles.container}
        title="巡检报告"
        showTableXScroll
        v-slots={{
          "layout-content": () => (
            <div class={styles.content}>
              <CubeForm />
              <CubeTable />
            </div>
          ),
          "footer-page": () => (
            <Page current={search.pageNumber} pageSize={search.pageSize} total={search.total} onPageChange={handlePageChange} />
          ),
        }}
      />
    );
  },
});
