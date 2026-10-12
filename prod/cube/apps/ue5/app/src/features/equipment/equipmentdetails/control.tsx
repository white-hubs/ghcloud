import { defineComponent, onMounted, onUnmounted, ref, watch } from "vue";

import { BuildInTagCodesEnum, checkForBuiltInDashboardTagCode } from "@ghcloud/cube-iot-center-service";

import ElectricDashboard from "./device-dashboard/electric/electric";
import LiquidLevelSensors from "./device-dashboard/fire/liquid-level-sensors";
import FirePressureDashboard from "./device-dashboard/fire/pressure";
import HumidityDashboard from "./device-dashboard/humidity/humidity";
import UpsDashboard from "./device-dashboard/ups/ups";
import EnumerateAttribute from "./deviceAttribute/enumerateAttribute";
import SetValueAttribute from "./deviceAttribute/setValueAttribute";
import SwitchAttribute from "./deviceAttribute/switchAttribute";
import { authStore } from "@/application/auth/auth-store";
import { cubeDeviceCenterService } from "@/infrastructure/api/service";
import NoData from "@/shared-ui/panel/noData";
import { iotSocketStore } from "@/visualization-core/stores/iotSocketStore";
import { useSubscribeStore } from "@/visualization-core/stores/socketSubscribe";

import "./control.module.less";

