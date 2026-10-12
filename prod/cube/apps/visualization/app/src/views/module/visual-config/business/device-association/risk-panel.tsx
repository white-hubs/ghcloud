import { computed, defineComponent, onMounted, reactive, ref, Teleport, watch, type PropType } from "vue";

import type { CascadeDictionaryItem } from "@ghcloud/cube-service-interface/dictionary";
import type { BusinessAreaNode } from "@ghcloud/cube-service-interface/mdata";
import type { RiskSourceRecord } from "@ghcloud/cube-service-interface/property";
import { getCascadeDictionaryItem } from "@ghcloud/cube-services-client/dictionary.client";
import { bindVisualRiskSources, listBoundRiskSources, unbindVisualRiskSources } from "@ghcloud/cube-services-client/property.client";
import { Button, Cascader, Form, FormItem, Input, Page, PopConfirm, Select, Table, message } from "@ghcloud/cube-ui";

import { CONFIG_SHELL_TITLE_EXTRA_ID } from "../../config-shell";
import { ASSOCIATION_DATA_TYPE_OPTIONS, type AssociationDataType } from "./association.types";
import { RiskBindModal, type RiskBindResult } from "./risk-bind-modal";
import { useAssociationTableScroll } from "./use-association-table-scroll";
import { useAuthRequest } from "@/hooks/auth-request";

import styles from "./device-association.module.less";

const formatAreaName = (record: RiskSourceRecord): string => record.areaName || record.area?.map((item) => item.name).join("/") || "--";

const lastCascaderValue = (value: string[]): string | undefined => (value.length ? String(value[value.length - 1]) : undefined);

/**
 * 风险源关联面板。
 */
export const RiskPanel = defineComponent({
  name: "RiskPanel",
  props: {
    sceneType: { type: String, required: true },
    areaOptions: { type: Array as PropType<BusinessAreaNode[]>, default: () => [] },
    dataType: { type: String as PropType<AssociationDataType>, required: true },
    onDataTypeChange: { type: Function as PropType<(value: AssociationDataType) => void>, required: true },
  },
  setup(props) {
    const { tableWrapRef, tableScrollY } = useAssociationTableScroll();
    const titleExtraReady = ref(false);
    const loading = ref(false);
    const batchRemoving = ref(false);
    const modalOpen = ref(false);
    const riskTypes = ref<CascadeDictionaryItem[]>([]);
    const tableData = ref<RiskSourceRecord[]>([]);
    const selectedRowKeys = ref<string[]>([]);
    const search = reactive({
      typeCode: [] as string[],
      keyword: "",
      areaId: [] as string[],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const loadTypes = async (): Promise<void> => {
      try {
        riskTypes.value = await useAuthRequest(() => getCascadeDictionaryItem({ itemCode: "risk-source-type" }));
      } catch {
        riskTypes.value = [];
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
          listBoundRiskSources({
            sceneType: props.sceneType,
            pageNumber: search.pageNumber,
            pageSize: search.pageSize,
            keyword: search.keyword.trim() || undefined,
            typeCode: lastCascaderValue(search.typeCode),
            areaId: search.areaId.length ? search.areaId[search.areaId.length - 1] : undefined,
          }),
        );
        tableData.value = (res.records ?? []).map((item) => ({
          ...item,
          areaName: formatAreaName(item),
        }));
        search.total = res.total ?? 0;
      } catch {
        message.error("加载关联风险源失败");
        tableData.value = [];
        search.total = 0;
      } finally {
        loading.value = false;
      }
    };

    const handleUnbind = async (ids: string[]): Promise<void> => {
      if (!ids.length) {
        return;
      }
      try {
        await useAuthRequest(() => unbindVisualRiskSources({ ids }));
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

    const handleBind = async (result: RiskBindResult): Promise<void> => {
      try {
        await useAuthRequest(() =>
          bindVisualRiskSources({
            sceneType: props.sceneType,
            businessIds: result.businessIds,
            typeCode: result.typeCode,
            keyword: result.keyword || undefined,
            bindWay: result.checkAll ? "ALL" : undefined,
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
      { title: "风险源编码", dataIndex: "serialNumber", key: "serialNumber", width: 180, ellipsis: true },
      { title: "风险源名称", dataIndex: "name", key: "name", width: 220, ellipsis: true },
      { title: "分类", dataIndex: "typeName", key: "typeName", width: 160, ellipsis: true },
      {
        title: "所在区域",
        key: "areaName",
        width: 220,
        ellipsis: true,
        customRender: ({ record }: { record: RiskSourceRecord }) => formatAreaName(record),
      },
      { title: "模型编码", dataIndex: "bimCode", key: "bimCode", width: 180, ellipsis: true },
      {
        title: "操作",
        key: "action",
        width: 100,
        fixed: "right" as const,
        customRender: ({ record }: { record: RiskSourceRecord }) => (
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
        search.typeCode = [];
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
              添加风险源
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
          <FormItem label="风险源分类">
            <Cascader
              value={search.typeCode}
              options={riskTypes.value}
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
              placeholder="请输入风险源名称搜索"
              style={{ width: "220px" }}
              onUpdate:value={(val: string) => {
                search.keyword = (val ?? "").replace(/\s+/g, "");
              }}
              onPressEnter={() => {
                search.pageNumber = 1;
                void loadPage();
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
              <Button
                onClick={() => {
                  search.typeCode = [];
                  search.keyword = "";
                  search.areaId = [];
                  search.pageNumber = 1;
                  void loadPage();
                }}
              >
                重置
              </Button>
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

        <RiskBindModal
          open={modalOpen.value}
          sceneType={props.sceneType}
          riskTypes={riskTypes.value}
          onUpdate:open={(val: boolean) => {
            modalOpen.value = val;
          }}
          onOk={(result: RiskBindResult) => {
            void handleBind(result);
          }}
        />
      </>
    );
  },
});

export default RiskPanel;
