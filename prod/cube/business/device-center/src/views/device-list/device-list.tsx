import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import {
  Button,
  Form,
  FormItem,
  Input,
  Page,
  PopOver,
  message,
  AntModal,
  Tag,
  PopConfirm,
  Select,
  Progress,
  Modal,
} from "@ghcloud/cube-ui";
import { AliasTable } from "@ghcloud/generic-component";

import { AddDeviceModel } from "./components/add-device-modal";
import { DeviceDataShareModal } from "./components/device-data-share-modal/device-data-share-modal";
import { EditDeviceModel } from "./components/edit-device-modal";
import { ImportModel } from "./components/import-modal";
import { SyncModal } from "./components/sync-modal";
import { cubeDeviceCenterInternalService } from "@/api/service";
import { ProductSelect } from "@/components/business/product-select/product-select";
import { Layout } from "@/components/layout/layout";
import { useBatchDelete } from "@/hook/use-batch-delete";
import { useTableDelete } from "@/hook/use-table-delete";
import { useTableScroll } from "@/hook/use-table-scroll";
import { statusOptions } from "@/types/device-type";

import "@/styles/common.less";

interface DeviceInfo {
  productId: string;
  parentDeviceId: string | undefined;
  deviceNumber: string;
  deviceName: string;
  deviceType: number;
  remark: string;
  nodeType: number | undefined;
  nodeTypeName: string | undefined;
  edgeDevIdentify?: string | undefined;
  id: string;
  dataShare: {
    dataShareAsSourceCount: number;
    dataShareAsTargetCount: number;
  };
}

