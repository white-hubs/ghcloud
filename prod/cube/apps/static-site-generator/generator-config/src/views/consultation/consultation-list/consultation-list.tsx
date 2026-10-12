import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, Page, PopConfirm, PopOver, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { defineComponent, reactive } from "vue";
import { useRoute } from "vue-router";
import { cubeSiteGeneratorService } from "@/api/service";
import type { ConsultationItem } from "./mock";

/** 咨询列表 */
export const ConsultationList = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const tableQuery = { run: (): void => {} };

    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const searchFormSchema = [
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "姓名、企业名称",
        },
      },
    ];
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: () => {
        page.pageNumber = 1;
        tableQuery.run();
      },
      handleReset: () => {
        page.pageNumber = 1;
        tableQuery.run();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    });

    const handleDelete = async (record: ConsultationItem): Promise<void> => {
      try {
        await cubeSiteGeneratorService.deleteFeedback({ id: record.id });
        message.success("操作成功");
        tableQuery.run();
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
      }
    };

    const columns = [
      {
        title: "姓名",
        dataIndex: "userName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "联系方式",
        dataIndex: "contactWay",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "企业名称",
        dataIndex: "companyName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "应用场景",
        dataIndex: "applicationScenario",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "创建时间",
        dataIndex: "createTime",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "action",
        title: "操作",
        slots: { customRender: "action" },
        fixed: "right",
        width: 120,
        customRender: ({ record }: { record: ConsultationItem }): JSX.Element => (
          <PopConfirm
            title="确认删除该项？"
            onConfirm={() => {
              handleDelete(record);
            }}
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </PopConfirm>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: async () => {
        const result = await cubeSiteGeneratorService.getFeedbackList({
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
        });
        const kw = ((formApi.formValues.keyword as string) ?? "").trim().toLowerCase();
        let records = result.records;
        if (kw) {
          records = records.filter(
            (item) =>
              (item.userName ?? "").toLowerCase().includes(kw) ||
              (item.companyName ?? "").toLowerCase().includes(kw),
          );
        }
        return { records, total: result.total, pages: result.pages };
      },
      fetchLoaded: (data) => {
        page.total = data.total;
      },
    });

    tableQuery.run = (): void => {
      tableApi.query();
    };

    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber;
      page.pageSize = pageSize;
      tableQuery.run();
    };

    const slots = {
      "layout-content": (): JSX.Element => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          current={page.pageNumber}
          pageSize={page.pageSize}
          total={page.total}
          onPageChange={handleChange}
          onShowSizeChange={handleChange}
        />
      ),
    };

    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={slots}></CubeLayout>;
  },
});
