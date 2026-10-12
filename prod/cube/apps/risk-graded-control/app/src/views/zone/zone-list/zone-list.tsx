import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { getOrganizationTree } from "@ghcloud/cube-services-client/ouaa.client";
import { deleteArea, getArea, pageAreas } from "@ghcloud/cube-services-client/risk-graded-control.client";
import {
  AntModal,
  Button,
  Empty,
  Form,
  FormItem,
  Input,
  Modal,
  Select,
  SelectOption,
  Space,
  Table,
  Tooltip,
  TreeSelect,
  message,
} from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { GPagination } from "@/components/common/pagination";
import { PageShell } from "@/components/page-shell/page-shell";
import { RiskGisMapEditor } from "@/components/risk-gis-map-editor/risk-gis-map-editor";
import { RiskLevelTag } from "@/components/risk-level-tag/risk-level-tag";
import {
  LIST_ACTION_DELETE_PROPS,
  LIST_ACTION_LINK_PROPS,
  LIST_SEARCH_INPUT_PROPS,
  RISK_LEVEL_LABEL,
  TABLE_CODE_COLUMN_WIDTH,
  TABLE_PAGE_SIZE,
} from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useListSearchClearReload } from "@/hooks/use-list-search-clear-reload";
import { useServerPagedList } from "@/hooks/use-server-paged-list";
import type { RiskLevel, ZoneVO } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { mapOrganizationsToTreeData, type OrganizationTreeNode } from "@/utils/organization-tree";
import { mapRiskLevelToApi, mapZoneFromApi } from "@/utils/risk-control-mapper";

