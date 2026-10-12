import dayjs from "dayjs";
import { defineComponent, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout, useCubeForm, useCubeQueryState, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, PopConfirm, message, Input, Select, PopOver, Page } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { ADDModal } from "./components/add-modal";
import { cubeMaintainService } from "@/api/service";
import { mapFormValuesToQueryDefaults } from "@/utils";
export interface FormState {
  id?: string;
  type: string | undefined;
  reportTime: string;
}
interface QueryState {
  [key: string]: unknown;
  keyword: string | undefined;
  type: string | undefined;
  pageSize: number;
  pageNumber: number;
}
export const FaultReport = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const router = useRouter();
    const state = reactive<{
      visible: boolean;
      typeOptions: unknown[];
    }>({
      visible: false,
      typeOptions: [],
    });
    const queryDefaults = {
      keyword: undefined as string | undefined,
      type: undefined as string | undefined,
    };
    const queryState = useCubeQueryState<QueryState & { total: number }>({
      storage: "url",
      initialState: {
        ...queryDefaults,
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      cacheFields: ["keyword", "type", "pageNumber", "pageSize"],
    });
    const getType = async (): Promise<void> => {
      try {
        state.typeOptions = await cubeMaintainService.faultReportType();
        formApi.updateFieldSchema({
          component: Select,
          label: "",
          fieldName: "type",
          defaultValue: undefined,
          componentProps: {
            fieldNames: { label: "name", value: "code" },
            placeholder: "报告类型",
            options: state.typeOptions,
            style: "min-width: 150px;",
            allowClear: true,
          },
        });
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };
    const columns = [
      {
        title: "分析报告名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "报告类型",
        dataIndex: "typeName",
        key: "typeName",
      },
      {
        title: "生成时间",
        dataIndex: "createTime",
        key: "createTime",
        customRender: ({ text }: { text: string }) => {
          return <PopOver>{text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--"}</PopOver>;
        },
      },
      {
        title: "操作",
        dataIndex: "operate",
        key: "operate",
        align: "center",
        customRender: ({ record }: { record: FormState }) => {
          return (
            <>
              <Button
                type="link"
                onClick={() => {
                  handleDetail(record);
                }}
                style={{ paddingLeft: 0, paddingRight: 0 }}
              >
                详情
              </Button>
              <PopConfirm title="是否确认删除?" ok-text="确定" cancel-text="取消" onConfirm={async () => handleDelete(record)}>
                <Button type="link" danger style={{ paddingRight: 0 }}>
                  删除
                </Button>
              </PopConfirm>
            </>
          );
        },
      },
    ];
    const handleDelete = async (row: FormState): Promise<void> => {
      if (row.id) {
        await cubeMaintainService.deleteReport(row.id);
        message.success("操作成功");
        queryState.resetPage();
        tableApi.query();
      } else {
        message.info("操作失败");
      }
    };
    const handleSaveReport = async (row: FormState): Promise<void> => {
      try {
        await cubeMaintainService.addReport(row);
        message.success("操作成功");
      } catch (error) {}
      queryState.resetPage();
      tableApi.query();
      state.visible = false;
    };
    const handleDetail = (record: FormState): void => {
      router.push({
        path: "/faultReportDetail",
        query: {
          id: record.id,
          path: window.location.pathname.split("/").at(-1),
        },
      });
    };

    onMounted(() => {
      getType();
    });
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      schema: [
        {
          component: Input,
          label: "",
          fieldName: "keyword",
          defaultValue: undefined,
          componentProps: {
            placeholder: "报告名称",
            showCount: false,
            allowClear: true,
          },
        },
        {
          component: Select,
          label: "",
          fieldName: "type",
          defaultValue: undefined,
          componentProps: {
            fieldNames: { label: "name", value: "code" },
            placeholder: "报告类型",
            options: state.typeOptions,
            style: "min-width: 150px;",
            allowClear: true,
          },
        },
      ],
      showCollapseButton: true,
      queryState: queryState as never,
      queryStateFields: ["keyword", "type"],
      mapFormValuesToQueryState: (values) => mapFormValuesToQueryDefaults(values, queryDefaults),
      handleSubmit: () => {
        tableApi.query();
      },
      handleReset: () => {
        queryState.update(queryDefaults);
        queryState.resetPage();
        tableApi.query();
      },
    });
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: "id",
      tableCode: "FAULT_REPORT",
      queryState: queryState as never,
      fetchApi: async () => {
        const payload = {
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          applicationCode: "FAULT",
        } as Parameters<typeof cubeMaintainService.getReport>[0];
        if (queryState.state.keyword) {
          payload.keyword = queryState.state.keyword;
        }
        if (queryState.state.type) {
          payload.type = queryState.state.type;
        }
        const data = await cubeMaintainService.getReport(payload);
        return {
          ...data,
          pages: Number(data.page) || 0,
        };
      },
      fetchLoaded: (data) => {
        queryState.update({ total: data.total });
      },
    });
    const handleChange = (pageNumber: number, pageSize: number): void => {
      queryState.setPage(pageNumber, pageSize);
      tableApi.query();
    };
    const layoutSlots = {
      "layout-header": () => {
        return (
          <Button
            type="primary"
            onClick={() => {
              state.visible = true;
            }}
          >
            新增
          </Button>
        );
      },
      "layout-content": () => {
        return (
          <>
            <CubeForm />
            <CubeTable />
          </>
        );
      },
      "footer-page": () => {
        return (
          <Page
            v-show={queryState.state.total > 0}
            current={queryState.state.pageNumber}
            pageSize={queryState.state.pageSize}
            total={queryState.state.total}
            showQuickJumper={false}
            showSizeChanger={true}
            showTotal={(total: number) => `共 ${total} 条数据`}
            pageSizeOptions={["10", "20", "50", "100"]}
            onPageChange={handleChange}
          />
        );
      },
    };
    return () => (
      <>
        <CubeLayout title={pageTitle} v-slots={layoutSlots}>
          <ADDModal v-model:visible={state.visible} onSave={handleSaveReport} />
        </CubeLayout>
      </>
    );
  },
});
