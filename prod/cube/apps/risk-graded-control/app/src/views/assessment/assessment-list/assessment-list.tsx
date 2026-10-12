import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { pageAreas, pageAssessmentTasks, pageUnitTypes } from "@ghcloud/cube-services-client/risk-graded-control.client";
import { Button, Form, FormItem, Input, Select, SelectOption, Space, Table, Tag } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { GPagination } from "@/components/common/pagination";
import { PageShell } from "@/components/page-shell/page-shell";
import { RiskLevelTag } from "@/components/risk-level-tag/risk-level-tag";
import {
  LIST_ACTION_LINK_PROPS,
  LIST_FILTER_SELECT_CLASS,
  LIST_FILTER_SELECT_WIDTH,
  LIST_SEARCH_INPUT_PROPS,
  TABLE_CODE_COLUMN_WIDTH,
} from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useListSearchClearReload } from "@/hooks/use-list-search-clear-reload";
import { useServerPagedList } from "@/hooks/use-server-paged-list";
import type { AssessmentUnitVO, UnitTypeVO, ZoneVO } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { mapAssessmentTaskFromApi, mapUnitTypeFromApi, mapZoneFromApi } from "@/utils/risk-control-mapper";

const TABLE_SCROLL_X = 1220;

const ASSESSMENT_STATUS = {
  PENDING: { label: "待评估", color: "gold" },
  ASSESSING: { label: "评估中", color: "blue" },
  COMPLETED: { label: "已完成", color: "green" },
} as const;

