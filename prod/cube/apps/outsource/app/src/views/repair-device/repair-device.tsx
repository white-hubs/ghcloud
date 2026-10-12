import { defineComponent, onMounted, reactive } from "vue";
import { Layout } from '@/components/layout/layout';
import { usePageName } from '@ghcloud/cube-utils';
import { Button, PopConfirm, message, Page, FormItem, Form, Input } from '@ghcloud/cube-ui';
import { AliasTable } from '@ghcloud/generic-component';
import { RepairDeviceAssociationModal } from "./repair-device-associated/repair-device-associated";
import { cubeOutsourceService } from "../../api/service";
import type { RepairDeviceModel } from '@ghcloud/cube-outsource-service';
import type { DeviceInstancePage } from '@ghcloud/cube-iot-center-service'

// 定义状态接口
interface DeviceState {
  dataSource: RepairDeviceModel[];
  loading: boolean;
  searchState: {
    keyword: string;
  };
  modaVisible: boolean;
  page: {
    pageSize: number;
    pageNumber: number;
    total: number;
  };
}

export const RepairDevice = defineComponent({
  setup () {
    const { pageTitle } = usePageName();

    const state = reactive<DeviceState>({
      dataSource: [],
      loading: false,
      searchState: {
        keyword: "",
      },
      modaVisible: false,
      page: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
      }
    });

    const columns = [
      {
        dataIndex: "deviceCode",
        title: "设备编码",
      },
      {
        dataIndex: "deviceName",
        title: "设备名称",
      },
      {
        dataIndex: "deviceCategory",
        title: "产品品类",
      },
      {
        dataIndex: "deviceBrand",
        title: "设备品牌",
      },
      {
        dataIndex: "areaName",
        title: "所属区域",
      },
      {
        dataIndex: "action",
        title: "操作",
        customRender: ({ record }: { record: RepairDeviceModel; }): JSX.Element => {
          return (
            <PopConfirm
              title="是否移除当前选中？"
              cancelText="取消"
              okText="确定"
              onConfirm={() => deleteRecord(record)}
            >
              <Button type="link" danger>移除</Button>
            </PopConfirm>
          );
        },
      },
    ];

    onMounted(() => {
      getTableList()
    })

    const getTableList = async (): Promise<void> => {
      try {
        state.loading = true
        const result = await cubeOutsourceService.repairDevice({
          ...state.searchState,
          pageNumber: state.page.pageNumber,
          pageSize: state.page.pageSize
        })
        state.dataSource = result.records
        state.page.total = result.total
      } catch {
        message.error('请求失败')
      } finally {
        state.loading = false
      }
    }

    const pageChange = (page: number, pageSize: number): void => {
      state.page.pageNumber = page
      state.page.pageSize = pageSize
      getTableList()
    }

    const handleSearch = (): void => {
      state.page.pageNumber = 1
      getTableList()
    }
    const handleReset = (): void => {
      state.page.pageNumber = 1
      state.searchState = { keyword: '' }
      getTableList()
    }

    const addDevice = (): void => {
      state.modaVisible = true;
    };

    const closeModal = async (data: DeviceInstancePage[], selectAll: boolean, open: boolean): Promise<void> => {
      if (open) {
        state.modaVisible = false;
        return;
      }
      if (data.length === 0) {
        state.modaVisible = false;
        return;
      }
      const deviceInfo = data
        .map((item) => item.id)
        .filter((id) => id !== null && id !== undefined)

      await cubeOutsourceService.importDevice({ deviceInstanceIds: deviceInfo })
      state.modaVisible = false
      getTableList()
    };

    const deleteRecord = (record: RepairDeviceModel): void => {
      cubeOutsourceService.repairDeviceRemove(record.deviceId).then(() => {
        message.success("操作成功")
        getTableList()
      });
    };

    const exportAll = (data: { selectedRowKeys: string[]; }): void => {
      cubeOutsourceService.repairDeviceBatchRemove({ deviceInstanceIds: data.selectedRowKeys })
        .then(() => {
          message.success("操作成功")
          getTableList()
        });
    };

    const renderBatchRemoveButton = (record: { selectedRowKeys: string[]; }): JSX.Element => {
      return (
        <PopConfirm
          title='是否确认删除?'
          ok-text='确定'
          cancel-text='取消'
          onConfirm={async () => exportAll(record)}
        >
          <Button type='link' danger style={{ paddingRight: 0 }}>批量移除</Button>
        </PopConfirm>
      );
    };

    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <Button type="primary" onClick={addDevice}>关联设备</Button>
        );
      },
      'layout-content': (): JSX.Element => {
        return (
          <div>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input v-model:value={state.searchState.keyword} placeholder='请输入设备编码/名称' showCount={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={handleSearch}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={handleReset}>重置</Button>
              </FormItem>
            </Form>
            <AliasTable
              rowKey="deviceId"
              rowSelection={true}
              dataSource={state.dataSource}
              columns={columns}
              loading={state.loading}
              applicationCode="OUTSOURCE_REPAIR"
              tableCode="OUTSOURCE_REPAIR_DEVICE"
              v-slots={{
                table: ({ record }: { record: { selectedRowKeys: string[]; }; }) => renderBatchRemoveButton(record)
              }}
            />
            <RepairDeviceAssociationModal
              visible={state.modaVisible}
              title="设备"
              rowKey="id"
              onClose={closeModal}
            />
          </div>
        );
      },
      'footer-page': (): JSX.Element => {
        return (
          <Page
            v-show={state.page.total > 0}
            v-model:current={state.page.pageNumber}
            v-model:pageSize={state.page.pageSize}
            v-model:total={state.page.total}
            onPageChange={pageChange}
          />
        )
      }
    };

    return (): JSX.Element => (
      <Layout v-slots={layoutSlots} title={pageTitle} />
    );
  }
});