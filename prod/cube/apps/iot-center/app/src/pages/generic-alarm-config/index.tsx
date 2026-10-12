import { AlarmAssign } from "./components/alarm-assign/alarm-assign";
import "./components/components.less";
import type { AlarmAssignRef, AlarmAssignType } from "./components/alarm-assign/alarm-assign-modal";
import { AlarmDevice } from "./components/alarm-device/alarm-device";
import type { AlarmDeviceRef } from "./components/alarm-device/alarm-device-model";
import { AlarmDisposeConfig, type AlarmDisposeConfigRef } from "./components/alarm-dispose/alarm-dispose";
import { AlarmIot } from "./components/alarm-iot/alarm-iot";
import type { AlarmIotModel, AlarmIotRef } from "./components/alarm-iot/alarm-iot-modal";
import { AlarmMessage } from "./components/alarm-message/alarm-message";
import type { AlarmMessageModel, AlarmMessageRef } from "./components/alarm-message/alarm-message-model";
import { AlarmRule } from "./components/alarm-rule/alarm-rule";
import { AlarmLineRule } from "./components/alarm-rule/alarm-rule-line";
import type { AlarmLineRuleRef, AlarmRuleRef, RuleGroupType, RuleLineType, RuleTimeType } from "./components/alarm-rule/alarm-rule-model";
import { BasicInfo } from "./components/basic-info/basic-info";
import {
  EmergencyActionBeforeType,
  type AllInfo,
  type BasicInfoRef,
  type EmergencyActionBefore,
} from "./components/basic-info/basic-info.model";
import { useAsyncEffect } from "@ghcloud/cube-iot-center-app/hooks/use-async-effect";
import { AlarmService } from "@ghcloud/cube-service";
import { Divider, Button, message, Collapse, Switch, Space, Spin, Tooltip } from "antd";
import { useCallback, useMemo, useRef, useState } from "react";
export const AlarmConfig: React.FC = () => {
  const currentApplication: {
    code: string;
  } = JSON.parse(sessionStorage.getItem("GH-currentApplication") as unknown as string);
  const isLineLossManagement = currentApplication.code === "LINE_LOSS_MANAGEMENT";

  const basicInfo = useRef<BasicInfoRef>(null);
  const alarmDeviceRef = useRef<AlarmDeviceRef>(null);
  const alarmAssignRef = useRef<AlarmAssignRef>(null);
  const alarmMessageRef = useRef<AlarmMessageRef>(null);
  const alarmRuleRef = useRef<AlarmRuleRef>(null);
  const alarmLineRuleRef = useRef<AlarmLineRuleRef>(null);
  const alarmIotRef = useRef<AlarmIotRef>(null);
  const alarmDisposeRef = useRef<AlarmDisposeConfigRef>(null);
  const [loading, setLoading] = useState(false);
  const [alarmData, setAlarmData] = useState<AllInfo>({
    id: "",
    emergencyEventTypeName: "",
    estimatedHandlerTimeName: "",
    name: "",
    alarmLevelName: "",
    alarmLevelId: undefined,
    emergencyEventTypeId: undefined,
    emergencyEventTypeCode: undefined,
    repeatTime: 0,
    estimatedHandlerTime: 0,
    notifyCommandDispatch: false,
    remark: "",
    estimatedHandlerUnit: "MINUTE",
    applicationCode: undefined,
    appointDevice: true,
    emergencyRuleConditionGroups: [],
    emergencyRuleConditionDevices: [],
    emergencyActions: [],
    turnWarningSound: true,
    emergencyActionBeforeList: [],
  });
  const [initStatus, setInitStatus] = useState(false);
  const urlParams = new URLSearchParams(location.search);
  const isDetail = urlParams.get("type") === "detail";
  const returnUrl =
    urlParams.get("returnUrl") ?? ((history.state as { current?: string } | null)?.current || "/portal/iot-center/alarmConfigList");
  const backToList = useCallback((): void => {
    history.pushState({ current: location.pathname + location.search }, "", returnUrl);
  }, [returnUrl]);
  const [activeKey, setActiveKey] = useState<string[]>(() => {
    if (isLineLossManagement) {
      return ["1", "2", "4", "5"];
    }
    return ["1", "2", "3", "4", "5", "6", "alarm-dispose"];
  });
  const [application, setApplication] = useState("");

  useAsyncEffect(async () => {
    if (urlParams.get("id") === null) {
      setInitStatus(true);
      return;
    }
    const data = isLineLossManagement
      ? await AlarmService.getAlarmLineRule(urlParams.get("id") as unknown as string)
      : await AlarmService.getAlarmRule(urlParams.get("id") as unknown as string);

    if (urlParams.get("copy")) {
      // 默认时段
      const initRuleTime: RuleTimeType = {
        timeType: "ALL",
        timeConditions: "",
        timeList: [
          {
            beginTime: "",
            endTime: "",
          },
        ],
      };
      if (!isLineLossManagement) {
        for (const item of (data as unknown as AllInfo).emergencyRuleConditionGroups as unknown as RuleGroupType[]) {
          item.emergencyRuleTime = initRuleTime;
        }
      }
    }
    const info = data as unknown as AllInfo;
    sessionStorage.setItem("iotCode", (info as unknown as { applicationCode: string }).applicationCode);

    setAlarmData(info);
    const alarmJudgmentConfig = info.emergencyActionBeforeList?.find(
      (e) => e.actionBeforeType === EmergencyActionBeforeType.ALARM_JUDGMENT,
    );
    if (!isLineLossManagement) {
      if (!alarmJudgmentConfig || (alarmJudgmentConfig && !alarmJudgmentConfig.enabled)) {
        setActiveKey(activeKey.filter((e) => e !== "alarm-dispose"));
      }
    }
    if ((info as unknown as { applicationCode: string }).applicationCode) {
      setApplication((info as unknown as { applicationCode: string }).applicationCode as unknown as string);
    }
    setInitStatus(true);
  }, []);
  const save = async (): Promise<void> => {
    const alarmIot = (await alarmIotRef.current?.getValue()) ?? {
      actionType: "IOT_DEVICE_ACTION",
      enabled: false,
    };
    const alarmMessage = await alarmMessageRef.current?.getValue();
    const basicData = await basicInfo.current?.save();
    const alarmRule = isLineLossManagement ? await alarmLineRuleRef.current?.getValue() : await alarmRuleRef.current?.getValue();
    const alarmDevice = alarmDeviceRef.current?.getValue();
    const alarmAssign = alarmAssignRef.current?.getValue();
    const alarmDispose = alarmDisposeRef.current?.getValue();

    if (isLineLossManagement) {
      const lineRule = alarmRule as RuleLineType;
      const [, value] = (lineRule?.condition ?? "").split(",");
      const lineLossValue = value?.trim() ?? "";
      if (!lineLossValue || Number.isNaN(Number(lineLossValue))) {
        message.error("请填写线损率");
        supplementActiveKey("2");
        return;
      }
      if (!lineRule?.lineIdList?.length) {
        message.error("请至少选择一条线路");
        supplementActiveKey("2");
        return;
      }
    }

    const info = {
      id: alarmData.id,
      enabled: true,
      ...basicData,
      repeatTimeUnit: "MINUTE",
      appointDevice: alarmDevice?.enabled,
      emergencyRuleConditionGroups: alarmRule,
      emergencyRuleConditionDevices: alarmDevice?.emergencyRuleConditions,
      emergencyActionBeforeList: alarmDispose ? [alarmDispose] : [],
      emergencyActions: [
        alarmAssign,
        alarmMessage,
        alarmIot,
        {
          actionType: "VIDEO_DEVICE_ACTION",
          enabled: true,
          actionConfig: [
            {
              linkageVideoStrategyType: "REF_VIDEO",
              code: "",
              name: "",
              token: "",
              type: "PHOTOGRAPH",
              timeUnit: "SECOND",
              intervalTime: 1,
              durationTime: 2,
              executeMode: "AUTOMATIC",
            },
            {
              linkageVideoStrategyType: "REF_VIDEO",
              code: "",
              name: "",
              token: "",
              type: "VIDEOTAPE",
              time: 30,
              timeUnit: "SECOND",
              executeMode: "AUTOMATIC",
            },
          ],
        },
      ],
    };

    if (urlParams.get("type") === "edit" && !urlParams.get("copy")) {
      try {
        setLoading(true);
        if (isLineLossManagement) {
          const newInfo = {
            ...info,
            lossAlarmCondition: info.emergencyRuleConditionGroups,
          };

          await AlarmService.putAlarmLineRule({ ...newInfo });
        } else {
          await AlarmService.putAlarmRule({ ...info });
        }
        message.success("保存成功");
        setTimeout(() => {
          backToList();
        }, 1 * 1000);
      } catch (error) {
        const errorRes = JSON.parse(error as string) as {
          message: string;
          code: number | number;
          status: number | number;
          details: Record<string, string>;
        };
        const { code, status, details } = errorRes;
        if (code === 412 || status === 412) {
          const arr: string[] = ["emergencyActions[1]", "emergencyActions[0]", "emergencyActions[2]", "emergencyActions[3]"];
          arr.forEach((ele) => {
            const isHave = Object.keys(details).find((elem) => elem.includes(ele));
            if (isHave) {
              message.error(details[isHave]);
            }
          });
        } else {
          message.error(errorRes.message);
        }
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        if (isLineLossManagement) {
          const newInfo = {
            ...info,
            lossAlarmCondition: info.emergencyRuleConditionGroups,
          };

          await AlarmService.addAlarmLineRule({ ...newInfo });
        } else {
          await AlarmService.addAlarmRule({ ...info });
        }
        backToList();
      } catch (error) {
        const errResult = JSON.parse(error as string) as { data: Record<string, string>; code: number; message: string };
        const { code, data } = errResult;
        if (code === 412) {
          const arr: string[] = ["emergencyActions[1]", "emergencyActions[0]", "emergencyActions[2]", "emergencyActions[3]"];
          arr.forEach((ele) => {
            const isHave = Object.keys(data).find((elem) => elem.includes(ele));
            if (isHave) {
              message.error(data[isHave]);
            }
          });
        } else {
          message.error(errResult.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };
  const collapseItems = useMemo(() => {
    const items = [
      {
        key: "1",
        label: "基本信息",
        forceRender: true,
        children: (
          <BasicInfo
            ref={basicInfo as unknown as never}
            info={alarmData}
            readonly={isDetail}
            getInfo={(e) => {
              setApplication(e);
            }}
          />
        ),
      },
      {
        key: "2",
        label: "报警规则",
        forceRender: true,
        children: isLineLossManagement ? (
          <AlarmLineRule ref={alarmLineRuleRef as unknown as never} info={alarmData.lossAlarmCondition as unknown as RuleLineType} />
        ) : (
          <AlarmRule ref={alarmRuleRef as unknown as never} info={alarmData.emergencyRuleConditionGroups as unknown as RuleGroupType[]} readonly={isDetail} />
        ),
        extra:
          isDetail || isLineLossManagement ? (
            ""
          ) : (
            <Button
              type="primary"
              size="small"
              onClick={() => {
                supplementActiveKey("2");
                alarmRuleRef.current?.addRuleGroup();
              }}
            >
              添加条件组
            </Button>
          ),
      },
    ];

    if (isLineLossManagement) {
      items.push(
        {
          key: "4",
          label: "报警指派",
          forceRender: true,
          children: (
            <AlarmAssign
              ref={alarmAssignRef as unknown as never}
              info={
                alarmData.emergencyActions.find(
                  (e) => e.actionType === "ALARM_NOTIFY_ACTION",
                ) as unknown as AlarmAssignType<"ALARM_NOTIFY_ACTION">
              }
              application={application}
              readonly={isDetail}
            />
          ),
          extra: isDetail ? (
            ""
          ) : (
            <Button
              type="primary"
              size="small"
              onClick={() => {
                supplementActiveKey("4");
                alarmAssignRef.current?.addRule();
              }}
            >
              添加
            </Button>
          ),
        },
        {
          key: "5",
          label: "消息抄送",
          forceRender: true,
          children: (
            <AlarmMessage
              ref={alarmMessageRef as unknown as never}
              info={alarmData.emergencyActions.find((e) => e.actionType === "MESSAGE_NOTIFY_ACTION") as unknown as AlarmMessageModel}
              application={application}
              readonly={isDetail}
            />
          ),
          extra: isDetail ? (
            ""
          ) : (
            <Switch
              checkedChildren="开启"
              unCheckedChildren="关闭"
              defaultChecked={
                urlParams.get("type") === "add"
                  ? true
                  : (alarmData.emergencyActions.find((e) => e.actionType === "MESSAGE_NOTIFY_ACTION")?.enabled ?? false)
              }
              onChange={(checked) => {
                supplementActiveKey("5");
                alarmMessageRef.current?.changeEnabled(checked);
              }}
            />
          ),
        },
      );
      return items;
    }

    // 非线损管理：保留全量面板
    {
      items.push(
        {
          key: "3",
          label: "报警设备",
          forceRender: true,
          children: (
            <AlarmDevice
              ref={alarmDeviceRef as unknown as never}
              info={alarmData.emergencyRuleConditionDevices}
              enabled={alarmData.appointDevice}
              application={application}
              readonly={isDetail}
            />
          ),
          extra: isDetail ? (
            ""
          ) : (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  supplementActiveKey("3");
                  alarmDeviceRef.current?.openModal();
                }}
              >
                添加设备
              </Button>
              <Button
                type="primary"
                size="small"
                danger
                onClick={() => {
                  supplementActiveKey("3");
                  alarmDeviceRef.current?.handleDelDevice();
                }}
              >
                批量删除
              </Button>
            </Space>
          ),
        },
        {
          key: "alarm-dispose",
          label: "报警处置",
          forceRender: true,
          children: (
            <AlarmDisposeConfig
              ref={alarmDisposeRef as unknown as never}
              info={
                alarmData.emergencyActionBeforeList?.find(
                  (e) => e.actionBeforeType === EmergencyActionBeforeType.ALARM_JUDGMENT,
                ) as unknown as EmergencyActionBefore
              }
              readonly={isDetail}
            />
          ),
          extra: isDetail ? (
            ""
          ) : (
            <Tooltip title="开启后，在报警研判前置判定阶段，如果研判结果为疑似报警，则根据配置进行相应处理，此功能不影响报警研判的标记流程">
              <Switch
                checkedChildren="开启"
                unCheckedChildren="关闭"
                defaultChecked={
                  urlParams.get("type") === "add"
                    ? false
                    : (alarmData.emergencyActionBeforeList?.find((e) => e.actionBeforeType === EmergencyActionBeforeType.ALARM_JUDGMENT)
                        ?.enabled ?? false)
                }
                onChange={(checked) => {
                  supplementActiveKey("alarm-dispose");
                  alarmDisposeRef.current?.changeEnabled(checked);
                }}
              />
            </Tooltip>
          ),
        },
      );
    }

    items.push(
      {
        key: "4",
        label: "报警指派",
        forceRender: true,
        children: (
          <AlarmAssign
            ref={alarmAssignRef as unknown as never}
            info={
              alarmData.emergencyActions.find(
                (e) => e.actionType === "ALARM_NOTIFY_ACTION",
              ) as unknown as AlarmAssignType<"ALARM_NOTIFY_ACTION">
            }
            application={application}
            readonly={isDetail}
          />
        ),
        extra: isDetail ? (
          ""
        ) : (
          <Button
            type="primary"
            size="small"
            onClick={() => {
              supplementActiveKey("4");
              alarmAssignRef.current?.addRule();
            }}
          >
            添加
          </Button>
        ),
      },
      {
        key: "5",
        label: "消息抄送",
        forceRender: true,
        children: (
          <AlarmMessage
            ref={alarmMessageRef as unknown as never}
            info={alarmData.emergencyActions.find((e) => e.actionType === "MESSAGE_NOTIFY_ACTION") as unknown as AlarmMessageModel}
            application={application}
            readonly={isDetail}
          />
        ),
        extra: isDetail ? (
          ""
        ) : (
          <Switch
            checkedChildren="开启"
            unCheckedChildren="关闭"
            defaultChecked={
              urlParams.get("type") === "add"
                ? true
                : (alarmData.emergencyActions.find((e) => e.actionType === "MESSAGE_NOTIFY_ACTION")?.enabled ?? false)
            }
            onChange={(checked) => {
              supplementActiveKey("5");
              alarmMessageRef.current?.changeEnabled(checked);
            }}
          />
        ),
      },
      {
        key: "6",
        label: "设备联动",
        forceRender: true,
        children: (
          <AlarmIot
            ref={alarmIotRef as unknown as never}
            info={alarmData.emergencyActions.find((e) => e.actionType === "IOT_DEVICE_ACTION") as unknown as AlarmIotModel}
            readonly={isDetail}
          />
        ),
        extra: isDetail ? (
          ""
        ) : (
          <Switch
            checkedChildren="开启"
            unCheckedChildren="关闭"
            defaultChecked={
              urlParams.get("type") === "add"
                ? true
                : (alarmData.emergencyActions.find((e) => e.actionType === "IOT_DEVICE_ACTION")?.enabled ?? false)
            }
            onChange={(checked) => {
              supplementActiveKey("6");
              alarmIotRef.current?.changeEnabled(checked);
            }}
          />
        ),
      },
    );

    return items;
  }, [
    alarmData,
    alarmDeviceRef,
    alarmLineRuleRef,
    alarmMessageRef,
    alarmRuleRef,
    alarmAssignRef,
    alarmDisposeRef,
    alarmIotRef,
    application,
    basicInfo,
    isLineLossManagement,
    urlParams,
  ]);
  return (
    <>
      <div className="top">
        <Divider
          type="vertical"
          style={{ marginLeft: "15px", width: "3px", height: "20px", background: "var(--cube-theme-var--primary-color)" }}
        />{" "}
        报警规则-
        {urlParams.get("type") === "edit"
          ? "编辑"
          : urlParams.get("type") === "add"
            ? "新增"
            : urlParams.get("type") === "detail"
              ? "详情"
              : ""}
      </div>
      {initStatus && (
        <>
          <div className="container alarm-container">
            <Collapse
              activeKey={activeKey}
              onChange={(e) => {
                setActiveKey(e as [string]);
              }}
              items={collapseItems}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "end", borderTop: "1px solid #f3f3f3" }}>
            <div style={{ marginRight: "20px", marginTop: "10px" }}>
              <Button
                onClick={() => {
                  backToList();
                }}
              >
                返回
              </Button>
              {urlParams.get("type") !== "detail" && (
                <Button onClick={save} loading={loading} type="primary" style={{ marginLeft: "10px" }}>
                  保存
                </Button>
              )}
            </div>
          </div>
        </>
      )}
      {!initStatus && <Spin className="alarm-config-page-loading" size="large" />}
    </>
  );

  function supplementActiveKey(key: string): void {
    setTimeout(() => {
      setActiveKey(Array.from(new Set([...activeKey, key])));
    }, 0);
  }
};
