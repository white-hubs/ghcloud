import { cubeCloudQrCodeService } from "@/api/server";
import { GrantProjectSelect } from "@/components/project-select/project-select";
import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { type QrCodeEntity, getQrCodeContentTypeLabel } from "@ghcloud/cube-ghcloud-cloud-qr-code-service";
import { Button, PopOver, Page, message, Switch, AntModal } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import dayjs from "dayjs";
import { defineComponent, ref, reactive } from "vue";

export const CloudQrCodeList = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });
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
        component: "Select",
        label: "是否启用",
        fieldName: "enabled",
        componentProps: {
          allowClear: true,
          placeholder: "是否启用",
          options: [
            {
              label: "全部",
              value: "",
            },
            {
              label: "是",
              value: true,
            },
            {
              label: "否",
              value: false,
            },
          ],
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
          placeholder: "二维码名称",
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
        title: "二维码编号",
        dataIndex: "code",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "二维码名称",
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
        title: "内容类型",
        dataIndex: "qrContentType",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const label = getQrCodeContentTypeLabel(text);
          return <PopOver content={label}>{label}</PopOver>;
        },
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
        title: "是否开启",
        dataIndex: "enabled",
        ellipsis: true,
        align: "center",
        customRender: ({ text, record }: { text: boolean; record: QrCodeEntity }): JSX.Element => (
          <Switch
            v-model:checked={text}
            checked-children="是"
            un-checked-children="否"
            onChange={async (e) => handleEnableSwitch(e, record)}
          />
        ),
      },
      {
        title: "操作",
        dataIndex: "action",
        slots: {
          customRender: "action",
        },
        width: 250,
        align: "center",
        customRender: ({ record }: { record: QrCodeEntity }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                handlePreview(record);
              }}
            >
              预览
            </Button>
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
        const params: {
          pageNumber: number;
          pageSize: number;
          keyword?: string;
          grantClientId?: string;
          enabled?: boolean;
        } = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
        };
        // 只传递有效的查询参数
        if (formValues.keyword) {
          params.keyword = formValues.keyword as string;
        }
        if (formValues.grantClientId) {
          params.grantClientId = formValues.grantClientId as string;
        }
        if (formValues.enabled !== "" && formValues.enabled !== undefined && formValues.enabled !== null) {
          params.enabled = formValues.enabled as boolean;
        }
        const result = await cubeCloudQrCodeService.getQrCodes(params);
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
    const handleDetail = (record: QrCodeEntity): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/cloud-qr-code/cloud-qrcode-edit?action=detail&id=${record.id}`,
      );
    };

    const handleEdit = (record: QrCodeEntity): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/cloud-qr-code/cloud-qrcode-edit?action=edit&id=${record.id}`,
      );
    };

    const handleDelete = (record: QrCodeEntity): void => {
      AntModal.confirm({
        title: "提示",
        content: `确定要删除二维码【${record.name}】吗?`,
        onOk: async () => {
          try {
            await cubeCloudQrCodeService.deleteQrCode(record.id);
            message.success("删除成功");
            tableApi.query();
          } catch {
            message.error("删除失败");
          }
        },
      });
    };

    const handlePreview = async (record: QrCodeEntity): Promise<void> => {
      try {
        const base64Image = await cubeCloudQrCodeService.previewQrCode(record.id);

        AntModal.info({
          title: `二维码预览 - ${record.name}`,
          content: <img src={base64Image} alt="二维码" style={{ width: "100%", display: "block" }} />,
          width: 400,
          okText: "关闭",
          centered: true,
          bodyStyle: { textAlign: "center" },
        });
      } catch (error) {
        message.error("预览失败");
      }
    };

    const handleAdd = (): void => {
      history.pushState({ current: location.pathname + location.search }, "", `/portal/cloud-qr-code/cloud-qrcode-edit?action=add`);
    };

    const handleEnableSwitch = async (isShow: boolean, record: QrCodeEntity): Promise<void> => {
      try {
        await cubeCloudQrCodeService.enableQrCode(record.id, isShow);
        message.success("操作成功");
        tableApi.query();
      } catch {
        message.error("操作失败");
      }
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

    return (): JSX.Element => (
      <CubeLayout title={pageTitle ?? "二维码列表"} v-slots={slots} />
    );
  },
});
