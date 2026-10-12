import dayjs from "dayjs";
import { defineComponent, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { FormAppraisalRecordGroupVO, FormAppraisalRecordPageVO } from "@ghcloud/cube-form-audit-service";
import { Button, DateRangePicker, message, Page, PopOver, Space } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeFormAuditService } from "@/api/service";
import { FormGroupTree, type FormGroupSelectMeta } from "@/components/form-group-tree/form-group-tree";

import styles from "./assessment-scoring.module.less";

type GroupedScoreRow = {
  id: string;
  firstLevelFormGroupId: string;
  firstLevelFormGroupName: string;
  secondLevelFormGroupId: string;
  secondLevelFormGroupName: string;
  originTotalScore: number | undefined;
  originSpotCheckScore: number | undefined;
  originInspectionScore: number | undefined;
  source: FormAppraisalRecordPageVO;
  firstRowSpan: number;
  secondRowSpan: number;
};

const pickQueryString = (query: Record<string, unknown>, key: string): string | undefined => {
  const raw = query[key];
  if (raw === undefined || raw === null) {
    return undefined;
  }
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (s === undefined || s === null) {
    return undefined;
  }
  const t = String(s).trim();
  return t === "" ? undefined : t;
};

const implicitFiltersFromRoute = (
  query: Record<string, unknown>,
): {
  assessmentYear?: number | undefined;
  assessmentPeriod?: number | undefined;
  periodType?: string | undefined;
  responsibleDepartmentId?: string | undefined;
  status?: string | undefined;
} => {
  const out: {
    assessmentYear?: number | undefined;
    assessmentPeriod?: number | undefined;
    periodType?: string | undefined;
    responsibleDepartmentId?: string | undefined;
    status?: string | undefined;
  } = {};
  const yearText = pickQueryString(query, "assessmentYear");
  if (yearText !== undefined) {
    const n = Number(yearText);
    if (Number.isFinite(n)) {
      out.assessmentYear = n;
    }
  }
  const periodText = pickQueryString(query, "assessmentPeriod");
  if (periodText !== undefined) {
    const n = Number(periodText);
    if (Number.isFinite(n)) {
      out.assessmentPeriod = n;
    }
  }
  const periodType = pickQueryString(query, "periodType");
  if (periodType !== undefined) {
    out.periodType = periodType;
  }
  const dept = pickQueryString(query, "responsibleDepartmentId");
  if (dept !== undefined) {
    out.responsibleDepartmentId = dept;
  }
  const status = pickQueryString(query, "status");
  if (status !== undefined) {
    out.status = status;
  }
  return out;
};

const getDecimalPlaces = (value: unknown): number => {
  const text = String(value).trim().toLowerCase();
  const [coefficient, exponentText] = text.split("e");
  const decimalPlaces = coefficient?.split(".")[1]?.length ?? 0;
  const exponent = exponentText === undefined ? 0 : Number(exponentText);
  if (!Number.isFinite(exponent)) {
    return decimalPlaces;
  }
  return Math.max(0, decimalPlaces - exponent);
};

const subtractScore = (earned: unknown, total: unknown): number => {
  const scale = 10 ** Math.max(getDecimalPlaces(earned), getDecimalPlaces(total));
  return (Math.round(Number(earned) * scale) - Math.round(Number(total) * scale)) / scale;
};

