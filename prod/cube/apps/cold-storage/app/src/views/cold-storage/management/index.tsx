import { defineComponent, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { ColdStore } from "@ghcloud/cube-service-interface/cold-storage";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { deleteColdStore, getColdStorePage } from "@ghcloud/cube-services-client/cold-storage.client";
import { AntModal, Button, message, Page, Space, Tag } from "@ghcloud/cube-ui";

import { pushByHistory } from "../shared/page";
import { coldStoreTypeOptions, enumLabelOf, refrigerationMethodOptions } from "@/constants";
import { useTeleportThemeVars } from "@/hooks/use-teleport-theme-vars";

import "./index.less";

export const ColdStorageManagement = defineComponent({
  name: "ColdStorageManagement",
  setup: () => {
    useTeleportThemeVars();

    const route = useRoute();
    const router = useRouter();
    const pageTitle = String(route.meta.title ?? "冷库管理");
    const tableCode = route.path.replaceAll("/", "");
    const openCreate = (): void => {
      pushByHistory(router, { name: "cold-storage-management-create" });
    };

    const openEdit = (record: ColdStore): void => {
      pushByHistory(router, { name: "cold-storage-management-edit", query: { id: record.id } });
    };

    const query = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: "",
      type: "",
      method: "",
    });

    const openDetail = (record: ColdStore): void => {
      pushByHistory(router, { name: "cold-storage-management-detail", query: { id: record.id } });
    };

    const remove = (record: ColdStore): void => {
      AntModal.confirm({
        centered: true,
        title: "删除确认",
        content: `确认删除 ${record.name}？`,
        okText: "确定",
        cancelText: "取消",
        onOk: async () => {
          await useAuthRequest(() => deleteColdStore(record.id));
          tableApi.query();
          message.success("冷库已删除");
        },
      });
    };

    const changePage = (pageNumber: number, pageSize: number): void => {
      query.pageNumber = pageNumber;
      query.pageSize = pageSize;
      tableApi.query();
    };

    const columns = [
      {
        title: "冷库编号",
        dataIndex: "code",
        align: "center",
        customRender: ({ record }: { record: ColdStore }): JSX.Element => <span class="strong">{record.code}</span>,
      },
      { title: "冷库名称", dataIndex: "name", align: "center" },
      {
        title: "形态",
        dataIndex: "type",
        align: "center",
        customRender: ({ record }: { record: ColdStore }): JSX.Element => (
          <Tag color="blue">{enumLabelOf(coldStoreTypeOptions, record.type)}</Tag>
        ),
      },
      { title: "面积(㎡)", dataIndex: "area", align: "center" },
      { title: "设计温度", dataIndex: "designTemp", align: "center" },
      {
        title: "制冷方式",
        align: "center",
        customRender: ({ record }: { record: ColdStore }): string => enumLabelOf(refrigerationMethodOptions, record.method),
      },
      {
        title: "关联设备",
        align: "center",
        customRender: ({ record }: { record: ColdStore }): string => `${record.devices?.length ?? 0}台`,
      },
      {
        title: "操作",
        align: "center",
        width: 180,
        customRender: ({ record }: { record: ColdStore }): JSX.Element => (
          <Space>
            <Button
              type="link"
              size="small"
              onClick={() => {
                void openDetail(record);
              }}
            >
              详情
            </Button>
            <Button type="link" size="small" onClick={() => void openEdit(record)}>
              编辑
            </Button>
            <Button danger type="link" size="small" onClick={() => remove(record)}>
              删除
            </Button>
          </Space>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: async () => {
        return useAuthRequest(() =>
          getColdStorePage({
            pageNumber: query.pageNumber,
            pageSize: query.pageSize,
            keyword: query.keyword.trim(),
            type: query.type,
            method: query.method,
          }),
        );
      },
      fetchLoaded: (data) => {
        query.total = data.total;
      },
    });

    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      syncStateRef: query,
      schema: [
        {
          component: "Input",
          label: "",
          fieldName: "keyword",
          componentProps: {
            placeholder: "搜索冷库名称/编号",
          },
        },
        {
          component: "Select",
          label: "冷库形态",
          fieldName: "type",
          componentProps: {
            placeholder: "请选择冷库形态",
            options: coldStoreTypeOptions,
          },
        },
        {
          component: "Select",
          label: "制冷方式",
          fieldName: "method",
          componentProps: {
            placeholder: "请选择制冷方式",
            options: refrigerationMethodOptions,
          },
        },
      ],
      handleSubmit: (values) => {
        query.pageNumber = 1;
        query.keyword = values.keyword ? String(values.keyword) : "";
        query.type = values.type ? String(values.type) : "";
        query.method = values.method ? String(values.method) : "";
        tableApi.query();
      },
      handleReset: () => {
        query.pageNumber = 1;
        query.keyword = "";
        query.type = "";
        query.method = "";
        tableApi.query();
      },
    });

    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <Button type="primary" onClick={openCreate}>
          新增冷库
        </Button>
      ),
      "layout-content": (): JSX.Element => (
        <div class="cold-storage-management-root">
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page current={query.pageNumber} pageSize={query.pageSize} total={query.total} onPageChange={changePage} />
      ),
    };

    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={layoutSlots} />;
  },
});
