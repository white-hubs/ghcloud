import { defineComponent, nextTick, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { pageAreas, pageUnitInventory, pageUnitTypes } from "@ghcloud/cube-services-client/risk-graded-control.client";
import { Button, Empty, Form, FormItem, Input, Select, SelectOption, Space, Spin, Table, Tag, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { GPagination } from "@/components/common/pagination";
import { ExpandableUnitPanel } from "@/components/expandable-unit-panel/expandable-unit-panel";
import { PageShell } from "@/components/page-shell/page-shell";
import { RiskLevelTag } from "@/components/risk-level-tag/risk-level-tag";
import { LIST_SEARCH_INPUT_PROPS, OBJECT_STATUS_LABEL, TABLE_CODE_COLUMN_WIDTH, TABLE_PAGE_SIZE } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useListSearchClearReload } from "@/hooks/use-list-search-clear-reload";
import { useServerPagedList } from "@/hooks/use-server-paged-list";
import type { RiskLevel, UnitInventoryRowVO, UnitTypeVO, ZoneVO } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { downloadBlob } from "@/utils/download-blob";
import { loadUnitInventoryDetail } from "@/utils/load-unit-inventory-detail";
import { mapUnitTypeFromApi, mapUnitInventoryRowFromApi, mapZoneFromApi } from "@/utils/risk-control-mapper";
import { exportRiskXlsx } from "@/utils/risk-export";

const resolveObjectCount = (row: UnitInventoryRowVO): number => row.objectCount ?? row.objects.length;

const maxRiskLevel = (levels: (RiskLevel | undefined)[]): RiskLevel | undefined => {
  const order: RiskLevel[] = ["MAJOR", "SIGNIFICANT", "GENERAL", "LOW"];
  for (const lv of order) {
    if (levels.includes(lv)) return lv;
  }
  return undefined;
};

const riskLevelValue = (level?: RiskLevel): JSX.Element =>
  level ? <RiskLevelTag level={level} /> : <span style={{ color: "#999" }}>未评估</span>;

const deriveControlStatus = (row: UnitInventoryRowVO): { label: string; color: string } => {
  const statuses = row.objects.map((o) => o.status);
  if (statuses.length === 0) {
    const status = row.unit.controlStatus;
    if (!status) return { label: "--", color: "default" };
    if (status === "ACTIVE") return { label: "管控中", color: "green" };
    if (status === "EXECUTING") return { label: "执行中", color: "blue" };
    if (status === "CONTROL_SET" || status === "CONTROL_EVAL") return { label: "待配置", color: "gold" };
    return { label: OBJECT_STATUS_LABEL[status] ?? status, color: "default" };
  }
  if (statuses.every((s) => s === "ACTIVE")) {
    return { label: "管控中", color: "green" };
  }
  if (statuses.some((s) => s === "EXECUTING")) {
    return { label: "执行中", color: "blue" };
  }
  if (statuses.some((s) => s === "CONTROL_SET" || s === "CONTROL_EVAL")) {
    return { label: "待配置", color: "gold" };
  }
  return { label: OBJECT_STATUS_LABEL[statuses[0] ?? "DRAFT"], color: "default" };
};

export const UnitInventoryPage = defineComponent({
  setup() {
    const route = useRoute();
    const { pageTitle } = usePageName();
    const records = ref<UnitInventoryRowVO[]>([]);
    const zones = ref<ZoneVO[]>([]);
    const unitTypes = ref<UnitTypeVO[]>([]);
    const {
      pageNumber,
      pageSize,
      total,
      resetPage,
      onPageChange: bindPageChange,
      scheduleInitialLoad,
      runInitialLoadUnlessHandled,
      rewindIfEmpty,
    } = useServerPagedList();
    const keyword = ref("");
    const loading = ref(false);
    const expandedRowKeys = ref<string[]>([]);
    const detailLoadingIds = ref<string[]>([]);

    const filters = reactive({
      zoneId: "",
      unitTypeId: "",
    });

    const loadZones = async (): Promise<void> => {
      try {
        const page = await useAuthRequest(() => pageAreas({ pageNumber: 1, pageSize: 500, view: "option" }));
        zones.value = page.records.map(mapZoneFromApi);
      } catch {
        zones.value = [];
      }
    };

    const loadUnitTypes = async (): Promise<void> => {
      try {
        const page = await useAuthRequest(() => pageUnitTypes({ pageNumber: 1, pageSize: 500, view: "option" }));
        unitTypes.value = page.records.map(mapUnitTypeFromApi);
      } catch {
        unitTypes.value = [];
      }
    };

    const loadList = async (options?: { unitId?: string }): Promise<void> => {
      loading.value = true;
      try {
        const page = await useAuthRequest(() =>
          pageUnitInventory({
            pageNumber: pageNumber.value,
            pageSize: pageSize.value,
            keyword: keyword.value.trim() || undefined,
            areaId: filters.zoneId || undefined,
            unitTypeId: filters.unitTypeId || undefined,
            unitId: options?.unitId || undefined,
          }),
        );
        records.value = page.records.map(mapUnitInventoryRowFromApi);
        total.value = page.total ?? 0;
        await rewindIfEmpty(records.value.length, () => loadList(options));
      } catch (e) {
        showApiError(e);
        records.value = [];
        total.value = 0;
      } finally {
        loading.value = false;
      }
    };

    const scrollToUnitRow = async (unitId: string): Promise<void> => {
      await nextTick();
      const row = document.querySelector(`[data-unit-id="${unitId}"]`);
      row?.scrollIntoView({ block: "center", behavior: "smooth" });
    };

    const openUnitDetail = async (unitId: string): Promise<void> => {
      expandedRowKeys.value = [unitId];
      await loadRowDetail(unitId);
      await scrollToUnitRow(unitId);
    };

    const loadDeepLinkUnit = async (unitId: string): Promise<void> => {
      pageNumber.value = 1;
      await loadList({ unitId });
      const matched = records.value.find((row) => row.unit.id === unitId);
      if (matched) {
        await openUnitDetail(unitId);
        return;
      }
      await loadList();
      if (records.value.some((row) => row.unit.id === unitId)) {
        await openUnitDetail(unitId);
      }
    };

    onMounted(async () => {
      await loadZones();
      await loadUnitTypes();
      const unitId = String(route.query.unitId ?? "").trim();
      if (unitId) {
        await loadDeepLinkUnit(unitId);
        return;
      }
      runInitialLoadUnlessHandled(loadList);
    });

    const onSearch = (): void => {
      pageNumber.value = 1;
      void loadList();
    };

    useListSearchClearReload(keyword, onSearch);

    const onReset = (): void => {
      filters.zoneId = "";
      filters.unitTypeId = "";
      keyword.value = "";
      pageNumber.value = 1;
      void loadList();
    };

    const onPageChange = bindPageChange(loadList);

    const loadRowDetail = async (unitId: string): Promise<void> => {
      const row = records.value.find((r) => r.unit.id === unitId);
      if (!row || row.detailLoaded || detailLoadingIds.value.includes(unitId)) return;
      detailLoadingIds.value = [...detailLoadingIds.value, unitId];
      try {
        const { objects, measures } = await loadUnitInventoryDetail(unitId, useAuthRequest);
        row.objects = objects;
        row.measures = measures;
        row.detailLoaded = true;
        if (objects.length > 0) {
          row.objectCount = objects.length;
        }
        if (measures.length > 0) {
          row.measureCount = measures.length;
        }
      } catch (e) {
        showApiError(e);
      } finally {
        detailLoadingIds.value = detailLoadingIds.value.filter((id) => id !== unitId);
      }
    };

    const handleExport = async (): Promise<void> => {
      if (total.value === 0) {
        message.warning("当前没有可导出的数据");
        return;
      }
      try {
        const blob = await useAuthRequest(() =>
          exportRiskXlsx("unit-inventory", {
            keyword: keyword.value.trim() || undefined,
            areaId: filters.zoneId || undefined,
            unitTypeId: filters.unitTypeId || undefined,
          }),
        );
        downloadBlob(blob, "单元清单.xlsx");
        message.success("导出成功");
      } catch (e) {
        showApiError(e);
      }
    };

    const columns = [
      { title: "编号", dataIndex: ["unit", "code"], width: TABLE_CODE_COLUMN_WIDTH, ellipsis: true },
      { title: "单元名称", dataIndex: ["unit", "name"], width: 180, ellipsis: true },
      { title: "单元类型", dataIndex: ["unit", "unitType"], width: 90 },
      { title: "所属区域", dataIndex: ["unit", "zoneName"], width: 150, ellipsis: true },
      { title: "责任人", dataIndex: ["unit", "responsibleUser"], width: 90 },
      {
        title: "固有风险评估",
        width: 120,
        customRender: ({ record }: { record: UnitInventoryRowVO }) => {
          const level = maxRiskLevel(record.objects.map((o) => o.innateLevel)) ?? record.unit.inherentRiskLevel;
          return riskLevelValue(level);
        },
      },
      {
        title: "现状风险评估",
        width: 120,
        customRender: ({ record }: { record: UnitInventoryRowVO }) => {
          const level = maxRiskLevel(record.objects.map((o) => o.controlLevel)) ?? record.unit.controlRiskLevel;
          return riskLevelValue(level);
        },
      },
      {
        title: "管控状态",
        width: 100,
        customRender: ({ record }: { record: UnitInventoryRowVO }) => {
          const st = deriveControlStatus(record);
          return <Tag color={st.color}>{st.label}</Tag>;
        },
      },
      {
        title: "风险对象数",
        width: 100,
        align: "center" as const,
        customRender: ({ record }: { record: UnitInventoryRowVO }) => resolveObjectCount(record),
      },
    ];

    return (): JSX.Element => (
      <PageShell
        title={pageTitle}
        v-slots={{
          "layout-header": () => <Button onClick={handleExport}>导出</Button>,
          "layout-content": () => (
            <>
              <Form layout="inline" data-layout-toolbar>
                <FormItem>
                  <Input
                    {...LIST_SEARCH_INPUT_PROPS}
                    v-model:value={keyword.value}
                    placeholder="搜索单元名称"
                    allowClear
                    style={{ width: "200px" }}
                    onPressEnter={onSearch}
                  />
                </FormItem>
                <FormItem label="区域">
                  <Select v-model:value={filters.zoneId} allowClear placeholder="全部区域" style={{ width: "160px" }} onChange={onSearch}>
                    <SelectOption value="">全部区域</SelectOption>
                    {zones.value.map((z) => (
                      <SelectOption key={z.id} value={z.id}>
                        {z.name}
                      </SelectOption>
                    ))}
                  </Select>
                </FormItem>
                <FormItem label="类型">
                  <Select
                    v-model:value={filters.unitTypeId}
                    allowClear
                    placeholder="全部类型"
                    style={{ width: "120px" }}
                    onChange={onSearch}
                  >
                    <SelectOption value="">全部类型</SelectOption>
                    {unitTypes.value.map((t) => (
                      <SelectOption key={t.id} value={t.id}>
                        {t.name}
                      </SelectOption>
                    ))}
                  </Select>
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
                  rowKey={(r: UnitInventoryRowVO) => r.unit.id}
                  pagination={false}
                  loading={loading.value}
                  scroll={{ x: 1330 }}
                  expandedRowKeys={expandedRowKeys.value}
                  customRow={(record: UnitInventoryRowVO) => ({
                    "data-unit-id": record.unit.id,
                  })}
                  onExpand={(expanded: boolean, record: UnitInventoryRowVO) => {
                    const key = record.unit.id;
                    expandedRowKeys.value = expanded ? [...expandedRowKeys.value, key] : expandedRowKeys.value.filter((k) => k !== key);
                    if (expanded) void loadRowDetail(record.unit.id);
                  }}
                  expandedRowRender={({ record }: { record: UnitInventoryRowVO }) =>
                    detailLoadingIds.value.includes(record.unit.id) ? (
                      <Spin style={{ padding: "16px" }} />
                    ) : (
                      <ExpandableUnitPanel row={record} />
                    )
                  }
                  locale={{ emptyText: <Empty description="暂无单元清单数据" /> }}
                />
              </div>
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
