import { defineComponent, onMounted, reactive, ref } from "vue";

import { CubeLayout, useCubeForm } from "@ghcloud/cube-app-design";
import type {
  BehaviorInputType,
  BehaviorType,
  SafetyCreditIndustryType,
  SafetyCreditScoreLogPageQuery,
  SafetyCreditScoreLogVO,
} from "@ghcloud/cube-safety-credit-service";
import { Button, Modal, Page, PopOver, Table, Tag } from "@ghcloud/cube-ui";

import {
  behaviorTypeLabel,
  cleanText,
  displayText,
  formatDateTime,
  industryTypeLabel,
  industryTypeOptions,
  inputTypeLabel,
  toQueryPeriod,
} from "./shared";
import { cubeSafetyCreditService } from "@/api/server";

import "./s2.less";

interface ScoreLogQueryForm {
  pageNumber: number;
  pageSize: number;
  merchantName: string;
  industryType: OptionalIndustryType;
  period: [string, string];
}

type OptionalIndustryType = SafetyCreditIndustryType | "";

function scoreChangeClass(value?: number): string {
  if ((value ?? 0) > 0) {
    return "s2-score-positive";
  }
  if ((value ?? 0) < 0) {
    return "s2-score-negative";
  }
  return "";
}

export const ScoreLogShell = defineComponent({
  name: "ScoreLogShell",
  setup: () => {
    const loading = ref(false);
    const rows = ref<SafetyCreditScoreLogVO[]>([]);
    const total = ref(0);
    const detailVisible = ref(false);
    const selectedLog = ref<SafetyCreditScoreLogVO | null>(null);

    const query = reactive<ScoreLogQueryForm>({
      pageNumber: 1,
      pageSize: 10,
      merchantName: "",
      industryType: "",
      period: ["", ""],
    });

    function buildQuery(): SafetyCreditScoreLogPageQuery {
      const payload: SafetyCreditScoreLogPageQuery = {
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
      };
      const merchantName = cleanText(query.merchantName);
      const period = toQueryPeriod(query.period);
      if (merchantName !== undefined) {
        payload.merchantName = merchantName;
      }
      if (query.industryType !== "") {
        payload.industryType = query.industryType;
      }
      if (period !== undefined) {
        payload.period = period;
      }
      return payload;
    }

    async function load(): Promise<void> {
      loading.value = true;
      try {
        const result = await cubeSafetyCreditService.pageScoreLogs(buildQuery());
        rows.value = result.records ?? [];
        total.value = result.total ?? 0;
      } finally {
        loading.value = false;
      }
    }

    function resetQuery(): void {
      query.pageNumber = 1;
      query.merchantName = "";
      query.industryType = "";
      query.period = ["", ""];
      void load();
    }

    function changePage(pageNumber: number, pageSize: number): void {
      query.pageNumber = pageNumber;
      query.pageSize = pageSize;
      void load();
    }

    function openDetail(record: SafetyCreditScoreLogVO): void {
      selectedLog.value = record;
      detailVisible.value = true;
    }

    const columns = [
      {
        title: "商户名称",
        dataIndex: "merchantName",
        align: "center",
        width: 170,
        customRender: ({ text }: { text?: string }): JSX.Element => <PopOver content={displayText(text)}>{displayText(text)}</PopOver>,
      },
      {
        title: "行业",
        dataIndex: "industryType",
        align: "center",
        width: 120,
        customRender: ({ text }: { text?: string }): string => industryTypeLabel(text),
      },
      {
        title: "行为类型",
        dataIndex: "behaviorType",
        align: "center",
        width: 130,
        customRender: ({ text }: { text?: BehaviorType }): JSX.Element => <Tag color="blue">{behaviorTypeLabel(text)}</Tag>,
      },
      {
        title: "来源",
        dataIndex: "inputType",
        align: "center",
        width: 120,
        customRender: ({ text }: { text?: BehaviorInputType }): string => inputTypeLabel(text),
      },
      {
        title: "分值变化",
        dataIndex: "scoreChange",
        align: "center",
        width: 110,
        customRender: ({ text }: { text?: number }): JSX.Element => <span class={scoreChangeClass(text)}>{displayText(text)}</span>,
      },
      {
        title: "评分结果",
        align: "center",
        width: 130,
        customRender: ({ record }: { record: SafetyCreditScoreLogVO }): string =>
          `${displayText(record.scoreBefore)} -> ${displayText(record.scoreAfter)}`,
      },
      {
        title: "发生时间",
        dataIndex: "occurredTime",
        align: "center",
        width: 180,
        customRender: ({ text }: { text?: unknown }): string => formatDateTime(text),
      },
      {
        title: "操作",
        align: "center",
        width: 90,
        fixed: "right",
        customRender: ({ record }: { record: SafetyCreditScoreLogVO }): JSX.Element => (
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            详情
          </Button>
        ),
      },
    ];

    onMounted(() => {
      void load();
    });

    const searchFormSchema = [
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
        label: "行业",
        fieldName: "industryType",
        defaultValue: "",
        componentProps: {
          options: [{ label: "全部", value: "" }, ...industryTypeOptions],
        },
      },
      {
        component: "RangePicker",
        label: "发生时间",
        fieldName: "period",
        componentProps: {
          showTime: true,
          valueFormat: "YYYY-MM-DD HH:mm:ss",
          format: "YYYY-MM-DD HH:mm:ss",
          placeholder: ["开始时间", "结束时间"],
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
        query.merchantName = String(data.merchantName ?? "").trim();
        query.industryType = (data.industryType ?? "") as OptionalIndustryType;
        query.period = (data.period ?? ["", ""]) as [string, string];
        void load();
      },
      handleReset: resetQuery,
    });

    const slots = {
      "layout-content": (): JSX.Element => (
        <div class="safety-credit-s2">
          <CubeForm />

          <section class="table-wrap">
            <Table rowKey="id" loading={loading.value} dataSource={rows.value} columns={columns} pagination={false} size="small" />
          </section>
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page current={query.pageNumber} pageSize={query.pageSize} total={total.value} onPageChange={changePage} />
      ),
    };

    return (): JSX.Element => (
      <CubeLayout title="评分日志" v-slots={slots} showTableXScroll>
        <Modal
          v-model:visible={detailVisible.value}
          title="评分日志详情"
          width={820}
          footer={null}
          onCancel={() => {
            detailVisible.value = false;
          }}
        >
          {selectedLog.value !== null ? (
            <div class="s2-detail-grid">
              <div class="detail-item">
                <span>商户</span>
                <strong>{displayText(selectedLog.value.merchantName)}</strong>
              </div>
              <div class="detail-item">
                <span>行业</span>
                <strong>{industryTypeLabel(selectedLog.value.industryType)}</strong>
              </div>
              <div class="detail-item">
                <span>事件名称</span>
                <strong>{displayText(selectedLog.value.eventName ?? selectedLog.value.eventId)}</strong>
              </div>
              <div class="detail-item">
                <span>源应用</span>
                <strong>{displayText(selectedLog.value.applicationName ?? selectedLog.value.applicationCode)}</strong>
              </div>
              <div class="detail-item">
                <span>业务类型</span>
                <strong>{displayText(selectedLog.value.businessType)}</strong>
              </div>
              <div class="detail-item">
                <span>业务主键</span>
                <strong>{displayText(selectedLog.value.businessKey)}</strong>
              </div>
              <div class="detail-item">
                <span>模型版本</span>
                <strong>{displayText(selectedLog.value.scoreModelVersion)}</strong>
              </div>
              <div class="detail-item">
                <span>分值变化</span>
                <strong class={scoreChangeClass(selectedLog.value.scoreChange)}>{displayText(selectedLog.value.scoreChange)}</strong>
              </div>
              <div class="detail-item">
                <span>评分结果</span>
                <strong>
                  {displayText(selectedLog.value.scoreBefore)}
                  {" -> "}
                  {displayText(selectedLog.value.scoreAfter)}
                </strong>
              </div>
              <div class="detail-item">
                <span>发生时间</span>
                <strong>{formatDateTime(selectedLog.value.occurredTime)}</strong>
              </div>
              <div class="detail-item wide">
                <span>描述</span>
                <strong>{displayText(selectedLog.value.description)}</strong>
              </div>
            </div>
          ) : null}
        </Modal>
      </CubeLayout>
    );
  },
});
