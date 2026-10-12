import { computed, defineComponent, onMounted, reactive } from "vue";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { DutyAssignmentSummaryVO } from "@ghcloud/cube-service-interface/safety-personnel";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getDutySignatureTrackingStatistics, pageDutyAssignments } from "@ghcloud/cube-services-client/safety-personnel.client";
import { Page } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { TABLE_PAGE_SIZE } from "@/constants";
import { formatText, showApiError } from "@/utils";

import styles from "./index.module.less";

const TRACK_STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "SIGNED", label: "已签收" },
  { value: "UNSIGNED", label: "未签收" },
  { value: "OVERDUE", label: "超期未签收" },
];

export const DutySignatureTrackingPage = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const stats = reactive({
      signedCount: 0,
      unsignedCount: 0,
      overdueUnsignedCount: 0,
    });
    const search = reactive({
      signStatus: "",
      pageNumber: 1,
      pageSize: TABLE_PAGE_SIZE,
      total: 0,
    });

    const loadStats = async (): Promise<void> => {
      try {
        const stat = await useAuthRequest(() => getDutySignatureTrackingStatistics());
        stats.signedCount = stat.signedCount ?? 0;
        stats.unsignedCount = stat.unsignedCount ?? 0;
        stats.overdueUnsignedCount = stat.overdueUnsignedCount ?? 0;
      } catch (e) {
        showApiError(e, "查询签收追踪失败");
        stats.signedCount = 0;
        stats.unsignedCount = 0;
        stats.overdueUnsignedCount = 0;
      }
    };

    onMounted(() => {
      void loadStats();
    });

    const isOverdueUnsigned = (record: DutyAssignmentSummaryVO): boolean =>
      record.signStatus === "UNSIGNED" && typeof record.remainingDays === "number" && record.remainingDays < 0;

    const renderSignStatus = (record: DutyAssignmentSummaryVO): JSX.Element => {
      if (record.signStatus === "SIGNED") {
        return <span class={styles.successText}>已签收</span>;
      }
      if (isOverdueUnsigned(record)) {
        return <span class={styles.dangerText}>超期未签收</span>;
      }
      const remaining = typeof record.remainingDays === "number" ? `剩余${record.remainingDays}天` : "";
      return <span class={styles.warningText}>未签收 {remaining}</span>;
    };

    const columns = [
      { title: "人员", dataIndex: "responsibleUserName", width: 160, ellipsis: true },
      { title: "角色", dataIndex: "roleName", width: 220, ellipsis: true },
      {
        title: "派发时间",
        dataIndex: "dispatchTime",
        width: 180,
        customRender: ({ text }: { text?: string | number }) => formatText(text),
      },
      { title: "签收状态", width: 160, customRender: ({ record }: { record: DutyAssignmentSummaryVO }) => renderSignStatus(record) },
      { title: "签收时间", dataIndex: "signTime", width: 180, customRender: ({ text }: { text?: string | number }) => formatText(text) },
    ];

    const [CubeForm] = useCubeForm({
      cache: false,
      layout: "horizontal",
      syncStateRef: search,
      schema: [
        {
          component: "Select",
          label: "",
          fieldName: "signStatus",
          componentProps: {
            style: { width: "140px" },
            options: TRACK_STATUS_OPTIONS,
          },
        },
      ],
      handleSubmit: (values) => {
        search.signStatus = String(values.signStatus ?? "");
        search.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        search.signStatus = "";
        search.pageNumber = 1;
        tableApi.query();
      },
    });

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: "assignmentId",
      fetchApi: async () =>
        useAuthRequest(() =>
          pageDutyAssignments({
            pageNumber: search.pageNumber,
            pageSize: search.pageSize,
            signStatus: search.signStatus || undefined,
          }),
        ),
      fetchLoaded: (page) => {
        search.total = page.total ?? 0;
      },
    });

    const handleChange = (page: number, pageSize: number): void => {
      if (search.pageNumber === page && search.pageSize === pageSize) {
        return;
      }
      search.pageNumber = page;
      search.pageSize = pageSize;
      tableApi.query();
    };

    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <div class={styles.content}>
          <CubeForm />
          <div class={styles.stats}>
            <span>
              <i class={styles.successDot} />
              已签收 <strong>{stats.signedCount}人</strong>
            </span>
            <span>
              <i class={styles.warningDot} />
              未签收 <strong>{stats.unsignedCount}人</strong>
            </span>
            <span>
              <i class={styles.dangerDot} />
              超期未签收 <strong>{stats.overdueUnsignedCount}人</strong>
            </span>
          </div>
          <CubeTable />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          current={search.pageNumber}
          pageSize={search.pageSize}
          total={search.total}
          onPageChange={handleChange}
          onShowSizeChange={handleChange}
        />
      ),
    };

    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={layoutSlots} showTableXScroll />;
  },
});
