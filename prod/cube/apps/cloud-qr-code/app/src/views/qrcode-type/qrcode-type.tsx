import { cubeCloudQrCodeService } from "@/api/server";
import { GrantProjectSelect } from "@/components/project-select/project-select";
import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { QrCodeTypeEntity } from "@ghcloud/cube-ghcloud-cloud-qr-code-service";
import { Button, PopOver, Page, AntModal, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import dayjs from "dayjs";
import { defineComponent, ref, reactive } from "vue";

export const CloudQrCodeTypeList = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });
    const selectedRowKeysData = ref<string[]>([]);
    const searchFormSchema = [
      {
        component: GrantProjectSelect,
        label: "授权项目",
        fieldName: "grantClientId",
        componentProps: {
          placeholder: "授权项目",
          onChange: (): void => {
            tableApi.query();
          },
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "二维码类型名称",
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
        title: "二维码类型编号",
        dataIndex: "code",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "二维码类型名称",
        dataIndex: "name",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "授权项目",
        dataIndex: "grantClientName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "更新时间",
        dataIndex: "updateTime",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          if (!text) {
            return <PopOver content="--">--</PopOver>;
          }
          const time = dayjs(text).format("YYYY-MM-DD HH:mm:ss");
          return <PopOver content={time}>{time}</PopOver>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        slots: {
          customRender: "action",
        },
        width: 250,
        align: "center",
        customRender: ({ record }: { record: QrCodeTypeEntity }): JSX.Element => (
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
      rowSelection: "checkbox",
      fetchApi: async () => {
        const { formValues } = formApi;
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          keyword: (formValues.keyword as string) || "",
          grantClientId: (formValues.grantClientId as string) || "",
        };
        const result = await cubeCloudQrCodeService.getQrCodeTypes(params);
        return result;
      },
      rowSelectionChange: (keys) => {
        selectedRowKeysData.value = keys as string[];
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
    const handleDetail = (record: QrCodeTypeEntity): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/cloud-qr-code/cloud-qrcode-type-edit?action=detail&id=${record.id}`,
      );
    };

    const handleEdit = (record: QrCodeTypeEntity): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/cloud-qr-code/cloud-qrcode-type-edit?action=edit&id=${record.id}`,
      );
    };

    const handleDelete = (record: QrCodeTypeEntity): void => {
      AntModal.confirm({
        title: "提示",
        content: `确定要删除二维码类型【${record.name}】吗?`,
        onOk: async () => {
          try {
            await cubeCloudQrCodeService.deleteQrCodeType(record.id);
            message.success("删除成功");
            tableApi.query();
          } catch {
            message.error("删除失败");
          }
        },
      });
    };

    const handleAdd = (): void => {
      history.pushState({ current: location.pathname + location.search }, "", `/portal/cloud-qr-code/cloud-qrcode-type-edit?action=add`);
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

    return (): JSX.Element => <CubeLayout title={pageTitle ?? "二维码类型列表"} v-slots={slots}></CubeLayout>;
  },
});
