import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

import { pageIdentificationUnits, pageReviewTasks } from "@ghcloud/cube-services-client/risk-graded-control.client";
import { Button, Form, FormItem, Input, Modal, Select, SelectOption, Space, Table, Tag, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { GPagination } from "@/components/common/pagination";
import { PageShell } from "@/components/page-shell/page-shell";
import {
  IDENTIFICATION_STATUS_LABEL,
  LIST_ACTION_LINK_PROPS,
  LIST_FILTER_SELECT_WIDTH,
  LIST_SEARCH_INPUT_PROPS,
  TABLE_CODE_COLUMN_WIDTH,
  TABLE_PAGE_SIZE,
} from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useListSearchClearReload } from "@/hooks/use-list-search-clear-reload";
import { useServerPagedList } from "@/hooks/use-server-paged-list";
import type { IdentificationUnitVO, IdentificationStatus, RejectedIdentificationVO } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { mapIdentificationFromApi, mapIdentificationStatusToApi, mapRejectedIdentificationFromApi } from "@/utils/risk-control-mapper";

const STATUS_COLOR: Partial<Record<IdentificationStatus, string>> = {
  PENDING: "default",
  IDENTIFYING: "processing",
  PENDING_REVIEW: "warning",
  REVIEWED: "success",
};

const TABLE_SCROLL_X = 1200;

