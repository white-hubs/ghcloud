import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { Button, Form, FormItem, Input, Page, PopOver, message, Tag, AntModal, DropDown, Menu, MenuItem } from "@ghcloud/cube-ui";
import { AliasTable, DeptTreeSelect, DeviceModalTable } from "@ghcloud/generic-component";

import { ImportModel } from "./components/import-modal";
import { cubeDeviceCenterInternalService, cubeDeviceCenterService, cubeIdentityService } from "@/api/service";
import { AreaTreeSelect } from "@/components/business/area-tree-select/area-tree-select";
import { DeviceSpatialCoordinateBindingModal } from "@/components/business/device-spatial-coordinate-binding-modal/device-spatial-coordinate-binding-modal";
import { ProductIotCategoryTreeSelect } from "@/components/business/product-iot-category-tree-select/product-iot-category-tree-select";
import { ProductSelect } from "@/components/business/product-select/product-select";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";
import { DeviceStatusOptions } from "@/types/device-type";
import { BindCustomTagModal } from "@/views/device-ledger/components/bind-custom-tag-modal";

import "@/styles/common.less";

export const DeviceLedger = defineComponent({
  setup: () => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const queryState = useCubeQueryState<{
      keyword: string;
      lastAreaId: string[];
      departmentId: string | undefined;
      prodCategoryId: string[];
      productId: string | undefined;
      pageNumber: number;
      pageSize: number;
      total: number;
    }>({
      storage: "url",
      initialState: {
        keyword: "",
        lastAreaId: [],
        departmentId: undefined,
        prodCategoryId: [],
        productId: undefined,
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      cacheFields: ["keyword", "lastAreaId", "departmentId", "prodCategoryId", "productId", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") {
          return Number(raw);
        }
        if (field === "lastAreaId" || field === "prodCategoryId") {
          return raw ? raw.split(",") : [];
        }
        if (field === "departmentId" || field === "productId") {
          return raw || undefined;
        }
        return raw;
      },
    });
    const tagType = ref("CUSTOMER");
    const columns = [
      {
        title: "三维模型编码",
        dataIndex: "deviceCode",
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "设备序列号",
        dataIndex: "iotDeviceNumber",
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "设备名称",
        dataIndex: "deviceName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "所属产品",
        dataIndex: "iotDeviceProductName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "产品品类",
        dataIndex: "iotDeviceCategoryNameConcat",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "维护部门",
        dataIndex: "departmentName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "所在区域",
        dataIndex: "areaName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "设备状态",
        dataIndex: "deviceState",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: number }): JSX.Element => {
          const curState = DeviceStatusOptions.find((e) => e.value === text);
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
        title: "操作",
        dataIndex: "actions",
        width: 300,
        fixed: "right",
        customRender: ({ record }: { record: { id: string; iotDeviceProductId: string } }): JSX.Element => (
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
            <DropDown
              v-slots={{
                overlay: () => (
                  <Menu>
                    <MenuItem
                      onClick={() => {
                        bindTag(record, "CUSTOMER");
                      }}
                    >
                      自定义标签
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        bindTag(record, "SYSTEM");
                      }}
                    >
                      内置标签
                    </MenuItem>
                  </Menu>
                ),
              }}
            >
              <Button type="link" size="small">
                关联标签
              </Button>
            </DropDown>
            <Button
              type="link"
              size="small"
              onClick={() => {
                showDeviceModal(record);
              }}
            >
              关联监控
            </Button>
          </>
        ),
      },
    ];

    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        dataSource.value = [];
        const prodCode =
          queryState.state.prodCategoryId && Array.isArray(queryState.state.prodCategoryId)
            ? queryState.state.prodCategoryId[queryState.state.prodCategoryId.length - 1]
            : queryState.state.prodCategoryId;
        const params = {
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          keyword: queryState.state.keyword,
          departmentId: queryState.state.departmentId,
          prodCategoryCode: prodCode,
          productId: queryState.state.productId,
          lastAreaId: queryState.state.lastAreaId.length ? queryState.state.lastAreaId[queryState.state.lastAreaId.length - 1] : "",
        };
        const res = await cubeDeviceCenterService.getDeviceInstancePage(params);
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
      selectedRowKeysData.value.length = 0;
      selectedRowsData.value.length = 0;
      queryState.setPage(pageNumber || 1, pageSize);
      getTableData();
    };

    const queryForm = (): void => {
      queryState.resetPage();
      getTableData();
    };
    const reset = (): void => {
      queryState.update({
        keyword: "",
        lastAreaId: [],
        departmentId: undefined,
        productId: undefined,
        prodCategoryId: [],
      });
      queryState.resetPage();
      queryState.clearCache();
      getTableData();
    };

    const importModelRef = ref<{ openModal: () => void }>();
    const deviceModalTableRef = ref<{ openModal: () => void }>();
    const batchBindTagRef = ref<{ openModal: (productId?: string) => void }>();

    const importEvent = (): void => {
      importModelRef.value?.openModal();
    };
    const selectedRowKeysData = ref<string[]>([]);
    const selectedRowsData = ref<{ id: string; deviceCode: string; deviceName: string }[]>([]);
    const rowSelection = ref({
      preserveSelectedRowKeys: true,
      onChange: (selectedRowKeys: string[], selectedRows: { id: string; deviceCode: string; deviceName: string }[]) => {
        selectedRowKeysData.value = selectedRowKeys;
        selectedRowsData.value = selectedRows;
      },
    });
    // 批量下载二维码
    const codeLoading = ref(false);
    const saveQrcodeZip = (blob: Blob): void => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.download = "二维码.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    };
    const batchDownloadCode = async (): Promise<void> => {
      if (selectedRowKeysData.value.length === 0) {
        message.warning("请选择要下载二维码的设备");
      } else {
        const params = {
          entityType: "DEVICE",
          entityInfo: selectedRowsData.value.map((item) => ({
            entityId: item.id,
            entityName: item.deviceName,
            serialNumber: item.deviceCode,
          })),
        };
        try {
          codeLoading.value = true;
          const res = await cubeIdentityService.generateBatch(params);
          if (res) {
            saveQrcodeZip(res);
          }
        } catch {
          codeLoading.value = false;
        } finally {
          codeLoading.value = false;
        }
      }
    };

    const editRow = (record: { id: string }, detail?: boolean): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/device-center/device-ledger-form?id=${record.id}&action=${detail ? "detail" : "edit"}`,
      );
    };
    const goDetail = (record: { id: string; iotDeviceProductId: string }): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/device-center/device-ledger-info?id=${record.id}&prodId=${record.iotDeviceProductId}`,
      );
    };
    const deviceList = ref<{ id: string; name: string }[]>([]);
    const deviceBindId = ref();
    const showDeviceModal = async (record: { id: string; iotDeviceProductId: string }): Promise<void> => {
      deviceBindId.value = record.id;
      deviceList.value = [];
      cubeDeviceCenterService
        .getDeviceBind(deviceBindId.value)
        .then((res) => {
          deviceList.value = res.refDeviceIds.map((d) => ({ id: d, name: "" }));
        })
        .finally(() => {
          deviceModalTableRef.value?.openModal();
        });
    };
    // 关联监控
    const handleDeviceModal = async (): Promise<void> => {
      try {
        await cubeDeviceCenterService.updateDeviceBind(deviceBindId.value, {
          refDeviceIds: deviceList.value.map((d: { id: string }) => d.id),
        });
        message.success("操作成功");
        getTableData();
      } catch {
      } finally {
        AntModal.destroyAll();
      }
    };
    // 关联标签
    const deviceTagList = ref<{ id: string; name: string }[]>([]);
    const tagDeviceId = ref();
    const isBatchTag = ref(false);
    const showBindButton = ref(false);
    const bindModalVisible = ref(false);
    const bindTag = async (record: { id: string; iotDeviceProductId: string }, tagTypeValue: "CUSTOMER" | "SYSTEM"): Promise<void> => {
      isBatchTag.value = false;
      tagDeviceId.value = record.id;
      tagType.value = tagTypeValue;
      if (tagTypeValue === "CUSTOMER") {
        const res = await cubeDeviceCenterInternalService.getDeviceTagDetails(record.id);
        if (res.length) {
          deviceTagList.value = res.map((item) => ({ id: item.id ?? "", name: item.tagName ?? "" }));
        }
      } else {
        const res = await cubeDeviceCenterInternalService.getDeviceAllTag([record.id]);
        if (res[record.id]) {
          let result = res[record.id];
          result = result.filter((e) => e.tagCode?.includes("builtin.usage"));
          if (result.length) {
            deviceTagList.value = result.map((item) => ({ id: item.id ?? "", name: item.tagName ?? "" }));
          }
        }
      }
      batchBindTagRef.value?.openModal(record.iotDeviceProductId);
    };
    const batchBindTag = async (tagTypeValue: string): Promise<void> => {
      isBatchTag.value = true;
      tagDeviceId.value = "";
      deviceTagList.value.length = 0;
      if (selectedRowKeysData.value.length === 0) {
        message.warning("请选择要关联标签的设备");
      } else {
        tagType.value = tagTypeValue;
        batchBindTagRef.value?.openModal();
      }
    };
    const handleTagModal = async (values: { id: string; tagName: string; tagCode: string }[]): Promise<void> => {
      try {
        if (isBatchTag.value) {
          await cubeDeviceCenterInternalService.batchDeviceBindCustomerTags({
            deviceIds: selectedRowKeysData.value ?? [],
            tagIds: values.map((v) => v.id),
          });
        } else {
          if (tagType.value === "CUSTOMER") {
            await cubeDeviceCenterInternalService.deviceBindCustomerTags({
              deviceId: tagDeviceId.value,
              tagIds: values.map((v) => v.id),
            });
          } else {
            await cubeDeviceCenterInternalService.deviceBindSystemTags({
              deviceId: tagDeviceId.value,
              tagIds: values.map((v) => v.id),
            });
          }
        }

        message.success("操作成功");
        getTableData();
      } catch {
      } finally {
        AntModal.destroyAll();
      }
    };
    const { scrollY } = useTableScroll();
    const showBindModal = (): void => {
      bindModalVisible.value = true;
    };

    onMounted(() => {
      getTableData();
    });
    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <>
          <div>
            <DropDown
              disabled={selectedRowKeysData.value.length === 0}
              v-slots={{
                overlay: () => (
                  <Menu>
                    <MenuItem
                      onClick={() => {
                        batchBindTag("CUSTOMER");
                      }}
                    >
                      自定义标签
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        batchBindTag("SYSTEM");
                      }}
                    >
                      内置标签
                    </MenuItem>
                  </Menu>
                ),
              }}
            >
              <Button class="mr-16px" type="primary" disabled={selectedRowKeysData.value.length === 0}>
                批量关联标签
              </Button>
            </DropDown>
            <Button
              class="mr-16px"
              type="primary"
              disabled={selectedRowKeysData.value.length === 0}
              onClick={showBindModal}
              v-show={showBindButton.value}
            >
              批量关联空间坐标
            </Button>
            <Button
              class="mr-16px"
              type="primary"
              disabled={selectedRowKeysData.value.length === 0}
              loading={codeLoading.value}
              onClick={batchDownloadCode}
            >
              批量下载二维码
            </Button>
            <Button class="mr-16px" type="primary" onClick={importEvent}>
              批量导入
            </Button>
          </div>
        </>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 " }}>
            <FormItem label="所属产品" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <ProductSelect v-model:value={queryState.state.productId} />
            </FormItem>
            <FormItem label="所在区域" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <AreaTreeSelect v-model:value={queryState.state.lastAreaId as unknown as string} />
            </FormItem>
            <FormItem label="维护部门" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <DeptTreeSelect
                placeholder="请选择维护部门"
                v-model:value={queryState.state.departmentId}
                style={{ width: "180px" }}
                treeNodeFilterProp="name"
                showSearch
              />
            </FormItem>
            <FormItem label="产品品类" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <ProductIotCategoryTreeSelect v-model:value={queryState.state.prodCategoryId} />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Input
                v-model:value={queryState.state.keyword}
                placeholder="设备名称/编号"
                showCount={false}
                allowClear
                onChange={() => getTableData}
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
      ),
      "footer-page": (): JSX.Element => (
        <Page
          pageSizeOptions={["10", "20", "50", "100", "500"]}
          v-model:current={queryState.state.pageNumber}
          v-model:pageSize={queryState.state.pageSize}
          v-model:total={queryState.state.total}
          onPageChange={pageChange}
        />
      ),
      "footer-btn": (): JSX.Element => <span>已选：{selectedRowKeysData.value.length} 条数据</span>,
    };
    return (): JSX.Element => (
      <>
        <Layout title="设备台账" v-slots={layoutSlots} />
        <ImportModel ref={importModelRef} onEnter={getTableData} />
        <DeviceModalTable ref={deviceModalTableRef} v-model:value={deviceList.value} multiple onOk={handleDeviceModal} />
        <BindCustomTagModal
          ref={batchBindTagRef}
          multiple
          v-model:value={deviceTagList.value}
          onOk={handleTagModal}
          tagType={tagType.value}
        />
        <DeviceSpatialCoordinateBindingModal
          v-model:visible={bindModalVisible.value}
          selectedDevices={selectedRowsData.value}
          onShowBindButton={() => {
            showBindButton.value = true;
          }}
        />
      </>
    );
  },
});
