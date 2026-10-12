import { defineComponent, reactive } from "vue";
import { useRouter } from "vue-router";

import { useCubeForm } from "@ghcloud/cube-app-design/src/base-components/cube-form/use-form";
import { CubeLayout } from "@ghcloud/cube-app-design/src/base-components/cube-layout/cube-layout";
import { useCubeTable } from "@ghcloud/cube-app-design/src/base-components/cube-table/use-table";
import type { CameraAiInspectionPlan } from "@ghcloud/cube-service-interface/video-monitor";
import {
  deleteAiInspectionPlan,
  listAiInspectionPlans,
  runAiInspectionPlanOnce,
  updateAiInspectionPlanEnabled,
} from "@ghcloud/cube-services-client/video-monitor.client";
import { Button, Page, PopConfirm, Switch, message } from "@ghcloud/cube-ui";
import type { ColumnType } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { DEFAULT_PAGE_SIZE } from "@/constants/ai-inspection";
import { useAuthRequest } from "@/hooks/auth-request";
import { formatDateTime, formatExecutionPlan } from "@/utils/ai-inspection";

type EnabledFilter = "" | "true" | "false";

export default defineComponent({
  name: "AiInspectionPlanList",
  setup() {
    const router = useRouter();
    const { pageTitle } = usePageName();
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      total: 0,
      keyword: "",
      enabled: "" as EnabledFilter,
    });

    const resolveEnabledParam = (): boolean | undefined => {
      if (searchParams.enabled === "true") {
        return true;
      }
      if (searchParams.enabled === "false") {
        return false;
      }
      return undefined;
    };

    const formSchema = [
      {
        component: "Input",
        label: "计划名称",
        fieldName: "keyword",
        componentProps: {
          placeholder: "请输入计划名称",
        },
      },
      {
        component: "Select",
        label: "启用状态",
        fieldName: "enabled",
        defaultValue: "",
        componentProps: {
          allowClear: true,
          placeholder: "全部",
          options: [
            { label: "全部", value: "" },
            { label: "启用", value: "true" },
            { label: "停用", value: "false" },
          ],
        },
      },
    ];

    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      syncStateRef: searchParams,
      handleSubmit: (values) => {
        searchParams.keyword = typeof values.keyword === "string" ? values.keyword : "";
        searchParams.enabled = values.enabled === "true" || values.enabled === "false" ? values.enabled : "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.keyword = "";
        searchParams.enabled = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      schema: formSchema,
      showCollapseButton: true,
    });

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };

    const handleRun = async (record: CameraAiInspectionPlan): Promise<void> => {
      try {
        await useAuthRequest(() => runAiInspectionPlanOnce(record.id));
        message.success("已提交，结果稍后查看");
      } catch {
        message.error("提交失败");
      }
    };

    const handleEnabledChange = async (record: CameraAiInspectionPlan, enabled: boolean): Promise<void> => {
      try {
        await useAuthRequest(() => updateAiInspectionPlanEnabled(record.id, enabled));
        message.success(enabled ? "已启用" : "已停用");
        tableApi.query();
      } catch {
        message.error("操作失败");
        tableApi.query();
      }
    };

    const handleDelete = async (record: CameraAiInspectionPlan): Promise<void> => {
      try {
        await useAuthRequest(() => deleteAiInspectionPlan(record.id));
        message.success("删除成功");
        tableApi.query();
      } catch {
        message.error("删除失败");
      }
    };

    const columns: ColumnType<CameraAiInspectionPlan>[] = [
      { title: "计划名称", dataIndex: "name", key: "name", width: 220, align: "center", ellipsis: true },
      { title: "负责人", dataIndex: "principalUserName", key: "principalUserName", width: 120, align: "center", ellipsis: true },
      {
        title: "执行方式",
        dataIndex: "execution",
        key: "execution",
        width: 260,
        align: "center",
        ellipsis: true,
        customRender: ({ record }) => formatExecutionPlan(record),
      },
      { title: "摄像头数量", dataIndex: "cameraNum", key: "cameraNum", width: 110, align: "center" },
      {
        title: "下次执行时间",
        dataIndex: "nextExecuteTime",
        key: "nextExecuteTime",
        width: 170,
        align: "center",
        customRender: ({ text }) => formatDateTime(text as string | undefined),
      },
      {
        title: "上次执行时间",
        dataIndex: "lastExecuteTime",
        key: "lastExecuteTime",
        width: 170,
        align: "center",
        customRender: ({ text }) => formatDateTime(text as string | undefined),
      },
      {
        title: "启用状态",
        dataIndex: "enabled",
        key: "enabled",
        width: 110,
        align: "center",
        customRender: ({ record }) => (
          <Switch
            checked={Boolean(record.enabled)}
            checkedChildren="启用"
            unCheckedChildren="停用"
            onChange={(checked: unknown) => handleEnabledChange(record, checked === true)}
          />
        ),
      },
      {
        title: "创建时间",
        dataIndex: "createTime",
        key: "createTime",
        width: 170,
        align: "center",
        customRender: ({ text }) => formatDateTime(text as string | undefined),
      },
      {
        title: "操作",
        dataIndex: "actions",
        fixed: "right",
        width: 280,
        align: "center",
        customRender: ({ record }) => (
          <>
            <Button type="link" size="small" onClick={() => router.push({ name: "AiInspectionPlanEdit", params: { id: record.id } })}>
              编辑
            </Button>
            <Button type="link" size="small" onClick={() => handleRun(record)}>
              立即执行
            </Button>
            <Button type="link" size="small" onClick={() => router.push({ name: "AiInspectionTaskList", query: { planId: record.id } })}>
              查看任务
            </Button>
            <PopConfirm title={`确认删除巡检计划：${record.name}？`} onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: "id",
      fetchApi: async () => {
        try {
          return await useAuthRequest(() =>
            listAiInspectionPlans({
              pageNumber: searchParams.pageNumber,
              pageSize: searchParams.pageSize,
              keyword: searchParams.keyword.trim() || undefined,
              enabled: resolveEnabledParam(),
            }),
          );
        } catch (error) {
          message.error("加载巡检计划失败");
          console.log("error：", error);
          return { total: 0, pages: 0, records: [] };
        }
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total;
      },
    });

    const slots = {
      "layout-header": (): JSX.Element => (
        <Button type="primary" onClick={() => router.push({ name: "AiInspectionPlanCreate" })}>
          新增
        </Button>
      ),
      "layout-content": (): JSX.Element => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          current={searchParams.pageNumber}
          pageSize={searchParams.pageSize}
          total={searchParams.total}
          onPageChange={handlePageChange}
        />
      ),
    };

    return () => <CubeLayout title={pageTitle} v-slots={slots} showTableXScroll />;
  },
});