export const AssessmentListPage = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const router = useRouter();
    const records = ref<AssessmentUnitVO[]>([]);
    const zones = ref<ZoneVO[]>([]);
    const unitTypes = ref<UnitTypeVO[]>([]);
    const { pageNumber, pageSize, total, onPageChange: bindPageChange, runInitialLoadUnlessHandled, rewindIfEmpty } = useServerPagedList();
    const keyword = ref("");
    const loading = ref(false);
    const filters = reactive({
      zoneId: "",
      status: "" as AssessmentUnitVO["status"] | "",
    });

    const resolveStatus = (record: AssessmentUnitVO): keyof typeof ASSESSMENT_STATUS => {
      if (record.status) return record.status;
      if (record.objectCount > 0 && (record.completedCount ?? 0) >= record.objectCount) return "COMPLETED";
      if ((record.completedCount ?? 0) > 0) return "ASSESSING";
      return "PENDING";
    };

    const hydrateRecord = (record: AssessmentUnitVO): AssessmentUnitVO => ({
      ...record,
      zoneName: record.zoneName || zones.value.find((zone) => zone.id === record.zoneId)?.name || "--",
      unitType: record.unitType || unitTypes.value.find((type) => type.id === record.unitTypeId)?.name || "--",
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

    const loadList = async (): Promise<void> => {
      loading.value = true;
      try {
        const page = await useAuthRequest(() =>
          pageAssessmentTasks({
            pageNumber: pageNumber.value,
            pageSize: pageSize.value,
            keyword: keyword.value.trim() || undefined,
            areaId: filters.zoneId || undefined,
            status: filters.status || undefined,
          }),
        );
        records.value = page.records.map(mapAssessmentTaskFromApi).map(hydrateRecord);
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

    onMounted(async () => {
      await loadZones();
      await loadUnitTypes();
      runInitialLoadUnlessHandled(loadList);
    });

    const onSearch = (): void => {
      pageNumber.value = 1;
      void loadList();
    };

    useListSearchClearReload(keyword, onSearch);

    const onReset = (): void => {
      keyword.value = "";
      filters.zoneId = "";
      filters.status = "";
      pageNumber.value = 1;
      void loadList();
    };

    const onPageChange = bindPageChange(loadList);

    const riskCell = (level?: AssessmentUnitVO["riskLevel"]): JSX.Element =>
      level ? <RiskLevelTag level={level} /> : <span style={{ color: "#999" }}>待评估</span>;

    const columns = [
      {
        title: "编号",
        dataIndex: "code",
        width: TABLE_CODE_COLUMN_WIDTH,
        ellipsis: true,
        customRender: ({ text }: { text?: string }) => text || "--",
      },
      { title: "单元名称", dataIndex: "unitName", width: 180, ellipsis: true },
      { title: "单元类型", dataIndex: "unitType", width: 120, customRender: ({ text }: { text?: string }) => text || "--" },
      { title: "所属区域", dataIndex: "zoneName", width: 150, ellipsis: true },
      {
        title: "固有评估",
        dataIndex: "inherentRiskLevel",
        width: 120,
        customRender: ({ text }: { text: AssessmentUnitVO["inherentRiskLevel"] }) => riskCell(text),
      },
      {
        title: "控制评估",
        dataIndex: "controlRiskLevel",
        width: 120,
        customRender: ({ text }: { text: AssessmentUnitVO["controlRiskLevel"] }) => riskCell(text),
      },
      {
        title: "评估状态",
        width: 100,
        customRender: ({ record }: { record: AssessmentUnitVO }): JSX.Element => {
          const status = ASSESSMENT_STATUS[resolveStatus(record)];
          return <Tag color={status.color}>{status.label}</Tag>;
        },
      },
      { title: "风险对象数", dataIndex: "objectCount", width: 100, align: "center" as const },
      {
        title: "操作",
        width: 110,
        customRender: ({ record }: { record: AssessmentUnitVO }): JSX.Element => (
          <Button
            {...LIST_ACTION_LINK_PROPS}
            onClick={() => router.push({ name: "assessmentDetail", query: { unitId: record.unitId ?? record.id } })}
          >
            进入评估
          </Button>
        ),
      },
    ];

    return (): JSX.Element => (
      <PageShell
        title={pageTitle}
        v-slots={{
          "layout-content": () => (
            <>
              <Form layout="inline" data-layout-toolbar>
                <FormItem label="关键词">
                  <Input
                    {...LIST_SEARCH_INPUT_PROPS}
                    v-model:value={keyword.value}
                    placeholder="搜索单元名称"
                    allowClear
                    style={{ width: 200 }}
                    onPressEnter={onSearch}
                  />
                </FormItem>
                <FormItem label="所属区域">
                  <div style={{ width: LIST_FILTER_SELECT_WIDTH }}>
                    <Select
                      class={LIST_FILTER_SELECT_CLASS}
                      v-model:value={filters.zoneId}
                      allowClear
                      placeholder="全部区域"
                      style={{ width: "100%" }}
                    >
                      <SelectOption value="">全部区域</SelectOption>
                      {zones.value.map((zone) => (
                        <SelectOption key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectOption>
                      ))}
                    </Select>
                  </div>
                </FormItem>
                <FormItem label="评估状态">
                  <div style={{ width: LIST_FILTER_SELECT_WIDTH }}>
                    <Select
                      class={LIST_FILTER_SELECT_CLASS}
                      v-model:value={filters.status}
                      allowClear
                      placeholder="全部状态"
                      style={{ width: "100%" }}
                    >
                      <SelectOption value="">全部状态</SelectOption>
                      {Object.entries(ASSESSMENT_STATUS).map(([value, option]) => (
                        <SelectOption key={value} value={value}>
                          {option.label}
                        </SelectOption>
                      ))}
                    </Select>
                  </div>
                </FormItem>
                <FormItem>
                  <Space>
                    <Button type="primary" onClick={onSearch}>
                      查询
                    </Button>
                    <Button onClick={onReset}>重置</Button>
                  </Space>
                </FormItem>
              </Form>
              <div class="tableWrap">
                <Table
                  columns={columns}
                  dataSource={records.value}
                  rowKey="id"
                  pagination={false}
                  loading={loading.value}
                  scroll={{ x: TABLE_SCROLL_X }}
                  tableLayout="fixed"
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
