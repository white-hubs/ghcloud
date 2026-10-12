import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { JSX } from "vue/jsx-runtime";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { DroneRouteListModel, DroneRouteStatus, SecurityDeviceRecord } from "@ghcloud/cube-drone-service";
import { Button, Page, PlusOutlined, PopConfirm, PopOver, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeDroneService } from "@/api/server";

import styles from "./routes.module.less";

interface DroneDeviceOption {
  label: string;
  value: string;
}

const routeCreatePath = "/inspection-route-create";
const routeEditPath = "/inspection-route-edit";
const routePreviewPath = "/inspection-route-preview";

const routeStatusMeta: Record<DroneRouteStatus, { text: string; className: string }> = {
  DRAFT: { text: "草稿", className: styles.statusDraft },
  ENABLED: { text: "启用", className: styles.statusEnabled },
  DISABLED: { text: "禁用", className: styles.statusDisabled },
};

const routeStatusOptions = [
  { label: "全部状态", value: "" },
  { label: "草稿", value: "DRAFT" },
  { label: "启用", value: "ENABLED" },
  { label: "禁用", value: "DISABLED" },
];

const toFiniteNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
    return undefined;
  }
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
};

const getFormString = (value: unknown): string => (value === undefined || value === null ? "" : String(value));

const DRONE_APPLICATION_CODE = __ENV__.applicationCode;
const DRONE_APPLICATION_TAG = `builtin.app::${DRONE_APPLICATION_CODE}`;

const getSecurityDeviceId = (device: SecurityDeviceRecord): string => {
  const value = device.deviceId ?? device.id;
  return value === undefined || value === null ? "" : String(value);
};

const getSecurityDeviceLabel = (device: SecurityDeviceRecord): string => {
  const name = device.deviceName || device.name || getSecurityDeviceId(device);
  const code = device.code || device.deviceCode;
  return code ? `${name}（${code}）` : name;
};

const renderText = (text?: number | string): JSX.Element => {
  const content = text === 0 ? "0" : text || "--";
  return <PopOver content={content}>{content}</PopOver>;
};

const formatTime = (value?: number | string): string => {
  if (!value) {
    return "--";
  }
  if (typeof value === "number") {
    return new Date(value).toLocaleString();
  }
  return value.replace("T", " ").slice(0, 19);
};

