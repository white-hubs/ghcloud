import { Form, Row, Col, Cascader, Select, Input, Button, Modal, Table, message, Pagination } from "antd";
import FormItem from "antd/es/form/FormItem";
import Search from "antd/es/input/Search";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useImmer } from "use-immer";

import { useAsyncEffect } from "@ghcloud/cube-iot-center-app/hooks/use-async-effect";
import { cubeDeviceCenterService } from "@ghcloud/cube-iot-center-app/service";
import { actionTypes } from "@ghcloud/cube-iot-center-app/utils/enum";
import type { DeviceInstancePageParamsAll, DeviceTagDetail } from "@ghcloud/cube-iot-center-service/src/types";
import { DeviceService, type DeviceInstance } from "@ghcloud/cube-service";

import type { AlarmRulesDeviceType } from "../alarm-rule/alarm-rule-model";
import type { AlarmIotType } from "./alarm-iot-modal";
export const AlarmIotRule = (props: {
  deleteCurrent: () => void;
  deviceIndex: number;
  groupItem: AlarmIotType;
  setInfo: (e: AlarmIotType, index: number) => void;
}) => {
  const urlParams = new URLSearchParams(location.search);
  const { groupItem, setInfo, deviceIndex, deleteCurrent } = props;
  const [form] = Form.useForm();
  const [deviceQuery, setDeviceQuery] = useImmer<DeviceInstancePageParamsAll>({
    categoryCode: "",
    lastAreaId: undefined,
    keyword: "",
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    productId: "",
    tagCodes: [],
  });
  const [isOpen, setIsOpen] = useImmer<boolean>(false);
  useAsyncEffect(async () => {
    // const { data } = await DeviceService.getDeviceType()
    const data = await cubeDeviceCenterService.getIotProductCategoryTree();
    setDeviceInfo((draft) => {
      draft.deviceType = data;
    });
  }, []);
  useAsyncEffect(async () => {
    if (!isOpen) return;
    getList();
  }, [isOpen, deviceQuery.tagCodes, deviceQuery.pageNumber, deviceQuery.pageSize]);

  const columns: ColumnsType<any> = [
    {
      dataIndex: "code",
      title: "设备编码",
    },
    {
      dataIndex: "name",
      title: "设备名称",
    },
    {
      dataIndex: "brandName",
      title: "设备品牌",
    },
    {
      dataIndex: "pathName",
      title: "区域",
    },
  ];
  const [tagCodes, setTagCodes] = useImmer<DeviceTagDetail[]>([]);
  const [areas, setAreas] = useImmer<{ name: string; id: string }[]>([]);
  const [deviceList, setDeviceList] = useImmer<DeviceInstance[]>([]);
  const [selectedList, setSelectedList] = useImmer<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useImmer<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [deviceInfo, setDeviceInfo] = useImmer<AlarmRulesDeviceType>({
    deviceType: [],
    deviceModel: [],
    devicePropCode: [],
    deviceEventCode: [],
    conditionType: "CUSTOM_RULE_CONDITION",
    propCode: [],
  });
  const [alarmIot, setAlarmIot] = useImmer<AlarmIotType>(groupItem);
  useAsyncEffect(async () => {
    setInfo(alarmIot, deviceIndex);
  }, [alarmIot]);
  // 编辑回填：仅初始化拉一次产品列表 / 指令，避免与 getModel 重复请求
  useAsyncEffect(async () => {
    if (groupItem.deviceProdCategoryCode) {
      const categoryCode = groupItem.deviceProdCategoryCode.split("-").pop() || groupItem.deviceProdCategoryCode;
      try {
        const data = await cubeDeviceCenterService.getProductModel(categoryCode);
        setDeviceInfo((draft) => {
          draft.deviceModel = data;
        });
      } catch (error) {
        message.error((error as { message: string }).message);
      }
    }
    if (groupItem.deviceProdId) {
      getConditionOptions(groupItem.deviceProdId);
    }
  }, []);
  return (
    <div>
      <div style={{ display: "flex", marginTop: "10px", gap: "10px" }}>
        <div>
          <Form form={form}>
            <Row gutter={16}>
              <Col span={4}>
                <FormItem>
                  <Cascader
                    fieldNames={{
                      label: "categoryName",
                      value: "categoryCode",
                    }}
                    style={{ width: "200px" }}
                    value={
                      alarmIot.deviceProdCategoryCode === "" || alarmIot.deviceProdCategoryCode === undefined
                        ? []
                        : alarmIot.deviceProdCategoryCode.split("-")
                    }
                    onChange={(value) => {
                      getModel(value);
                    }}
                    disabled={urlParams.get("type") === "detail"}
                    options={deviceInfo.deviceType}
                    changeOnSelect
                    placeholder="请选择产品品类"
                  />

                  {/* <Select
                          disabled={urlParams.get('type') === 'detail'}
                          style={{ width: '200px' }}
                          value={alarmIot.actionConfig[index].deviceProdCategoryCode}
                          onChange={(value, label) => { getModel(value, label, index) }}
                          placeholder='请选择设备品类' options={deviceInfo.deviceType} fieldNames={{
                            label: 'name',
                            value: 'id'
                          }}
                        /> */}
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem>
                  <Select
                    disabled={urlParams.get("type") === "detail"}
                    style={{ width: "200px" }}
                    value={alarmIot.deviceProdId ?? undefined}
                    onChange={(value) => {
                      getCondition(value);
                    }}
                    placeholder="请选择设备产品"
                    options={deviceInfo.deviceModel}
                    fieldNames={{
                      label: "name",
                      value: "id",
                    }}
                  />
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem>
                  <Search
                    disabled={urlParams.get("type") === "detail"}
                    style={{ width: "200px" }}
                    value={alarmIot.name}
                    placeholder="请选择设备"
                    onSearch={() => {
                      onSearch();
                    }}
                  />
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem>
                  <Select
                    disabled={urlParams.get("type") === "detail"}
                    value={alarmIot.propCode}
                    style={{ width: "200px" }}
                    onChange={(e) => {
                      setAlarmIot((draft) => {
                        const name = deviceInfo.devicePropCode.find((res) => res.propCode === e)?.propName;
                        draft.propName = name as unknown as string;
                        draft.propCode = e;
                      });
                    }}
                    placeholder="请选择设备指令"
                    options={deviceInfo.devicePropCode}
                    fieldNames={{
                      label: "propName",
                      value: "propCode",
                    }}
                  />
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem>
                  <Input
                    disabled={urlParams.get("type") === "detail"}
                    style={{ width: "200px" }}
                    value={alarmIot.propValue}
                    onChange={(e: { target: { value: string } }) => {
                      setAlarmIot((draft) => {
                        draft.propValue = e.target.value;
                      });
                    }}
                    placeholder="属性设定具体数值"
                  />
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem>
                  <Select
                    disabled={urlParams.get("type") === "detail"}
                    style={{ width: "200px" }}
                    value={alarmIot.executeMode}
                    options={actionTypes}
                    onChange={(e) => {
                      setAlarmIot((draft) => {
                        draft.executeMode = e;
                      });
                    }}
                  />
                </FormItem>
              </Col>
            </Row>
          </Form>
        </div>
        <div>
          {urlParams.get("type") !== "detail" && (
            <Button
              onClick={() => {
                deleteCurrent();
              }}
              type="link"
              danger
            >
              删除
            </Button>
          )}
          <Modal
            onOk={() => {
              ModalOk();
            }}
            title="选择设备"
            open={isOpen}
            width={900}
            maskClosable
            onCancel={() => {
              setIsOpen(false);
              setDeviceQuery({ ...deviceQuery, tagCodes: [] });
            }}
          >
            <Form layout="inline" style={{ marginBottom: "16px" }}>
              <FormItem label="区域:">
                <Select
                  style={{ width: "200px" }}
                  placeholder="请选择区域"
                  onChange={(value) => {
                    setDeviceQuery((e) => {
                      e.lastAreaId = value;
                    });
                  }}
                  value={deviceQuery.lastAreaId}
                  options={areas}
                  fieldNames={{ label: "name", value: "id" }}
                />
              </FormItem>
              <FormItem label="设备标签" style={{ marginBottom: "10px" }}>
                <Select
                  style={{ width: "200px" }}
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
              <FormItem>
                <Input
                  placeholder="输入搜索内容"
                  style={{ width: "200px" }}
                  value={deviceQuery.keyword}
                  onChange={(value: { target: { value: string } }) => {
                    setDeviceQuery((e) => {
                      e.keyword = value.target.value;
                    });
                  }}
                />
              </FormItem>

              <FormItem>
                <Button
                  style={{ marginRight: "20px" }}
                  type="primary"
                  onClick={() => {
                    getList();
                  }}
                >
                  查询
                </Button>
                <Button
                  onClick={() => {
                    const resetQuery: DeviceInstancePageParamsAll = {
                      categoryCode: alarmIot.deviceProdCategoryCode || "",
                      lastAreaId: undefined,
                      keyword: "",
                      pageNumber: 1,
                      pageSize: 10,
                      total: 0,
                      productId: alarmIot.deviceProdId || "",
                      tagCodes: [],
                    };
                    setDeviceQuery(resetQuery);
                    getList(resetQuery);
                  }}
                >
                  重置
                </Button>
              </FormItem>
            </Form>
            <Table
              pagination={false}
              loading={loading}
              rowKey="id"
              columns={columns}
              dataSource={deviceList}
              rowSelection={{
                type: "radio",
                selectedRowKeys: selectedList,
                onChange: (selectedRowKeys: React.Key[], selectedRows: DeviceInstance[]) => {
                  setSelectedRows(selectedRows);
                  setSelectedList(selectedRowKeys);
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
        </div>
      </div>
    </div>
  );
  async function getList(query: DeviceInstancePageParamsAll = deviceQuery): Promise<void> {
    try {
      setLoading(true);

      const data = await cubeDeviceCenterService.getDeviceInstancePageAll({ ...query });
      // const { data } = await DeviceService.getDeviceInstance(deviceQuery)
      setDeviceQuery({
        ...query,
        total: data.total,
      });
      const info: any = data.records.map((item: any) => {
        return {
          ...item.productInfo,
          ...item.productCategory,
          ...item.area,
          ...item,
        };
      });

      setDeviceList(info as DeviceInstance[]);
    } catch {
    } finally {
      setLoading(false);
    }
  }
  async function onSearch(): Promise<void> {
    cubeDeviceCenterService.getCustomerTagListAll({ status: 1 }).then((res) => {
      setTagCodes(res);
    });
    setDeviceQuery({
      ...deviceQuery,
      categoryCode: alarmIot.deviceProdCategoryCode || "",
      productId: alarmIot.deviceProdId || "",
      keyword: "",
      lastAreaId: undefined,
      pageNumber: 1,
      tagCodes: [],
    });
    const Area = await DeviceService.getArea();
    setAreas(Area);
    // const { data } = await DeviceService.getDeviceInstance(deviceQuery)
    setIsOpen(true);
  }

  async function getModel(value: any): Promise<void> {
    const info = value ? (value as string[])[(value as string[]).length - 1] : "";
    getModelOptions(info);

    setDeviceQuery((e) => {
      e.categoryCode = value ? (value as string[]).join("-") : "";
      e.productId = "";
    });
    setAlarmIot((draft) => {
      draft.deviceProdCategoryCode = value ? (value as string[]).join("-") : "";
      draft.deviceProdId = undefined;
    });
  }
  async function getModelOptions(value: string): Promise<void> {
    // const { data } = await DeviceService.getDeviceModel(value)
    if (value === "") {
      setDeviceInfo((draft) => {
        draft.deviceModel = [];
      });
      return;
    }
    const data = await cubeDeviceCenterService.getProductModel(value);
    setDeviceInfo((draft) => {
      draft.deviceModel = data;
    });
  }

  async function getConditionOptions(value: string | null): Promise<void> {
    if (!value) return;
    const data = await DeviceService.getDeviceCondition({
      prodIds: value,
      withPropertySpec: true,
    });
    if (data.length > 0) {
      setDeviceInfo((draft) => {
        draft.devicePropCode = data[0].productPropVoList.filter((item) => item.dataWrite !== 0);
        draft.deviceEventCode = data[0].productEventVoList;
      });
    }
  }
  async function getCondition(value: string | undefined): Promise<void> {
    setDeviceQuery((e) => {
      e.productId = value || "";
    });
    setAlarmIot((draft) => {
      draft.deviceProdId = value;
    });
    if (value) {
      getConditionOptions(value);
    } else {
      setDeviceInfo((draft) => {
        draft.devicePropCode = [];
        draft.deviceEventCode = [];
      });
    }
  }
  async function ModalOk(): Promise<void> {
    if (selectedList[0]) {
      getConditionOptions(selectedRows[0].productInfo.id);
      setAlarmIot((e) => {
        e.deviceProdCategoryCode = selectedRows[0].productCategory.pathCode;
        e.deviceProdId = selectedRows[0].productInfo.id;
        e.code = selectedRows[0].code;
        e.name = selectedRows[0].name;
        e.id = selectedList[0];
      });
    }

    setIsOpen(false);
    setDeviceQuery({ ...deviceQuery, tagCodes: [] });
  }
};
