import { BooleanTag } from "../common/read-only/read-only";
import "../components.less";
import type { AlarmDeviceRef, AlarmDeviceType, DeviceTypeAlarm } from "./alarm-device-model";
import { EnergyModal } from "./energy-modal";
import { useAsyncEffect } from "@ghcloud/cube-iot-center-app/hooks/use-async-effect";
import { logger } from "@ghcloud/cube-iot-center-app/log";
import { cubeDeviceCenterService, cubeSecurityManagementService } from "@ghcloud/cube-iot-center-app/service";
import type { DeviceTagDetail } from "@ghcloud/cube-iot-center-service";
import type { DeviceProductVo } from "@ghcloud/cube-security-management-service";
import { DeviceService, type ApplicationDevice } from "@ghcloud/cube-service";
import { Button, Modal, Table, Cascader, Input, Form, Popconfirm, Pagination, message, Select, Checkbox, Switch } from "antd";
import FormItem from "antd/es/form/FormItem";
import type { ColumnsType } from "antd/es/table";
import { forwardRef, useImperativeHandle, useState } from "react";
let dataStateList: DeviceTypeAlarm[] = [];
export const AlarmDevice = forwardRef<
  AlarmDeviceRef,
  { info: DeviceTypeAlarm[]; enabled: boolean; application: string; readonly?: boolean }
