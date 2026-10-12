import { computed, defineComponent, onMounted, reactive, watch } from "vue";

import { AlarmChartComponent } from "./index";
import { cubeDeviceCenterService } from "@/infrastructure/api/service";

import "./index.module.less";

const alarmModalPng = "/resource/v1/ue5-migrate/views-2d/alarm-empty.png";
const numberDataType = ["int", "long", "float", "double"];

export const AlarmSnapshot = defineComponent({
  name: "AlarmSnapshot",
  props: {
    alarmInfo: { type: Object, required: true },
    id: { type: String, required: false, default: "" },
  },
  setup(props) {
    const state = reactive<{ alarmSnapshotDetail: Record<string, string>[]; activeKey: string }>({
      alarmSnapshotDetail: [],
      activeKey: "",
    });

    const componentsChartDetail = computed(() => {
      const componentKeys = new Set(Object.keys(AlarmChartComponent));
      const snapshotKeys = new Set(state.alarmSnapshotDetail.map((item) => item.propCode));
      const intersectionKeys = [...componentKeys].filter((x) => snapshotKeys.has(x));
      return state.alarmSnapshotDetail.filter((item) => intersectionKeys.includes(item.propCode));
    });

    const handleAlarmSnapshot = async (): Promise<void> => {
      const { alarmSnapshot, alarmTargetKey } = props.alarmInfo as Record<string, unknown>;
      if (!alarmSnapshot) {
        state.alarmSnapshotDetail = [];
        return;
      }

      const { matchSnapshot } = typeof alarmSnapshot === "string" ? JSON.parse(alarmSnapshot) : (alarmSnapshot as Record<string, unknown>);

      const params = { deviceId: alarmTargetKey, withPropertySpec: true, withSnapShot: true };
      const result = (await cubeDeviceCenterService.getNorthDeviceDetail(params)) as unknown as Record<string, unknown>;

      const alarmSnapshotDetail = (matchSnapshot as Record<string, unknown>[]).map((item) => {
        const valueReg = /(?<=\[)(.+?)(?=\])/g;
        let configAlarmValue = "";
        const matchValues = (item.condition as string).match(valueReg);
        if (matchValues?.length) {
          configAlarmValue = matchValues.at(-1) ?? "";
        }
        let propValue = "";
        const productPropVoList = result.productPropVoList as Record<string, unknown>[];
        const deviceAttribute = productPropVoList.find((attr) => attr.propCode === item.propCode) as Record<string, unknown>;
        if (deviceAttribute.dataType === "enum") {
          const dataConstraint = deviceAttribute.dataConstraint as { value: unknown; label: string }[];
          const findValue = dataConstraint.find((keyValue) => keyValue.value === item.propValue);
          propValue = findValue ? findValue.label : String(item.propValue);
        } else {
          propValue = String(item.propValue);
        }
        return {
          propName: deviceAttribute.propName,
          propValue,
          propCode: item.propCode,
          configAlarmValue,
          minValue: numberDataType.includes(deviceAttribute.dataType as string)
            ? Math.min(...(deviceAttribute.dataConstraint as number[]))
            : 0,
          maxValue: numberDataType.includes(deviceAttribute.dataType as string)
            ? Math.max(...(deviceAttribute.dataConstraint as number[]))
            : 0,
          unit: (deviceAttribute.unitName as string) || "",
          time: item.propValueTs,
        };
      });

      state.activeKey = alarmSnapshotDetail.length ? String(alarmSnapshotDetail[0].propCode) : "";
      state.alarmSnapshotDetail = alarmSnapshotDetail as Record<string, string>[];
    };

    onMounted(() => {
      void handleAlarmSnapshot();
    });

    watch(
      () => props.alarmInfo,
      () => {
        void handleAlarmSnapshot();
      },
      { deep: true },
    );

    return (): JSX.Element => (
      <>
        {state.alarmSnapshotDetail.length ? (
          <div>
            <a-tabs
              activeKey={state.activeKey}
              onUpdate:activeKey={(v) => {
                state.activeKey = v as string;
              }}
            >
              {state.alarmSnapshotDetail.map((item) => (
                <a-tab-pane tab={item.propName} key={item.propCode}>
                  <div class="container">
                    <div class="content">
                      {componentsChartDetail.value.length ? (
                        <div class="item">
                          <div class="label">报警值：</div>
                          <div class="value">
                            {componentsChartDetail.value.map((chartItem) => (
                              <div key={chartItem.propCode}>
                                <component
                                  is={AlarmChartComponent[chartItem.propCode]}
                                  min={chartItem.minValue}
                                  max={chartItem.maxValue}
                                  label={chartItem.propName}
                                  isAlarmModal={true}
                                  value={`${chartItem.propValue}`}
                                  unit={chartItem.unit}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </a-tab-pane>
              ))}
            </a-tabs>
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              top: "183px",
              right: "0",
              zIndex: "-1",
              width: "100%",
              height: "269px",
              textAlign: "center",
            }}
          >
            <img src={alarmModalPng} alt="" />
            <div style={{ lineHeight: "normal", color: "#fff", marginTop: "30px" }}>暂无数据快照</div>
          </div>
        )}
      </>
    );
  },
});

export default AlarmSnapshot;
