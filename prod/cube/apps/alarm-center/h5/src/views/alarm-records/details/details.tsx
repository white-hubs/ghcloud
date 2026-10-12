import { Tabs, Tab, showLoadingToast, closeToast, showNotify, Button } from "vant";
import { defineComponent, onMounted, reactive, ref, watch, type PropType, type VNode } from "vue";

import type { AlarmDetails, DataConstraint, MediaState, ProductPropVoList } from "@ghcloud/cube-alarm-center-service";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";

import { cubeAlarmCenterService, cubeDeviceCenterService, cubeLinkageService } from "../../../api/server";
import { useGlobalRouter } from "../../../hook/use-global-router";
import { AlaarmMonitor } from "./components/alaarm-monitor/alaarm-monitor";
import { AlarmDataSnap } from "./components/alarm-data-snap";
import { DetailsBasicInfo } from "./components/details-basic-info";
import { DetailsTopCard } from "./components/details-top-card";
import { HandleRecords } from "./components/handle-records";
import { LinkageAction } from "./components/linkage-action";
import { NearbyDevices } from "./components/nearby-devices/nearby-devices";
import { SceneSnap } from "./components/scene-snap";
import "vant/es/notify/style";

import styles from "./index.module.less";
interface DetailsVO {
  activeTab: number;
  details: AlarmDetails;
  mediaList: MediaState[];
  snapshotData: SnapshotVo[];
}
export interface AlarmDetailsExtraContext {
  details: AlarmDetails;
}
export interface SnapshotVo {
  propName: string;
  propValue: string;
  propCode: string;
  minValue: number;
  maxValue: number;
  unit: string;
  time: string;
}
interface RuleTriggerSnapshot {
  deviceId: string;
  propCode: string;
  propValue: string;
  propValueTs: string;
  condition: string;
}

interface MatchSnapshot {
  deviceId: string;
  propCode: string;
  propValue: string;
  propValueTs: string;
  condition: string;
}

