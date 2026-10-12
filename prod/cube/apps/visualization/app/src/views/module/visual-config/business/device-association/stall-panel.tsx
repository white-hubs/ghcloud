import { computed, defineComponent, onMounted, reactive, ref, Teleport, watch, type PropType } from "vue";

import type { BusinessAreaNode, StallCategory, StallRecord } from "@ghcloud/cube-service-interface/mdata";
import { bindVisualStalls, listBoundStalls, listStallCategories, unbindVisualStalls } from "@ghcloud/cube-services-client/mdata.client";
import { Button, Cascader, Form, FormItem, Input, Page, PopConfirm, Select, Table, message } from "@ghcloud/cube-ui";

import { CONFIG_SHELL_TITLE_EXTRA_ID } from "../../config-shell";
import { ASSOCIATION_DATA_TYPE_OPTIONS, type AssociationDataType } from "./association.types";
import { StallBindModal, type StallBindResult } from "./stall-bind-modal";
import { useAssociationTableScroll } from "./use-association-table-scroll";
import { useAuthRequest } from "@/hooks/auth-request";
import { useProjectId } from "@/hooks/use-project-id";

import styles from "./device-association.module.less";

/**
 * 档位关联面板：列表查询 / 添加 / 删除。
 */
export const StallPanel = defineComponent({
  name: "StallPanel",
  props: {
    sceneType: { type: String, required: true },
    areaOptions: { type: Array as PropType<BusinessAreaNode[]>, default: () => [] },
    dataType: { type: String as PropType<AssociationDataType>, required: true },
    onDataTypeChange: { type: Function as PropType<(value: AssociationDataType) => void>, required: true },
  },
  setup(props) {
    const { tableWrapRef, tableScrollY } = useAssociationTableScroll();
    const { projectId } = useProjectId();
    const titleExtraReady = ref(false);
    const loading = ref(false);
    const batchRemoving = ref(false);
    const modalOpen = ref(false);
    const stallTypes = ref<StallCategory[]>([]);
    const tableData = ref<StallRecord[]>([]);
    const selectedRowKeys = ref<string[]>([]);
    const search = reactive({
      categoryId: undefined as string | undefined,
      keyword: "",
      areaId: [] as string[],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const loadTypes = async (): Promise<void> => {
      try {
        stallTypes.value = await useAuthRequest(() => listStallCategories());
      } catch {
        stallTypes.value = [];
      }
    };

    const loadPage = async (): Promise<void> => {
      if (!props.sceneType) {
        tableData.value = [];
        search.total = 0;
        return;
      }
      loading.value = true;
      try {
        const res = await useAuthRequest(() =>
          listBoundStalls({
            sceneType: props.sceneType,
            pageNumber: search.pageNumber,
            pageSize: search.pageSize,
            keyword: search.keyword.trim() || undefined,
            categoryId: search.categoryId || undefined,
            areaId: search.areaId.length ? search.areaId[search.areaId.length - 1] : undefined,
          }),
        );
        tableData.value = res.records ?? [];
        search.total = res.total ?? 0;
      } catch {
        message.error("加载关联档位失败");
        tableData.value = [];
        search.total = 0;
      } finally {
        loading.value = false;
      }
    };

    const handleQuery = (): void => {
      search.pageNumber = 1;
      void loadPage();
    };

    const handleReset = (): void => {
      search.categoryId = undefined;
      search.keyword = "";
      search.areaId = [];
      search.pageNumber = 1;
      void loadPage();
    };

    const handleUnbind = async (ids: string[]): Promise<void> => {
      if (!props.sceneType || !ids.length) {
        return;
      }
      try {
        await useAuthRequest(() =>
          unbindVisualStalls({
            sceneType: props.sceneType,
            businessIds: ids,
            projectId: projectId.value || undefined,
          }),
        );
        message.success("删除成功");
        selectedRowKeys.value = selectedRowKeys.value.filter((id) => !ids.includes(id));
        if (tableData.value.length === ids.length && search.pageNumber > 1) {
          search.pageNumber -= 1;
        }
        await loadPage();
      } catch {
        message.error("删除失败");
      }
    };

    const handleBind = async (result: StallBindResult): Promise<void> => {
      try {
        await useAuthRequest(() =>
          bindVisualStalls({
            sceneType: props.sceneType,
            businessIds: result.businessIds,
            stallBindWay: result.checkAll ? "ALL_STALL" : "APPOINT_STALL",
            categoryId: result.categoryId,
            keyword: result.keyword || undefined,
          }),
        );
        message.success("关联成功");
        modalOpen.value = false;
        search.pageNumber = 1;
        selectedRowKeys.value = [];
        await loadPage();
      } catch {
        message.error("关联失败");
      }
    };

    const columns = [
      { title: "档位编号", dataIndex: "code", key: "code", width: 180, ellipsis: true },
      { title: "档位名称", dataIndex: "name", key: "name", width: 220, ellipsis: true },
      { title: "档位类型", dataIndex: "typeName", key: "typeName", width: 160, ellipsis: true },
      { title: "所在区域", dataIndex: "areaNames", key: "areaNames", width: 220, ellipsis: true },
      { title: "模型编码", dataIndex: "visualizationCode", key: "visualizationCode", width: 180, ellipsis: true },
      {
        title: "操作",
        key: "action",
        width: 100,
        fixed: "right" as const,
        customRender: ({ record }: { record: StallRecord }) => (
          <PopConfirm title="确定要删除该数据吗?" onConfirm={() => void handleUnbind([record.id])}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </PopConfirm>
        ),
      },
    ];

    const rowSelection = computed(() => ({
      selectedRowKeys: selectedRowKeys.value,
      preserveSelectedRowKeys: true,
      onChange: (keys: Array<string | number>) => {
        selectedRowKeys.value = keys.map(String);
      },
    }));

    onMounted(() => {
      titleExtraReady.value = Boolean(document.getElementById(CONFIG_SHELL_TITLE_EXTRA_ID));
      void loadTypes();
      void loadPage();
    });

    watch(
      () => props.sceneType,
      () => {
        search.pageNumber = 1;
        search.keyword = "";
        search.categoryId = undefined;
        search.areaId = [];
        selectedRowKeys.value = [];
        void loadPage();
      },
    );

    return () => (
      <>
        {titleExtraReady.value ? (
          <Teleport to={`#${CONFIG_SHELL_TITLE_EXTRA_ID}`}>
            <Button
              type="primary"
              onClick={() => {
                modalOpen.value = true;
              }}
            >
              添加档位
            </Button>
          </Teleport>
        ) : null}

        <Form layout="inline" class={styles.filterBar}>
          <FormItem label="数据类型">
            <Select
              value={props.dataType}
              options={[...ASSOCIATION_DATA_TYPE_OPTIONS]}
              style={{ width: "180px" }}
              onUpdate:value={(val: string) => {
                props.onDataTypeChange((val || "DEVICE") as AssociationDataType);
              }}
            />
          </FormItem>
          <FormItem label="档位类型">
            <Select
              value={search.categoryId}
              options={stallTypes.value}
              fieldNames={{ label: "name", value: "id" }}
              allowClear
              placeholder="请选择档位类型"
              style={{ width: "160px" }}
              onUpdate:value={(val: string) => {
                search.categoryId = val || undefined;
              }}
            />
          </FormItem>
          <FormItem label="所在区域">
            <Cascader
              value={search.areaId}
              options={props.areaOptions}
              changeOnSelect
              allowClear
              showSearch
              placeholder="请选择区域"
              style={{ width: "200px" }}
              fieldNames={{ label: "name", value: "id", children: "children" }}
              onUpdate:value={(val: string[]) => {
                search.areaId = val ?? [];
              }}
            />
          </FormItem>
          <FormItem>
            <Input
              value={search.keyword}
              maxlength={20}
              allowClear
              placeholder="请输入档位名称搜索"
              style={{ width: "220px" }}
              onUpdate:value={(val: string) => {
                search.keyword = val ?? "";
              }}
              onPressEnter={handleQuery}
            />
          </FormItem>
          <FormItem>
            <div class={styles.filterActions}>
              <Button type="primary" onClick={handleQuery}>
                查询
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </div>
          </FormItem>
        </Form>

        <div ref={tableWrapRef} class={styles.tableWrap}>
          <Table
            columns={columns}
            dataSource={tableData.value}
            loading={loading.value}
            pagination={false}
            rowKey="id"
            rowSelection={rowSelection.value}
            scrollX={1120}
            scrollY={tableScrollY.value}
            size="middle"
          />
        </div>

        <div class={styles.footer}>
          <div class={styles.footerLeft}>
            <Button
              type="primary"
              danger
              disabled={!selectedRowKeys.value.length}
              loading={batchRemoving.value}
              onClick={() => {
                batchRemoving.value = true;
                void handleUnbind([...selectedRowKeys.value]).finally(() => {
                  batchRemoving.value = false;
                });
              }}
            >
              批量删除
            </Button>
            <span class={styles.selectedCount}>已选 {selectedRowKeys.value.length} 条数据</span>
          </div>
          <div class={styles.footerPage}>
            <Page
              current={search.pageNumber}
              pageSize={search.pageSize}
              total={search.total}
              onPageChange={(pageNumber: number, pageSize: number) => {
                search.pageNumber = pageNumber;
                search.pageSize = pageSize;
                void loadPage();
              }}
            />
          </div>
        </div>

        <StallBindModal
          open={modalOpen.value}
          sceneType={props.sceneType}
          stallTypes={stallTypes.value}
          onUpdate:open={(val: boolean) => {
            modalOpen.value = val;
          }}
          onOk={(result: StallBindResult) => {
            void handleBind(result);
          }}
        />
      </>
    );
  },
});

export default StallPanel;