export const IdentificationListPage = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const router = useRouter();
    const records = ref<IdentificationUnitVO[]>([]);
    const {
      pageNumber,
      pageSize,
      total,
      resetPage,
      onPageChange: bindPageChange,
      scheduleInitialLoad,
      rewindIfEmpty,
    } = useServerPagedList();
    const keyword = ref("");
    const statusFilter = ref<IdentificationStatus | "">("");
    const loading = ref(false);
    const rejectedVisible = ref(false);
    const rejectedLoading = ref(false);
    const rejectedUnit = ref<IdentificationUnitVO | null>(null);
    const rejectedRecords = ref<RejectedIdentificationVO[]>([]);

    const loadList = async (): Promise<void> => {
      loading.value = true;
      try {
        const page = await useAuthRequest(() =>
          pageIdentificationUnits({
            pageNumber: pageNumber.value,
            pageSize: pageSize.value,
            keyword: keyword.value.trim() || undefined,
            status: mapIdentificationStatusToApi(statusFilter.value || undefined),
          }),
        );
        records.value = page.records.map(mapIdentificationFromApi);
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

    const onReset = (): void => {
      keyword.value = "";
      statusFilter.value = "";
      pageNumber.value = 1;
      void loadList();
    };

    const onPageChange = bindPageChange(loadList);

    const showRejected = async (record: IdentificationUnitVO): Promise<void> => {
      rejectedUnit.value = record;
      rejectedRecords.value = [];
      rejectedVisible.value = true;
      rejectedLoading.value = true;
      try {
        const page = await useAuthRequest(() =>
          pageReviewTasks({
            unitId: record.id,
            status: "REJECTED",
            pageNumber: 1,
            pageSize: 500,
          }),
        );
        rejectedRecords.value = page.records.map(mapRejectedIdentificationFromApi);
      } catch (e) {
        showApiError(e);
        rejectedRecords.value = [];
      } finally {
        rejectedLoading.value = false;
      }
    };

    const goReIdentify = (unitId: string): void => {
      rejectedVisible.value = false;
      void router.push({ name: "identificationEntry", query: { unitId } });
    };

    const renderIdentifyAction = (record: IdentificationUnitVO): JSX.Element => {
      if (record.status === "REVIEWED") {
        return (
          <Button {...LIST_ACTION_LINK_PROPS} disabled>
            已审核
          </Button>
        );
      }
      if (record.status === "PENDING_REVIEW" && record.rejectedCount <= 0) {
        return (
          <Button {...LIST_ACTION_LINK_PROPS} disabled>
            审核中
          </Button>
        );
      }
      return (
        <Button {...LIST_ACTION_LINK_PROPS} onClick={() => router.push({ name: "identificationEntry", query: { unitId: record.id } })}>
          {record.status === "PENDING_REVIEW" ? "再次辨识" : "辨识"}
        </Button>
      );
    };

    const columns = [
      { title: "辨识编号", dataIndex: "code", width: TABLE_CODE_COLUMN_WIDTH, ellipsis: true },
      { title: "单元名称", dataIndex: "unitName", width: 180, ellipsis: true },
      { title: "单元类型", dataIndex: "unitType", width: 90 },
      { title: "所属区域", dataIndex: "zoneName", width: 140, ellipsis: true },
      {
        title: "辨识人员",
        dataIndex: "identifyUsers",
        width: 140,
        customRender: ({ text }: { text: string[] }) => text.join("、"),
      },
      {
        title: "状态",
        dataIndex: "status",
        width: 100,
        customRender: ({ text }: { text: IdentificationStatus }) => (
          <Tag color={STATUS_COLOR[text]}>{IDENTIFICATION_STATUS_LABEL[text]}</Tag>
        ),
      },
      { title: "对象数", dataIndex: "objectCount", width: 72, align: "center" as const },
      {
        title: "驳回数",
        dataIndex: "rejectedCount",
        width: 80,
        align: "center" as const,
        customRender: ({ text, record }: { text: number; record: IdentificationUnitVO }) =>
          text > 0 ? (
            <Button
              {...LIST_ACTION_LINK_PROPS}
              onClick={() => {
                void showRejected(record);
              }}
            >
              {text}
            </Button>
          ) : (
            <span>0</span>
          ),
      },
      { title: "提交时间", dataIndex: "submitTime", width: 160, customRender: ({ text }: { text?: string }) => text ?? "--" },
      {
        title: "操作",
        width: 140,
        customRender: ({ record }: { record: IdentificationUnitVO }) => (
          <Space size={0}>
            {renderIdentifyAction(record)}
            <Button
              {...LIST_ACTION_LINK_PROPS}
              onClick={() => router.push({ name: "identificationHistory", query: { unitId: record.id } })}
            >
              历史
            </Button>
          </Space>
        ),
      },
    ];

    return (): JSX.Element => (
      <PageShell
        title={pageTitle}
        v-slots={{
          "layout-content": () => (
            <div class="listPageBody">
              <Form layout="inline" data-layout-toolbar>
                <FormItem label="关键词">
                  <Input
                    {...LIST_SEARCH_INPUT_PROPS}
                    v-model:value={keyword.value}
                    placeholder="编号/单元/区域"
                    allowClear
                    style={{ width: "200px" }}
                    onPressEnter={onSearch}
                  />
                </FormItem>
                <FormItem label="状态">
                  <div style={{ width: LIST_FILTER_SELECT_WIDTH }}>
                    <Select
                      v-model:value={statusFilter.value}
                      style={{ width: "100%" }}
                      allowClear
                      placeholder="全部状态"
                      onChange={onSearch}
                    >
                      <SelectOption value="">全部状态</SelectOption>
                      {(Object.keys(IDENTIFICATION_STATUS_LABEL) as IdentificationStatus[]).map((s) => (
                        <SelectOption key={s} value={s}>
                          {IDENTIFICATION_STATUS_LABEL[s]}
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
              <Modal
                title={`驳回记录 — ${rejectedUnit.value?.unitName ?? ""}`}
                open={rejectedVisible.value}
                width={960}
                footer={null}
                onCancel={() => {
                  rejectedVisible.value = false;
                }}
              >
                <p style={{ marginBottom: 12, color: "#666" }}>
                  共 {rejectedUnit.value?.rejectedCount ?? 0} 条驳回，请修改后重新提交辨识。
                </p>
                <Table
                  size="small"
                  pagination={false}
                  rowKey="id"
                  loading={rejectedLoading.value}
                  dataSource={rejectedRecords.value}
                  scroll={{ x: 880 }}
                  columns={[
                    { title: "风险对象", dataIndex: "objectName", width: 120, ellipsis: true },
                    { title: "危险源描述", dataIndex: "hazardDesc", width: 140, ellipsis: true },
                    {
                      title: "退回原因",
                      dataIndex: "rejectReason",
                      width: 140,
                      ellipsis: true,
                      customRender: ({ text }: { text?: string }) => text || "--",
                    },
                    { title: "退回时间", dataIndex: "reviewTime", width: 160, customRender: ({ text }: { text?: string }) => text || "--" },
                    { title: "审核人", dataIndex: "reviewer", width: 90, customRender: ({ text }: { text?: string }) => text || "--" },
                    {
                      title: "操作",
                      width: 90,
                      customRender: ({ record }: { record: RejectedIdentificationVO }) => (
                        <Button {...LIST_ACTION_LINK_PROPS} onClick={() => goReIdentify(rejectedUnit.value?.id ?? "")}>
                          再次辨识
                        </Button>
                      ),
                    },
                  ]}
                />
              </Modal>
            </div>
          ),
          "footer-page": () => (
            <GPagination total={total.value} current={pageNumber.value} pageSize={pageSize.value} onChange={onPageChange} />
          ),
        }}
      />
    );
  },
});
