import { defineComponent, onMounted, reactive, ref } from "vue";

import { CubeLayout, useCubeForm } from "@ghcloud/cube-app-design";
import type {
  CheckExecutionStatus,
  QualityStatus,
  SafetyCreditCheckExecutionVO,
  SafetyCreditCheckQualityPageQuery,
  SafetyCreditCheckStatisticsSummaryVO,
} from "@ghcloud/cube-safety-credit-service";
import { Page, PopOver, Table, Tag } from "@ghcloud/cube-ui";

import {
  checkExecutionStatusColor,
  checkExecutionStatusLabel,
  cleanText,
  displayText,
  formatDateTime,
  qualityStatusColor,
  qualityStatusLabel,
  qualityStatusOptions,
} from "../s2/shared";
import { cubeSafetyCreditService } from "@/api/server";

import "../s2/s2.less";
import "./s5.less";

type OptionalQualityStatus = QualityStatus | "";

interface PerformanceQueryForm {
  pageNumber: number;
  pageSize: number;
  merchantId: string;
  merchantName: string;
  qualityStatus: OptionalQualityStatus;
}

export const CheckStatistics = defineComponent({
  name: "CheckStatistics",
  setup: () => {
    const loading = ref(false);
    const rows = ref<SafetyCreditCheckExecutionVO[]>([]);
    const total = ref(0);
    const summary = ref<SafetyCreditCheckStatisticsSummaryVO>({});

    const query = reactive<PerformanceQueryForm>({
      pageNumber: 1,
      pageSize: 10,
      merchantId: "",
      merchantName: "",
      qualityStatus: "",
    });

    function buildQuery(): SafetyCreditCheckQualityPageQuery {
      const payload: SafetyCreditCheckQualityPageQuery = {
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
      };
      const merchantId = cleanText(query.merchantId);
      const merchantName = cleanText(query.merchantName);
      if (merchantId !== undefined) {
        payload.merchantId = merchantId;
      }
      if (merchantName !== undefined) {
        payload.merchantName = merchantName;
      }
      if (query.qualityStatus !== "") {
        payload.qualityStatus = query.qualityStatus;
      }
      return payload;
    }

    async function load(): Promise<void> {
      loading.value = true;
      try {
        const [summaryResult, pageResult] = await Promise.all([
          cubeSafetyCreditService.getCheckStatisticsSummary(),
          cubeSafetyCreditService.pageCheckMerchantPerformance(buildQuery()),
        ]);
        summary.value = summaryResult ?? {};
        rows.value = pageResult.records ?? [];
        total.value = pageResult.total ?? 0;
      } finally {
        loading.value = false;
      }
    }

    function resetQuery(): void {
      query.pageNumber = 1;
      query.merchantId = "";
      query.merchantName = "";
      query.qualityStatus = "";
      void load();
    }

    function changePage(pageNumber: number, pageSize: number): void {
      query.pageNumber = pageNumber;
      query.pageSize = pageSize;
      void load();
    }

    function completionText(): string {
      const value = summary.value.completionRate;
      if (value === undefined || value === null) {
        return "--";
      }
      return `${value}%`;
    }

    const columns = [
      {
        title: "商户编码",
        dataIndex: "merchantCode",
        align: "center",
        width: 140,
        customRender: ({ text }: { text?: string }): JSX.Element => <PopOver content={displayText(text)}>{displayText(text)}</PopOver>,
      },
      {
        title: "商户名称",
        dataIndex: "merchantName",
        align: "center",
        width: 180,
        customRender: ({ text }: { text?: string }): JSX.Element => <PopOver content={displayText(text)}>{displayText(text)}</PopOver>,
      },
      {
        title: "清单名称",
        dataIndex: "checkName",
        align: "center",
        width: 200,
        customRender: ({ text }: { text?: string }): JSX.Element => <PopOver content={displayText(text)}>{displayText(text)}</PopOver>,
      },
      {
        title: "执行状态",
        dataIndex: "status",
        align: "center",
        width: 120,
        customRender: ({ text }: { text?: CheckExecutionStatus }): JSX.Element => (
          <Tag color={checkExecutionStatusColor(text)}>{checkExecutionStatusLabel(text)}</Tag>
        ),
      },
      {
        title: "周期开始",
        dataIndex: "cycleBegin",
        align: "center",
        width: 180,
        customRender: ({ text }: { text?: unknown }): string => formatDateTime(text),
      },
      {
        title: "周期结束",
        dataIndex: "cycleEnd",
        align: "center",
        width: 180,
        customRender: ({ text }: { text?: unknown }): string => formatDateTime(text),
      },
      {
        title: "提交时间",
        dataIndex: "submitTime",
        align: "center",
        width: 180,
        customRender: ({ text }: { text?: unknown }): string => formatDateTime(text),
      },
    ];

    onMounted(() => {
      void load();
    });

    const searchFormSchema = [
      {
        component: "Input",
        label: "商户ID",
        fieldName: "merchantId",
        componentProps: {
          placeholder: "请输入商户ID",
        },
      },
      {
        component: "Input",
        label: "商户名称",
        fieldName: "merchantName",
        componentProps: {
          placeholder: "请输入商户名称",
        },
      },
      {
        component: "Select",
        label: "质量状态",
        fieldName: "qualityStatus",
        defaultValue: "",
        componentProps: {
          options: [{ label: "全部", value: "" }, ...qualityStatusOptions],
        },
      },
    ];

    const [CubeForm] = useCubeForm({
      syncStateRef: query,
      layout: "horizontal",
      schema: searchFormSchema,
      showCollapseButton: true,
      handleSubmit: (data) => {
        query.pageNumber = 1;
        query.merchantId = String(data.merchantId ?? "").trim();
        query.merchantName = String(data.merchantName ?? "").trim();
        query.qualityStatus = (data.qualityStatus ?? "") as OptionalQualityStatus;
        void load();
      },
      handleReset: resetQuery,
    });

    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <div class="safety-credit-s2">
          <section class="s5-summary-grid">
            <div class="summary-card">
              <span>任务总数</span>
              <strong>{displayText(summary.value.executionCount)}</strong>
            </div>
            <div class="summary-card">
              <span>已完成</span>
              <strong>{displayText(summary.value.completedCount)}</strong>
            </div>
            <div class="summary-card">
              <span>已超期</span>
              <strong>{displayText(summary.value.overdueCount)}</strong>
            </div>
            <div class="summary-card">
              <span>完成率</span>
              <strong>{completionText()}</strong>
            </div>
          </section>

          <CubeForm />

          <section class="table-wrap">
            <Table rowKey="id" loading={loading.value} dataSource={rows.value} columns={columns} pagination={false} size="small" />
          </section>
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <>
          <Page current={query.pageNumber} pageSize={query.pageSize} total={total.value} onPageChange={changePage} />
        </>
      ),
    };

    return (): JSX.Element => <CubeLayout title="自查统计" v-slots={layoutSlots} showTableXScroll />;
  },
});