>(({ info, enabled, application, readonly }, ref) => {
  useImperativeHandle(ref, () => ({
    // 暴露给父组件的方法
    getValue,
    openModal,
    handleDelDevice,
  }));
  const urlParams = new URLSearchParams(location.search);
  const isReadonly = readonly ?? urlParams.get("type") === "detail";
  const [changeData, setChangeData] = useState<boolean>(false);
  const [AlarmDevice, setAlarmDevice] = useState<AlarmDeviceType>({
    enabled: true,
    emergencyRuleConditions: [],
  });
  const getValue = (): AlarmDeviceType => AlarmDevice;
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [deviceProductList, setDeviceProductList] = useState<DeviceProductVo[]>([]);
  const [selectedCheckedDelKeys, setSelectedCheckedDelKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalDataSource, setModalDataSource] = useState<ApplicationDevice[]>([]);
  const [selectedRowKeysList, setSelectedRowKeysList] = useState<DeviceTypeAlarm[]>([]);
  const [areas, setAreas] = useState<{ name: string; id: string }[]>([]);
  const [tagCodes, setTagCodes] = useState<DeviceTagDetail[]>([]);

  const currentApplication: {
    code: string;
  } = JSON.parse(sessionStorage.getItem("GH-currentApplication") as unknown as string);
  const [deviceQuery, setDeviceQuery] = useState<{
    pageNumber: number;
    pageSize: number;
    total: number;
    applicationCode: string;
    areaIds: string;
    areaId: string;
    keyword: string;
    tagCodes: string[];
    importAll: boolean;
    productId: string | null;
  }>({
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    applicationCode: currentApplication.code === "EMERGENCY_CENTER" ? application : currentApplication.code,
    areaIds: "",
    areaId: "",
    keyword: "",
    tagCodes: [],
    importAll: false,
    productId: null,
  });
  const columns: ColumnsType<DeviceTypeAlarm> = [
    {
      title: "序号",
      dataIndex: "key",
      render: (text, record, index): JSX.Element => <span>{index + 1}</span>,
    },
    {
      title: "设备名称",
      dataIndex: "deviceName",
    },
    {
      title: "设备品类",
      dataIndex: "deviceProdCategoryName",
      render: (text: string, record: DeviceTypeAlarm): JSX.Element => (
        <span>
          {currentApplication.code !== "ENERGY_CONSUMPTION" ? text : (record.productCategoryName ?? record.deviceProdCategoryName)}
        </span>
      ),
    },
    {
      title: "产品名称",
      dataIndex: "deviceProdName",
    },
    {
      title: "设备区域",
      dataIndex: "deviceAreaName",
    },
    {
      title: "是否启用",
      dataIndex: "enabled",
      render: (text, record): JSX.Element => {
        if (isReadonly) {
          return <BooleanTag value={record.enabled ?? true} trueText="启用" falseText="禁用" />;
        }
        return (
          <Switch
            disabled={isReadonly}
            defaultChecked={record.enabled ?? true}
            checkedChildren="启用"
            unCheckedChildren="禁用"
            onChange={(checked: boolean) => {
              handleChangeDeviceEnabled(record, checked);
            }}
          />
        );
      },
    },
    {
      title: "操作",
      dataIndex: "key",
      render: (text, record): JSX.Element => {
        if (isReadonly) {
          return <span>-</span>;
        }
        return (
          <Popconfirm
            title="确认删除当前设备"
            description="删除后不可撤销"
            onConfirm={() => {
              deleteConfirm(record);
            }}
          >
            <Button type="link" style={{ color: "red" }}>
              删除
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  const modalColumns: ColumnsType<ApplicationDevice> = [
    {
      title: "序号",
      dataIndex: "key",
      render: (text, record, index): JSX.Element => <span>{index + 1}</span>,
    },
    {
      title: "设备名称",
      dataIndex: "deviceName",
    },
    {
      title: "设备品牌",
      dataIndex: "brandName",
    },
    {
      title: "产品名称",
      dataIndex: "deviceProdName",
    },
    {
      title: "区域",
      dataIndex: "areaName",
    },
  ];

  useAsyncEffect(async () => {
    DeviceService.getDeviceArea().then((res) => {
      setAreas(res);
    });
    cubeDeviceCenterService.getCustomerTagListAll({ status: 1 }).then((res) => {
      setTagCodes(res);
    });
    getProductList();
  }, []);
  const getProductList = async (): Promise<void> => {
    const result = await cubeSecurityManagementService.getDeviceProductList({
      applicationCode: currentApplication.code,
    });
    setDeviceProductList(result);
  };
  useAsyncEffect(async () => {
    if (info === undefined) {
      return;
    }
    setSelectedRowKeys(info.map((item) => item.deviceId));
    setSelectedRowKeysList(info);
    setAlarmDevice({
      ...AlarmDevice,
      enabled,
      emergencyRuleConditions: info,
    });
  }, [info]);
  useAsyncEffect(async () => {
    queryDevice();
  }, [changeData]);
  useAsyncEffect(async () => {
    queryDevice();
  }, [deviceQuery.areaId, deviceQuery.pageNumber, deviceQuery.pageSize, deviceQuery.applicationCode]);
  const handleDelDevice = (): void => {
    if (selectedCheckedDelKeys.length === 0) {
      message.error("请选择要删除的设备");
      return;
    }
    Modal.confirm({
      title: "删除设备",
      content: "删除后不可撤销",
      onOk: async () => {
        const list = selectedRowKeysList.filter((item) => !selectedCheckedDelKeys.includes(item.deviceId));
        setSelectedRowKeysList(list);
        setSelectedCheckedDelKeys([]);
        setAlarmDevice({
          ...AlarmDevice,
          emergencyRuleConditions: list,
        });
      },
    });
  };
  const handleChangeDeviceEnabled = (device: DeviceTypeAlarm, checked: boolean): void => {
    const updatedList = selectedRowKeysList.map((item) => (item.deviceId === device.deviceId ? { ...item, enabled: checked } : item));
    setSelectedRowKeysList(updatedList);
    setAlarmDevice({
      ...AlarmDevice,
      emergencyRuleConditions: updatedList,
    });
  };

  return (
    <>
      <Table
        size="small"
        columns={isReadonly ? columns.filter((item) => item.title !== "操作") : columns}
        rowKey="deviceId"
        {...(isReadonly
          ? {}
          : {
              rowSelection: {
                selectedRowKeys: selectedCheckedDelKeys,
                preserveSelectedRowKeys: true,
                onChange: (keys: React.Key[]) => {
                  setSelectedCheckedDelKeys(keys);
                },
              },
            })}
        dataSource={selectedRowKeysList}
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          pageSizeOptions: ["10", "50", "100", "1000"],
          defaultCurrent: 1,
          defaultPageSize: 10,
        }}
      />
      {currentApplication.code !== "ENERGY_CONSUMPTION" ? (
        <Modal
          width={1200}
          title="选择设备"
          open={isModalOpen}
          maskClosable
          cancelText="关闭"
          onCancel={() => {
            setIsModalOpen(false);
            setDeviceQuery({ ...deviceQuery, tagCodes: [] });
          }}
          onOk={okModal}
        >
          <Form layout="inline" style={{ marginBottom: "16px" }}>
            <FormItem label="区域">
              <Cascader
                value={deviceQuery.areaIds === "" || deviceQuery.areaIds === undefined ? [] : deviceQuery.areaIds.split(",")}
                style={{ width: 180 }}
                placeholder="请选择区域"
                options={areas}
                fieldNames={{ label: "name", value: "id" }}
                onChange={(e) => {
                  setDeviceQuery({
                    ...deviceQuery,
                    areaId: e ? (e.at(-1) as unknown as string) : "",
                    areaIds: e ? e.join(",") : "",
                  });
                }}
                changeOnSelect
              />
            </FormItem>
            <FormItem label="设备标签" style={{ marginBottom: "10px" }}>
              <Select
                style={{ width: 180 }}
                placeholder="请选择设备标签"
                options={tagCodes}
                mode="multiple"
                maxTagCount={1}
                fieldNames={{ label: "tagName", value: "tagCode" }}
                onChange={(e) => {
                  setDeviceQuery({
                    ...deviceQuery,
                    tagCodes: e,
                  });
                }}
                value={deviceQuery.tagCodes}
              />
            </FormItem>
            <FormItem label="所属产品" style={{ marginBottom: "10px" }}>
              <Select
                style={{ width: 180 }}
                placeholder="请选择所属产品"
                options={deviceProductList}
                allowClear
                maxTagCount={1}
                fieldNames={{ label: "deviceProdName", value: "deviceProdId" }}
                onChange={(value: string) => {
                  setDeviceQuery({
                    ...deviceQuery,
                    productId: value,
                  });
                }}
                value={deviceQuery.productId}
              />
            </FormItem>
            <FormItem>
              <Input
                value={deviceQuery.keyword}
                onChange={(e: { target: { value: string } }) => {
                  setDeviceQuery({ ...deviceQuery, keyword: e.target.value });
                }}
                placeholder="请输入设备名称"
              />
            </FormItem>
            <FormItem>
              <Button
                type="primary"
                onClick={() => {
                  queryDevice();
                }}
              >
                查询
              </Button>
              <Button
                onClick={() => {
                  reset();
                }}
                style={{ margin: "0 10px" }}
              >
                重置
              </Button>
              <Checkbox
                checked={deviceQuery.importAll}
                onChange={(e) => {
                  setDeviceQuery({ ...deviceQuery, importAll: e.target.checked });
                }}
              >
                勾选导入当前所有
              </Checkbox>
            </FormItem>
          </Form>
          <Table
            pagination={false}
            rowKey="deviceId"
            columns={modalColumns}
            dataSource={modalDataSource}
            loading={loading}
            size="middle"
            rowSelection={{
              selectedRowKeys,
              preserveSelectedRowKeys: true,
              onChange: (keys: React.Key[]) => {
                setSelectedRowKeys(keys);
              },
              onSelect: (record: ApplicationDevice, selected: boolean) => {
                const findIndex = dataStateList.findIndex((e) => e.deviceId === record.deviceId);
                if (selected && findIndex === -1) {
                  dataStateList = [
                    ...dataStateList,
                    {
                      ...record,
                      conditionType: "",
                      deviceProdCategoryCodeConcat: record.deviceProdCategoryCodeConcat,
                      deviceProdCategoryName: record.deviceProdCategoryName,
                      deviceProdId: record.deviceProdId,
                      deviceProdName: record.deviceProdName,
                      deviceId: record.deviceId,
                      deviceName: record.deviceName,
                      deviceAreaId: record.areaId,
                      deviceAreaName: record.areaName,
                      id: record.id,
                      enabled: true,
                    },
                  ];
                }
                if (!selected && findIndex !== -1) {
                  dataStateList.splice(findIndex, 1);
                }
              },
              onSelectAll: (selected) => {
                modalDataSource.forEach((record) => {
                  const findIndex = dataStateList.findIndex((e) => e.deviceId === (record as { id: string; deviceId: string }).deviceId);
                  if (findIndex === -1 && selected) {
                    dataStateList.push({
                      ...record,
                      conditionType: "",
                      deviceProdCategoryCodeConcat: record.deviceProdCategoryCodeConcat,
                      deviceProdCategoryName: record.deviceProdCategoryName,
                      deviceProdId: record.deviceProdId,
                      deviceProdName: record.deviceProdName,
                      deviceId: record.deviceId,
                      deviceName: record.deviceName,
                      deviceAreaId: record.areaId,
                      deviceAreaName: record.areaName,
                      id: record.id,
                      enabled: true,
                    });
                  }
                  if (findIndex !== -1 && !selected) {
                    dataStateList.splice(findIndex, 1);
                  }
                });
              },
            }}
          />
          <div style={{ display: "flex", flexDirection: "row-reverse", marginTop: "16px" }}>
            <Pagination
              onChange={(page, pageSize) => {
                setDeviceQuery({ ...deviceQuery, pageNumber: page, pageSize });
              }}
              current={deviceQuery.pageNumber}
              pageSize={deviceQuery.pageSize}
              showTotal={(total) => `共${total}条数据`}
              defaultCurrent={deviceQuery.pageNumber}
              total={deviceQuery.total}
              showSizeChanger
            />
          </div>
        </Modal>
      ) : (
        <EnergyModal
          showModel={isModalOpen}
          sendShowModel={sendShowModel}
          sendAlarmDevice={sendAlarmDevice}
          selectedList={selectedRowKeysList}
        />
      )}
    </>
  );
  function sendShowModel(args: boolean): void {
    setIsModalOpen(!args);
  }
  function sendAlarmDevice(args: AlarmDeviceType): void {
    setAlarmDevice({
      ...AlarmDevice,
      emergencyRuleConditions: [...args.emergencyRuleConditions],
    });
    setSelectedRowKeysList([...args.emergencyRuleConditions]);
  }
  async function okModal(): Promise<void> {
    const dataList = dataStateList.map((e) => e);
    if (deviceQuery.importAll) {
      const res = await queryDeviceAll();
      const addDataList = res.map((record) => ({
        ...record,
        conditionType: "",
        deviceProdCategoryCodeConcat: record.deviceProdCategoryCodeConcat,
        deviceProdCategoryName: record.deviceProdCategoryName,
        deviceProdId: record.deviceProdId,
        deviceProdName: record.deviceProdName,
        deviceId: record.deviceId,
        deviceName: record.deviceName,
        deviceAreaId: record.areaId,
        deviceAreaName: record.areaName,
        id: record.id,
      }));
      addDataList.forEach((e) => {
        const findIndex = dataList.findIndex((ele) => ele.deviceId === e.deviceId);
        if (findIndex === -1) {
          dataList.push(e);
        }
      });

      setSelectedRowKeys(dataList.map((item) => item.deviceId));
      setSelectedRowKeysList(dataList);
    }
    setIsModalOpen(false);
    setDeviceQuery({ ...deviceQuery, importAll: false, tagCodes: [] });
    setAlarmDevice({
      ...AlarmDevice,
      emergencyRuleConditions: dataList,
    });
    setSelectedRowKeysList(dataList);
  }
  async function openModal(): Promise<void> {
    if (currentApplication.code === "EMERGENCY_CENTER" && !application) {
      message.error("请选择所属子应用后添加设备");
      return;
    }
    setDeviceQuery({
      ...deviceQuery,
      areaIds: "",
      areaId: "",
      keyword: "",
      pageNumber: 1,
      pageSize: 10,
      tagCodes: [],
      applicationCode: currentApplication.code === "EMERGENCY_CENTER" ? application : currentApplication.code,
    });
    dataStateList = [...selectedRowKeysList];
    setSelectedRowKeys(selectedRowKeysList.map((item) => item.deviceId));
    setIsModalOpen(true);
    queryDevice();
  }
  async function queryDevice(params?: {
    pageNumber: number;
    pageSize: number;
    applicationCode: string;
    areaId: string;
    keyword: string;
  }): Promise<void> {
    if (!deviceQuery.applicationCode) {
      return;
    }
    try {
      setLoading(true);
      const data = await DeviceService.getApplicationDevice(params ?? { ...deviceQuery, productId: deviceQuery.productId ?? "" });
      setModalDataSource(data.records);
      setDeviceQuery({
        ...deviceQuery,
        total: data.total,
      });
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function queryDeviceAll(): Promise<ApplicationDevice[]> {
    setLoading(true);
    const pageSize = 500;
    const firstPageData = await DeviceService.getApplicationDevice({
      ...deviceQuery,
      pageSize,
      pageNumber: 1,
      productId: deviceQuery.productId ?? "",
    });
    const pageData: Record<string, ApplicationDevice[]> = {
      1: firstPageData.records,
    };
    if (firstPageData.pages > 1) {
      const queryTask = [];
      for (let index = 1; index <= firstPageData.pages; index++) {
        queryTask.push(
          DeviceService.getApplicationDevice({ ...deviceQuery, pageSize, pageNumber: index, productId: deviceQuery.productId ?? "" }).then(
            (res) => [(pageData[index] = res.records)],
          ),
        );
      }
      await Promise.all(queryTask);
    }
    const res = [];
    for (const key in pageData) {
      res.push(...pageData[key]);
    }
    setLoading(false);
    return res;
  }

  function reset(): void {
    setDeviceQuery({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      applicationCode: currentApplication.code === "EMERGENCY_CENTER" ? application : currentApplication.code,
      areaId: "",
      areaIds: "",
      keyword: "",
      productId: null,
      tagCodes: [],
      importAll: false,
    });
    setChangeData(!changeData);
  }
  function deleteConfirm(data: DeviceTypeAlarm): void {
    logger.info(data, selectedRowKeysList, "data");
    setAlarmDevice({
      ...AlarmDevice,
      emergencyRuleConditions: AlarmDevice.emergencyRuleConditions.filter((item) => item.id !== data.id),
    });
    setSelectedRowKeysList(
      selectedRowKeysList.filter((item) => {
        logger.info(item, "item");
        return item.id !== data.id;
      }),
    );
  }
});
