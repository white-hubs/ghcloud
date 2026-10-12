import { defineComponent, onMounted, reactive, ref } from "vue";

import type { KeyPersonPageVO, KeyPersonRiskLevel } from "@ghcloud/cube-service-interface/safety-personnel";
import { deleteKeyPerson, pageKeyPersons } from "@ghcloud/cube-services-client/safety-personnel.client";
import { Button, Input, Select, SelectOption, Table, PopConfirm, message, Space } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { GPagination } from "@/components/common/pagination";
import { PersonDetailDrawer } from "@/components/key-personnel/person-detail-drawer/person-detail-drawer";
import { PersonFormModal } from "@/components/key-personnel/person-form-modal/person-form-modal";
import { ReportModal } from "@/components/key-personnel/report-modal/report-modal";
import { RiskLevelTag } from "@/components/key-personnel/risk-level-tag/risk-level-tag";
import { PageShell } from "@/components/page-shell/page-shell";
import { KEY_PERSON_DEFAULT_PAGE_SIZE, KEY_PERSON_RISK_LEVEL_OPTIONS } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useLayoutTableScroll } from "@/hooks/use-layout-table-scroll";
import { resolvePageNumberWhenCurrentEmpty } from "@/utils/pagination";

import styles from "./index.module.less";

export const KeyPersonnelPage = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const { scrollY, recalc: recalcTableScroll } = useLayoutTableScroll();
    const loading = ref(false);
    const records = ref<KeyPersonPageVO[]>([]);
    const total = ref(0);
    const pageNumber = ref(1);
    const pageSize = ref(KEY_PERSON_DEFAULT_PAGE_SIZE);

    const filters = reactive({
      keyword: "",
      riskLevel: "" as KeyPersonRiskLevel | "",
    });

    const formModalRef = ref<InstanceType<typeof PersonFormModal> | null>(null);
    const detailDrawerRef = ref<InstanceType<typeof PersonDetailDrawer> | null>(null);
    const reportModalRef = ref<InstanceType<typeof ReportModal> | null>(null);

    const loadList = async (): Promise<void> => {
      loading.value = true;
      try {
        const res = await useAuthRequest(() =>
          pageKeyPersons({
            pageNumber: pageNumber.value,
            pageSize: pageSize.value,
            keyword: filters.keyword.trim() || undefined,
            riskLevel: filters.riskLevel || undefined,
          }),
        );
        records.value = res.records ?? [];
        total.value = res.total ?? 0;
        const nextPage = resolvePageNumberWhenCurrentEmpty(pageNumber.value, records.value.length, total.value, pageSize.value);
        if (nextPage !== pageNumber.value) {
          pageNumber.value = nextPage;
          await loadList();
          return;
        }
      } finally {
        loading.value = false;
        setTimeout(() => recalcTableScroll(), 50);
      }
    };

    const onSearch = (): void => {
      pageNumber.value = 1;
      void loadList();
    };

    const onReset = (): void => {
      filters.keyword = "";
      filters.riskLevel = "";
      onSearch();
    };

    const onDelete = async (record: KeyPersonPageVO): Promise<void> => {
      await useAuthRequest(() => deleteKeyPerson(record.id));
      message.success("删除成功");
      void loadList();
    };

    void loadList();

    onMounted(() => {
      setTimeout(() => recalcTableScroll(), 100);
    });

    const columns = [
      { title: "编号", dataIndex: "personCode", width: 200, ellipsis: true },
      { title: "姓名", dataIndex: "name", width: 100, ellipsis: true },
      { title: "手机号", dataIndex: "phone", width: 140 },
      { title: "区域", dataIndex: "areaName", width: 140, ellipsis: true },
      {
        title: "风险等级",
        dataIndex: "riskLevel",
        width: 110,
        customRender: ({ record }: { record: KeyPersonPageVO }) => <RiskLevelTag level={record.riskLevel} />,
      },
      { title: "监管人员", dataIndex: "supervisorName", width: 140, ellipsis: true },
      {
        title: "监管原因",
        dataIndex: "supervisionReason",
        ellipsis: true,
        customRender: ({ record }: { record: KeyPersonPageVO }) => (
          <span class={styles.reason} title={record.supervisionReason}>
            {record.supervisionReason}
          </span>
        ),
      },
      {
        title: "操作",
        width: 220,
        fixed: "right" as const,
        customRender: ({ record }: { record: KeyPersonPageVO }) => (
          <Space>
            <Button type="link" size="small" onClick={() => detailDrawerRef.value?.open(record.id)}>
              详情
            </Button>
            <Button type="link" size="small" onClick={() => reportModalRef.value?.open(record.id)}>
              上报
            </Button>
            <Button type="link" size="small" onClick={() => formModalRef.value?.openEdit(record.id)}>
              编辑
            </Button>
            <PopConfirm title="确认删除该人员？" onConfirm={() => onDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </Space>
        ),
      },
    ];

    const riskFilterOptions = KEY_PERSON_RISK_LEVEL_OPTIONS;

    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <Button type="primary" onClick={() => formModalRef.value?.openAdd()}>
          新增人员
        </Button>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <div class="toolbar" data-layout-toolbar>
            <Input v-model:value={filters.keyword} placeholder="姓名/电话" style={{ width: "200px" }} allowClear />
            <Select v-model:value={filters.riskLevel} style={{ width: "140px" }} allowClear placeholder="全部风险">
              {riskFilterOptions.map((o) => (
                <SelectOption key={String(o.value)} value={o.value}>
                  {o.label}
                </SelectOption>
              ))}
            </Select>
            <Button type="primary" onClick={onSearch}>
              查询
            </Button>
            <Button onClick={onReset}>重置</Button>
          </div>
          <div class="tableWrap">
            <Table
              class="safety-personnel-management-table"
              loading={loading.value}
              dataSource={records.value}
              columns={columns}
              rowKey="id"
              pagination={false}
              tableLayout="fixed"
              scroll={{ y: scrollY.value }}
            />
          </div>
        </>
      ),
      "footer-page": (): JSX.Element => (
        <GPagination
          total={total.value}
          current={pageNumber.value}
          pageSize={pageSize.value}
          onChange={(p) => {
            pageNumber.value = p;
            void loadList();
          }}
        />
      ),
    };

    return (): JSX.Element => (
      <div class="page-route">
        <PageShell title={pageTitle} v-slots={layoutSlots} />
        <PersonFormModal
          ref={formModalRef}
          onSuccess={() => {
            void loadList();
          }}
        />
        <PersonDetailDrawer ref={detailDrawerRef} />
        <ReportModal
          ref={reportModalRef}
          onSuccess={(personId: number) => {
            const currentId = detailDrawerRef.value?.getPersonId?.();
            if (currentId === personId) {
              detailDrawerRef.value?.refreshReports();
            }
          }}
        />
      </div>
    );
  },
});
