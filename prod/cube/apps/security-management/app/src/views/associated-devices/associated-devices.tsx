import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeModal, useCubeTable } from "@ghcloud/cube-app-design";
import type { DeviceGroupDevices } from "@ghcloud/cube-iot-center-service";
import { CubePlayer } from "@ghcloud/cube-player";
import { Button, Page, PopConfirm, PopOver, SyncOutlined, message } from "@ghcloud/cube-ui";
import { useApplicationInfo, useTableDelete } from "@ghcloud/cube-utils";
import { DeviceModalTable } from "@ghcloud/generic-component";

import { cubeDeviceCenter } from "@/api/service";
import { useRelateDevice } from "@/hook/use-relate-device";

import styles from "../monitoring-group/monitoring-group.module.less";

/** 分组设备关联 */
export const AssociatedDevices = defineComponent({
  setup: () => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const { getCurrentApplicationStore } = useApplicationInfo();
    const tagCode = "builtin.app::" + getCurrentApplicationStore().code;
    const { id, name } = useRoute().query as { id: string; name: string };
    const { deviceList, deviceModalTableRef, openDeviceModal, handleRelateDevice } = useRelateDevice();

    const columns = [
      {
        title: "设备编码",
        dataIndex: "code",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "设备名称",
        dataIndex: "name",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "所属区域",
        dataIndex: "area",
        align: "center",
        customRender: ({ record }: { record: DeviceGroupDevices }): JSX.Element => {
          const textVal = record.area?.pathName ?? record.area?.name ?? "";
          return <PopOver content={textVal}>{textVal || "--"}</PopOver>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: DeviceGroupDevices }): JSX.Element => {
          return (
            <>
              <PopConfirm title="确认移除该项？" onConfirm={async () => deleteDevice(record.id)}>
                <Button type="link" danger size="small">
                  移除
                </Button>
              </PopConfirm>
              <Button type="link" size="small" onClick={() => preview(record)}>
                预览
              </Button>
            </>
          );
        },
      },
    ];
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      fetchApi: async () => {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          id: route.query.id as string,
        };
        return cubeDeviceCenter.deviceGroupDevices(params);
      },
      fetchLoaded: (data) => {
        page.total = data.total;
      },
    });

    const { getCurrentPage } = useTableDelete();

    const useRemoved = (delList: unknown[]): void => {
      const dataSource = tableApi.getDataSource() ?? [];
      const pagination = getCurrentPage(page, delList, dataSource);
      Object.assign(page, pagination);
      tableApi.query();
    };
    const deleteDevice = async (rowId: string): Promise<void> => {
      await cubeDeviceCenter.deleteDeviceByDeviceGroup(id, [rowId]);
      message.success("操作成功");
      useRemoved([rowId]);
    };
    const relateDevice = (): void => {
      openDeviceModal(id);
    };
    const refreshLoading = ref(false);
    const handleRefresh = (): void => {
      refreshLoading.value = true;
      tableApi.query();
      setTimeout(() => {
        refreshLoading.value = false;
      }, 1000);
    };
    const handleOk = async (values: { deviceName: string; id: string; deviceId: string }[]): Promise<void> => {
      await handleRelateDevice(values, id);
      message.success("操作成功");
      tableApi.query();
    };
    const curRow = ref<DeviceGroupDevices>();
    const [CubeModal, modalApi] = useCubeModal({
      title: `监控预览`,
      onConfirm: async () => {},
      onCancel: () => {
        curRow.value = undefined;
      },
    });
    const preview = (record: DeviceGroupDevices): void => {
      curRow.value = record;
      modalApi.open();
    };
    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber;
      page.pageSize = pageSize;
      tableApi.query();
    };
    onMounted(() => {
      tableApi.query();
    });
    const modalSlots = {
      default: (): JSX.Element => {
        return (
          <>
            <CubePlayer deviceId={(curRow.value?.id as string) ?? ""} />
          </>
        );
      },
    };
    const layoutSlots = {
      "layout-header": (): JSX.Element => {
        return (
          <>
            <div>
              <Button style={{ marginLeft: "10px" }} type="link" onClick={handleRefresh}>
                <SyncOutlined spin={refreshLoading.value} />
                刷新
              </Button>
              <Button type="primary" onClick={relateDevice}>
                关联设备
              </Button>
            </div>
          </>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <>
            <CubeTable />
            <CubeModal v-slots={modalSlots} />
          </>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <div class={styles.footerPage}>
            <Page current={page.pageNumber} pageSize={page.pageSize} total={page.total} onPageChange={handleChange} />
            <Button
              style={{ marginLeft: "10px" }}
              onClick={() => {
                history.back();
              }}
            >
              返回
            </Button>
          </div>
        );
      },
    };
    return (): JSX.Element => (
      <>
        <CubeLayout title={"监控分组：" + name} v-slots={layoutSlots} />
        <DeviceModalTable
          ref={deviceModalTableRef}
          v-model:value={deviceList.value}
          multiple
          applicationCode={__ENV__.applicationCode}
          tagCodes={[tagCode]}
          onOk={handleOk}
        />
      </>
    );
  },
});
