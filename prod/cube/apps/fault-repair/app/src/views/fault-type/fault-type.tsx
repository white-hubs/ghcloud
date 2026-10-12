import { defineComponent, reactive } from "vue";

import { CubeLayout, useCubeForm, useCubeQueryState, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, PopConfirm, message, Input, Page } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { TypeModal } from "./components/type-modal";
import { cubeMaintainService } from "@/api/service";
import { mapFormValuesToQueryDefaults } from "@/utils";
export interface FormState {
  id?: string | undefined;
  name: string;
}
interface QueryState {
  [key: string]: unknown;
  keyword: string | undefined;
  pageSize: number;
  pageNumber: number;
}
export const FaultType = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const flowCode = JSON.parse(sessionStorage.getItem("GH-currentApplication") ?? "").code;
    const state = reactive<{
      visible: boolean;
      modalData: FormState;
    }>({
      visible: false,
      modalData: {
        name: "",
        id: undefined,
      },
    });
    const queryDefaults = {
      keyword: undefined as string | undefined,
    };
    const queryState = useCubeQueryState<QueryState & { total: number }>({
      storage: "url",
      initialState: {
        ...queryDefaults,
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      cacheFields: ["keyword", "pageNumber", "pageSize"],
    });
    const columns = [
      {
        title: "类型",
        dataIndex: "name",
        key: "name",
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
                  handleEdit(record);
                }}
                style={{ paddingLeft: 0, paddingRight: 0 }}
              >
                编辑
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
        await cubeMaintainService.faultTypeDelete(row.id);
        message.success("操作成功");
        queryState.resetPage();
        tableApi.query();
      } else {
        message.info("操作失败");
      }
    };
    const handleSave = async (row: FormState): Promise<void> => {
      try {
        if (row.id) {
          await cubeMaintainService.faultTypeUpdate({ id: row.id, name: row.name, applicationCode: flowCode });
        } else {
          await cubeMaintainService.faultTypeAdd({ name: row.name, applicationCode: flowCode });
        }
        message.success("操作成功");
      } catch (error) {}
      queryState.resetPage();
      tableApi.query();
      state.visible = false;
    };
    const handleEdit = (record: FormState): void => {
      state.visible = true;
      state.modalData = {
        id: record.id,
        name: record.name,
      };
    };

    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      schema: [
        {
          component: Input,
          label: "",
          fieldName: "keyword",
          defaultValue: undefined,
          componentProps: {
            placeholder: "名称",
            allowClear: true,
          },
        },
      ],
      showCollapseButton: true,
      queryState: queryState as never,
      queryStateFields: ["keyword"],
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
      tableCode: "FAULT_TYPE",
      rowKey: "id",
      queryState: queryState as never,
      fetchApi: async () => {
        const payload = {
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          applicationCode: flowCode,
        } as Parameters<typeof cubeMaintainService.faultTypeList>[0] & { keyword?: string };
        if (queryState.state.keyword) {
          payload.keyword = queryState.state.keyword;
        }
        const records = await cubeMaintainService.faultTypeList(payload);
        return {
          records,
          total: records.length,
          pages: 1,
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
              state.modalData = {
                name: "",
                id: undefined,
              };
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
          <TypeModal v-model:visible={state.visible} formData={state.modalData} onSave={handleSave} />
        </CubeLayout>
      </>
    );
  },
});