export const DroneInspectionRoutes = defineComponent({
  name: "DroneInspectionRoutes",
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const router = useRouter();
    const search = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      routeName: "",
      status: "" as DroneRouteStatus | "",
      deviceId: "",
    });
    const searchDroneDeviceOptions = ref<DroneDeviceOption[]>([{ label: "全部设备", value: "" }]);

    const openCreatePage = (): void => {
      void router.push({ path: routeCreatePath });
    };

    const openEditPage = (id: number): void => {
      void router.push({ path: routeEditPath, query: { id } });
    };

    const openPreviewPage = (id: number): void => {
      void router.push({ path: routePreviewPath, query: { id } });
    };

    const changeRouteStatus = async (record: DroneRouteListModel): Promise<void> => {
      const nextStatus = record.status === "ENABLED" ? "DISABLED" : "ENABLED";
      await cubeDroneService.changeDroneRouteStatus(record.id, { status: nextStatus });
      message.success(nextStatus === "ENABLED" ? "已启用" : "已禁用");
      tableApi.query();
    };

    const deleteRoute = async (id: number): Promise<void> => {
      await cubeDroneService.deleteDroneRoute(id);
      message.success("删除成功");
      tableApi.query();
    };

    const applySearchValues = (data: Record<string, unknown>): void => {
      const deviceId = toFiniteNumber(data.deviceId);
      search.routeName = getFormString(data.routeName).trim();
      search.status = getFormString(data.status) as DroneRouteStatus | "";
      search.deviceId = deviceId === undefined ? "" : String(deviceId);
    };

    const loadDeviceOptions = async (): Promise<void> => {
      const res = await cubeDroneService.getSecurityDevicePage({
        applicationCode: DRONE_APPLICATION_CODE,
        pageNumber: 1,
        pageSize: 200,
        filterTagCodes: [DRONE_APPLICATION_TAG],
      });
      const options = (res.records || [])
        .map((item) => ({ label: getSecurityDeviceLabel(item), value: getSecurityDeviceId(item) }))
        .filter((item) => item.value);
      searchDroneDeviceOptions.value = [{ label: "全部设备", value: "" }, ...options];
    };

    const runSearch = (): void => {
      search.pageNumber = 1;
      tableApi.query();
    };

    const resetSearch = (): void => {
      search.routeName = "";
      search.status = "";
      search.deviceId = "";
      search.pageNumber = 1;
      tableApi.query();
    };

    const [CubeTable, tableApi] = useCubeTable({
      tableCode: route.path.replaceAll("/", ""),
      rowKey: "id",
      columns: [
        {
          title: "航线名称",
          dataIndex: "routeName",
          width: 200,
          align: "center",
          customRender: ({ record, text }: { record: DroneRouteListModel; text: string }) => (
            <Button type="link" size="small" class={styles.nameButton} onClick={() => openPreviewPage(record.id)}>
              {text || "--"}
            </Button>
          ),
        },
        {
          title: "航线code",
          dataIndex: "routeCode",
          width: 180,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "航点数量",
          dataIndex: "waypointCount",
          width: 100,
          align: "center",
          customRender: ({ text }: { text: number }) => renderText(text),
        },
        {
          title: "状态",
          dataIndex: "status",
          width: 100,
          align: "center",
          customRender: ({ text }: { text: DroneRouteStatus }) => {
            const meta = routeStatusMeta[text] ?? { text: text || "--", className: styles.statusDefault };
            return <span class={[styles.statusTag, meta.className]}>{meta.text}</span>;
          },
        },
        {
          title: "创建人",
          dataIndex: "createBy",
          width: 120,
          align: "center",
          customRender: ({ record, text }: { record: DroneRouteListModel; text: string }) => renderText(record.createByName || text),
        },
        {
          title: "更新时间",
          dataIndex: "updateTime",
          width: 180,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(formatTime(text)),
        },
        {
          title: "操作",
          dataIndex: "action",
          width: 220,
          fixed: "right",
          align: "center",
          customRender: ({ record }: { record: DroneRouteListModel }) => (
            <>
              <Button type="link" size="small" class={styles.actionButton} onClick={() => openPreviewPage(record.id)}>
                预览
              </Button>
              <Button type="link" size="small" class={styles.actionButton} onClick={() => openEditPage(record.id)}>
                编辑
              </Button>
              <PopConfirm
                title={`确认${record.status === "ENABLED" ? "禁用" : "启用"}该航线？`}
                onConfirm={() => void changeRouteStatus(record)}
              >
                <Button type="link" size="small" class={styles.actionButton}>
                  {record.status === "ENABLED" ? "禁用" : "启用"}
                </Button>
              </PopConfirm>
              <PopConfirm title="确认删除该航线？" onConfirm={() => void deleteRoute(record.id)}>
                <Button type="link" size="small" danger class={styles.actionButton}>
                  删除
                </Button>
              </PopConfirm>
            </>
          ),
        },
      ],
      fetchApi: async () =>
        cubeDroneService.getDroneRoutePage({
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          routeName: search.routeName.trim() || undefined,
          status: search.status || undefined,
          deviceId: search.deviceId ? Number(search.deviceId) : undefined,
        }),
      fetchLoaded: (data) => {
        search.total = data.total;
      },
    });

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      schema: [
        {
          component: "Input",
          label: "航线名称",
          fieldName: "routeName",
          defaultValue: "",
          componentProps: { placeholder: "请输入航线名称" },
        },
        {
          component: "Select",
          label: "航线状态",
          fieldName: "status",
          defaultValue: "",
          componentProps: {
            placeholder: "请选择航线状态",
            options: routeStatusOptions,
          },
        },
        {
          component: "Select",
          label: "无人机设备",
          fieldName: "deviceId",
          defaultValue: "",
          componentProps: {
            placeholder: "请选择无人机设备",
            allowClear: true,
            options: searchDroneDeviceOptions.value,
          },
        },
      ],
      syncStateRef: search,
      handleSubmit: (data) => {
        applySearchValues(data);
        runSearch();
      },
      handleReset: resetSearch,
    });

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      search.pageNumber = pageNumber;
      search.pageSize = pageSize;
      tableApi.query();
    };

    onMounted(() => {
      void loadDeviceOptions().then(() => {
        formApi.updateFieldSchema({
          component: "Select",
          label: "无人机设备",
          fieldName: "deviceId",
          defaultValue: "",
          componentProps: {
            placeholder: "请选择无人机设备",
            allowClear: true,
            options: searchDroneDeviceOptions.value,
          },
        });
      });
    });

    return (): JSX.Element => (
      <CubeLayout
        title={pageTitle || "航线配置"}
        v-slots={{
          "layout-header": () => (
            <Button type="primary" v-slots={{ icon: () => <PlusOutlined /> }} onClick={openCreatePage}>
              新增航线
            </Button>
          ),
          "layout-content": () => (
            <div class={styles.content}>
              <CubeForm />
              <CubeTable />
            </div>
          ),
          "footer-page": () => (
            <Page current={search.pageNumber} pageSize={search.pageSize} total={search.total} onPageChange={handlePageChange} />
          ),
        }}
      />
    );
  },
});
