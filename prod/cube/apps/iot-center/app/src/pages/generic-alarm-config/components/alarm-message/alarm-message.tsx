import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Empty, Form, Input, Row, Select, message } from "antd";
import FormItem from "antd/es/form/FormItem";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import { useAsyncEffect } from "@ghcloud/cube-iot-center-app/hooks/use-async-effect";
import { logger } from "@ghcloud/cube-iot-center-app/log";
import { guid } from "@ghcloud/cube-iot-center-app/utils/common";
import { notifyTypeList } from "@ghcloud/cube-iot-center-app/utils/enum";

import { cubeMessageCenterService } from "../../../../api/service";
import {
  getNoticeTargetLabel,
  getNoticeTargetNames,
  getOptionLabel,
  getOptionLabels,
  ReadonlyDescriptions,
  ReadonlyEmpty,
  ReadonlyTags,
} from "../common/read-only/read-only";
import { SelectNotice } from "../common/select-notice/select-notice";
import type { TargetModifyParams } from "../common/select-notice/select-notice.model";
import type { AlarmMessageModel, AlarmMessageRef, AlarmMessageType } from "./alarm-message-model";

import "../components.less";
export const AlarmMessage = forwardRef<AlarmMessageRef, { info: AlarmMessageModel; application: string; readonly?: boolean }>(
  ({ info, application, readonly }, ref) => {
    useImperativeHandle(ref, () => ({
      // 暴露给父组件的方法
      getValue,
      changeEnabled,
    }));
    const [form] = Form.useForm();
    const urlParams = new URLSearchParams(location.search);
    const isReadonly = readonly ?? urlParams.get("type") === "detail";
    const [alarmMessage, setAlarmMessage] = useState<AlarmMessageModel>({
      enabled: true,
      actionType: "MESSAGE_NOTIFY_ACTION",
      id: "",
      actionConfig: [
        {
          delayTimeUnit: "MINUTE",
          id: guid(),
          duration: 1,
          notifyType: null,
          channelTypes: [],
          targetModifyParams: [
            {
              messageTargetNotify: "USER",
              id: guid(),
              targetConfig: [],
            },
          ],
        },
      ],
    });
    const [copyAlarmMessage] = useState<AlarmMessageModel>({
      enabled: true,
      actionType: "MESSAGE_NOTIFY_ACTION",
      id: "",
      actionConfig: [
        {
          delayTimeUnit: "MINUTE",
          duration: 1,
          id: guid(),
          notifyType: null,
          channelTypes: [],
          targetModifyParams: [
            {
              messageTargetNotify: "USER",
              id: guid(),
              targetConfig: [],
            },
          ],
        },
      ],
    });

    const [noticeWay, setNoticeWay] = useState<
      {
        value: string;
        label: string;
      }[]
    >([]);
    const getValue = async (): Promise<AlarmMessageModel> => {
      return alarmMessage;
    };

    const changeParams = (value: TargetModifyParams, index: number, mesIndex: number): void => {
      const actionConfig = JSON.parse(JSON.stringify(alarmMessage.actionConfig));
      actionConfig[mesIndex].targetModifyParams[index].messageTargetNotify = value.messageTargetNotify;
      actionConfig[mesIndex].targetModifyParams[index].targetConfig = value.targetConfig;
      setAlarmMessage({
        ...alarmMessage,
        actionConfig,
      });
    };
    useAsyncEffect(async () => {
      if (info === undefined) {
        setAlarmMessage({
          ...alarmMessage,
          enabled: urlParams.get("type") === "add",
        });
        return;
      }
      const actionConfig = JSON.parse(
        JSON.stringify(info.actionConfig.length === 0 ? alarmMessage.actionConfig : info.actionConfig),
      ) as AlarmMessageType[];
      actionConfig.forEach((item) => {
        item.targetModifyParams.forEach((target) => {
          target.id = guid();
        });
        item.id = guid();
      });
      setAlarmMessage({
        actionType: info.actionType,
        enabled: info.enabled,
        id: info.id,
        actionConfig,
      });
    }, [info]);
    useAsyncEffect(async () => {
      getNoticeWays();
    }, []);
    const getNoticeWays = async (): Promise<void> => {
      try {
        const currentApplication = JSON.parse(sessionStorage.getItem("GH-currentApplication") as unknown as string);
        const appCode = currentApplication.code === "EMERGENCY_CENTER" ? application : currentApplication.code;
        if (!appCode) return;
        const noticeMethod = await cubeMessageCenterService.sceneNotificationMethod(`${appCode}_EMERGENCY_ALARM`);
        setNoticeWay(noticeMethod);
      } catch (error: unknown) {
        message.error((error as { toJSON: () => Record<string, string> }).toJSON().errorMessage);
      }
    };
    useEffect(() => {
      getNoticeWays();
    }, [application]);

    if (isReadonly) {
      if (!alarmMessage.enabled) {
        return <ReadonlyEmpty description="未开启消息抄送" />;
      }
      return (
        <div>
          {alarmMessage.actionConfig.map((item, mesIndex) => (
            <div key={item.id} className="alarm-detail-card">
              <div className="alarm-detail-card-title">消息抄送 {mesIndex + 1}</div>
              <ReadonlyDescriptions
                items={[
                  { label: "通知方式", value: <ReadonlyTags values={getOptionLabels(noticeWay, item.channelTypes)} /> },
                  { label: "通知时间点", value: getOptionLabel(notifyTypeList, item.notifyType) },
                  ...(item.notifyType === "TIMEOUT_NOTIFY" ? [{ label: "超时时长", value: `${item.duration} 分钟` }] : []),
                ]}
              />
              {item.targetModifyParams.map((target, index) => (
                <ReadonlyDescriptions
                  key={target.id}
                  items={[
                    { label: `通知人员 ${index + 1}`, value: getNoticeTargetLabel(target.messageTargetNotify) },
                    { label: "对象名称", value: <ReadonlyTags values={getNoticeTargetNames(target)} />, span: 3 },
                  ]}
                />
              ))}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div>
        <>
          {urlParams.get("type") !== "detail" && alarmMessage.enabled && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                addRule();
              }}
            >
              添加
            </Button>
          )}
          <Form form={form}>
            {alarmMessage.enabled &&
              alarmMessage.actionConfig.map((item, mesIndex) => {
                return (
                  <div key={item.id} style={{ display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        border: "1px solid rgb(232, 232, 232)",
                        padding: "20px",
                        marginTop: "10px",
                        width: "800px",
                        borderRadius: "5px",
                      }}
                    >
                      <Row gutter={16}>
                        <Col span={8}>
                          <FormItem label="通知方式">
                            <Select
                              disabled={isReadonly}
                              value={alarmMessage.actionConfig[mesIndex].channelTypes}
                              options={noticeWay}
                              mode="multiple"
                              onChange={(e) => {
                                const actionConfig = JSON.parse(JSON.stringify(alarmMessage.actionConfig)) as AlarmMessageType[];
                                setAlarmMessage({
                                  ...alarmMessage,
                                  actionConfig: actionConfig.map((item, index) => {
                                    if (index === mesIndex) {
                                      item.channelTypes = e;
                                      return item;
                                    } else {
                                      return item;
                                    }
                                  }),
                                });
                              }}
                              placeholder="请选择"
                            />
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem label="通知时间点">
                            <Select
                              disabled={isReadonly}
                              value={alarmMessage.actionConfig[mesIndex].notifyType}
                              options={notifyTypeList}
                              onChange={(e) => {
                                const actionConfig = JSON.parse(JSON.stringify(alarmMessage.actionConfig));
                                actionConfig[mesIndex].notifyType = e;
                                setAlarmMessage({
                                  ...alarmMessage,
                                  actionConfig,
                                });
                              }}
                              placeholder="请选择"
                            />
                          </FormItem>
                        </Col>
                        {item.notifyType === "TIMEOUT_NOTIFY" && (
                          <Col span={6}>
                            <FormItem>
                              <div style={{ display: "flex", alignItems: "center" }}>
                                {item.notifyType === "TIMEOUT_NOTIFY" && (
                                  <Input
                                    disabled={isReadonly}
                                    value={alarmMessage.actionConfig[mesIndex].duration}
                                    style={{ marginLeft: "10px" }}
                                    min={1}
                                    type="number"
                                    addonAfter="分钟"
                                    onChange={(e) => {
                                      const raw = e.target.value;
                                      const actionConfig = JSON.parse(JSON.stringify(alarmMessage.actionConfig)) as AlarmMessageType[];
                                      actionConfig[mesIndex].duration = raw;
                                      setAlarmMessage({
                                        ...alarmMessage,
                                        actionConfig,
                                      });
                                    }}
                                    onBlur={() => {
                                      const current = Number(alarmMessage.actionConfig[mesIndex].duration);
                                      if (!current || current <= 0) {
                                        const actionConfig = JSON.parse(JSON.stringify(alarmMessage.actionConfig)) as AlarmMessageType[];
                                        actionConfig[mesIndex].duration = 1;
                                        setAlarmMessage({
                                          ...alarmMessage,
                                          actionConfig,
                                        });
                                      }
                                    }}
                                  />
                                )}
                              </div>
                            </FormItem>
                          </Col>
                        )}
                      </Row>
                      <FormItem label="通知人员">
                        {item.targetModifyParams.map((label, index) => {
                          return (
                            <div key={label.id} style={{ marginTop: index === 0 ? "0px" : "10px", display: "flex" }}>
                              <SelectNotice
                                info={label}
                                setTargetModifyParams={(value) => {
                                  changeParams(value, index, mesIndex);
                                }}
                              />
                              {urlParams.get("type") !== "detail" && index === 0 && (
                                <Button
                                  style={{ marginLeft: "10px" }}
                                  type="primary"
                                  size="small"
                                  shape="circle"
                                  icon={<PlusOutlined />}
                                  onClick={() => {
                                    addUser(mesIndex);
                                  }}
                                />
                              )}
                              {urlParams.get("type") !== "detail" && index !== 0 && (
                                <Button
                                  style={{ marginLeft: "10px" }}
                                  type="primary"
                                  size="small"
                                  danger
                                  shape="circle"
                                  icon={<MinusOutlined />}
                                  onClick={() => {
                                    deleteUser(mesIndex, label.id, index);
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </FormItem>
                    </div>
                    {urlParams.get("type") !== "detail" && (
                      <Button
                        type="link"
                        danger
                        onClick={() => {
                          deleteMessage(item.id, mesIndex);
                        }}
                      >
                        删除
                      </Button>
                    )}
                  </div>
                );
              })}
          </Form>
          {!alarmMessage.enabled && <Empty description="未开启消息抄送" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
        </>
      </div>
    );

    function deleteUser(mesIndex: number, id: string, idx: number): void {
      copyAlarmMessage.actionConfig[mesIndex].targetModifyParams = copyAlarmMessage.actionConfig[mesIndex].targetModifyParams.filter(
        (item, index) => index !== idx,
      );
      const actionConfig = JSON.parse(JSON.stringify(alarmMessage.actionConfig)) as AlarmMessageType[];
      setAlarmMessage({
        ...alarmMessage,
        actionConfig: actionConfig.map((item, index) => {
          if (index === mesIndex) {
            return {
              ...item,
              targetModifyParams: item.targetModifyParams.filter((item) => item.id !== id),
            };
          } else {
            return item;
          }
        }),
      });
    }
    function addUser(index: number): void {
      const actionConfig = JSON.parse(JSON.stringify(alarmMessage.actionConfig)) as AlarmMessageType[];
      setAlarmMessage({
        ...alarmMessage,
        actionConfig: actionConfig.map((item, idx) => {
          if (index === idx) {
            return {
              ...item,
              targetModifyParams: [
                ...alarmMessage.actionConfig[index].targetModifyParams,
                {
                  messageTargetNotify: "USER",
                  id: guid(),
                  targetConfig: [],
                },
              ],
            };
          } else {
            return item;
          }
        }),
      });
    }
    function deleteMessage(id: string, mesIndex: number): void {
      logger.info(mesIndex);
      copyAlarmMessage.actionConfig.filter((item) => item.id !== id);
      setAlarmMessage({
        ...alarmMessage,
        actionConfig: alarmMessage.actionConfig.filter((item) => item.id !== id),
      });
    }
    function addRule(): void {
      copyAlarmMessage.actionConfig.push({
        delayTimeUnit: "MINUTE",
        id: alarmMessage.actionConfig.length > 0 ? alarmMessage.actionConfig[alarmMessage.actionConfig.length - 1].id : guid(),
        notifyType: null,
        channelTypes: [],
        duration: 0,
        targetModifyParams: [
          {
            messageTargetNotify: "USER",
            id: guid(),
            targetConfig: [],
          },
        ],
      });

      setAlarmMessage({
        ...alarmMessage,
        actionConfig: [
          ...alarmMessage.actionConfig,
          {
            delayTimeUnit: "MINUTE",
            id: guid(),
            duration: 0,
            notifyType: null,
            channelTypes: [],
            targetModifyParams: [
              {
                messageTargetNotify: "USER",
                id: guid(),
                targetConfig: [],
              },
            ],
          },
        ],
      });
    }

    function changeEnabled(checked: boolean): void {
      copyAlarmMessage.enabled = checked;
      setAlarmMessage({
        ...alarmMessage,
        enabled: checked,
      });
    }
  },
);
