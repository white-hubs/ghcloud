import { defineComponent, onMounted, reactive, ref, watch, type PropType } from "vue";

import type { CascadeDictionaryItem } from "@ghcloud/cube-service-interface/dictionary";
import type { RiskSourceRecord } from "@ghcloud/cube-service-interface/property";
import { listUnboundRiskSources } from "@ghcloud/cube-services-client/property.client";
import { Button, Cascader, Checkbox, Form, FormItem, Input, Modal, Page, Table, message } from "@ghcloud/cube-ui";

import { useAuthRequest } from "@/hooks/auth-request";

import styles from "./device-association.module.less";

export type RiskBindResult = {
  checkAll: boolean;
  businessIds: string[];
  typeCode?: string;
  keyword: string;
};

const formatAreaName = (record: RiskSourceRecord): string => record.areaName || record.area?.map((item) => item.name).join("/") || "--";

const lastCascaderValue = (value: string[] | string | undefined): string | undefined => {
  if (Array.isArray(value) && value.length) {
    return String(value[value.length - 1]);
  }
  if (typeof value === "string" && value) {
    return value;
  }
  return undefined;
};

/**
 * 风险源关联弹窗。
 */
export const RiskBindModal = defineComponent({
  name: "RiskBindModal",
  props: {
    open: { type: Boolean, default: false },
    sceneType: { type: String, default: "" },
    riskTypes: { type: Array as PropType<CascadeDictionaryItem[]>, default: () => [] },
  },
  emits: ["update:open", "ok"],
  setup(props, { emit }) {
    const loading = ref(false);
    const confirmLoading = ref(false);
    const checkAll = ref(false);
    const selectedRowKeys = ref<string[]>([]);
    const tableData = ref<RiskSourceRecord[]>([]);
    const search = reactive({
      typeCode: [] as string[],
      keyword: "",
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const columns = [
      { title: "风险源编码", dataIndex: "serialNumber", key: "serialNumber", ellipsis: true },
      { title: "风险源名称", dataIndex: "name", key: "name", ellipsis: true },
      { title: "分类", dataIndex: "typeName", key: "typeName", width: 140, ellipsis: true },
      {
        title: "所在区域",
        key: "areaName",
        ellipsis: true,
        customRender: ({ record }: { record: RiskSourceRecord }) => formatAreaName(record),
      },
      { title: "模型编码", dataIndex: "bimCode", key: "bimCode", width: 140, ellipsis: true },
    ];

    const loadPage = async (): Promise<void> => {
      if (!props.sceneType) {
        return;
      }
      loading.value = true;
      try {
        const res = await useAuthRequest(() =>
          listUnboundRiskSources({
            sceneType: props.sceneType,
            pageNumber: search.pageNumber,
            pageSize: search.pageSize,
            keyword: search.keyword.trim() || undefined,
            typeCode: lastCascaderValue(search.typeCode),
          }),
        );
        tableData.value = (res.records ?? []).map((item) => ({
          ...item,
          areaName: formatAreaName(item),
        }));
        search.total = res.total ?? 0;
      } catch {
        message.error("加载风险源列表失败");
        tableData.value = [];
        search.total = 0;
      } finally {
        loading.value = false;
      }
    };

    const resetAndLoad = (): void => {
      search.typeCode = [];
      search.keyword = "";
      search.pageNumber = 1;
      void loadPage();
    };

    const handleOk = (): void => {
      if (!checkAll.value && !selectedRowKeys.value.length) {
        message.warning("请选择关联风险源");
        return;
      }
      confirmLoading.value = true;
      emit("ok", {
        checkAll: checkAll.value,
        businessIds: [...selectedRowKeys.value],
        typeCode: lastCascaderValue(search.typeCode),
        keyword: search.keyword.trim(),
      } satisfies RiskBindResult);
      confirmLoading.value = false;
    };

    watch(
      () => props.open,
      (open) => {
        if (open) {
          selectedRowKeys.value = [];
          checkAll.value = false;
          search.typeCode = [];
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
        title="风险源关联"
        width={1000}
        confirmLoading={confirmLoading.value}
        destroyOnClose
        onOk={handleOk}
        onCancel={() => emit("update:open", false)}
      >
        <Form layout="inline" class={styles.modalFilter}>
          <FormItem>
            <Cascader
              value={search.typeCode}
              options={props.riskTypes}
              changeOnSelect
              allowClear
              placeholder="请选择风险源分类"
              style={{ width: "200px" }}
              fieldNames={{ label: "name", value: "code", children: "nextList" }}
              onUpdate:value={(val: string[]) => {
                search.typeCode = val ?? [];
              }}
            />
          </FormItem>
          <FormItem label="风险源名称">
            <Input
              value={search.keyword}
              maxlength={20}
              allowClear
              placeholder="请输入风险源名称"
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

export default RiskBindModal;
