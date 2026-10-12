import { cubeLineLossManagementService } from "@/api/server";
import { CubeLayout, useCubeTable, useCubeForm } from "@ghcloud/cube-app-design";
import { Button, PopOver, PopConfirm, message, Page } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

export const DrawingManagement = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: "",
      type: "",
    });

    const columns = [
      {
        title: "序号",
        width: 80,
        customRender: ({ index }: { index: number }) => index + 1 + (searchParams.pageNumber - 1) * searchParams.pageSize,
        align: "center",
      },
      {
        dataIndex: "name",
        title: "图纸名称",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "type",
        title: "图纸类型",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "description",
        title: "备注",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        fixed: "right",
        width: 250,
        customRender: ({ record }: { record: any }) => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                history.pushState({}, "", `/portal/line-loss-management/drawing-management-edit?type=info&id=${record.id}`);
              }}
            >
              详情
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                history.pushState({}, "", `/portal/line-loss-management/drawing-management-edit?type=edit&id=${record.id}`);
              }}
            >
              编辑
            </Button>
            <PopConfirm
              title="确认删除该图纸？"
              onConfirm={async () => {
                try {
                  // await cubeLineLossManagementService.deleteVehicle(record?.id as unknown as string)
                  // message.success('删除成功')
                  // tableApi.query()
                } catch {}
              }}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      // fetchApi: async () => {
      // const params = {
      //   pageNumber: searchParams.pageNumber,
      //   pageSize: searchParams.pageSize,
      //   keyword: searchParams.keyword ?? '',
      //   vehicleTypeCode: searchParams.type ?? '',
      // }
      // const res = await cubeLineLossManagementService.getVehiclePageList(params)
      // return res
      // },
      fetchLoaded: (data) => {
        searchParams.total = data.total;
      },
    });

    const handleChange = (pageNumber: number, pageSize: number) => {
      searchParams.pageNumber = pageNumber;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };

    const formSchema = [
      {
        component: "Select",
        label: "图纸类型",
        fieldName: "type",
        componentProps: {
          allowClear: true,
          options: [{ label: "全部", value: "" }],
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "图纸名称",
        },
      },
    ];

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      schema: formSchema,
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: (data) => {
        Object.assign(searchParams, data);
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.keyword = "";
        searchParams.type = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      showCollapseButton: false,
    });
    const typeList = ref<{ label: string | undefined; value: number | undefined }[]>([]);
    const getTypeOptions = async () => {
      try {
        const res = await cubeLineLossManagementService.getTypeList();
        typeList.value = (res ?? [])?.map((item: { name: string; id: string }) => ({
          label: item.name,
          value: item.id,
        }));
      } catch {}
    };
    onMounted(async () => {
      await getTypeOptions();
      const schema = {
        component: "Select",
        label: "图纸类型",
        fieldName: "type",
        defaultValue: "",
        componentProps: {
          allowClear: true,
          options: [
            {
              label: "全部",
              value: "",
            },
            ...typeList.value,
          ],
          onChange: (value: string): void => {
            searchParams.pageNumber = 1;
            searchParams.type = value;
            tableApi.query();
          },
        },
      };
      formApi.updateFieldSchema(schema);
      tableApi.query();
    });

    const slots = {
      "layout-header": () => (
        <Button
          type="primary"
          onClick={() => {
            history.pushState({}, "", "/portal/line-loss-management/drawing-management-edit?type=create");
          }}
        >
          新增
        </Button>
      ),
      "layout-content": () => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": () => (
        <Page current={searchParams.pageNumber} pageSize={searchParams.pageSize} total={searchParams.total} onPageChange={handleChange} />
      ),
    };

    return () => <CubeLayout title={pageTitle} v-slots={slots} showTableXScroll={false} />;
  },
});
