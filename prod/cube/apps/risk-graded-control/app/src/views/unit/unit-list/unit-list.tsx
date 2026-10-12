import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { deleteUnit, pageAreas, pageUnitTypes, pageUnits } from "@ghcloud/cube-services-client/risk-graded-control.client";
import { AntModal, Button, Empty, Form, FormItem, Input, Select, SelectOption, Space, Table, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { GPagination } from "@/components/common/pagination";
import { PageShell } from "@/components/page-shell/page-shell";
import { RiskLevelTag } from "@/components/risk-level-tag/risk-level-tag";
import {
  LIST_ACTION_DELETE_PROPS,
  LIST_ACTION_LINK_PROPS,
  LIST_SEARCH_INPUT_PROPS,
  TABLE_CODE_COLUMN_WIDTH,
  TABLE_PAGE_SIZE,
} from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useListSearchClearReload } from "@/hooks/use-list-search-clear-reload";
import { useServerPagedList } from "@/hooks/use-server-paged-list";
import type { UnitTypeVO, UnitVO, ZoneVO } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { downloadBlob } from "@/utils/download-blob";
import { unwrapPageRecords } from "@/utils/page-records";
import { mapUnitFromApi, mapUnitTypeFromApi, mapZoneFromApi } from "@/utils/risk-control-mapper";
import { exportRiskXlsx } from "@/utils/risk-export";

export const UnitListPage = defineComponent({
  setup() {
    const router = useRouter();
    const { pageTitle } = usePageName();
    const records = ref<UnitVO[]>([]);
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

    const filters = reactive({
      zoneId: "",
      unitTypeId: "",
    });

    const loadZones = async (): Promise<void> => {
      try {
        const page = await useAuthRequest(() => pageAreas({ pageNumber: 1, pageSize: 500, view: "option" }));
        zones.value = unwrapPageRecords(page).map(mapZoneFromApi);
      } catch {
        zones.value = [];
      }
    };

    const loadUnitTypes = async (): Promise<void> => {
      try {
        const page = await useAuthRequest(() => pageUnitTypes({ pageNumber: 1, pageSize: 500, view: "option" }));
        unitTypes.value = unwrapPageRecords(page).map(mapUnitTypeFromApi);
      } catch {
        unitTypes.value = [];
      }
    };

    const loadList = async (): Promise<void> => {
      loading.value = true;
      try {
        const page = await useAuthRequest(() =>
          pageUnits({
            pageNumber: pageNumber.value,
            pageSize: pageSize.value,
            keyword: keyword.value.trim() || undefined,
            areaId: filters.zoneId || undefined,
            unitTypeId: filters.unitTypeId || undefined,
          }),
        );
        records.value = page.records.map(mapUnitFromApi);
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

    onMounted(() => {
      void loadZones();
      void loadUnitTypes();
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

    const goCreate = (): void => {
      void router.push({ name: "unitForm" });
    };

    const goEdit = (record: UnitVO): void => {
      void router.push({ name: "unitForm", query: { id: record.id } });
    };

    const goView = (record: UnitVO): void => {
      void router.push({ name: "unitForm", query: { id: record.id, mode: "view" } });
    };

    const handleDelete = (record: UnitVO): void => {
      AntModal.confirm({
        centered: true,
        title: "删除确认",
        content: `确定删除单元「${record.name}」吗？`,
        onOk: async () => {
          try {
            await useAuthRequest(() => deleteUnit(record.id));
            message.success("删除成功");
            await loadList();
          } catch (e) {
            showApiError(e);
          }
        },
      });
    };

    const handleExport = async (): Promise<void> => {
      if (total.value === 0) {
        message.warning("当前没有可导出的数据");
        return;
      }
      try {
        const blob = await useAuthRequest(() =>
          exportRiskXlsx("units", {
            keyword: keyword.value.trim() || undefined,
            areaId: filters.zoneId || undefined,
            unitTypeId: filters.unitTypeId || undefined,
          }),
        );
        downloadBlob(blob, "风险单元列表.xlsx");
        message.success("导出成功");
      } catch (e) {
        showApiError(e);
      }
    };

    const columns = [
      { title: "编号", dataIndex: "code", width: TABLE_CODE_COLUMN_WIDTH, ellipsis: true },
      { title: "单元名称", dataIndex: "name", width: 180, ellipsis: true },
      { title: "单元类型", dataIndex: "unitType", width: 90 },
      { title: "所属区域", dataIndex: "zoneName", width: 150, ellipsis: true },
      {
        title: "辨识周期",
        dataIndex: "identifyCycleDays",
        width: 90,
        customRender: ({ text }: { text: number }) => `${text}天`,
      },
      {
        title: "安全警示标志",
        dataIndex: "warningSignName",
        width: 140,
        ellipsis: true,
        customRender: ({ record }: { record: UnitVO }) => record.warningSignName || "—",
      },
      {
        title: "辨识人员",
        dataIndex: "identifyUsers",
        width: 130,
        customRender: ({ record }: { record: UnitVO }) => record.identifyUsers.join("、"),
      },
      { title: "责任人员", dataIndex: "responsibleUser", width: 90 },
      {
        title: "固有风险评估",
        dataIndex: "inherentRiskLevel",
        width: 120,
        customRender: ({ text }: { text: UnitVO["inherentRiskLevel"] }) => <RiskLevelTag level={text} />,
      },
      {
        title: "现状风险评估",
        dataIndex: "controlRiskLevel",
        width: 120,
        customRender: ({ text }: { text: UnitVO["controlRiskLevel"] }) => <RiskLevelTag level={text} />,
      },
      {
        title: "操作",
        width: 180,
        customRender: ({ record }: { record: UnitVO }) => (
          <Space>
            <Button {...LIST_ACTION_LINK_PROPS} onClick={() => goView(record)}>
              查看
            </Button>
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
            <Space>
              <Button onClick={handleExport}>导出</Button>
              <Button type="primary" onClick={goCreate}>
                新增
              </Button>
            </Space>
          ),
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
                  rowKey="id"
                  pagination={false}
                  loading={loading.value}
                  scroll={{ x: 1550 }}
                  locale={{ emptyText: <Empty description="暂无风险单元数据" /> }}
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
