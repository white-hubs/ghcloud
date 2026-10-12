// oxlint-disable
import { VarSelect } from "./var-select/var-select";
import { fetchScanResultList, fetchScanVarResultList, saveScanResult, saveScanVarResult } from "@/api/scan";
import { TaskTypeEnum, type ScanCtlResult, type ScanVarResultList } from "@/typings/gateway";
import "@/styles/scan.less";
import { Button, Form, FormItem, Input, Modal, PopOver } from "@ghcloud/cube-ui";
import { Table, message } from "ant-design-vue/es";
import type { TableRowSelection } from "ant-design-vue/es/table/interface";
import { debounce } from "lodash";
import { defineComponent, ref, type PropType, reactive } from "vue";

interface Current {
  id: string;

  scanVarResultList: any[];
}
export const PickModal = defineComponent({
  props: {
    taskType: {
      type: Object as PropType<TaskTypeEnum>,
      default: TaskTypeEnum.SCAN_CONTROLLER_VAR,
    },
    taskId: {
      type: String,
      default: "",
    },
    channelId: {
      type: String,
      default: "",
    },
    gwId: {
      type: String,
      default: "",
    },
  },
  emits: ["ok", "cancel"],
  setup: (props, { emit, expose }) => {
    const modalVisible = ref(false);
    const loading = ref(false);
    const saveLoading = ref(false);
    const dataSource = ref<(ScanVarResultList | ScanCtlResult)[]>([
      // {
      //   "ctlCode": "5d10--42",
      //   "id": "1925741077512323072",
      //   "name": "理货机2-2号",
      //   "scanVarResultList": [
      //     {
      //       "controllerId": null,
      //       "dataType": "int",
      //       "devName": "理货机2-2号",
      //       "id": "1925741077512323073",
      //       "name": "在线状态",
      //       "propCode": "online_status",
      //       "propName": "在线状态",
      //       "readType": 0,
      //       "scanControllerId": "1925741077512323072",
      //       "varCode": "online_status"
      //     },
      //     {
      //       "controllerId": null,
      //       "dataType": "string",
      //       "devName": "理货机2-2号",
      //       "id": "1925741077512323074",
      //       "name": "三方设备ID",
      //       "propCode": "raw_device_id",
      //       "propName": "三方设备ID",
      //       "readType": 0,
      //       "scanControllerId": "1925741077512323072",
      //       "varCode": "raw_device_id"
      //     },
      //     {
      //       "controllerId": null,
      //       "dataType": "string",
      //       "devName": "理货机2-2号",
      //       "id": "1925741077512323075",
      //       "name": "设备类型",
      //       "propCode": "device_type_tips",
      //       "propName": "设备类型",
      //       "readType": 0,
      //       "scanControllerId": "1925741077512323072",
      //       "varCode": "device_type_tips"
      //     }
      //   ]
      // },
      // {
      //   "ctlCode": "5d10--36",
      //   "id": "1925741077629763584",
      //   "name": "研发中心2号265VBRN",
      //   "scanVarResultList": [
      //     {
      //       "controllerId": null,
      //       "dataType": "int",
      //       "devName": "研发中心2号265VBRN",
      //       "id": "1925741077629763585",
      //       "name": "在线状态",
      //       "propCode": "online_status",
      //       "propName": "在线状态",
      //       "readType": 0,
      //       "scanControllerId": "1925741077629763584",
      //       "varCode": "online_status"
      //     },
      //     {
      //       "controllerId": null,
      //       "dataType": "string",
      //       "devName": "研发中心2号265VBRN",
      //       "id": "1925741077629763586",
      //       "name": "三方设备ID",
      //       "propCode": "raw_device_id",
      //       "propName": "三方设备ID",
      //       "readType": 0,
      //       "scanControllerId": "1925741077629763584",
      //       "varCode": "raw_device_id"
      //     },
      //     {
      //       "controllerId": null,
      //       "dataType": "string",
      //       "devName": "研发中心2号265VBRN",
      //       "id": "1925741077629763587",
      //       "name": "设备类型",
      //       "propCode": "device_type_tips",
      //       "propName": "设备类型",
      //       "readType": 0,
      //       "scanControllerId": "1925741077629763584",
      //       "varCode": "device_type_tips"
      //     },
      //     {
      //       "controllerId": null,
      //       "dataType": "string",
      //       "devName": "研发中心2号265VBRN",
      //       "id": "1925741077629763588",
      //       "name": "设备IP",
      //       "propCode": "device_ip_tips",
      //       "propName": "设备IP",
      //       "readType": 0,
      //       "scanControllerId": "1925741077629763584",
      //       "varCode": "device_ip_tips"
      //     }
      //   ]
      // }
    ]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const selectedRowKeysData = ref<{ id: string; scanControllerId: string }[]>([]);

    // 检查父级是否应该被选中（所有子项都被选中时）
    const isParentChecked = (record: any): boolean => {
      if (!record.scanVarResultList) {
        return false;
      }
      const childIds = record.scanVarResultList.map((child: any) => child.id);
      const selectedChildIds = selectedRowKeysData.value.filter((item) => item.scanControllerId === record.id).map((item) => item.id);
      return childIds.length > 0 && childIds.every((id) => selectedChildIds.includes(id));
    };

    const rowSelection = ref({
      onChange: (selectedRowKeys: string[], selectedRows: any[]) => {
        // 判断是否为父级表格的选择
        const isParentSelection = selectedRows.some((row) => row.scanVarResultList);

        if (isParentSelection) {
          // 处理父级选择
          const allSelectedRows: { id: string; scanControllerId: string }[] = [];

          // 获取已选中的其他父级的子项
          const otherSelectedRows = selectedRowKeysData.value.filter(
            (item) => !selectedRows.some((parent) => parent.id === item.scanControllerId),
          );

          // 添加新选中父级的所有子项
          selectedRows.forEach((parent) => {
            if (parent.scanVarResultList) {
              allSelectedRows.push(
                ...parent.scanVarResultList.map((child: any) => ({
                  id: child.id,
                  scanControllerId: parent.id,
                })),
              );
            }
          });

          selectedRowKeysData.value = [...otherSelectedRows, ...allSelectedRows];
        }
      },
      onSelect: (record: any, selected: boolean) => {
        if (record.scanVarResultList) {
          // 父级选择处理
          const otherSelectedRows = selectedRowKeysData.value.filter((item) => item.scanControllerId !== record.id);

          if (selected) {
            // 选中父级时，添加所有子项
            const childRows = record.scanVarResultList.map((child: any) => ({
              id: child.id,
              scanControllerId: record.id,
            }));
            selectedRowKeysData.value = [...otherSelectedRows, ...childRows];
          } else {
            // 取消选中父级时，移除所有子项
            selectedRowKeysData.value = otherSelectedRows;
          }
        }
      },
      onSelectAll: (selected: boolean) => {
        if (selected) {
          // 全选时，选中所有父级和子级
          const allRows: { id: string; scanControllerId: string }[] = [];
          dataSource.value.forEach((parent) => {
            if (parent.scanVarResultList) {
              // 添加所有子项
              allRows.push(
                ...parent.scanVarResultList.map((child) => ({
                  id: child.id,
                  scanControllerId: parent.id,
                })),
              );
            }
          });
          selectedRowKeysData.value = allRows;
        } else {
          // 取消全选时，清空所有选中项
          selectedRowKeysData.value = [];
        }
      },
      getCheckboxProps: (record: any) => ({
        disabled: false,
        checked: record.scanVarResultList ? isParentChecked(record) : selectedRowKeysData.value.some((item) => item.id === record.id),
      }),
    });

    // 子表格的选择配置
    const getChildTableRowSelection = (parentRecord: any): TableRowSelection => ({
      onChange: (selectedRowKeys: string[], selectedRows: any[]) => {
        // 获取不属于当前父级的已选项
        const otherSelectedRows = selectedRowKeysData.value.filter((item) => item.scanControllerId !== parentRecord.id);

        // 添加当前选中的子项
        const currentSelectedRows = selectedRows.map((row) => ({
          id: row.id,
          scanControllerId: parentRecord.id,
        }));

        selectedRowKeysData.value = [...otherSelectedRows, ...currentSelectedRows];
      },
      selectedRowKeys: selectedRowKeysData.value.filter((item) => item.scanControllerId === parentRecord.id).map((item) => item.id),
      onSelectAll: (selected: boolean) => {
        // 获取不属于当前父级的已选项
        const otherSelectedRows = selectedRowKeysData.value.filter((item) => item.scanControllerId !== parentRecord.id);

        if (selected) {
          // 选中所有子项
          const allChildRows = parentRecord.scanVarResultList.map((child: any) => ({
            id: child.id,
            scanControllerId: parentRecord.id,
          }));
          selectedRowKeysData.value = [...otherSelectedRows, ...allChildRows];
        } else {
          // 取消选中所有子项
          selectedRowKeysData.value = otherSelectedRows;
        }
      },
    });
    const formState = reactive<{
      ctlKeywords: string;
      varKeywords: string;
      onlyVarCodes: string[] | undefined;
    }>({
      ctlKeywords: "",
      varKeywords: "",
      onlyVarCodes: undefined,
    });
    const queryForm = (): void => {
      pagination.value.pageNumber = 1;
      getTableData();
    };
    const reset = (): void => {
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined;
      }
      queryForm();
    };
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        dataSource.value = [];
        pagination.value.total = 0;
        const params = {
          ctlKeywords: formState.ctlKeywords?.trim(),
          varKeywords: formState.varKeywords?.trim(),
          onlyVarCodes: formState.onlyVarCodes ?? [],
          taskId: props.taskId,
          channelId: props.channelId,
        };
        if (props.taskType === TaskTypeEnum.SCAN_CONTROLLER_VAR) {
          const { data } = await fetchScanResultList(params);
          // 修改这里，直接使用 scanCtlResults，不需要取 scanVarResultList
          dataSource.value = data?.scanCtlResults ?? [];
        }
        if (props.taskType === TaskTypeEnum.SCAN_VAR) {
          const { data } = await fetchScanVarResultList(params);
          dataSource.value = data?.scanVarResultList ?? [];
        }
      } catch {
      } finally {
        loading.value = false;
      }
    };
    const openModal = (id?: string): void => {
      modalVisible.value = true;
      queryForm();
    };
    const cancel = (): void => {
      modalVisible.value = false;
      emit("cancel");
    };
    const ok = debounce(async (): Promise<void> => {
      try {
        saveLoading.value = true;
        if (props.taskType === TaskTypeEnum.SCAN_CONTROLLER_VAR) {
          const list = selectedRowKeysData.value.map((e) => ({
            scanControllerId: e.scanControllerId,
            scanVarId: e.id,
          }));
          await saveScanResult({
            channelId: props.channelId,
            ctlAndVarParamList: list,
          });
        }
        if (props.taskType === TaskTypeEnum.SCAN_VAR) {
          await saveScanVarResult({
            controllerId: props.channelId,
            gatewayId: props.gwId,
            varParamList: selectedRowKeysData.value.map((res) => res.id),
          });
        }
        message.success("保存成功");
        modalVisible.value = false;
        // Emit('ok')
        emit("cancel");
      } catch {
      } finally {
        saveLoading.value = false;
        emit("cancel");
      }
    }, 500);
    expose({
      openModal,
    });
    const columns = [
      {
        title: "变量名称",
        dataIndex: "name",
        ellipsis: true,
        width: 220,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "变量标识",
        dataIndex: "varCode",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "设备组名称",
        dataIndex: "devName",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "设备属性",
        dataIndex: "propName",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "属性标识",
        dataIndex: "propCode",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
    ];
    const columnsVar = [
      {
        title: "变量名称",
        dataIndex: "name",
        width: 220,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "变量标识",
        dataIndex: "varCode",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "数据类型",
        dataIndex: "dataType",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "读写类型",
        dataIndex: "readType",
        customRender: ({ text }: { text: number }): JSX.Element => (
          <PopOver content={text === 0 ? "只读" : "读写" || "--"}>{text === 0 ? "只读" : "读写" || "--"}</PopOver>
        ),
      },
    ];
    const mergedColumns =
      props.taskType === TaskTypeEnum.SCAN_CONTROLLER_VAR
        ? [
            {
              title: "控制器名称",
              dataIndex: "name",
              width: 240,
              ellipsis: true,
              customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
            },
            {
              title: "控制器标识",
              dataIndex: "ctlCode",
              customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
            },
          ]
        : columnsVar;

    const modalFooterSlots = {
      footer: (): JSX.Element => (
        <>
          <Button key="submit" disabled={dataSource.value.length === 0} loading={saveLoading.value} type="primary" onClick={ok}>
            保存
          </Button>
        </>
      ),
    };
    return (): JSX.Element => (
      <Modal
        visible={modalVisible.value}
        title="拣选设备"
        width="80vw"
        confirmLoading={loading.value}
        destroyOnClose
        onCancel={cancel}
        onOk={ok}
        v-slots={modalFooterSlots}
        maskClosable={false}
      >
        <div>
          <Form layout="inline" style={{ margin: "10px 0 " }}>
            <FormItem label="控制器" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Input v-model:value={formState.ctlKeywords} placeholder="控制器名称/标识" showCount={false} allowClear maxlength={100} />
            </FormItem>
            <FormItem label="变量" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Input v-model:value={formState.varKeywords} placeholder="变量名称/标识" showCount={false} allowClear maxlength={100} />
            </FormItem>
            <FormItem label="过滤指定变量" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <VarSelect v-model:value={formState.onlyVarCodes} taskId={props.taskId} />
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
          <div class="bottom">
            <Table
              columns={mergedColumns}
              rowKey="id"
              size="small"
              dataSource={dataSource.value}
              scroll={{ y: 600 }}
              pagination
              rowSelection={{
                type: "checkbox",
                ...rowSelection.value,
              }}
              rowExpandable={() => props.taskType === TaskTypeEnum.SCAN_CONTROLLER_VAR}
              v-slots={{
                expandedRowRender: ({ record }) =>
                  props.taskType === TaskTypeEnum.SCAN_CONTROLLER_VAR ? (
                    <Table
                      columns={columns}
                      dataSource={record.scanVarResultList}
                      pagination={false}
                      rowKey="id"
                      size="small"
                      rowSelection={getChildTableRowSelection(record)}
                      style={{ margin: "0 0 0 30px" }}
                    />
                  ) : (
                    ""
                  ),
              }}
            />
          </div>
        </div>
      </Modal>
    );
  },
});
