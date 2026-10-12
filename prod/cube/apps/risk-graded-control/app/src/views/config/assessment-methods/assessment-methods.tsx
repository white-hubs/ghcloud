import { computed, defineComponent, reactive, ref } from "vue";

import { getAssessmentMethod, pageAssessmentMethods } from "@ghcloud/cube-services-client/risk-graded-control.client";
import { Button, Drawer, Empty, Form, FormItem, Input, Select, SelectOption, Space, Table, Tag } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { GPagination } from "@/components/common/pagination";
import { PageShell } from "@/components/page-shell/page-shell";
import { RiskLevelTag } from "@/components/risk-level-tag/risk-level-tag";
import { LIST_ACTION_LINK_PROPS, LIST_SEARCH_INPUT_PROPS, RISK_LEVEL_LABEL } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useListSearchClearReload } from "@/hooks/use-list-search-clear-reload";
import { useServerPagedList } from "@/hooks/use-server-paged-list";
import type { AssessmentMethodVO, AssessmentDimension, AssessmentLevelRule } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { mapAssessmentMethodFromApi } from "@/utils/risk-control-mapper";

export const AssessmentMethodsPage = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const records = ref<AssessmentMethodVO[]>([]);
    const { pageNumber, pageSize, total, onPageChange: bindPageChange, scheduleInitialLoad, rewindIfEmpty } = useServerPagedList();
    const keyword = ref("");
    const loading = ref(false);
    const drawerVisible = ref(false);

    const form = reactive({
      code: "",
      name: "",
      formula: "",
      description: "",
      status: "ENABLED" as AssessmentMethodVO["status"],
      dimensions: [] as AssessmentDimension[],
      levelRules: [] as AssessmentLevelRule[],
    });

    const loadList = async (): Promise<void> => {
      loading.value = true;
      try {
        const page = await useAuthRequest(() =>
          pageAssessmentMethods({
            pageNumber: pageNumber.value,
            pageSize: pageSize.value,
            keyword: keyword.value.trim() || undefined,
          }),
        );
        records.value = page.records.map(mapAssessmentMethodFromApi);
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

    const fillForm = (record: AssessmentMethodVO): void => {
      form.code = record.code;
      form.name = record.name;
      form.formula = record.formula;
      form.description = record.description ?? "";
      form.status = record.status;
      form.dimensions = record.dimensions.map((d) => ({ ...d, options: [...d.options] }));
      form.levelRules = record.levelRules.map((r) => ({ ...r }));
    };

    const formatDimensions = (method: AssessmentMethodVO): string =>
      method.dimensions.map((d) => `${d.name}(${d.code})`).join(" / ") || "—";

    const formatLevelRules = (method: AssessmentMethodVO): string =>
      method.levelRules.map((r) => `${r.range} ${RISK_LEVEL_LABEL[r.level]}`).join(" · ") || "—";

    const openView = async (record: AssessmentMethodVO): Promise<void> => {
      try {
        const vo = await useAuthRequest(() => getAssessmentMethod(record.id));
        fillForm(mapAssessmentMethodFromApi(vo));
        drawerVisible.value = true;
      } catch (e) {
        showApiError(e);
      }
    };

    const onPageChange = bindPageChange(loadList);

    const dimensionColumns = [
      { title: "维度编码", dataIndex: "code", width: 90 },
      { title: "维度名称", dataIndex: "name", width: 120 },
      {
        title: "评分选项",
        dataIndex: "options",
        customRender: ({ record }: { record: AssessmentDimension }) => (
          <Space wrap size={4}>
            {record.options.map((o) => (
              <Tag key={o.value}>
                {o.label}={o.value}
              </Tag>
            ))}
          </Space>
        ),
      },
    ];

    const ruleColumns = [
      {
        title: "风险等级",
        dataIndex: "level",
        width: 110,
        customRender: ({ text }: { text: AssessmentLevelRule["level"] }) => <RiskLevelTag level={text} />,
      },
      { title: "颜色", dataIndex: "color", width: 70 },
      { title: "分值范围", dataIndex: "range", width: 120 },
      { title: "管控要求", dataIndex: "requirement", ellipsis: true },
    ];

    const columns = [
      { title: "方法编码", dataIndex: "code", width: 90 },
      { title: "方法名称", dataIndex: "name", width: 200, ellipsis: true },
      {
        title: "评价维度",
        dataIndex: "dimensions",
        width: 220,
        ellipsis: true,
        customRender: ({ record }: { record: AssessmentMethodVO }) => formatDimensions(record),
      },
      {
        title: "等级判定规则",
        dataIndex: "levelRules",
        width: 280,
        ellipsis: true,
        customRender: ({ record }: { record: AssessmentMethodVO }) => <span style={{ fontSize: "12px" }}>{formatLevelRules(record)}</span>,
      },
      {
        title: "适用场景",
        dataIndex: "description",
        width: 160,
        ellipsis: true,
        customRender: ({ text }: { text: string }) => text || "—",
      },
      {
        title: "状态",
        dataIndex: "status",
        width: 80,
        customRender: ({ text }: { text: string }) => (
          <Tag color={text === "ENABLED" ? "green" : "default"}>{text === "ENABLED" ? "启用" : "停用"}</Tag>
        ),
      },
      {
        title: "操作",
        width: 80,
        customRender: ({ record }: { record: AssessmentMethodVO }) => (
          <Button
            {...LIST_ACTION_LINK_PROPS}
            onClick={() => {
              void openView(record);
            }}
          >
            查看
          </Button>
        ),
      },
    ];

    const drawerTitle = computed(() => `查看评估方法：${form.name}`);

    return (): JSX.Element => (
      <PageShell
        title={pageTitle}
        v-slots={{
          "layout-content": () => (
            <>
              <Form layout="inline" data-layout-toolbar>
                <FormItem>
                  <Input
                    {...LIST_SEARCH_INPUT_PROPS}
                    v-model:value={keyword.value}
                    placeholder="搜索方法名称/编码"
                    allowClear
                    style={{ width: "220px" }}
                    onPressEnter={onSearch}
                  />
                </FormItem>
                <FormItem>
                  <Button type="primary" onClick={onSearch}>
                    查询
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
                  scroll={{ x: 1200 }}
                  locale={{ emptyText: <Empty description="暂无评估方法数据" /> }}
                />
              </div>
              <Drawer
                title={drawerTitle.value}
                open={drawerVisible.value}
                width={720}
                onClose={() => {
                  drawerVisible.value = false;
                }}
                footer={
                  <Button
                    onClick={() => {
                      drawerVisible.value = false;
                    }}
                  >
                    关闭
                  </Button>
                }
              >
                <Form layout="vertical">
                  <FormItem label="方法编码">
                    <Input v-model:value={form.code} disabled />
                  </FormItem>
                  <FormItem label="方法名称">
                    <Input v-model:value={form.name} disabled />
                  </FormItem>
                  <FormItem label="计算公式">
                    <Input v-model:value={form.formula} disabled />
                  </FormItem>
                  <FormItem label="适用场景">
                    <Input v-model:value={form.description} disabled />
                  </FormItem>
                  <FormItem label="状态">
                    <Select v-model:value={form.status} disabled>
                      <SelectOption value="ENABLED">启用</SelectOption>
                      <SelectOption value="DISABLED">停用</SelectOption>
                    </Select>
                  </FormItem>
                </Form>
                <h4 style={{ margin: "16px 0 8px" }}>评价维度配置</h4>
                <Table columns={dimensionColumns} dataSource={form.dimensions} rowKey="code" pagination={false} size="small" />
                <h4 style={{ margin: "16px 0 8px" }}>等级判定规则</h4>
                <Table columns={ruleColumns} dataSource={form.levelRules} rowKey="level" pagination={false} size="small" />
              </Drawer>
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
