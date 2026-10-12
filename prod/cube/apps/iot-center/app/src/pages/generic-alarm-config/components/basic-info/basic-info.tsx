import type { AllInfo, BasicData, BasicInfoRef } from "./basic-info.model";
import { useAsyncEffect } from "@ghcloud/cube-iot-center-app/hooks/use-async-effect";
import { notifyCommandDispatchOption } from "@ghcloud/cube-iot-center-app/utils/enum";
import { AlarmService, EmergencyService, type BasicInfoData, type EmergencyEventType } from "@ghcloud/cube-service";
import { OuaaService } from "@ghcloud/cube-service";
import { Col, Form, Input, Row, Select, InputNumber, Switch } from "antd";
import FormItem from "antd/es/form/FormItem";
import { useState, useImperativeHandle, forwardRef } from "react";
import "../components.less";
import { BooleanTag, getOptionLabel, ReadonlyDescriptions } from "../common/read-only/read-only";
import { useImmer } from "use-immer";
interface TerminalsData {
  id: boolean;
  productId: string;
  code: string;
  name: string;
  remark: string;
  enabled: boolean;
}
export const BasicInfo = forwardRef<BasicInfoRef, { info: AllInfo; getInfo: (e: string) => void; readonly?: boolean }>((props, ref) => {
  const [form] = Form.useForm();
  const urlParams = new URLSearchParams(location.search);
  const isReadonly = props.readonly ?? urlParams.get("type") === "detail";
  const currentApplication: {
    code: string;
  } = JSON.parse(sessionStorage.getItem("GH-currentApplication") as unknown as string);
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };
  const [state, setState] = useState<BasicInfoData>({
    alarmLevelData: [],
    emergencyEventTypes: [],
    emergencyTypes: [],
    openCommandDispatch: false,
  });

  const [basicInfo, setBasicInfo] = useImmer<BasicData>({
    emergencyEventTypeId: "",
    emergencyEventTypeName: "",
    estimatedHandlerTimeName: "",
    name: "",
    alarmLevelName: "",
    alarmLevelId: "",
    notifyCommandDispatch: false,
    emergencyEventTypeCode: undefined,
    repeatTime: 0,
    estimatedHandlerTime: 0,
    remark: "",
    estimatedHandlerUnit: "MINUTE",
    applicationCode: undefined,
    turnWarningSound: false,
  });

  useAsyncEffect(async () => {
    if (props.info === undefined) return;
    setBasicInfo(props.info);
    form.setFieldsValue(props.info);
  }, [props.info]);
  useAsyncEffect(async () => {
    const currentApplication: {
      code: string;
    } = JSON.parse(sessionStorage.getItem("GH-currentApplication") as unknown as string);
    setBasicInfo((e) => {
      e.applicationCode = props.info.applicationCode || currentApplication.code;
    });
    const data = await AlarmService.getAlarmLevels();
    const eventEmergency = await EmergencyService.getEventType();
    const emergency = await EmergencyService.getTypes();
    const terminals = await OuaaService.getTenantTerminals();
    const openCommandDispatch = terminals
      .filter((item: TerminalsData) => item.enabled)
      .map((item: TerminalsData) => item.code)
      .includes("command-dispatch-app");
    setState({
      ...state,
      openCommandDispatch,
      emergencyTypes: [...emergency],
      emergencyEventTypes: [...eventEmergency],
      alarmLevelData: [...data],
    });
  }, []);
  useAsyncEffect(async () => {
    setBasicInfo((draft) => {
      draft.estimatedHandlerTimeName =
        draft.estimatedHandlerUnit === "MINUTE" ? `${draft.estimatedHandlerTime} 分钟` : `${draft.estimatedHandlerTime}小时`;
    });
  }, [basicInfo.estimatedHandlerUnit]);
  const selectAfter = (
    <Select
      disabled={isReadonly}
      value={basicInfo.estimatedHandlerUnit}
      onChange={(e) => {
        setBasicInfo((draft) => {
          draft.estimatedHandlerUnit = e;
        });
      }}
      defaultValue="MINUTE"
      options={[
        {
          label: "分钟",
          value: "MINUTE",
        },
        {
          label: "小时",
          value: "HOUR",
        },
      ]}
      getPopupContainer={() => document.querySelector(".alarm-container") as unknown as HTMLElement}
    />
  );
  const exportData = (): BasicData => {
    return basicInfo;
  };
  useImperativeHandle(ref, () => ({
    // 暴露给父组件的方法
    save,
    exportData,
  }));

  if (isReadonly) {
    const estimatedHandlerTime = basicInfo.estimatedHandlerUnit === "HOUR"
      ? `${basicInfo.estimatedHandlerTime} 小时`
      : `${basicInfo.estimatedHandlerTime} 分钟`;
    const applicationName = state.emergencyTypes.find((item) => item.code === basicInfo.applicationCode)?.name ?? basicInfo.applicationCode;

    return (
      <div className="basicInfo">
        <ReadonlyDescriptions
          items={[
            { label: "事件名称", value: basicInfo.name },
            { label: "报警级别", value: basicInfo.alarmLevelName },
            ...(currentApplication.code !== "LINE_LOSS_MANAGEMENT" ? [{ label: "去重周期", value: `${basicInfo.repeatTime} 分钟` }] : []),
            { label: "事件分类", value: basicInfo.emergencyEventTypeName },
            ...(state.openCommandDispatch && currentApplication.code !== "LINE_LOSS_MANAGEMENT"
              ? [{ label: "通知调度中心", value: getOptionLabel(notifyCommandDispatchOption, basicInfo.notifyCommandDispatch) }]
              : []),
            { label: "处理时限", value: estimatedHandlerTime },
            ...(currentApplication.code === "EMERGENCY_CENTER" ? [{ label: "所属子应用", value: applicationName }] : []),
            { label: "说明", value: basicInfo.remark, span: 2 },
            { label: "是否播放声音", value: <BooleanTag value={basicInfo.turnWarningSound} /> },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="basicInfo">
      <div>
        <Form form={form} {...formItemLayout}>
          <Row>
            <Col span={6}>
              <FormItem
                label="事件名称:"
                name="name"
                rules={[
                  {
                    required: true,
                    pattern: /^((?!\+|\.|\\|\/|:|\*|\?|<|>|\||'|%|@|#|&|\$|\^|&|\*).){1,30}$/,
                    message: "请输入事件名称(请勿输入特殊字符)",
                  },
                ]}
              >
                <Input
                  disabled={isReadonly}
                  maxLength={30}
                  onChange={(e: { target: { value: string } }) => {
                    setBasicInfo((draft) => {
                      draft.name = e.target.value;
                    });
                  }}
                  placeholder="请输入"
                />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="报警级别:" name="alarmLevelId" rules={[{ required: true, message: "请选择报警级别" }]}>
                <Select
                  disabled={isReadonly}
                  value={basicInfo.alarmLevelId}
                  onChange={(e) => {
                    setBasicInfo((draft) => {
                      draft.alarmLevelId = e;
                      draft.alarmLevelName = state.alarmLevelData.find((item) => item.id === e)?.name;
                    });
                  }}
                  options={state.alarmLevelData}
                  fieldNames={{
                    label: "name",
                    value: "id",
                  }}
                  placeholder="请选择"
                  getPopupContainer={() => document.querySelector(".alarm-container") as unknown as HTMLElement}
                />
              </FormItem>
            </Col>
            {currentApplication.code !== "LINE_LOSS_MANAGEMENT" && (
              <Col span={6}>
                <FormItem label="去重周期:" name="repeatTime" rules={[{ required: true, message: "请输入去重周期" }]}>
                  <InputNumber
                    disabled={isReadonly}
                    min={0}
                    addonAfter="分钟"
                    onChange={(value) => {
                      setBasicInfo((draft) => {
                        draft.repeatTime = Number(value);
                      });
                    }}
                  />
                </FormItem>
              </Col>
            )}
            <Col span={6}>
              <FormItem label="事件分类:" name="emergencyEventTypeCode" rules={[{ required: true, message: "请选择事件分类" }]}>
                <Select
                  disabled={isReadonly}
                  onChange={(e) => {
                    const id = state.emergencyEventTypes.find((item) => item.code === e)?.id;
                    setBasicInfo((draft) => {
                      draft.emergencyEventTypeId = id;
                      draft.emergencyEventTypeCode = e;
                      draft.emergencyEventTypeName = state.emergencyEventTypes.find((item) => item.code === e)?.name;
                    });
                  }}
                  options={state.emergencyEventTypes}
                  value={basicInfo.emergencyEventTypeCode}
                  fieldNames={{
                    label: "name",
                    value: "code",
                  }}
                  placeholder="请选择"
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ minWidth: "200px" }}
                  getPopupContainer={() => document.querySelector(".alarm-container") as unknown as HTMLElement}
                  optionRender={(option) => {
                    const item = option.data as EmergencyEventType;
                    return (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>{item.name}</span>
                        <span
                          style={{
                            fontSize: "11px",
                            width: "40px",
                            height: "20px",
                            lineHeight: "20px",
                            textAlign: "center",
                            marginLeft: "8px",
                            borderRadius: "4px",
                            color: item.initialized ? "#1890ff" : "#52c41a",
                            backgroundColor: item.initialized ? "rgba(24,144,255,0.1)" : "rgba(82,196,26,0.1)",
                          }}
                        >
                          {item.initialized ? "初始化" : "自定义"}
                        </span>
                      </div>
                    );
                  }}
                />
              </FormItem>
            </Col>
            {state.openCommandDispatch && currentApplication.code !== "LINE_LOSS_MANAGEMENT" && (
              <Col span={6}>
                <FormItem label="通知调度中心:" name="notifyCommandDispatch" rules={[{ required: true, message: "请选择通知调度中心" }]}>
                  <Select
                    disabled={isReadonly}
                    options={notifyCommandDispatchOption}
                    value={basicInfo.notifyCommandDispatch}
                    onChange={(e) => {
                      setBasicInfo((draft) => {
                        draft.notifyCommandDispatch = e;
                      });
                    }}
                    placeholder="请选择"
                    getPopupContainer={() => document.querySelector(".alarm-container") as unknown as HTMLElement}
                  />
                </FormItem>
              </Col>
            )}

            <Col span={6}>
              <FormItem label="处理时限:" name="estimatedHandlerTime" rules={[{ required: true, message: "请输入处理时限" }]}>
                <InputNumber
                  disabled={isReadonly}
                  min={0}
                  addonAfter={selectAfter}
                  onChange={(value) => {
                    setBasicInfo((draft) => {
                      draft.estimatedHandlerTime = Number(value);
                    });
                  }}
                />
              </FormItem>
            </Col>
            {currentApplication.code === "EMERGENCY_CENTER" && (
              <Col span={6}>
                <FormItem name="applicationCode" label="所属子应用:" rules={[{ required: true, message: "请选择所属子应用" }]}>
                  <Select
                    disabled={isReadonly}
                    onChange={(e) => {
                      sessionStorage.setItem("iotCode", e as unknown as string);
                      props.getInfo(e as unknown as string);
                      setBasicInfo((draft) => {
                        draft.applicationCode = e;
                      });
                    }}
                    options={state.emergencyTypes}
                    fieldNames={{
                      label: "name",
                      value: "code",
                    }}
                    placeholder="请选择"
                    value={basicInfo.applicationCode}
                  />
                </FormItem>
              </Col>
            )}

            <Col span={6}>
              <FormItem label="说明:">
                <Input.TextArea
                  disabled={isReadonly}
                  rows={2}
                  value={basicInfo.remark}
                  onChange={(e: { target: { value: string } }) => {
                    setBasicInfo((draft) => {
                      draft.remark = e.target.value;
                    });
                  }}
                  placeholder="请输入"
                />
              </FormItem>
            </Col>

            <Col span={6}>
              <FormItem label="是否播放声音:" name="turnWarningSound">
                <Switch
                  disabled={isReadonly}
                  checkedChildren="是"
                  unCheckedChildren="否"
                  defaultChecked={false}
                  checked={basicInfo.turnWarningSound}
                  onChange={(checked) => {
                    setBasicInfo((draft) => {
                      draft.turnWarningSound = checked;
                    });
                  }}
                />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );

  async function save(): Promise<BasicData> {
    await form.validateFields();
    return basicInfo;
  }
});
