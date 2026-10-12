import { defineComponent, reactive } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, Page, PopOver } from "@ghcloud/cube-ui";

import { InspectionPlan, inspectionPlans } from "../data";

import styles from "../list-page.module.less";

const renderText = (text?: string | number): JSX.Element => {
  const content = text === 0 ? "0" : text || "--";
  return <PopOver content={content}>{content}</PopOver>;
};

export const DroneInspectionPlans = defineComponent({
  name: "DroneInspectionPlans",
  setup: () => {
    const route = useRoute();
    const search = reactive({ pageNumber: 1, pageSize: 10, total: 0, keyword: "", status: "" });
    const queryData = (): { pages: number; records: InspectionPlan[]; total: number } => {
      const records = inspectionPlans.filter(
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
          title: "计划名称",
          dataIndex: "name",
          width: 200,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "关联航线",
          dataIndex: "routeName",
          width: 200,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "计划类型",
          dataIndex: "planType",
          width: 120,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text === "cycle" ? "循环计划" : "单次计划"),
        },
        {
          title: "执行周期",
          dataIndex: "cycle",
          width: 140,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "下次执行",
          dataIndex: "nextTime",
          width: 180,
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
          title: "状态",
          dataIndex: "status",
          width: 100,
          align: "center",
          customRender: ({ text }: { text: string }) => (
            <span class={[styles.status, styles[text]]}>{text === "enabled" ? "启用" : "停用"}</span>
          ),
        },
        {
          title: "操作",
          dataIndex: "action",
          width: 180,
          align: "center",
          customRender: ({ record }: { record: InspectionPlan }) => (
            <>
              <Button type="link" size="small" class={styles.detailButton}>
                编辑
              </Button>
              <Button type="link" size="small" class={styles.detailButton}>
                {record.status === "enabled" ? "停用" : "启用"}
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
        { component: "Input", label: "计划名称", fieldName: "keyword", componentProps: { placeholder: "请输入计划/航线名称" } },
        {
          component: "Select",
          label: "状态",
          fieldName: "status",
          componentProps: {
            placeholder: "请选择状态",
            options: [
              { label: "全部", value: "" },
              { label: "启用", value: "enabled" },
              { label: "停用", value: "disabled" },
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
        title="巡检计划"
        showTableXScroll
        v-slots={{
          "layout-header": () => <Button type="primary">新增计划</Button>,
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
