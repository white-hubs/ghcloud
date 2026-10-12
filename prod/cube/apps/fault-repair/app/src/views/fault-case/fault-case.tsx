import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { useCubeForm, useCubeQueryState, useCubeTable } from "@ghcloud/cube-app-design";
import type { FaultCaseCategoryTree } from "@ghcloud/cube-fault-repair-service";
import type { FaultCaseType } from "@ghcloud/cube-maintain-service";
import { Button, message, PopOver, Page, Select, Tree, Empty, Input, PopConfirm } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeFaultRepairService, cubeMaintainService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { mapFormValuesToQueryDefaults } from "@/utils";

interface FaultData {
  [key: string]: unknown;
  faultTypeId: string | undefined;
  keyword: string;
  productCategoryCode: string | undefined;
  pageSize: number;
  pageNumber: number;
}

export const FaultCase = defineComponent({
  // 组件的setup函数
  setup: () => {
    onMounted(() => {
      getCategory();
      getFaultType();
    });
    // 使用usePageName函数获取页面名称
    const { pageTitle } = usePageName();
    const router = useRouter();
    const applicationCode = JSON.parse(sessionStorage.getItem("GH-currentApplication") ?? "").code;
    const categoryList = ref<FaultCaseCategoryTree[]>([]);
    const formQueryDefaults = {
      faultTypeId: undefined as string | undefined,
      keyword: "",
    };
    const queryState = useCubeQueryState<FaultData & { total: number }>({
      storage: "url",
      initialState: {
        ...formQueryDefaults,
        productCategoryCode: undefined,
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      cacheFields: ["faultTypeId", "keyword", "productCategoryCode", "pageNumber", "pageSize"],
    });
    const faultTypeOptions = ref();
    const treeSlots = {
      title: ({ data }: { data: { categoryCode: string; categoryName: string; deviceNum: number } }) => {
        return (
          <div
            onClick={() => {
              checkDeviceType(data as { categoryCode: string });
            }}
          >
            <span style={{ color: "#000000", fontSize: "14px" }}>
              {data.categoryName}【{data.deviceNum}】
            </span>
          </div>
        );
      },
    };
    const checkDeviceType = (record: { categoryCode: string }): void => {
      if (queryState.state.productCategoryCode === record.categoryCode) {
        queryState.update({ productCategoryCode: undefined });
      } else {
        queryState.update({ productCategoryCode: record.categoryCode });
      }
      queryState.resetPage();
      queryState.writeCache();
      tableApi.query();
    };
    const getCategory = async (): Promise<void> => {
      try {
        categoryList.value = await cubeFaultRepairService.genFaultCaseDeviceTypeList();
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };
    const getFaultType = async (): Promise<void> => {
      try {
        const result = await cubeMaintainService.faultTypeList({ applicationCode });
        faultTypeOptions.value = result.map((item) => {
          return {
            label: item.name,
            value: item.id,
          };
        });
        formApi.updateFieldSchema({
          component: Select,
          label: "故障类型",
          fieldName: "faultTypeId",
          defaultValue: undefined,
          componentProps: {
            allowClear: true,
            placeholder: "请选择",
            style: "width: 180px",
            options: faultTypeOptions.value,
          },
        });
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      schema: [
        {
          component: Select,
          label: "故障类型",
          fieldName: "faultTypeId",
          defaultValue: undefined,
          componentProps: {
            allowClear: true,
            placeholder: "请选择",
            style: "width: 180px",
            options: faultTypeOptions.value,
          },
        },
        {
          component: Input,
          label: "",
          fieldName: "keyword",
          defaultValue: "",
          componentProps: {
            placeholder: "名称",
            styles: { width: "180px" },
            allowClear: true,
          },
        },
      ],
      showCollapseButton: true,
      queryState: queryState as never,
      queryStateFields: ["faultTypeId", "keyword"],
      mapFormValuesToQueryState: (values) => mapFormValuesToQueryDefaults(values, formQueryDefaults),
      handleSubmit: () => {
        tableApi.query();
      },
      handleReset: () => {
        queryState.update(formQueryDefaults);
        queryState.resetPage();
        tableApi.query();
      },
    });

    const handleChange = (pageNumber: number, pageSize: number): void => {
      queryState.setPage(pageNumber, pageSize);
      tableApi.query();
    };

    const handleDelete = async (record: { id: string }): Promise<void> => {
      try {
        await cubeMaintainService.faultCaseDelete(record.id);
        message.success("删除成功");
        tableApi.query();
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };
    const goOperate = (id: string, type: string): void => {
      router.push(`/faultCaseOperate?type=${type}&id=${id}`);
    };
    const columns = [
      {
        title: "故障类型",
        dataIndex: "faultTypeName",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "故障名称",
        dataIndex: "name",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "产品品类",
        dataIndex: "productCategoryName",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        slots: {
          customRender: "action",
        },
        customRender: ({ record }: { record: FaultCaseType }) => {
          return (
            <>
              <Button
                style={{
                  padding: "4px",
                }}
                type="link"
                onClick={() => {
                  goOperate(record.id, "detail");
                }}
              >
                详情
              </Button>
              <Button
                style={{
                  padding: "4px",
                }}
                type="link"
                onClick={() => {
                  goOperate(record.id, "edit");
                }}
              >
                编辑
              </Button>
              <PopConfirm title="是否确认删除?" ok-text="确定" cancel-text="取消" onConfirm={async () => handleDelete(record)}>
                <Button type="link" danger style={{ padding: "4px" }}>
                  删除
                </Button>
              </PopConfirm>
            </>
          );
        },
      },
    ];
    const [CubeTable, tableApi] = useCubeTable({
      rowKey: "id",
      columns,
      tableCode: "FAULT_LIST",
      queryState: queryState as never,
      fetchApi: async () => {
        const data = await cubeMaintainService.faultCasePage({
          faultTypeId: queryState.state.faultTypeId,
          keyword: queryState.state.keyword,
          productCategoryCode: queryState.state.productCategoryCode,
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
        } as Parameters<typeof cubeMaintainService.faultCasePage>[0] & {
          faultTypeId?: string;
          productCategoryCode?: string;
        });
        return {
          ...data,
          pages: Number(data.page) || 0,
        };
      },
      fetchLoaded: (data) => {
        queryState.update({ total: data.total });
      },
    });
    const layoutSlots = {
      "layout-header": () => {
        return (
          <Button
            type="primary"
            onClick={() => {
              goOperate("", "add");
            }}
          >
            新增
          </Button>
        );
      },
      "layout-sider": () => {
        return (
          <>
            {categoryList.value?.length ? (
              <Tree
                style={{ width: "200px" }}
                fieldNames={{ children: "children", title: "categoryName", key: "categoryCode" }}
                treeData={categoryList.value}
                v-slots={treeSlots}
              />
            ) : (
              <Empty />
            )}
          </>
        );
      },
      "layout-right": () => {
        return (
          <div>
            <CubeForm />
            <CubeTable />
          </div>
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
    return () => <Layout v-slots={layoutSlots} showSider title={pageTitle} />;
  },
});
