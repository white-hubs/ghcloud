import { defineComponent, onMounted, reactive, ref, watch, type PropType } from "vue";

import type { StallCategory, StallRecord } from "@ghcloud/cube-service-interface/mdata";
import { listUnboundStalls } from "@ghcloud/cube-services-client/mdata.client";
import { Button, Checkbox, Form, FormItem, Input, Modal, Page, Select, Table, message } from "@ghcloud/cube-ui";

import { useAuthRequest } from "@/hooks/auth-request";

import styles from "./device-association.module.less";

export type StallBindResult = {
  checkAll: boolean;
  businessIds: string[];
  categoryId?: string;
  keyword: string;
};

/**
 * 档位关联弹窗：查询未绑定档位并支持勾选全部。
 */
export const StallBindModal = defineComponent({
  name: "StallBindModal",
  props: {
    open: { type: Boolean, default: false },
    sceneType: { type: String, default: "" },
    stallTypes: { type: Array as PropType<StallCategory[]>, default: () => [] },
  },
  emits: ["update:open", "ok"],
  setup(props, { emit }) {
    const loading = ref(false);
    const confirmLoading = ref(false);
    const checkAll = ref(false);
    const selectedRowKeys = ref<string[]>([]);
    const tableData = ref<StallRecord[]>([]);
    const search = reactive({
      categoryId: undefined as string | undefined,
      keyword: "",
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const columns = [
      { title: "档位编号", dataIndex: "code", key: "code", ellipsis: true },
      { title: "档位名称", dataIndex: "name", key: "name", ellipsis: true },
      { title: "档位类型", dataIndex: "typeName", key: "typeName", width: 140, ellipsis: true },
      { title: "所在区域", dataIndex: "areaNames", key: "areaNames", ellipsis: true },
      { title: "模型编码", dataIndex: "visualizationCode", key: "visualizationCode", width: 140, ellipsis: true },
    ];

    const loadPage = async (): Promise<void> => {
      if (!props.sceneType) {
        return;
      }
      loading.value = true;
      try {
        const res = await useAuthRequest(() =>
          listUnboundStalls({
            sceneType: props.sceneType,
            pageNumber: search.pageNumber,
            pageSize: search.pageSize,
            keyword: search.keyword.trim() || undefined,
            categoryId: search.categoryId || undefined,
          }),
        );
        tableData.value = res.records ?? [];
        search.total = res.total ?? 0;
      } catch {
        message.error("加载档位列表失败");
        tableData.value = [];
        search.total = 0;
      } finally {
        loading.value = false;
      }
    };

    const resetAndLoad = (): void => {
      search.categoryId = undefined;
      search.keyword = "";
      search.pageNumber = 1;
      void loadPage();
    };

    const handleOk = (): void => {
      if (!checkAll.value && !selectedRowKeys.value.length) {
        message.warning("请选择关联档位");
        return;
      }
      confirmLoading.value = true;
      const payload: StallBindResult = {
        checkAll: checkAll.value,
        businessIds: [...selectedRowKeys.value],
        categoryId: search.categoryId || undefined,
        keyword: search.keyword.trim(),
      };
      emit("ok", payload);
      confirmLoading.value = false;
    };

    const handleCancel = (): void => {
      emit("update:open", false);
    };

    watch(
      () => props.open,
      (open) => {
        if (open) {
          selectedRowKeys.value = [];
          checkAll.value = false;
          search.categoryId = undefined;
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
        title="档位关联"
        width={1000}
        confirmLoading={confirmLoading.value}
        destroyOnClose
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form layout="inline" class={styles.modalFilter}>
          <FormItem label="档位类型">
            <Select
              value={search.categoryId}
              options={props.stallTypes}
              fieldNames={{ label: "name", value: "id" }}
              allowClear
              placeholder="请选择档位类型"
              style={{ width: "160px" }}
              onUpdate:value={(val: string) => {
                search.categoryId = val || undefined;
              }}
            />
          </FormItem>
          <FormItem label="档位名称">
            <Input
              value={search.keyword}
              maxlength={20}
              allowClear
              placeholder="请输入档位名称"
              style={{ width: "180px" }}
              onUpdate:value={(val: string) => {
                search.keyword = val ?? "";
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

export default StallBindModal;