export const DeviceList = defineComponent({
  setup: () => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const queryState = useCubeQueryState<{
      deviceNameOrNumber: string;
      prodId: string | undefined;
      status: number | undefined;
      pageNumber: number;
      pageSize: number;
      total: number;
    }>({
      storage: "url",
      initialState: {
        deviceNameOrNumber: "",
        prodId: undefined,
        status: undefined,
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      cacheFields: ["deviceNameOrNumber", "prodId", "status", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "status") {
          return raw ? Number(raw) : undefined;
        }
        if (field === "pageNumber" || field === "pageSize") {
          return Number(raw);
        }
        return raw.includes(",") ? raw.split(",") : raw;
      },
    });
    const { getCurrentPage } = useTableDelete();
    const useRemoved = (delList: unknown[]): void => {
      const newPage = getCurrentPage(
        { pageNumber: queryState.state.pageNumber, pageSize: queryState.state.pageSize, total: queryState.state.total },
        delList,
        dataSource.value,
      );
      queryState.setPage(newPage.pageNumber, newPage.pageSize);
      queryState.update({ total: newPage.total ?? queryState.state.total });
      getTableData();
    };
    const { batchDelete, deleteLoading, progress, removeNum, deleteStatus } = useBatchDelete();

    const columns = [
      {
        title: "设备序列号",
        dataIndex: "deviceNumber",
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "设备名称",
        dataIndex: "name",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "所属产品",
        dataIndex: "productName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "节点类型",
        dataIndex: "nodeTypeName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "最后连接时间",
        dataIndex: "onlineTimeStr",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "设备状态",
        dataIndex: "status",
        ellipsis: true,
        width: 120,
        align: "center",
        customRender: ({ text }: { text: number }): JSX.Element => {
          const curState = statusOptions.find((e) => e.value === text);
          return (
            <>
              <PopOver content={curState?.label || "--"}>
                {curState?.label ? <Tag color={curState?.color}>{curState?.label}</Tag> : "--"}
              </PopOver>
            </>
          );
        },
      },
      {
        title: "是否有子设备",
        dataIndex: "slaveDeviceIds",
        ellipsis: true,
        width: 120,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const haveSubDevice = text ? (text?.split(",").length > 0 ? "是" : "否") : "";
          return (
            <>
              <PopOver content={haveSubDevice || "--"}>{haveSubDevice || "--"}</PopOver>
            </>
          );
        },
      },
      {
        title: "关联设备",
        dataIndex: "dataShare",
        ellipsis: true,
        width: 180,
        align: "center",
        customRender: ({ record }: { record: DeviceInfo }): JSX.Element => {
          const asSourceCount = record.dataShare?.dataShareAsSourceCount || 0;
          const asTargetCount = record.dataShare?.dataShareAsTargetCount || 0;

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
              {/* 关联设备数量 */}
              {asSourceCount > 0 ? (
                <Button
                  type="link"
                  size="small"
                  style={{ padding: 0, height: "auto", lineHeight: "1.2" }}
                  onClick={() => {
                    openDataShareModal(record, "source");
                  }}
                >
                  <Tag color="blue">已关联：{asSourceCount}</Tag>
                </Button>
              ) : (
                <span style={{ fontSize: "12px", color: "#999" }}>--</span>
              )}

              {/* 被关联设备数量 */}
              {asTargetCount > 0 ? (
                <Button
                  type="link"
                  size="small"
                  style={{ padding: 0, height: "auto", lineHeight: "1.2" }}
                  onClick={() => {
                    openDataShareModal(record, "target");
                  }}
                >
                  <Tag color="green">被关联：{asTargetCount}</Tag>
                </Button>
              ) : (
                <span style={{ fontSize: "12px", color: "#999" }}>--</span>
              )}
            </div>
          );
        },
      },
      {
        title: "操作",
        dataIndex: "actions",
        width: 180,
        fixed: "right",
        customRender: ({ record }: { record: DeviceInfo }): JSX.Element => {
          return (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  goDetail(record);
                }}
              >
                详情
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  editRow(record);
                }}
              >
                编辑
              </Button>
              <PopConfirm
                title="确认删除该项？"
                onConfirm={() => {
                  delRow(record);
                }}
              >
                <Button type="link" size="small" danger>
                  删除
                </Button>
              </PopConfirm>
            </>
          );
        },
      },
    ];

    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        dataSource.value = [];
        queryState.update({ total: 0 });
        const params = {
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          deviceNameOrNumber: queryState.state.deviceNameOrNumber,
          status: queryState.state.status,
          prodId: queryState.state.prodId,
        };
        const res = await cubeDeviceCenterInternalService.getDevicePage(params);
        if (res) {
          const { records, total } = res;
          dataSource.value = records;
          queryState.update({ total });
          queryState.writeCache();
        }
      } catch {
      } finally {
        loading.value = false;
      }
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      queryState.setPage(pageNumber || 1, pageSize);
      selectedRowKeysData.value.length = 0;
      getTableData();
    };

    const queryForm = (): void => {
      queryState.resetPage();
      getTableData();
    };
    const reset = (): void => {
      queryState.update({
        deviceNameOrNumber: "",
        prodId: undefined,
        status: undefined,
      });
      queryState.resetPage();
      queryState.clearCache();
      getTableData();
    };

    const addDeviceModelRef = ref<{ openModal: () => void }>();
    const editDeviceModelRef = ref<{ openModal: (rowItem: DeviceInfo) => void }>();
    const importModelRef = ref<{ openModal: () => void }>();
    const syncModelRef = ref<{ openModal: () => void }>();
    const dataShareModalRef = ref<{ openModal: (deviceId: string, deviceName: string, type: "source" | "target") => void }>();

    const importEvent = (): void => {
      importModelRef.value?.openModal();
    };
    const syncDevice = (): void => {
      syncModelRef.value?.openModal();
    };

    /**
     * 打开关联设备弹窗
     */
    const openDataShareModal = (record: DeviceInfo, type: "source" | "target"): void => {
      const deviceName = record.deviceName || record.deviceNumber;
      dataShareModalRef.value?.openModal(record.id, deviceName, type);
    };
    const delRow = async (record: { id: string }): Promise<void> => {
      try {
        await cubeDeviceCenterInternalService.delDevice({ ids: [record.id] });
        message.success("删除成功");
        useRemoved([record.id]);
        if (selectedRowKeysData.value.find((e) => e === record.id)) {
          selectedRowKeysData.value = selectedRowKeysData.value.filter((e) => e !== record.id);
        }
      } catch {}
    };
    const selectedRowKeysData = ref<string[]>([]);
    const rowSelection = ref({
      onChange: (selectedRowKeys: string[]) => {
        selectedRowKeysData.value = selectedRowKeys;
      },
    });
    const deleteResultVisible = ref(false);
    const handleBatchDeleteResult = (): void => {
      deleteResultVisible.value = false;
      useRemoved(selectedRowKeysData.value);
      selectedRowKeysData.value.length = 0;
    };
    const handleBatchDelete = (): void => {
      AntModal.confirm({
        centered: true,
        content: "确定要删除当前选中?",
        async onOk() {
          try {
            deleteResultVisible.value = true;
            progress.value = 0;
            batchDelete({
              deleteKeys: selectedRowKeysData.value,
              size: 50,
              deleteDataFunc: async (ids: string[]) => cubeDeviceCenterInternalService.delDevice({ ids }),
            });
          } catch {
          } finally {
            AntModal.destroyAll();
          }
        },
        onCancel() {
          AntModal.destroyAll();
        },
      });
    };

    const add = (): void => {
      addDeviceModelRef.value?.openModal();
    };
    const rowId = ref();
    const editRow = (record: DeviceInfo): void => {
      editDeviceModelRef.value?.openModal(record);
      rowId.value = record.id;
    };
    const goDetail = (record: DeviceInfo): void => {
      history.pushState({ current: location.pathname + location.search }, "", `/portal/device-center/device-list-info?id=${record.id}`);
    };
    const { scrollY } = useTableScroll();
    onMounted(() => {
      getTableData();
    });
    const layoutSlots = {
      "layout-header": (): JSX.Element => {
        return (
          <>
            <div>
              <Button
                disabled={selectedRowKeysData.value.length === 0}
                class="mr-16px"
                type="primary"
                loading={deleteLoading.value}
                onClick={handleBatchDelete}
              >
                批量移除
              </Button>
              <Button class="mr-16px" type="primary" onClick={syncDevice}>
                批量同步
              </Button>
              <Button class="mr-16px" type="primary" onClick={importEvent}>
                批量导入
              </Button>
              <Button type="primary" onClick={add}>
                新增
              </Button>
            </div>
          </>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <>
            <Form layout="inline" style={{ margin: "10px 0 " }}>
              <FormItem label="所属产品" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <ProductSelect v-model:value={queryState.state.prodId} />
              </FormItem>
              <FormItem label="设备状态" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Select
                  options={statusOptions}
                  style={{ width: "180px" }}
                  placeholder="请选择设备状态"
                  v-model:value={queryState.state.status}
                />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Input
                  v-model:value={queryState.state.deviceNameOrNumber}
                  placeholder="设备名称/设备序列号"
                  showCount={false}
                  onChange={async () => getTableData()}
                  allowClear
                  maxlength={200}
                />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Button type="primary" onClick={queryForm}>
                  查询
                </Button>
                <Button style={{ marginLeft: "10px" }} onClick={reset}>
                  重置
                </Button>
              </FormItem>
            </Form>
            <AliasTable
              rowKey="id"
              rowSelection={rowSelection.value}
              columns={columns}
              loading={loading.value}
              dataSource={dataSource.value}
              tableCode={tableCode}
              pagination={false}
              scrollY={scrollY.value}
              applicationCode={__ENV__.applicationCode}
            />
          </>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <Page
            v-model:current={queryState.state.pageNumber}
            v-model:pageSize={queryState.state.pageSize}
            v-model:total={queryState.state.total}
            onPageChange={pageChange}
            page-size-options={["10", "20", "50", "100", "200", "500"]}
          />
        );
      },
      "footer-btn": (): JSX.Element => {
        return <span>已选：{selectedRowKeysData.value.length} 条数据</span>;
      },
    };
    return (): JSX.Element => (
      <>
        <Layout title="设备列表" v-slots={layoutSlots} />
        <AddDeviceModel ref={addDeviceModelRef} onEnter={getTableData} />
        <EditDeviceModel ref={editDeviceModelRef} onEnter={getTableData} id={rowId.value} />
        <ImportModel ref={importModelRef} onEnter={getTableData} />
        <SyncModal ref={syncModelRef} onEnter={getTableData} />
        <DeviceDataShareModal ref={dataShareModalRef} deviceId="" deviceName="" type="source" onOk={getTableData} />
        <Modal
          visible={deleteResultVisible.value}
          title="批量删除进度"
          width="400px"
          onCancel={handleBatchDeleteResult}
          onOk={handleBatchDeleteResult}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <Progress
              steps="5"
              percent={(progress.value ?? 0) * 100}
              style={{ display: "inline-flex", width: "90px", position: "relative", padding: "20px 0 10px 0" }}
            />
            <div style={{ display: "flex", alignItems: "center", padding: "10px 0" }}>
              <span>
                已删除 {removeNum.value}/{selectedRowKeysData.value.length} 个设备，
              </span>
              {deleteStatus.value !== "error" &&
                (!deleteLoading.value && removeNum.value > 0 ? <span>批量删除完成!</span> : <span>正在删除，请勿重复操作!</span>)}
              {deleteStatus.value === "error" && <span style={{ color: "#cf1322" }}>操作失败!</span>}
            </div>
          </div>
        </Modal>
      </>
    );
  },
});
