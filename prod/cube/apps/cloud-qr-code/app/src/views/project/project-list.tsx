import { cubeCloudQrCodeService } from "@/api/server";
import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { ProjectEntity } from "@ghcloud/cube-ghcloud-cloud-qr-code-service";
import { Button, PopOver, Page, message, AntModal } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { defineComponent, ref, reactive } from "vue";

export const ProjectList = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
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
          placeholder: "项目名称",
        },
      },
    ];

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: () => {
        tableApi.query();
      },
      handleReset: () => {
        tableApi.query();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    });

    const columns = [
      {
        title: "项目名称",
        dataIndex: "name",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 250,
        align: "center",
        customRender: ({ record }: { record: ProjectEntity }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                handleDetail(record);
              }}
            >
              详情
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                handleEdit(record);
              }}
            >
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              danger
              onClick={() => {
                handleDelete(record);
              }}
            >
              删除
            </Button>
          </>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: "id",
      fetchApi: async () => {
        const { formValues } = formApi;
        const params: {
          pageNumber: number;
          pageSize: number;
          keyword?: string;
        } = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
        };
        if (formValues.keyword) {
          params.keyword = formValues.keyword as string;
        }
        const result = await cubeCloudQrCodeService.getProjects(params);
        return result;
      },
      fetchLoaded: (data) => {
        page.total = data.total;
      },
    });

    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber;
      page.pageSize = pageSize;
      tableApi.query();
    };

    const handleDetail = (record: ProjectEntity): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/cloud-qr-code/project-edit?action=detail&id=${record.id}`,
      );
    };

    const handleEdit = (record: ProjectEntity): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/cloud-qr-code/project-edit?action=edit&id=${record.id}`,
      );
    };

    const handleDelete = (record: ProjectEntity): void => {
      AntModal.confirm({
        title: "提示",
        content: `确定要删除项目【${record.name}】吗?`,
        onOk: async () => {
          try {
            await cubeCloudQrCodeService.deleteProject(record.id);
            message.success("删除成功");
            tableApi.query();
          } catch {
            message.error("删除失败");
          }
        },
      });
    };

    const handleAdd = (): void => {
      history.pushState({ current: location.pathname + location.search }, "", `/portal/cloud-qr-code/project-edit?action=add`);
    };

    const slots = {
      "layout-header": (): JSX.Element => (
        <div>
          <Button type="primary" onClick={handleAdd}>
            新增
          </Button>
        </div>
      ),
      "layout-content": (): JSX.Element => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page current={page.pageNumber} pageSize={page.pageSize} total={page.total} onPageChange={handleChange} />
      ),
    };

    return (): JSX.Element => <CubeLayout title={pageTitle ?? "项目列表"} v-slots={slots} />;
  },
});
