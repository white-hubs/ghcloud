import dayjs from "dayjs";
import { defineComponent, reactive, ref } from "vue";

import { CubeLayout, useCubeForm, useCubeTable, useCubeModal } from "@ghcloud/cube-app-design";
import { FireDeviceStatus, FireDeviceType } from "@ghcloud/cube-service-interface/fire-management";
import type { FireDeviceRecord } from "@ghcloud/cube-service-interface/fire-management";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import {
  listFireDevices,
  createFireDevice,
  updateFireDevice,
  deleteFireDevice,
} from "@ghcloud/cube-services-client/fire-management.client";
import { Button, Page, PopConfirm, Space, Tag, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { STATUS_LABEL, STATUS_COLOR, STATUS_OPTIONS, TYPE_LABEL, TYPE_OPTIONS } from "./fire-device-list.const";
import { useTeleportThemeVars } from "@/hooks/use-teleport-theme-vars";

export const FireDeviceList = defineComponent({
  name: "FireDeviceList",
  setup: () => {
    const { pageTitle } = usePageName();
    useTeleportThemeVars();

    const searchParams = reactive<{
      pageNumber: number;
      pageSize: number;
      total: number;
      keyword: string;
      type: FireDeviceType | "";
      status: FireDeviceStatus | "";
    }>({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: "",
      type: "",
      status: "",
    });

    // 用以追踪当前编辑的记录（为 null 表示新建模式）
    const editingRecord = ref<FireDeviceRecord | null>(null);

    // 表格列定义
    const columns = [
      { dataIndex: "deviceCode", title: "设备编号", width: 140 },
      { dataIndex: "deviceName", title: "设备名称", ellipsis: true },
      {
        dataIndex: "deviceType",
        title: "设备类型",
        width: 120,
        customRender: ({ text }: { text: FireDeviceType }): string => TYPE_LABEL[text] ?? "--",
      },
      {
        dataIndex: "status",
        title: "状态",
        width: 100,
        customRender: ({ text }: { text: FireDeviceStatus }): JSX.Element => (
          <Tag color={STATUS_COLOR[text] ?? "default"}>{STATUS_LABEL[text] ?? "--"}</Tag>
        ),
      },
      { dataIndex: "location", title: "安装位置", ellipsis: true },
      {
        dataIndex: "lastCheckDate",
        title: "最后检查时间",
        width: 180,
        customRender: ({ text }: { text?: number }): string => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--"),
      },
      {
        dataIndex: "action",
        title: "操作",
        width: 150,
        customRender: ({ record }: { record: FireDeviceRecord }): JSX.Element => (
          <Space>
            <Button type="link" size="small" onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <PopConfirm
              title={`确认删除 ${record.deviceName}？`}
              onConfirm={async () => {
                try {
                  await useAuthRequest(() => deleteFireDevice(record.id));
                  message.success("删除成功");
                  tableApi.query();
                } catch (error) {
                  message.error((error as Error).message || "删除失败");
                }
              }}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </Space>
        ),
      },
    ];

    // 表格实例
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: "id",
      tableCode: "FIRE_DEVICE_LIST",
      fetchApi: async () => {
        const resp = await useAuthRequest(() =>
          listFireDevices({
            pageNumber: searchParams.pageNumber,
            pageSize: searchParams.pageSize,
            keyword: searchParams.keyword,
            type: searchParams.type,
            status: searchParams.status,
          }),
        );
        return resp;
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total;
      },
    });

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };

    // 搜索表单配置
    const formSchema = [
      {
        component: "Input",
        fieldName: "keyword",
        label: "搜索",
        componentProps: {
          placeholder: "编号/名称模糊搜索",
          allowClear: true,
        },
      },
      {
        component: "Select",
        fieldName: "type",
        label: "类型",
        defaultValue: "",
        componentProps: {
          options: TYPE_OPTIONS,
        },
      },
      {
        component: "Select",
        fieldName: "status",
        label: "状态",
        defaultValue: "",
        componentProps: {
          options: STATUS_OPTIONS,
        },
      },
    ];

    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      schema: formSchema,
      handleSubmit: (values) => {
        searchParams.keyword = (values.keyword as string) ?? "";
        searchParams.type = (values.type as FireDeviceType | "") ?? "";
        searchParams.status = (values.status as FireDeviceStatus | "") ?? "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.keyword = "";
        searchParams.type = "";
        searchParams.status = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
    });

    // 新增/编辑弹窗内部的表单
    const modalFormSchema = [
      {
        component: "Input",
        fieldName: "deviceName",
        label: "设备名称",
        required: true,
        componentProps: {
          placeholder: "请输入设备名称",
        },
      },
      {
        component: "Input",
        fieldName: "deviceCode",
        label: "设备编号",
        required: true,
        componentProps: {
          placeholder: "请输入设备编号",
        },
      },
      {
        component: "Select",
        fieldName: "deviceType",
        label: "设备类型",
        required: true,
        defaultValue: FireDeviceType.Extinguisher,
        componentProps: {
          options: TYPE_OPTIONS.filter((o) => o.value !== ""),
        },
      },
      {
        component: "Select",
        fieldName: "status",
        label: "设备状态",
        required: true,
        defaultValue: FireDeviceStatus.Normal,
        componentProps: {
          options: STATUS_OPTIONS.filter((o) => o.value !== ""),
        },
      },
      {
        component: "Input",
        fieldName: "location",
        label: "安装位置",
        required: true,
        componentProps: {
          placeholder: "请输入具体位置，如：1号楼-3层东侧",
        },
      },
      {
        component: "InputTextArea",
        fieldName: "remark",
        label: "备注说明",
        componentProps: {
          placeholder: "请输入备注信息",
          rows: 3,
        },
      },
    ];

    const [CubeModalForm, modalFormApi] = useCubeForm({
      layout: "vertical",
      schema: modalFormSchema,
      showButton: false,
      handleSubmit: async (values) => {
        modalApi.setConfirmLoading(true);
        try {
          if (editingRecord.value) {
            await useAuthRequest(() =>
              updateFireDevice({
                id: editingRecord.value!.id,
                deviceCode: values.deviceCode as string,
                deviceName: values.deviceName as string,
                deviceType: values.deviceType as FireDeviceType,
                status: values.status as FireDeviceStatus,
                location: values.location as string,
                remark: values.remark as string,
              }),
            );
            message.success("编辑成功");
          } else {
            await useAuthRequest(() =>
              createFireDevice({
                deviceCode: values.deviceCode as string,
                deviceName: values.deviceName as string,
                deviceType: values.deviceType as FireDeviceType,
                status: values.status as FireDeviceStatus,
                location: values.location as string,
                remark: values.remark as string,
              }),
            );
            message.success("创建成功");
          }
          modalApi.close();
          tableApi.query();
        } catch (error) {
          message.error((error as Error).message || "操作失败");
        } finally {
          modalApi.setConfirmLoading(false);
        }
      },
    });

    // 新增/编辑弹窗实例
    const [CubeModal, modalApi] = useCubeModal({
      title: "设备信息",
      width: "600px",
      onConfirm: () => {
        modalFormApi.handleSubmit();
      },
      onClosed: () => {
        modalFormApi.handleReset();
        editingRecord.value = null;
      },
    });

    const handleCreate = (): void => {
      editingRecord.value = null;
      modalApi.setState({ title: "新建消防设备" });
      modalApi.open();
    };

    const handleEdit = (record: FireDeviceRecord): void => {
      editingRecord.value = record;
      modalApi.setState({ title: "编辑消防设备" });
      modalApi.open();
      // 等待 DOM 渲染和 Modal 载入后回填表单
      setTimeout(() => {
        modalFormApi.setFormValues({
          deviceName: record.deviceName,
          deviceCode: record.deviceCode,
          deviceType: record.deviceType,
          status: record.status,
          location: record.location,
          remark: record.remark ?? "",
        });
      }, 50);
    };

    const slots = {
      "layout-header": (): JSX.Element => (
        <Button type="primary" onClick={handleCreate}>
          新建设备
        </Button>
      ),
      "layout-content": (): JSX.Element => (
        <div>
          <CubeForm />
          <CubeTable />
          <CubeModal>
            <CubeModalForm />
          </CubeModal>
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          current={searchParams.pageNumber}
          pageSize={searchParams.pageSize}
          total={searchParams.total}
          onPageChange={handlePageChange}
        />
      ),
    };

    return (): JSX.Element => <CubeLayout title={pageTitle || "消防设备管理"} v-slots={slots} showTableXScroll />;
  },
});
export default FireDeviceList;
