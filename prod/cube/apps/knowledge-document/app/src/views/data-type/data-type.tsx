import { defineComponent, reactive, onMounted } from "vue";

import { Button, PopConfirm, message, FormItem, Form, Input } from "@ghcloud/cube-ui";
import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { AliasTable, Layout as GLayout } from "@ghcloud/generic-component";

import { EditModal } from "./components/edit-modal";
import { cubeDeviceSuperviseService } from "@/api/service";
export interface FormState {
  id?: string;
  typeName: string;
  code: "";
}
export const DataType = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const queryCache = useListQueryCache({
      defaults: {
        keyword: "",
      },
      getState: () => ({
        keyword: state.searchParams.keyword,
      }),
      setState: (next) => {
        state.searchParams.keyword = (next.keyword as string) ?? "";
      },
    });
    const state = reactive<{
      loading: boolean;
      visible: boolean;
      dataSource: unknown[];
      modalState: string;
      rowState: FormState;
      searchParams: {
        keyword: string;
      };
    }>({
      loading: false,
      modalState: "create",
      visible: false,
      rowState: {
        typeName: "",
        code: "",
      },
      dataSource: [],
      searchParams: {
        keyword: "",
      },
    });
    const getList = async (): Promise<void> => {
      try {
        state.loading = true;
        const params = {
          ...state.searchParams,
        };
        const result = await cubeDeviceSuperviseService.getKnowledgeDataTypeList(params);
        state.dataSource = result;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      } finally {
        state.loading = false;
      }
    };

    const handleDelete = async (row: FormState): Promise<void> => {
      if (row.id) {
        await cubeDeviceSuperviseService.deleteKnowledgeDataType(row.id);
        message.success("操作成功");
        getList();
      } else {
        message.info("数据标识异常");
      }
    };
    const handleSaveType = async (row: FormState): Promise<void> => {
      const params = row as unknown as Record<string, string>;
      row.id
        ? await cubeDeviceSuperviseService.updateKnowledgeDataType(params)
        : await cubeDeviceSuperviseService.createKnowledgeDataType(params);
      message.success("操作成功");
      getList();
      state.visible = false;
    };
    const handleEdit = (row: FormState): void => {
      state.modalState = "edit";
      state.rowState = {
        ...row,
      };
      state.visible = true;
    };
    const columns = [
      {
        title: "类型名称",
        dataIndex: "typeName",
        key: "typeName",
        align: "center",
      },
      {
        title: "操作",
        dataIndex: "operate",
        key: "operate",
        align: "center",
        customRender: ({ record }: { record: FormState }): JSX.Element => {
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
    onMounted(async () => {
      await queryCache.hydrateAndQuery(getList);
    });
    const handleSearch = async (): Promise<void> => {
      await getList();
      await queryCache.sync();
    };
    const handleReset = async (): Promise<void> => {
      await queryCache.reset();
      await getList();
    };
    const layoutSlots = {
      "layout-header": (): JSX.Element => {
        return (
          <Button
            type="primary"
            onClick={() => {
              state.rowState = {
                typeName: "",
                code: "",
              };
              state.modalState = "create";
              state.visible = true;
            }}
          >
            新增
          </Button>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <>
            <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Input v-model:value={state.searchParams.keyword} placeholder="名称" showCount={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Button type="primary" onClick={handleSearch}>
                  查询
                </Button>
                <Button style={{ marginLeft: "10px" }} onClick={handleReset}>
                  重置
                </Button>
              </FormItem>
            </Form>
            <AliasTable
              columns={columns}
              loading={state.loading}
              tableCode="TYPE"
              scrollX={400}
              applicationCode="SMALLENFINEERING"
              dataSource={state.dataSource}
              pagination={false}
            />
          </>
        );
      },
    };
    return (): JSX.Element => (
      <>
        <GLayout title={pageTitle} v-slots={layoutSlots}>
          <EditModal formData={state.rowState} state={state.modalState} v-model:visible={state.visible} onSave={handleSaveType} />
        </GLayout>
      </>
    );
  },
});