export const Control = defineComponent({
  name: "Control",
  props: {
    id: { type: String, default: "" },
    readAndWritData: { type: Array, default: () => [] },
    readData: { type: Array, default: () => [] },
    code: { type: String, default: "" },
    deviceAttributes: { type: Array, default: () => [] },
  },
  setup(props) {
    const piniaIot = iotSocketStore();
    const piniaUseSubscribeStore = useSubscribeStore();

    const dashboardTagCode = ref("");
    const deviceBaseInfo = ref<Record<string, unknown>>();
    const productPropVoList = ref<unknown[]>([]);
    const readAndWritData = ref<any[]>(props.readAndWritData as any[]);
    const attributeValue = ref<Record<string, unknown>>();
    const onlineState = ref(false);
    const readData = ref<any[]>(props.readData as any[]);
    const attributeValueRead = ref<Record<string, unknown>>();

    attributeValue.value = Object.fromEntries((props.readAndWritData as any[]).map((item: any) => [item.attributeCode, "--"]));
    attributeValueRead.value = Object.fromEntries((props.readData as any[]).map((item: any) => [item.attributeCode, "--"]));

    watch(
      () => piniaUseSubscribeStore.subscribeData,
      (val: any) => {
        if (val?.deviceId === props.id) {
          val.updates.forEach((item: { key: string; value: unknown }) => {
            if (attributeValueRead.value?.hasOwnProperty(item.key)) {
              attributeValueRead.value[item.key] = item.value;
            }
            if (attributeValue.value?.hasOwnProperty(item.key)) {
              attributeValue.value[item.key] = item.value;
            }
          });
        }
      },
    );

    const getCurrentAttr = (deviceProductPropVoList: { propCode: string }[]): boolean => {
      const attr = ["ua", "ia", "temp_a", "temp_b", "temp_c", "uab", "iab"];
      return attr.some((code) => deviceProductPropVoList.some((entry) => entry.propCode === code));
    };

    onMounted(async () => {
      if (!piniaIot.iotSocket) {
        return;
      }
      const { dataArr, deviceInfo } = await piniaIot.iotSocket.deviceDetail({
        deviceId: props.id,
        withSnapShot: true,
        withPropertySpec: true,
      });
      const deviceInstanceDetail = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: props.id });
      onlineState.value = deviceInstanceDetail.baseArchivesInfo.status.onlineState;
      readData.value = dataArr.filter((item: any) => item.permission === "READ");
      readAndWritData.value = dataArr.filter((item: any) => item.permission === "READ_WRITE");
      attributeValueRead.value = Object.fromEntries(
        readData.value.map((item: any) => {
          if (item.value === null || item.value === "" || item.value === undefined) {
            return [item.attributeCode, undefined];
          }
          return [item.attributeCode, item.value];
        }),
      );
      attributeValue.value = Object.fromEntries(readAndWritData.value.map((item: any) => [item.attributeCode, item.value]));
      deviceBaseInfo.value = deviceInfo;
      productPropVoList.value = deviceInfo.productPropVoList;
      void checkForBuiltInDashboardTagCode(authStore, props.id).then((res) => {
        dashboardTagCode.value = res;
        if (!res && getCurrentAttr(deviceInfo.productPropVoList)) {
          dashboardTagCode.value = "ELECTRICMANAGE";
        }
      });
    });

    onUnmounted(() => {
      piniaIot.iotSocket?.unsubscribe();
    });

    const renderDashboard = (): JSX.Element | null => {
      const tag = dashboardTagCode.value;
      if (!tag) {
        return null;
      }
      if (BuildInTagCodesEnum.ELECTRICAL_MONITOR === tag || tag === "ELECTRICMANAGE") {
        return (
          <ElectricDashboard
            data={attributeValueRead.value}
            productPropVoList={productPropVoList.value}
            showAllElectricEnergy={tag === "ELECTRICMANAGE"}
          />
        );
      }
      if (BuildInTagCodesEnum.UPS === tag) {
        return (
          <UpsDashboard data={attributeValueRead.value} productPropVoList={productPropVoList.value} deviceInfo={deviceBaseInfo.value} />
        );
      }
      if ([BuildInTagCodesEnum.TEMP, BuildInTagCodesEnum.COMBUSTIBLE_GAS_MONITOR].includes(tag as BuildInTagCodesEnum)) {
        return (
          <HumidityDashboard
            data={attributeValueRead.value}
            productPropVoList={productPropVoList.value}
            deviceInfo={deviceBaseInfo.value}
          />
        );
      }
      if (BuildInTagCodesEnum.FIRE_WATER_PRESSURE === tag) {
        return (
          <FirePressureDashboard
            data={attributeValueRead.value}
            productPropVoList={productPropVoList.value}
            deviceInfo={deviceBaseInfo.value}
          />
        );
      }
      if (BuildInTagCodesEnum.LIQUID_LEVEL_SENSORS === tag) {
        return (
          <LiquidLevelSensors
            data={attributeValueRead.value}
            productPropVoList={productPropVoList.value}
            deviceInfo={deviceBaseInfo.value}
          />
        );
      }
      return null;
    };

    return (): JSX.Element => {
      if (!onlineState.value) {
        return <NoData />;
      }

      return (
        <div class="control">
          {readData.value.length > 0 && (
            <>
              <div class="state">
                <div class="fireControlMsg">
                  {readData.value.map((item, index) => (
                    <div class="fireControlMsg-item" key={item.attributeCode ?? index}>
                      <div class="fireControlMsg-item-left">{item.attributeName}：</div>
                      <div class="fireControlMsg-item-right">
                        {item.attributeKeyValueVos?.length &&
                        item.attributeKeyValueVos[0].value !== null &&
                        item.attributeKeyValueVos[0].value !== undefined
                          ? item.attributeKeyValueVos.find((entry: any) => entry.value == attributeValueRead.value?.[item.attributeCode])
                              ?.keyName ||
                            item.attributeKeyValueVos.find((entry: any) => entry.value == attributeValueRead.value?.[item.attributeCode])
                              ?.label ||
                            "--"
                          : `${attributeValueRead.value?.[item.attributeCode] ?? "--"}${
                              attributeValueRead.value?.[item.attributeCode] ? item.unitName : ""
                            }`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {renderDashboard()}
            </>
          )}
          <div class="fireControlMsg-control">
            {readAndWritData.value.map((item) => (
              <div class="column" key={item.attributeCode}>
                {item.dataType === "boolean" && (
                  <SwitchAttribute
                    code={props.code}
                    class="attribute"
                    attributeItem={item}
                    deviceId={props.id}
                    curValue={attributeValue.value?.[item.attributeCode]}
                    onUpdate:curValue={(v: unknown) => {
                      if (attributeValue.value) {
                        attributeValue.value[item.attributeCode] = v;
                      }
                    }}
                  />
                )}
                {item.dataType === "enum" && (
                  <EnumerateAttribute
                    class="attribute"
                    attributeItem={item}
                    deviceId={props.id}
                    curValue={attributeValue.value?.[item.attributeCode]}
                    onUpdate:curValue={(v: unknown) => {
                      if (attributeValue.value) {
                        attributeValue.value[item.attributeCode] = v;
                      }
                    }}
                    code={props.code}
                  />
                )}
                {item.dataType !== "boolean" && item.dataType !== "enum" && (
                  <SetValueAttribute
                    class="attribute"
                    attributeItem={item}
                    deviceId={props.id}
                    curValue={attributeValue.value?.[item.attributeCode]}
                    onUpdate:curValue={(v: unknown) => {
                      if (attributeValue.value) {
                        attributeValue.value[item.attributeCode] = v;
                      }
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };
  },
});

export default Control;
