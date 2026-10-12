import { defineComponent, reactive, ref, toRef } from "vue";
import { useRouter } from "vue-router";

import { deleteAssessmentPlan, pageAssessmentPlans, patchAssessmentPlan } from "@ghcloud/cube-services-client/risk-graded-control.client";
import { AntModal, Button, Form, FormItem, Input, Select, SelectOption, Space, Switch, Table, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { GPagination } from "@/components/common/pagination";
import { PageShell } from "@/components/page-shell/page-shell";
import { LIST_ACTION_DELETE_PROPS, LIST_ACTION_LINK_PROPS, LIST_SEARCH_INPUT_PROPS } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useListSearchClearReload } from "@/hooks/use-list-search-clear-reload";
import { useServerPagedList } from "@/hooks/use-server-paged-list";
import type { EvaluationPlanVO } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { mapEvaluationPlanFromApi } from "@/utils/risk-control-mapper";

export const PlanListPage = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const router = useRouter();
    const plans = ref<EvaluationPlanVO[]>([]);
    const loading = ref(false);

    const filters = reactive({
      keyword: "",
      status: "" as "" | "ENABLED" | "DISABLED",
    });
    const {
      pageNumber,
      pageSize,
      total,
      resetPage,
      onPageChange: bindPageChange,
      scheduleInitialLoad,
      rewindIfEmpty,
    } = useServerPagedList();

    const loadList = async (): Promise<void> => {
      loading.value = true;
      try {
        const page = await useAuthRequest(() =>
          pageAssessmentPlans({
            pageNumber: pageNumber.value,
            pageSize: pageSize.value,
            keyword: filters.keyword.trim() || undefined,
            status: filters.status || undefined,
          }),
        );
        plans.value = page.records.map(mapEvaluationPlanFromApi);
        total.value = page.total ?? 0;
        await rewindIfEmpty(plans.value.length, loadList);
      } catch (e) {
        showApiError(e);
        plans.value = [];
        total.value = 0;
      } finally {
        loading.value = false;
      }
    };

    scheduleInitialLoad(loadList);

    const onSearch = (): void => {
      resetPage();
      void loadList();
    };

    useListSearchClearReload(toRef(filters, "keyword"), onSearch);

    const onReset = (): void => {
      filters.keyword = "";
      filters.status = "";
      resetPage();
      void loadList();
    };

    const onPageChange = bindPageChange(loadList);

    const toggleStatus = async (record: EvaluationPlanVO, checked: boolean): Promise<void> => {
      try {
        await useAuthRequest(() => patchAssessmentPlan(record.id, { enabled: checked }));
        message.success(checked ? "已启用" : "已停用");
        await loadList();
      } catch (e) {
        showApiError(e);
      }
    };

    const handleDelete = (record: EvaluationPlanVO): void => {
      AntModal.confirm({
        centered: true,
        title: "删除确认",
        content: `确定删除评估计划「${record.name}」吗？`,
        onOk: async () => {
          try {
            await useAuthRequest(() => deleteAssessmentPlan(record.id));
            message.success("删除成功");
            await loadList();
          } catch (e) {
            showApiError(e);
          }
        },
      });
    };

    const columns = [
      { dataIndex: "name", title: "计划名称", width: 220, ellipsis: true },
      { dataIndex: "unitName", title: "评估单元", width: 180, ellipsis: true },
      { dataIndex: "cycle", title: "评估周期", width: 100 },
      {
        dataIndex: "nextExecuteTime",
        title: "下次执行时间",
        width: 190,
        customRender: ({ text }: { text?: string }): JSX.Element => <span style={{ whiteSpace: "nowrap" }}>{text || "-"}</span>,
      },
      {
        dataIndex: "notifyCount",
        title: "通知人数",
        width: 90,
        customRender: ({ text }: { text: number }): string => `${text} 人`,
      },
      {
        dataIndex: "status",
        title: "状态",
        width: 110,
        customRender: ({ record }: { record: EvaluationPlanVO }): JSX.Element => (
          <Switch
            checked={record.status === "ENABLED"}
            checkedChildren="启用"
            unCheckedChildren="禁用"
            onChange={(checked: boolean) => {
              void toggleStatus(record, checked);
            }}
          />
        ),
      },
      {
        dataIndex: "action",
        title: "操作",
        width: 130,
        customRender: ({ record }: { record: EvaluationPlanVO }): JSX.Element => (
          <Space>
            <Button {...LIST_ACTION_LINK_PROPS} onClick={() => router.push({ name: "evaluationPlanForm", query: { id: record.id } })}>
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
        title={pageTitle || "评估计划"}
        v-slots={{
          "layout-header": (): JSX.Element => (
            <Button type="primary" onClick={() => router.push({ name: "evaluationPlanForm" })}>
              新增
            </Button>
          ),
          "layout-content": (): JSX.Element => (
            <div class="listPageBody">
              <Form layout="inline" data-layout-toolbar>
                <FormItem label="关键词">
                  <Input
                    {...LIST_SEARCH_INPUT_PROPS}
                    v-model:value={filters.keyword}
                    placeholder="计划名称/单元"
                    allowClear
                    style={{ width: "200px" }}
                    onPressEnter={onSearch}
                  />
                </FormItem>
                <FormItem label="状态">
                  <Select v-model:value={filters.status} allowClear placeholder="全部" style={{ width: "120px" }}>
                    <SelectOption value="">全部</SelectOption>
                    <SelectOption value="ENABLED">启用</SelectOption>
                    <SelectOption value="DISABLED">停用</SelectOption>
                  </Select>
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
                  rowKey="id"
                  columns={columns}
                  dataSource={plans.value}
                  pagination={false}
                  loading={loading.value}
                  scroll={{ x: 1020 }}
                />
              </div>
            </div>
          ),
          "footer-page": (): JSX.Element => (
            <GPagination total={total.value} current={pageNumber.value} pageSize={pageSize.value} onChange={onPageChange} />
          ),
        }}
      />
    );
  },
});
