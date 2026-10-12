import { defineComponent, reactive } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { WarehouseLocationCardBoundWarehousePageItem } from "@ghcloud/cube-granary-management-service";
import { Button, Page } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { renderCell, text } from "./shared";
import { cubeGranaryManagementService } from "@/api/service";

import "./warehouse-location-card-config.less";

export const WarehouseLocationCardConfigList = defineComponent({
  name: "WarehouseLocationCardConfigList",
  setup: () => {
    const { pageTitle } = usePageName();
    const router = useRouter();
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      warehouseName: "",
    });

    const openDetail = (record: WarehouseLocationCardBoundWarehousePageItem): void => {
      void router.push({
        path: "/warehouse-location-card-config/detail",
        query: {
          warehouseId: String(record.warehouseId),
          warehouseName: record.warehouseName ?? "",
          categoryName: record.categoryName ?? "",
          qualityGrade: record.qualityGrade ?? "",
          maxHeight: text(record.maxHeight),
          warehouseVolume: text(record.warehouseVolume),
        },
      });
    };

    const columns = [
      {
        title: "粮仓名称",
        dataIndex: "warehouseName",
        align: "center" as const,
        customRender: ({ text: t }: { text: string }) => renderCell(t),
      },
      {
        title: "类别",
        dataIndex: "categoryName",
        align: "center" as const,
        customRender: ({ text: t }: { text: string }) => renderCell(t),
      },
      {
        title: "等级",
        dataIndex: "qualityGrade",
        align: "center" as const,
        customRender: ({ text: t }: { text: string }) => renderCell(t),
      },
      {
        title: "最大高度",
        dataIndex: "maxHeight",
        align: "center" as const,
        customRender: ({ text: t }: { text: number | null }) => renderCell(t),
      },
      {
        title: "仓内容积",
        dataIndex: "warehouseVolume",
        align: "center" as const,
        customRender: ({ text: t }: { text: number | null }) => renderCell(t),
      },
      { title: "保管人", dataIndex: "keeper", align: "center" as const, customRender: ({ text: t }: { text: string }) => renderCell(t) },
      {
        title: "操作",
        dataIndex: "action",
        align: "center" as const,
        customRender: ({ record }: { record: WarehouseLocationCardBoundWarehousePageItem }) => (
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            查看详情
          </Button>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      rowKey: "warehouseId",
      columns,
      fetchApi: async () =>
        cubeGranaryManagementService.getLocationCardBoundWarehousePage({
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          warehouseName: searchParams.warehouseName,
        }),
      fetchLoaded: (page) => {
        searchParams.total = page.total;
      },
    });

    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      schema: [
        {
          component: "Input",
          fieldName: "warehouseName",
          label: "粮仓名称",
          componentProps: {
            placeholder: "请输入",
            allowClear: true,
            style: { width: "220px" },
          },
        },
      ],
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: (values) => {
        searchParams.warehouseName = String(values.warehouseName ?? "");
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.warehouseName = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
    });

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber || 1;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };

    return (): JSX.Element => (
      <div class="location-card-config-root">
        <CubeLayout
          title={pageTitle ?? "货位卡配置"}
          v-slots={{
            "layout-content": () => (
              <div class="location-card-config-list">
                <CubeForm />
                <CubeTable />
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
