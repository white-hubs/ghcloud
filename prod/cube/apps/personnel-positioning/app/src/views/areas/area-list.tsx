import { defineComponent, onMounted, reactive } from "vue";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, Page, type ColumnType, message } from "@ghcloud/cube-ui";

import { positioningApi, type ApiPositioningArea } from "@/api/positioning";
import { formatDateTime } from "@/utils/positioning";

const nodeTypes: Record<ApiPositioningArea["nodeType"], string> = {
  SCENE: "场景",
  BUILDING: "楼栋",
  FLOOR: "楼层",
};

const text = (value: unknown): string => (typeof value === "string" ? value : "");
const cell = (value: unknown): string => (value === null || value === undefined || value === "" ? "—" : String(value));
const axisText = (value?: string): string => {
  if (!value) return "—";
  try {
    const axis = JSON.parse(value) as { bottomLeft?: { x?: number; y?: number }; topRight?: { x?: number; y?: number } };
    if (axis.bottomLeft && axis.topRight) {
      return `(${axis.bottomLeft.x}, ${axis.bottomLeft.y}) → (${axis.topRight.x}, ${axis.topRight.y})`;
    }
  } catch {
    return value;
  }
  return value;
};

export const AreaList = defineComponent({
  name: "PositioningAreaList",
  setup() {
    const search = reactive({ keyword: "", nodeType: "", pageNumber: 1, pageSize: 10, total: 0, syncing: false });
    const columns: ColumnType<ApiPositioningArea>[] = [
      {
        dataIndex: "name",
        title: "区域名称",
        width: 240,
        ellipsis: true,
        customRender: ({ record }) => <span title={record.name}>{record.name}</span>,
      },
      { dataIndex: "nodeType", title: "类型", width: 100, customRender: ({ record }) => nodeTypes[record.nodeType] },
      {
        dataIndex: "sourceId",
        title: "厂家区域编号",
        width: 190,
        ellipsis: true,
        customRender: ({ record }) => <span title={record.sourceId}>{record.sourceId}</span>,
      },
      {
        dataIndex: "floorId",
        title: "楼层ID",
        width: 130,
        ellipsis: true,
        customRender: ({ record }) => <span title={record.floorId || ""}>{cell(record.floorId)}</span>,
      },
      {
        dataIndex: "floorPlanFile",
        title: "平面图",
        width: 180,
        ellipsis: true,
        customRender: ({ record }) =>
          record.floorPlanFile?.path ? (
            <a href={record.floorPlanFile.path} target="_blank" rel="noopener noreferrer" title={cell(record.floorPlanFile.name)}>
              {cell(record.floorPlanFile.name || "查看平面图")}
            </a>
          ) : (
            "—"
          ),
      },
      {
        dataIndex: "coordinateAxis",
        title: "坐标轴",
        width: 250,
        ellipsis: true,
        customRender: ({ record }) => <span title={axisText(record.coordinateAxis)}>{axisText(record.coordinateAxis)}</span>,
      },
      {
        dataIndex: "lastSyncTime",
        title: "最近同步时间",
        width: 190,
        customRender: ({ record }) => cell(formatDateTime(record.lastSyncTime)),
      },
    ];
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: "id",
      tableCode: "PERSONNEL_POSITIONING_AREA",
      pagination: false,
      fetchApi: () =>
        positioningApi.pageAreas({
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          keyword: search.keyword || undefined,
          nodeType: search.nodeType || undefined,
        }),
      fetchLoaded: (data) => {
        search.total = data.total;
      },
    });
    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      isCollapsed: false,
      cache: false,
      schema: [
        { component: "Input", fieldName: "keyword", label: "区域名称", componentProps: { placeholder: "输入区域名称", allowClear: true } },
        {
          component: "Select",
          fieldName: "nodeType",
          label: "区域类型",
          componentProps: {
            placeholder: "全部",
            allowClear: true,
            options: [
              { value: "SCENE", label: "场景" },
              { value: "BUILDING", label: "楼栋" },
              { value: "FLOOR", label: "楼层" },
            ],
          },
        },
      ],
      handleSubmit: (values) => {
        search.keyword = text(values.keyword).trim();
        search.nodeType = text(values.nodeType);
        search.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        search.keyword = "";
        search.nodeType = "";
        search.pageNumber = 1;
        tableApi.query();
      },
    });
    async function sync(): Promise<void> {
      if (search.syncing) return;
      search.syncing = true;
      try {
        const result = await positioningApi.syncAreas();
        message.success(`同步完成：${result.total} 个区域`);
        tableApi.query();
      } catch (error) {
        message.error((error as Error).message || "定位区域同步失败");
      } finally {
        search.syncing = false;
      }
    }
    onMounted(() => tableApi.query());
    return () => (
      <CubeLayout
        title="定位区域"
        showFooter={false}
        showTableXScroll
        v-slots={{
          "layout-header": () => (
            <Button type="primary" loading={search.syncing} onClick={() => void sync()}>
              同步区域
            </Button>
          ),
          "layout-content": () => (
            <div style={{ padding: "16px 20px" }}>
              <CubeForm />
              <CubeTable />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                <Page
                  current={search.pageNumber}
                  pageSize={search.pageSize}
                  total={search.total}
                  syncToUrl={false}
                  onPageChange={(pageNumber: number, pageSize: number) => {
                    search.pageNumber = pageSize === search.pageSize ? pageNumber : 1;
                    search.pageSize = pageSize;
                    tableApi.query();
                  }}
                />
              </div>
            </div>
          ),
        }}
      />
    );
  },
});