export const AssessmentScoring = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const selectedGroupId = ref<string | number>("0");
    const selectedGroupLevel = ref(0);
    const lastGroupQueryKey = ref<string>("all");

    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const searchFormSchema = [
      {
        component: "Input",
        label: "名称",
        fieldName: "keyword",
        componentProps: {
          placeholder: "请输入考核记录名称",
          allowClear: true,
        },
      },
      {
        component: "Input",
        label: "检查项目",
        fieldName: "inspectionItem",
        componentProps: {
          placeholder: "请输入检查项目",
          allowClear: true,
        },
      },
      {
        component: DateRangePicker,
        label: "生成时间",
        fieldName: "generatedTimeRange",
        defaultValue: null,
        componentProps: {
          valueFormat: "YYYY-MM-DD",
          allowClear: true,
        },
      },
    ];

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: () => {
        page.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        page.pageNumber = 1;
        tableApi.query();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    });

    const openDetail = (record: FormAppraisalRecordPageVO): void => {
      if (record.id === undefined || record.id === null) return;
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/form-audit/assessment-scoring/detail/${String(record.id)}`,
      );
    };

    const toDateTimeText = (raw: unknown): string => {
      if (raw === undefined || raw === null) {
        return "";
      }

      if (typeof raw === "number" && Number.isFinite(raw)) {
        const ms = raw < 1e12 ? raw * 1000 : raw;
        return dayjs(ms).isValid() ? dayjs(ms).format("YYYY-MM-DD HH:mm:ss") : "";
      }

      const text = String(raw).trim();
      if (text === "") {
        return "";
      }

      if (/^\d+$/.test(text)) {
        const num = Number(text);
        if (Number.isFinite(num)) {
          const ms = text.length <= 10 ? num * 1000 : num;
          return dayjs(ms).isValid() ? dayjs(ms).format("YYYY-MM-DD HH:mm:ss") : "";
        }
      }

      const parsed = dayjs(text);
      return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm:ss") : text;
    };

    const formatAssessmentTime = (record: FormAppraisalRecordPageVO): string => {
      return toDateTimeText(record.assessmentEndTime);
    };

    const SCORE_NEGATIVE_COLOR = "#ff4d4f";

    /** 扣分 = 得分(finalTotalScore) - 总分(originTotalScore)，小于 0 表示相对满分有扣减 */
    const computeDeductionScore = (record: FormAppraisalRecordPageVO): number | null => {
      const earned = record.finalTotalScore;
      const total = record.originTotalScore;
      if (earned === undefined || earned === null || total === undefined || total === null) {
        return null;
      }
      const e = Number(earned);
      const t = Number(total);
      if (!Number.isFinite(e) || !Number.isFinite(t)) {
        return null;
      }
      return subtractScore(earned, total);
    };

    const renderScoreCell = (text: unknown): JSX.Element => {
      if (text === undefined || text === null) {
        return <PopOver content="">--</PopOver>;
      }
      const num = Number(text);
      if (!Number.isFinite(num)) {
        const s = String(text);
        return <PopOver content={s}>{s || "--"}</PopOver>;
      }
      const content = String(num);
      const isNegative = num < 0;
      const body = isNegative ? <span style={{ color: SCORE_NEGATIVE_COLOR }}>{content}</span> : content;
      return <PopOver content={content}>{body}</PopOver>;
    };

    const buildFilterParams = (): {
      keyword?: string | undefined;
      inspectionItem?: string | undefined;
      generatedBeginTime?: string | undefined;
      generatedEndTime?: string | undefined;
      periodType?: string | undefined;
      responsibleDepartmentId?: string | undefined;
      firstLevelFormGroupId?: string | undefined;
      secondLevelFormGroupId?: string | undefined;
      assessmentYear?: number | undefined;
      assessmentPeriod?: number | undefined;
      status?: string | undefined;
    } => {
      const { keyword, inspectionItem, generatedTimeRange } = formApi.formValues;
      const keywordTrimmed = String(keyword ?? "").trim();
      const inspectionItemTrimmed = String(inspectionItem ?? "").trim();
      const range = generatedTimeRange as [string, string] | null | undefined;
      const hasRange = Array.isArray(range) && range[0] && range[1];
      const generatedBeginTime = hasRange ? `${String(range[0])} 00:00:00` : undefined;
      const generatedEndTime = hasRange ? `${String(range[1])} 23:59:59` : undefined;
      const implicit = implicitFiltersFromRoute(route.query as Record<string, unknown>);
      const groupId =
        selectedGroupId.value === "0" || selectedGroupId.value === 0 || selectedGroupId.value === undefined
          ? undefined
          : String(selectedGroupId.value);
      const firstLevelFormGroupId = selectedGroupLevel.value === 1 ? groupId : undefined;
      const secondLevelFormGroupId = selectedGroupLevel.value === 2 ? groupId : undefined;
      return {
        keyword: keywordTrimmed || undefined,
        inspectionItem: inspectionItemTrimmed || undefined,
        generatedBeginTime,
        generatedEndTime,
        firstLevelFormGroupId,
        secondLevelFormGroupId,
        ...implicit,
      };
    };

    const buildPageQueryParams = (): {
      pageNumber: number;
      pageSize: number;
      keyword?: string | undefined;
      inspectionItem?: string | undefined;
      generatedBeginTime?: string | undefined;
      generatedEndTime?: string | undefined;
      periodType?: string | undefined;
      responsibleDepartmentId?: string | undefined;
      firstLevelFormGroupId?: string | undefined;
      secondLevelFormGroupId?: string | undefined;
      assessmentYear?: number | undefined;
      assessmentPeriod?: number | undefined;
      status?: string | undefined;
    } => {
      return {
        pageNumber: page.pageNumber,
        pageSize: page.pageSize,
        ...buildFilterParams(),
      };
    };

    const buildGroupedRows = (groups: FormAppraisalRecordGroupVO[]): GroupedScoreRow[] => {
      const rows: GroupedScoreRow[] = [];
      for (const first of groups ?? []) {
        const secondList = Array.isArray(first.children) ? first.children : [];
        if (secondList.length === 0) {
          const firstRecords = Array.isArray(first.records) ? first.records : [];
          for (const record of firstRecords) {
            rows.push({
              ...record,
              id: String(record.id ?? `${first.formGroupId ?? "0"}-${rows.length}`),
              firstLevelFormGroupId: String(first.formGroupId ?? "0"),
              firstLevelFormGroupName: first.formGroupName ?? "--",
              secondLevelFormGroupId: "",
              secondLevelFormGroupName: "--",
              originTotalScore: record.originTotalScore,
              originSpotCheckScore: record.originSpotCheckScore,
              originInspectionScore: record.originInspectionScore,
              source: record,
              firstRowSpan: 1,
              secondRowSpan: 1,
            });
          }
          continue;
        }
        for (const second of secondList) {
          const records = Array.isArray(second.records) ? second.records : [];
          if (records.length === 0) {
            rows.push({
              id: `${first.formGroupId ?? "0"}-${second.formGroupId ?? "0"}-empty`,
              firstLevelFormGroupId: String(first.formGroupId ?? "0"),
              firstLevelFormGroupName: first.formGroupName ?? "--",
              secondLevelFormGroupId: String(second.formGroupId ?? "0"),
              secondLevelFormGroupName: second.formGroupName ?? "--",
              originTotalScore: undefined,
              originSpotCheckScore: undefined,
              originInspectionScore: undefined,
              source: {},
              firstRowSpan: 1,
              secondRowSpan: 1,
            });
            continue;
          }
          for (const record of records) {
            rows.push({
              ...record,
              id: String(record.id ?? `${first.formGroupId ?? "0"}-${second.formGroupId ?? "0"}-${rows.length}`),
              firstLevelFormGroupId: String(first.formGroupId ?? "0"),
              firstLevelFormGroupName: first.formGroupName ?? "--",
              secondLevelFormGroupId: String(second.formGroupId ?? "0"),
              secondLevelFormGroupName: second.formGroupName ?? "--",
              originTotalScore: record.originTotalScore,
              originSpotCheckScore: record.originSpotCheckScore,
              originInspectionScore: record.originInspectionScore,
              source: record,
              firstRowSpan: 1,
              secondRowSpan: 1,
            });
          }
        }
      }

      const firstCounter = new Map<string, number>();
      const secondCounter = new Map<string, number>();
      for (const row of rows) {
        firstCounter.set(row.firstLevelFormGroupId, (firstCounter.get(row.firstLevelFormGroupId) ?? 0) + 1);
        const secondKey = `${row.firstLevelFormGroupId}::${row.secondLevelFormGroupId}`;
        secondCounter.set(secondKey, (secondCounter.get(secondKey) ?? 0) + 1);
      }
      const firstPrinted = new Set<string>();
      const secondPrinted = new Set<string>();
      for (const row of rows) {
        const firstKey = row.firstLevelFormGroupId;
        row.firstRowSpan = firstPrinted.has(firstKey) ? 0 : (firstCounter.get(firstKey) ?? 1);
        firstPrinted.add(firstKey);

        const secondKey = `${row.firstLevelFormGroupId}::${row.secondLevelFormGroupId}`;
        row.secondRowSpan = secondPrinted.has(secondKey) ? 0 : (secondCounter.get(secondKey) ?? 1);
        secondPrinted.add(secondKey);
      }
      return rows;
    };

    const columns = [
      {
        title: "一级目录",
        dataIndex: "firstLevelFormGroupName",
        ellipsis: true,
        align: "center" as const,
        customCell: (record: GroupedScoreRow): { rowSpan: number } => ({ rowSpan: record.firstRowSpan }),
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "二级目录",
        dataIndex: "secondLevelFormGroupName",
        ellipsis: true,
        align: "center" as const,
        customCell: (record: GroupedScoreRow): { rowSpan: number } => ({ rowSpan: record.secondRowSpan }),
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "名称",
        dataIndex: "name",
        ellipsis: true,
        align: "center" as const,
        customRender: ({ record }: { record: GroupedScoreRow }): JSX.Element => {
          const text = record.source.name ?? "";
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "检查项目",
        dataIndex: "inspectionItem",
        ellipsis: true,
        align: "center" as const,
        customRender: ({ record }: { record: GroupedScoreRow }): JSX.Element => {
          const text = record.source.inspectionItem ?? "";
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "责任部门",
        dataIndex: "responsibleDepartmentNames",
        ellipsis: true,
        align: "center" as const,
        customRender: ({ record }: { record: GroupedScoreRow }): JSX.Element => {
          const text = record.source.responsibleDepartmentNames ?? "";
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "总分",
        dataIndex: "originTotalScore",
        ellipsis: true,
        align: "center" as const,
        customRender: ({ text }: { text: number }): JSX.Element => <PopOver content={String(text ?? "")}>{text ?? "--"}</PopOver>,
      },
      {
        title: "得分",
        dataIndex: "finalTotalScore",
        ellipsis: true,
        align: "center" as const,
        customRender: ({ text }: { text: number }): JSX.Element => <PopOver content={String(text ?? "")}>{text ?? "--"}</PopOver>,
      },
      {
        title: "扣分",
        key: "appraisal-record-deduction",
        ellipsis: true,
        align: "center" as const,
        customRender: ({ record }: { record: FormAppraisalRecordPageVO }): JSX.Element => {
          const d = computeDeductionScore(record);
          if (d === null) {
            return <PopOver content="">--</PopOver>;
          }
          return renderScoreCell(d);
        },
      },
      {
        title: "考核时间",
        dataIndex: "assessmentBeginTime",
        ellipsis: true,
        align: "center" as const,
        customRender: ({ record }: { record: FormAppraisalRecordPageVO }): JSX.Element => {
          const line = formatAssessmentTime(record);
          return <PopOver content={line}>{line || "--"}</PopOver>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 120,
        align: "center" as const,
        fixed: "right" as const,
        customRender: ({ record }: { record: GroupedScoreRow }): JSX.Element => (
          <Button type="link" size="small" onClick={() => openDetail(record.source)}>
            详情
          </Button>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: async () => {
        const resp = await cubeFormAuditService.getAppraisalRecordPage(buildPageQueryParams());
        return {
          ...resp,
          records: buildGroupedRows(resp.records ?? []),
        };
      },
      fetchLoaded: (data) => {
        page.total = data.total;
      },
    });

    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber;
      page.pageSize = pageSize;
      tableApi.query();
    };

    const goBack = (): void => {
      history.back();
    };

    const handleGroupSelect = (id: string | number | undefined, meta?: FormGroupSelectMeta): void => {
      const nextId = id ?? "0";
      const nextLevel = meta?.level ?? 0;
      const nextKey = `${nextId}-${nextLevel}`;
      selectedGroupId.value = nextId;
      selectedGroupLevel.value = nextLevel;
      page.pageNumber = 1;
      if (lastGroupQueryKey.value === nextKey) {
        return;
      }
      lastGroupQueryKey.value = nextKey;
      tableApi.query();
    };

    const exportLoading = ref(false);
    const handleExport = async (): Promise<void> => {
      try {
        exportLoading.value = true;
        const res = await cubeFormAuditService.exportAppraisalRecord(buildFilterParams());
        if (res) {
          const link = document.createElement("a");
          const blob = new Blob([res], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "考核评分.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch {
        message.error("操作失败");
      } finally {
        exportLoading.value = false;
      }
    };

    const slots = {
      "footer-btn": (): JSX.Element => <Button onClick={goBack}>返回</Button>,
      "layout-header": (): JSX.Element => (
        <Space>
          <Button disabled={page.total === 0} type="primary" loading={exportLoading.value} onClick={handleExport}>
            导出
          </Button>
        </Space>
      ),
      "layout-content": (): JSX.Element => (
        <div class={styles["layout-content-main"]}>
          <div class={styles["main-left"]}>
            <FormGroupTree title="表单分组" readonly showCount={false} onSelect={handleGroupSelect} />
          </div>
          <div class={styles["main-right"]}>
            <CubeForm />
            <CubeTable />
          </div>
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page v-show={page.total > 0} current={page.pageNumber} pageSize={page.pageSize} total={page.total} onPageChange={handleChange} />
      ),
    };

    return (): JSX.Element => <CubeLayout title={pageTitle ?? "考核评分"} v-slots={slots} />;
  },
});
