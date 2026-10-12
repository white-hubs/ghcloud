import styles from "./electric.module.less";
import type { DeviceAttrItem } from "./index";
import { SimpleGauge } from "@/components/charts/simple-gauge";
import { defineComponent, type PropType, watch, reactive, onMounted } from "vue";
/** 报表统计 */
interface FieldData {
  value: string | number;
  propCode: string;
  current: number;
  item: {
    unitName: string;
    propCode: string;
    propName: string;
    value?: string;
    dataConstraint: number[];
  }[];
}
export const DeviceElectric = defineComponent({
  props: {
    attributeVlaue: {
      default: {},
      type: Object as PropType<Record<string, string | number>>,
    },
    propsCodeList: {
      type: Array as PropType<DeviceAttrItem[]>,
      default: [],
    },
  },
  setup: (props) => {
    const batteryinfo = (typeIndex: number, itemIndex: number): void => {
      const currentCode = chartsDataList[typeIndex].item[itemIndex]?.propCode;
      chartsDataList[typeIndex].current = itemIndex;
      chartsDataList[typeIndex].value = props.attributeVlaue[currentCode];
    };
    onMounted(() => {
      batteryinfo(0, 0);
      batteryinfo(1, 0);
      batteryinfo(2, 0);
    });
    const chartsDataList: FieldData[] = reactive([
      { propCode: "electricity", current: 0, item: [], value: 0 },
      { propCode: "voltage", current: 0, item: [], value: 0 },
      { propCode: "temp", current: 0, item: [], value: 0 },
    ]);
    watch(
      () => props.propsCodeList,
      () => {
        props.propsCodeList.forEach((item) => {
          if (item.propCode === "ia") {
            chartsDataList[0].item[0] = item;
          }
          if (item.propCode === "ib") {
            chartsDataList[0].item[1] = item;
          }
          if (item.propCode === "ic") {
            chartsDataList[0].item[2] = item;
          }
          if (item.propCode === "ua") {
            chartsDataList[1].item[0] = item;
          }
          if (item.propCode === "ub") {
            chartsDataList[1].item[1] = item;
          }
          if (item.propCode === "uc") {
            chartsDataList[1].item[2] = item;
          }
          if (item.propCode === "temp_a") {
            chartsDataList[2].item[0] = item;
          }
          if (item.propCode === "temp_b") {
            chartsDataList[2].item[1] = item;
          }
          if (item.propCode === "temp_c") {
            chartsDataList[2].item[2] = item;
          }
        });
        batteryinfo(0, 0);
        batteryinfo(1, 0);
        batteryinfo(2, 0);
      },
      { deep: true },
    );
    // 电压仪表盘 220v正负7%范围为绿色，其余颜色为橙色
    const voltageColor = (dataConstraint: number[]): (string | number)[][] => {
      const isExit = dataConstraint && dataConstraint.length === 2;
      const min = isExit ? Math.min(dataConstraint[0], dataConstraint[1]) : 0;
      const max = isExit ? Math.max(dataConstraint[0], dataConstraint[1]) : 100;
      const colorList = [
        {
          range: [min, 204],
          ratio: 0,
          color: "#FDAD30",
        },
        {
          range: [204, 235],
          ratio: 0,
          color: "#64D040",
        },
        {
          range: [235, max],
          ratio: 0,
          color: "#FDAD30",
        },
      ];
      const result = colorList.map((item, index) => {
        if (item.range[0] <= max && item.range[1] <= max) {
          item.ratio = Number((item.range[1] / max).toFixed(2));
        } else if (index === colorList.length - 1 && item.ratio === 0) {
          item.ratio = 1;
        }
        return [item.ratio, item.color];
      });
      return result;
    };
    return () => (
      <>
        {chartsDataList.map((x, i) => (
          <div class={styles.input} key={x.propCode}>
            <div class={styles.text_title}>现场数据</div>
            <div class={styles.gauge}>
              <SimpleGauge
                data={Number(x.value) || 0}
                min={x.item[x.current]?.dataConstraint[0]}
                max={x.item[x.current]?.dataConstraint[1]}
                unit={x.item[x.current]?.unitName}
                detailPosition={[0, "60%"]}
                progressShow={x.propCode === "voltage"}
                pointerColor={x.propCode === "voltage" ? "#F2A226" : x.propCode === "temp" ? "#00BA8B" : "#1578FF"}
                anchorColor={x.propCode === "voltage" ? "#F2A226" : x.propCode === "temp" ? "#00BA8B" : "#1578FF"}
                axisLineColor={
                  x.propCode === "voltage"
                    ? voltageColor(x.item[x.current]?.dataConstraint)
                    : x.propCode === "temp"
                      ? [
                          [0.4, "#1578FF"],
                          [0.6, "#00BA8B"],
                          [1, "#EA6B6D"],
                        ]
                      : [[1, "#F1F6FC"]]
                }
                id={`${x.propCode}-${i}-${x.current}`}
              />
              <div class={styles.gaugetext}>{x.item[x.current]?.propName}</div>
              <div class={styles.voltage}>
                <div
                  class={x.current === 0 ? styles.voltage_div_bg : styles.voltage_div}
                  onClick={() => {
                    batteryinfo(i, 0);
                  }}
                >
                  <div class={styles.value}>
                    {props.attributeVlaue[x.item[0]?.propCode] || 0}
                    {x.item[0]?.unitName}
                  </div>
                  <div class={styles.code}>{x.item[0]?.propName}</div>
                </div>
                <div
                  class={x.current === 1 ? styles.voltage_div_bg : styles.voltage_div}
                  onClick={() => {
                    batteryinfo(i, 1);
                  }}
                >
                  <div class={styles.value}>
                    {props.attributeVlaue[x.item[1]?.propCode] || 0}
                    {x.item[0]?.unitName}
                  </div>
                  <div class={styles.code}>{x.item[1]?.propName}</div>
                </div>
                <div
                  class={x.current === 2 ? styles.voltage_div_bg : styles.voltage_div}
                  onClick={() => {
                    batteryinfo(i, 2);
                  }}
                >
                  <div class={styles.value}>
                    {props.attributeVlaue[x.item[2]?.propCode] || 0}
                    {x.item[0]?.unitName}
                  </div>
                  <div class={styles.code}>{x.item[2]?.propName}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  },
});
