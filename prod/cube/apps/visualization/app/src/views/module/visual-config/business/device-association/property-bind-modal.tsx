import { defineComponent, onMounted, reactive, ref, watch, type PropType } from "vue";

import type { PropertyClassifyOption, PropertyRecord } from "@ghcloud/cube-service-interface/property";
import { listUnboundProperties } from "@ghcloud/cube-services-client/property.client";
import { Button, Checkbox, Form, FormItem, Input, Modal, Page, Select, Table, message } from "@ghcloud/cube-ui";

import { useAuthRequest } from "@/hooks/auth-request";

import styles from "./device-association.module.less";

export type PropertyBindResult = {
  checkAll: boolean;
  businessIds: string[];
  typeId?: string;
  keyword: string;
};

const formatAreaName = (record: PropertyRecord): string => record.areaName || record.area?.map((item) => item.name).join("/") || "--";

/**
 * 资产关联弹窗。
 */
export const PropertyBindModal = defineComponent({
  name: "PropertyBindModal",
  props: {
    open: { type: Boolean, default: false },
    sceneType: { type: String, default: "" },
    propertyTypes: { type: Array as PropType<PropertyClassifyOption[]>, default: () => [] },
  },
  emits: ["update:open", "ok"],
  setup(props, { emit }) {
    const loading = ref(false);
    const confirmLoading = ref(false);
    const checkAll = ref(false);
    const selectedRowKeys = ref<string[]>([]);
    const tableData = ref<PropertyRecord[]>([]);
    const search = reactive({
      typeId: undefined as string | undefined,
      keyword: "",
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const columns = [
      { title: "资产编码", dataIndex: "serialNumber", key: "serialNumber", ellipsis: true },
      { title: "资产名称", dataIndex: "name", key: "name", ellipsis: true },
      { title: "资产类型", dataIndex: "typeName", key: "typeName", width: 140, ellipsis: true },
      {
        title: "所在区域",
        key: "areaName",
        ellipsis: true,
        customRender: ({ record }: { record: PropertyRecord }) => formatAreaName(record),
      },
      { title: "模型编码", dataIndex: "deviceNumber", key: "deviceNumber", width: 140, ellipsis: true },
    ];

    const loadPage = async (): Promise<void> => {
      if (!props.sceneType) {
        return;
      }
      loading.value = true;
      try {
        const res = await useAuthRequest(() =>
          listUnboundProperties({
            sceneType: props.sceneType,
            pageNumber: search.pageNumber,
            pageSize: search.pageSize,
            keyword: search.keyword.trim() || undefined,
            typeId: search.typeId || undefined,
          }),
        );
        tableData.value = (res.records ?? []).map((item) => ({
          ...item,
          areaName: formatAreaName(item),
        }));
        search.total = res.total ?? 0;
      } catch {
        message.error("加载资产列表失败");
        tableData.value = [];
        search.total = 0;
      } finally {
        loading.value = false;
      }
    };

    const resetAndLoad = (): void => {
      search.typeId = undefined;
      search.keyword = "";
      search.pageNumber = 1;
      void loadPage();
    };

    const handleOk = (): void => {
      if (!checkAll.value && !selectedRowKeys.value.length) {
        message.warning("请选择关联资产");
        return;
      }
      confirmLoading.value = true;
      emit("ok", {
        checkAll: checkAll.value,
        businessIds: [...selectedRowKeys.value],
        typeId: search.typeId || undefined,
        keyword: search.keyword.trim(),
      } satisfies PropertyBindResult);
      confirmLoading.value = false;
    };

    watch(
      () => props.open,
      (open) => {
        if (open) {
          selectedRowKeys.value = [];
          checkAll.value = false;
          search.typeId = undefined;
          search.keyword = "";
          search.pageNumber = 1;
          void loadPage();
        }
      },
    );

    onMounted(() => {
      if (props.open) {
        void loadPage();
      }
    });

    return () => (
      <Modal
        visible={props.open}
        title="资产关联"
        width={1000}
        confirmLoading={confirmLoading.value}
        destroyOnClose
        onOk={handleOk}
        onCancel={() => emit("update:open", false)}
      >
        <Form layout="inline" class={styles.modalFilter}>
          <FormItem label="资产类型">
            <Select
              value={search.typeId}
              options={props.propertyTypes}
              fieldNames={{ label: "name", value: "id" }}
              allowClear
              placeholder="请选择资产类型"
              style={{ width: "160px" }}
              onUpdate:value={(val: string) => {
                search.typeId = val || undefined;
              }}
            />
          </FormItem>
          <FormItem label="资产名称">
            <Input
              value={search.keyword}
              maxlength={20}
              allowClear
              placeholder="请输入资产名称"
              style={{ width: "180px" }}
              onUpdate:value={(val: string) => {
                search.keyword = (val ?? "").replace(/\s+/g, "");
              }}
              onPressEnter={() => {
                search.pageNumber = 1;
                void loadPage();
              }}
            />
          </FormItem>
          <FormItem label="勾选当前所有">
            <Checkbox
              checked={checkAll.value}
              onUpdate:checked={(val: boolean) => {
                checkAll.value = Boolean(val);
              }}
            />
          </FormItem>
          <FormItem>
            <div class={styles.filterActions}>
              <Button
                type="primary"
                onClick={() => {
                  search.pageNumber = 1;
                  void loadPage();
                }}
              >
                查询
              </Button>
              <Button onClick={resetAndLoad}>重置</Button>
            </div>
          </FormItem>
        </Form>
        <Table
          class={styles.modalTable}
          columns={columns}
          dataSource={tableData.value}
          loading={loading.value}
          pagination={false}
          rowKey="id"
          scroll={{ y: 420 }}
          rowSelection={{
            selectedRowKeys: selectedRowKeys.value,
            preserveSelectedRowKeys: true,
            onChange: (keys: Array<string | number>) => {
              selectedRowKeys.value = keys.map(String);
            },
          }}
          size="middle"
        />
        <div class={styles.modalPage}>
          <Page
            current={search.pageNumber}
            pageSize={search.pageSize}
            total={search.total}
            syncQuery={false}
            onPageChange={(pageNumber: number, pageSize: number) => {
              search.pageNumber = pageNumber;
              search.pageSize = pageSize;
              void loadPage();
            }}
          />
        </div>
      </Modal>
    );
  },
});

export default PropertyBindModal;
