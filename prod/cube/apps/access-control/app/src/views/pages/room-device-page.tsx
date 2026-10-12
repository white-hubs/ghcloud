import { defineComponent, onMounted, reactive, ref } from "vue";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { AccessControlAnyParams, DoorDeviceRecord } from "@ghcloud/cube-service-interface/access-control";
import {
  addDoorDevices,
  getDoorDevicePage,
  getDoorType,
  removeDoorDevice,
  removeDoorDeviceBatch,
} from "@ghcloud/cube-services-client/access-control.client";
import { Button, Page, PopConfirm, Space, message } from "@ghcloud/cube-ui";

import AssociationModal, { type AssociationModalExpose, type AssociationResult } from "./components/association-modal";
import ControlModal, { type ControlModalExpose } from "./components/control-modal";
import { APPLICATION_CODE } from "@/constants/env";

export default defineComponent({
  name: "RoomDevicePage",
  setup: () => {
    const associationModal = ref<AssociationModalExpose>();
    const controlModal = ref<ControlModalExpose>();
    const doorTypeOptions = reactive<Array<{ label: string; value: string }>>([]);
    const selectedIds = ref<Array<string | number>>([]);
    const search = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: "",
      type: "",
    });

    const [CubeTable, tableApi] = useCubeTable({
      rowKey: "id",
      tableCode: "ROOM_DEVICE",
      rowSelection: "checkbox",
      rowSelectionChange: (keys) => {
        selectedIds.value = keys as Array<string | number>;
      },
      columns: [
        { dataIndex: "doorCode", title: "设备编码", ellipsis: true },
        { dataIndex: "name", title: "设备名称", ellipsis: true },
        { dataIndex: "doorModelName", title: "产品品类", ellipsis: true },
        { dataIndex: "typeName", title: "门禁类型", ellipsis: true },
        { dataIndex: "areaName", title: "所属区域", ellipsis: true, customRender: ({ text }: { text: unknown }) => String(text || "--") },
        {
          dataIndex: "action",
          title: "操作",
          width: 160,
          customRender: ({ record }: { record: DoorDeviceRecord }) => (
            <Space>
              <Button type="link" size="small" onClick={() => controlModal.value?.open(record)}>
                控制
              </Button>
              <PopConfirm
                title="确认移除当前设备？"
                onConfirm={async () => {
                  if (record.id == null) {
                    return;
                  }
                  await removeDoorDevice({ id: record.id });
                  message.success("移除成功");
                  tableApi.query();
                }}
              >
                <Button type="link" size="small" danger>
                  移除
                </Button>
              </PopConfirm>
            </Space>
          ),
        },
      ],
      fetchApi: () =>
        getDoorDevicePage({
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          keyword: search.keyword,
          type: search.type,
          applicationCode: APPLICATION_CODE,
        }),
      fetchLoaded: (data) => {
        search.total = data.total;
        selectedIds.value = [];
      },
    });

    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      schema: [
        {
          component: "Select",
          fieldName: "type",
          label: "门禁类型",
          defaultValue: "",
          componentProps: {
            allowClear: true,
            placeholder: "请选择门禁类型",
            options: doorTypeOptions,
          },
        },
        {
          component: "Input",
          fieldName: "keyword",
          label: "设备",
          defaultValue: "",
          componentProps: { allowClear: true, placeholder: "请输入设备编码或名称" },
        },
      ],
      handleSubmit: (values) => {
        search.type = String(values.type || "");
        search.keyword = String(values.keyword || "");
        search.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        Object.assign(search, { type: "", keyword: "", pageNumber: 1 });
        tableApi.query();
      },
    });

    const associateDevices = async (result: AssociationResult): Promise<void> => {
      const devices = result.list.map((item) => ({
        deviceId: item.id || "",
        type: result.type,
        doorCode: item.doorCode || item.code || "",
      }));
      await addDoorDevices(devices as unknown as AccessControlAnyParams);
      message.success("关联成功");
      associationModal.value?.close();
      tableApi.query();
    };

    const removeSelected = async (): Promise<void> => {
      if (!selectedIds.value.length) {
        message.warning("请选择设备");
        return;
      }
      await removeDoorDeviceBatch({ ids: selectedIds.value });
      message.success("批量移除成功");
      tableApi.query();
    };

    onMounted(async () => {
      doorTypeOptions.splice(
        0,
        doorTypeOptions.length,
        ...(await getDoorType({})).map((item) => ({
          value: String(item.value || item.id || ""),
          label: String(item.doorTypeName || item.label || "--"),
        })),
      );
    });

    const slots = {
      "layout-header": () => (
        <Space>
          <Button type="primary" onClick={() => associationModal.value?.open()}>
            关联设备
          </Button>
          <PopConfirm
            title="确认移除选中的设备？"
            onConfirm={() => {
              void removeSelected();
            }}
          >
            <Button danger disabled={!selectedIds.value.length}>
              批量移除
            </Button>
          </PopConfirm>
        </Space>
      ),
      "layout-content": () => (
        <>
          <CubeForm />
          <CubeTable />
          <AssociationModal
            ref={associationModal}
            onSubmit={(result: AssociationResult) => {
              void associateDevices(result);
            }}
          />
          <ControlModal ref={controlModal} onChanged={() => tableApi.query()} />
        </>
      ),
      "footer-page": () => (
        <Page
          current={search.pageNumber}
          pageSize={search.pageSize}
          total={search.total}
          showQuickJumper={false}
          showSizeChanger
          showTotal={(total: number) => `共 ${total} 条`}
          pageSizeOptions={["10", "20", "50", "100"]}
          onPageChange={(pageNumber: number, pageSize: number) => {
            search.pageNumber = pageNumber;
            search.pageSize = pageSize;
            tableApi.query();
          }}
        />
      ),
    };

    return () => <CubeLayout title="门禁设备" v-slots={slots} showTableXScroll />;
  },
});
