import { defineComponent, onMounted, reactive } from "vue";

import type {
  AccessControlRecord,
  DeviceProductCategoryRecord,
  DeviceProductRecord,
  DoorDeviceRecord,
  DoorTypeRecord,
} from "@ghcloud/cube-service-interface/access-control";
import { getDeviceList, getDeviceProduct, getDoorType, getProductAll } from "@ghcloud/cube-services-client/access-control.client";
import { Button, Cascader, Form, FormItem, Input, Modal, Page, Select, Space, Steps, Step, Table, message } from "@ghcloud/cube-ui";

import { APPLICATION_CODE } from "@/constants/env";

import "./association-modal.less";

// cube-ui Table 的运行时 props 均有默认值，但当前声明仍将它们标成必填。
const DataTable = Table as any;

export interface AssociationModalExpose {
  open: () => void;
  close: () => void;
}

export interface AssociationResult {
  type: string;
  list: DoorDeviceRecord[];
}

export default defineComponent({
  name: "AssociationModal",
  emits: ["submit"],
  setup: (_props, { emit, expose }) => {
    const state = reactive({
      visible: false,
      loading: false,
      step: 0,
      type: "",
      keyword: "",
      productId: "",
      categoryCodes: [] as string[],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      rows: [] as DoorDeviceRecord[],
      selectedRowKeys: [] as Array<string | number>,
      selectedRows: [] as DoorDeviceRecord[],
      doorTypes: [] as DoorTypeRecord[],
      products: [] as DeviceProductRecord[],
      categories: [] as DeviceProductCategoryRecord[],
    });

    const loadOptions = async (): Promise<void> => {
      const [doorTypes, products, categories] = await Promise.all([getDoorType({}), getProductAll({}), getDeviceProduct({})]);
      state.doorTypes = doorTypes;
      state.products = products;
      state.categories = categories;
    };

    const loadDevices = async (): Promise<void> => {
      state.loading = true;
      try {
        const result = await getDeviceList({
          filterTagCodes: [`builtin.app::${APPLICATION_CODE}`],
          applicationCode: APPLICATION_CODE,
          pageNumber: state.pageNumber,
          pageSize: state.pageSize,
          keyword: state.keyword,
          productId: state.productId,
          categoryCode: state.categoryCodes.join("-"),
        });
        state.rows = Array.isArray(result) ? result : result.records;
        state.total = Array.isArray(result) ? result.length : result.total;
      } finally {
        state.loading = false;
      }
    };

    const resetSearch = (): void => {
      state.keyword = "";
      state.productId = "";
      state.categoryCodes = [];
      state.pageNumber = 1;
      void loadDevices();
    };

    const open = (): void => {
      Object.assign(state, {
        visible: true,
        step: 0,
        type: "",
        selectedRowKeys: [],
        selectedRows: [],
      });
      resetSearch();
    };
    const close = (): void => {
      state.visible = false;
    };

    const next = (): void => {
      if (!state.type) {
        message.warning("请选择门禁类型");
        return;
      }
      state.step = 1;
    };
    const submit = (): void => {
      if (!state.selectedRows.length) {
        message.warning("请选择设备");
        return;
      }
      emit("submit", { type: state.type, list: state.selectedRows } satisfies AssociationResult);
    };

    expose({ open, close });
    onMounted(() => {
      void loadOptions();
    });

    const columns = [
      { dataIndex: "name", title: "设备名称", ellipsis: true },
      {
        dataIndex: "productName",
        title: "所属产品",
        ellipsis: true,
        customRender: ({ record }: { record: AccessControlRecord }) => String((record.productInfo as AccessControlRecord)?.name || "--"),
      },
      {
        dataIndex: "productCategoryName",
        title: "产品品类",
        ellipsis: true,
        customRender: ({ record }: { record: AccessControlRecord }) =>
          String(((record.productInfo as AccessControlRecord)?.productCategory as AccessControlRecord)?.name || "--"),
      },
      {
        dataIndex: "departmentName",
        title: "维护部门",
        ellipsis: true,
        customRender: ({ record }: { record: AccessControlRecord }) => String((record.department as AccessControlRecord)?.name || "--"),
      },
      {
        dataIndex: "areaName",
        title: "所属区域",
        ellipsis: true,
        customRender: ({ record }: { record: AccessControlRecord }) => String((record.area as AccessControlRecord)?.pathName || "--"),
      },
    ];

    return () => (
      <Modal
        visible={state.visible}
        title="关联设备"
        width="1000px"
        okText={state.step === 0 ? "下一步" : "确定"}
        onCancel={close}
        onOk={state.step === 0 ? next : submit}
        onUpdate:visible={(visible: boolean) => {
          state.visible = visible;
        }}
      >
        <Steps size="small" current={state.step}>
          <Step title="选择门禁类型" />
          <Step title="选择设备" />
        </Steps>
        {state.step === 0 ? (
          <Form class="association-type-form">
            <FormItem label="门禁类型" required>
              <Select
                value={state.type}
                options={state.doorTypes.map((item) => ({
                  value: String(item.value || item.id || ""),
                  label: String(item.doorTypeName || item.label || "--"),
                }))}
                onUpdate:value={(value: string) => {
                  state.type = value;
                }}
              />
            </FormItem>
          </Form>
        ) : (
          <>
            <Form layout="inline" class="association-search-form">
              <FormItem label="所属产品">
                <Select
                  allowClear
                  value={state.productId}
                  options={state.products.map((item) => ({
                    value: String(item.value || item.id || ""),
                    label: String(item.prodName || item.name || "--"),
                  }))}
                  onUpdate:value={(value: string) => {
                    state.productId = value || "";
                  }}
                />
              </FormItem>
              <FormItem label="产品品类">
                <Cascader
                  value={state.categoryCodes}
                  options={state.categories}
                  fieldNames={{ label: "categoryName", value: "categoryCode", children: "children" }}
                  onUpdate:value={(value: string[]) => {
                    state.categoryCodes = value || [];
                  }}
                />
              </FormItem>
              <FormItem>
                <Input
                  value={state.keyword}
                  placeholder="请输入设备名称或编码"
                  onUpdate:value={(value: string) => {
                    state.keyword = value;
                  }}
                />
              </FormItem>
              <FormItem>
                <Space>
                  <Button
                    type="primary"
                    onClick={() => {
                      state.pageNumber = 1;
                      void loadDevices();
                    }}
                  >
                    查询
                  </Button>
                  <Button onClick={resetSearch}>重置</Button>
                </Space>
              </FormItem>
            </Form>
            <DataTable
              rowKey="id"
              columns={columns}
              dataSource={state.rows}
              loading={state.loading}
              pagination={false}
              scrollY={420}
              rowSelection={{
                selectedRowKeys: state.selectedRowKeys,
                onChange: (keys: Array<string | number>, rows: unknown[]) => {
                  state.selectedRowKeys = keys;
                  state.selectedRows = rows as DoorDeviceRecord[];
                },
              }}
            />
            <Page
              current={state.pageNumber}
              pageSize={state.pageSize}
              total={state.total}
              showQuickJumper={false}
              showSizeChanger
              showTotal={(total: number) => `共 ${total} 条`}
              pageSizeOptions={["10", "20", "50", "100"]}
              onPageChange={(pageNumber: number, pageSize: number) => {
                state.pageNumber = pageNumber;
                state.pageSize = pageSize;
                void loadDevices();
              }}
            />
          </>
        )}
      </Modal>
    );
  },
});
