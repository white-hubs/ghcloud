import { Modal } from "ant-design-vue";
import { computed, defineComponent, reactive, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { WarehouseLocationCardFieldChangeLogVO } from "@ghcloud/cube-granary-management-service";
import { Button, message, Page } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { formatDateTime, renderCell, routeQueryString, text } from "./shared";
import { cubeGranaryManagementService } from "@/api/service";

import "./warehouse-location-card-config.less";

interface FieldChangeContentItem {
  fieldName: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
}

export const WarehouseLocationCardOperationRecords = defineComponent({
  name: "WarehouseLocationCardOperationRecords",
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const router = useRouter();
    const warehouseId = computed(() => Number(routeQueryString(route.query.warehouseId)));
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      bizType: "",
    });
    const detailModalOpen = ref(false);
    const detailRecord = ref<WarehouseLocationCardFieldChangeLogVO | null>(null);
    const detailItems = computed(() => (detailRecord.value == null ? [] : parseChangeContent(detailRecord.value.changeContent)));

    const goList = (): void => {
      void router.push({ path: "/warehouse-location-card-config" });
    };

    const bizTypeText = (bizType: string): string => {
      if (bizType === "POSITION_PROFILE") {
        return "基础档案";
      }
      if (bizType === "QUALITY_INSPECTION") {
        return "质量检测记录";
      }
      return text(bizType);
    };

    const parseChangeContent = (value: string): FieldChangeContentItem[] => {
      if (value === "") {
        return [];
      }
      try {
        const items = JSON.parse(value);
        return Array.isArray(items) ? (items as FieldChangeContentItem[]) : [];
      } catch (_ignore) {
        return [];
      }
    };

    const detailValueText = (item: FieldChangeContentItem, value: string): string => {
      const isDateField =
        item.fieldName.toLowerCase().includes("time") ||
        item.fieldName.toLowerCase().includes("date") ||
        item.fieldLabel.includes("时间") ||
        item.fieldLabel.includes("日期");
      if (isDateField && value !== "") {
        return formatDateTime(value);
      }
      return text(value);
    };

    const openDetailModal = (record: WarehouseLocationCardFieldChangeLogVO): void => {
      detailRecord.value = record;
      detailModalOpen.value = true;
    };

    const columns = [
      {
        title: "操作时间",
        dataIndex: "createTime",
        align: "center" as const,
        customRender: ({ text: t }: { text: string | number }) => formatDateTime(t),
      },
      { title: "操作人", dataIndex: "createBy", align: "center" as const, customRender: ({ text: t }: { text: string }) => renderCell(t) },
      {
        title: "涉及模块",
        dataIndex: "bizType",
        align: "center" as const,
        customRender: ({ text: t }: { text: string }) => renderCell(bizTypeText(t)),
      },
      {
        title: "变更摘要",
        dataIndex: "changeSummary",
        align: "center" as const,
        customRender: ({ text: t }: { text: string }) => renderCell(t),
      },
      {
        title: "操作详情",
        dataIndex: "detail",
        align: "center" as const,
        customRender: ({ record }: { record: WarehouseLocationCardFieldChangeLogVO }) => (
          <Button type="link" size="small" onClick={() => openDetailModal(record)}>
            查看
          </Button>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      rowKey: "id",
      columns,
      fetchApi: async () => {
        const wid = warehouseId.value;
        if (!Number.isFinite(wid)) {
          message.error("缺少有效的粮仓 ID");
          return { records: [], total: 0, pages: 0 };
        }
        return cubeGranaryManagementService.getLocationCardChangeLogList({
          warehouseId: wid,
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          bizType: searchParams.bizType,
        });
      },
      fetchLoaded: (page) => {
        searchParams.total = page.total;
      },
    });

    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      schema: [
        {
          component: "Select",
          fieldName: "bizType",
          label: "涉及模块",
          defaultValue: "",
          componentProps: {
            placeholder: "涉及模块",
            allowClear: true,
            style: { width: "300px" },
            options: [
              { label: "全部模块", value: "" },
              { label: "基础档案", value: "POSITION_PROFILE" },
              { label: "质量检测记录", value: "QUALITY_INSPECTION" },
            ],
          },
        },
      ],
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: (values) => {
        searchParams.bizType = String(values.bizType ?? "");
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.bizType = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
    });

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber || 1;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };

    return (): VNode => (
      <div class="location-card-config-root">
        <CubeLayout
          title={pageTitle ?? "货位卡操作记录"}
          v-slots={{
            "layout-header": (): VNode => (
              <div>
                <Button onClick={goList}>返回列表</Button>
              </div>
            ),
            "layout-content": () => (
              <div class="location-card-config-records">
                <div class="location-card-config-page-bar">
                  <div class="location-card-config-tabs">
                    <button
                      onClick={() => {
                        void router.push({
                          path: "/warehouse-location-card-config/detail",
                          query: {
                            warehouseId: String(warehouseId.value),
                            warehouseName: routeQueryString(route.query.warehouseName),
                            categoryName: routeQueryString(route.query.categoryName),
                            qualityGrade: routeQueryString(route.query.qualityGrade),
                            maxHeight: routeQueryString(route.query.maxHeight),
                            warehouseVolume: routeQueryString(route.query.warehouseVolume),
                          },
                        });
                      }}
                    >
                      基础档案
                    </button>
                    <button class="is-active">操作记录</button>
                  </div>
                </div>
                <div class="location-card-config-record-query">
                  <CubeForm />
                </div>
                <CubeTable />
                <Modal
                  title="操作详情"
                  open={detailModalOpen.value}
                  width={560}
                  footer={null}
                  onCancel={() => {
                    detailModalOpen.value = false;
                  }}
                >
                  <div class="location-card-config-record-detail">
                    <div class="location-card-config-record-detail-header">
                      <span>字段</span>
                      <span>修改前</span>
                      <span />
                      <span>修改后</span>
                    </div>
                    {detailItems.value.length === 0 ? (
                      <div class="location-card-config-record-detail-empty">暂无详情</div>
                    ) : (
                      detailItems.value.map((item) => (
                        <div class="location-card-config-record-detail-row" key={item.fieldName}>
                          <span>{text(item.fieldLabel)}</span>
                          <span>{detailValueText(item, item.oldValue)}</span>
                          <span class="location-card-config-record-detail-arrow">→</span>
                          <span class="location-card-config-record-detail-new">{detailValueText(item, item.newValue)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </Modal>
              </div>
            ),
            "footer-page": () => (
              <Page
                current={searchParams.pageNumber}
                pageSize={searchParams.pageSize}
                total={searchParams.total}
                onPageChange={handlePageChange}
              />
            ),
          }}
        />
      </div>
    );
  },
});
