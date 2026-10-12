import dayjs from "dayjs";
import { computed, defineComponent, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button, CubeIcon, DateRangePicker, Empty, Input, Select } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { DIAGNOSIS_RECORDS } from "./deep-analysis.const";
import { DiagnosisCard } from "./diagnosis-card";
import type { DiagnosisRecord } from "@/types/electrical";

import "../shared/page.less";
import "./deep-analysis.less";

type SeverityFilter = DiagnosisRecord["severity"] | "";
type SortType = "latest" | "severity";

const severityWeight: Record<DiagnosisRecord["severity"], number> = { critical: 3, warning: 2, notice: 1 };

export const DeepAnalysis = defineComponent({
  name: "DeepAnalysis",
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const router = useRouter();
    const filters = reactive({
      keyword: typeof route.query.keyword === "string" ? route.query.keyword : "",
      severity: (typeof route.query.severity === "string" ? route.query.severity : "") as SeverityFilter,
      dates: [
        typeof route.query.start === "string" ? route.query.start : "",
        typeof route.query.end === "string" ? route.query.end : "",
      ] as [string, string],
      sort: (route.query.sort === "severity" ? "severity" : "latest") as SortType,
    });

    const visibleRecords = computed(() => {
      const keyword = filters.keyword.trim().toLowerCase();
      return DIAGNOSIS_RECORDS.filter((record) => {
        const matchesKeyword =
          !keyword || `${record.deviceName}${record.problemName}${record.facilityName}`.toLowerCase().includes(keyword);
        const matchesSeverity = !filters.severity || record.severity === filters.severity;
        const matchesStart = !filters.dates[0] || dayjs(record.diagnosedAt).isAfter(dayjs(filters.dates[0]).startOf("day"));
        const matchesEnd = !filters.dates[1] || dayjs(record.diagnosedAt).isBefore(dayjs(filters.dates[1]).endOf("day"));
        return matchesKeyword && matchesSeverity && matchesStart && matchesEnd;
      }).sort((left, right) =>
        filters.sort === "severity"
          ? severityWeight[right.severity] - severityWeight[left.severity]
          : right.diagnosedAt.localeCompare(left.diagnosedAt),
      );
    });

    const updateQuery = (): void => {
      void router.replace({
        query: {
          keyword: filters.keyword || undefined,
          severity: filters.severity || undefined,
          start: filters.dates[0] || undefined,
          end: filters.dates[1] || undefined,
          sort: filters.sort === "latest" ? undefined : filters.sort,
        },
      });
    };

    const reset = (): void => {
      filters.keyword = "";
      filters.severity = "";
      filters.dates = ["", ""];
      filters.sort = "latest";
      updateQuery();
    };

    const counts = computed(() => ({
      total: visibleRecords.value.length,
      critical: visibleRecords.value.filter((item) => item.severity === "critical").length,
      pending: visibleRecords.value.filter((item) => item.status === "pending").length,
      resolved: visibleRecords.value.filter((item) => item.status === "resolved").length,
    }));

    const slots = {
      "layout-content": (): JSX.Element => (
        <div class="electrical-page">
          <div class="page-toolbar">
            <DateRangePicker
              value={filters.dates}
              onUpdate:value={(value: [string, string]) => {
                filters.dates = value;
                updateQuery();
              }}
            />
            <Input
              value={filters.keyword}
              allowClear
              placeholder="搜索设备或问题名称"
              style={{ width: "220px" }}
              onUpdate:value={(value: string) => {
                filters.keyword = value;
                updateQuery();
              }}
            />
            <Select
              showSearch
              allowClear
              value={filters.severity || undefined}
              placeholder="全部级别"
              options={[
                { label: "紧急", value: "critical" },
                { label: "重要", value: "warning" },
                { label: "提示", value: "notice" },
              ]}
              style={{ width: "120px" }}
              onUpdate:value={(value?: Exclude<SeverityFilter, "">) => {
                filters.severity = value ?? "";
                updateQuery();
              }}
            />
            <span class="toolbar-spacer" />
            <span class="muted">排序</span>
            <Select
              showSearch
              value={filters.sort}
              placeholder="请选择排序方式"
              options={[
                { label: "诊断时间", value: "latest" },
                { label: "严重程度", value: "severity" },
              ]}
              style={{ width: "120px" }}
              onUpdate:value={(value: SortType) => {
                filters.sort = value;
                updateQuery();
              }}
            />
            <Button onClick={reset}>重置</Button>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <CubeIcon class="stat-icon" iconClass="icon-zhenduanzongshu1" size={36} />
              <div class="stat-label">诊断总数</div>
              <div class="stat-value">
                {counts.value.total}
                <span class="stat-suffix">项</span>
              </div>
            </div>
            <div class="stat-card stat-danger">
              <CubeIcon class="stat-icon" iconClass="icon-jinjiwenti" size={36} />
              <div class="stat-label">紧急诊断</div>
              <div class="stat-value">
                {counts.value.critical}
                <span class="stat-suffix">项</span>
              </div>
            </div>
            <div class="stat-card stat-warning">
              <CubeIcon class="stat-icon" iconClass="icon-guanzhuwenti" size={36} />
              <div class="stat-label">待处理</div>
              <div class="stat-value">
                {counts.value.pending}
                <span class="stat-suffix">项</span>
              </div>
            </div>
            <div class="stat-card stat-success">
              <CubeIcon class="stat-icon" iconClass="icon-Margin" size={36} />
              <div class="stat-label">已完成</div>
              <div class="stat-value">
                {counts.value.resolved}
                <span class="stat-suffix">项</span>
              </div>
            </div>
          </div>
          <div class="content-card">
            <div class="section-title">
              <span>AI 诊断记录</span>
            </div>
            {visibleRecords.value.length ? (
              visibleRecords.value.map((record) => <DiagnosisCard key={record.id} record={record} />)
            ) : (
              <Empty description="没有符合条件的诊断记录" />
            )}
          </div>
        </div>
      ),
    };
    return (): JSX.Element => <CubeLayout title={pageTitle} showFooter={false} v-slots={slots} />;
  },
});
