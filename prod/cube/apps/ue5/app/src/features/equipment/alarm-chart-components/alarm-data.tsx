import { defineComponent } from "vue";
import { reactive, onMounted, computed, watch } from "vue";

import { AlarmChartComponent } from "./alarm-data-components";
import { cubeDeviceCenterService } from "@/infrastructure/api/service";

import styles from "./alarm-data.module.less";

export const AlarmData = defineComponent({
  name: "AlarmData",
  props: {
    alarmInfo: { type: Object, required: true },
    isSn: { type: Boolean, required: true },
  },
  setup(props, ctx) {
    const numberDataType = ["int", "long", "float", "double"];
    const comparator = [
      {
        value: "EQ",
        label: "等于",
      },
      {
        value: "NE",
        label: "不等于",
      },
      {
        value: "IN",
        label: "包含",
      },
      {
        value: "GT",
        label: "大于",
      },
      {
        value: "GE",
        label: "大于等于",
      },
      {
        value: "LT",
        label: "小于",
      },
      {
        value: "LE",
        label: "小于等于",
      },
      {
        value: "NOT_IN",
        label: "不包含",
      },
    ];
    const dynamicCreateReg = () => {
      let strs = "";
      for (let index = 0; index < comparator.length; index++) {
        if (index < comparator.length - 1) {
          strs += comparator[index].value + "|";
        } else {
          strs += comparator[index].value;
        }
      }
      return new RegExp(strs, "g");
    };
    const reg = dynamicCreateReg();
    const componentsChartDetail = computed(() => {
      const componentKeys = new Set(Object.keys(AlarmChartComponent));
      const snapshotKeys = new Set(state.alarmSnapshotDetail.map((item) => item.propCode));
      const intersectionKeys = [...componentKeys].filter((x) => snapshotKeys.has(x));
      return state.alarmSnapshotDetail.filter((item) => intersectionKeys.includes(item.propCode));
    });
    /**
     * 数据部分
     */
    const state = reactive<{ alarmSnapshotDetail: Record<string, string>[] }>({
      alarmSnapshotDetail: [],
    });

    onMounted(() => {
      handleAlarmSnapshot();
    });
    watch(
      () => props.alarmInfo,
      () => {
        handleAlarmSnapshot();
      },
    );
    const handleAlarmSnapshot = async () => {
      const { alarmSnapshot, alarmTargetKey } = props.alarmInfo;
      if (!alarmSnapshot) return;

      const { matchSnapshot } = JSON.parse(alarmSnapshot);
      const params = { deviceId: alarmTargetKey, withPropertySpec: true, withSnapShot: true };
      const result = (await cubeDeviceCenterService.getNorthDeviceDetail(params)) as unknown as Record<string, any>;

      const alarmSnapshotDetail = matchSnapshot.map((item) => {
        const valueReg = /(?<=\[)(.+?)(?=\])/g;
        let configAlarmValue = "";
        const triggerConditionValue =
          item.condition.match(reg) && item.condition.match(reg).length ? item.condition.match(reg) + "" : "UNKNOW";
        const matchValues = item.condition.match(valueReg);
        if (matchValues.length) {
          configAlarmValue = matchValues.at(-1);
        }
        const findComprator = comparator.find((item) => item.value === triggerConditionValue);
        const triggerConditionLabel = findComprator ? findComprator.label : "未知";
        let propValue = "";
        const deviceAttribute = result.productPropVoList.find((attr) => attr.propCode === item.propCode);
        if (deviceAttribute.dataType === "enum" || deviceAttribute.dataType === "boolean") {
          const findValue = deviceAttribute.dataConstraint.find((keyValue) => String(keyValue.value) === String(item.propValue));
          propValue = findValue ? findValue.label : item.propValue;
        } else {
          propValue = item.propValue;
        }
        return {
          propName: deviceAttribute.propName,
          propValue,
          propCode: item.propCode,
          configAlarmValue,
          triggerConditionLabel,
          minValue: numberDataType.includes(deviceAttribute.dataType) ? Math.min(...deviceAttribute.dataConstraint) : 0,
          maxValue: numberDataType.includes(deviceAttribute.dataType) ? Math.max(...deviceAttribute.dataConstraint) : 0,
          unit: deviceAttribute.unitName || "",
          time: item.propValueTs,
        };
      });
      state.alarmSnapshotDetail = alarmSnapshotDetail;
    };

    // 使用toRefs解构
    // let { } = { ...toRefs(state) }

    return (): JSX.Element => (
      <>
        <div class="container">
          <div class="title"> 报警数据</div>
          <div class="content">
            {state.alarmSnapshotDetail.map((item) => (
              <div class="item" key={item.propCode}>
                <div class="label"> 报警值：</div>
                <div class="value"> {item.propName + `：` + item.propValue + item.unit}</div>
              </div>
            ))}
            {componentsChartDetail.length && (
              <div class="item">
                <div class="label"> 数据快照：</div>
                <div class="value">
                  {componentsChartDetail.map((item) => (
                    <div class="content" key={item.propCode}>
                      {AlarmChartComponent[item.propCode] && (
                        <component
                          is={AlarmChartComponent[item.propCode]}
                          min={item.minValue}
                          max={item.maxValue}
                          label={item.propName}
                          value={`${item.propValue}`}
                          unit={item.unit}
                        ></component>
                      )}
                      <div>
                        {item.propName}:{item.propValue}
                        {item.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  },
});

export default AlarmData;
