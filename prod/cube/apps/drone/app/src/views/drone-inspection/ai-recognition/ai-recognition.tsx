import { defineComponent, reactive } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, Page, PopOver } from "@ghcloud/cube-ui";

import { AiRecognitionItem, aiRecognitionItems } from "../data";

import styles from "../list-page.module.less";

const renderText = (text?: string | number): JSX.Element => {
  const content = text === 0 ? "0" : text || "--";
  return <PopOver content={content}>{content}</PopOver>;
};

export const DroneAiRecognition = defineComponent({
  name: "DroneAiRecognition",
  setup: () => {
    const route = useRoute();
    const search = reactive({ pageNumber: 1, pageSize: 10, total: 0, keyword: "", status: "" });
    const queryData = (): { pages: number; records: AiRecognitionItem[]; total: number } => {
      const records = aiRecognitionItems.filter(
        (item) =>
          (!search.keyword || item.name.includes(search.keyword) || item.algorithm.includes(search.keyword)) &&
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
          title: "识别能力",
          dataIndex: "name",
          width: 200,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "识别类型",
          dataIndex: "type",
          width: 150,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "算法模型",
          dataIndex: "algorithm",
          width: 180,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "阈值",
          dataIndex: "threshold",
          width: 100,
          align: "center",
          customRender: ({ text }: { text: number }) => renderText(`${text}%`),
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
          title: "最近训练时间",
          dataIndex: "lastTrainTime",
          width: 180,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "操作",
          dataIndex: "action",
          width: 180,
          align: "center",
          customRender: ({ record }: { record: AiRecognitionItem }) => (
            <>
              <Button type="link" size="small" class={styles.detailButton}>
                配置
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
        { component: "Input", label: "识别能力", fieldName: "keyword", componentProps: { placeholder: "请输入能力/模型名称" } },
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
        title="AI识别中心"
        showTableXScroll
        v-slots={{
          "layout-header": () => <Button type="primary">新增能力</Button>,
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
