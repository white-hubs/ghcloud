import { defineComponent, onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { getIdentification, getUnit, pageIdentifications } from "@ghcloud/cube-services-client/risk-graded-control.client";
import { Button, Descriptions, DescriptionsItem, Form, FormItem, Input, Modal, Space, Table, Tag } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { GPagination } from "@/components/common/pagination";
import { PageShell } from "@/components/page-shell/page-shell";
import { LIST_ACTION_LINK_PROPS, LIST_SEARCH_INPUT_PROPS } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useListSearchClearReload } from "@/hooks/use-list-search-clear-reload";
import { useServerPagedList } from "@/hooks/use-server-paged-list";
import type { IdentificationHistoryRecordVO } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { mapIdentificationObjectHistoryFromApi, mapUnitFromApi } from "@/utils/risk-control-mapper";

const REVIEW_STATUS_LABEL = {
  PENDING: "待审核",
  APPROVED: "已通过",
  REJECTED: "已驳回",
} as const;

const REVIEW_STATUS_COLOR = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
} as const;

const TABLE_SCROLL_X = 1280;

export const IdentificationHistoryPage = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const router = useRouter();
    const records = ref<IdentificationHistoryRecordVO[]>([]);
    const { pageNumber, pageSize, total, onPageChange: bindPageChange, runInitialLoadUnlessHandled, rewindIfEmpty } = useServerPagedList();
    const keyword = ref("");
    const loading = ref(false);
    const detailVisible = ref(false);
    const detailLoading = ref(false);
    const detailRecord = ref<IdentificationHistoryRecordVO | null>(null);
    const unitName = ref("");

    const unitId = computed(() => route.query.unitId as string | undefined);

    const loadUnitName = async (): Promise<void> => {
      if (!unitId.value) {
        unitName.value = "";
        return;
      }
      try {
        const vo = await useAuthRequest(() => getUnit(unitId.value!));
        unitName.value = mapUnitFromApi(vo).name;
      } catch {
        unitName.value = "";
      }
    };

    const loadList = async (): Promise<void> => {
      loading.value = true;
      try {
        const page = await useAuthRequest(() =>
          pageIdentifications({
            pageNumber: pageNumber.value,
            pageSize: pageSize.value,
            keyword: keyword.value.trim() || undefined,
            unitId: unitId.value,
          }),
        );
        records.value = page.records.map(mapIdentificationObjectHistoryFromApi);
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

    onMounted(async () => {
      await loadUnitName();
      runInitialLoadUnlessHandled(loadList);
    });

    const onSearch = (): void => {
      pageNumber.value = 1;
      void loadList();
    };

    useListSearchClearReload(keyword, onSearch);

    const showDetail = async (record: IdentificationHistoryRecordVO): Promise<void> => {
      detailVisible.value = true;
      detailLoading.value = true;
      detailRecord.value = null;
      try {
        const vo = await useAuthRequest(() => getIdentification(record.id));
        detailRecord.value = mapIdentificationObjectHistoryFromApi(vo);
      } catch (e) {
        showApiError(e);
        detailVisible.value = false;
      } finally {
        detailLoading.value = false;
      }
    };

    const onPageChange = bindPageChange(loadList);

    const columns = [
      { title: "辨识轮次", dataIndex: "identifyRoundNo", width: 160, ellipsis: true },
      { title: "风险对象", dataIndex: "objectName", width: 180, ellipsis: true },
      { title: "操作类型", dataIndex: "operationLabel", width: 90 },
      { title: "提交时间", dataIndex: "submitTime", width: 170, customRender: ({ text }: { text?: string }) => text || "--" },
      { title: "辨识人", dataIndex: "identifyUser", width: 100 },
      { title: "危险源", dataIndex: "hazardDesc", ellipsis: true },
      {
        title: "审核状态",
        dataIndex: "reviewStatus",
        width: 100,
        customRender: ({ text }: { text?: IdentificationHistoryRecordVO["reviewStatus"] }) =>
          text ? <Tag color={REVIEW_STATUS_COLOR[text]}>{REVIEW_STATUS_LABEL[text]}</Tag> : "--",
      },
      {
        title: "操作",
        width: 80,
        customRender: ({ record }: { record: IdentificationHistoryRecordVO }) => (
          <Button
            {...LIST_ACTION_LINK_PROPS}
            onClick={() => {
              void showDetail(record);
            }}
          >
            查看
          </Button>
        ),
      },
    ];

    return (): JSX.Element => (
      <PageShell
        title={pageTitle}
        v-slots={{
          "layout-header": () => <Button onClick={() => router.push({ name: "identifications" })}>返回列表</Button>,
          "layout-content": () => (
            <>
              {unitName.value && <div style={{ marginBottom: 12, color: "#666" }}>当前单元：{unitName.value}</div>}
              <Form layout="inline" data-layout-toolbar>
                <FormItem label="关键词">
                  <Input
                    {...LIST_SEARCH_INPUT_PROPS}
                    v-model:value={keyword.value}
                    placeholder="对象/辨识人/危险源"
                    allowClear
                    style={{ width: 220 }}
                    onPressEnter={onSearch}
                  />
                </FormItem>
                <FormItem>
                  <Space>
                    <Button type="primary" onClick={onSearch}>
                      查询
                    </Button>
                    <Button
                      onClick={() => {
                        keyword.value = "";
                        pageNumber.value = 1;
                        void loadList();
                      }}
                    >
                      重置
                    </Button>
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
                title={`辨识记录 — ${detailRecord.value?.objectName ?? ""}`}
                open={detailVisible.value}
                width={640}
                footer={
                  <Button
                    onClick={() => {
                      detailVisible.value = false;
                    }}
                  >
                    关闭
                  </Button>
                }
                onCancel={() => {
                  detailVisible.value = false;
                }}
              >
                {detailLoading.value ? (
                  <div style={{ padding: "24px 0", textAlign: "center", color: "#999" }}>加载中...</div>
                ) : (
                  detailRecord.value && (
                    <Descriptions column={1} bordered size="small">
                      <DescriptionsItem label="辨识轮次">{detailRecord.value.identifyRoundNo || "--"}</DescriptionsItem>
                      <DescriptionsItem label="操作类型">{detailRecord.value.operationLabel}</DescriptionsItem>
                      <DescriptionsItem label="风险对象">{detailRecord.value.objectName || "--"}</DescriptionsItem>
                      <DescriptionsItem label="提交时间">{detailRecord.value.submitTime || "--"}</DescriptionsItem>
                      <DescriptionsItem label="辨识人">{detailRecord.value.identifyUser || "--"}</DescriptionsItem>
                      <DescriptionsItem label="危险源">{detailRecord.value.hazardDesc || "--"}</DescriptionsItem>
                      <DescriptionsItem label="事故类型">{detailRecord.value.accidentTypes.join("、") || "--"}</DescriptionsItem>
                      <DescriptionsItem label="事故原因">{detailRecord.value.cause || "--"}</DescriptionsItem>
                      <DescriptionsItem label="触发因素">{detailRecord.value.triggerFactors || "--"}</DescriptionsItem>
                      <DescriptionsItem label="应急处理措施">{detailRecord.value.emergencyMeasures || "--"}</DescriptionsItem>
                      <DescriptionsItem label="审核状态">
                        {detailRecord.value.reviewStatus ? (
                          <Tag color={REVIEW_STATUS_COLOR[detailRecord.value.reviewStatus]}>
                            {REVIEW_STATUS_LABEL[detailRecord.value.reviewStatus]}
                          </Tag>
                        ) : (
                          "--"
                        )}
                      </DescriptionsItem>
                      {detailRecord.value.reviewerUser ? (
                        <DescriptionsItem label="审核人">{detailRecord.value.reviewerUser}</DescriptionsItem>
                      ) : null}
                      {detailRecord.value.reviewTime ? (
                        <DescriptionsItem label="审核时间">{detailRecord.value.reviewTime}</DescriptionsItem>
                      ) : null}
                      {detailRecord.value.rejectReason ? (
                        <DescriptionsItem label="驳回原因">{detailRecord.value.rejectReason}</DescriptionsItem>
                      ) : null}
                      {detailRecord.value.reviewComment ? (
                        <DescriptionsItem label="审核意见">{detailRecord.value.reviewComment}</DescriptionsItem>
                      ) : null}
                    </Descriptions>
                  )
                )}
              </Modal>
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
