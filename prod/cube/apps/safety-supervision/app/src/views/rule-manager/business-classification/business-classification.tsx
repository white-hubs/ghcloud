import type { DefaultOptionType } from "ant-design-vue/es/select";
import type { RawValueType } from "ant-design-vue/es/vc-select/BaseSelect";
import type { LabelInValueType } from "ant-design-vue/es/vc-select/Select";
import { defineComponent, ref, onMounted, computed, reactive } from "vue";

import type { RuleLibraries } from "@ghcloud/cube-safety-management-service";
import { Button, PopOver, Table, Page, Modal, Form, Input, Select, message, FormItem, PopConfirm, InputNumber } from "@ghcloud/cube-ui";
import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { Layout } from "@ghcloud/generic-component";

import { cubeSafetyManagementAnalysisService } from "@/api/server";
import { useTableScroll } from "@/hook/use-table-scroll";
import { appCodeMap } from "@/views/security-analysis/components/analysis/mock";

interface TableData {
  applocationName: string;
  businessName: string;
  weightAllot: string;
  formula: string;
  itemType: string;
  itemCodeConcat: string;
  isAplocation: boolean;
  isBusiness: boolean;
  parentId?: string;
  id: string;
  itemCode?: string;
}

interface FormState {
  id?: string;
  parentId?: string;
  itemName: string;
  itemCode?: string;
  weightAllot?: number;
}

