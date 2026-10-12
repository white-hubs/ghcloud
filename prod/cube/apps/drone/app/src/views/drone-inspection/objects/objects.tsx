import { defineComponent, reactive } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, Page, PopOver } from "@ghcloud/cube-ui";

import { InspectionObject, inspectionObjects } from "../data";

import styles from "../list-page.module.less";

const statusTextMap: Record<string, string> = {
  normal: "正常",
  warning: "预警",
  alert: "告警",
};

const renderText = (text?: string | number): JSX.Element => {
  const content = text === 0 ? "0" : text || "--";
  return <PopOver content={content}>{content}</PopOver>;
};

export const DroneInspectionObjects = defineComponent({
  name: "DroneInspectionObjects",
  setup: () => {
    const route = useRoute();
    const search = reactive({ pageNumber: 1, pageSize: 10, total: 0, keyword: "", status: "" });

    const queryData = (): { pages: number; records: InspectionObject[]; total: number } => {
      const records = inspectionObjects.filter((item) => {
        const matchedKeyword = !search.keyword || item.name.includes(search.keyword) || (item.area ?? "").includes(search.keyword);
        return matchedKeyword && (!search.status || item.status === search.status);
      });
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
          title: "巡检对象名称",
          dataIndex: "name",
          width: 180,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "对象类型",
          dataIndex: "type",
          width: 140,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "所属区域",
          dataIndex: "area",
          width: 160,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "识别算法",
          dataIndex: "algorithm",
          width: 160,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "责任部门",
          dataIndex: "owner",
          width: 140,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "状态",
          dataIndex: "status",
          width: 120,
          align: "center",
          customRender: ({ text }: { text: string }) => <span class={[styles.status, styles[text]]}>{statusTextMap[text] ?? "--"}</span>,
        },
        {
          title: "更新时间",
          dataIndex: "updateTime",
          width: 180,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "操作",
          dataIndex: "action",
          width: 120,
          align: "center",
          customRender: () => (
            <Button type="link" size="small" class={styles.detailButton}>
              详情
            </Button>
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
        { component: "Input", label: "巡检对象", fieldName: "keyword", componentProps: { placeholder: "请输入对象名称/区域" } },
        {
          component: "Select",
          label: "状态",
          fieldName: "status",
          componentProps: {
            placeholder: "请选择状态",
            options: [
              { label: "全部", value: "" },
              { label: "正常", value: "normal" },
              { label: "预警", value: "warning" },
              { label: "告警", value: "alert" },
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
        title="巡检对象台账"
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