interface AlarmSnapshot {
  ruleId: string;
  projectId: string;
  ruleNum: string;
  instanceId: string;
  timestamp: string;
  notifyStatus: string;
  notifyStatusTs: string;
  delayEventTime: string;
  ruleTriggerSnapshot: RuleTriggerSnapshot[];
  matchSnapshot: MatchSnapshot[];
}
const numberDataType = ["int", "long", "float", "double"];
export const Details = defineComponent({
  props: {
    alarmId: {
      type: String,
      default: "",
    },
    extraContent: {
      type: Function as PropType<(context: AlarmDetailsExtraContext) => VNode | JSX.Element | null>,
      default: undefined,
    },
  },
  setup: (props) => {
    const { route, router } = useGlobalRouter();
    const state = reactive<DetailsVO>({
      activeTab: 0,
      details: {
        id: "",
        code: "",
        alarmLevelId: "",
        alarmLevelCode: "",
        alarmLevelName: "",
        alarmLevelSort: 0,
        alarmTypeId: "",
        alarmTypeCode: "",
        alarmTypeName: "",
        alarmTargetKey: "",
        alarmTargetCode: "",
        alarmTargetName: "",
        alarmTargetTypeId: "",
        alarmTargetTypeName: "",
        alarmTargetLongitude: "",
        alarmTargetAddress: "",
        businessType: "",
        businessKey: "",
        alarmTime: 0,
        area: "",
        areaName: "",
        alarmThreshold: "",
        alarmEvent: "",
        alarmEventName: "",
        alarmStatus: "",
        alarmStatusName: "",
        alarmConfirmedBy: "",
        alarmConfirmedName: "",
        alarmConfirmedTime: 0,
        alarmHandlerBy: "",
        alarmHandlerName: "",
        alarmNotifyUsername: "",
        alarmHandlerResultName: "",
        alarmHandlerResultRemark: "",
        timeoutProcessTimes: 0,
        timeoutProcessTimesUnit: "",
        timeoutProcessTimesName: "",
        alarmHandlerTimeoutStatus: "",
        alarmHandlerTimeoutStatusName: "",
        applicationCode: "",
        applicationName: "",
        snapshot: "",
        alarmSnapshot: "",
        handlerFileVOS: [],
        url: "",
        processingTime: 0,
        alarmOperator: [],
        alarmNotifyUsers: [],
        followUps: [],
        assistConfirmResult: "",
      },
      mediaList: [],
      snapshotData: [],
    });
    const AlarmField = [
      "ua", // A相电压
      "ub", // B相电压
      "uc", // C相电压
      "i", // 剩余电流
      "ia", // A相电流
      "ib", // B相电流
      "ic", // C相电流
      "temp_a", // A相温度
      "temp_b", // B相温度
      "temp_c", // C相温度
      "pressure", // 压力
      "temp", // 温度
      "hum", // 湿度
      "bat_temp", // 电池温度
      // 'work_mode', // UPS设备状态
      // 'ups_status', // UPS状态
      "bat_time",
    ];
    // const
    const getData = async (): Promise<void> => {
      const alarmId = props.alarmId || (route.query.id as string);
      if (!alarmId) {
        return;
      }
      showLoadingToast({
        duration: 0,
        forbidClick: false,
        message: "加载中...",
      });
      try {
        const res = await cubeAlarmCenterService.getAlarmDetails(alarmId);
        closeToast();
        state.details = res;
        await handleSnapshot();
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      }
    };
    const handleSnapshot = async (): Promise<void> => {
      try {
        const result = await cubeDeviceCenterService.getDeviceProperties({
          deviceId: state.details.alarmTargetKey,
          withPropertySpec: true,
          withSnapShot: true,
        });
        const alarmSnapshot = JSON.parse(state.details.alarmSnapshot) as AlarmSnapshot;
        const snapshotData = alarmSnapshot.matchSnapshot
          .filter((item) => AlarmField.includes(item.propCode))
          .map((item) => {
            let propValue = "";
            const deviceAttribute = result.productPropVoList.find(
              (item2) => item2.propCode === item.propCode,
            ) as unknown as ProductPropVoList;
            if (deviceAttribute.dataType === "enum" || deviceAttribute.dataType === "boolean") {
              const findValue = (deviceAttribute.dataConstraint as DataConstraint[]).find((keyValue) => keyValue.value === item.propValue);
              propValue = findValue ? findValue.label : item.propValue;
            } else {
              ({ propValue } = item);
            }
            return {
              propName: deviceAttribute.propName,
              propValue,
              propCode: item.propCode,
              minValue: numberDataType.includes(deviceAttribute.dataType) ? Math.min(...(deviceAttribute.dataConstraint as number[])) : 0,
              maxValue: numberDataType.includes(deviceAttribute.dataType) ? Math.max(...(deviceAttribute.dataConstraint as number[])) : 0,
              unit: deviceAttribute.unitName || "",
              time: item.propValueTs,
            };
          });
        state.snapshotData = snapshotData;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      }
    };
    const getLinkageMedia = async (): Promise<void> => {
      try {
        const result = await cubeLinkageService.getEventVideoImages({ eventId: state.details.businessKey });
        state.mediaList = result;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      }
    };
    const thirdPartyId = ref("");
    onMounted(async () => {
      document.title = "报警详情";
      await getData();
      await getLinkageMedia();
    });
    watch(
      () => props.alarmId,
      async (alarmId, oldAlarmId) => {
        if (!alarmId || alarmId === oldAlarmId) {
          return;
        }
        await getData();
        await getLinkageMedia();
      },
    );
    // 接收
    const handleAlarmConfirm = async (): Promise<void> => {
      try {
        showLoadingToast({
          duration: 0,
          forbidClick: false,
          message: "加载中...",
        });
        await cubeAlarmCenterService.handleAlarmConfirm({ id: state.details.id });
        showNotify({ type: "success", background: "#07c160", message: "接收成功" });
        getData();
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", background: "#ee0a24", message: errorMessage || "请求失败" });
      } finally {
        closeToast();
      }
    };
    const followDom = (): VNode => (
      <div
        class={[styles.btn, styles.normal]}
        onClick={() => {
          router.push({
            path: "/alarm-follow-up",
            query: {
              id: state.details.id,
            },
          });
        }}
      >
        跟进记录
      </div>
    );
    const assignDom = (): VNode => (
      <div
        class={[styles.btn, styles.normal]}
        onClick={() => {
          router.push({
            path: "/alarm-transfer",
            query: {
              id: state.details.id,
            },
          });
        }}
      >
        移交
      </div>
    );
    const handleDom = (): VNode => (
      <div
        class={[styles.btn, styles.primary]}
        onClick={() => {
          router.push({
            path: "/alarm-handle",
            query: {
              id: state.details.id,
              appCode: state.details.applicationCode,
            },
          });
        }}
      >
        处理
      </div>
    );
    return (): JSX.Element => (
      <>
        <div class={styles.details}>
          <CubeNavBar showBack title="报警详情" />
          <DetailsTopCard details={state.details} />
          {state.details.id && (
            <Tabs v-model:active={state.activeTab} class={styles.tabs} animated>
              <Tab title="基础信息">
                <DetailsBasicInfo
                  details={state.details}
                  snapshotData={state.snapshotData}
                  onThirdPartyId={(value: string) => {
                    thirdPartyId.value = value;
                  }}
                />
                {props.extraContent?.({ details: state.details })}
              </Tab>
              {state.mediaList.length !== 0 && (
                <Tab title="现场抓拍">
                  <SceneSnap mediaList={state.mediaList} />
                </Tab>
              )}
              {state.snapshotData.length !== 0 && (
                <Tab title="报警快照">
                  <AlarmDataSnap snapshotData={state.snapshotData} />
                </Tab>
              )}
              <Tab title="联动动作">
                <LinkageAction details={state.details} />
              </Tab>
              <Tab title="关联监控">
                <AlaarmMonitor details={state.details} />
              </Tab>
              <Tab title="处理记录">
                <HandleRecords details={state.details} />
              </Tab>
              <Tab title="附近设备">
                <NearbyDevices details={state.details} />
              </Tab>
            </Tabs>
          )}
          {/* 'ALARM_SUSPEND' */}
          {["ALARM_PROGRESS_CONFIRMED", "ALARM_UN_CONFIRMED"].includes(state.details.alarmStatus) && (
            <div class={styles.bottom}>
              {
                // 跟进记录
                ["ALARM_PROGRESS_CONFIRMED", "ALARM_SUSPEND"].includes(state.details.alarmStatus) && (
                  <>{route.query.permissions ? route.query.permissions.includes("FOLLOW_UP") && followDom() : followDom()}</>
                )
              }
              {
                // 移交
                state.details.alarmStatus === "ALARM_PROGRESS_CONFIRMED" && (
                  <>{route.query.permissions ? route.query.permissions.includes("ASSIGN") && assignDom() : assignDom()}</>
                )
              }
              {
                // 处理
                state.details.alarmStatus === "ALARM_PROGRESS_CONFIRMED" && (
                  <>{route.query.permissions ? route.query.permissions.includes("HANDLE") && handleDom() : handleDom()}</>
                )
              }
              {state.details.alarmStatus === "ALARM_UN_CONFIRMED" && (
                <>
                  {route.query.permissions ? (
                    route.query.permissions.includes("CONFIRM") && (
                      <Button type="primary" block onClick={handleAlarmConfirm}>
                        接收
                      </Button>
                    )
                  ) : (
                    <Button type="primary" block onClick={handleAlarmConfirm}>
                      {" "}
                      接收{" "}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </>
    );
  },
});