export const BusinessClassification = defineComponent({
  setup: () => {
    const screenHeight = ref<number>(window.innerHeight);
    const { pageTitle } = usePageName();
    const loading = ref(false);
    const buttonLoading = ref(false);
    const modalVisible = ref(false);
    const appModalVisible = ref(false);
    const formRef = ref();
    const appFormRef = ref();
    const formState = reactive<FormState>({
      itemName: "",
    });
    const appFormState = reactive<FormState>({
      itemName: "",
    });
    const modalTitle = ref("");
    const rules = {
      parentId: [{ required: true, message: "请选择父级" }],
      itemName: [{ required: true, message: "请输入子级业务分类名称" }],
      weightAllot: [{ required: true, message: "请输入计分权重" }],
    };

    const appRules = {
      itemName: [{ required: true, message: "请输入应用名称" }],
      weightAllot: [{ required: true, message: "请输入计分权重" }],
    };

    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const queryCache = useListQueryCache({
      defaults: {
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
      }),
      setState: (next) => {
        pagination.value.pageNumber = Number(next.pageNumber ?? 1);
        pagination.value.pageSize = Number(next.pageSize ?? 10);
      },
    });
    const tabeData = ref<TableData[]>([]);

    const columns = [
      {
        title: "应用名称",
        align: "center",
        dataIndex: "applocationName",
        ellipsis: true,
        width: 250,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "业务分类",
        align: "center",
        dataIndex: "businessName",
        ellipsis: true,
        width: 250,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "计分权重",
        align: "center",
        dataIndex: "weightAllot",
        ellipsis: true,
        width: 150,
      },
      {
        title: "计分公式",
        align: "center",
        dataIndex: "formula",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "操作",
        align: "center",
        dataIndex: "action",
        width: 200,
        customRender: ({ record }: { record: TableData }): JSX.Element => {
          return (
            <>
              {record.isAplocation && (
                <Button type="link" size="small" onClick={() => handleAdd(record)}>
                  新增下级
                </Button>
              )}

              <Button type="link" size="small" onClick={() => handleEdit(record)}>
                编辑
              </Button>

              {
                <PopConfirm title="确定删除吗?" onConfirm={async (): Promise<void> => handleDelete(record.id)}>
                  <Button type="link" size="small" danger>
                    删除
                  </Button>
                </PopConfirm>
              }
            </>
          );
        },
      },
    ];
    const parentOptions = computed(() => {
      return tabeData.value.filter((item) => item.isAplocation).map((item) => ({ label: item.applocationName, value: item.id }));
    });

    const handleDelete = async (id: string): Promise<void> => {
      loading.value = true;
      try {
        await cubeSafetyManagementAnalysisService.deleteRuleLibrariesList({ id });
        message.success("删除成功");
        getTreeData();
      } catch {
      } finally {
        loading.value = false;
      }
    };

    const handleAdd = (record: TableData): void => {
      Object.assign(formState, { id: undefined, itemName: undefined, weightAllot: undefined, parentId: record.id });
      modalTitle.value = "添加业务分类";
      modalVisible.value = true;
    };
    const handleEdit = (record: TableData): void => {
      if (record.isAplocation) {
        Object.assign(appFormState, {
          id: record.id,
          itemName: record.applocationName,
          weightAllot: record.weightAllot,
          itemCode: record.itemCode,
        });
        modalTitle.value = "编辑应用";
        appModalVisible.value = true;
      } else if (record.isBusiness) {
        Object.assign(formState, {
          id: record.id,
          itemName: record.businessName,
          weightAllot: record.weightAllot,
          parentId: record.parentId,
        });
        modalTitle.value = "编辑业务分类";
        modalVisible.value = true;
      }
    };
    const handleAddApp = (): void => {
      Object.assign(appFormState, { id: undefined, itemName: undefined, weightAllot: undefined, itemCode: undefined });
      appModalVisible.value = true;
      modalTitle.value = "添加应用";
    };

    const handleOk = async (): Promise<void> => {
      await formRef.value.validate();
      buttonLoading.value = true;
      if (formState.id) {
        await handelEditTypeMethods();
      } else {
        await handelAddTypeMethods();
      }
    };

    const handelAddTypeMethods = async (): Promise<void> => {
      try {
        await cubeSafetyManagementAnalysisService.postRuleLibrariesList({
          ...formState,
          itemType: "GROUP",
        });
        message.success("新增成功");
        handleCancel();
        getTreeData();
      } catch {
      } finally {
        buttonLoading.value = false;
      }
    };
    const getAppListMethods = async (): Promise<void> => {
      // try {
      //   const data = await cubeOuaaService.getTerminalApplicationsFormTenant()
      // } catch {
      // } finally {
      //   buttonLoading.value = false
      // }
    };
    const handelEditTypeMethods = async (): Promise<void> => {
      try {
        await cubeSafetyManagementAnalysisService.editRuleLibrariesList({
          ...formState,
          itemType: "GROUP",
        });
        message.success("新增成功");
        handleCancel();
        getTreeData();
      } catch {
      } finally {
        buttonLoading.value = false;
      }
    };
    const handleAppOk = async (): Promise<void> => {
      await appFormRef.value.validate();
      buttonLoading.value = true;
      if (appFormState.id) {
        await handleEditAppMethods();
      } else {
        await handleAddAppMethods();
      }
    };
    const handleAddAppMethods = async (): Promise<void> => {
      try {
        await cubeSafetyManagementAnalysisService.postRuleLibrariesList({
          ...appFormState,
          itemType: "APPLICATION",
        });
        message.success("新增成功");
        handleAppCancel();
        getTreeData();
      } catch {
      } finally {
        buttonLoading.value = false;
      }
    };
    const handleEditAppMethods = async (): Promise<void> => {
      try {
        await cubeSafetyManagementAnalysisService.editRuleLibrariesList({
          ...appFormState,
          itemType: "APPLICATION",
        });
        message.success("新增成功");
        handleAppCancel();
        getTreeData();
      } catch {
      } finally {
        buttonLoading.value = false;
      }
    };
    const handleCancel = (): void => {
      formRef.value.resetFields();
      modalVisible.value = false;
    };

    const handleAppCancel = (): void => {
      appFormRef.value.resetFields();
      appModalVisible.value = false;
    };

    const getTreeData = async (): Promise<void> => {
      try {
        loading.value = true;
        const data = await cubeSafetyManagementAnalysisService.getRuleLibrariesList();
        tabeData.value = convertToTabeData(data);
        pagination.value.total = tabeData.value.length;
      } catch {
      } finally {
        loading.value = false;
      }
    };

    const convertToTabeData = (items: RuleLibraries[]): TableData[] => {
      const dataSource = [] as TableData[];
      const treeData = [] as TableData[];
      items?.forEach((item: RuleLibraries) => {
        dataSource.push(mapTreeItemToTableItem(item, "APPLICATION"));
        treeData.push(mapTreeItemToTableItem(item, "APPLICATION"));
        if (item.children && item.children.length > 0) {
          item.children?.forEach((subItem: RuleLibraries) => {
            dataSource.push(mapTreeItemToTableItem(subItem, "GROUP"));
          });
        }
      });
      return dataSource;
    };

    const mapTreeItemToTableItem = (item: RuleLibraries, type: string): TableData => {
      const isApplocation = type === "APPLICATION";
      const isBusiness = type === "GROUP";
      return {
        applocationName: isApplocation ? item.itemName : "--",
        businessName: isBusiness ? item.itemName : "--",
        weightAllot: item.weightAllot ?? "--",
        formula: "业务权重  /  (当前节点所有兄弟节点权重之和  * 100 ) * 100",
        itemType: type,
        itemCodeConcat: item.itemCodeConcat ?? "--",
        isAplocation: isApplocation,
        isBusiness: isBusiness,
        parentId: item.parentId ?? "",
        id: item.id,
        itemCode: item.itemCode ?? "--",
      };
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      queryCache.sync();
    };

    // 当前页数据
    const currentPageData = computed(() => {
      let start = (pagination.value.pageNumber - 1) * pagination.value.pageSize;
      let end = start + pagination.value.pageSize;
      let data = tabeData.value.slice(start, end);
      if (data.length === 0 && pagination.value.pageNumber > 1) {
        pageChange(pagination.value.pageNumber - 1, pagination.value.pageSize);
        start = (pagination.value.pageNumber - 1) * pagination.value.pageSize;
        end = start + pagination.value.pageSize;
        data = tabeData.value.slice(start, end);
      }
      return data;
    });

    const updateHeight = (): void => {
      screenHeight.value = window.innerHeight;
    };

    const { scorllY } = useTableScroll();

    onMounted(async () => {
      window.addEventListener("resize", updateHeight);
      // getTableData()
      getAppListMethods();
      await queryCache.hydrateAndQuery(getTreeData);
    });
    const selectChange = (value: RawValueType | LabelInValueType, option: DefaultOptionType): void => {
      appFormState.itemName = option.name;
    };
    const layoutSlots = {
      "layout-header": (): JSX.Element => {
        return (
          <div>
            <Button type="primary" onClick={handleAddApp}>
              新增应用
            </Button>
          </div>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <>
            <Table
              rowKey="itemCodeConcat"
              rowSelection={false}
              columns={columns}
              loading={loading.value}
              dataSource={currentPageData.value}
              pagination={false}
              scrollY={scorllY.value + 170}
            />
          </>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <Page
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
          />
        );
      },
    };
    return (): JSX.Element => (
      <>
        <Layout title={pageTitle ?? "业务分类"} v-slots={layoutSlots}></Layout>
        <Modal
          title={modalTitle.value}
          v-model:visible={modalVisible.value}
          onOk={handleOk}
          onCancel={handleCancel}
          width={600}
          okButtonProps={{ loading: buttonLoading.value }}
        >
          <Form ref={formRef} model={formState} rules={rules} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            <FormItem label="应用" name="parentId">
              <Select v-model:value={formState.parentId} options={parentOptions.value} />
            </FormItem>
            <FormItem label="业务分类" name="itemName">
              <Input v-model:value={formState.itemName} />
            </FormItem>
            <FormItem label="计分权重" name="weightAllot">
              <InputNumber min={1} max={100} v-model:value={formState.weightAllot} />
            </FormItem>
            <FormItem label="计分公式" name="methods">
              <Input value={"业务权重 / (当前节点所有兄弟节点权重之和 * 100 ) * 100"} maxlength={40} disabled />
            </FormItem>
          </Form>
        </Modal>
        <Modal
          title={modalTitle.value}
          v-model:visible={appModalVisible.value}
          onOk={handleAppOk}
          onCancel={handleAppCancel}
          width={600}
          okButtonProps={{ loading: buttonLoading.value }}
        >
          <Form ref={appFormRef} model={appFormState} rules={appRules} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            <FormItem label="应用名称" name="itemName">
              {/* <Input v-model:value={appFormState.itemName} /> */}
              <Select
                v-model:value={appFormState.itemCode}
                options={appCodeMap}
                fieldNames={{ label: "name", value: "code" }}
                onChange={selectChange}
              ></Select>
            </FormItem>
            <FormItem label="计分权重" name="weightAllot">
              <InputNumber min={1} max={100} v-model:value={appFormState.weightAllot} />
            </FormItem>
            <FormItem label="计分公式" name="methods">
              <Input value={"业务权重 / (当前节点所有兄弟节点权重之和 * 100 ) * 100"} maxlength={40} disabled />
            </FormItem>
          </Form>
        </Modal>
      </>
    );
  },
});