export const ZoneListPage = defineComponent({
  setup() {
    const router = useRouter();
    const { pageTitle } = usePageName();
    const records = ref<ZoneVO[]>([]);
    const {
      pageNumber,
      pageSize,
      total,
      resetPage,
      onPageChange: bindPageChange,
      scheduleInitialLoad,
      rewindIfEmpty,
    } = useServerPagedList();
    const keyword = ref("");
    const loading = ref(false);
    const mapVisible = ref(false);
    const mapZone = ref<ZoneVO | null>(null);
    const deptTree = ref<OrganizationTreeNode[]>([]);

    const filters = reactive({
      riskLevel: "" as RiskLevel | "",
      departmentId: undefined as string | undefined,
    });

    const loadDeptTree = async (): Promise<void> => {
      try {
        const orgs = await useAuthRequest(() => getOrganizationTree({ enabled: true }));
        deptTree.value = mapOrganizationsToTreeData(orgs);
      } catch (e) {
        showApiError(e);
        deptTree.value = [];
      }
    };

    onMounted(() => {
      void loadDeptTree();
    });

    const loadList = async (): Promise<void> => {
      loading.value = true;
      try {
        const page = await useAuthRequest(() =>
          pageAreas({
            pageNumber: pageNumber.value,
            pageSize: pageSize.value,
            keyword: keyword.value.trim() || undefined,
            riskLevel: filters.riskLevel ? mapRiskLevelToApi(filters.riskLevel) : undefined,
            departmentId: filters.departmentId || undefined,
          }),
        );
        records.value = page.records.map(mapZoneFromApi);
        total.value = page.total ?? 0;
        await rewindIfEmpty(records.value.length, loadList);
      } catch (e) {
        showApiError(e);
        records.value = [];
        total.value = 0;
      } finally {
        loading.value = false;
      }
    };

    scheduleInitialLoad(loadList);

    const onSearch = (): void => {
      pageNumber.value = 1;
      void loadList();
    };

    useListSearchClearReload(keyword, onSearch);

    const onReset = (): void => {
      filters.riskLevel = "";
      filters.departmentId = undefined;
      keyword.value = "";
      pageNumber.value = 1;
      void loadList();
    };

    const onPageChange = bindPageChange(loadList);

    const goCreate = (): void => {
      void router.push({ name: "zoneForm" });
    };

    const goEdit = (record: ZoneVO): void => {
      void router.push({ name: "zoneForm", query: { id: record.id } });
    };

    const openMap = async (record: ZoneVO): Promise<void> => {
      try {
        const vo = await useAuthRequest(() => getArea(record.id));
        mapZone.value = mapZoneFromApi(vo);
        mapVisible.value = true;
      } catch (e) {
        showApiError(e);
      }
    };

    const handleDelete = (record: ZoneVO): void => {
      AntModal.confirm({
        centered: true,
        title: "删除确认",
        content: `确定删除区域「${record.name}」吗？删除后不可恢复。`,
        onOk: async () => {
          try {
            await useAuthRequest(() => deleteArea(record.id));
            message.success("删除成功");
            await loadList();
          } catch (e) {
            showApiError(e);
          }
        },
      });
    };

    const columns = [
      { title: "区域编号", dataIndex: "code", width: TABLE_CODE_COLUMN_WIDTH, ellipsis: true },
      {
        title: "区域名称",
        dataIndex: "name",
        width: 150,
        customRender: ({ record }: { record: ZoneVO }) => (
          <Button
            {...LIST_ACTION_LINK_PROPS}
            style={{ padding: 0 }}
            onClick={() => {
              void openMap(record);
            }}
          >
            {record.name}
          </Button>
        ),
      },
      { title: "所属部门", dataIndex: "department", width: 110 },
      {
        title: "区域范围",
        dataIndex: "scopeText",
        width: 200,
        ellipsis: true,
        customRender: ({ text }: { text: string }) => (
          <Tooltip title={text}>
            <span>{text}</span>
          </Tooltip>
        ),
      },
      { title: "负责人", dataIndex: "manager", width: 90 },
      {
        title: "固有风险评估",
        dataIndex: "inherentRiskLevel",
        width: 120,
        customRender: ({ text }: { text: ZoneVO["inherentRiskLevel"] }) => <RiskLevelTag level={text} />,
      },
      {
        title: "现状风险评估",
        dataIndex: "controlRiskLevel",
        width: 120,
        customRender: ({ text }: { text: ZoneVO["controlRiskLevel"] }) => <RiskLevelTag level={text} />,
      },
      { title: "风险单元数", dataIndex: "unitCount", width: 100, align: "center" as const },
      {
        title: "备注",
        dataIndex: "remark",
        width: 140,
        ellipsis: true,
        customRender: ({ record }: { record: ZoneVO }) => {
          const remark = record.remark?.trim();
          if (!remark) return "—";
          return (
            <Tooltip title={remark}>
              <span>{remark}</span>
            </Tooltip>
          );
        },
      },
      {
        title: "操作",
        width: 140,
        customRender: ({ record }: { record: ZoneVO }) => (
          <Space>
            <Button {...LIST_ACTION_LINK_PROPS} onClick={() => goEdit(record)}>
              编辑
            </Button>
            <Button {...LIST_ACTION_DELETE_PROPS} onClick={() => handleDelete(record)}>
              删除
            </Button>
          </Space>
        ),
      },
    ];

    return (): JSX.Element => (
      <PageShell
        title={pageTitle}
        v-slots={{
          "layout-header": () => (
            <Button type="primary" onClick={goCreate}>
              新增
            </Button>
          ),
          "layout-content": () => (
            <>
              <Form layout="inline" data-layout-toolbar>
                <FormItem>
                  <Input
                    {...LIST_SEARCH_INPUT_PROPS}
                    v-model:value={keyword.value}
                    placeholder="搜索区域名称"
                    allowClear
                    style={{ width: "200px" }}
                    onPressEnter={onSearch}
                  />
                </FormItem>
                <FormItem label="现状风险">
                  <Select
                    v-model:value={filters.riskLevel}
                    allowClear
                    placeholder="全部风险"
                    style={{ width: "130px" }}
                    onChange={onSearch}
                  >
                    <SelectOption value="">全部风险</SelectOption>
                    {(Object.keys(RISK_LEVEL_LABEL) as RiskLevel[]).map((lv) => (
                      <SelectOption key={lv} value={lv}>
                        {RISK_LEVEL_LABEL[lv]}
                      </SelectOption>
                    ))}
                  </Select>
                </FormItem>
                <FormItem label="部门">
                  <TreeSelect
                    v-model:value={filters.departmentId}
                    placeholder="全部"
                    allowClear
                    showSearch
                    treeDefaultExpandAll
                    treeData={deptTree.value}
                    treeNodeFilterProp="title"
                    style={{ width: "160px" }}
                    onChange={onSearch}
                  />
                </FormItem>
                <FormItem>
                  <Button type="primary" onClick={onSearch}>
                    查询
                  </Button>
                  <Button style={{ marginLeft: "8px" }} onClick={onReset}>
                    重置
                  </Button>
                </FormItem>
              </Form>
              <div class="tableWrap">
                <Table
                  columns={columns}
                  dataSource={records.value}
                  rowKey="id"
                  pagination={false}
                  loading={loading.value}
                  scroll={{ x: 1440 }}
                  locale={{ emptyText: <Empty description="暂无风险区域数据" /> }}
                />
              </div>
              <Modal
                open={mapVisible.value}
                title={`区域地图：${mapZone.value?.name ?? ""}`}
                width={800}
                destroyOnClose
                afterOpenChange={(open: boolean) => {
                  if (open) {
                  }
                }}
                footer={
                  <Button
                    onClick={() => {
                      mapVisible.value = false;
                    }}
                  >
                    关闭
                  </Button>
                }
                onCancel={() => {
                  mapVisible.value = false;
                }}
              >
                {mapZone.value && (
                  <>
                    <p style={{ marginBottom: "8px", color: "#666" }}>{mapZone.value.scopeText}</p>
                    {mapZone.value.remark?.trim() && <p style={{ marginBottom: "8px", color: "#666" }}>备注：{mapZone.value.remark}</p>}
                    <RiskGisMapEditor key={mapZone.value.id} mode="readonly" height={360} value={{ polygon: mapZone.value.polygon }} />
                  </>
                )}
              </Modal>
            </>
          ),
          "footer-page": () => (
            <GPagination total={total.value} current={pageNumber.value} pageSize={pageSize.value} onChange={onPageChange} />
          ),
        }}
      />
    );
  },
});
